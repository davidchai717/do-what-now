const { app, Menu, Tray } = require("electron");
const TickTickService = require("./services/TickTick");
require("dotenv").config();

const tt = new TickTickService();

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
    await tt.login({
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    });

    tray.setTitle(await tt.getTaskTitle());

    interval = setInterval(async () => {
      tray.setTitle(await tt.getTaskTitle());
    }, 5000);
  } catch (e) {
    throw e;
  }
});

app.on("window-all-closed", () => {
  clearInterval(interval);
});
