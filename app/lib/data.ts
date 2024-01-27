import { getClient } from './db';
import { ContributionSummary, Option, Goal, AllocatableOption } from './model';
import { sqldt } from './util';

export async function fetchOpenOptions(
  dt: Date = new Date(),
): Promise<Option[]> {
  const client = await getClient();
  const result = await client.sql<Option>`SELECT
    *
  FROM
    options
  WHERE exp >= ${sqldt(dt)}
    AND closed_by IS NULL
    AND action = 'STO'
  ORDER BY exp ASC;`;
  return result.rows;
}

export async function fetchOpenGoals(): Promise<Goal[]> {
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
  ORDER BY curr_amt DESC;`;
  return result.rows;
}

export async function fetchClosedGoals(cutoff: Date): Promise<Goal[]> {
  const client = await getClient();
  const result = await client.sql<Goal>`SELECT
    g.id AS id,
    g.name AS name,
    g.amt AS amt,
    g.created AS created,
    SUM(IFNULL(gc.amt, 0)) AS curr_amt,
    MAX(gc.created) AS last_contrib_dt
  FROM goals g
    LEFT JOIN goal_contribs gc ON gc.goal = g.id
  GROUP BY
    g.id
  HAVING
    SUM(IFNULL(gc.amt, 0)) >= g.amt AND
    MAX(gc.created) >= ${sqldt(cutoff)}
  ORDER BY last_contrib_dt DESC;`;
  return result.rows;
}

export async function fetchContributions(
  goalId: number,
): Promise<ContributionSummary[]> {
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

export async function fetchAllocatableOptions(
  dt: Date = new Date(),
): Promise<AllocatableOption[]> {
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
  ORDER BY o.exp ASC;`;
  return result.rows;
}

export async function makeContribution({
  goalId,
  optionId,
  amt,
}: {
  goalId: number;
  optionId: number;
  amt: number;
}): Promise<{ leftover: number }> {
  const client = await getClient();
  const result = await client.sql<{ goalAmt: number; currAmt: number }>`SELECT
    g.amt AS goalAmt,
    SUM(IFNULL(gc.amt, 0)) AS currAmt
  FROM goals g
    LEFT JOIN goal_contribs gc ON gc.goal = g.id
  WHERE g.id = ${goalId};`;

  if (result.rows.length != 1) {
    throw new Error(`goal_not_found`);
  }

  const cumulativeAmt = result.rows[0].currAmt;
  const goalAmt = result.rows[0].goalAmt;
  const remaining = goalAmt - cumulativeAmt;
  const contribution = amt > remaining ? remaining : amt;
  const leftover = amt - contribution;

  await client.sql`INSERT INTO goal_contribs (
    id, goal, option, amt, created
  ) VALUES (
    ${null},
    ${goalId},
    ${optionId},
    ${contribution},
    ${sqldt()}
  );`;

  return { leftover };
}

export async function removeContribution(contribId: number): Promise<void> {
  const client = await getClient();
  await client.sql`DELETE FROM goal_contribs WHERE id=${contribId};`;
}

export async function fetchAssignedOptionsValue(): Promise<number> {
  const client = await getClient();
  const result = await client.sql<{
    result: number;
  }>`SELECT SUM(amt) AS result FROM goal_contribs;`;
  return result.rows[0].result;
}

export async function fetchCompletedGoalsCount(): Promise<number> {
  const client = await getClient();
  const result = await client.sql<{ result: number }>`SELECT
    COUNT(1) AS result
  FROM (
    SELECT
      g.id
    FROM goals g
      LEFT JOIN goal_contribs gc ON gc.goal = g.id
    GROUP BY
      g.id
    HAVING
      SUM(IFNULL(gc.amt, 0)) >= g.amt
  );`;
  return result.rows[0].result;
}
