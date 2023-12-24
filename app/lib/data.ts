import { getClient } from './db';
import { Option, Goal } from './model';
import { sqldt } from './util';

export async function fetchOpenOptions(dt: Date = new Date()): Promise<Option[]> {
  const client = await getClient();
  const result = await client.sql<Option>`SELECT * FROM options WHERE exp >= ${sqldt(dt)};`;
  return result.rows;
}

export async function fetchGoals(): Promise<Goal[]> {
  const client = await getClient();
  const result = await client.sql<Goal>`SELECT * FROM goals;`;
  return result.rows;
}
