const { db } = require('../db');
// const {} = require('../app/lib/placeholder-data.js');


async function main() {
  const client = await db.connect();
  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
