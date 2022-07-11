import { app, Tray, dialog, ipcMain, BrowserWindow } from "electron";
import log from "electron-log";
import tt from "../services/TickTick";
import { wrapTitleInTemplate } from "../utils/title";
import { createWindowModeWin, createLoginWin } from "./windows";
import initializeMenu from "./menu";
import path from "path";

require("dotenv").config();

let interval: NodeJS.Timer;
let loginWin: BrowserWindow;
let windowModeWin: BrowserWindow;
let tray: Tray;

app.setName("DoWhatNow");
app.dock.hide();

export const setNewPinnedTask = async () => {
  const newPinnedTask = await tt.getTaskTitle();
  tray.setTitle(wrapTitleInTemplate(newPinnedTask));
  windowModeWin.webContents.send("new-pinned-task", newPinnedTask);
};

const startAutoFetch = async () => {
  log.info("Starts auto fetching");
  await setNewPinnedTask();
  interval = setInterval(async () => {
    await setNewPinnedTask();
  }, +process.env.INTERVAL || 30000);
};

const stopAutoFetch = () => {
  log.info("Stops auto fetching");
  if (interval) {
    clearInterval(interval);
  }
};

const showLogin = () => {
  if (!loginWin || loginWin.isDestroyed) {
    loginWin = createLoginWin();
  }
  loginWin.show();
  setTimeout(() => {
    loginWin?.webContents.send("testing", "it actually works!");
  }, 5000);
};

const openMainApp = () => {
  tray.setTitle("Loading the next task...");
  startAutoFetch();
};

const closeMainApp = () => {
  stopAutoFetch();
  windowModeWin?.hide();
};

app.whenReady().then(async () => {
  try {
    windowModeWin = createWindowModeWin();
    tray = new Tray(path.resolve(__dirname, "../../tick.png"));
    const contextMenu = initializeMenu(tray, windowModeWin);
    tray.setContextMenu(contextMenu);
    tray.setTitle("DoWhatNow");

    const isLoggedIn = await tt.loginWithExistingCookie();
    if (isLoggedIn) {
      openMainApp();
    } else {
      showLogin();
    }
  } catch (e) {
    await dialog.showErrorBox(
      "Something went wrong!",
      String(e) ? e : "Unknown error"
    );
    stopAutoFetch();
  }
});

app.on("window-all-closed", () => {
  stopAutoFetch();
  app.quit();
});

ipcMain.on("login", async (_, { username, password }) => {
  try {
    await tt.login({ username, password });
    loginWin?.close();
    openMainApp();
  } catch (e) {
    log.error(e);
    loginWin?.webContents?.send("error", e);
  }
});

ipcMain.on("logout", async () => {
  await tt.logout();
  closeMainApp();
  showLogin();
});

process.on("uncaughtException", function (error) {
  stopAutoFetch();
  app.exit();
});
