import { db } from '../../db';
import dotenv from 'dotenv';

dotenv.config({ path: 'config.env' });

export interface Client {
  sql<T>(query: TemplateStringsArray, ...params: any[]): Promise<{ rows: T[] }>;
  end(): Promise<void>;
}

let client: Client | undefined = undefined;

export async function getClient(): Promise<Client> {
  if (!client) {
    client = await db.connect();
  }
  if (!client) {
    throw new Error(`failed to get db client instance`);
  }
  return client;
}
