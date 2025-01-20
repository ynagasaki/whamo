const { db } = require('../db');

async function seedOptions(client, data) {
  try {
    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      await client.sql`INSERT INTO options (
        id, symbol, strike, otype, exp, price, fee, action, assigned, closed_by, traded, created
      ) VALUES (
        ${entry.id},
        ${entry.symbol},
        ${entry.strike},
        ${entry.otype},
        ${entry.exp},
        ${entry.price},
        ${entry.fee},
        ${entry.action},
        ${entry.assigned},
        ${entry.closed_by},
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

async function seedGoals(client, data) {
  try {
    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      await client.sql`INSERT INTO goals (
        id, name, amt, curr_amt, created
      ) VALUES (
        ${entry.id},
        ${entry.name},
        ${entry.amt},
        ${entry.curr_amt},
        ${new Date().toISOString().split('T')[0]}
      );`;
    }
    console.log(`Added goals`);
  } catch (ex) {
    console.error(`Failed to seed goals`, ex);
    throw ex;
  }
}

async function seedGoalContributions(client, data) {
  try {
    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      await client.sql`INSERT INTO goal_contribs (
        id, goal, option, amt, created
      ) VALUES (
        ${entry.id},
        ${entry.goal},
        ${entry.option},
        ${entry.amt},
        ${new Date().toISOString().split('T')[0]}
      );`;
    }
    console.log(`Added goal contributions`);
  } catch (ex) {
    console.error(`Failed to seed goal contributions`, ex);
    throw ex;
  }
}

async function seedTags(client, data) {
  try {
    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      await client.sql`INSERT INTO tags (
        id
      ) VALUES (
        ${entry.id}
      );`;
    }
    console.log(`Added tags`);
  } catch (ex) {
    console.error(`Failed to seed tags`, ex);
    throw ex;
  }
}

async function main() {
  let seedData = {};

  if (process.env.SEED_DATA_FILE) {
    seedData = require(process.env.SEED_DATA_FILE);
  }

  const client = await db.connect();
  await client.setup();
  await seedOptions(client, seedData.options ?? []);
  await seedGoals(client, seedData.goals ?? []);
  await seedGoalContributions(client, seedData.goal_contributions ?? []);
  await seedTags(client, seedData.tags ?? []);
  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
