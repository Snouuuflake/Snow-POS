const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database("./DB/test-db.db", (err) => {
  // TODO: Handle in a way that makes sense
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to test-db.db.");
  }
});

db.close((err) => {
  // TODO: Also handle this in a way that makes sense
  if (err) {
    return console.error(err.message);
  }
  console.log('Closed the database connection.');
});


/** ===========================================
 * @section Counts
 */






/** ===========================================
 * @section Acts
 */ 

/**
 * @typedef {{items: Array.<{ref: string; qty: number}>; extra: string}} SRequest
 */

/**
 * Attempts to make a sale, performs one final check
 * that the items exist, returns a code
 * @param {SRequest} request
 * @return {{error: (undefined|string)}} 
 */
function makeSale(request){
  // Check all qtys exist
  // if (success) {
  //   Write Sale entry (and json inv)
  //   Write "SALE" acts
  //   Edit inventory values
  //   Print ticket (with Sale entry value)
  //   return {error: undefined}
  // } else {
  //   return {error: "error"}
  // }

}

/**
 * @typedef {{items: Array.<{ref: string; qty: number}>; extra: string; id: number}} RRequest
 */

/**
 * Makes return
 * @param {RRequest} request
 * @return {{error: (undefined|string)}} 
 */ 
function makeReturn(request) {
  // Validate that each item ref, qty exists in JSON.parse(Sales[request.id].sale_json_inv)
  // if (valid) {
  //   update sale_json_inv
  //   Write "RETURN" acts
  //   return {error: undefind}
  // } else {
  //   return {error: "error"}
  // }
}


/**
 * Accepts a count from Counts and turns it
 * into a "SET" act
 * @param {number} countID The Counts.count_id for the
 * count being accepted
 */
function acceptCount(countID) {
  // Set Items[Counts[countID].item_ID].qty = Counts[countID].qty
  // Write SET operation
  // Show success or failure popup
}
