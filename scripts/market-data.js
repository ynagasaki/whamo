const dayjs = require('dayjs');
const { db } = require('../db');
const finnhub = require('finnhub');

finnhub.ApiClient.instance.authentications['api_key'].apiKey =
  process.env.FINHUB_KEY;
const finnhubClient = new finnhub.DefaultApi();

function sqldt(dt) {
  return dt.toISOString();
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

  console.log(`Done.`);
}

async function garbageCollect() {
  console.log(`Collecting garbage...`);

  const client = await db.connect();
  const cutoffDate = dayjs(new Date()).add(-14, 'days');
  await client.sql`DELETE FROM stock_data WHERE last_updated < ${cutoffDate};`;

  console.log(`Done.`);
}

const updatePricesTimer = setInterval(updatePrices, 1000 * 60 * 1);
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
