import { app, Menu, Tray, dialog, Notification } from "electron";
import TickTickService from "./services/TickTick";
const tt = new TickTickService();

require("dotenv").config();

let interval;
let tray;

app.setName("DoWhatNow");

app.whenReady().then(async () => {
  try {
    tray = new Tray("tick.png");
    const contextMenu = Menu.buildFromTemplate([
      { label: "Task source: TickTick", enabled: false },
      { type: "separator" },
      {
        label: "Sync Now",
        click: async () => {
          tray.setTitle(await tt.getTaskTitle());
          new Notification({
            title: "Sync was successful",
            body: "Source: TickTick",
          }).show();
        },
      },
      {
        label: "How to Use",
        click: async () => {
          await dialog.showMessageBox(null, {
            message:
              "To pin a task from your task source, simply mark it as high priority and DoWhatNow will grab the first available task.",
          });
        },
      },

      { type: "separator" },
      { role: "quit" },
    ]);
    tray.setContextMenu(contextMenu);
    await tt.login({
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    });

    tray.setTitle(await tt.getTaskTitle());

    interval = setInterval(async () => {
      tray.setTitle(await tt.getTaskTitle());
    }, +process.env.INTERVAL || 30000);
  } catch (e) {
    throw e;
  }
});

app.on("window-all-closed", () => {
  clearInterval(interval);
});
