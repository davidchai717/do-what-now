const $form = document.getElementById("login-form");
const $error = document.getElementById("error");

window.api.onError((_, message) => {
  console.error("ERROR FROM BACKEND", message);
  $error.innerText = message;
});

$form.addEventListener("submit", (e) => {
  e.preventDefault();
  new FormData($form);
});

$form.addEventListener("formdata", async (e) => {
  const username = e.formData.get("username");
  const password = e.formData.get("password");
  window.api.login({
    username,
    password,
  });
});
