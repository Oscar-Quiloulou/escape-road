// user.js

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

document.getElementById("uid").textContent = id;

let db = loadDB();
let account = getOrCreateAccount(db, id);

function updateBalance(amount) {
    account.balance += amount;
    account.history.push({
        type: amount > 0 ? "Ajout" : "Retrait",
        amount: amount,
        date: new Date().toLocaleString()
    });
    db[id] = account;
    saveDB(db);
    render();
}

function render() {
    document.getElementById("balance").textContent = account.balance;

    const hist = document.getElementById("history");
    hist.innerHTML = "";

    account.history.slice().reverse().forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.date} — ${entry.type} ${entry.amount} HF`;
        hist.appendChild(li);
    });
}

render();
