const dns = require("node:dns");
const path = require("node:path");
const os = require("node:os");
const QRCode = require("qrcode");
var express = require("express");
var app = express();
app.use(express.json());

// Set EJS as the view engine
app.set("view engine", "ejs");
// Define the directory where your HTML files (views) are located
app.set("views", path.join(__dirname, "Test-Site-Mobile"));

const PORT = 3000;

// "implementation" of ipcMain for fork process,
// for syntax's sake
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
  callbacks: {},
  /**
   * Sets up a callback for an ipc message from the main process.
   * Replicates ipcMain.on, but the callback only takes the argument (data).
   * @param {string} c Channel
   * @param {function} f Callback function
   */
  on: function (c, f) {
    this.callbacks[c] = f;
  },
};

// setting up ipcProcess.on
process.on("message", (message) => {
  const parsedMessage = JSON.parse(message);
  // iterates through all channels in ipcProcess.callbacks and
  // runs the corresponding callback(message.data)
  for (const c of Object.keys(ipcProcess.callbacks)) {
    if (parsedMessage.channel == c) {
      ipcProcess.callbacks[c](parsedMessage.data);
    }
  }
});

// FIXME: this is for testing!
ipcProcess.on("a", (data) => {
  console.log("Express: " + "a" + " " + data);
});
ipcProcess.on("b", (data) => {
  ipcProcess.on("a", (_data) => console.log("monads"));
});
ipcProcess.on("c", (data) => {
  console.log("Express: " + "c" + " " + data);
});

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

app.get("/", function (req, res) {
  getIP().then((result) => {
    // res.send(`Hello world! <BR>Server IP is: ${result} <BR>Port is ${PORT}`);
    res.render("index.ejs", {a: "HELLO"});
  });
});

app.get("/mobile", (req, res) => {
  res.render("./index.ejs", {a: "HELLO"});
});

app.post("/test-message", (req, res) => {
  const content = req.body;

  if (content.message) {
    console.log("Got POST request: /test-message " + content.message);
    ipcProcess.send("test-message", content.message);
    res.status(202).send({ message: "Success" });
  } else {
    console.log("no message!");
    res
      .status(418)
      .send({
        error: "no-message",
        message: "Message is blank! Input was not registered",
      });
  }
  // process.send("message", content);
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
