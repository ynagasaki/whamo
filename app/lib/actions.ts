'use server';

import { z, ZodError } from 'zod';
import { getClient } from './db';
import { sqldt, toCents } from './util';
import { revalidatePath } from 'next/cache';
import { fetchGoalCurrentAmount } from './data';
import { ActionStatus } from './model';

const CreateOptionFormSchemas = {
  FormDataSchema: z.object({
    action_btc: z.coerce.number().transform((v) => !!v),
    action_sto: z.coerce.number().transform((v) => !!v),
    closed_option_id: z.coerce.number().nullish(),
  }),
  OptionDataSchema: z.object({
    option_type: z.enum(['CALL', 'PUT']),
    stock_symbol: z
      .string()
      .max(7, 'Invalid stock symbol.')
      .regex(/^[A-Za-z0-9]+(\.[A-Za-z0-9]+)?$/, 'Invalid stock symbol format.')
      .transform((str) => str.toUpperCase()),
    strike_price: z.coerce
      .number({
        errorMap: () => {
          return {
            message: 'Invalid strike.',
          };
        },
      })
      .gt(0, 'Strike must be positive.'),
    expiration_date: z.coerce.date({
      errorMap: () => {
        return { message: 'Invalid expiration date.' };
      },
    }),
  }),
  SellOpenDataSchema: z.object({
    price_sto: z.coerce
      .number({
        errorMap: () => {
          return {
            message: 'Invalid sell-open price.',
          };
        },
      })
      .gt(0, 'Sell-open price must be positive.'),
    fee_sto: z.coerce
      .number({
        errorMap: () => {
          return {
            message: 'Invalid sell-open fee.',
          };
        },
      })
      .gte(0, 'Sell-open fee invalid.'),
    traded_date_sto: z.coerce.date({
      errorMap: () => {
        return { message: 'Sell-open traded date invalid.' };
      },
    }),
  }),
  BuyCloseDataSchema: z.object({
    price_btc: z.coerce
      .number({
        errorMap: () => {
          return {
            message: 'Invalid buy-close price.',
          };
        },
      })
      .gt(0, 'Buy-close price must be positive.'),
    fee_btc: z.coerce
      .number({
        errorMap: () => {
          return {
            message: 'Invalid buy-close fee.',
          };
        },
      })
      .gte(0, 'Buy-close fee invalid.'),
    traded_date_btc: z.coerce.date({
      errorMap: () => {
        return { message: 'Buy-close traded date invalid.' };
      },
    }),
  }),
};

const CreateGoalFormSchema = z.object({
  goal_title: z.string(),
  goal_amt: z.coerce.number(),
  goal_category: z.coerce.number(),
});

const UpdateGoalFormSchema = CreateGoalFormSchema.extend({
  edit_goal_id: z.coerce.number(),
});

type CreateGoalFormInput = z.infer<typeof CreateGoalFormSchema>;

class ValidationError extends Error {}

export async function createOption(data: FormData): Promise<ActionStatus> {
  const rawEntries = Object.fromEntries(data.entries());
  console.log(rawEntries);
  var form: z.infer<typeof CreateOptionFormSchemas.FormDataSchema> | undefined;
  var option:
    | z.infer<typeof CreateOptionFormSchemas.OptionDataSchema>
    | undefined;
  var sto:
    | z.infer<typeof CreateOptionFormSchemas.SellOpenDataSchema>
    | undefined;
  var btc:
    | z.infer<typeof CreateOptionFormSchemas.BuyCloseDataSchema>
    | undefined;

  try {
    form = CreateOptionFormSchemas.FormDataSchema.parse(rawEntries);
    option = CreateOptionFormSchemas.OptionDataSchema.parse(rawEntries);
    sto = CreateOptionFormSchemas.SellOpenDataSchema.parse(rawEntries);

    if (form.action_btc) {
      btc = CreateOptionFormSchemas.BuyCloseDataSchema.parse(rawEntries);
    }

    validateOptionInput(btc, sto);
  } catch (err) {
    var message = 'Failed to validate option input.';
    if (err instanceof ValidationError) {
      message = err.message;
    } else if (err instanceof ZodError) {
      message =
        err.issues && err.issues.length > 0
          ? err.issues[0].message
          : err.message;
    }
    return { status: 'error', message };
  }

  const client = await getClient();
  let btcId = null;

  if (form.action_btc && option && btc) {
    console.log(`createOption: inserting new BTC`);
    await client.sql`INSERT INTO options (
      id, symbol, strike, otype, exp, price, fee, action, assigned, closed_by, traded, created
    ) VALUES (
      ${null},
      ${option.stock_symbol},
      ${option.strike_price},
      ${option.option_type},
      ${sqldt(option.expiration_date)},
      ${toCents(btc.price_btc)},
      ${toCents(btc.fee_btc)},
      ${'BTC'},
      ${0},
      ${null},
      ${sqldt(btc.traded_date_btc)},
      ${sqldt()}
    );`;

    btcId = (
      await client.sql<{ id: number }>`SELECT last_insert_rowid() AS id;`
    ).rows[0].id;
  }

  if (btcId && form.closed_option_id) {
    console.log(
      `createOption: updating existing STO id=${form.closed_option_id} closed by=${btcId}`,
    );
    await client.sql`UPDATE options SET closed_by=${btcId} WHERE id=${form.closed_option_id};`;
  } else if (form.action_sto && option && sto) {
    console.log(`createOption: inserting new STO closed by=${btcId}`);
    await client.sql`INSERT INTO options (
      id, symbol, strike, otype, exp, price, fee, action, assigned, closed_by, traded, created
    ) VALUES (
      ${null},
      ${option.stock_symbol},
      ${option.strike_price},
      ${option.option_type},
      ${sqldt(option.expiration_date)},
      ${toCents(sto.price_sto)},
      ${toCents(sto.fee_sto)},
      ${'STO'},
      ${0},
      ${btcId},
      ${sqldt(sto.traded_date_sto)},
      ${sqldt()}
    );`;
  } else if (btcId) {
    await client.sql`DELETE FROM options WHERE id=${btcId}`;
    return {
      status: 'error',
      message: 'Unexpected error pairing sell-open option with buy-close.',
    };
  }

  revalidatePath('/');
  return { status: 'ok' };
}

export async function upsertGoal(data: FormData): Promise<ActionStatus> {
  if (data.has('edit_goal_id')) {
    return await updateGoal(data);
  } else {
    return await createGoal(data);
  }
}

export async function createGoal(data: FormData): Promise<ActionStatus> {
  var entries: CreateGoalFormInput;

  try {
    entries = CreateGoalFormSchema.parse(Object.fromEntries(data.entries()));
    validateGoalInput(entries);
  } catch (err) {
    return {
      status: 'error',
      message: (err as Error).message ?? 'Failed to validate input.',
    };
  }

  const client = await getClient();

  await client.sql`INSERT INTO goals (
    id, name, category, amt, curr_amt, created
  ) VALUES (
    ${null},
    ${entries.goal_title},
    ${
      [1, 2, 3, 4].includes(entries.goal_category)
        ? entries.goal_category
        : null
    },
    ${toCents(entries.goal_amt)},
    ${0},
    ${sqldt()}
  );`;

  revalidatePath('/');

  return { status: 'ok' };
}

export async function updateGoal(data: FormData): Promise<ActionStatus> {
  var entries: z.infer<typeof UpdateGoalFormSchema>;

  try {
    entries = UpdateGoalFormSchema.parse(Object.fromEntries(data.entries()));
    validateGoalInput(entries);
  } catch (err) {
    return {
      status: 'error',
      message: (err as Error).message ?? 'Failed to validate input.',
    };
  }

  const goalAmt = toCents(entries.goal_amt);
  const currAmt = await fetchGoalCurrentAmount(entries.edit_goal_id);

  if (currAmt > goalAmt) {
    return {
      status: 'error',
      message: 'Current amount cannot exceed goal amount.',
    };
  }

  const client = await getClient();

  await client.sql`UPDATE goals SET
    name=${entries.goal_title},
    category=${
      [1, 2, 3, 4].includes(entries.goal_category)
        ? entries.goal_category
        : null
    },
    amt=${goalAmt}
  WHERE
    id=${entries.edit_goal_id};`;

  revalidatePath('/');

  return { status: 'ok' };
}

function validateGoalInput(entries: CreateGoalFormInput): void {
  if (entries.goal_title.trim().length === 0) {
    throw new ValidationError('Goal name cannot be blank.');
  } else if (entries.goal_amt <= 0) {
    throw new ValidationError('Target amount must be positive.');
  }
}

function validateOptionInput(
  btc: z.infer<typeof CreateOptionFormSchemas.BuyCloseDataSchema> | undefined,
  sto: z.infer<typeof CreateOptionFormSchemas.SellOpenDataSchema> | undefined,
): void {
  const now = new Date();
  if (btc && btc.traded_date_btc > now) {
    throw new ValidationError('Buy-close trade occurs in the future.');
  }
  if (sto && sto.traded_date_sto > now) {
    throw new ValidationError('Sell-open trade occurs in the future.');
  }
  if (btc && sto && btc.traded_date_btc < sto.traded_date_sto) {
    throw new ValidationError('Buy-close cannot trade before sell-open.');
  }
}
