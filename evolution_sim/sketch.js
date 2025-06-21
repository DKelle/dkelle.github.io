// --- Configuration ---
const config = {
    // Display Settings
    SIMULATION_WIDTH: 1060,
    SIMULATION_HEIGHT: 860,
    GRAPH_WIDTH: 480,
    GRAPH_HEIGHT: 420,
    FPS: 60,

    // Simulation Parameters
    PREY_COLOR: 'rgb(60, 180, 255)',
    PREY_SIZE: 3,
    PREY_COUNT_START: 100,

    PREDATOR_COLOR: 'rgb(255, 100, 80)',
    PREDATOR_SIZE: 5,
    PREDATOR_COUNT_START: 40,

    // Energy Parameters
    PREDATOR_STARTING_ENERGY: 100,
    PREDATOR_ENERGY_PER_TICK: 0.3,
    PREDATOR_ENERGY_GAIN_ON_EAT: 50,
    PREDATOR_REPRODUCTION_ENERGY_THRESHOLD: 80,
    PREDATOR_REPRODUCTION_COST: 60,

    // Food Parameters
    FOOD_COLOR: 'rgb(100, 255, 100)',
    FOOD_SIZE: 3,
    FOOD_CONSUMPTION_RADIUS: 5,
    FOOD_COMMITMENT_DISTANCE: 15,
    FOOD_COUNT_START: 150,
    FOOD_SPAWN_RATE: 0.2, // Chance per frame

    // Prey Energy Parameters
    PREY_STARTING_ENERGY: 100,
    PREY_ENERGY_PER_TICK: 0.05,
    PREY_ENERGY_GAIN_ON_EAT: 40,
    PREY_REPRODUCTION_ENERGY_THRESHOLD: 90,
    PREY_REPRODUCTION_COST: 50,

    // Spontaneous Spawning
    RANDOM_PREY_SPAWN_CHANCE: 0.002,
    RANDOM_PREDATOR_SPAWN_CHANCE: 0.0015,

    // AI & Movement
    ARRIVAL_RADIUS: 50,
    PREDATOR_AMBUSH_DISTANCE: 60,
    SEPARATION_RADIUS: 20,
    PREY_SEPARATION_FORCE: 0.5,
    PREDATOR_SEPARATION_FORCE: 0.5,
    PREDATOR_HUNTING_COMMITMENT_DISTANCE: 30,
};

// --- Global Variables ---
let simulation;
let populationChart;
let simulationSpeed = 1;

// --- p5.js setup function ---
function setup() {
    // --- Main Simulation Canvas ---
    const simCanvas = createCanvas(config.SIMULATION_WIDTH, config.SIMULATION_HEIGHT);
    simCanvas.parent('simulation-container');
    frameRate(config.FPS);

    // --- Charting Canvases ---
    const popCtx = document.getElementById('population-graph').getContext('2d');
    document.getElementById('population-graph').width = config.GRAPH_WIDTH;
    document.getElementById('population-graph').height = config.GRAPH_HEIGHT - 40;
    
    // --- Initialize Simulation ---
    simulation = new Simulation(width, height);

    // --- Initialize Charts ---
    populationChart = new Chart(popCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Prey',
                    data: [],
                    borderColor: config.PREY_COLOR,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                },
                {
                    label: 'Predators',
                    data: [],
                    borderColor: config.PREDATOR_COLOR,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                }
            ]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            },
            animation: false
        }
    });

    // --- Setup Control Panel ---
    const speedSlider = document.getElementById('sim-speed-slider');
    const speedValue = document.getElementById('sim-speed-value');
    speedSlider.addEventListener('input', (e) => {
        simulationSpeed = parseInt(e.target.value);
        speedValue.textContent = e.target.value;
    });

    const foodSlider = document.getElementById('food-spawn-slider');
    const foodValue = document.getElementById('food-spawn-value');
    foodSlider.addEventListener('input', (e) => {
        config.FOOD_SPAWN_RATE = parseFloat(e.target.value);
        foodValue.textContent = parseFloat(e.target.value).toFixed(3);
    });

    const predatorEnergySlider = document.getElementById('predator-energy-slider');
    const predatorEnergyValue = document.getElementById('predator-energy-value');
    predatorEnergySlider.addEventListener('input', (e) => {
        config.PREDATOR_ENERGY_GAIN_ON_EAT = parseInt(e.target.value);
        predatorEnergyValue.textContent = e.target.value;
    });

    const preyEnergySlider = document.getElementById('prey-energy-slider');
    const preyEnergyValue = document.getElementById('prey-energy-value');
    preyEnergySlider.addEventListener('input', (e) => {
        config.PREY_ENERGY_GAIN_ON_EAT = parseInt(e.target.value);
        preyEnergyValue.textContent = e.target.value;
    });

    const preyHerdingSlider = document.getElementById('prey-herding-slider');
    const preyHerdingValue = document.getElementById('prey-herding-value');
    preyHerdingSlider.addEventListener('input', (e) => {
        config.PREY_SEPARATION_FORCE = parseFloat(e.target.value);
        preyHerdingValue.textContent = e.target.value;
    });

    const predatorPackingSlider = document.getElementById('predator-packing-slider');
    const predatorPackingValue = document.getElementById('predator-packing-value');
    predatorPackingSlider.addEventListener('input', (e) => {
        config.PREDATOR_SEPARATION_FORCE = parseFloat(e.target.value);
        predatorPackingValue.textContent = e.target.value;
    });

    const preySpawnSlider = document.getElementById('prey-spawn-slider');
    const preySpawnValue = document.getElementById('prey-spawn-value');
    preySpawnSlider.addEventListener('input', (e) => {
        config.RANDOM_PREY_SPAWN_CHANCE = parseFloat(e.target.value);
        preySpawnValue.textContent = parseFloat(e.target.value).toFixed(4);
    });

    const predatorSpawnSlider = document.getElementById('predator-spawn-slider');
    const predatorSpawnValue = document.getElementById('predator-spawn-value');
    predatorSpawnSlider.addEventListener('input', (e) => {
        config.RANDOM_PREDATOR_SPAWN_CHANCE = parseFloat(e.target.value);
        predatorSpawnValue.textContent = parseFloat(e.target.value).toFixed(4);
    });

    // Set initial text values
    speedValue.textContent = speedSlider.value;
    foodValue.textContent = parseFloat(foodSlider.value).toFixed(3);
    predatorEnergyValue.textContent = predatorEnergySlider.value;
    preyEnergyValue.textContent = preyEnergySlider.value;
    preyHerdingValue.textContent = preyHerdingSlider.value;
    predatorPackingValue.textContent = predatorPackingSlider.value;
    preySpawnValue.textContent = parseFloat(preySpawnSlider.value).toFixed(4);
    predatorSpawnValue.textContent = parseFloat(predatorSpawnSlider.value).toFixed(4);
}

// --- p5.js draw loop ---
function draw() {
    for (let i = 0; i < simulationSpeed; i++) {
        simulation.update();
    }

    background(10, 30, 50);
    simulation.draw();
    
    updateGraphs();
}

function updateGraphs() {
    const history = simulation.history;
    if (history.length === 0) return;

    // Limit history for performance
    const displayHistory = history.slice(-500);

    // Population Graph
    populationChart.data.labels = displayHistory.map((_, i) => i);
    populationChart.data.datasets[0].data = displayHistory.map(h => h.prey);
    populationChart.data.datasets[1].data = displayHistory.map(h => h.predators);
    populationChart.update();
}


// --- Classes ---

class Food {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.color = config.FOOD_COLOR;
        this.size = config.FOOD_SIZE;
    }

    draw() {
        noStroke();
        fill(this.color);
        ellipse(this.position.x, this.position.y, this.size * 2);
    }
}

class Creature {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D();
        this.acceleration = createVector(0, 0);

        this.max_speed = 2.0;
        this.max_force = 0.25;
        this.size = 5;
        this.color = 'rgb(255, 255, 255)';
    }

    steer(target) {
        const desired = p5.Vector.sub(target, this.position);
        desired.setMag(this.max_speed);
        const steering = p5.Vector.sub(desired, this.velocity);
        steering.limit(this.max_force);
        return steering;
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.max_speed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.checkBoundaries();
    }

    checkBoundaries() {
        const margin = 50;
        const turn_force = 0.2;
        if (this.position.x < margin) this.applyForce(createVector(turn_force, 0));
        else if (this.position.x > width - margin) this.applyForce(createVector(-turn_force, 0));
        if (this.position.y < margin) this.applyForce(createVector(0, turn_force));
        else if (this.position.y > height - margin) this.applyForce(createVector(0, -turn_force));
    }

    draw() {
        noStroke();
        fill(this.color);
        ellipse(this.position.x, this.position.y, this.size * 2);
    }
}

class Prey extends Creature {
    constructor(x, y) {
        super(x, y);
        this.size = config.PREY_SIZE;
        this.base_color = color(config.PREY_COLOR);
        this.color = this.base_color;
        this.perception_radius = 75;
        this.energy = config.PREY_STARTING_ENERGY;
        this.max_speed = 1.8;
    }

    update() {
        super.update();
        this.energy -= config.PREY_ENERGY_PER_TICK;
        this.updateColorByEnergy();
    }

    isDead() {
        return this.energy <= 0;
    }

    updateColorByEnergy() {
        const energyRatio = max(0, min(1, this.energy / 100));
        this.color = lerpColor(color(0, 0, 0, 0), this.base_color, energyRatio);
    }
}

class Predator extends Creature {
    constructor(x, y) {
        super(x, y);
        this.size = config.PREDATOR_SIZE;
        this.base_color = color(config.PREDATOR_COLOR);
        this.color = this.base_color;
        this.perception_radius = 150;
        this.energy = config.PREDATOR_STARTING_ENERGY;
        this.max_speed = 2.2;
        this.is_committed_to_hunt = false;
    }
    
    update() {
        super.update();
        this.energy -= config.PREDATOR_ENERGY_PER_TICK;
        this.updateColorByEnergy();
    }

    isDead() {
        return this.energy <= 0;
    }

    updateColorByEnergy() {
        const energyRatio = max(0, min(1, this.energy / 100));
        this.color = lerpColor(color(0, 0, 0, 0), this.base_color, energyRatio);
    }
}

class Simulation {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.prey = [];
        this.predators = [];
        this.food = [];
        this.history = []; // To store population counts
        this.init_populations();
    }

    init_populations() {
        for (let i = 0; i < config.PREY_COUNT_START; i++) {
            this.prey.push(new Prey(random(this.width), random(this.height)));
        }
        for (let i = 0; i < config.PREDATOR_COUNT_START; i++) {
            this.predators.push(new Predator(random(this.width), random(this.height)));
        }
        for (let i = 0; i < config.FOOD_COUNT_START; i++) {
            this.food.push(new Food(random(this.width), random(this.height)));
        }
        
        for (const creature of [...this.prey, ...this.predators]) {
            creature.wander_target = this.getRandomWanderTarget();
        }
    }

    getRandomWanderTarget() {
        return createVector(random(this.width), random(this.height));
    }

    update() {
        // Spawn new food
        if (random() < config.FOOD_SPAWN_RATE) {
            this.food.push(new Food(random(this.width), random(this.height)));
        }

        // Spontaneous creature spawning
        if (random() < config.RANDOM_PREY_SPAWN_CHANCE) {
            const c = new Prey(random(this.width), random(this.height));
            c.wander_target = this.getRandomWanderTarget();
            this.prey.push(c);
        }
        if (random() < config.RANDOM_PREDATOR_SPAWN_CHANCE) {
            const c = new Predator(random(this.width), random(this.height));
            c.wander_target = this.getRandomWanderTarget();
            this.predators.push(c);
        }
        
        // Update logic for all creatures
        this.updateSeparation();
        this.updatePrey();
        this.updatePredators();

        // Cleanup dead creatures
        this.prey = this.prey.filter(p => !p.isDead());
        this.predators = this.predators.filter(p => !p.isDead());

        // Record history
        if (frameCount % 10 === 0) { // Record history less frequently
            this.history.push({ prey: this.prey.length, predators: this.predators.length });
            if (this.history.length > 500) {
                this.history.shift();
            }
        }
    }
    
    updateSeparation() {
        for (const list of [this.prey, this.predators]) {
            for (const creature of list) {
                if (creature instanceof Predator && creature.is_committed_to_hunt) continue;
                
                let separation_steer = createVector(0, 0);
                let neighbors = 0;
                for (const other of list) {
                    if (creature !== other) {
                        const dist = p5.Vector.dist(creature.position, other.position);
                        if (dist < config.SEPARATION_RADIUS) {
                            let diff = p5.Vector.sub(creature.position, other.position);
                            diff.normalize();
                            diff.div(dist); // Weight by distance
                            separation_steer.add(diff);
                            neighbors++;
                        }
                    }
                }
                if (neighbors > 0) {
                    separation_steer.div(neighbors);
                    separation_steer.setMag(creature.max_speed);
                    const force = p5.Vector.sub(separation_steer, creature.velocity);
                    const forceLimit = (creature instanceof Prey) ? config.PREY_SEPARATION_FORCE : config.PREDATOR_SEPARATION_FORCE;
                    force.limit(forceLimit);
                    creature.applyForce(force);
                }
            }
        }
    }

    updatePrey() {
        const new_prey = [];
        let food_to_remove = new Set();

        for (const p of this.prey) {
            // Flee from predators
            const closest_predator = this.findClosest(p, this.predators);
            if (closest_predator && p5.Vector.dist(p.position, closest_predator.position) < p.perception_radius) {
                const flee_target = p5.Vector.sub(p.position, closest_predator.position).add(p.position);
                p.applyForce(p.steer(flee_target));
            } else {
                // Hunt for food
                const closest_food = this.findClosest(p, this.food);
                if (closest_food) {
                    const dist_to_food = p5.Vector.dist(p.position, closest_food.position);
                    if (dist_to_food < p.size + closest_food.size + config.FOOD_CONSUMPTION_RADIUS) {
                        food_to_remove.add(closest_food);
                        p.energy += config.PREY_ENERGY_GAIN_ON_EAT;
                        while (p.energy > config.PREY_REPRODUCTION_ENERGY_THRESHOLD) {
                            p.energy -= config.PREY_REPRODUCTION_COST;
                            const child = new Prey(p.position.x, p.position.y);
                            child.wander_target = this.getRandomWanderTarget();
                            new_prey.push(child);
                        }
                    } else if (dist_to_food < config.FOOD_COMMITMENT_DISTANCE) {
                         p.velocity = p5.Vector.sub(closest_food.position, p.position).setMag(p.max_speed);
                    } else {
                        p.applyForce(p.steer(closest_food.position));
                    }
                } else {
                    // Wander
                    if (p5.Vector.dist(p.position, p.wander_target) < 20) {
                        p.wander_target = this.getRandomWanderTarget();
                    }
                    p.applyForce(p.steer(p.wander_target));
                }
            }
            p.update();
        }

        this.food = this.food.filter(f => !food_to_remove.has(f));
        this.prey.push(...new_prey);
    }

    updatePredators() {
        let prey_to_remove = new Set();
        const new_predators = [];

        for(const p of this.predators) {
             const closest_prey = this.findClosest(p, this.prey.filter(prey => !prey_to_remove.has(prey)));
             if (closest_prey && p5.Vector.dist(p.position, closest_prey.position) < p.perception_radius) {
                p.is_committed_to_hunt = p5.Vector.dist(p.position, closest_prey.position) < config.PREDATOR_HUNTING_COMMITMENT_DISTANCE;
                // Ambush logic could be simplified for now to just steering
                p.applyForce(p.steer(closest_prey.position));

                if (p5.Vector.dist(p.position, closest_prey.position) < p.size + closest_prey.size) {
                    prey_to_remove.add(closest_prey);
                    p.energy += config.PREDATOR_ENERGY_GAIN_ON_EAT;
                    while (p.energy > config.PREDATOR_REPRODUCTION_ENERGY_THRESHOLD) {
                        p.energy -= config.PREDATOR_REPRODUCTION_COST;
                        const child = new Predator(p.position.x, p.position.y);
                        child.wander_target = this.getRandomWanderTarget();
                        new_predators.push(child);
                    }
                }
             } else {
                p.is_committed_to_hunt = false;
                // Wander
                if (p5.Vector.dist(p.position, p.wander_target) < 20) {
                    p.wander_target = this.getRandomWanderTarget();
                }
                p.applyForce(p.steer(p.wander_target));
             }
             p.update();
        }
        
        this.prey = this.prey.filter(p => !prey_to_remove.has(p));
        this.predators.push(...new_predators);
    }
    
    findClosest(creature, list) {
        let closest = null;
        let min_dist = Infinity;
        for (const item of list) {
            const d = p5.Vector.dist(creature.position, item.position);
            if (d < min_dist) {
                min_dist = d;
                closest = item;
            }
        }
        return closest;
    }

    draw() {
        for (const f of this.food) f.draw();
        for (const p of this.prey) p.draw();
        for (const p of this.predators) p.draw();
    }
} 