const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  /** @type function(function({values: string[]}):void):void*/
  submitDB: (obj) => {
    ipcRenderer.send("new-db-data", JSON.stringify(obj));
  }
  
});


