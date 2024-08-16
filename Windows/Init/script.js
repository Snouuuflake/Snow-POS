/**
 * @name electronAPI
 * @memberof globalThis
 * @type {{getDBs: function}}
 */

let uiIsLocked = false;

/**
 * Async version of html alert
 * @param {string} heading
 * @returns {Promise<undefined>}
 * Not like it really matters i think
 */
async function alert2(heading) {
  uiIsLocked = true;
  const promptBox = document.createElement("div");
  promptBox.classList.add("promptBox");

  const promptHeading = document.createElement("h1");
  promptHeading.classList.add("promptHeading");
  promptHeading.innerHTML = heading;

  const promptButtonContainer = document.createElement("div");
  promptButtonContainer.classList.add("promptButtonContainer");

  const okButton = document.createElement("button");
  okButton.classList.add("promptButton");
  okButton.innerText = "Ok";

  promptBox.appendChild(promptHeading);
  promptButtonContainer.appendChild(okButton);
  promptBox.appendChild(promptButtonContainer);

  document.body.appendChild(promptBox);

  return new Promise((resolve) => {
    okButton.addEventListener("click", (event) => {
      uiIsLocked = false;
      promptBox.remove();
      resolve(true);
    });
  });
}

const handleDBOpen = (success, message) => {
  if (success) {
    alert2("Base de datos se abrió con éxito!").then((_r) => {
      window.close();
    });
  } else {
    alert2(`Error: ${message}.\nFavor de reportar.`);
  }
};

const dbTable = document.getElementById("db-table");
const createDBButton = document.getElementById("create-DB");

window.electronAPI.getDBs((data) => {
  for (const name of data.values) {
    const row = dbTable.insertRow(-1);
    console.log(name);
    row.addEventListener("click", () => {
      if (!uiIsLocked) {
        window.electronAPI.openDB(name, handleDBOpen);
      }
    });
    const cell = row.insertCell(0);
    cell.innerHTML = name;
  }
});

createDBButton.addEventListener("click", () => {
  if (!uiIsLocked) {
    window.electronAPI.createDB(handleDBOpen);
  }
});
