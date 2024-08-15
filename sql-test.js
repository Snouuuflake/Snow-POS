const sqlite3 = require("sqlite3").verbose();

/**
 * @param {sqlite3.Database} db
 */
function createTables(db) {
  // CREATE TABLE IF NOT EXISTS [schema_name].table_name (
  // 	column_1 data_type PRIMARY KEY,
  // 	column_2 data_type NOT NULL,
  // 	column_3 data_type DEFAULT 0,
  // 	table_constraints
  // ) [WITHOUT ROWID];

  let tablesCreated = 0;
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS Items (
    item_id integer PRIMARY KEY AUTOINCREMENT,
    item_ref text UNIQUE NOT NULL,
    item_desc text,
    item_qty integer NOT NULL,
    item_price integer NOT NULL
    );`,
      (err) => {
        if (err) {
          reject(err);
        }
      },
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Acts (
    act_id integer PRIMARY KEY AUTOINCREMENT,
    act_type text NOT NULL,
    act_item_ref text NOT NULL,
    act_qty integer NOT NULL,
    act_ext_id integer,
    act_extra_text text,
    act_total_after integer NOT NULL,
    act_overseer_id integer NOT NULL,
    act_date integer NOT NULL
    );`,
      (err) => {
        if (err) {
          reject(err);
        }
      },
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Sales (
    sale_id integer PRIMARY KEY AUTOINCREMENT,
    sale_json_inventory text,
    sale_date integer NOT NULL
    );`,
      (err) => {
        if (err) {
          reject(err);
        }
      },
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Counts (
    count_id integer PRIMARY KEY AUTOINCREMENT,
    count_item_ref text NOT NULL,
    count_qty
    );`,
      (err) => {
        if (err) {
          reject(err);
        }
      },
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Overseers (
    overseer_id integer PRIMARY KEY AUTOINCREMENT,
    overseer_username text UNIQUE NOT NULL,
    overseer_password text NOT NULL,
    overseer_is_admin integer NOT NULL
    );`,
      (err) => {
        if (err) {
          reject(err);
        }
      },
    );
    db.run("", (_err) => {
      resolve();
    });
  });
}

/**
 * Tries to open a database
 * @param {string} dbPath The path to the database to open
 * @return {{db: sqlite3.Database, error: (string|undefined)}} If no error, error is undefined
 */
async function dbConnect(dbPath) {
  function _dbOpen(dbPath) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      });
    });
  }
  function _dbClose(db) {
    return new Promise((resolve) => {
      db.close(() => {resolve()});
    });
  }

  db = await _dbOpen(dbPath);
  try {
    await createTables(db);
  } catch (e) {
    await _dbClose(db);
    throw e;
  }
  return db
}

// dbConnect("./DB/format-check.db")
//   .catch((e) => {
//     console.log("Caught:", e.message);
//   })
//   .then((db) => {
//     console.log("Success!");
//     console.log(db);
//   });

// TODO: db.close on app exit

module.exports = { dbConnect };
