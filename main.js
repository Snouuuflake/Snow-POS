const fs = require("fs");
const { fork } = require("child_process");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");

const EventEmitter = require("node:events");
class MyEmitter extends EventEmitter { }

const { dbConnect, addItem, addUser, validateItem } = require(
  `${__dirname}/sql-test.js`,
);

const windowList = [];

/** @type {sqlite3.Database} */
let mainDB = undefined;

function ipcAllWindows(channel, data) {
  for (const w of windowList) {
    if (w != null) {
      w.webContents.send(channel, data);
    }
  }
}

/**
 * Makes an express fork process serving expressApp.js
 * Generates callbacks as if it were ipcMain.on(channel, callback(data))
 * @return { {ipcCustom: { send: function(channel<string>, data<string>): void; callbacks: {channel<string>: callback<function>}; on: function(channel<string>, callback<function>): void; }}}
 * The created fork with new property ipcCustom
 */
function loadExpress() {
  // Creates the process
  const expressFork = fork(`${__dirname}/expressApp.js`, [], {
    cwd: `${__dirname}/`,
  });

  expressFork.ipcCustom = {
    /**
     * Sends an ipc message to the fork process
     * Replicates ipcMain.send
     * @param {string} c Channel
     * @param {string} d Data
     */
    send: (c, d) => {
      expressFork.send(JSON.stringify({ channel: c, data: d }));
    },
    _emitter: new EventEmitter(),
    /** @type {{ function(channel: string, callback: function(any) ) }} */
    on: function(c, f) {
      this._emitter.on(c, f);
    },
    /** @type {{ function(channel: string, callback: function(any) ) }} */
    once: function(c, f) {
      this._emitter.once(c, f);
    },
  };

  expressFork.on("message", (message) => {
    /** @type {{ channel: string, data: string }} */
    const parsedMessage = JSON.parse(message);
    expressFork.ipcCustom._emitter.emit(
      parsedMessage.channel,
      parsedMessage.data,
    );
  });
  return expressFork;
}

/**
 * @return {string[]} All files in DB/
 */
function readDBs() {
  return fs.readdirSync(`${__dirname}/DB`, {
    withFileTypes: false,
    recursive: false,
  });
}

/** @section ipcs */
ipcMain.handle("req-DBs", (_event, _data) => {
  return new Promise((resolve) => {
    resolve(
      JSON.stringify({
        /** @type string[]*/
        values: readDBs().map((fsname) => {
          return path.parse(fsname).name;
        }),
      }),
    );
  });
});

/**
 * Creates the initial window for choosing or creating a database
 * @return void
 */
const createInitWindow = () => {
  const main = new BrowserWindow({
    width: 700,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, "./Windows/Init/preload.js"),
    },
  });
  main.loadFile("Windows/Init/index.html");

  /**
   * An attemt at opening a db is handled by opening it
   * in the DB folder, and iff no errors, creating the
   * main window with that db and resolving.
   *
   * If there is an error, res.success = false and
   * res.message = error.message
   */
  ipcMain.handle("open-DB", (_event, name) => {
    return new Promise((resolve) => {
      const res = { success: true, message: "" };
      console.log(`${__dirname}/DB/${name}.db`);
      dbConnect(`${__dirname}/DB/${name}.db`).then(
        (db) => {
          // TODO: do we delete this?
          mainDB = db;
          if (res.success) {
            const mainWindow = createMainWindow(db);
            windowList.push(mainWindow);
          }
          resolve(JSON.stringify(res));
        },
        //
        (e) => {
          res.success = false;
          res.message = e.message;
          resolve(JSON.stringify(res));
        },
      );
    });
  });

  /**
   * When the user tries to create a db, a new child
   * modal window is created that asks for db information.
   * If the db is created but inserting tables causes error,
   * the db is closed and deleted.
   *
   * If everything works, the admin user is inserted.
   *
   * The handle creates the window, and also returns a promise that
   * resolves when the db info from the user is processed via the
   * ipcMain.once
   */
  ipcMain.handle("create-DB", (_event, _data) => {
    const newDBWindow = new BrowserWindow({
      width: 300,
      height: 400,
      webPreferences: {
        preload: path.join(__dirname, "./Windows/New-DB/preload.js"),
      },
      parent: main,
      modal: true,
    });

    newDBWindow.loadFile("Windows/New-DB/index.html");

    return new Promise((resolve) => {
      const res = { success: true, message: "" };
      // NOTE: all fields.trim() should be truthy
      //       and password.length >= 8
      ipcMain.once("new-db-data", (_event, data) => {
        console.log("got data", data);
        /**
         * @type {{name:string, username: string, password: string}}
         * (credentials are for db admin)
         */
        const parsedData = JSON.parse(data);
        // Validating data
        if (readDBs().includes(`${parsedData.name}.db`)) {
          res.success = false;
          res.message = "Empresa ya existe";
        }

        dbConnect(`${__dirname}/DB/${parsedData.name}.db`).then(
          (db) => {
            // TODO: do we delete mainDB?
            mainDB = db;
            if (res.success) {
              db.run(
                "INSERT INTO Users(user_username, user_password, user_is_admin) Values(?, ?, ?)",
                [parsedData.username, parsedData.password, true],
                (err) => {
                  if (err) {
                    res.success = false;
                    res.message = err.message;
                    fs.unlink(
                      `${__dirname}/DB/${parsedData.name}.db`,
                      (fserr) => {
                        if (fserr) {
                          console.log("fs error:", fserr.message);
                        } else {
                          console.log("Deleted", parsedData.name);
                        }
                      },
                    );
                  } else {
                    const mainWindow = createMainWindow(db);
                    windowList.push(mainWindow);
                  }
                  resolve(JSON.stringify(res));
                },
              );
            } else {
              resolve(JSON.stringify(res));
            }
          },
          //
          (e) => {
            res.success = false;
            res.message = e.message;
            fs.unlink(`${__dirname}/DB/${parsedData.name}.db`, (fserr) => {
              if (fserr) {
                console.log("fs error:", fserr.message);
              } else {
                console.log("Deleted", parsedData.name);
              }
            });

            resolve(JSON.stringify(res));
          },
        );
      });
    });
  });
};

const createMainWindow = (db) => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "./Windows/Main/preload.js"),
    },
  });

  windowList.push(win);
  win.loadFile(`${__dirname}/Windows/Main/index.html`);

  /**
   * @window cred
   */
  const getCred = () => {
    const credWindow = new BrowserWindow({
      width: 700,
      height: 500,
      webPreferences: {
        preload: path.join(__dirname, "./Windows/Cred/preload.js"),
      },
      parent: win,
      modal: true,
    });
    credWindow.loadFile("Windows/Cred/index.html");
    return new Promise((resolve) => {
      ipcMain.once("cred", (_event, data) => {
        const parsedData = JSON.parse(data);
        credWindow.close();
        resolve(parsedData);
      });
    });
  };

  /*
   *  @window Admin
   */

  ipcMain.on("open-admin-window", (_event, _data) => {
    getCred().then((credData) => {
      const sql = `SELECT user_username, user_password, user_is_admin FROM Users`;
      let validatee = false;
      db.all(sql, [], (err, rows) => {
        if (err) {
          dialog.showMessageBox({
            message: `Error validando usuario: ${err.message}.`,
            type: "error",
          });
        } else {
          rows.forEach((item) => {
            if (
              item.user_username === credData.username &&
              item.user_password === credData.password &&
              item.user_is_admin == 1
            ) {
              validatee = true;
            }
          });

          if (validatee) {
            console.log("opening admin window...");
            const adminWindow = new BrowserWindow({
              width: 500,
              height: 450,
              webPreferences: {
                preload: path.join(__dirname, "./Windows/Admin/preload.js"),
              },
              parent: win,
              modal: true,
            });
            adminWindow.loadFile(`${__dirname}/Windows/Admin/index.html`);
          } else {
            dialog.showMessageBox({
              message: `Credenciales no son válidas.`,
              type: "error",
            });
          }
        }
      });
    });
  });

  ipcMain.handle("req-add-user", (_event, userData) => {
    /** @type {username: string, password1: string, password2: string, isadmin: boolean} */
    const parsedData = JSON.parse(userData);
    console.log(parsedData);
    return new Promise((resolve) => {
      const res = { success: true, message: "" };

      if (!(parsedData.password1 === parsedData.password2)) {
        res.success = false;
        res.message = "Las contraseñas no coinciden.";
        resolve(res);
        dialog.showMessageBox({
          message: `Error añadiendo usuario: ${res.message}.`,
          type: "error",
        });
      } else {
        addUser(parsedData).then(
          () => {
            resolve(res);
            dialog.showMessageBox({
              message: "Usuario añadido existosamente.",
              type: "info",
            });
          },
          (e) => {
            res.success = false;
            res.message = e.message;
            resolve(res);
            dialog.showMessageBox({
              message: `Error añadiendo usuario: ${res.message}.`,
              type: "error",
            });
          },
        );
      }
    });
  });

  /*
   *  @window Add Item
   */

  ipcMain.on("open-add-item-window", (_event, data) => {
    console.log("hi");
    const newItemWindow = new BrowserWindow({
      width: 300,
      height: 400,
      webPreferences: {
        preload: path.join(__dirname, "./Windows/New-Item/preload.js"),
      },
      parent: win,
      modal: true,
    });
    newItemWindow.loadFile(`${__dirname}/Windows/New-Item/index.html`);
  });
  // ^
  ipcMain.handle("req-add-item", (_event, itemData) => {
    const parsedData = JSON.parse(itemData);
    console.log(parsedData);
    return new Promise((resolve) => {
      const res = { success: true, message: "" };
      addItem(db, parsedData).then(
        () => {
          resolve(res);
          dialog.showMessageBox({
            message: "Artículo añadido exitosamente",
            type: "info",
          });
        },
        (e) => {
          res.success = false;
          res.message = e.message;
          resolve(res);
          dialog.showMessageBox({
            message: `Error añadiendo artículo: ${res.message}.`,
            type: "error",
          });
        },
      );
    });
  });

  const expressFork = loadExpress();
  // sets up emitting an event on every message for some channels
  // FIXME: This is also stupid.
  const expressForkEmitter = new MyEmitter();

  // emits "new-qr" on every "res-qr" recieved
  expressFork.ipcCustom.on("res-qr", (data) => {
    console.log("emitting new-qr");
    expressForkEmitter.emit("new-qr", data);
  });

  // relays any test messages from express
  expressFork.ipcCustom.on("test-message", (data) => {
    ipcAllWindows("test-message", data);
    console.log("Main test-message: ", data);
  });

  expressFork.ipcCustom.on(
    "req-validate-item",
    /** @param {{uniqueID: number, body: {ref: string, qty: number}}} validationRequest */
    (validationRequest) => {
      validateItem(db, validationRequest.body).then(
        /**
         * @param {{
         *   hasError: boolean,
         *   errorMessage?: string,
         *   exists?: boolean,
         *   qty?: number,
         *   price?: number
         * }} validationResponse
         */
        (validationResponse) => {
          expressFork.ipcCustom.send(
            `${validationRequest.uniqueID}`,
            validationResponse,
          );
          console.log(typeof validationResponse.price);
        },
        (err) => {
          console.error(err);
        },
      );
    },
  );

  expressFork.ipcCustom.on(
    "req-submit-sale",
    /** @param {{uniqueID: number, body: Array<{ref, req}>}} saleRequest */
    (saleRequest) => {
      writeSale(db, saleRequest.body).then(
        /**
         * @param {{
         *   hasError: boolean,
         *   errorMessage?: string
         * }} saleResponse
         */
        (saleResponse) => {
          expressFork.ipcCustom.send(
            `${saleRequest.uniqueID}`,
            saleResponse
          );
          console.log("sale response: ", saleResponse);
        },
        (err) => {
          console.error(err);
        }
      );
    },
  );
  // all on's that arent "listening" should probably be
  // declared first.
  expressFork.ipcCustom.on("listening", (data) => {
    console.log(data);

    // handle for ipcMain "req-qr" that sets up an event listener
    // from experss for the next qr code response that resolves
    // the handle with it, and then asks for a qr
    ipcMain.handle("req-qr", (_event, _data) => {
      return new Promise((resolve) => {
        expressForkEmitter.addListener(
          "new-qr",
          (response) => {
            console.log(response);
            resolve(response);
          },
          { once: true },
        );
        expressFork.ipcCustom.send("req-qr", "requesting qr!");
      });
    });
  });
};

app.whenReady().then(() => {
  createInitWindow();
});

app.on("window-all-closed", () => {
  if (mainDB) {
    mainDB.close((err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Closed DB without error.");
      }
    });
  }
  app.quit();
});
