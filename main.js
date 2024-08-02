const { fork } = require("child_process");
const { app, BrowserWindow } = require("electron");

let expressFork = null;
function loadExpress() {
  if (expressFork == null) {
    expressFork = fork(`${__dirname}/expressApp.js`, [], {
      cwd: `${__dirname}/`,
    });
    expressFork.on("message", (data) => console.log(data));
  }
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });
  // win.loadFile("index.html");
  loadExpress();
};

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});

