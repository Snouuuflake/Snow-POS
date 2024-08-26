const IP = 123412341234

/**
 * @parm {Object} parentElement
 * @param {string} className
 * @returns The first child of parentElement with className
 */
function gebcn(parentElement, className) {
  return parentElement.getElementsByClassName(className)[0];
}

const addItemSection = () => {
  const newSection = document.createElement("section");
  newSection.classList.add("item-container");
  newSection.innerHTML = `
    <div class="mdiy-textfield-filled ref-container">
       <input type="text" class="_mdiy-textfield-filled-input ref-input" placeholder="Referencia"></input>
       <button class="_mdiy-textfield-filled-button">
         <i class="bi bi-x _mdiy-textfield-filled-icon"></i>
       </button>
     </div>
     <div class="qty-container">
       <div class="mdiy-pm">
         <button class="_mdiy-pm-p"><i class="bi bi-plus"></i></button>
         <button class="_mdiy-pm-m"><i class="bi bi-dash"></i></button>
       </div>
       <div class="input-qty-container">
         <div class="input-qty">0</div>
       </div>
       <!-- TODO: classes: midy-error, mdiy-blank, mdiy-true -->
       <div class="qty-badge-container mdiy-blank">
         <!-- <div class="qty-badge-limit">7764</div> -->
       </div>
     </div> `;
  const pButton = gebcn(newSection, "_mdiy-pm-p");
  const mButton = gebcn(newSection, "_mdiy-pm-m");
  const inputQtyDiv = gebcn(newSection, "input-qty");
  const badgeContainer = gebcn(newSection, "qty-badge-container");
  const refInput = gebcn(newSection, "ref-input");

  /**
   * sets badge to true
   */
  const setBadgeT = () => {
    badgeContainer.className = "qty-badge-container mdiy-true";
    badgeContainer.replaceChildren();
  };
  /**
   * sets badge to false (shows limit)
   * @param {number} limit
   */
  const setBadgeF = (limit) => {
    badgeContainer.className = "qty-badge-container mdiy-error";
    const limitDiv = document.createElement("div");
    limitDiv.className = "qty-badge-limit";
    limitDiv.innerText = `${limit}`;
    badgeContainer.replaceChildren(limitDiv);
  };
  /**
   * Sets the badge to error staet
   */
  const setBadgeE = () => {
    badgeContainer.className = "qty-badge-container mdiy-error";
    const xIcon = document.createElement("i");
    xIcon.className = "bi bi-x qty-badge-error";
    badgeContainer.replaceChildren(xIcon);
  };

  pButton.addEventListener("click", () => {
    inputQtyDiv.innerText = `${parseInt(inputQtyDiv.innerText) + 1}`;
  });

  mButton.addEventListener("click", () => {
    const prevText = inputQtyDiv.innerText;
    inputQtyDiv.innerText = `${prevText > 0 ? parseInt(inputQtyDiv.innerText) - 1 : prevText}`;
  });

  newSection.addEventListener("click", () => {
    switch (parseInt(inputQtyDiv.innerText)) {
      case 1:
        setBadgeT();
        break;
      case 2:
        setBadgeE();
        break;
      case 3:
        setBadgeF(15);
        break;
    }
  });

  document.body.appendChild(newSection);

  return {
    pButton: pButton,
    mButton: mButton,
    inputQtyDiv: inputQtyDiv,
    badgeContainer: badgeContainer,
    refInput: refInput,
  };
};

/**
 * If the last ref input is empty, appends a new one,
 * if not, focuses it
 */
const crEvent = () => {
  const allInputs = document.getElementsByClassName("ref-input");
  if (allInputs.length > 0 && !allInputs[allInputs.length - 1].value) {
    allInputs[allInputs.length - 1].focus();
  } else {
    const { refInput } = addItemSection();
    refInput.focus();
  }
};

/** NOTE: BUTTON and CR cause crEvent */
document.getElementById("BUTTON").addEventListener("click", crEvent);

document.addEventListener("keydown", function onEvent(event) {
  if (event.key === "Enter") {
    crEvent();
  }
});
