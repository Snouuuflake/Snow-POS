/**
 * @parm {Object} parentElement
 * @param {string} className
 * @returns The first child of parentElement with className
 */
function gebcn(parentElement, className) {
  return parentElement.getElementsByClassName(className)[0];
}

//   <section class="item-container">
//     <div class="mdiy-textfield-filled ref-input">
//       <input type="text" class="_mdiy-textfield-filled-input" placeholder="referencia"></input>
//       <button class="_mdiy-textfield-filled-button">
//         <i class="bi bi-x _mdiy-textfield-filled-icon"></i>
//       </button>
//     </div>
//     <div class="qty-container">
//       <div class="mdiy-pm">
//         <button class="_mdiy-pm-p"><i class="bi bi-plus"></i></button>
//         <button class="_mdiy-pm-m"><i class="bi bi-dash"></i></button>
//       </div>
//       <div class="input-qty-container">
//         <div class="input-qty">777</div>
//       </div>
//       <div class="qty-badge-container mdiy-error">
//         <div class="qty-badge-limit">7764</div>
//       </div>
//     </div>
//   </section>

document.getElementById("BUTTON").addEventListener("click", () => {
  const newSection = document.createElement("section");
  newSection.classList.add("item-container");
  newSection.innerHTML = `
    <div class="mdiy-textfield-filled ref-input">
       <input type="text" class="_mdiy-textfield-filled-input" placeholder="Referencia"></input>
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
       <div class="qty-badge-container mdiy-error">
         <!-- <div class="qty-badge-limit">7764</div> -->
       </div>
     </div> `;
  const pButton = gebcn(newSection, "_mdiy-pm-p");
  const mButton = gebcn(newSection, "_mdiy-pm-m");
  const inputQtyDiv = gebcn(newSection, "input-qty");
  const badgeContainer = gebcn(newSection, "qty-badge-container");

  pButton.addEventListener("click", () => {
    inputQtyDiv.innerText = `${parseInt(inputQtyDiv.innerText) + 1}`;
  });

  mButton.addEventListener("click", () => {
    const prevText = inputQtyDiv.innerText;
    inputQtyDiv.innerText = `${prevText > 0 ? parseInt(inputQtyDiv.innerText) - 1 : prevText}`;
  });

  document.body.appendChild(newSection);
});
