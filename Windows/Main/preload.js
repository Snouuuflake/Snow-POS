const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openAddItemWindow: () => {
    ipcRenderer.send("open-add-item-window", " ");
  }
});


