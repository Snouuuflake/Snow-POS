const addItemButton = document.getElementById("add-item");

addItemButton.addEventListener("click", () => {
  window.electronAPI.openAddItemWindow();
});
