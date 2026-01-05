// scanner.js

const qr = new Html5Qrcode("reader");

qr.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decoded) => {
        // decoded peut être un ID simple ou un format "HF:USER:123"
        let id = decoded;

        // Si tu veux forcer un format, tu peux parser ici
        // Exemple: "HF:USER:12345" → garder "12345"
        if (decoded.startsWith("HF:USER:")) {
            id = decoded.split("HF:USER:")[1];
        }

        window.location.href = "user.html?id=" + encodeURIComponent(id);
    }
);
