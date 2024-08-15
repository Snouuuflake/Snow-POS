const myForm = document.getElementById("new-db-form");

myForm.addEventListener("submit", (e) => {
  e.preventDefault();
  window.electronAPI.submitDB({
    name: document.getElementById("name").value,
    username: document.getElementById("username").value,
    password: document.getElementById("password").value
  });
  window.close();
});
