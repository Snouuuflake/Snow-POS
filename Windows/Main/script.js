const addItemButton = document.getElementById("add-item");
const adminButton = document.getElementById("admin");

addItemButton.addEventListener("click", () => {
  window.electronAPI.openAddItemWindow();
});

adminButton.addEventListener("click", () => {
  window.electronAPI.openAdminWindow();
});
