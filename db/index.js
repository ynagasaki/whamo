const sqlite = require("sqlite3");

function getError(err) {
  return new Error(`sqlite_err: ${JSON.stringify(err)}`);
}

class Client {
  constructor(db) {
    this.db = db;
  }

  sql(query, ...params) {
    if (params.length === 0) {
      // console.log(`what`, query);
      return this._run(query[0]);
    } else {
      return this._prepare(query, params);
    }
  }

  _run(query) {
    if (query.startsWith("CREATE EXTENSION")) {
      console.log(`Skipping query: ${query}`);
      return new Promise((resolve) => resolve(undefined));
    }

    if (query.startsWith('SELECT')) {
      console.log(`Running query: ${query}`);
      return new Promise((resolve, reject) => {
        this.db.all(query, (err, rows) => {
          if (!err) {
            resolve({ rows });
          } else {
            reject(getError(err));
          }
        })
      });
    }

    query = query.replace(
      "id UUID DEFAULT uuid_generate_v4() PRIMARY KEY",
      "id INTEGER PRIMARY KEY AUTOINCREMENT"
    );

    console.log(`Running query: ${query}`);
    return new Promise((resolve, reject) => {
      this.db.run(query, (err) => {
        if (!err) {
          resolve(undefined);
        } else {
          reject(getError(err));
        }
      });
    });
  }

  _prepare(query, params) {
    query = query.join('?');

    console.log(`Running prepare: ${query}`, params);
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(query, (err) => {
        if (!err) {
          stmt.run(params, (err_run) => {
            if (!err_run) {
              stmt.finalize();
              resolve(undefined);
            } else {
              reject(getError(err_run));
            }
          });
        } else {
          reject(getError(err));
        }
      });
    });
  }

  end() {
    this.db.close();
  }
};

const db = {
  connect: () => {
    const file = `${process.env.DATA_DIR}/data.sqlite`;
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
