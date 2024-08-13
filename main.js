const { fork } = require("child_process");
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

const EventEmitter = require("node:events");
class MyEmitter extends EventEmitter {}

const windowList = [];

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

  // sets up ipc with channels
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
    callbacks: {},
    /**
     * Sets up a callback for an ipc message from the fork process
     * Replicates ipcMain.on, but the callback only takes the argument (data).
     * @param {string} c Channel
     * @param {function} f Callback function
     */
    on: function (c, f) {
      this.callbacks[c] = f;
    },
  };

  expressFork.on("message", (message) => {
    // expects a json message - {"channel", "message"}
    const parsedMessage = JSON.parse(message);
    // iterates through all channels in @param callbacks and
    // runs the corresponding callback(message.data)
    for (const key of Object.keys(expressFork.ipcCustom.callbacks)) {
      if (parsedMessage.channel == key) {
        expressFork.ipcCustom.callbacks[key](parsedMessage.data);
      }
    }
  });
  return expressFork;
}

const createMainWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  windowList.push(win);
  win.loadFile("Test-Site-Local/index.html");

  const expressFork = loadExpress();
  // sets up emitting an event on every message for some channels
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
  createMainWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
