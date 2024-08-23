const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  addUser: (userData, callback) => {
    ipcRenderer.invoke("req-add-user", JSON.stringify(userData)).then( (res) => callback(res));
  }
});



