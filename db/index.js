const sqlite = require("sqlite3");

function getError(err) {
  return new Error(`sqlite_err: ${JSON.stringify(err)}`);
}

class Client {
  constructor(db) {
    this.db = db;
  }

  sql(query, ...params) {
    console.log(`sql`, query, params);
    if (params.length === 0) {
      return this._run(query[0]);
    } else {
      return this._prepare(query, params);
    }
  }

  _run(query) {
    console.log(`_run query=${query}`);

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

    console.log(`Running prepare: ${query}`, params);
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
