const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  /** @type function(function({values: string[]}):void):void*/
  getDBs: (callback) => {
    ipcRenderer.invoke("req-DBs").then((data) => {
      callback(JSON.parse(data))
    });
  },
  /** @type function(function(boolean, string):void):void*/
  createDB: (callback) => {
    ipcRenderer.invoke("create-DB").then((data) => {
      const parsedData = JSON.parse(data);
      callback(parsedData.success, parsedData.message);
    });
  },
  openDB: (name, callback) => {
    ipcRenderer.invoke("open-DB", name).then((data) => {
      const parsedData = JSON.parse(data);
      callback(parsedData.success, parsedData.message);
    });
  }
});

