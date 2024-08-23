const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openAddItemWindow: () => {
    ipcRenderer.send("open-add-item-window", " ");
  },
  openAdminWindow: () => {
    ipcRenderer.send("open-admin-window", "");
  }
});


