newUserForm = document.getElementById("new-user-form");

newUserForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // NOTE: this will be validated by main process
  
  /** @type {username: string, password1: string, password2: string, isadmin: boolean} */
  const userData = {
    username: document.getElementById("new-user-username").value,
    password1: document.getElementById("new-user-password-1").value,
    password2: document.getElementById("new-user-password-2").value,
    isadmin: document.getElementById("new-user-isadmin").checked
  };

  console.log(userData);

  window.electronAPI.addUser(userData, (res) => {
    if (res.success) {
      newUserForm.reset();
    }
  });
});

