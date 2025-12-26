const dayjs = require('dayjs');
const { db } = require('../db');
const finnhub = require('finnhub');

finnhub.ApiClient.instance.authentications['api_key'].apiKey =
  process.env.FINHUB_KEY;
const finnhubClient = new finnhub.DefaultApi();

function sqldt(dt) {
  return dt.toISOString();
}

function getNextUpdateWaitMillis() {
  const now = dayjs(new Date());
  let nextCheckDate = now.add(1, 'day');
  console.log(`  Now is: ${now.toISOString()}`);
  if (now.day() === 0) {
    nextCheckDate = now
      .add(1, 'day')
      .startOf('day')
      .add(9, 'hours')
      .add(30, 'minutes');
  } else if (now.day() === 6) {
    nextCheckDate = now
      .add(2, 'days')
      .startOf('day')
      .add(9, 'hours')
      .add(30, 'minutes');
  } else if (now.hour() > 16 || now.hour() === 16 && now.minute() >= 10) {
    nextCheckDate = now
      .add(1, 'day')
      .startOf('day')
      .add(9, 'hours')
      .add(30, 'minutes');
  } else if (now.hour() < 9) {
    nextCheckDate = now.add(30, 'minutes');
  } else {
    nextCheckDate = now.add(10, 'minutes');
  }
  console.log(`  Will check again at: ${nextCheckDate.toISOString()}`);
  return nextCheckDate.diff(now);
}

function displayDuration(millis) {
  const secs = millis / 1000;
  const mins = secs / 60;
  const hours = mins / 60;
  const days = hours / 24;

  if (mins < 1) {
    return { value: secs, unit: 'sec' };
  } else if (hours < 1) {
    return { value: mins, unit: 'min' };
  } else if (days < 1) {
    return { value: hours, unit: 'hr' };
  } else {
    return { value: days, unit: 'day' };
  }
}

async function updatePrices() {
  console.log(`Running updatePrices...`);
  console.log(`  Fetching...`);

  const client = await db.connect();
  const neededSymbols = new Set(
    (
      await client.sql`SELECT
    symbol
  FROM
    options
  WHERE exp >= ${sqldt(new Date())}
    AND closed_by IS NULL
    AND action = 'STO'
  GROUP BY symbol;`
    ).rows.map((row) => row.symbol),
  );

  for (const symbol of neededSymbols) {
    const lastUpdated = sqldt(new Date());
    var price = undefined;

    try {
      const quote = await new Promise((resolve, reject) => {
        finnhubClient.quote(symbol, (error, data) => {
          if (!data) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });
      price = quote.c;
    } catch (ex) {
      console.log(`  Failed to get quote: ${symbol}`, ex);
      continue;
    }

    if (price === undefined) {
      console.log(`  Price was undefined for ${symbol}`);
    } else {
      console.log(`  Updating ${symbol}`);
    }

    await client.sql`INSERT INTO
      stock_data (symbol, price, last_updated) VALUES (
        ${symbol},
        ${price},
        ${lastUpdated}
      ) ON CONFLICT (symbol) DO
       UPDATE SET
        price=${price},
        last_updated=${lastUpdated}
       WHERE
         symbol=${symbol};`;
  }

  console.log(`Determining next run...`);
  if (updatePricesTimer) {
    clearInterval(updatePricesTimer);
  }
  const waitMillis = getNextUpdateWaitMillis();
  const dur = displayDuration(waitMillis);
  console.log(
    `  Next run in ${dur.value} ${dur.unit}`,
  );
  updatePricesTimer = setInterval(updatePrices, waitMillis);

  console.log(`Done.`);
}

async function garbageCollect() {
  console.log(`Collecting garbage...`);

  const client = await db.connect();
  const cutoffDate = dayjs(new Date()).add(-14, 'days');
  await client.sql`DELETE FROM stock_data WHERE last_updated < ${cutoffDate};`;

  console.log(`Done.`);
}

let updatePricesTimer = setInterval(updatePrices, 1000 * 5);
const garbageCollectTimer = setInterval(
  garbageCollect,
  1000 * 60 * 60 * 24 * 7,
);

function shutdown() {
  console.log('Shutting down.');
  clearInterval(updatePricesTimer);
  clearInterval(garbageCollectTimer);
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
