const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 400, y: 500, size: 20, speed: 3 };
let police = [
    { x: 200, y: 100, size: 20, speed: 2, alive: true },
    { x: 600, y: 100, size: 20, speed: 2, alive: true }
];
let obstacles = [];
let items = [];
let stars = 0;
let level = 1;

// Génération d'obstacles aléatoires
function generateObstacle() {
    const x = Math.random() * (canvas.width - 50);
    const y = -20;
    obstacles.push({ x, y, width: 50, height: 20 });
}

// Détruire obstacle si vitesse suffisante
function checkObstacleCollision(o) {
    const hit = player.x < o.x + o.width && player.x + player.size > o.x &&
                player.y < o.y + o.height && player.y + player.size > o.y;
    if(hit && player.speed >= getCurrentCar().destroyObstacleSpeed) {
        return true; // obstacle détruit
    }
    return false;
}

// Police se déplace vers joueur
function updatePolice() {
    for(let i = 0; i < police.length; i++) {
        let p = police[i];
        if(!p.alive) continue;

        // Mouvement
        if(p.x < player.x) p.x += p.speed;
        if(p.x > player.x) p.x -= p.speed;
        if(p.y < player.y) p.y += p.speed;
        if(p.y > player.y) p.y -= p.speed;

        // Vérifier collision entre police
        for(let j = i+1; j < police.length; j++) {
            let q = police[j];
            if(!q.alive) continue;
            if(collide(p, q)) {
                p.alive = false;
                q.alive = false;
                console.log("Police détruite par collision !");
            }
        }
    }
}

// Détection collision simple
function collide(a, b) {
    return a.x < b.x + b.size && a.x + a.size > b.x &&
           a.y < b.y + b.size && a.y + a.size > b.y;
}

// Récupère voiture actuelle en fonction du niveau
function getCurrentCar() {
    return cars[level - 1];
}

// Montée de niveau
function levelUp() {
    level += 1;
    player.speed = getCurrentCar().speed;
    console.log("Nouveau niveau ! Voiture plus rapide !");
}

// Boucle de jeu
function update() {
    obstacles = obstacles.filter(o => !checkObstacleCollision(o));
    updatePolice();

    draw();
}

// Dessin
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // joueur
    ctx.fillStyle = getCurrentCar().color;
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // police
    ctx.fillStyle = 'blue';
    police.forEach(p => {
        if(p.alive) ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    // obstacles
    ctx.fillStyle = 'gray';
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.width, o.height));

    // étoiles et infos
    ctx.fillStyle = 'white';
    ctx.fillText(`Étoiles: ${stars} | Niveau: ${level}`, 10, 20);
}

// Contrôles
document.addEventListener('keydown', e => {
    if(e.key === 'ArrowUp') player.y -= player.speed;
    if(e.key === 'ArrowDown') player.y += player.speed;
    if(e.key === 'ArrowLeft') player.x -= player.speed;
    if(e.key === 'ArrowRight') player.x += player.speed;
});

// Boucle
setInterval(() => {
    if(Math.random() < 0.03) generateObstacle();
    update();
}, 50);
