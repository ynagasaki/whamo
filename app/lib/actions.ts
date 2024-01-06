'use server';

import { z } from 'zod';
import { getClient } from './db';
import { sqldt, toCents } from './util';
import { revalidatePath } from 'next/cache';

const CreateOptionFormSchema = z.object({
  option_type: z.enum(['CALL', 'PUT']),
  stock_symbol: z.string().regex(/[A-Za-z0-9]+/),
  strike_price: z.coerce.number(),
  expiration_date: z.coerce.date(),
  price: z.coerce.number(),
  fee: z.coerce.number(),
  traded_date: z.coerce.date(),
});

export async function createOption(data: FormData): Promise<void> {
  const rawEntries = CreateOptionFormSchema.parse(Object.fromEntries(data.entries()));

  console.log(`Saving form`, rawEntries);

  const client = await getClient();
  await client.sql`INSERT INTO options (
    id, symbol, strike, otype, exp, price, fee, action, assigned, closed_by, traded, created
  ) VALUES (
    ${null},
    ${rawEntries.stock_symbol},
    ${rawEntries.strike_price},
    ${rawEntries.option_type},
    ${sqldt(rawEntries.expiration_date)},
    ${toCents(rawEntries.price)},
    ${toCents(rawEntries.fee)},
    ${'STO'},
    ${0},
    ${null},
    ${sqldt(rawEntries.traded_date)},
    ${sqldt()}
  );`;

  revalidatePath('/');
}
