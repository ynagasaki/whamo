const sqlite = require('sqlite3');

function getError(err) {
  return new Error(`sqlite_err: ${JSON.stringify(err)}`);
}

class Client {
  constructor(db) {
    this.db = db;
  }

  sql(query, ...params) {
    // console.log(`sql`, query, params);
    if (params.length === 0) {
      return this._run(query[0]);
    } else {
      return this._prepare(query, params);
    }
  }

  _run(query) {
    // console.log(`_run query=${query}`);
    if (query.startsWith('SELECT')) {
      return new Promise((resolve, reject) => {
        this.db.all(query, (err, rows) => {
          if (!err) {
            resolve({ rows });
          } else {
            reject(getError(err));
          }
        });
      });
    }

    return new Promise((resolve, reject) => {
      this.db.run(query, (err) => {
        if (!err) {
          resolve({ rows: [] });
        } else {
          reject(getError(err));
        }
      });
    });
  }

  _prepare(query, params) {
    query = query.join('?');

    // console.log(`Running prepare: ${query}`, params);
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(query, (err) => {
        if (!err) {
          if (query.startsWith('SELECT')) {
            stmt.all(params, (err_run, rows) => {
              if (!err_run) {
                stmt.finalize();
                resolve({ rows });
              } else {
                reject(getError(err_run));
              }
            });
          } else {
            stmt.run(params, (err_run) => {
              if (!err_run) {
                stmt.finalize();
                resolve({ rows: [] });
              } else {
                reject(getError(err_run));
              }
            });
          }
        } else {
          reject(getError(err));
        }
      });
    });
  }

  end() {
    this.db.close();
  }

  async setup() {
    // Note: If the AUTOINCREMENT keyword appears after INTEGER PRIMARY KEY,
    // that changes the automatic ROWID assignment algorithm to prevent the
    // reuse of ROWIDs over the lifetime of the database. In other words, the
    // purpose of AUTOINCREMENT is to prevent the reuse of ROWIDs from previously
    // deleted rows.
    //
    // see https://www.sqlite.org/autoinc.html
    await this.sql`CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol VARCHAR(32) NOT NULL,
      strike FLOAT NOT NULL,
      otype VARCHAR(4) CHECK(otype IN ('CALL', 'PUT')) NOT NULL,
      exp DATE NOT NULL,
      price INTEGER NOT NULL,
      fee INTEGER NOT NULL,
      action VARCHAR(4) CHECK(action IN ('STO', 'BTC')) NOT NULL,
      assigned INTEGER CHECK(assigned IN (0, 1)) NOT NULL,
      closed_by INTEGER,
      traded DATETIME NOT NULL,
      created DATETIME NOT NULL,
      FOREIGN KEY(closed_by) REFERENCES options(id)
    );`;

    await this.sql`CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amt INTEGER NOT NULL,
      curr_amt INTEGER,
      created DATETIME NOT NULL
    );`;

    await this.sql`CREATE TABLE IF NOT EXISTS goal_contribs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal INTEGER NOT NULL,
      option INTEGER,
      amt INTEGER NOT NULL,
      created DATETIME NOT NULL,
      FOREIGN KEY(goal) REFERENCES goals(id),
      FOREIGN KEY(option) REFERENCES options(id)
    );`;

    // For now, tag data is defined in app code. But we still need
    // to be able to reference tag IDs in the goals table.
    await this.sql`CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT
    );`;

    try {
      await this
        .sql`ALTER TABLE goals ADD COLUMN category INTEGER REFERENCES tags(id);`;
    } catch (err) {}
  }
}

const db = {
  connect: (path) => {
    const file = !path ? `${process.env.DATA_DIR}/data.sqlite` : path;
    console.log(`Connecting to ${file}`);
    return new Promise((resolve, reject) => {
      const database = new sqlite.Database(file, (err) => {
        if (!err) {
          resolve(new Client(database));
        } else {
          reject(new Error('CONNECT_ERR', { cause: err }));
        }
      });
    });
  },
};

module.exports = {
  db,
};
