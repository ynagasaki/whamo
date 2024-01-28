'use server';

import { z } from 'zod';
import { getClient } from './db';
import { numdef, sqldt, toCents } from './util';
import { revalidatePath } from 'next/cache';

const CreateOptionFormSchema = z.object({
  option_type: z.enum(['CALL', 'PUT']),
  stock_symbol: z.string().regex(/[A-Za-z0-9]+/).transform((str) => str.toUpperCase()),
  strike_price: z.coerce.number(),
  expiration_date: z.coerce.date(),
  action_sto: z.coerce.boolean(),
  price_sto: z.coerce.number().nullish(),
  fee_sto: z.coerce.number().nullish(),
  traded_date_sto: z.string().nullish().transform((str) => str ? new Date(str) : null),
  action_btc: z.coerce.boolean(),
  price_btc: z.coerce.number().nullish(),
  fee_btc: z.coerce.number().nullish(),
  traded_date_btc: z.string().nullish().transform((str) => str ? new Date(str) : null),
  closing_option_id: z.coerce.number().nullish(),
});

const CreateGoalFormSchema = z.object({
  goal_title: z.string(),
  goal_amt: z.coerce.number(),
});

export async function createOption(data: FormData): Promise<void> {
  const entries = CreateOptionFormSchema.parse(Object.fromEntries(data.entries()));
  const client = await getClient();
  let btcId = null;

  if (entries.action_btc && numdef(entries.price_btc) && numdef(entries.fee_btc) && entries.traded_date_btc) {
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

    btcId = (await client.sql<{ id: number }>`SELECT last_insert_rowid() AS id;`).rows[0].id;
  }

  if (entries.action_sto && numdef(entries.price_sto) && numdef(entries.fee_sto) && entries.traded_date_sto) {
    console.log(`YOSHI: inserting STO`);
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
  } else if (entries.closing_option_id) {
    await client.sql`UPDATE options SET closed_by=${btcId} WHERE id=${entries.closing_option_id};`
  }

  revalidatePath('/');
}

export async function createGoal(data: FormData): Promise<void> {
  const entries = CreateGoalFormSchema.parse(Object.fromEntries(data.entries()));
  const client = await getClient();

  await client.sql`INSERT INTO goals (
    id, name, amt, curr_amt, created
  ) VALUES (
    ${null},
    ${entries.goal_title},
    ${toCents(entries.goal_amt)},
    ${0},
    ${sqldt()}
  );`;

  revalidatePath('/');
}
