const sqlite3 = require("sqlite3").verbose();

/**
 * @param {sqlite3.Database} db
 */
async function createTables(db) {
  // CREATE TABLE [IF NOT EXISTS] [schema_name].table_name (
  // 	column_1 data_type PRIMARY KEY,
  // 	column_2 data_type NOT NULL,
  // 	column_3 data_type DEFAULT 0,
  // 	table_constraints
  // ) [WITHOUT ROWID];
  await db.serialize(() => {
    db.run(`CREATE TABLE [IF NOT EXISTS] Items (
    item_id integer PRIMARY KEY AUTOINCREMENT,
    item_ref text UNIQUE NOT NULL,
    item_desc text,
    item_qty integer NOT NULL,
    item_price integer NOT NULL
    );`);

    db.run(`CREATE TABLE [IF NOT EXISTS] Acts (
    act_id integer PRIMARY KEY AUTOINCREMENT,
    act_type text NOT NULL,
    act_item_ref text NOT NULL,
    act_qty integer NOT NULL,
    act_ext_id integer,
    act_extra_text text,
    act_total_after integer NOT NULL,
    act_overseer_id integer NOT NULL,
    act_date integer NOT NULL
    );`);

    db.run(`CREATE TABLE [IF NOT EXISTS] Sales (
    sale_id integer PRIMARY KEY AUTOINCREMENT,
    sale_json_inventory text,
    sale_date integer NOT NULL
    );`);

    db.run(`CREATE TABLE [IF NOT EXISTS] Counts (
    count_id integer PRIMARY KEY AUTOINCREMENT,
    count_item_ref text NOT NULL,
    count_qty
    );`);

    db.run(`CREATE TABLE [IF NOT EXISTS] Overseers (
    overseer_id integer PRIMARY KEY AUTOINCREMENT,
    overseer_username text UNIQUE NOT NULL,
    overseer_password text UNIQUE NOT NULL
    );`);
  });
}

/**
 * Tries to open a database
 * @param {string} dbPath The path to the database to open
 * @return {{db: sqlite3.Database, error: (string|undefined)}} If no error, error is undefined
 */
function dbOpen(dbPath) {
  const res = { db: undefined, error: undefined };
  return new Promise((resolve) => {
    res.db = new sqlite3.Database(dbPath, (err1) => {
      if (err1) {
        res.error = err1;
      } else {
        // console.log("Connected to test-db.db.");
          createTables(res.db).catch( (e) => {
            res.error = err2;
          })
      }
      resolve(res);
    });
  });
}

dbOpen("./DB/errortest.db").then((res) => {
  console.log(res);
  if (res.error) {
    console.log("Error abriendo base de datos:", res.error.message);
  } else {
    console.log("Conección a base de datos fue exitosa.");
  }
});

// TODO: db.close on app exit

// /** ===========================================
//  * @section Counts
//  */
//
//
//
//
//
//
// /** ===========================================
//  * @section Acts
//  */
//
// /**
//  * @typedef {{items: Array.<{ref: string; qty: number}>; extra: string}} SRequest
//  */
//
// /**
//  * Attempts to make a sale, performs one final check
//  * that the items exist, returns a code
//  * @param {SRequest} request
//  * @return {{error: (undefined|string)}}
//  */
// function makeSale(request){
//   // Check all qtys exist
//   // if (success) {
//   //   Write Sale entry (and json inv)
//   //   Write "SALE" acts
//   //   Edit inventory values
//   //   Print ticket (with Sale entry value)
//   //   return {error: undefined}
//   // } else {
//   //   return {error: "error"}
//   // }
//
// }
//
// /**
//  * @typedef {{items: Array.<{ref: string; qty: number}>; extra: string; id: number}} RRequest
//  */
//
// /**
//  * Makes return
//  * @param {RRequest} request
//  * @return {{error: (undefined|string)}}
//  */
// function makeReturn(request) {
//   // Validate that each item ref, qty exists in JSON.parse(Sales[request.id].sale_json_inv)
//   // if (valid) {
//   //   update sale_json_inv
//   //   Write "RETURN" acts
//   //   return {error: undefind}
//   // } else {
//   //   return {error: "error"}
//   // }
// }
//
//
// /**
//  * Accepts a count from Counts and turns it
//  * into a "SET" act
//  * @param {number} countID The Counts.count_id for the
//  * count being accepted
//  */
// function acceptCount(countID) {
//   // Set Items[Counts[countID].item_ID].qty = Counts[countID].qty
//   // Write SET operation
//   // Show success or failure popup
// }
