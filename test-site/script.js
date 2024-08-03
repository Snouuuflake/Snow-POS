const outputSpan = document.getElementById("test-text");
const hiButton = document.getElementById("send-hello");
const qrButton = document.getElementById("send-req-qr");

hiButton.addEventListener("click", () => {
  window.electronAPI.invokeHello().then((response) => {
    console.log(response);
  });
});

qrButton.addEventListener("click", () => {
  window.electronAPI.invokeQR().then((response) => {
    console.log(response);
    document.body.innerHTML += `<img src="${response}" alt="QR Code"/>`
  });
});

window.electronAPI.onTestMessage((value) => {
  outputSpan.innerHTML = value;
});
