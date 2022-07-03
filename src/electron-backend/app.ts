import { app, Tray, dialog, ipcMain, BrowserWindow } from "electron";
import tt from "../services/TickTick";
import { wrapTitleInTemplate } from "../utils/title";
import { createWindowModeWin, createLoginWin } from "./windows";
import initializeMenu from "./menu";

require("dotenv").config();

let interval: NodeJS.Timer;
let initialized: boolean = false;
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
  await setNewPinnedTask();
  interval = setInterval(async () => {
    await setNewPinnedTask();
  }, +process.env.INTERVAL || 30000);
};

const stopAutoFetch = () => {
  if (interval) {
    clearInterval(interval);
  }
};

const showLogin = () => {
  if (!loginWin || loginWin.isDestroyed) {
    loginWin = createLoginWin();
  }
  loginWin.show();
};

const openMainApp = () => {
  if (!initialized) {
    windowModeWin = createWindowModeWin();

    tray = new Tray("tick.png");
    const contextMenu = initializeMenu(tray, windowModeWin);
    tray.setContextMenu(contextMenu);
    initialized = true;
  }
  tray.setTitle("Loading the next task...");
  startAutoFetch();
};

const closeMainApp = () => {
  stopAutoFetch();
  windowModeWin?.close();
  tray.destroy();
  initialized = false;
};

app.whenReady().then(async () => {
  try {
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
});

ipcMain.on("login", async (_, { username, password }) => {
  try {
    await tt.login({ username, password });
    loginWin?.close();
    openMainApp();
  } catch (e) {
    loginWin?.webContents?.send("error", e);
  }
});

ipcMain.on("logout", async () => {
  await tt.logout();
  closeMainApp();
  showLogin();
});
