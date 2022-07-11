const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  login: ({ username, password }) =>
    ipcRenderer.send("login", { username, password }),
  onNewPinnedTask: (callbackFn) => {
    ipcRenderer.on("new-pinned-task", callbackFn);
  },
  onError: (callbackFn) => {
    ipcRenderer.on("error", callbackFn);
  },
});
