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
    act_user_id integer NOT NULL,
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
    sale_user_id integer NOT NULL,
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
    count_qty integer NOT NULL,
    count_user_id integer NOT NULL,
    count_date integer NOT NULL
    );`,
      (err) => {
        if (err) {
          reject(err);
        }
      },
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Users (
    user_id integer PRIMARY KEY AUTOINCREMENT,
    user_username text UNIQUE NOT NULL,
    user_password text NOT NULL,
    user_is_admin integer NOT NULL
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
      db.close(() => {
        resolve();
      });
    });
  }

  db = await _dbOpen(dbPath);
  try {
    await createTables(db);
  } catch (e) {
    await _dbClose(db);
    throw e;
  }
  return db;
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

/**
 * Attempts to add an item, returns a promise that
 * resolves, or rejects with sql error.
 *
 * @param {{ref:string, desc:string, qty:number, price:number}} itemData
 * @return {Promise<void>}
 */
function addItem(db, itemData) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO Items(item_ref, item_desc, item_qty, item_price) Values(?, ?, ?, ?)",
      [itemData.ref, itemData.desc, itemData.qty, itemData.price],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      },
    );
  });
}

/**
 * Attempts to add user to database, returns promises that resolves void or err
 *
 * @param {{username: string, password1: string, password2: string, isadmin: boolean}} userData
 * @return {Promise<void>}
 */
function addUser(userData) {
  return new Promise((resolve, reject) => {
    /*
     * user_id       integer PRIMARY KEY AUTOINCREMENT,
     * user_username text    UNIQUE  NOT NULL,
     * user_password text    NOT NULL,
     * user_is_admin integer NOT NULL
     */
    db.run(
      "INSERT INTO Users(user_username, user_password, user_is_admin) Values(?, ?, ?)",
      [userData.username, userData.password1, userData.isadmin ? 1 : 0],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      },
    );
  });
}

/**
 * @param db
 * @param {{ref: string, qty: number}} validationRequestBody
 */
function validateItem(db, validationRequestBody) {
  return new Promise((resolve) => {
    const sql = `SELECT item_qty, item_price
     FROM Items
     WHERE item_ref = ?`;

    db.get(sql, validationRequestBody.ref, (err, row) => {
      const validationResponse = {
        hasError: false,
        errorMessage: undefined,
        exists: undefined,
        qty: undefined,
        price: undefined,
      };

      if (err) {
        validationResponse.hasError = true;
        validationResponse.errorMessage = err.message;
      } else {
        if (row) {
          validationResponse.exists = true;
          validationResponse.qty = row.item_qty;
          validationResponse.price = row.item_price;
        } else {
          validationResponse.exists = false;
        }
      }
      resolve(validationResponse);
    });
  });
}

module.exports = { dbConnect, addItem, addUser, validateItem };
