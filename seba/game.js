// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Original game dimensions
const GAME_WIDTH = 1500;
const GAME_HEIGHT = 1000;
let WIDTH = GAME_WIDTH;
let HEIGHT = GAME_HEIGHT;
let currentScale = 1;
let gameStarted = false;

// Set canvas to viewport size and scale
function resizeCanvas() {
    currentScale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
    canvas.style.width = `${GAME_WIDTH * currentScale}px`;
    canvas.style.height = `${GAME_HEIGHT * currentScale}px`;
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    // Center the canvas
    canvas.style.position = 'fixed';
    const leftOffset = (window.innerWidth - GAME_WIDTH * currentScale) / 2;
    const topOffset = (window.innerHeight - GAME_HEIGHT * currentScale) / 2;
    canvas.style.left = `${leftOffset}px`;
    canvas.style.top = `${topOffset}px`;

    // Store offsets for input translation
    canvas.offsetLeft = leftOffset;
    canvas.offsetTop = topOffset;

    // Redraw menu if game hasn't started
    if (!gameStarted) {
        startScreen();
    }
}

// Initial resize
resizeCanvas();

// Add resize listener
window.addEventListener('resize', resizeCanvas);

// Prevent scrolling without breaking the game
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

// Translate mouse coordinates to game coordinates
function translateCoordinates(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / currentScale;
    const y = (clientY - rect.top) / currentScale;
    return { x, y };
}

// Key state tracking with coordinate translation
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === playerControls.shoot) {
        const mousePos = translateCoordinates(e.clientX, e.clientY);
        // Update any shooting logic here if needed
    }
});
document.addEventListener('keyup', (e) => keys[e.code] = false);

// Mouse event handling
canvas.addEventListener('click', (e) => {
    const pos = translateCoordinates(e.clientX, e.clientY);
    // Use pos.x and pos.y for game logic
});

// Colors
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const RED = '#FF0000';
const BLUE = '#0000FF';
const GREEN = '#00FF00';
const YELLOW = '#FFFF00';
const PURPLE = '#B734EB';
const ORANGE = '#EB8F35';
const CYAN = '#34E5EB';
const BROWN = '#613D2D';
const PINK = '#ED45CE';

// Game constants
const FPS = 60;
let fighters = [];
let powerUps = [];
let powerUpTimer = 0;
let gameStats = {
    wins: 0,
    losses: 0
};

// Player controls
const playerControls = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    up: 'ArrowUp',
    down: 'ArrowDown',
    shoot: 'Space'
};

class Fighter {
    constructor(x, y, color, controls = null, weapon = "default") {
        this.particles = [];
        this.x = x;
        this.y = y;
        this.color = color;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 3;
        this.turnSpeed = 0.05;
        this.radius = 20;
        this.health = 100;
        this.damageTimer = 0;
        this.lastDamageTimerUpdate = 0;
        this.damageAmount = 20;
        this.bullets = [];
        this.cooldown = 0;
        this.controls = controls;
        this.weapon = weapon;
        this.beamActive = false;
        this.lastDirectionUpdate = Date.now();
        this.targetAngle = this.angle;
        this.strongLightningSize = 300;
        this.isMovingForward = false;
        this.lastMoveUpdate = Date.now();
    }

    move() {
        if (this.controls) {
            if (keys[this.controls.left]) this.angle -= this.turnSpeed;
            if (keys[this.controls.right]) this.angle += this.turnSpeed;
            if (keys[this.controls.up]) {
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;
            }
            if (keys[this.controls.down]) {
                this.x -= Math.cos(this.angle) * this.speed;
                this.y -= Math.sin(this.angle) * this.speed;
            }
        }

        // Wrap around screen edges
        this.x = (this.x + WIDTH) % WIDTH;
        this.y = (this.y + HEIGHT) % HEIGHT;
    }

    draw() {
        // Draw fighter triangle
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius/2, -this.radius/2);
        ctx.lineTo(-this.radius/2, this.radius/2);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw());

        // Draw beam if active
        if (this.weapon === "beam" && this.beamActive) {
            this.drawBeam();
        }

        this.drawHealthBar();
    }

    drawHealthBar() {
        const barWidth = 80;
        const barHeight = 8;
        const healthPercentage = this.health / 100;

        // Draw cooldown bar
        const maxCooldown = this.weapon === "missile" ? 70 : 
                           this.weapon === "health stealer" ? 340 : 
                           this.weapon === "default" ? 20 : 
                           this.weapon === "rapid" ? 5 : 
                           this.weapon === "lightning" ? 15 : 20;
        
        const cooldownPercentage = this.cooldown / maxCooldown;

        // Cooldown bar
        ctx.fillStyle = WHITE;
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 22, barWidth, barHeight);
        if (cooldownPercentage > 0) {
            ctx.fillStyle = '#808080';
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 22, barWidth * cooldownPercentage, barHeight);
        }

        // Health bar
        const healthColor = healthPercentage > 0.5 ? GREEN : 
                           healthPercentage > 0.2 ? YELLOW : RED;
        ctx.fillStyle = WHITE;
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth, barHeight);
        ctx.fillStyle = healthColor;
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth * healthPercentage, barHeight);
    }

    shoot() {
        if (this.controls) {  // Player shooting
            if (this.weapon === "missile" && keys[this.controls.shoot] && this.cooldown === 0) {
                const target = this.findNearestTarget();
                if (target) {
                    const bulletDx = Math.cos(this.angle) * 7;
                    const bulletDy = Math.sin(this.angle) * 7;
                    this.bullets.push(new Missile(this.x, this.y, bulletDx, bulletDy, RED, target, this));
                    this.cooldown = 70;
                }
            } else if (this.weapon === "health stealer" && keys[this.controls.shoot] && this.cooldown === 0) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 300, 0, Math.PI * 2);
                ctx.strokeStyle = GREEN;
                ctx.lineWidth = 2;
                ctx.stroke();

                let affectedCount = 0;
                fighters.forEach(fighter => {
                    if (fighter !== this && Math.hypot(fighter.x - this.x, fighter.y - this.y) < 300) {
                        fighter.health -= 9;
                        affectedCount++;
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(fighter.x, fighter.y);
                        ctx.strokeStyle = GREEN;
                        ctx.stroke();
                    }
                });

                if (affectedCount > 0) {
                    const healAmount = 9 * affectedCount;
                    this.health = Math.min(100, this.health + healAmount);
                }

                this.cooldown = 340;
            } else if (this.weapon === "default" && keys[this.controls.shoot] && this.cooldown === 0) {
                const bulletDx = Math.cos(this.angle) * 5;
                const bulletDy = Math.sin(this.angle) * 5;
                this.bullets.push(new Bullet(this.x, this.y, bulletDx, bulletDy, this.color));
                this.cooldown = 20;
            } else if (this.weapon === "rapid" && keys[this.controls.shoot] && this.cooldown === 0) {
                const bulletDx = Math.cos(this.angle) * 5;
                const bulletDy = Math.sin(this.angle) * 5;
                this.bullets.push(new Bullet(this.x, this.y, bulletDx, bulletDy, this.color));
                this.cooldown = 5;
            } else if (this.weapon === "beam") {
                this.beamActive = keys[this.controls.shoot];
            } else if (this.weapon === "lightning" && keys[this.controls.shoot] && this.cooldown === 0) {
                const lightningColor = Math.random() < 0.5 ? CYAN : YELLOW;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 200, 0, Math.PI * 2);
                ctx.strokeStyle = lightningColor;
                ctx.lineWidth = 2;
                ctx.stroke();

                fighters.forEach(fighter => {
                    if (fighter !== this && Math.hypot(fighter.x - this.x, fighter.y - this.y) < 200) {
                        fighter.health -= 15;
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(fighter.x, fighter.y);
                        ctx.strokeStyle = lightningColor;
                        ctx.stroke();
                    }
                });
                this.cooldown = 15;
            } else if (this.weapon === "strong lightning" && keys[this.controls.shoot] && this.cooldown === 0) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.strongLightningSize, 0, Math.PI * 2);
                ctx.strokeStyle = PURPLE;
                ctx.lineWidth = 2;
                ctx.stroke();

                fighters.forEach(fighter => {
                    if (fighter !== this && Math.hypot(fighter.x - this.x, fighter.y - this.y) < this.strongLightningSize) {
                        fighter.health -= 25;
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(fighter.x, fighter.y);
                        ctx.strokeStyle = PURPLE;
                        ctx.stroke();
                    }
                });
                this.cooldown = 20;
            }
        } else {  // Bot shooting
            if (this.weapon === "missile" && this.cooldown === 0) {
                const target = this.findNearestTarget();
                if (target) {
                    const bulletDx = Math.cos(this.angle) * 7;
                    const bulletDy = Math.sin(this.angle) * 7;
                    this.bullets.push(new Missile(this.x, this.y, bulletDx, bulletDy, RED, target, this));
                    this.cooldown = 70;
                }
            } else if (this.weapon === "default" && this.cooldown === 0) {
                const bulletDx = Math.cos(this.angle) * 5;
                const bulletDy = Math.sin(this.angle) * 5;
                this.bullets.push(new Bullet(this.x, this.y, bulletDx, bulletDy, this.color));
                this.cooldown = 20;
            } else if (this.weapon === "rapid" && this.cooldown === 0) {
                const bulletDx = Math.cos(this.angle) * 5;
                const bulletDy = Math.sin(this.angle) * 5;
                this.bullets.push(new Bullet(this.x, this.y, bulletDx, bulletDy, this.color));
                this.cooldown = 5;
            } else if (this.weapon === "beam") {
                this.beamActive = Math.random() < 0.1;  // 10% chance to activate beam
            }
        }
    }

    findNearestTarget() {
        let nearestFighter = null;
        let nearestDistance = Infinity;
        fighters.forEach(fighter => {
            if (fighter !== this && fighter.health > 0) {
                const distance = Math.hypot(this.x - fighter.x, this.y - fighter.y);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestFighter = fighter;
                }
            }
        });
        return nearestFighter;
    }

    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.move();
            return bullet.x >= 0 && bullet.x <= WIDTH && bullet.y >= 0 && bullet.y <= HEIGHT;
        });
    }

    checkCollision() {
        fighters.forEach(fighter => {
            if (fighter === this) return;
            
            fighter.bullets.forEach(bullet => {
                if (Math.hypot(this.x - bullet.x, this.y - bullet.y) < this.radius) {
                    this.health -= 10;
                    const index = fighter.bullets.indexOf(bullet);
                    if (index > -1) {
                        fighter.bullets.splice(index, 1);
                    }
                }
            });

            if (fighter.weapon === "beam" && fighter.beamActive) {
                const beamDx = Math.cos(fighter.angle);
                const beamDy = Math.sin(fighter.angle);
                const distToFighter = Math.hypot(this.x - fighter.x, this.y - fighter.y);
                if (Math.abs((this.x - fighter.x) * beamDy - (this.y - fighter.y) * beamDx) < this.radius && distToFighter < WIDTH) {
                    this.health -= 0.2;
                }
            }
        });
    }

    drawBeam() {
        const endX = this.x + Math.cos(this.angle) * WIDTH;
        const endY = this.y + Math.sin(this.angle) * HEIGHT;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    evaluatePosition(x, y) {
        let safety = 0;
        let nearestEnemyDist = Infinity;
        let nearestEnemy = null;

        fighters.forEach(fighter => {
            if (fighter !== this && fighter.health > 0) {
                const dist = Math.hypot(x - fighter.x, y - fighter.y);
                
                if (dist < nearestEnemyDist) {
                    nearestEnemyDist = dist;
                    nearestEnemy = fighter;
                }

                if (dist < this.dangerThreshold) {
                    safety -= (this.dangerThreshold - dist) / this.dangerThreshold;
                    
                    if (fighter.weapon === "beam") {
                        safety -= 0.5;
                    }
                }

                const idealRange = this.getIdealRange();
                const rangeDiff = Math.abs(dist - idealRange);
                safety += 1 - (rangeDiff / idealRange);
            }
        });

        const edgeBuffer = 100;
        if (x < edgeBuffer || x > WIDTH - edgeBuffer || y < edgeBuffer || y > HEIGHT - edgeBuffer) {
            safety -= 0.5;
        }

        return { safety, nearestEnemy, nearestEnemyDist };
    }

    getIdealRange() {
        switch(this.weapon) {
            case "beam": return 400;
            case "missile": return 500;
            case "rapid": return 300;
            case "health stealer": return 300;
            case "lightning": return 250;
            case "strong lightning": return 300;
            default: return 350;
        }
    }

    updateBotMovement(target) {
        if (!target) return;

        const now = Date.now();
        const deltaTime = (now - this.lastMoveUpdate) / 1000;
        this.lastMoveUpdate = now;

        // Calculate angle to target
        const targetAngle = Math.atan2(target.y - this.y, target.x - this.x);
        const angleDiff = (targetAngle - this.angle + Math.PI) % (Math.PI * 2) - Math.PI;
        
        // Smooth turning
        this.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.turnSpeed);

        // Calculate distance to target
        const distToTarget = Math.hypot(target.x - this.x, target.y - this.y);
        const idealRange = this.getIdealRange();

        // Move forward or backward based on distance
        if (distToTarget > idealRange + 50) {
            // Too far, move forward
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
        } else if (distToTarget < idealRange - 50) {
            // Too close, move backward
            this.x -= Math.cos(this.angle) * this.speed;
            this.y -= Math.sin(this.angle) * this.speed;
        }

        // Wrap around screen edges smoothly
        this.x = (this.x + WIDTH) % WIDTH;
        this.y = (this.y + HEIGHT) % HEIGHT;
    }
}

class Bullet {
    constructor(x, y, dx, dy, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.color = color;
        this.radius = 5;
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Missile extends Bullet {
    constructor(x, y, dx, dy, color, target, shooter) {
        super(x, y, dx, dy, color);
        this.target = target;
        this.shooter = shooter;
        this.turnSpeed = 0.1;
        this.speed = 7;
    }

    move() {
        if (this.target && this.target.health > 0) {
            const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            const currentAngle = Math.atan2(this.dy, this.dx);
            let angleDiff = (targetAngle - currentAngle + Math.PI) % (Math.PI * 2) - Math.PI;
            const turn = Math.min(Math.abs(angleDiff), this.turnSpeed) * (angleDiff > 0 ? 1 : -1);

            const angle = Math.atan2(this.dy, this.dx) + turn;
            this.dx = Math.cos(angle) * this.speed;
            this.dy = Math.sin(angle) * this.speed;
        }

        this.x += this.dx;
        this.y += this.dy;

        // Check for impact
        if (this.target && Math.hypot(this.x - this.target.x, this.y - this.target.y) < this.target.radius) {
            // Draw explosion
            ctx.beginPath();
            ctx.arc(this.x, this.y, 100, 0, Math.PI * 2);
            ctx.strokeStyle = RED;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Damage nearby fighters
            fighters.forEach(fighter => {
                if (fighter !== this.shooter && Math.hypot(fighter.x - this.x, fighter.y - this.y) < 50) {
                    fighter.health -= 2;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(fighter.x, fighter.y);
                    ctx.strokeStyle = RED;
                    ctx.stroke();
                }
            });
            return true;
        }
        return false;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = 20;
        this.radius = Math.random() * 3 + 2;
        this.dx = Math.random() * 2 - 1;
        this.dy = Math.random() * 2 - 1;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.life--;
        return this.life <= 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.type = type;
        this.color = type === "lightning" ? YELLOW : GREEN;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Game initialization function
async function initGame() {
    // Draw the menu first
    const playerWeapon = await startScreen();
    
    // Only create player and start game after weapon selection
    const player = new Fighter(WIDTH/2, HEIGHT/2, WHITE, playerControls, playerWeapon);
    
    const botColors = [RED, GREEN, YELLOW, ORANGE, CYAN, PINK];
    const botWeapons = ["default", "rapid", "beam", "missile"];
    const bots = botColors.map(color => {
        return new Fighter(
            Math.random() * WIDTH,
            Math.random() * HEIGHT,
            color,
            null,
            botWeapons[Math.floor(Math.random() * botWeapons.length)]
        );
    });

    fighters = [player, ...bots];
    powerUps = [];
    powerUpTimer = 0;
    return player;
}

function startScreen() {
    return new Promise(resolve => {
        function drawMenu() {
            ctx.fillStyle = BLACK;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            ctx.font = '36px Arial';
            ctx.fillStyle = WHITE;
            const title = "Choose Your Weapon";
            ctx.fillText(title, WIDTH/2 - ctx.measureText(title).width/2, 100);

            const options = ["Default", "Rapid Fire", "Beam", "Missile"];
            if (gameStats.wins >= 2) {
                options.push("Health Stealer");
            }
            if (gameStats.wins >= 6) {
                options.push("Strong Lightning");
            }

            options.forEach((opt, i) => {
                ctx.fillText(`${i+1}: ${opt}`, WIDTH/2 - 100, 200 + i * 50);
            });

            // Display wins and losses
            ctx.fillStyle = GREEN;
            ctx.fillText(`Wins: ${gameStats.wins}`, WIDTH - 150, 20);
            ctx.fillStyle = RED;
            ctx.fillText(`Losses: ${gameStats.losses}`, WIDTH - 150, 60);

            // Request next frame for smooth rendering
            if (!gameStarted) {
                requestAnimationFrame(drawMenu);
            }
        }

        function handleKeyPress(e) {
            let weapon = null;
            if (e.key === '1') weapon = "default";
            else if (e.key === '2') weapon = "rapid";
            else if (e.key === '3') weapon = "beam";
            else if (e.key === '4') weapon = "missile";
            else if (e.key === '5' && gameStats.wins >= 2) weapon = "health stealer";
            else if (e.key === '6' && gameStats.wins >= 6) weapon = "strong lightning";

            if (weapon) {
                document.removeEventListener('keydown', handleKeyPress);
                gameStarted = true;
                resolve(weapon);
            }
        }

        // Start menu animation
        gameStarted = false;
        drawMenu();
        document.addEventListener('keydown', handleKeyPress);
    });
}

function endScreen(won) {
    if (won) {
        gameStats.wins++;
    } else {
        gameStats.losses++;
    }

    return new Promise(resolve => {
        function draw() {
            ctx.fillStyle = BLACK;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            ctx.font = '74px Arial';
            ctx.fillStyle = won ? GREEN : RED;
            const mainText = won ? "YOU WIN!" : "GAME OVER";
            ctx.fillText(mainText, WIDTH/2 - ctx.measureText(mainText).width/2, HEIGHT/3);

            ctx.font = '36px Arial';
            ctx.fillStyle = WHITE;
            const restartText = "Press p to restart or ESC to quit";
            ctx.fillText(restartText, WIDTH/2 - ctx.measureText(restartText).width/2, HEIGHT/2 + 50);
        }

        function handleKeyPress(e) {
            if (e.key === 'p') {
                document.removeEventListener('keydown', handleKeyPress);
                resolve(true);
            } else if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleKeyPress);
                resolve(false);
            }
        }

        document.addEventListener('keydown', handleKeyPress);
        draw();
    });
}

async function gameLoop() {
    while (true) {
        // Initialize game and wait for player selection
        const player = await initGame();
        let running = true;

        function update() {
            if (!running) return;

            // Update power-ups
            powerUpTimer++;
            if (powerUpTimer > 300) {
                const powerType = Math.random() < 0.5 ? "lightning" : "speed";
                powerUps.push(new PowerUp(
                    Math.random() * WIDTH,
                    Math.random() * HEIGHT,
                    powerType
                ));
                powerUpTimer = 0;
            }

            // Update fighters
            fighters.forEach(fighter => {
                if (fighter.cooldown > 0) {
                    fighter.cooldown--;
                }

                if (fighter.controls) {
                    fighter.move();
                    fighter.shoot();
                } else {
                    // Bot behavior
                    const target = fighter.findNearestTarget();
                    fighter.updateBotMovement(target);
                    
                    // Shoot when roughly facing target with some randomness
                    if (target) {
                        const angleToTarget = Math.atan2(target.y - fighter.y, target.x - fighter.x);
                        let angleDiff = Math.abs((angleToTarget - fighter.angle + Math.PI) % (Math.PI * 2) - Math.PI);
                        if (angleDiff < 0.3 || (angleDiff < 0.5 && Math.random() < 0.3)) {
                            fighter.shoot();
                        }
                    }
                }

                fighter.updateBullets();
                fighter.checkCollision();

                // Check for power-up collection
                powerUps.forEach((powerUp, index) => {
                    if (Math.hypot(fighter.x - powerUp.x, fighter.y - powerUp.y) < fighter.radius + powerUp.radius) {
                        if (powerUp.type === "lightning") {
                            if (fighter.weapon === "strong lightning") {
                                fighter.strongLightningSize += 50;
                            } else {
                                fighter.weapon = "lightning";
                            }
                        } else if (powerUp.type === "speed") {
                            fighter.speed = 6;
                            setTimeout(() => { fighter.speed = 3; }, 5000);
                        }
                        powerUps.splice(index, 1);
                    }
                });

                // Check health
                if (fighter.health <= 0) {
                    const index = fighters.indexOf(fighter);
                    if (index > -1) {
                        fighters.splice(index, 1);
                        // Draw explosion
                        ctx.beginPath();
                        ctx.arc(fighter.x, fighter.y, 150, 0, Math.PI * 2);
                        ctx.strokeStyle = ORANGE;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        // Damage nearby fighters
                        fighters.forEach(f => {
                            if (Math.hypot(f.x - fighter.x, f.y - fighter.y) < 50) {
                                f.health -= 8;
                            }
                        });
                    }

                    if (fighter === player) {
                        running = false;
                        endScreen(false).then(restart => {
                            if (!restart) {
                                window.close();
                            }
                        });
                    } else if (fighters.length === 1 && fighters[0] === player) {
                        running = false;
                        endScreen(true).then(restart => {
                            if (!restart) {
                                window.close();
                            }
                        });
                    }
                }
            });
        }

        function draw() {
            if (!running) return;

            ctx.fillStyle = BLACK;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            // Draw power-ups
            powerUps.forEach(powerUp => powerUp.draw());

            // Draw fighters
            fighters.forEach(fighter => fighter.draw());

            // Draw stats
            ctx.font = '24px Arial';
            ctx.fillStyle = GREEN;
            ctx.fillText(`Wins: ${gameStats.wins}`, WIDTH - 150, 30);
            ctx.fillStyle = RED;
            ctx.fillText(`Losses: ${gameStats.losses}`, WIDTH - 150, 60);
        }

        let lastTime = performance.now();
        function animate(currentTime) {
            if (!running) return;

            const deltaTime = currentTime - lastTime;
            if (deltaTime >= 1000/FPS) {
                update();
                draw();
                lastTime = currentTime;
            }
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
        await new Promise(resolve => {
            const checkGameEnd = setInterval(() => {
                if (!running) {
                    clearInterval(checkGameEnd);
                    resolve();
                }
            }, 100);
        });
    }
}

// Clear the canvas and show menu
ctx.fillStyle = BLACK;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Start the game loop
gameLoop(); 