const { menubar } = require("menubar");
const TickTick = require("ticktick-node-api");
require("dotenv").config();

const mb = menubar();
const tt = new TickTick();

mb.on("ready", async () => {
  await tt.login({
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
  });
  const incompleteTasks = await tt.getTasks({
    status: 0,
  });

  const tasksForToday = incompleteTasks.filter(
    (tasks) => new Date(tasks.startDate) <= new Date()
  );

  mb.tray.setTitle(tasksForToday[0]?.title || "N/A");
});
