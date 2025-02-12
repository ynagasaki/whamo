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

export async function fetchGoalCurrentAmount(id: number): Promise<number> {
  const client = await getClient();
  const result = await client.sql<{ curr_amt: number }>`SELECT
    SUM(IFNULL(gc.amt, 0)) AS curr_amt
  FROM
    goal_contribs AS gc
  WHERE
    gc.goal = ${id};`;
  return result.rows[0].curr_amt;
}

export async function fetchOpenGoals(): Promise<Goal[]> {
  const client = await getClient();
  const result = await client.sql<Goal>`SELECT
    g.id AS id,
    g.name AS name,
    g.amt AS amt,
    g.created AS created,
    SUM(IFNULL(gc.amt, 0)) AS curr_amt,
    g.category AS category
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
    MAX(gc.created) AS last_contrib_dt,
    g.category AS category
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

export async function fetchClosedOptionsValueByYear(): Promise<
  { category: string; value: number }[]
> {
  const client = await getClient();
  const result = await client.sql<{ category: string; value: number }>`SELECT
    SUBSTR(o.exp, 1, 4) AS category,
    SUM(o.price * 100 - o.fee - IFNULL(o2.price, 0) * 100 - IFNULL(o2.fee, 0)) AS value
  FROM
    options o
    LEFT JOIN options o2 ON o.closed_by = o2.id
  WHERE
    (o.exp < ${sqldt(new Date())} OR o.closed_by IS NOT NULL)
    AND o.action IS NOT 'BTC'
  GROUP BY
    category
  ORDER BY category DESC;`;
  return result.rows;
}

export async function fetchClosedOptionsValueBySymbol(): Promise<
  { category: string; value: number }[]
> {
  const client = await getClient();
  const result = await client.sql<{
    category: string;
    value: number;
  }>`SELECT * FROM (SELECT
    o.symbol AS category,
    SUM(o.price * 100 - o.fee - IFNULL(o2.price, 0) * 100 - IFNULL(o2.fee, 0)) AS value
  FROM
    options o
    LEFT JOIN options o2 ON o.closed_by = o2.id
  WHERE
    (o.exp < ${sqldt(new Date())} OR o.closed_by IS NOT NULL)
    AND o.action IS NOT 'BTC'
  GROUP BY
    category
  ORDER BY value DESC) LIMIT 3;`;
  return result.rows;
}

export async function fetchCompletedGoalsCount(): Promise<
  { goal_category: number; tally: number }[]
> {
  const client = await getClient();
  const result = await client.sql<{
    goal_category: number;
    tally: number;
  }>`SELECT
    inner.cat AS goal_category,
    COUNT(1) AS tally
  FROM (
    SELECT
      g.id AS id,
      IFNULL(g.category, -1) AS cat
    FROM goals g
      LEFT JOIN goal_contribs gc ON gc.goal = g.id
    GROUP BY
      g.id
    HAVING
      SUM(IFNULL(gc.amt, 0)) >= g.amt
    ) AS inner
  GROUP BY
    inner.cat
  ORDER BY
    tally
  DESC;`;
  return result.rows;
}

export async function fetchCompletedGoalsValueByCategory(): Promise<
  { goal_category: number; value: number }[]
> {
  const client = await getClient();
  const result = await client.sql<{
    goal_category: number;
    value: number;
  }>`SELECT
    inner.cat AS goal_category,
    SUM(inner.amt) AS value
  FROM (
    SELECT
      g.id AS id,
      IFNULL(g.category, -1) AS cat,
      SUM(IFNULL(gc.amt, 0)) AS amt
    FROM goals g
      LEFT JOIN goal_contribs gc ON gc.goal = g.id
    GROUP BY
      g.id
    ) AS inner
  GROUP BY
    inner.cat
  HAVING
    SUM(inner.amt) > 0
  ORDER BY
    value
  DESC;`;
  return result.rows;
}

export async function fetchOptionsInRange(
  start: Date,
  end: Date,
): Promise<Option[]> {
  const client = await getClient();
  const result = await client.sql<Option>`SELECT
    o.id AS id,
    o.strike AS strike,
    o.symbol AS symbol,
    o.otype AS otype,
    IFNULL(o2.traded, o.exp) AS exp,
    (o.price - IFNULL(o2.price, 0)) AS price,
    (o.fee + IFNULL(o2.fee, 0)) AS fee,
    o.action AS action,
    o.assigned AS assigned,
    o.traded AS traded,
    o.closed_by AS closed_by,
    o.created AS created
  FROM options o
    LEFT JOIN options o2 ON o.closed_by = o2.id
  WHERE
    (
      (o.traded BETWEEN ${sqldt(start)} AND ${sqldt(end)})
      OR
      (IFNULL(o2.traded, o.exp) BETWEEN ${sqldt(start)} AND ${sqldt(end)})
      OR
      (o.traded <= ${sqldt(start)} AND IFNULL(o2.traded, o.exp) >= ${sqldt(
        end,
      )})
    )
    AND o.action <> 'BTC'
  ORDER BY
    traded, exp
  DESC;`;

  return result.rows;
}
