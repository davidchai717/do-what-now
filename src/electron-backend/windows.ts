import { BrowserWindow } from "electron";
import path from "path";

export const createLoginWin = () => {
  const loginWin = new BrowserWindow({
    width: 500,
    height: 250,
    resizable: false,
    titleBarStyle: "hidden",
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  loginWin.loadFile(path.resolve(__dirname, "../login/index.html"));
  return loginWin;
};

export const createWindowModeWin = () => {
  const windowModeWin = new BrowserWindow({
    width: 500,
    height: 250,
    titleBarStyle: "customButtonsOnHover",
    vibrancy: "dark",
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  windowModeWin.setAlwaysOnTop(true, "screen-saver");
  windowModeWin.setVisibleOnAllWorkspaces(true);
  windowModeWin.loadFile(path.resolve(__dirname, "../window-mode/index.html"));
  windowModeWin.hide();

  windowModeWin.on("close", (e) => {
    e.preventDefault();
    windowModeWin.hide();
  });
  return windowModeWin;
};
