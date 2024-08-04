const outputSpan = document.getElementById("test-text");
const qrButton = document.getElementById("send-req-qr");

qrButton.addEventListener("click", () => {
  window.electronAPI.invokeQR().then((response) => {
    let qrImg = document.getElementById("qr-img");
    if (!qrImg) {
      qrImg = document.createElement("img");
      qrImg.id = "qr-img";
      document.body.appendChild(qrImg);
    }
    console.log(response);
    qrImg.src = response;
  });
});

window.electronAPI.onTestMessage((value) => {
  outputSpan.innerText = value;
  // document.getElementsByTagName("h1")[0].innerHTML = value;
});

