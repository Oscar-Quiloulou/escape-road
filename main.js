//--------------------------------------------------
// CONFIG
//--------------------------------------------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 600;

let keys = {};
let stars = 0;

// Load images
const playerImg = new Image();
playerImg.src = "asset/player.png";

const policeImg = new Image();
policeImg.src = "asset/police.png";

const explosionImg = new Image();
explosionImg.src = "asset/explosion.png";

//--------------------------------------------------
// PLAYER
//--------------------------------------------------
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 0,
    maxSpeed: 6,
    acceleration: 0.2,
    braking: 0.15,
    friction: 0.05,
    angle: 0,             // rotation angle
    width: 48,
    height: 24
};

//--------------------------------------------------
// POLICE
//--------------------------------------------------
let policeCars = [];

function spawnPolice() {
    policeCars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0,
        maxSpeed: 5,
        angle: 0,
        width: 48,
        height: 24,
        destroyed: false
    });
}

// spawn initial unit
for (let i = 0; i < 5; i++) spawnPolice();

//--------------------------------------------------
// CONTROLS
//--------------------------------------------------
document.addEventListener("keydown", e => (keys[e.key] = true));
document.addEventListener("keyup", e => (keys[e.key] = false));

//--------------------------------------------------
// UPDATE PLAYER
//--------------------------------------------------
function updatePlayer() {
    // accelerate / brake
    if (keys["ArrowUp"]) player.speed += player.acceleration;
    if (keys["ArrowDown"]) player.speed -= player.braking;

    // turn only while moving
    if (Math.abs(player.speed) > 0.2) {
        if (keys["ArrowLeft"]) player.angle -= 0.06;
        if (keys["ArrowRight"]) player.angle += 0.06;
    }

    // speed limit and friction
    if (player.speed > player.maxSpeed) player.speed = player.maxSpeed;
    if (player.speed < -2) player.speed = -2;
    if (!keys["ArrowUp"] && !keys["ArrowDown"]) {
        player.speed *= 1 - player.friction;
    }

    // apply movement
    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;

    // world wrapping
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;
}

//--------------------------------------------------
// UPDATE POLICE
//--------------------------------------------------
function updatePolice() {
    policeCars.forEach((c1, idx) => {
        if (c1.destroyed) return;

        // target angle aiming player
        let angleToPlayer = Math.atan2(player.y - c1.y, player.x - c1.x);
        c1.angle += (angleToPlayer - c1.angle) * 0.08;

        // avoid other police collisions
        policeCars.forEach(c2 => {
            if (c1 === c2 || c2.destroyed) return;
            let dist = Math.hypot(c2.x - c1.x, c2.y - c1.y);
            if (dist < 60) {
                c1.angle += 0.25; // avoidance steering
            }
        });

        // acceleration
        c1.speed += 0.12;
        if (c1.speed > c1.maxSpeed) c1.speed = c1.maxSpeed;

        c1.x += Math.cos(c1.angle) * c1.speed;
        c1.y += Math.sin(c1.angle) * c1.speed;

        // world wrapping
        if (c1.x < 0) c1.x = canvas.width;
        if (c1.x > canvas.width) c1.x = 0;
        if (c1.y < 0) c1.y = canvas.height;
        if (c1.y > canvas.height) c1.y = 0;
    });

    // collisions police <-> police (only if impact is strong)
    policeCars.forEach(c1 => policeCars.forEach(c2 => {
        if (c1 === c2 || c1.destroyed || c2.destroyed) return;
        let dist = Math.hypot(c2.x - c1.x, c2.y - c1.y);
        if (dist < 28 && (c1.speed + c2.speed) > 8) {
            c1.destroyed = true;
            c2.destroyed = true;
            stars++;
        }
    }));

    // maintain minimum police count
    policeCars = policeCars.filter(c => !c.destroyed);
    while (policeCars.length < 3) spawnPolice();
}

//--------------------------------------------------
// DRAW
//--------------------------------------------------
function drawRotatedImage(img, x, y, angle, w, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
}

function draw() {
    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // player
    drawRotatedImage(playerImg, player.x, player.y, player.angle, player.width, player.height);

    // police
    policeCars.forEach(c => {
        if (!c.destroyed) drawRotatedImage(policeImg, c.x, c.y, c.angle, c.width, c.height);
        else drawRotatedImage(explosionImg, c.x, c.y, 0, 42, 42);
    });

    // UI
    ctx.fillStyle = "yellow";
    ctx.font = "24px Arial";
    ctx.fillText("★ " + stars, 15, 35);
}

//--------------------------------------------------
// MAIN LOOP
//--------------------------------------------------
function update() {
    updatePlayer();
    updatePolice();
    draw();
    requestAnimationFrame(update);
}

update();
