// qr.js

let qrInstance = null;

function generate() {
    const input = document.getElementById("userId");
    const id = input.value.trim();

    if (!id) {
        alert("Entre un ID utilisateur.");
        return;
    }

    const container = document.getElementById("qrcode");
    container.innerHTML = "";

    // Format du contenu du QR
    const content = "HF:USER:" + id;

    qrInstance = new QRCode(container, {
        text: content,
        width: 256,
        height: 256
    });
}
