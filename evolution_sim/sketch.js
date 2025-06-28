// --- Configuration ---
const config = {
    // Display Settings
    SIMULATION_WIDTH: 1060,
    SIMULATION_HEIGHT: 860,
    GRAPH_WIDTH: 480,
    GRAPH_HEIGHT: 420,
    FPS: 60,

    // Simulation Parameters
    PREY_COLOR: 'rgb(100, 200, 255)', // Brighter blue
    PREY_SIZE: 5, // Larger for visibility
    PREY_COUNT_START: 100,

    PREDATOR_COLOR: 'rgb(255, 150, 100)', // Brighter red
    PREDATOR_SIZE: 8, // Larger for visibility
    PREDATOR_COUNT_START: 40,

    // Energy Parameters
    PREDATOR_STARTING_ENERGY: 100,
    PREDATOR_ENERGY_PER_TICK: 0.3,
    PREDATOR_ENERGY_GAIN_ON_EAT: 50,
    PREDATOR_REPRODUCTION_ENERGY_THRESHOLD: 80,
    PREDATOR_REPRODUCTION_COST: 60,

    // Food Parameters
    FOOD_COLOR: 'rgb(150, 255, 150)', // Brighter green
    FOOD_SIZE: 4, // Larger for visibility
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

// --- Seasonal & Scoring Configuration ---
const SEASON_DURATION_SECONDS = 20; // How long each season lasts
const MIN_STABLE_POPULATION = 5; // Minimum creatures to be considered 'stable'

// --- Achievements Configuration ---
const ACHIEVEMENTS = [
    {
        id: 'prey_population',
        title: 'Prey Paradise',
        description: 'Maintain 100+ prey for 30 seconds',
        requiredCount: 100,
        requiredDuration: 30 * config.FPS,
        type: 'prey',
        progress: 0,
        completed: false,
        timer: 0
    },
    {
        id: 'predator_population',
        title: 'Apex Dominance',
        description: 'Maintain 50+ predators for 20 seconds',
        requiredCount: 50,
        requiredDuration: 20 * config.FPS,
        type: 'predator',
        progress: 0,
        completed: false,
        timer: 0
    },
    {
        id: 'balanced_ecosystem',
        title: 'Perfect Balance',
        description: 'Keep both populations above 30 for 45 seconds',
        requiredCount: 30,
        requiredDuration: 45 * config.FPS,
        type: 'both',
        progress: 0,
        completed: false,
        timer: 0
    },
    {
        id: 'winter_survival',
        title: 'Winter is Coming',
        description: 'Maintain 40+ prey through an entire winter',
        requiredCount: 40,
        requiredDuration: SEASON_DURATION_SECONDS * config.FPS,
        type: 'winter_prey',
        progress: 0,
        completed: false,
        timer: 0
    },
    {
        id: 'population_boom',
        title: 'Population Boom',
        description: 'Reach 200+ total creatures',
        requiredCount: 200,
        type: 'total',
        progress: 0,
        completed: false
    }
];

// --- Global Variables ---
let simulation;
let populationChart;
let simulationSpeed = 1;
let placingCreature = null; // Can be 'prey', 'predator', or null
let baseFoodSpawnRate;
let stabilityScore = 0;
let seasonDisplay, scoreDisplay;

// --- p5.js setup function ---
function setup() {
    console.log('Setup function called');
    
    // --- Main Simulation Canvas ---
    const simCanvas = createCanvas(config.SIMULATION_WIDTH, config.SIMULATION_HEIGHT);
    simCanvas.parent('simulation-container');
    frameRate(config.FPS);
    console.log('Canvas created:', config.SIMULATION_WIDTH, 'x', config.SIMULATION_HEIGHT);

    // --- Cache UI Elements FIRST ---
    seasonDisplay = document.getElementById('season-display');
    scoreDisplay = document.getElementById('score-display');
    baseFoodSpawnRate = config.FOOD_SPAWN_RATE;

    // --- Charting Canvases ---
    const popCtx = document.getElementById('population-graph').getContext('2d');
    document.getElementById('population-graph').width = config.GRAPH_WIDTH;
    document.getElementById('population-graph').height = config.GRAPH_HEIGHT - 40;
    
    // --- Initialize Simulation ---
    simulation = new Simulation(width, height);
    console.log('Simulation created with populations:', 
                'Prey:', simulation.prey.length, 
                'Predators:', simulation.predators.length, 
                'Food:', simulation.food.length);

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

    // --- Setup Placement Palette ---
    const placePreyButton = document.getElementById('place-prey');
    const placePredatorButton = document.getElementById('place-predator');

    const updatePaletteSelection = () => {
        placePreyButton.classList.toggle('selected', placingCreature === 'prey');
        placePredatorButton.classList.toggle('selected', placingCreature === 'predator');
    };

    placePreyButton.addEventListener('mousedown', () => {
        placingCreature = (placingCreature === 'prey') ? null : 'prey';
        updatePaletteSelection();
    });

    placePredatorButton.addEventListener('mousedown', () => {
        placingCreature = (placingCreature === 'predator') ? null : 'predator';
        updatePaletteSelection();
    });

    // UI Elements already cached above

    // --- Set initial text values ---
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

    // Draw background with seasonal tint
    const season = simulation.getCurrentSeason();
    background(season.color);

    simulation.draw();
    
    drawGhostCreature();
    
    updateGraphs();
}

function drawGhostCreature() {
    if (placingCreature && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        cursor('crosshair');
        noStroke();
        if (placingCreature === 'prey') {
            const c = color(config.PREY_COLOR);
            c.setAlpha(150);
            fill(c);
            ellipse(mouseX, mouseY, config.PREY_SIZE * 2);
        } else if (placingCreature === 'predator') {
            const c = color(config.PREDATOR_COLOR);
            c.setAlpha(150);
            fill(c);
            ellipse(mouseX, mouseY, config.PREDATOR_SIZE * 2);
        }
    } else {
        cursor(ARROW);
    }
}

function mousePressed() {
    if (placingCreature && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        let newCreature;
        if (placingCreature === 'prey') {
            newCreature = new Prey(mouseX, mouseY);
            simulation.prey.push(newCreature);
        } else if (placingCreature === 'predator') {
            newCreature = new Predator(mouseX, mouseY);
            simulation.predators.push(newCreature);
        }
        
        if (newCreature) {
            newCreature.wander_target = simulation.getRandomWanderTarget();
        }
    }
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
        
        // Initialize seasons with safer color creation
        this.initializeSeasons();
        this.seasonOrder = ['Summer', 'Autumn', 'Winter', 'Spring'];
        this.currentSeasonIndex = 0;
        this.season_timer = SEASON_DURATION_SECONDS * config.FPS;
        this.score_timer = 0;

        this.init_populations();
        this.updateSeason();

        // Initialize achievements
        this.achievements = [...ACHIEVEMENTS];
        this.initializeAchievementsUI();
    }
    
    initializeSeasons() {
        try {
            this.seasons = {
                Summer: { name: 'Summer', color: color(10, 30, 50), food_multiplier: 1.5 },
                Autumn: { name: 'Autumn', color: color(40, 30, 40), food_multiplier: 1.0 },
                Winter: { name: 'Winter', color: color(25, 25, 60), food_multiplier: 0.5 },
                Spring: { name: 'Spring', color: color(20, 40, 40), food_multiplier: 1.2 }
            };
        } catch (error) {
            console.warn('Failed to create p5.js colors, using fallback colors:', error);
            // Fallback to CSS color strings if p5.js color() function isn't available
            this.seasons = {
                Summer: { name: 'Summer', color: 'rgb(10, 30, 50)', food_multiplier: 1.5 },
                Autumn: { name: 'Autumn', color: 'rgb(40, 30, 40)', food_multiplier: 1.0 },
                Winter: { name: 'Winter', color: 'rgb(25, 25, 60)', food_multiplier: 0.5 },
                Spring: { name: 'Spring', color: 'rgb(20, 40, 40)', food_multiplier: 1.2 }
            };
        }
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
        this.updateSeasonCycle();
        this.updateScore();

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

        this.updateAchievements();
    }

    updateSeasonCycle() {
        this.season_timer--;
        if (this.season_timer <= 0) {
            this.currentSeasonIndex = (this.currentSeasonIndex + 1) % this.seasonOrder.length;
            this.updateSeason();
        }
    }

    updateSeason() {
        const seasonName = this.seasonOrder[this.currentSeasonIndex];
        const season = this.seasons[seasonName];
        if (seasonDisplay) {
            seasonDisplay.textContent = season.name;
        }
        config.FOOD_SPAWN_RATE = baseFoodSpawnRate * season.food_multiplier;
        this.season_timer = SEASON_DURATION_SECONDS * config.FPS;
    }

    updateScore() {
        if (this.prey.length < MIN_STABLE_POPULATION || this.predators.length < MIN_STABLE_POPULATION) {
            stabilityScore = 0; // Reset score if unstable
        } else {
            this.score_timer++;
            if (this.score_timer % config.FPS === 0) { // Add score every second
                stabilityScore++;
            }
        }
        if (scoreDisplay) {
            scoreDisplay.textContent = stabilityScore;
        }
    }
    
    getCurrentSeason() {
        return this.seasons[this.seasonOrder[this.currentSeasonIndex]];
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
        // Draw all entities
        for (const f of this.food) f.draw();
        for (const p of this.prey) p.draw();
        for (const p of this.predators) p.draw();
    }

    initializeAchievementsUI() {
        const container = document.getElementById('achievements-container');
        container.innerHTML = ''; // Clear existing achievements
        
        this.achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = 'achievement-item';
            achievementElement.id = `achievement-${achievement.id}`;
            
            achievementElement.innerHTML = `
                <div class="achievement-checkbox"></div>
                <div class="achievement-text">
                    <strong>${achievement.title}</strong><br>
                    ${achievement.description}
                </div>
                <div class="achievement-progress" id="progress-${achievement.id}"></div>
            `;
            
            container.appendChild(achievementElement);
        });
    }

    updateAchievements() {
        this.achievements.forEach(achievement => {
            if (achievement.completed) return;

            const totalCreatures = this.prey.length + this.predators.length;
            let conditionMet = false;

            switch (achievement.type) {
                case 'prey':
                    conditionMet = this.prey.length >= achievement.requiredCount;
                    achievement.progress = Math.min(100, Math.floor((this.prey.length / achievement.requiredCount) * 100));
                    break;
                case 'predator':
                    conditionMet = this.predators.length >= achievement.requiredCount;
                    achievement.progress = Math.min(100, Math.floor((this.predators.length / achievement.requiredCount) * 100));
                    break;
                case 'both':
                    conditionMet = this.prey.length >= achievement.requiredCount && 
                                 this.predators.length >= achievement.requiredCount;
                    achievement.progress = Math.min(100, Math.floor(
                        ((this.prey.length + this.predators.length) / (achievement.requiredCount * 2)) * 100
                    ));
                    break;
                case 'winter_prey':
                    if (this.getCurrentSeason().name === 'Winter') {
                        conditionMet = this.prey.length >= achievement.requiredCount;
                        achievement.progress = Math.min(100, Math.floor((this.prey.length / achievement.requiredCount) * 100));
                    } else {
                        achievement.timer = 0; // Reset timer if not winter
                    }
                    break;
                case 'total':
                    conditionMet = totalCreatures >= achievement.requiredCount;
                    achievement.progress = Math.min(100, Math.floor((totalCreatures / achievement.requiredCount) * 100));
                    break;
            }

            // Update timer for duration-based achievements
            if (conditionMet && achievement.requiredDuration) {
                achievement.timer++;
                if (achievement.timer >= achievement.requiredDuration) {
                    this.completeAchievement(achievement);
                }
            } else if (achievement.requiredDuration) {
                achievement.timer = 0;
            } else if (conditionMet) {
                this.completeAchievement(achievement);
            }

            // Update UI
            const progressElement = document.getElementById(`progress-${achievement.id}`);
            if (progressElement) {
                if (achievement.requiredDuration && conditionMet) {
                    const secondsLeft = Math.ceil((achievement.requiredDuration - achievement.timer) / config.FPS);
                    progressElement.textContent = `${secondsLeft}s left`;
                } else {
                    progressElement.textContent = `${achievement.progress}%`;
                }
            }
        });
    }

    completeAchievement(achievement) {
        achievement.completed = true;
        achievement.progress = 100;
        
        // Update UI
        const achievementElement = document.getElementById(`achievement-${achievement.id}`);
        if (achievementElement) {
            achievementElement.classList.add('completed');
            achievementElement.querySelector('.achievement-checkbox').classList.add('completed');
            const progressElement = achievementElement.querySelector('.achievement-progress');
            progressElement.textContent = 'Completed!';
        }

        // Add celebration effect (you could add sound or animation here)
        this.celebrateAchievement(achievement);
    }

    celebrateAchievement(achievement) {
        // Create a temporary celebration element
        const celebration = document.createElement('div');
        celebration.style.position = 'fixed';
        celebration.style.top = '20px';
        celebration.style.left = '50%';
        celebration.style.transform = 'translateX(-50%)';
        celebration.style.background = '#4CAF50';
        celebration.style.color = 'white';
        celebration.style.padding = '10px 20px';
        celebration.style.borderRadius = '4px';
        celebration.style.zIndex = '1000';
        celebration.style.animation = 'slideDown 0.5s ease-out';
        celebration.innerHTML = `<strong>Achievement Unlocked:</strong> ${achievement.title}`;
        
        document.body.appendChild(celebration);
        
        // Remove the celebration after 3 seconds
        setTimeout(() => {
            celebration.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => celebration.remove(), 500);
        }, 3000);
    }
}

// Add CSS animations to the existing style section
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); }
        to { transform: translateX(-50%) translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style); 