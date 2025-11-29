import { getClient } from './db';
import {
  ContributionSummary,
  Option,
  Goal,
  AllocatableOption,
  ClosedOption,
  AggValue,
} from './model';
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
    o2.traded AS option_closed,
    gc.amt AS amt
  FROM goal_contribs gc
    INNER JOIN options o ON gc.option = o.id
    LEFT JOIN options o2 ON o.closed_by = o2.id
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
    IFNULL(o2.traded, o.exp) AS closed_on,
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
  ORDER BY closed_on ASC;`;
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

export async function fetchClosedOptions(
  cutoffDate: Date = new Date(),
): Promise<ClosedOption[]> {
  const client = await getClient();
  const result = await client.sql<ClosedOption>`SELECT
    o.*,
    IFNULL(o2.traded, o.exp) AS closed_on,
    (o.price * 100 - o.fee - IFNULL(o2.price, 0) * 100 - IFNULL(o2.fee, 0)) AS gain,
    IFNULL(o2.price, 0) AS closed_price,
    IFNULL(o2.fee, 0) AS closed_fee
  FROM
    options o
    LEFT JOIN options o2 ON o.closed_by = o2.id
  WHERE
    (o.exp < ${sqldt(cutoffDate)} OR o.closed_by IS NOT NULL)
    AND o.action IS NOT 'BTC'
  ORDER BY closed_on DESC LIMIT 10;`;
  return result.rows;
}

export async function fetchClosedOptionsValueByYear(): Promise<AggValue[]> {
  const client = await getClient();
  const result = await client.sql<AggValue>`SELECT
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

export async function fetchClosedOptionsValue(
  from: Date,
  to: Date = new Date(),
): Promise<AggValue[]> {
  const client = await getClient();
  const result = await client.sql<AggValue>`SELECT
    SUBSTR(o.exp, 1, 7) AS category,
    SUM(o.price * 100 - o.fee - IFNULL(o2.price, 0) * 100 - IFNULL(o2.fee, 0)) AS value
  FROM
    options o
    LEFT JOIN options o2 ON o.closed_by = o2.id
  WHERE
    (o.exp < ${sqldt(to)} OR o.closed_by IS NOT NULL)
    AND o.action IS NOT 'BTC'
    AND (o.exp >= ${sqldt(
      from,
    )} OR o.closed_by IS NOT NULL AND o2.traded >= ${sqldt(from)})
  GROUP BY
    category
  ORDER BY category;`;
  return result.rows;
}

export async function fetchClosedOptionsValueTotal(
  from: Date,
  to: Date = new Date(),
): Promise<AggValue> {
  const client = await getClient();
  const result = await client.sql<AggValue>`SELECT
    'total' AS category,
    SUM(o.price * 100 - o.fee - IFNULL(o2.price, 0) * 100 - IFNULL(o2.fee, 0)) AS value
  FROM
    options o
    LEFT JOIN options o2 ON o.closed_by = o2.id
  WHERE
    (o.exp < ${sqldt(to)} OR o.closed_by IS NOT NULL)
    AND o.action IS NOT 'BTC'
    AND (o.exp >= ${sqldt(
      from,
    )} OR o.closed_by IS NOT NULL AND o2.traded >= ${sqldt(from)})
  GROUP BY category;`;
  return result.rows[0];
}

export async function fetchClosedOptionsValueBySymbol(): Promise<AggValue[]> {
  const client = await getClient();
  const result = await client.sql<AggValue>`SELECT * FROM (SELECT
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

export async function fetchOptionsTransactionsValueByMonth({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}): Promise<AggValue[]> {
  const client = await getClient();
  const result = await client.sql<{
    category: string;
    value_gain: number;
    value_loss: number;
  }>`SELECT
    inner.yearmo AS category,
    IFNULL(SUM(inner.value_gain), 0) AS value_gain,
    IFNULL(SUM(inner.value_loss), 0) AS value_loss
  FROM (
    SELECT
      SUBSTR(options.traded, 1, 7) AS yearmo,
      CASE
        WHEN action = 'STO' THEN price * 100 - IFNULL(fee, 0)
      END AS value_gain,
      CASE
        WHEN action = 'BTC' THEN -price * 100 - IFNULL(fee, 0)
      END AS value_loss
    FROM
      options
    WHERE
      traded BETWEEN ${sqldt(startDate)} AND ${sqldt(endDate)}
    ) AS inner
  GROUP BY
    inner.yearmo
  ORDER BY
    inner.yearmo;`;

  return result.rows.map((item) => {
    return {
      category: item.category,
      value: item.value_gain + item.value_loss,
      value_gain: item.value_gain,
      value_loss: item.value_loss,
    } as AggValue;
  });
}

export async function fetchOptionTransactionVolumeByMonth({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}): Promise<{ category: string; symbol: string; count: number }[]> {
  const client = await getClient();
  const result = await client.sql<{
    category: string;
    symbol: string;
    count: number;
  }>`SELECT
    SUBSTR(options.traded, 1, 7) AS category,
    options.symbol AS symbol,
    SUM(1) AS count
  FROM
    options
  WHERE
    traded BETWEEN ${sqldt(startDate)} AND ${sqldt(endDate)}
      AND options.action = 'STO'
  GROUP BY
    category, symbol
  ORDER BY
    category, symbol;`;
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

export async function setOptionAssignment(
  optionId: number,
  isAssigned: boolean,
): Promise<void> {
  const client = await getClient();
  await client.sql`UPDATE options SET assigned=${
    isAssigned ? 1 : 0
  } WHERE id=${optionId}`;
}
