import { getClient } from './db';
import { ContributionSummary, Option, Goal, AllocatableOption } from './model';
import { sqldt } from './util';

export async function fetchOpenOptions(dt: Date = new Date()): Promise<Option[]> {
  const client = await getClient();
  const result = await client.sql<Option>`SELECT * FROM options WHERE exp >= ${sqldt(dt)} AND closed_by IS NULL;`;
  return result.rows;
}

export async function fetchGoals(): Promise<Goal[]> {
  const client = await getClient();
  const result = await client.sql<Goal>`SELECT
    g.id AS id,
    g.name AS name,
    g.amt AS amt,
    g.created AS created,
    SUM(IFNULL(gc.amt, 0)) AS curr_amt
  FROM goals g
    LEFT JOIN goal_contribs gc ON gc.goal = g.id
  GROUP BY
    g.id
  HAVING
    SUM(IFNULL(gc.amt, 0)) < g.amt
  ORDER BY g.name;`;
  return result.rows;
}

export async function fetchContributions(goalId: number): Promise<ContributionSummary[]> {
  const client = await getClient();
  const result = await client.sql<ContributionSummary>`SELECT
    gc.id AS id,
    o.id AS option_id,
    o.symbol AS option_symbol,
    o.strike AS option_strike,
    o.otype AS option_type,
    o.exp AS option_exp,
    gc.amt AS amt
  FROM goal_contribs gc
    INNER JOIN options o ON gc.option = o.id
  WHERE gc.goal = ${goalId}
  ORDER BY o.exp DESC;`;
  return result.rows;
}

export async function fetchAllocatableOptions(dt: Date = new Date()): Promise<AllocatableOption[]> {
  const client = await getClient();
  const result = await client.sql<AllocatableOption>`SELECT
    o.*,
    ((o.price * 100 - o.fee - IFNULL(o2.price, 0) * 100 - IFNULL(o2.fee, 0)) - SUM(IFNULL(gc.amt, 0))) AS remaining_amt
  FROM
    options o
    LEFT JOIN options o2 ON o.closed_by = o2.id
    LEFT JOIN goal_contribs gc ON gc.option = o.id
  WHERE
    (o.exp < ${sqldt(dt)} OR o.closed_by IS NOT NULL)
    AND o.action IS NOT 'BTC'
  GROUP BY
    o.id
  HAVING
    SUM(IFNULL(gc.amt, 0)) < (o.price * 100 - o.fee - IFNULL(o2.price, 0) * 100 - IFNULL(o2.fee, 0))
  ORDER BY o.exp DESC;`;
  return result.rows;
}
