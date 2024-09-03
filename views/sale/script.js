const IP = 123412341234;

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
  const xButton = gebcn(newSection, "_mdiy-textfield-filled-button");

  xButton.addEventListener("click", () => {
    newSection.remove();
  });

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

  function validateItem() {
    fetch(`${IP}/validate-item`, {
      method: "POST",
      body: JSON.stringify({
        ref: refInput.value,
        qty: parseInt(inputQtyDiv.innerText),
      }),
    })
      .then(
        (response) => {
          response.json();
        },
        (e) => {
          setBadgeE();
          console.error(e);
        },
      )
      .then((json) => {
        if (json.exists) {
          if (json.stock >= parseInt(inputQtyDiv.innerText)) {
            setBadgeT();
          } else {
            setBadgeF(json.stock);
          }
        } else {
          setBadgeE();
        }
      });
  }

  pButton.addEventListener("click", () => {
    inputQtyDiv.innerText = `${parseInt(inputQtyDiv.innerText) + 1}`;
    validateItem();
  });

  mButton.addEventListener("click", () => {
    const prevText = inputQtyDiv.innerText;
    inputQtyDiv.innerText = `${prevText > 0 ? parseInt(inputQtyDiv.innerText) - 1 : prevText}`;
    validateItem();
  });

  // FIXME: delete this
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

  refInput.addEventListener("change", () => {
    refInput.value = refInput.value.trim();
    refInput.value = refInput.value.toUpperCase();
    validateItem();
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

/** NOTE: add-item-button and CR cause crEvent */
document.getElementById("add-item-button").addEventListener("click", crEvent);

document.addEventListener("keydown", function onEvent(event) {
  if (event.key === "Enter") {
    crEvent();
  }
});

/** INFO: Submit button and final validation */
document.getElementById("submit-sale-button").addEventListener("click", () => {
  const refContainers = document.getElementsByClassName("item-container");
  let valid = true;
  if (refContainers.length) {
    for (const item of refContainers) {
      // qty-badge-container mdiy-blank
      if (
        !item
          .getElementsByClassName("qty-badge-container")[0]
          .classList.contains("mdiy-true")
      ) {
        valid = false;
      }
    }

    if (valid) {
      alert("Venta válida!");
    } else {
      alert("Existen artículos inválidos!");
    }
  } else {
    alert("No hay artículos!");
  }
});
