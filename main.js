const { app, Menu, Tray } = require("electron");
const TickTick = require("ticktick-node-api");
const ElectronPreferences = require("electron-preferences");
require("dotenv").config();

const preferences = new ElectronPreferences({
  dataStore: "./preferences.json",
  sections: [
    {
      id: "task",
      label: "Task Preferences",
      icon: "single-01",
      form: {
        groups: [
          {
            label: "Sync Schedule",
            key: "syncSchedule",
            type: "text",
            help: "How often should DoThisNow sync with TickTick (in seconds)",
          },
          {
            label: "Task Title Template",
            key: "titleTemplate",
            type: "text",
            help: "Define any prefix or postfix you'd like to add, where {taskName} represents where the task name will be displayed",
          },
        ],
      },
    },
  ],
});

const tt = new TickTick();

let interval;
let tray;

const getAndSetTask = async () => {
  const incompleteTasks = await tt.getTasks({
    status: 0,
  });

  const tasksForToday = incompleteTasks.filter(
    (tasks) => new Date(tasks.startDate) <= new Date()
  );

  tray.setTitle("Do this>>> " + (tasksForToday[0]?.title || "N/A") + " <<<");
};
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
          preferences.show();
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

    await getAndSetTask();

    interval = setInterval(() => {
      getAndSetTask();
    }, 5000);
  } catch (e) {
    throw e;
  }
});

app.on("window-all-closed", () => {
  clearInterval(interval);
});
