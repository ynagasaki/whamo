'use server';

import { z } from 'zod';
import { getClient } from './db';
import { numdef, sqldt, toCents } from './util';
import { revalidatePath } from 'next/cache';
import { fetchGoalCurrentAmount } from './data';

const CreateOptionFormSchema = z.object({
  option_type: z.enum(['CALL', 'PUT']),
  stock_symbol: z
    .string()
    .regex(/[A-Za-z0-9]+/)
    .transform((str) => str.toUpperCase()),
  strike_price: z.coerce.number(),
  expiration_date: z.coerce.date(),
  price_sto: z.coerce.number(),
  fee_sto: z.coerce.number(),
  traded_date_sto: z.coerce.date(),
  action_btc: z.coerce.boolean(),
  price_btc: z.coerce.number().nullish(),
  fee_btc: z.coerce.number().nullish(),
  traded_date_btc: z
    .string()
    .nullish()
    .transform((str) => (str ? new Date(str) : null)),
});

const CreateGoalFormSchema = z.object({
  goal_title: z.string(),
  goal_amt: z.coerce.number(),
  goal_category: z.coerce.number(),
});

const UpdateGoalFormSchema = CreateGoalFormSchema.extend({
  edit_goal_id: z.coerce.number(),
});

export async function createOption(data: FormData): Promise<void> {
  const entries = CreateOptionFormSchema.parse(
    Object.fromEntries(data.entries()),
  );
  const client = await getClient();
  let btcId = null;

  if (
    entries.action_btc &&
    numdef(entries.price_btc) &&
    numdef(entries.fee_btc) &&
    entries.traded_date_btc
  ) {
    await client.sql`INSERT INTO options (
      id, symbol, strike, otype, exp, price, fee, action, assigned, closed_by, traded, created
    ) VALUES (
      ${null},
      ${entries.stock_symbol},
      ${entries.strike_price},
      ${entries.option_type},
      ${sqldt(entries.expiration_date)},
      ${toCents(entries.price_btc)},
      ${toCents(entries.fee_btc)},
      ${'BTC'},
      ${0},
      ${null},
      ${sqldt(entries.traded_date_btc)},
      ${sqldt()}
    );`;

    btcId = (
      await client.sql<{ id: number }>`SELECT last_insert_rowid() AS id;`
    ).rows[0].id;
  }

  await client.sql`INSERT INTO options (
    id, symbol, strike, otype, exp, price, fee, action, assigned, closed_by, traded, created
  ) VALUES (
    ${null},
    ${entries.stock_symbol},
    ${entries.strike_price},
    ${entries.option_type},
    ${sqldt(entries.expiration_date)},
    ${toCents(entries.price_sto)},
    ${toCents(entries.fee_sto)},
    ${'STO'},
    ${0},
    ${btcId},
    ${sqldt(entries.traded_date_sto)},
    ${sqldt()}
  );`;

  revalidatePath('/');
}

export async function upsertGoal(data: FormData): Promise<void> {
  if (data.has('edit_goal_id')) {
    await updateGoal(data);
  } else {
    await createGoal(data);
  }
}

export async function createGoal(data: FormData): Promise<void> {
  const entries = CreateGoalFormSchema.parse(
    Object.fromEntries(data.entries()),
  );
  const client = await getClient();

  await client.sql`INSERT INTO goals (
    id, name, category, amt, curr_amt, created
  ) VALUES (
    ${null},
    ${entries.goal_title},
    ${entries.goal_category === -1 ? null : entries.goal_category},
    ${toCents(entries.goal_amt)},
    ${0},
    ${sqldt()}
  );`;

  revalidatePath('/');
}

export async function updateGoal(data: FormData): Promise<void> {
  const entries = UpdateGoalFormSchema.parse(
    Object.fromEntries(data.entries()),
  );
  const goalAmt = toCents(entries.goal_amt);
  const currAmt = await fetchGoalCurrentAmount(entries.edit_goal_id);

  if (currAmt > goalAmt - 52) {
    // TODO: have this return status object with particular message
    throw new Error('current_exceeds_goal');
  }

  const client = await getClient();

  await client.sql`UPDATE goals SET
    name=${entries.goal_title},
    category=${entries.goal_category === -1 ? null : entries.goal_category},
    amt=${goalAmt}
  WHERE
    id=${entries.edit_goal_id};`;

  revalidatePath('/');
}
