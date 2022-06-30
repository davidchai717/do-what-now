import { app, Tray, dialog } from "electron";
import tt from "../services/TickTick";
import { wrapTitleInTemplate } from "../utils/title";
import { createWindowModeWin } from "./windows";
import initializeMenu from "./menu";

require("dotenv").config();

let interval: NodeJS.Timer;

app.setName("DoWhatNow");
app.dock.hide();

app.whenReady().then(async () => {
  try {
    const windowModeWin = createWindowModeWin();
    const tray = new Tray("tick.png");
    tray.setTitle("Loading the next task...");
    const contextMenu = initializeMenu(tray, windowModeWin);
    tray.setContextMenu(contextMenu);
    await tt.login({
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    });

    tray.setTitle(wrapTitleInTemplate(await tt.getTaskTitle()));

    interval = setInterval(async (): Promise<void> => {
      const newPinnedTask = await tt.getTaskTitle();
      tray.setTitle(wrapTitleInTemplate(newPinnedTask));
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
