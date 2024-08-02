const dns = require("node:dns");
const os = require("node:os");
var express = require("express");
var app = express();
app.use(express.json());

const addy = 3000;

function getIP() {
  return new Promise((resolve1) => {
    const options = { family: 4 };
    dns.lookup(os.hostname(), options, (err, addr) => {
      if (err) {
        resolve1(`${err}`);
      } else {
        resolve1(`IPv4 address: ${addr}`);
      }
    });
  });
}

app.get("/", function (req, res) {
  getIP().then((result) => {
    res.send(`Hello world! <BR>Server IP is: ${result} <BR>Port is ${addy}`);
  });
});

app.post("/test-message", (req, res) => {
  res.send("Got POST request: /test-message");
  const content = req.body;
  
  if (content.message) {
    console.log(content.message);
    process.send(content.message);
  } else {
    console.log("no message!"); 
  }
  // process.send("message", content);
});

app.listen(addy);
