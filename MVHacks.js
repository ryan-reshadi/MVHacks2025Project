const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const keys = {};
const objects = [];
const waterProjectiles = [];
const gravity = 0.4; // Gravity force
const platforms = []; // Array to hold platforms
const fires = [];
const fireCrackles = new Audio("fireCrackle.mp3");
const death = new Audio();
death.src = "./playerDeath.mp3";
const pouringWater = new Audio("pouringWater.mp3");
const infoText = document.getElementById("infoText");

const Player = {
    x: 40,
    y: 20,
    size: 20,
    speed: 5,
    velocityY: 0, // Vertical velocity
    health: 3,
    score: 0,
    onGround: false,
    direction: "up",
    move: function (dx) {
        this.x += dx;
    },
    update: function (fire) {
        if (!this.onGround) {
            this.velocityY += gravity; // Apply gravity
        }
        this.y += this.velocityY;

        // Check collisions with platforms
        this.onGround = false;
        for (const platform of platforms) {
            if (
                this.x < platform.x + platform.width &&
                this.x + this.size > platform.x &&
                this.y + this.size > platform.y &&
                this.y + this.size <= platform.y + platform.length
            ) {
                this.y = platform.y - this.size; // Place player on top of the platform
                this.velocityY = 0; // Stop falling
                this.onGround = true;
                break;
            }
        }
    },
    draw: function () {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    },
    jump: function () {
        if (this.onGround) {
            this.velocityY = -10;
        }
    }
};
function Water(Player) {
    this.x = Player.x;
    this.y = Player.y;
    this.speed = 10;
    this.size = 40;
    this.draw = function () {
        const image = new Image();
        image.src = 'water.webp';
        ctx.drawImage(image, x, y, this.size, this.size);
    }
    this.collide = function (object, waterArray){
        if (
            this.x < object.x + object.size &&
            this.x + this.size > object.x &&
            this.y + this.size > object.y &&
            this.y + this.size <= object.y + object.size
        ){
            this.y = -60;
            this.speed = 0;

        }
    }
}
function Fire(x, y) {
    this.x = x;
    this.y = y;
    this.size = 50;
    this.draw = function () {
        const image = new Image();
        image.src = 'fire.webp';
        ctx.drawImage(image, x, y, this.size, this.size);
    },
        this.die = function () {
            this.y = this.y + 1800;
        }
    this.playerCollide = function (player) {
        if (
            this.x < player.x + player.size &&
            this.x + this.size > player.x &&
            this.y + this.size > player.y &&
            this.y + this.size <= player.y + player.size
        ) {
            return true;
        }
    }
    this.waterCollide = function (water) {
        if (
            this.x < water.x + water.size &&
            this.x + this.size > water.x &&
            this.y + this.size > water.y &&
            this.y + this.size <= water.y + water.size
        ) {
            this.die();
        }
    }
}

function Platform(x, y, width, length, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.length = length;
    this.color = color;
    this.draw = function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.length);
    };
}
objects.push(Player);

// Create platforms
platforms.push(new Platform(50, 300, 1000, 10, 'grey'));
platforms.push(new Platform(200, 400, 150, 10, 'grey'));

// Create fires
fires.push(new Fire(100, 150));
fires.push(new Fire(200, 200));

for (const fire of fires) {
    objects.push(fire);
}
for (const platform in platforms){
    objects.push(platform);
}
const BGImage = new Image(1400, 850);
BGImage.src = 'forest.webp';

// function playDe

function gameLoop() {
    ctx.clearRect(0, 0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(BGImage, 0, 0, 1400, 850);

    // Update and draw player
    Player.update();
    Player.draw();

    infoText.innerText = "Health: " + Player.health + "\t|\t Score: " + Player.score;

    if (Player.y >= canvas.getAttribute("height")) {
        Player.health = 0;
    }
    if (Player.health <= 0) {
        Player.x = 40;
        Player.y = 20;
        Player.velocityY = 0;
        Player.health = 3;
        death.play();

    }
    // Draw platforms
    for (const platform of platforms) {
        platform.draw();
    }
    for (const fire of fires) {
        fire.draw();
        if (fire.playerCollide(Player)) {
            // Player.health -= 1;
            // Fire deals one damage every two seconds if the player is in the fire
            const dp2s = setTimeout(function () {
                if (fire.playerCollide(Player)) {
                    this.health = this.health - 1;
                }
            }, 2000);
        }
    }

    requestAnimationFrame(gameLoop);
}

// Handle keyboard input
document.addEventListener('keypress', (event) => {
    // if (event.key === 'a') {
    //     Player.move(-Player.speed);
    // } else if (event.key === 'd') {
    //     Player.move(Player.speed);
    // }
    // if (event.key === " "){
    //     Player.jump();
    // }

    // if (event.key === 'ArrowLeft'){
    //     Player.direction = "left";
    // }
    // if (event.key === "ArrowRight"){
    //     Player.direction = "right";
    // }
    // if (event.key === "ArrowLeft"){
    //     Player.direction = "left";
    // }
    // if (event.key === "ArrowRight"){
    //     Player.direction = "right";
    // }
    // Handle keydown and keyup events
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key] = false;

    });
    
    if (keys['a']) {
        Player.move(-Player.speed);
    }
    if (keys['d']) {
        Player.move(Player.speed);
    }
    if (keys['w']) {
        Player.jump();
    }
    if (keys['ArrowLeft']) {
        Player.direction = "left";
    }
    if (keys['ArrowRight']) {
        Player.direction = "right";
    }
    if (Keys[" "]){
        waterProjectiles.push(new Water(Player));
        pouringWater.play();
    }
    if (Player.x>= canvas.getAttribute("width")-15){
        for (object in objects){
            object.x = object.x - 10;
        }
    }
    if (Player.x<= 0){
        for (object in objects){
            object.x = object.x + 10;
        }
    }
});
// Start the game loop
BGImage.onload = function () {
    gameLoop();
};