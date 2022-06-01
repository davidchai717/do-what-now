const { app, Menu, Tray } = require("electron");
const TickTickService = require("./services/TickTick");
require("dotenv").config();

let interval;
let tray;

app.setName("DoWhatNow");

app.whenReady().then(async () => {
  try {
    tray = new Tray("tick.png");
    const contextMenu = Menu.buildFromTemplate([
      { id: 0, label: "Ready to sync...", enabled: false },
      { type: "separator" },
      { label: "Sync Now" },
      {
        label: "Preferences",
        click: () => {
          console.log("not built yet");
        },
      },
      { type: "separator" },
      { role: "quit" },
    ]);
    tray.setContextMenu(contextMenu);
    await TickTickService.login();

    tray.setTitle(await TickTickService.getTaskTitle());

    interval = setInterval(async () => {
      tray.setTitle(await TickTickService.getTaskTitle());
    }, 5000);
  } catch (e) {
    throw e;
  }
});

app.on("window-all-closed", () => {
  clearInterval(interval);
});
