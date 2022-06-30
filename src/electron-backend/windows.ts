import { BrowserWindow } from "electron";

export const createWindowModeWin = () => {
  const windowModeWin = new BrowserWindow({
    width: 500,
    height: 250,
    titleBarStyle: "customButtonsOnHover",
    vibrancy: "under-window",
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  windowModeWin.setAlwaysOnTop(true, "screen-saver");
  windowModeWin.setVisibleOnAllWorkspaces(true);
  windowModeWin.loadURL("http://localhost:8080");
  windowModeWin.hide();

  windowModeWin.on("close", (e) => {
    e.preventDefault();
    windowModeWin.hide();
  });
  return windowModeWin;
};
