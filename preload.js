const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onTestMessage: (callback) =>
    ipcRenderer.on("test-message", (_event, value) => callback(value)),
  invokeQR: () => ipcRenderer.invoke("req-qr"),
});
