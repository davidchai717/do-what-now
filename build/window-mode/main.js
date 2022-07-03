const { ipcRenderer } = require("electron");

const $taskTitle = document.getElementById("task-title");
$taskTitle.innerText = "Waiting...";

ipcRenderer.on("new-pinned-task", (e, newTaskName) => {
  $taskTitle.innerText = newTaskName;
});
