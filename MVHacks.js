const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const keys = {};
const objects = [];
const waterProjectiles = [];
const gravity = 0.4; // Gravity force
const platforms = []; // Array to hold platforms
const fires = []; //array to hold fires
const fireCrackles = new Audio("./fireCrackle.mp3");
const death = new Audio();
death.volume = 1.0;
death.src = "./playerDeath.mp3";
const pouringWater = new Audio("./pouringWater.mp3");
const infoText = document.getElementById("infoText");
const deleteFromArray = function (target, array) {
    returnArray = [];
    for (i of array) {
        if (i !== target) {
            returnArray.push(i);
        }
    }
    return returnArray;
} // Function to delete an element from an array, used for waterBall elements

const Player = {
    x: 40,
    y: 20,
    size: 20,
    speed: 5,
    velocityY: 0, // Vertical velocity
    score: 0,
    onGround: false,
    direction: "up",
    damageable: true,
    die: function () {
        Player.x = 40;
        Player.y = 20;
        Player.velocityY = 0;
        death.play();
    },
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

// player1 = new Player();
// water1 = new Water(Player);
// water1.x= 20;
// console.log(water1.x);
function Water(x, y, direction) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.size = 25;
    this.direction = direction;
    this.draw = function () {
        const image = new Image();
        image.src = 'waterBall.webp';
        ctx.drawImage(image, this.x, this.y, this.size, this.size);
    }
    this.collide = function (object) {
        if (
            this.x < object.x + object.size &&
            this.x + this.size > object.x &&
            this.y + this.size > object.y &&
            this.y + this.size <= object.y + object.size
        ) {

            return true;
        }
    },
        this.die = function (waterProjectiles) {
            this.y = -60;
            this.speed = 0;
        }
    this.tick = function () {
        if (this.direction === "left") {
            this.x = this.x - this.speed;
        }
        if (this.direction === "right") {
            this.x = this.x + this.speed;
        }
        if (this.direction === "up") {
            this.y = this.y - this.speed;
        }
        if (this.direction === "down") {
            this.y = this.y + this.speed;
        }
        if (this.y < 0 || this.y > canvas.getAttribute("height") || this.x < 0 || this.x > canvas.getAttribute("width")) {
            this.die();
        }
    }
}
function Fire(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
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
            water.collide();
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
platforms.push(new Platform(50, 300, 1300, 10, 'grey'));
platforms.push(new Platform(200, 400, 150, 10, 'grey'));

// Create fires
fires.push(new Fire(100, 150));
fires.push(new Fire(200, 250));

for (const fire of fires) {
    objects.push(fire);
}
for (const platform in platforms) {
    objects.push(platform);
}
const BGImage = new Image(1400, 850);
BGImage.src = 'forest.webp';


function gameLoop() {
    ctx.clearRect(0, 0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(BGImage, 0, 0, 1400, 850);

    // Update and draw player
    Player.update();
    Player.draw();

    infoText.innerText = "Score: " + Player.score;

    if (Player.y >= canvas.getAttribute("height")) {
        Player.die()
    }
    // Draw platforms
    for (const platform of platforms) {
        platform.draw();
    }
    for (const fire of fires) {
        fire.draw();
        if (fire.playerCollide(Player) && Player.damageable) {
            // Fire kills player
            Player.die();
        }
    }
    for (const water of waterProjectiles) {
        water.draw();
        water.tick();
        for (const fire of fires) {
            if (water.collide(fire)) {
                water.die();
                deleteFromArray(water, waterProjectiles);
                Player.score = Player.score + 1;
                fire.die();
                deleteFromArray(fire,fires);
            }
        }
        for (const platform of platforms) {
            if (water.collide(platform)) {
                water.die()
                deleteFromArray(water, waterProjectiles);
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

// Handle keyboard input
document.addEventListener('keypress', (event) => {

    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key] = false;

    });
    // if(keys['d'] && keys ['w']){
    //     Player.jump();
    //     Player.move(Player.speed);
    // }
    // if(keys['a'] && keys ['w']){
    //     Player.jump();
    //     Player.move(-Player.speed);
    // }
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
    if (keys[" "]) {
        const water = new Water(Player.x, Player.y, Player.direction);
        console.log(Player.x);
        waterProjectiles.push(water);
        console.log(water.x);
        pouringWater.play();
    }
    if (Player.x >= canvas.getAttribute("width") - 15) {
        for (object in objects) {
            object.x = object.x - 10;
        }
    }
    if (Player.x <= 0) {
        for (object in objects) {
            object.x = object.x + 10;
        }
    }
});
// Start the game loop
BGImage.onload = function () {
    gameLoop();
};