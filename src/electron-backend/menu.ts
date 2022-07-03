import {
  Menu,
  dialog,
  Notification,
  Tray,
  BrowserWindow,
  ipcMain,
} from "electron";
import tt from "../services/TickTick";
import { wrapTitleInTemplate } from "../utils/title";

const initializeMenu = (tray: Tray, window: BrowserWindow) => {
  const menu = Menu.buildFromTemplate([
    { label: "Task source: TickTick", enabled: false },
    { type: "separator" },
    {
      label: "Sync Now",
      click: async () => {
        const newPinnedTask = await tt.getTaskTitle();
        tray.setTitle(wrapTitleInTemplate(newPinnedTask));
        window.webContents.send("new-pinned-task", newPinnedTask);
        new Notification({
          title: "Sync was successful",
          body: "Source: TickTick",
        }).show();
      },
    },
    {
      label: "Toggle Window Mode",
      click: () => {
        if (window.isVisible()) {
          window.hide();
        } else {
          window.show();
        }
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
    {
      label: "Log out",
      click: () => {
        ipcMain.emit("logout");
      },
    },
    { role: "quit" },
  ]);
  return menu;
};

export default initializeMenu;
