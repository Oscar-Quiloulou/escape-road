// === CANVAS ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// === CONSTANTES TAILLE ===
const PLAYER_WIDTH = 50;  // largeur de la voiture
const PLAYER_HEIGHT = 30; // longueur de la voiture
const POLICE_SIZE = 40;
const STAR_SIZE = 25;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 20;

// === VARIABLES JEU ===
let cars = [];
let player = {
    x: 400,
    y: 500,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: 0,
    angle: 0,
    maxSpeed: 5,
    acceleration: 0.2,
    deceleration: 0.1
};
let police = [
    { x: 200, y: 100, size: POLICE_SIZE, speed: 2, alive: true },
    { x: 600, y: 100, size: POLICE_SIZE, speed: 2, alive: true }
];
let obstacles = [];
let items = [];
let stars = 0;
let level = 1;

// === CHARGER IMAGES ===
const imgPlayer = new Image();
imgPlayer.src = 'assets/player.png';
const imgPolice = new Image();
imgPolice.src = 'assets/police.png';
const imgStar = new Image();
imgStar.src = 'assets/star.png';

// === GESTION TOUCHES ===
let keys = {};
document.addEventListener('keydown', e => { keys[e.key] = true; });
document.addEventListener('keyup', e => { keys[e.key] = false; });

// === CHARGER JSON VOITURES ===
fetch('cars.json')
    .then(res => res.json())
    .then(data => {
        cars = data.cars;
        player.maxSpeed = cars[0].speed;
        startGame();
    })
    .catch(err => {
        console.error("Erreur chargement cars.json", err);
        cars = [{ color: 'red', speed: 3, destroyObstacleSpeed: 5 }];
        startGame();
    });

// === DEMARRER JEU ===
function startGame() {
    setInterval(() => {
        if (Math.random() < 0.03) generateObstacle();
        if (Math.random() < 0.02) generateItem();
        update();
    }, 50);
}

// === GENERER OBSTACLES ===
function generateObstacle() {
    const x = Math.random() * (canvas.width - OBSTACLE_WIDTH);
    const y = -OBSTACLE_HEIGHT;
    obstacles.push({ x, y, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT });
}

// === GENERER ÉTOILES ===
function generateItem() {
    const x = Math.random() * (canvas.width - STAR_SIZE);
    const y = -STAR_SIZE;
    items.push({ x, y, size: STAR_SIZE, type: 'star' });
}

// === DETECTION COLLISION OBSTACLE ===
function checkObstacleCollision(o) {
    const hit = player.x < o.x + o.width && player.x + player.width > o.x &&
                player.y < o.y + o.height && player.y + player.height > o.y;
    if (hit && player.speed >= getCurrentCar().destroyObstacleSpeed) {
        return true; // obstacle détruit
    }
    return false;
}

// === UPDATE POLICE ===
function updatePolice() {
    for (let i = 0; i < police.length; i++) {
        let p = police[i];
        if (!p.alive) continue;

        if (p.x < player.x) p.x += p.speed;
        if (p.x > player.x) p.x -= p.speed;
        if (p.y < player.y) p.y += p.speed;
        if (p.y > player.y) p.y -= p.speed;

        // collision entre police
        for (let j = i + 1; j < police.length; j++) {
            let q = police[j];
            if (!q.alive) continue;
            if (collide(p, q)) {
                p.alive = false;
                q.alive = false;
                console.log("Police détruite !");
            }
        }
    }
}

// === COLLISION GENERALE ===
function collide(a, b) {
    return a.x < b.x + b.size && a.x + a.size > b.x &&
           a.y < b.y + b.size && a.y + a.size > b.y;
}

// === VOITURE ACTUELLE ===
function getCurrentCar() {
    if (!cars || cars.length === 0) return { color: 'red', speed: 3, destroyObstacleSpeed: 5 };
    if (level - 1 >= cars.length) level = cars.length;
    return cars[level - 1];
}

// === MONTER NIVEAU ===
function levelUp() {
    level += 1;
    player.maxSpeed = getCurrentCar().speed;
    console.log("Nouveau niveau ! Voiture plus rapide !");
}

// === UPDATE JEU ===
function update() {
    // === CONTROLES VEHICULE ===
    if (keys['ArrowLeft']) player.angle -= 0.05;
    if (keys['ArrowRight']) player.angle += 0.05;

    if (keys['ArrowUp']) {
        player.speed += player.acceleration;
        if (player.speed > player.maxSpeed) player.speed = player.maxSpeed;
    } else if (keys['ArrowDown']) {
        player.speed -= player.acceleration;
        if (player.speed < -player.maxSpeed / 2) player.speed = -player.maxSpeed / 2;
    } else {
        // Décélération naturelle
        if (player.speed > 0) player.speed -= player.deceleration;
        if (player.speed < 0) player.speed += player.deceleration;
    }

    // Déplacement selon angle
    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;

    // === COLLISION OBSTACLES ===
    obstacles = obstacles.filter(o => !checkObstacleCollision(o));

    // === POLICE ===
    updatePolice();

    // === COLLISION ÉTOILES ===
    items = items.filter(i => {
        const hit = player.x < i.x + i.size && player.x + player.width > i.x &&
                    player.y < i.y + i.size && player.y + player.height > i.y;
        if (hit) {
            stars += 1;
            if (stars % 5 === 0) levelUp();
        }
        return !hit;
    });

    draw();
}

// === DESSIN ===
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // obstacles
    ctx.fillStyle = 'gray';
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.width, o.height));

    // étoiles
    items.forEach(i => {
        if (i.type === 'star') ctx.drawImage(imgStar, i.x, i.y, STAR_SIZE, STAR_SIZE);
    });

    // joueur avec rotation
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.angle);
    ctx.drawImage(imgPlayer, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();

    // police
    police.forEach(p => {
        if (p.alive) ctx.drawImage(imgPolice, p.x, p.y, POLICE_SIZE, POLICE_SIZE);
    });

    // infos
    ctx.fillStyle = 'white';
    ctx.fillText(`Étoiles: ${stars} | Niveau: ${level}`, 10, 20);
}
