const myForm = document.getElementById("new-item-form");

function priceToInt(inputString) {
  const splitString = inputString.split(".");
  const n = parseInt(splitString[0]);
  let d = 0;

  if (splitString[1]) {
    if (splitString[1].length == 1) {
      d = parseInt(splitString[1]) * 10;
    } else {
      d = parseInt(splitString[1]);
    }
  }

  return (n * 100) + d;
}

myForm.addEventListener("submit", (e) => {
  e.preventDefault();
  itemData = {
    name: document.getElementById("ref").value,
    desc: document.getElementById("desc").value,
    qty: parseInt(document.getElementById("qty").value),
    price: priceToInt(document.getElementById("price").value)
  };

  console.log(itemData);


  // window.electronAPI.addDBItem({
  //   name: document.getElementById("name").value,
  //   desc: document.getElementById("desc").value,
  //   qty: parseInt(document.getElementById("qty").value),
  //   price: document.getElementById("price").value,
  // }).then((res) => {});
  // window.close();
});
