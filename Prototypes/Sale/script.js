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
  newSection.innerHTML = `  <div class="mdiy-textfield-filled ref-input">
       <input type="text" class="_mdiy-textfield-filled-input" placeholder="referencia"></input>
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
         <div class="input-qty">777</div>
       </div>
       <div class="qty-badge-container mdiy-error">
         <div class="qty-badge-limit">7764</div>
       </div>
     </div> `;
  document.body.appendChild(newSection);
});
