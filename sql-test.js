const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database("./DB/test-db.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to test-db.db.");
  }
});

