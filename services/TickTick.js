const TickTick = require("ticktick-node-api");

const tt = new TickTick();

module.exports = {
  login: async () => {
    await tt.login({
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    });
  },
  getTaskTitle: async () => {
    const incompleteTasks = await tt.getTasks({
      status: 0,
    });

    const tasksForToday = incompleteTasks.filter(
      (tasks) => new Date(tasks.startDate) <= new Date()
    );

    if (!tasksForToday.length) {
      return "All done for today!";
    }

    return "Do this>>> " + (tasksForToday[0]?.title || "N/A") + " <<<";
  },
};
