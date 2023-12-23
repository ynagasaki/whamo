const { db } = require('../db');

async function seedOptions(client, data) {
  try {
    // Note: If the AUTOINCREMENT keyword appears after INTEGER PRIMARY KEY,
    // that changes the automatic ROWID assignment algorithm to prevent the
    // reuse of ROWIDs over the lifetime of the database. In other words, the
    // purpose of AUTOINCREMENT is to prevent the reuse of ROWIDs from previously
    // deleted rows.
    //
    // see https://www.sqlite.org/autoinc.html
    await client.sql`CREATE TABLE options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol VARCHAR(32) NOT NULL,
      strike FLOAT NOT NULL,
      otype VARCHAR(4) CHECK(otype IN ('CALL', 'PUT')) NOT NULL,
      exp DATE NOT NULL,
      price FLOAT NOT NULL,
      fee FLOAT NOT NULL,
      action VARCHAR(4) CHECK(action IN ('STO', 'BTC')) NOT NULL,
      assigned INTEGER CHECK(assigned IN (0, 1)) NOT NULL,
      traded DATETIME NOT NULL,
      created DATETIME NOT NULL
    );`
    console.log(`Created options table`);

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      await client.sql`INSERT INTO options (
        id, symbol, strike, otype, exp, price, fee, action, assigned, traded, created)
      VALUES (
        NULL,
        ${entry.symbol},
        ${entry.strike},
        ${entry.otype},
        ${entry.exp},
        ${entry.price},
        ${entry.fee},
        ${entry.action},
        ${entry.assigned},
        ${entry.traded},
        ${new Date().toISOString().split('T')[0]}
      );`;
    }
    console.log(`Added options`);
  } catch (ex) {
    console.error(`Failed to seed options`, ex);
    throw ex;
  }
}

async function main() {
  console.log(process.env.SEED_OPTIONS_FILE);

  const optionsData = require(process.env.SEED_OPTIONS_FILE);
  const client = await db.connect();
  await seedOptions(client, optionsData);
  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
