const $taskTitle = document.getElementById("task-title");
$taskTitle.innerText = "Waiting...";

window.api.onNewPinnedTask((_, newTaskName) => {
  $taskTitle.innerText = newTaskName;
});
