credForm = document.getElementById("cred-form");

credForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // NOTE: this will be validated by main process
  
  /** @type {username: string, password: string} */
  const userData = {
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
  };

  console.log(userData);

  window.electronAPI.sendCred(userData);
});


