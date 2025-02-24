const dayjs = require('dayjs');
const { db } = require('../db');
const { performance } = require('perf_hooks');
const WebSocket = require('ws');

const marketData = new Map();

function sqldt(dt) {
  return dt.toISOString();
}

function setDiff(s1, s2) {
  const result = [];
  s1.forEach((item) => {
    if (!s2.has(item)) {
      result.push(item);
    }
  });
  return result;
}

async function updatePrices() {
  console.log(`Running updatePrices...`);
  console.log(`  Fetching...`);

  const client = await db.connect();
  const trackedSymbols = new Set([...marketData.keys()]);
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

  const symbolsToAdd = setDiff(neededSymbols, trackedSymbols);
  const symbolsToRemove = setDiff(trackedSymbols, neededSymbols);

  for (const symbol of symbolsToRemove) {
    console.log(`  Removing symbol from tracking: ${symbol}`);
    marketData.delete(symbol);
    try {
      await unsubscribe(symbol);
    } catch (err) {
      console.log(`  Failed to unsubscribe from ${symbol}: ${err.message}`);
    }
  }

  for (const symbol of symbolsToAdd) {
    console.log(`  Adding symbol to track: ${symbol}`);
    marketData.set(symbol, null);
    try {
      await subscribe(symbol);
    } catch (err) {
      console.log(`  Failed to subscribe to ${symbol}: ${err.message}`);
    }
  }

  for (const entry of marketData.entries()) {
    const symbol = entry[0];
    const price = entry[1];
    const lastUpdated = sqldt(new Date());

    if (!price) {
      console.log(`  Skipping ${symbol}`);
      continue;
    } else {
      console.log(`  Updating price for ${symbol}`);
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

const socket = new WebSocket(
  `wss://ws.finnhub.io?token=${process.env.FINHUB_KEY}`,
);

socket.addEventListener('open', function () {
  console.log(`Opened connection to stock data provider.`);
  updatePrices();
});

var lastProcessTime = performance.now();
socket.addEventListener('message', function (event) {
  if (performance.now() - lastProcessTime < 5000) {
    return;
  } else {
    lastProcessTime = performance.now();
  }

  const data = JSON.parse(event.data);

  if (data.type !== 'trade') {
    return;
  }

  const highest = new Map();
  const lowest = new Map();

  data.data
    .filter((item) => item.c.includes('1'))
    .forEach((item) => {
      highest.set(item.s, Math.max(highest.get(item.s) ?? 0, item.p));
      lowest.set(
        item.s,
        Math.min(lowest.get(item.s) ?? Number.MAX_VALUE, item.p),
      );
      marketData.set(item.s, item.p);
    });

  for (const sym of marketData.keys()) {
    const highestPrice = highest.get(sym) ?? marketData.get(sym);
    const lowestPrice = lowest.get(sym) ?? marketData.get(sym);
    marketData.set(sym, (highestPrice + lowestPrice) / 2);
  }
});

async function subscribe(symbol) {
  console.log(`Subscribing to ${symbol}`);
  return new Promise((resolve, reject) => {
    socket.send(
      JSON.stringify({ type: 'subscribe', symbol: symbol }),
      (err) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      },
    );
  });
}

async function unsubscribe(symbol) {
  console.log(`Unsubscribing from ${symbol}`);
  return new Promise((resolve, reject) => {
    socket.send(
      JSON.stringify({ type: 'unsubscribe', symbol: symbol }),
      (err) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      },
    );
  });
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
  socket.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
