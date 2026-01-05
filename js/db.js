// db.js

function loadDB() {
    return JSON.parse(localStorage.getItem("hf-db") || "{}");
}

function saveDB(db) {
    localStorage.setItem("hf-db", JSON.stringify(db));
}

function getOrCreateAccount(db, id) {
    if (!db[id]) {
        db[id] = { balance: 0, history: [] };
        saveDB(db);
    }
    return db[id];
}
