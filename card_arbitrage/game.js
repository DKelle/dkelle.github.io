// Game state
const gameState = {
    money: 1000,
    turn: 1,
    inventory: [],
    targetCard: null,
    currentStage: 'buy',
    marketEvent: null
};

// Pokemon TCG API base URL
const API_BASE_URL = 'https://api.pokemontcg.io/v2';

// Market events to make the game more interesting
const marketEvents = [
    {
        name: "Pokémon Championship",
        description: "A major tournament is happening! Competitive cards are in high demand.",
        effect: (card) => card.name.includes('V') ? 1.5 : 1,
        probability: 0.2
    },
    {
        name: "Collector's Craze",
        description: "Collectors are buying rare cards! Premium cards are worth more.",
        effect: (card) => card.rarity.includes('Secret') || card.rarity.includes('Ultra') ? 1.4 : 1,
        probability: 0.15
    },
    {
        name: "Market Crash",
        description: "The market is down! All cards are selling for less.",
        effect: () => 0.7,
        probability: 0.1
    },
    {
        name: "Trading Frenzy",
        description: "Everyone's trading! Market is very active.",
        effect: () => 1 + (Math.random() * 0.5),
        probability: 0.2
    }
];

// Sound effects
const sounds = {
    buy: new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'),
    sell: new Audio('https://assets.mixkit.co/active_storage/sfx/2058/2058-preview.mp3'),
    profit: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
    loss: new Audio('https://assets.mixkit.co/active_storage/sfx/1430/1430-preview.mp3')
};

// Function to fetch cards from Pokemon TCG API
async function fetchPokemonCards() {
    try {
        // Fetch some popular V and VMAX cards
        const response = await fetch(`${API_BASE_URL}/cards?q=supertype:pokemon (subtypes:VMAX OR subtypes:V) -subtypes:VSTAR&orderBy=tcgplayer.prices.holofoil.market&pageSize=6`);
        const data = await response.json();
        
        return data.data.map(card => ({
            name: card.name,
            basePrice: Math.round((card.tcgplayer?.prices?.holofoil?.market || card.tcgplayer?.prices?.normal?.market || 50) * 100),
            image: card.images.small,
            set: card.set.name,
            rarity: card.rarity
        }));
    } catch (error) {
        console.error('Error fetching Pokemon cards:', error);
        return fallbackCards;
    }
}

// Fallback cards in case API fails
const fallbackCards = [
    { 
        name: "Charizard V",
        basePrice: 100,
        image: "https://images.pokellector.com/cards/360/Charizard-V.SWSH050.png",
        set: "SWSH Black Star Promos",
        rarity: "Rare Ultra"
    },
    { 
        name: "Pikachu VMAX",
        basePrice: 80,
        image: "https://images.pokellector.com/cards/360/Pikachu-VMAX.SWSH062.png",
        set: "SWSH Black Star Promos"
    },
    { 
        name: "Mewtwo V",
        basePrice: 150,
        image: "https://images.pokellector.com/cards/360/Mewtwo-V.POGO12.png",
        set: "Pokemon GO"
    },
    { 
        name: "Mew VMAX",
        basePrice: 120,
        image: "https://images.pokellector.com/cards/360/Mew-VMAX.FST265.png",
        set: "Fusion Strike"
    },
    { 
        name: "Rayquaza V",
        basePrice: 90,
        image: "https://images.pokellector.com/cards/360/Rayquaza-V.EVS110.png",
        set: "Evolving Skies"
    },
    { 
        name: "Gengar VMAX",
        basePrice: 200,
        image: "https://images.pokellector.com/cards/360/Gengar-VMAX.FST157.png",
        set: "Fusion Strike"
    }
];

// Premium card (target to win)
const premiumCard = {
    name: "Pikachu VMax (Secret)",
    basePrice: 5000,
    image: "https://images.pokellector.com/cards/360/Pikachu-VMAX.SWSH188.png",
    set: "SWSH Black Star Promos",
    rarity: "Secret Rare"
};

// Initialize game
async function initGame() {
    try {
        const cards = await fetchPokemonCards();
        window.cardPool = cards;
        checkForMarketEvent();
        updateUI();
        displayTargetCard();
        generateMarket('buy');
        displayMarketEvent();
    } catch (error) {
        console.error('Error initializing game:', error);
        window.cardPool = fallbackCards;
        updateUI();
        displayTargetCard();
        generateMarket('buy');
    }
}

// Check for random market events
function checkForMarketEvent() {
    gameState.marketEvent = null;
    for (const event of marketEvents) {
        if (Math.random() < event.probability) {
            gameState.marketEvent = event;
            break;
        }
    }
}

// Display current market event
function displayMarketEvent() {
    const eventDisplay = document.createElement('div');
    eventDisplay.className = 'market-event';
    
    if (gameState.marketEvent) {
        eventDisplay.innerHTML = `
            <div class="event-icon">📊</div>
            <div class="event-details">
                <h3>${gameState.marketEvent.name}</h3>
                <p>${gameState.marketEvent.description}</p>
            </div>
        `;
    }
    
    document.querySelector('.active').prepend(eventDisplay);
}

// Generate market prices with some randomness
function generateMarket(phase) {
    const market = document.getElementById(`${phase}-market`);
    market.innerHTML = '';

    const cards = window.cardPool.map(card => ({
        ...card,
        currentPrice: calculatePrice(card.basePrice, phase)
    }));

    cards.forEach(card => {
        const cardElement = createCardElement(card, phase);
        market.appendChild(cardElement);
    });
}

// Calculate price with market events
function calculatePrice(basePrice, phase) {
    let price = basePrice;
    
    // Apply market event effects
    if (gameState.marketEvent) {
        price *= gameState.marketEvent.effect({name: '', rarity: ''});
    }
    
    // Apply phase modifiers
    const variance = phase === 'buy' ? 0.8 : 1.2;
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    return Math.round(price * variance * randomFactor);
}

// Create card HTML element with enhanced styling
function createCardElement(card, phase) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
        <div class="card-inner">
            <img src="${card.image}" alt="${card.name}">
            <div class="card-details">
                <div class="card-name">${card.name}</div>
                <div class="card-set">${card.set}</div>
                <div class="card-rarity">${card.rarity}</div>
                <div class="card-price">💰 ${card.currentPrice}</div>
            </div>
        </div>
    `;

    if (phase === 'buy') {
        div.onclick = () => buyCard(card);
    } else {
        div.onclick = () => sellCard(card);
    }

    return div;
}

// Buy card with sound effect and animation
function buyCard(card) {
    if (gameState.money >= card.currentPrice) {
        sounds.buy.play();
        gameState.money -= card.currentPrice;
        gameState.inventory.push({
            ...card,
            boughtPrice: card.currentPrice
        });
        
        // Add buying animation
        const cardElement = event.currentTarget;
        cardElement.style.transform = 'scale(0.8) translateY(-20px)';
        cardElement.style.opacity = '0';
        setTimeout(() => {
            cardElement.style.transform = '';
            cardElement.style.opacity = '';
        }, 300);
        
        updateUI();
        displayInventory();
    } else {
        alert("Not enough money!");
    }
}

// Sell card with sound effect and animation
function sellCard(card) {
    const inventoryIndex = gameState.inventory.findIndex(item => item.name === card.name);
    if (inventoryIndex !== -1) {
        const soldCard = gameState.inventory[inventoryIndex];
        gameState.money += card.currentPrice;
        gameState.inventory.splice(inventoryIndex, 1);
        
        // Play appropriate sound
        const profit = card.currentPrice - soldCard.boughtPrice;
        sounds[profit >= 0 ? 'profit' : 'loss'].play();
        
        // Add selling animation
        const cardElement = event.currentTarget;
        cardElement.style.transform = 'scale(0.8) translateY(20px)';
        cardElement.style.opacity = '0';
        setTimeout(() => {
            cardElement.style.transform = '';
            cardElement.style.opacity = '';
        }, 300);
        
        addToResults(soldCard.name, profit);
        updateUI();
        displayInventory();
    }
}

// Display inventory with enhanced card display
function displayInventory() {
    const inventory = document.getElementById('player-inventory');
    inventory.innerHTML = '<h3>Your Cards:</h3>';
    
    if (gameState.inventory.length === 0) {
        inventory.innerHTML += '<p>No cards in inventory</p>';
        return;
    }

    const inventoryGrid = document.createElement('div');
    inventoryGrid.className = 'market-cards';
    
    gameState.inventory.forEach(card => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="card-inner">
                <img src="${card.image}" alt="${card.name}">
                <div class="card-details">
                    <div class="card-name">${card.name}</div>
                    <div class="card-set">${card.set}</div>
                    <div class="card-price">Bought: 💰 ${card.boughtPrice}</div>
                </div>
            </div>
        `;
        inventoryGrid.appendChild(div);
    });
    
    inventory.appendChild(inventoryGrid);
}

// Display target card with enhanced styling
function displayTargetCard() {
    const targetCardElement = document.getElementById('target-card');
    targetCardElement.innerHTML = `
        <div class="card-inner">
            <img src="${premiumCard.image}" alt="${premiumCard.name}">
            <div class="card-details">
                <div class="card-name">${premiumCard.name}</div>
                <div class="card-set">${premiumCard.set}</div>
                <div class="card-price">💰 ${premiumCard.basePrice}</div>
            </div>
        </div>
    `;
}

// Add result with enhanced styling
function addToResults(cardName, profit) {
    const results = document.getElementById('turn-results');
    const resultElement = document.createElement('div');
    resultElement.className = profit >= 0 ? 'profit' : 'loss';
    resultElement.innerHTML = `
        <div class="result-card">
            <span class="result-name">${cardName}</span>
            <span class="result-profit">${profit >= 0 ? '+' : ''}${profit} 💰</span>
        </div>
    `;
    results.appendChild(resultElement);
}

// Update UI elements
function updateUI() {
    document.getElementById('player-money').textContent = gameState.money;
    document.getElementById('turn-counter').textContent = gameState.turn;
}

// Stage management
function nextStage() {
    const stages = ['buy', 'sell', 'results'];
    const currentIndex = stages.indexOf(gameState.currentStage);
    const nextIndex = (currentIndex + 1) % stages.length;
    
    document.querySelector('.stage.active').classList.remove('active');
    document.getElementById(`${stages[nextIndex]}-stage`).classList.add('active');
    
    gameState.currentStage = stages[nextIndex];
    
    if (stages[nextIndex] === 'sell') {
        generateMarket('sell');
        displayInventory();
    }
}

// Start next turn with market event check
function nextTurn() {
    gameState.turn++;
    gameState.currentStage = 'buy';
    checkForMarketEvent();
    
    document.getElementById('turn-results').innerHTML = '';
    document.querySelector('.stage.active').classList.remove('active');
    document.getElementById('buy-stage').classList.add('active');
    
    generateMarket('buy');
    updateUI();
    displayMarketEvent();
    
    if (gameState.money >= premiumCard.basePrice) {
        showWinScreen();
    }
}

// Show win screen
function showWinScreen() {
    const winScreen = document.createElement('div');
    winScreen.className = 'win-screen';
    winScreen.innerHTML = `
        <div class="win-content">
            <h2>🎉 Congratulations! 🎉</h2>
            <p>You've earned enough to buy the ${premiumCard.name}!</p>
            <p>Total Turns: ${gameState.turn}</p>
            <button onclick="location.reload()">Play Again</button>
        </div>
    `;
    document.body.appendChild(winScreen);
    sounds.profit.play();
}

// Start the game
initGame(); 