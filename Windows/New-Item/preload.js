const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  /**
   * @param {{ref:string, desc:string, qty:number, price:number}} itemData
   * @param {function({success:boolean, message:string})} callback
   */
  addDBItem: (itemData, callback) => {
    ipcRenderer.invoke("req-add-item", JSON.stringify(itemData)).then((res) => {
      callback(res);
    });
  },
});
