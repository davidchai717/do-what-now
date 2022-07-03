const { ipcRenderer } = require("electron");

const $form = document.getElementById("login-form");
console.log("$form");

$form.addEventListener("submit", (e) => {
  console.log("prevent it!");
  e.preventDefault();
  new FormData($form);
});

$form.addEventListener("formdata", async (e) => {
  const username = e.formData.get("username");
  const password = e.formData.get("password");
  ipcRenderer.send("login", {
    username,
    password,
  });
});
