const EventEmitter = require("node:events");
const dns = require("node:dns");
const path = require("node:path");
const os = require("node:os");
const QRCode = require("qrcode");
var express = require("express");
const { emitKeypressEvents } = require("node:readline");
var app = express();
app.use(express.json());

// Set EJS as the view engine
app.set("view engine", "ejs");
// Define the directory where your HTML files (views) are located
app.set("views", path.join(__dirname, "views"));

const PORT = 3000;

// // NOTE: This is stupid
//
// // "implementation" of ipcMain for fork process,
// // for syntax's sake
// const ipcProcess = {
//   /**
//    * Sends an ipc message to the main process
//    * Replicates ipcMain.send
//    * @param {string} c channel
//    * @param {string} d data
//    */
//   send: (c, d) => {
//     process.send(JSON.stringify({ channel: c, data: d }));
//   },
//   callbacks: {},
//   /**
//    * Sets up a callback for an ipc message from the main process.
//    * Replicates ipcMain.on, but the callback only takes the argument (data).
//    * @param {string} c Channel
//    * @param {function} f Callback function
//    */
//   on: function(c, f) {
//     this.callbacks[c] = f;
//   },
// };
//
// // setting up ipcProcess.on
// process.on("message", (message) => {
//   const parsedMessage = JSON.parse(message);
//   // iterates through all channels in ipcProcess.callbacks and
//   // runs the corresponding callback(message.data)
//   // FIXME: make process.on
//
//   for (const c of Object.keys(ipcProcess.callbacks)) {
//     if (parsedMessage.channel == c) {
//       ipcProcess.callbacks[c](parsedMessage.data);
//     }
//   }
// });

const ipcProcess = {
  /**
   * Sends an ipc message to the main process
   * Replicates ipcMain.send
   * @param {string} c channel
   * @param {string} d data
   */
  send: (c, d) => {
    process.send(JSON.stringify({ channel: c, data: d }));
  },
  _emitter: new EventEmitter(),
  /** @type {{ function(channel: string, callback: function(any) ) }} */
  on: function (c, f) {
    this._emitter.on(c, f);
  },
  /** @type {{ function(channel: string, callback: function(any) ) }} */
  once: function (c, f) {
    this._emitter.once(c, f);
  }
}
// const ipcEmitter = new EventEmitter();
process.on("message", (message) => {
  /** @type {{ channel: string, data: string }} */
  const parsedMessage = JSON.parse(message);
  ipcProcess._emitter.emit(parsedMessage.channel, parsedMessage.data);
});

//  ipcProcess.send:
//  sale-submit, JSON.stringify({
//    uniqueID: Date.now() + Math.random(),
//    sale: sale
//  })
//  --------------------------------------
//  process.send:
//    channel: uniqueID
//    data: sale response
//  --------------------------------------
//  inside post sale-submission:
//    ipcProcess.once(uniqueID, (data) => {
//      res.send ... json
//      -> alert sale success? and sale contents
//    })

function getQRData(url) {
  return new Promise((resolve1) => {
    QRCode.toDataURL(url).then((qrCodeImage) => {
      resolve1(qrCodeImage);
    });
  });
}

function getIP() {
  return new Promise((resolve1) => {
    const options = { family: 4 };
    dns.lookup(os.hostname(), options, (err, addr) => {
      if (err) {
        resolve1(`${err}`);
      } else {
        resolve1(`${addr}`);
      }
    });
  });
}

app.get("/sale", (req, res) => {
  getIP().then((ip) => {
    res.render("sale.ejs", { IP: `${ip}:${PORT}` });
  });
});

app.post("/validate-item", (req, res) => {
  /** @type {{ref: string, qty: number}} body*/
  const validationRequestBody = req.body;
  console.log(validationRequestBody);

  /** @type {{uniqueID: number, body: body}} */
  const vadlidationRequest = {
    uniqueID: Date.now() + Math.random(),
    body: validationRequestBody,
  };

  ipcProcess.send("req-validate-item", vadlidationRequest);
  ipcProcess.once(`${vadlidationRequest.uniqueID}`, 
    /** 
     * @param {{ hasError: boolean, errorMessage?: string, exists?: boolean, qty?: number }} validationResponse
     */
    (validationResponse) => {
    res.send(JSON.stringify(validationResponse));
  });
});

getIP().then((ip) => {
  app.listen(PORT, [ip, "localhost"], () => {
    ipcProcess.send("listening", "listening :)");
    console.log("ip: " + ip);
  });
});

ipcProcess.on("req-qr", (_data) => {
  getIP()
    .then((ip) => {
      return getQRData("http://" + ip + ":" + PORT);
    })
    .then((qrData) => {
      ipcProcess.send("res-qr", qrData);
    });
  // getIP().then((ip) => { console.log(ip) });
});
