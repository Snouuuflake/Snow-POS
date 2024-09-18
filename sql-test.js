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
        /**
         * @type {{
         *  hasError: boolean,
         *  errorMessage?: string,
         *  exists?: boolean,
         *  qty?: number,
         *  price?: number
         * }}
         */
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

/**
 * run validate item on all sales and validate qtys
 * @param db db
 * @param {Array<{ref: string, qty: number}>} saleRequestBody
 */
function validateSale(db, saleRequestBody) {
  return new Promise((resolve) => {
    /**
     * @type {{
     *   hasError: boolean,
     *   errorMessage?: string
     * }} saleResponse
     */
    const saleResponse = { hasError: false, errorMessage: "" };
    Promise.all(
      saleRequestBody.map((item) => {
        return validateItem(db, item);
      }),
    )
      .then((results) => {
        const mappedResults = results.map((res, i) => [
          saleRequestBody[i],
          res,
        ]);
        mappedResults.forEach(
          /**
           * @param  {[
           * {
           *  ref: string,
           *  qty: number,
           * {
           *  hasError: boolean,
           *  errorMessage?: string,
           *  exists?: boolean,
           *  qty?: number,
           *  price?: number
           * }]} tuple
           */
          (tuple) => {
            console.log(tuple[1]);
            if (
              tuple[1].hasError ||
              tuple[0].qty > tuple[1].qty ||
              !tuple[1].exists
            ) {
              saleResponse.hasError = true;
              if (!tuple[1].exists) {
                saleResponse.errorMessage += `${tuple[0].ref}: No existe\n`;
              }
              if (tuple[0].qty > tuple[1].qty) {
                saleResponse.errorMessage += `${tuple[0].ref}: Faltan ${tuple[0].qty - tuple[1].qty} piezas\n`;
              }
              if (tuple[1].hasError) {
                saleResponse.errorMessage += `${tuple[0].ref}: Error; ${tuple[1].errorMessage}\n`;
              }
            } else {
              saleResponse.hasError = false;
            }
          },
        );
        resolve(saleResponse);
      })
      .catch((err) => {
        saleResponse.hasError = true;
        saleResponse.errorMessage = `Error in Promise.all: ${err.message}`;
        resolve(saleResponse);
      });
  });
}

/**
 * calls vaitdateSale
 * @param db
 * @param {Array<{ref: string, qty: number}>} saleRequestBody
 * @return {Promise<{
 *             hasError: boolean,
 *             errorMessage?: string,
 *           }>}
 */
function doSale(db, saleRequestBody) {
  return new Promise((resolve1) => {
    validateSale(db, saleRequestBody).then(
      /**
       * @param {{
       *   hasError: boolean,
       *   errorMessage?: string
       * }} saleResponse
       */
      (saleResponse) => {
        if (saleResponse.hasError) {
          resolve1(saleResponse);
        } else {
          // INFO: making sale entry,
          // making act for every item
          // editing item qty
          // ----------------------------------------

          /** @type {Promise<number>} */
          new Promise((resolve2, reject2) => {
            db.run(
              "INSERT INTO Sales(sale_json_inventory, sale_date) Values(?, ?)",
              [JSON.stringify(saleRequestBody), new Date().toISOString()],
              function(err) {
                if (err) {
                  reject2(err);
                } else {
                  resolve2(this.lastID);
                }
              },
            );
          })
            .then((lastID) => {
              Promise.allSettled(
                saleRequestBody.map((requestItem) => {
                  return new Promise((resolve2, reject2) => {
                    /** @type {Promise<number>} */
                    return new Promise((resolve3, reject3) => {
                      db.get(
                        "SELECT item_qty from Items WHERE item_ref = ?",
                        [item.ref],
                        (err, row) => {
                          if (err) {
                            reject2(err);
                          } else {
                            db.run(
                              `
                            UPDATE Items
                            SET
                              item_qty = ?
                            WHERE
                              item_ref = ?;`,
                              [row.item_qty - requestItem.qty, requestItem.ref],
                              (err) => {
                                if (err) {
                                  reject3(err);
                                } else {
                                  resolve3(row.item_qty - requestItem.qty);
                                }
                              },
                            );
                          }
                        },
                      );
                    }).then((remaining) => {
                      return new Promise((resolve3, reject3) => {
                        db.run(
                          // TODO: add act_extra_text && user_id
                          "INSERT INTO , Acts(act_type, act_item_ref, act_qty, act_ext_id, act_extra_text, act_total_after, act_user_id, date) Values(?, ?, ?, ?, ?, ?, ?, ?)",
                          [
                            "SALE", // ----------------- type
                            requestItem.ref, // -------- item_ref
                            requestItem.qty, // -------- qty
                            lastID, // ---------------------- ext_id
                            "", // --------------------- extra_text
                            remaining, // -------------- total_after
                            1, // ---------------------- user_id
                            new Date().toISOString(), // date
                          ],
                          // act_type
                          // act_item_ref
                          // act_qty
                          // act_ext_id
                          // act_extra_text
                          // act_total_after
                          // act_user_id
                          // date
                          (err) => {
                            if (err) {
                              reject3(err);
                            } else {
                              resolve3();
                            }
                          },
                        );
                      });
                    });
                  });
                }),
              );
            })
            .catch((err2) => {
              resolve1({ hasError: true, errorMessage: err2.message });
            });
          // ----------------------------------------
        }
      },
      (err1) => {
        console.error(err1);
        resolve1({ hasError: true, errorMessage: err1.message });
      },
    );
  });
}

module.exports = { dbConnect, addItem, addUser, validateItem };
