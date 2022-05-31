const { menubar } = require("menubar");
const TickTick = require("ticktick-node-api");
require("dotenv").config();

const mb = menubar();
const tt = new TickTick();

let interval;

const getAndSetTask = async () => {
  const incompleteTasks = await tt.getTasks({
    status: 0,
  });

  const tasksForToday = incompleteTasks.filter(
    (tasks) => new Date(tasks.startDate) <= new Date()
  );

  mb.tray.setTitle("Do this>>> " + (tasksForToday[0]?.title || "N/A") + " <<<");
};

mb.on("ready", async () => {
  await tt.login({
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
  });

  await getAndSetTask();

  interval = setInterval(() => {
    getAndSetTask();
  }, 5000);
});

mb.on("window-all-closed", () => {
  clearInterval(interval);
});
