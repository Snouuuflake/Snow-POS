const { fork } = require("child_process");
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

const EventEmitter = require("node:events");
class MyEmitter extends EventEmitter { }

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
 * @return The created fork with new property ipcCustom
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
    on: function(c, f) {
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
  win.loadFile("test-site/index.html");
  const expressFork = loadExpress();
  // all on's that arent "listening" should probably be
  // declared first.

  expressFork.ipcCustom.on("listening", (data) => {
    console.log(data);
    const qrEmitter = new MyEmitter();

    expressFork.ipcCustom.on("res-qr", (data) => {
      console.log("emitting new-qr");
      qrEmitter.emit("new-qr", data);
    });

    // expressFork.ipcCustom.send("a", "AAAA");
    // expressFork.ipcCustom.send("b", "BBBB");
    // expressFork.ipcCustom.send("a", "AAAA");
    // ipcMain.on("req-qr", (_event, data) => {
    //
    //   // asking for a response from res-qr on channel ```"res-qr" + data```
    //   expressFork.ipcCustom.send("spawn", "res-qr data");
    //
    //   expressFork.ipcCustom.on("res-qr" + data, (response) => {
    //     ipcAllWindows("res-" + data, response);
    //     expressFork.ipc.Custom.on("kill", data);
    // });

    ipcMain.handle("hello", (_event, data) => {return new Promise((r) => r("world"))});
    ipcMain.handle("req-qr", (event, data) => {
      return new Promise((resolve) => {
        qrEmitter.on("new-qr", (response) => {
          console.log(response);
          resolve(response);
        });
        expressFork.ipcCustom.send("req-qr", "hi");
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
