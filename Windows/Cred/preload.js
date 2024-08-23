const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendCred: (userData) => {
    ipcRenderer.send("cred", JSON.stringify(userData));
  }
});



