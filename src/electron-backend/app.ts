import { app, Tray, dialog, BrowserWindow } from "electron";
import tt from "../services/TickTick";
import { createWindowModeWin } from "./windows";
import initializeMenu from "./menu";

require("dotenv").config();

let interval;
let tray: Tray;
let windowModeWin: BrowserWindow;

app.setName("DoWhatNow");

app.whenReady().then(async () => {
  try {
    windowModeWin = createWindowModeWin();
    tray = new Tray("tick.png");
    tray.setTitle("Loading the next task...");
    const contextMenu = initializeMenu(tray, windowModeWin);
    tray.setContextMenu(contextMenu);
    await tt.login({
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    });

    tray.setTitle(await tt.getTaskTitle());

    interval = setInterval(async () => {
      const newPinnedTask = await tt.getTaskTitle();
      tray.setTitle(newPinnedTask);
      windowModeWin.webContents.send("new-pinned-task", newPinnedTask);
    }, +process.env.INTERVAL || 30000);
  } catch (e) {
    await dialog.showErrorBox(
      "Something went wrong!",
      String(e) ? e : "Unknown error"
    );
    if (interval) {
      clearInterval(interval);
    }
  }
});

app.on("window-all-closed", () => {
  if (interval) {
    clearInterval(interval);
  }
});
