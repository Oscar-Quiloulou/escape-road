//--------------------------------------------------
// CONFIG
//--------------------------------------------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

let keys = {};
let stars = 0;

// load images
const playerImg = new Image(); playerImg.src = "asset/player.png";
const policeImg = new Image(); policeImg.src = "asset/police.png";
const explosionImg = new Image(); explosionImg.src = "asset/explosion.png";

//--------------------------------------------------
// PLAYER (monde infini)
//--------------------------------------------------
const player = {
    x: 0,
    y: 0,
    speed: 0,
    maxSpeed: 6,
    acceleration: 0.2,
    braking: 0.15,
    friction: 0.05,
    angle: 0,
    width: 48,
    height: 24
};

//--------------------------------------------------
// POLICE
//--------------------------------------------------
let policeCars = [];

function spawnPolice() {
    policeCars.push({
        x: player.x + (Math.random() * 1800 - 900),
        y: player.y + (Math.random() * 1200 - 600),
        speed: 0,
        maxSpeed: 5,
        angle: 0,
        width: 48,
        height: 24,
        destroyed: false
    });
}

// initial police
for (let i = 0; i < 3; i++) spawnPolice();

//--------------------------------------------------
// CONTROLS
//--------------------------------------------------
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

//--------------------------------------------------
// UPDATE PLAYER
//--------------------------------------------------
function updatePlayer() {
    if (keys["ArrowUp"]) player.speed += player.acceleration;
    if (keys["ArrowDown"]) player.speed -= player.braking;
    if (Math.abs(player.speed) > 0.3) {
        if (keys["ArrowLeft"]) player.angle -= 0.06;
        if (keys["ArrowRight"]) player.angle += 0.06;
    }

    if (player.speed > player.maxSpeed) player.speed = player.maxSpeed;
    if (player.speed < -2) player.speed = -2;
    if (!keys["ArrowUp"] && !keys["ArrowDown"]) player.speed *= 1 - player.friction;

    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;
}

//--------------------------------------------------
// UPDATE POLICE
//--------------------------------------------------
function updatePolice() {
    policeCars.forEach(c => {
        if (c.destroyed) return;
        let ang = Math.atan2(player.y - c.y, player.x - c.x);
        c.angle += (ang - c.angle) * 0.08;

        // avoidance
        policeCars.forEach(o => {
            if (c !== o && !o.destroyed) {
                let d = Math.hypot(o.x - c.x, o.y - c.y);
                if (d < 70) c.angle += 0.2;
            }
        });

        c.speed += 0.12;
        if (c.speed > c.maxSpeed) c.speed = c.maxSpeed;

        c.x += Math.cos(c.angle) * c.speed;
        c.y += Math.sin(c.angle) * c.speed;
    });

    // collisions police/police (fort choc)
    policeCars.forEach(c1 => policeCars.forEach(c2 => {
        if (c1 === c2 || c1.destroyed || c2.destroyed) return;
        let d = Math.hypot(c2.x - c1.x, c2.y - c1.y);
        if (d < 28 && (c1.speed + c2.speed) > 8) {
            c1.destroyed = true;
            c2.destroyed = true;
            stars++;
        }
    }));

    // intensité police selon étoiles
    let minPolice = Math.floor(3 + stars * 2.5);
    policeCars = policeCars.filter(c => !c.destroyed);
    while (policeCars.length < minPolice) spawnPolice();
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

    // player always at center
    drawRotatedImage(playerImg, canvas.width / 2, canvas.height / 2, player.angle, player.width, player.height);

    // police relative to player
    policeCars.forEach(c => {
        let dx = c.x - player.x + canvas.width / 2;
        let dy = c.y - player.y + canvas.height / 2;
        if (!c.destroyed) drawRotatedImage(policeImg, dx, dy, c.angle, c.width, c.height);
        else drawRotatedImage(explosionImg, dx, dy, 0, 42, 42);
    });

    ctx.fillStyle = "yellow";
    ctx.font = "24px Arial";
    ctx.fillText("★ " + stars, 15, 35);
}

//--------------------------------------------------
// MOBILE BUTTONS
//--------------------------------------------------
function bindMobileButton(id, key) {
    let b = document.getElementById(id);
    if (!b) return;
    b.addEventListener("touchstart", e => { e.preventDefault(); keys[key] = true; });
    b.addEventListener("touchend", e => { e.preventDefault(); keys[key] = false; });
}
bindMobileButton("btnLeft", "ArrowLeft");
bindMobileButton("btnRight", "ArrowRight");
bindMobileButton("btnUp", "ArrowUp");
bindMobileButton("btnDown", "ArrowDown");

//--------------------------------------------------
function update() {
    updatePlayer();
    updatePolice();
    draw();
    requestAnimationFrame(update);
}
update();
