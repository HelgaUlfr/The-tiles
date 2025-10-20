import { furryStats, hostilityChances, furryTypes, furryData } from './furries.js';
window.simulateEncounters = function(furryType, count = 100, mode = 'normal') {
    const playerBase = { hp: 100, fight: 15, flirt: 15, feast: 15, fuck: 20, flee: 20, feed: 10 };
    let furryBase = furryStats[furryType];
    if (!furryBase) { console.error('Unknown furry type:', furryType); return; }
    let furryHostility = hostilityChances[furryType] || 0;
    let playerWins = 0, furryWins = 0, ties = 0;
    let playerMult = 1, furryMult = 1;
    if (mode === 'hard') { playerMult = 1; furryMult = 1.25; }
    if (mode === 'easy') { playerMult = 1.25; furryMult = 1; }
    for (let i = 0; i < count; i++) {
        let player = { ...playerBase };
        let furry = { ...furryBase };
        player.hp = Math.round(player.hp * playerMult);
        furry.hp = Math.round(furry.hp * furryMult);
        // Decide if encounter is hostile
        const hostile = Math.random() < furryHostility;
        if (!hostile) { ties++; continue; }
        // Simulate simple fight: take turns, player first
        let turn = 0;
        while (player.hp > 0 && furry.hp > 0) {
            if (turn % 2 === 0) furry.hp -= player.fight;
            else player.hp -= furry.fight;
            turn++;
        }
        if (player.hp > 0 && furry.hp <= 0) playerWins++;
        else if (furry.hp > 0 && player.hp <= 0) furryWins++;
        else ties++;
    }
    console.log(`Simulated ${count} ${furryType} encounters [${mode}]:`);
    console.log(`Player wins: ${playerWins}`);
    console.log(`Furry wins: ${furryWins}`);
    console.log(`Ties/non-hostile: ${ties}`);
};
// Sync all relevant game state to window for saving
export function syncGameStateForSave() {
    window.worldSeed = worldSeed;
    window.playerPosition = playerPosition;
    window.playerStats = playerStats;
    window.totalTilesWalked = totalTilesWalked;
    window.map = map;
    window.furries = furries;
    window.decorations = decorations;
    window.visited = visited;
    window.followers = followers;
    window.cycleStartTime = cycleStartTime;
    window.currentFurry = currentFurry;
    window.currentEncounterPos = currentEncounterPos;
    window.enemyGroup = enemyGroup;
    window.isPlayerDead = isPlayerDead;
    window.findSafeSpawnLocation = findSafeSpawnLocation;
}
window.syncGameStateForSave = syncGameStateForSave;

// --- Narrator Settings State ---
const narratorSettings = {
    speed: parseFloat(localStorage.getItem('narrationSpeed')) || 1.0, // seconds per message
    size: parseFloat(localStorage.getItem('narrationSize')) || 1.0,  // scale (1x = default)
    scale: parseFloat(localStorage.getItem('settingsScale')) || 1.0,  // settings panel scale
};

function saveNarratorSettings() {
    localStorage.setItem('narrationSpeed', narratorSettings.speed);
    localStorage.setItem('narrationSize', narratorSettings.size);
    localStorage.setItem('settingsScale', narratorSettings.scale);
}

function applyNarratorSettings() {
    // Text size
    const battleNarrator = document.getElementById('battleNarrator');
    if (battleNarrator) {
        battleNarrator.style.fontSize = (14 * narratorSettings.size) + 'px';
    }
    // Settings panel scale
    const panel = document.getElementById('narratorSettingsPanel');
    if (panel) {
        panel.style.transform = `scale(${narratorSettings.scale})`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Settings UI logic
    const gear = document.getElementById('narratorSettingsGear');
    const panel = document.getElementById('narratorSettingsPanel');
    const speedSlider = document.getElementById('narrationSpeedSlider');
    const speedValue = document.getElementById('narrationSpeedValue');
    const sizeSlider = document.getElementById('narrationSizeSlider');
    const sizeValue = document.getElementById('narrationSizeValue');
    const scaleSlider = document.getElementById('settingsScaleSlider');
    const scaleValue = document.getElementById('settingsScaleValue');

    // Set initial values
    speedSlider.value = narratorSettings.speed;
    speedValue.textContent = narratorSettings.speed.toFixed(2) + 's';
    sizeSlider.value = narratorSettings.size;
    sizeValue.textContent = narratorSettings.size.toFixed(2) + 'x';
    scaleSlider.value = narratorSettings.scale;
    scaleValue.textContent = narratorSettings.scale.toFixed(2) + 'x';
    applyNarratorSettings();

    // Preload tile sounds for instant playback
    preloadTileSounds();

    gear.onclick = () => {
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    };
    speedSlider.oninput = () => {
        narratorSettings.speed = parseFloat(speedSlider.value);
        speedValue.textContent = narratorSettings.speed.toFixed(2) + 's';
        saveNarratorSettings();
    };
    sizeSlider.oninput = () => {
        narratorSettings.size = parseFloat(sizeSlider.value);
        sizeValue.textContent = narratorSettings.size.toFixed(2) + 'x';
        applyNarratorSettings();
        saveNarratorSettings();
    };
    scaleSlider.oninput = () => {
        narratorSettings.scale = parseFloat(scaleSlider.value);
        scaleValue.textContent = narratorSettings.scale.toFixed(2) + 'x';
        applyNarratorSettings();
        saveNarratorSettings();
    };
});

// Apply settings on load
applyNarratorSettings();

// Modular narrator imports
import grassNarrator from './grassNarrator.js';
import forestNarrator from './forestNarrator.js';
import pondNarrator from './pondNarrator.js';
import swampNarrator from './swampNarrator.js';
import pathNarrator from './pathNarrator.js';
import tundraNarrator from './tundraNarrator.js';

// Map tile type to narrator object
const tileNarrators = {
    grass: grassNarrator,
    forest: forestNarrator,
    pond: pondNarrator,
    swamp: swampNarrator,
    path: pathNarrator,
    tundra: tundraNarrator,
};

// Helper to get the current NarratorLines object for the player's tile
function getCurrentNarratorLines() {
    const tileType = getCurrentTileType();
    const NarratorLines = tileNarrators[tileType] || grassNarrator;
    if (!NarratorLines.hostileEncounter) NarratorLines.hostileEncounter = (name) => `${name} confronts you!`;
    if (!NarratorLines.nonhostileEncounter) NarratorLines.nonhostileEncounter = (name) => `${name} greets you.`;
    return NarratorLines;
}

// Narrate the current tile using the correct environment narrator
function narrateTile(tileType) {
    const narrator = tileNarrators[tileType] || grassNarrator;
    const lines = narrator.tile && narrator.tile[tileType];
    if (lines && lines.length) {
        // Pick a random line
        const line = lines[Math.floor(Math.random() * lines.length)];
        updateNarrator(line);
    }
}

function getCurrentTileType() {
    // Assumes playerPosition and map are defined
    return map[playerPosition.x][playerPosition.y] || 'grass';
}

function getCurrentNarrator() {
    const tileType = getCurrentTileType();
    return tileNarrators[tileType] || grassNarrator;
}
const TILE_HUNGER_STEP = 40; // tiles walked before hunger depletes (matches movePlayer logic)
const TILE_HUNGER_RAMP = 100; // tiles before hunger depletion rate increases
const HUNGER_DEPLETION_RAMP = 5; // how much to increase depletion rate

// --- Enemy Board Empty Hint Helpers ---
function ensureEnemyEmptyHint() {
    const enemyBoard = document.getElementById('enemyBoard');
    if (!enemyBoard) return null;
    let hint = document.getElementById('enemyEmptyHint');
    if (!hint) {
        hint = document.createElement('div');
        hint.id = 'enemyEmptyHint';
        hint.textContent = 'no one is here';
        enemyBoard.insertBefore(hint, enemyBoard.querySelector('#enemyCard') || enemyBoard.firstChild);
    }
    return hint;
}

function setEnemyEmptyUI() {
    const enemyBoard = document.getElementById('enemyBoard');
    if (enemyBoard) enemyBoard.style.display = 'block'; // always visible
    const hint = ensureEnemyEmptyHint();
    
    // Check if there are any enemies present
    const hasMainEnemy = currentFurry && currentFurry.hp > 0;
    const hasGroupEnemies = enemyGroup.length > 1; // [0] is main enemy, so group members start at [1]
    
    // Also check for visible enemy cards in DOM
    const enemyCard = document.getElementById('enemyCard');
    const hasVisibleEnemyCard = enemyCard && enemyCard.style.display !== 'none';
    
    const hasVisibleFollowerCards = Array.from(enemyBoard.querySelectorAll('.enemy-group-member'))
        .some(card => card.style.display !== 'none' && card.offsetParent !== null);
    
    const hasAnyEnemies = hasMainEnemy || hasGroupEnemies || hasVisibleEnemyCard || hasVisibleFollowerCards;
    if (hint) hint.style.display = hasAnyEnemies ? 'none' : 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    setEnemyEmptyUI();
});
let mapSize = 110; // Map size
let worldSeed = Math.floor(Math.random() * 1e9); // World seed, initialized randomly
const viewRange = 4; // Viewing range of the player
let playerPosition = { x: 0, y: 0 }; // Initial player position
let previousPosition = { x: 0, y: 0 }; // Track the tile player moved from

// Game state flags
let isGameLoading = false; // Prevent encounters during game loading
let isPlayerDead = false; // Track if player is currently dead

// Minimap pulse animation variables
let pulseTime = 0; // Animation time tracker
let pulseAnimationId = null; // Animation frame ID
let lastPulseTime = 0; // Track when last pulse started
const PULSE_INTERVAL = 3000; // Pulse every 3 seconds (slower)
const PULSE_DURATION = 2000; // How long each pulse takes to complete (shorter)

// Persistent encounter storage - enemies stay on tiles until repopulation
let persistentEncounters = {}; // Format: "x_y": { furry: {...}, enemyGroup: [...], lastModified: timestamp }
let currentEncounterKey = null; // Track current encounter key for saving state
let map = []; // Map data
let furries = []; // Array to store furries on the map
let decorations = []; // Array to store decorations on the map
let visited = []; // Track visited tiles
let minimapExpanded = false; // Track minimap state

const adjectives = [
    "Fluffy", "Wild", "Mischievous", "Cuddly", "Playful", "Pawsome", "Brave", "Sly", "Energetic", "Fierce", "Charming", "Silky", "Agile", "Rugged", "Softhearted", "Dashing", "Bouncy", "Cheerful", "Mysterious", "Loyal", "Spirited", "Dreamy", "Swift", "Handsome", "Clever", "Sporty", "Kindhearted", "Feral", "Fiercely protective", "Flirty", "Gentle", "Curious", "Bubbly", "Athletic", "Snuggly", "Snarky", "Tough", "Confident", "Glowing", "Devoted", "Bold", "Scruffy", "Vibrant", "Tender", "Roaring", "Hypnotic", "Zesty", "Stealthy", "Majestic", "Adventurous"
];

const genders = ["Boy", "Girl"];

const grassDecorTypes = ["grass-spot", "grass-spot2"];
const flowerDecorTypes = ["flower", "flower2"];
const decorTypes = [...grassDecorTypes, ...flowerDecorTypes];

let playerName = 'Player';
let gameMode = 'normal';
let enemyStatMultiplier = 1;

const datastore = {
    prefix: 'tileSave',
    load(slot) {
        try {
            return JSON.parse(localStorage.getItem(`${this.prefix}${slot}`));
        } catch {
            return null;
        }
    },
    save(slot, data) {
        localStorage.setItem(`${this.prefix}${slot}`, JSON.stringify(data));
    },
    all() {
        return [0, 1, 2].map(i => this.load(i));
    }
};

let selectedSlot = null;

function getRandomLine(value) {
    if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
    }
    return value;
}


// Narration speed: 0.5s (fastest) to 5s (slowest) for full message
async function slowType(el, text, speedSec = narratorSettings.speed) {
    el.textContent = '';
    if (speedSec <= 0.01) {
        el.textContent = text;
        return;
    }
    const delay = Math.max(5, Math.floor((speedSec * 1000) / Math.max(1, text.length)));
    for (const ch of text) {
        el.textContent += ch;
        await new Promise(r => setTimeout(r, delay));
    }
}

async function slowTypeAnimated(el, text, speedSec = narratorSettings.speed, animationType = 'fade') {
    el.innerHTML = '';
    
    // Auto-detect animation type based on message content if not specified
    if (animationType === 'auto') {
        animationType = detectAnimationType(text);
    }
    
    if (speedSec <= 0.01) {
        // Fast mode - just apply animation to whole text
        const span = document.createElement('span');
        span.className = `narrator-${animationType}`;
        span.textContent = text;
        el.appendChild(span);
        return;
    }
    
    // Split text into words for animated typing
    const words = text.split(' ');
    const baseDelay = Math.max(50, Math.floor((speedSec * 1000) / Math.max(1, words.length)));
    
    for (let i = 0; i < words.length; i++) {
        const span = document.createElement('span');
        span.className = `narrator-${animationType}`;
        span.textContent = words[i] + (i < words.length - 1 ? ' ' : '');
        
        // Stagger animation delays for smoother appearance
        span.style.animationDelay = `${i * 0.1}s`;
        
        el.appendChild(span);
        await new Promise(r => setTimeout(r, baseDelay));
    }
}

// Auto-detect appropriate animation type based on message content
function detectAnimationType(text) {
    const lowerText = text.toLowerCase();
    
    // Critical/dramatic events
    if (lowerText.includes('critical') || lowerText.includes('devastating') || 
        lowerText.includes('massive') || lowerText.includes('overwhelming')) {
        return 'critical';
    }
    
    // Damage/attack messages
    if (lowerText.includes('damage') || lowerText.includes('hits') || 
        lowerText.includes('strikes') || lowerText.includes('attacks') || 
        lowerText.includes('wounds') || lowerText.includes('hurts')) {
        return 'damage';
    }
    
    // Healing/recovery messages
    if (lowerText.includes('heal') || lowerText.includes('recover') || 
        lowerText.includes('restore') || lowerText.includes('better') || 
        lowerText.includes('refreshed')) {
        return 'heal';
    }
    
    // Special events/abilities
    if (lowerText.includes('special') || lowerText.includes('magic') || 
        lowerText.includes('ability') || lowerText.includes('skill') || 
        lowerText.includes('enchant') || lowerText.includes('cast')) {
        return 'special';
    }
    
    // Action/movement messages get pop animation
    if (lowerText.includes('moves') || lowerText.includes('approaches') || 
        lowerText.includes('retreats') || lowerText.includes('dodges')) {
        return 'pop';
    }
    
    // Default to slide animation
    return 'slide';
}

async function updateNarrator(message, animationType = 'auto') {
    const narratorLog = document.getElementById('narratorLog');
    if (!narratorLog) return;
    const line = getRandomLine(message);
    const section = document.createElement('div');
    section.className = 'narrator-section';
    const entry = document.createElement('div');
    entry.className = 'narrator-entry';
    section.appendChild(entry);
    const divider = document.createElement('hr');
    section.appendChild(divider);
    narratorLog.insertBefore(section, narratorLog.firstChild);
    narratorLog.parentElement.style.display = 'block';
    narratorLog.parentElement.scrollTop = 0;
    await slowTypeAnimated(entry, line, narratorSettings.speed, animationType);
}

function clearNarrator() {
    const narratorLog = document.getElementById('narratorLog');
    if (narratorLog) narratorLog.innerHTML = '';
}

// Convenient helper functions for specific animation types
async function updateNarratorDamage(message) {
    return updateNarrator(message, 'damage');
}

async function updateNarratorHeal(message) {
    return updateNarrator(message, 'heal');
}

async function updateNarratorSpecial(message) {
    return updateNarrator(message, 'special');
}

async function updateNarratorCritical(message) {
    return updateNarrator(message, 'critical');
}

async function updateNarratorAction(message) {
    return updateNarrator(message, 'pop');
}

async function updateNarratorAuto(message) {
    return updateNarrator(message, 'auto');
}

// Export animation functions for use in other modules
window.updateNarrator = updateNarrator;
window.updateNarratorDamage = updateNarratorDamage;
window.updateNarratorHeal = updateNarratorHeal;
window.updateNarratorSpecial = updateNarratorSpecial;
window.updateNarratorCritical = updateNarratorCritical;
window.updateNarratorAction = updateNarratorAction;
window.updateNarratorAuto = updateNarratorAuto;

// Demo function to show all animation types (for testing)
window.demoNarratorAnimations = async function() {
    const NarratorLines = getCurrentNarratorLines();
    await updateNarratorDamage(NarratorLines.enemyHitPlayer("Wolf", 15));
    await new Promise(r => setTimeout(r, 800));
    
    await updateNarratorHeal(["You feel refreshed and restored."]);
    await new Promise(r => setTimeout(r, 800));
    
    await updateNarratorSpecial(NarratorLines.enemyFlirtDebuff);
    await new Promise(r => setTimeout(r, 800));
    
    await updateNarratorCritical(NarratorLines.playerDamage());
    await new Promise(r => setTimeout(r, 800));
    
    await updateNarratorAction(NarratorLines.nonhostileEncounter("Friendly Fox"));
    await new Promise(r => setTimeout(r, 800));
    
    await updateNarrator(NarratorLines.tile.grass, 'slide');
};

function sizeNarratorToMap() {
    const narratorBox = document.getElementById('battleNarrator');
    const mapContainer = document.getElementById('map');
    if (!narratorBox || !mapContainer) return;
    narratorBox.style.position = 'static';
    narratorBox.style.width = mapContainer.offsetWidth + 'px';
    narratorBox.style.height = mapContainer.offsetHeight + 'px';
}

function sizeNarratorForBattle() {
    const narratorBox = document.getElementById('battleNarrator');
    const battleContainer = document.getElementById('battleContainer');
    if (!narratorBox || !battleContainer) return;
    const rect = battleContainer.getBoundingClientRect();
    const availableWidth = window.innerWidth - rect.right - 20;
    narratorBox.style.position = 'fixed';
    narratorBox.style.top = rect.top + 'px';
    narratorBox.style.right = '10px';
    narratorBox.style.width = availableWidth + 'px';
    narratorBox.style.height = rect.height + 'px';
}

function showOutcome(message, onContinue) {
    const screen = document.getElementById('outcomeScreen');
    const msgEl = document.getElementById('outcomeMessage');
    const btn = document.getElementById('outcomeContinue');
    if (!screen || !msgEl || !btn) return;
    msgEl.textContent = message;
    btn.onclick = function() {
        screen.style.display = 'none';
        if (typeof onContinue === 'function') {
            onContinue();
        }
    };
    screen.style.display = 'flex';
}

function makeEnemyHostile() {
    if (!currentFurry || currentFurry.hostile) return;
    currentFurry.hostile = true;
    showHostileOverlay();
    // Initialize turn order when enemy becomes hostile
    initializeTurnOrder();
}

function countActiveHostileEnemies() {
    let count = 0;
    // Check main enemy
    if (currentFurry && currentFurry.hp > 0 && currentFurry.hostile && !currentFurry.sleeping) {
        count++;
    }
    // Check enemy group members
    for (let i = 1; i < enemyGroup.length; i++) {
        const enemy = enemyGroup[i];
        if (enemy && enemy.hp > 0 && enemy.hostile && !enemy.sleeping) {
            count++;
        }
    }
    return count;
}

function applyFlirtDebuff(enemy) {
    const activeHostileEnemies = countActiveHostileEnemies();
    
    if (activeHostileEnemies <= 1) {
        // Single enemy or last hostile enemy - turn neutral
        enemy.hostile = false;
        const NarratorLines = getCurrentNarratorLines();
        updateNarratorSpecial(NarratorLines.enemyFlirtDebuff);
        hideHostileOverlay();
        exitBattleMode(); // Exit battle mode when enemy becomes non-hostile
    } else {
        // Multiple enemies - apply sleep debuff
        enemy.sleeping = true;
        const NarratorLines = getCurrentNarratorLines();
        updateNarratorSpecial(NarratorLines.enemySleep);
        // Check if we need to update turn order after applying sleep
        if (countActiveHostileEnemies() === 0) {
            exitBattleMode(); // Exit battle mode when all enemies neutral
        }
    }
}

function clearSleepDebuffs() {
    // Clear sleep from main enemy
    if (currentFurry) {
        currentFurry.sleeping = false;
    }
    // Clear sleep from all enemy group members
    for (let i = 0; i < enemyGroup.length; i++) {
        if (enemyGroup[i]) {
            enemyGroup[i].sleeping = false;
        }
    }
}

function showHostileOverlay() {
    const overlay = document.getElementById('screenOverlay');
    if (overlay) overlay.style.backgroundColor = 'rgba(255,0,0,0.3)';
}

function hideHostileOverlay() {
    const overlay = document.getElementById('screenOverlay');
    if (overlay) overlay.style.backgroundColor = 'rgba(255,0,0,0)';
}

// Character stats
const playerStats = {
    hp: 100,
    hunger: 100,
    xp: 0,
    level: 1,
    fight: 15,
    flirt: 15,
    feast: 15,
    fuck: 20,
    flee: 20,
    feed: 10
};

let xpThreshold = 100; // XP needed for the next level
let currentFurry = null;
// Debug wrapper for pendingAction to track when it gets cleared
let _pendingAction = null;
let _pendingActor = null;

Object.defineProperty(window, 'pendingAction', {
    get() { return _pendingAction; },
    set(value) { 
        if (_pendingAction !== null && value === null) {
            console.log('DEBUG: pendingAction cleared! Was:', _pendingAction, 'Stack:', new Error().stack.split('\n').slice(1,3).join(' <- '));
        } else if (value !== null) {
            console.log('DEBUG: pendingAction set to:', value);
        }
        _pendingAction = value; 
    }
});

Object.defineProperty(window, 'pendingActor', {
    get() { return _pendingActor; },
    set(value) { 
        if (_pendingActor !== null && value === null) {
            console.log('DEBUG: pendingActor cleared!');
        }
        _pendingActor = value; 
    }
});
let currentEncounterPos = null;
let playerCardFirstSlide = true;
let enemyCardHideTimeout = null;
let followers = [];
let tilesWalked = 0;
let totalTilesWalked = 0;
let hungerDepletionRate = 10;
const dayDuration = 10 * 60 * 1000; // 10 minutes for a full cycle
const dayStages = ['morning', 'day', 'evening', 'night'];
let cycleStartTime = Date.now();
let enemyGroup = [];

// Track which specific enemy is being targeted in group encounters
let targetedEnemyIndex = 0; // 0 = main enemy (currentFurry), 1+ = enemyGroup members

// --- Ally XP System ---
function gainAllyXP(index, amount) {
    if (!followers[index]) return;
    let ally = followers[index];
    if (typeof ally.xp !== 'number') ally.xp = 0;
    if (typeof ally.level !== 'number') ally.level = 1;
    if (typeof ally.xpThreshold !== 'number') ally.xpThreshold = 100;
    const oldXP = ally.xp;
    ally.xp += amount;
    // Animate XP bar (new markup)
    const xpBar = document.querySelector(`#follower-${index} .stat-bar-fill`);
    if (xpBar) {
        const percent = Math.min(ally.xp / ally.xpThreshold * 100, 100);
        xpBar.style.width = `${percent}%`;
    }
    const xpText = document.querySelector(`#follower-${index} .bar-text`);
    if (xpText) xpText.textContent = `${ally.xp}/${ally.xpThreshold}`;
    // Level up if needed
    while (ally.xp >= ally.xpThreshold) {
        ally.xp -= ally.xpThreshold;
        ally.level += 1;
        ally.xpThreshold += 100;
        // Optionally: boost stats on level up
        ally.fight += 2;
        ally.flirt += 2;
        ally.feast += 2;
        ally.fuck += 2;
        ally.flee += 2;
        ally.feed += 1;
        ally.maxHp += 5;
        ally.hp = ally.maxHp;
        // Animate level up (new markup)
        const card = document.getElementById(`follower-${index}`);
        if (card) {
            const levelSpan = card.querySelector('.playerLevelText');
            if (levelSpan) {
                levelSpan.textContent = ally.level;
                levelSpan.classList.add('level-up');
                setTimeout(() => levelSpan.classList.remove('level-up'), 800);
            }
        }
    }
    // Update UI
    updateFollowersUI();
}
                                                                    

// Wait for the DOM to be ready before updating stats to avoid null elements
document.addEventListener('DOMContentLoaded', () => {
    if (typeof updatePlayerStats === 'function') {
        updatePlayerStats();
    }
    const minimap = document.getElementById('minimap');
    if (minimap) {
        minimap.addEventListener('click', toggleMinimapSize);
    }
    updateDayNightCycle();
});

function updateDayNightCycle() {
    const mapEl = document.getElementById('map');
    if (!mapEl) {
        requestAnimationFrame(updateDayNightCycle);
        return;
    }
    const elapsed = (Date.now() - cycleStartTime) % dayDuration;
    const quarter = dayDuration / 4;
    let brightness;
    if (elapsed < quarter) {
        brightness = 0.5 + (elapsed / quarter) * 0.5;
    } else if (elapsed < quarter * 2) {
        brightness = 1;
    } else if (elapsed < quarter * 3) {
        brightness = 1 - ((elapsed - quarter * 2) / quarter) * 0.5;
    } else {
        brightness = 0.5;
    }
    mapEl.style.setProperty('--brightness', brightness.toFixed(2));
    const stageIndex = Math.floor(elapsed / quarter);
    const stage = dayStages[stageIndex];
    dayStages.forEach(s => mapEl.classList.remove(s));
    mapEl.classList.add(stage);
    requestAnimationFrame(updateDayNightCycle);
}

// Function to generate the map
function generateMap() {
    prngSeed = worldSeed; // Reset PRNG for reproducible world generation
    if (useSparse) {
        map = makeSparse2D();
        furries = makeSparse2D();
        decorations = makeSparse2D();
        visited = makeSparse2D();
        for (let i = 0; i < mapSize; i++) {
            for (let j = 0; j < mapSize; j++) {
                const randomVal = seededRandom();
                setMapTile(i, j, randomVal < 0.6 ? 'grass' : randomVal < 0.85 ? 'forest' : 'pond');
                setFurry(i, j, null);
                setDecorations(i, j, []);
                setVisited(i, j, false);
            }
        }
    } else {
        for (let i = 0; i < mapSize; i++) {
            map[i] = [];
            furries[i] = [];
            decorations[i] = [];
            visited[i] = [];
            for (let j = 0; j < mapSize; j++) {
                const randomVal = Math.random();
                if (randomVal < 0.6) {
                    map[i][j] = 'grass'; // 60% chance of grass
                } else if (randomVal < 0.85) {
                    map[i][j] = 'forest'; // 25% chance of forest
                } else {
                    map[i][j] = 'pond'; // 15% chance of pond
                }
                furries[i][j] = null; // Initialize with no furries
                decorations[i][j] = [];
                visited[i][j] = false;
            }
        }
    }
    generateCurvedPaths();
    // Spawn larger clustered biomes for swamp and tundra
    generateBiomeClusters('swamp', 3, 15, 25);
    generateBiomeClusters('tundra', 2, 20, 30);
    generateMountains();
    spawnFurries();
    generateDecorations();
    placePlayerOnPath(); // Place the player on a path tile
}

function updatePlayerStats() {
    if (!playerStats) {
      console.error("Player stats not defined");
      return;
    }
    const fightEl = document.getElementById('playerFightVal');
    const flirtEl = document.getElementById('playerFlirtVal');
    const feastEl = document.getElementById('playerFeastVal');
    const fuckEl = document.getElementById('playerFunVal');
    const fleeEl = document.getElementById('playerFleeVal');
    const feedEl = document.getElementById('playerFeedVal');

    if (fightEl) fightEl.textContent = playerStats.fight;
    if (flirtEl) flirtEl.textContent = playerStats.flirt;
    if (feastEl) feastEl.textContent = playerStats.feast;
    if (fuckEl) fuckEl.textContent = playerStats.fuck;
    if (fleeEl) fleeEl.textContent = playerStats.flee;
    if (feedEl) feedEl.textContent = playerStats.feed;

    updateHPBars();
}

// Cache DOM elements for hot-path functions
const playerHPBar = document.getElementById('playerHPBar');
const playerHPText = document.getElementById('playerHPText');
const playerHungerBar = document.getElementById('playerHungerBar');
const playerHungerText = document.getElementById('playerHungerText');
const playerXPBar = document.getElementById('playerXPBar');
const playerXPText = document.getElementById('playerXPText');
const playerLevelText = document.getElementById('playerLevelText');
const enemyHPBar = document.getElementById('enemyHPBar');
const enemyHP = document.getElementById('enemyHP');
const enemyFlirtBar = document.getElementById('enemyFlirtBar');
const enemyFlirtText = document.getElementById('enemyFlirtText');

function updateHPBars() {
    // Fix: Use playerStats.maxHp instead of hardcoded 100
    const playerPercent = Math.max(playerStats.hp, 0) / Math.max(playerStats.maxHp, 1) * 100;
    if (playerHPBar) playerHPBar.style.width = `${playerPercent}%`;
    if (playerHPText) playerHPText.textContent = `${playerStats.hp}/${playerStats.maxHp}`;

    const hungerPercent = Math.max(playerStats.hunger, 0) / 100 * 100;
    if (playerHungerBar) playerHungerBar.style.width = `${hungerPercent}%`;
    if (playerHungerText) playerHungerText.textContent = playerStats.hunger > 0 ? playerStats.hunger : 'Starving';

    const xpPercent = Math.min(playerStats.xp / xpThreshold * 100, 100);
    if (playerXPBar) playerXPBar.style.width = `${xpPercent}%`;
    if (playerXPText) playerXPText.textContent = `${playerStats.xp}/${xpThreshold}`;
    if (playerLevelText) playerLevelText.textContent = playerStats.level;

    if (currentFurry) {
        const furryPercent = Math.max(currentFurry.hp, 0) / currentFurry.maxHp * 100;
        if (enemyHPBar) enemyHPBar.style.width = `${furryPercent}%`;
        if (enemyHP) enemyHP.textContent = (currentFurry.hp <= 0 && currentFurry.wounded)
            ? 'Wounded'
            : `${currentFurry.hp}/${currentFurry.maxHp}`;
        if (enemyFlirtBar) enemyFlirtBar.style.width = `${currentFurry.flirtBar}%`;
        if (enemyFlirtText) enemyFlirtText.textContent = currentFurry.flirtBar >= 100 ? 'Horny' : Math.floor(currentFurry.flirtBar);
    } else {
        if (enemyHPBar) enemyHPBar.style.width = '0%';
        if (enemyHP) enemyHP.textContent = '0/0';
        if (enemyFlirtBar) enemyFlirtBar.style.width = '0%';
        if (enemyFlirtText) enemyFlirtText.textContent = '0';
    }
}

function showFloatingText(parent, text, direction = 'up', percent = null) {
    if (!parent) return;
    if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
    }
    const floatEl = document.createElement('span');
    floatEl.className = `floating-text ${direction === 'down' ? 'float-down' : 'float-up'}`;
    floatEl.textContent = text;
    const bar = parent.querySelector('.stat-bar-fill, .hp-fill, .hunger-fill');
    let left;
    if (bar) {
        const containerWidth = parent.offsetWidth;
        if (percent !== null) {
            left = containerWidth * (percent / 100);
        } else {
            left = bar.offsetWidth;
        }
    } else {
        left = parent.offsetWidth / 2;
    }
    floatEl.style.left = `${left}px`;
    floatEl.style.transform = 'translate(-50%, 0)';
    const drift = (Math.random() - 0.5) * 30;
    floatEl.style.setProperty('--x', `${drift}px`);
    parent.appendChild(floatEl);
    setTimeout(() => floatEl.remove(), 2000);
}

function animateStatBar(barId, oldPercent, newPercent) {
    const bar = document.getElementById(barId);
    if (!bar || oldPercent === newPercent) return;
    const container = bar.parentElement;
    const highlight = document.createElement('div');
    const diff = newPercent - oldPercent;
    highlight.className = diff > 0 ? 'stat-bar-highlight' : 'stat-bar-loss';
    highlight.style.left = `${Math.min(oldPercent, newPercent)}%`;
    highlight.style.width = `${Math.abs(diff)}%`;
    highlight.style.setProperty('--diff', `${diff}%`);
    container.appendChild(highlight);
    setTimeout(() => highlight.remove(), 500);
}

function hideEnemyCard() {
    const card = document.getElementById('enemyCard');
    const container = document.getElementById('enemyFollowersContainer');
    if (!card) return;
    card.classList.remove('slide-in-right','slide-out-right');
    void card.offsetWidth;
    card.classList.add('slide-out-right');
    if (enemyCardHideTimeout) clearTimeout(enemyCardHideTimeout);
    
    // Animate enemy group cards sliding out with delays
    hideEnemyGroupCards(container);
    
    enemyCardHideTimeout = setTimeout(() => {
        card.style.display = 'none';
        if (container) container.innerHTML = '';
        enemyGroup = [];
        setEnemyEmptyUI();
        exitBattleMode(); // Exit battle mode when enemies are hidden
        enemyCardHideTimeout = null;
    }, 300);
}

function hideEnemyGroupCards(container) {
    if (!container) return;
    
    const groupCards = Array.from(container.querySelectorAll('.enemy-group-member'));
    
    groupCards.forEach((groupCard, index) => {
        setTimeout(() => {
            groupCard.classList.remove('slide-in-right', 'slide-out-right');
            void groupCard.offsetWidth; // Force reflow
            groupCard.classList.add('slide-out-right');
            
            // Remove the card after animation completes
            setTimeout(() => {
                if (groupCard.parentNode) {
                    groupCard.remove();
                }
            }, 300); // Match the CSS animation duration
        }, index * 10); // 10ms delay between each card
    });
}

function isNearPath(x, y, radius = 2) {
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            const nx = (x + dx + mapSize) % mapSize;
            const ny = (y + dy + mapSize) % mapSize;
            if (map[nx][ny] === 'path') {
                return true;
            }
        }
    }
    return false;
}

// Create clusters of rock tiles to represent mountain ranges with varied shapes and sizes
function generateMountains() {
    const mountainCount = Math.floor(Math.random() * 5) + 4; // 4-8 ranges
    for (let m = 0; m < mountainCount; m++) {
        // Randomly choose a shape type: circle, oval, arc, jagged, or blob
        const shapeType = Math.random();
        const centerX = Math.floor(Math.random() * mapSize);
        const centerY = Math.floor(Math.random() * mapSize);

        // Randomize size: small (2-4), medium (5-8), large (9-14)
        let radius;
        if (shapeType < 0.3) {
            radius = Math.floor(Math.random() * 3) + 2; // small
        } else if (shapeType < 0.7) {
            radius = Math.floor(Math.random() * 4) + 5; // medium
        } else {
            radius = Math.floor(Math.random() * 6) + 9; // large
        }

        // For oval shapes, stretch x or y
        const xStretch = shapeType > 0.5 ? Math.random() * 1.5 + 1 : 1;
        const yStretch = shapeType < 0.5 ? Math.random() * 1.5 + 1 : 1;

        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                // Variations for shape
                let dist;
                if (shapeType < 0.2) {
                    // Circle
                    dist = Math.sqrt(dx * dx + dy * dy);
                } else if (shapeType < 0.4) {
                    // Oval
                    dist = Math.sqrt((dx / xStretch) ** 2 + (dy / yStretch) ** 2);
                } else if (shapeType < 0.6) {
                    // Arc (half-mountain)
                    dist = Math.sqrt(dx * dx + dy * dy);
                    if (dy < 0) continue; // Only upper half
                } else if (shapeType < 0.8) {
                    // Jagged: randomize edge
                    dist = Math.sqrt(dx * dx + dy * dy) + Math.random() * 2 - 1;
                } else {
                    // Blob: random noise
                    dist = Math.sqrt(dx * dx + dy * dy) + Math.random() * 3 - 1.5;
                }

                // Place rock if within (radius + random fuzz)
                if (dist <= radius + Math.random() * 2) {
                    const x = (centerX + dx + mapSize) % mapSize;
                    const y = (centerY + dy + mapSize) % mapSize;
                    if (map[x][y] !== 'path' && !isNearPath(x, y)) {
                        map[x][y] = 'rock';
                    }
                }
            }
        }

        

        // Optionally add a few isolated rocks around the mountain for realism
        const outliers = Math.floor(Math.random() * 6) + 3;
        for (let i = 0; i < outliers; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = radius + Math.random() * 4 + 2;
            const x = (centerX + Math.round(Math.cos(angle) * dist) + mapSize) % mapSize;
            const y = (centerY + Math.round(Math.sin(angle) * dist) + mapSize) % mapSize;
            if (map[x][y] !== 'path' && !isNearPath(x, y)) {
                map[x][y] = 'rock';
            }
        }
    }
}

// Create large clustered regions for specific biomes
function generateBiomeClusters(type, count, minRadius, maxRadius) {
    for (let b = 0; b < count; b++) {
        const centerX = Math.floor(Math.random() * mapSize);
        const centerY = Math.floor(Math.random() * mapSize);
        const radius = Math.floor(Math.random() * (maxRadius - minRadius + 1)) + minRadius;

        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= radius + Math.random() * 2) {
                    const x = (centerX + dx + mapSize) % mapSize;
                    const y = (centerY + dy + mapSize) % mapSize;
                    if (map[x][y] !== 'rock' && map[x][y] !== 'pond' && map[x][y] !== 'path') {
                        map[x][y] = type;
                    }
                }
            }
        }
    }
}

// Function to generate continuous curved paths across the map
function generateCurvedPaths() {
    const numPaths = 3; // Number of paths to generate
    for (let p = 0; p < numPaths; p++) {
        let startX = Math.random() < 0.5 ? 0 : mapSize - 1; // Start from either left or right edge
        let startY = Math.floor(Math.random() * mapSize);
        let endX = startX === 0 ? mapSize - 1 : 0; // End on the opposite edge
        let endY = Math.floor(Math.random() * mapSize);

        let currentX = startX;
        let currentY = startY;

        while (currentX !== endX || currentY !== endY) {
            map[currentX][currentY] = 'path';

            // Randomly decide whether to move horizontally or vertically to create a curved path
            if (Math.random() < 0.5) {
                if (currentX < endX) currentX++;
                else if (currentX > endX) currentX--;
            } else {
                if (currentY < endY) currentY++;
                else if (currentY > endY) currentY--;
            }

            // Introduce slight variations for curves
            if (Math.random() < 0.3) {
                if (Math.random() < 0.5) {
                    currentX = Math.min(mapSize - 1, Math.max(0, currentX + (Math.random() < 0.5 ? 1 : -1)));
                } else {
                    currentY = Math.min(mapSize - 1, Math.max(0, currentY + (Math.random() < 0.5 ? 1 : -1)));
                }
            }
        }
    }
}

// Function to place the player on a random path tile, not in the corners
function placePlayerOnPath() {
    let pathTiles = [];

    for (let i = 10; i < mapSize - 10; i++) { // Avoid corners by starting and ending 10 tiles from edges
        for (let j = 10; j < mapSize - 10; j++) {
            if (map[i][j] === 'path') {
                pathTiles.push({ x: i, y: j });
            }
        }
    }

    if (pathTiles.length > 0) {
        const randomIndex = Math.floor(Math.random() * pathTiles.length);
        playerPosition = pathTiles[randomIndex];
        previousPosition = { x: playerPosition.x, y: playerPosition.y };
    }
}

// Count furries currently on the map
function getCurrentFurryCount() {
    let count = 0;
    for (let i = 0; i < mapSize; i++) {
        if (!furries[i]) continue;
        for (let j = 0; j < mapSize; j++) {
            if (furries[i][j]) count++;
        }
    }
    return count;
}

function ensureFurryCounter() {
    // Now always present in DOM, just return it
    return document.getElementById('furryCounter');
}

// Count furries and update the counter
function updateFurryCounter() {
    const count = getCurrentFurryCount();
    const counter = ensureFurryCounter();
    counter.textContent = `Furries: ${count}`;
    // Only show if in game
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer && gameContainer.style.display === 'flex') {
        counter.style.display = 'block';
    } else {
        counter.style.display = 'none';
    }
}

// Update the furry counter every 10 seconds
setInterval(updateFurryCounter, 10000);

function spawnSingleFurry(furryType) {
    if (getCurrentFurryCount() >= 4000) return false;
    const typeInfo = furryTypes.find(a => a.type === furryType);
    if (!typeInfo) return false;
    for (let attempts = 0; attempts < 1000; attempts++) {
        const x = Math.floor(Math.random() * mapSize);
        const y = Math.floor(Math.random() * mapSize);
        if (!map[x] || !furries[x]) continue;
        if (typeInfo.tiles.includes(map[x][y]) && furries[x][y] === null) {
            const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
            const gender = genders[Math.floor(Math.random() * genders.length)];
            const baseStats = furryStats[furryType];
            const size = baseStats.hp <= 50 ? 'Small' : (baseStats.hp <= 90 ? 'Medium' : 'Large');
            const stats = {
                hp: Math.round(baseStats.hp * enemyStatMultiplier),
                fight: Math.round(baseStats.fight * enemyStatMultiplier),
                flirt: Math.round(baseStats.flirt * enemyStatMultiplier),
                feast: Math.round(baseStats.feast * enemyStatMultiplier),
                fuck: Math.round(baseStats.fuck * enemyStatMultiplier),
                flee: Math.round(baseStats.flee * enemyStatMultiplier),
                feed: Math.round(baseStats.feed * enemyStatMultiplier)
            };
            furries[x][y] = {
                name: `${adjective} ${furryType} ${gender}`,
                type: furryType,
                category: furryData[furryType].category,
                size,
                hostile: gameMode === 'peaceful' ? false : Math.random() < (hostilityChances[furryType] || 0),
                maxHp: stats.hp,
                hp: stats.hp,
                fight: stats.fight,
                flirt: stats.flirt,
                feast: stats.feast,
                fuck: stats.fuck,
                flee: stats.flee,
                feed: stats.feed,
                flirtBar: 0,
                wounded: false,
                flirtReady: false
            };
            return true;
        }
    }
    return false;
}

function createEnemyOfType(furryType) {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const baseStats = furryStats[furryType];
    const size = baseStats.hp <= 50 ? 'Small' : (baseStats.hp <= 90 ? 'Medium' : 'Large');
    const stats = {
        hp: Math.round(baseStats.hp * enemyStatMultiplier),
        fight: Math.round(baseStats.fight * enemyStatMultiplier),
        flirt: Math.round(baseStats.flirt * enemyStatMultiplier),
        feast: Math.round(baseStats.feast * enemyStatMultiplier),
        fuck: Math.round(baseStats.fuck * enemyStatMultiplier),
        flee: Math.round(baseStats.flee * enemyStatMultiplier),
        feed: Math.round(baseStats.feed * enemyStatMultiplier)
    };
    return {
        name: `${adjective} ${furryType} ${gender}`,
        type: furryType,
        category: furryData[furryType].category,
        size,
        hostile: gameMode === 'peaceful' ? false : Math.random() < (hostilityChances[furryType] || 0),
        maxHp: stats.hp,
        hp: stats.hp,
        fight: stats.fight,
        flirt: stats.flirt,
        feast: stats.feast,
        fuck: stats.fuck,
        flee: stats.flee,
        feed: stats.feed,
        flirtBar: 0,
        wounded: false,
        flirtReady: false
    };
}

function generateRandomEnemy() {
    const types = Object.keys(furryData);
    const type = types[Math.floor(Math.random() * types.length)];
    return createEnemyOfType(type);
}
// Spawn multiple furries while respecting a 4000 creature limit
function spawnFurries(amount = 500) {
    if (!map.length || !furries.length) return;
    const maxFurries = 4000;
    let toSpawn = Math.min(amount, maxFurries - getCurrentFurryCount());
    while (toSpawn > 0) {
        const randomType = furryTypes[Math.floor(Math.random() * furryTypes.length)].type;
        if (spawnSingleFurry(randomType)) {
            toSpawn--;
        } else {
            break;
        }
    }
    updateFurryCounter();
}

function createDecoration(types) {
    return {
        type: types[Math.floor(Math.random() * types.length)],
        top: Math.floor(Math.random() * 40),
        left: Math.floor(Math.random() * 40)
    };
}

function generateDecorations() {
    for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {
            decorations[i][j] = [];
            if (map[i][j] === 'grass') {
                if (Math.random() < 0.5) { // 50% chance to spawn decorations
                    const count = Math.random() < 0.5 ? 1 : 2; // 50% chance for two
                    for (let k = 0; k < count; k++) {
                        decorations[i][j].push(createDecoration(decorTypes));
                    }
                }
            }
        }
    }
}

// Function to render the map
const mapContainer = document.getElementById('map');

// --- Performance & Scalability Notes ---
// For large maps (e.g., 1000x1000), consider using sparse objects or chunking.
// Here is a sparse map/furries/visited implementation for memory efficiency:

// Sparse 2D array helpers
function makeSparse2D() {
    return Object.create(null);
}
function getSparse2D(arr, x, y) {
    return arr[`${x}_${y}`];
}
function setSparse2D(arr, x, y, val) {
    arr[`${x}_${y}`] = val;
}
function forEachSparse2D(arr, callback) {
    for (const key in arr) {
        const [x, y] = key.split('_').map(Number);
        callback(arr[key], x, y);
    }
}

// Use sparse objects for large maps
let useSparse = mapSize > 300; // Use sparse for big maps
if (useSparse) {
    map = makeSparse2D();
    furries = makeSparse2D();
    decorations = makeSparse2D();
    visited = makeSparse2D();
}

// Patch map/furries/visited access in renderMap and related functions
function getMapTile(x, y) {
    if (useSparse) return map[`${x}_${y}`] || 'grass';
    return map[x][y] || 'grass';
}
function setMapTile(x, y, val) {
    if (useSparse) {
        map[`${x}_${y}`] = val;
    } else {
        if (!map[x]) map[x] = [];
        map[x][y] = val;
    }
}
function getFurry(x, y) {
    if (useSparse) return furries[`${x}_${y}`];
    return furries[x][y];
}
function setFurry(x, y, val) {
    if (useSparse) furries[`${x}_${y}`] = val;
    else furries[x][y] = val;
}
function getVisited(x, y) {
    if (useSparse) return !!visited[`${x}_${y}`];
    return visited[x][y];
}
function setVisited(x, y, val) {
    if (useSparse) visited[`${x}_${y}`] = !!val;
    else visited[x][y] = !!val;
}
function getDecorations(x, y) {
    if (useSparse) return decorations[`${x}_${y}`] || [];
    return decorations[x][y] || [];
}
function setDecorations(x, y, val) {
    if (useSparse) decorations[`${x}_${y}`] = val;
    else decorations[x][y] = val;
}

// Patch renderMap to use sparse helpers
function renderMap() {
    if (!mapContainer) return;
    mapContainer.innerHTML = '';

    const startX = Math.floor(playerPosition.x - viewRange);
    const endX = Math.floor(playerPosition.x + viewRange);
    const startY = Math.floor(playerPosition.y - viewRange);
    const endY = Math.floor(playerPosition.y + viewRange);

    const visibleTilesX = endX - startX + 1;
    const visibleTilesY = endY - startY + 1;

    mapContainer.style.gridTemplateColumns = `repeat(${visibleTilesX}, 60px)`;
    mapContainer.style.gridTemplateRows = `repeat(${visibleTilesY}, 60px)`;
    mapContainer.style.gridGap = '0px';

    for (let i = startX; i <= endX; i++) {
        for (let j = startY; j <= endY; j++) {
            const tile = document.createElement('div');
            const wrapX = (i + mapSize) % mapSize;
            const wrapY = (j + mapSize) % mapSize;

            tile.className = `tile ${getMapTile(wrapX, wrapY)}`;
            const labelText = getMapTile(wrapX, wrapY) === 'path' ? 'Path' : getMapTile(wrapX, wrapY);

            if (wrapX === playerPosition.x && wrapY === playerPosition.y) {
                tile.classList.add('playerTile');
            }

            tile.addEventListener('mouseover', () => highlightTile(tile, i, j));
            tile.addEventListener('mouseout', () => unhighlightTile(tile));
            tile.addEventListener('click', () => movePlayer(i, j));

            // Render decorations
            const decos = getDecorations(wrapX, wrapY);
            if (Array.isArray(decos)) {
                decos.forEach(d => {
                    const dEl = document.createElement('div');
                    dEl.className = `deco ${d.type}`;
                    dEl.style.top = `${d.top}px`;
                    dEl.style.left = `${d.left}px`;
                    tile.appendChild(dEl);
                });
            }

            const label = document.createElement('span');
            label.className = 'tile-label';
            label.textContent = labelText;
            tile.appendChild(label);

            mapContainer.appendChild(tile);
        }
    }

    sizeNarratorToMap();
    // Animation will handle minimap rendering, but call once to ensure initial state
    if (!pulseAnimationId) {
        renderMinimap();
    }
}

// Furry spawn cap: prevent runaway memory use
const MAX_FURRIES = 10000;
function spawnFurriesCapped(amount = 500) {
    // Clear all persistent encounters when spawning new furries
    console.log('Clearing persistent encounters due to new spawn cycle');
    clearAllPersistentEncounters();
    
    const maxFurries = MAX_FURRIES;
    let toSpawn = Math.min(amount, maxFurries - getCurrentFurryCount());
    while (toSpawn > 0) {
        const randomType = furryTypes[Math.floor(Math.random() * furryTypes.length)].type;
        if (spawnSingleFurry(randomType)) {
            toSpawn--;
        } else {
            break;
        }
    }
    updateFurryCounter();
}
// Replace setInterval(() => spawnFurries(500), 60000); with:
setInterval(() => spawnFurriesCapped(500), 60000);

// --- Tile Sound System ---
// Simple tile sound system - just random sounds from the main folder
const tileSoundFiles = [
    'Sounds/Sound effects/Tile sounds/ceramic-tile-select-flick-1.wav',
    'Sounds/Sound effects/Tile sounds/ceramic-tile-select-flick-2.wav',
    'Sounds/Sound effects/Tile sounds/ceramic-tile-select-flick-3.wav',
    'Sounds/Sound effects/Tile sounds/ceramic-tile-select-flick-4.wav',
    'Sounds/Sound effects/Tile sounds/ceramic-tile-select-flick-5.wav'
];

// Preloaded sounds cache
let preloadedTileSounds = [];
let soundsLoaded = false;

function preloadTileSounds() {
    preloadedTileSounds = tileSoundFiles.map(soundFile => {
        const audio = new Audio(soundFile);
        audio.preload = 'auto';
        audio.volume = 0.3; // Set default volume
        audio.load();
        
        // Handle loading errors gracefully
        audio.addEventListener('error', () => {
            console.warn(`Failed to load tile sound: ${soundFile}`);
        });
        
        return audio;
    });
    
    soundsLoaded = true;
    console.log('Tile sounds preloaded');
}

function getSFXVolume() {
    // Get SFX volume from slider (0-100), default to 50 if not found
    const sfxSlider = document.getElementById('sfxVolumeSlider');
    return sfxSlider ? parseInt(sfxSlider.value) / 100 : 0.5;
}

function playRandomTileSound() {
    if (!soundsLoaded || !preloadedTileSounds.length) {
        return; // Sounds not loaded yet
    }
    
    try {
        // Pick a random sound from the available sounds
        const randomIndex = Math.floor(Math.random() * preloadedTileSounds.length);
        const audio = preloadedTileSounds[randomIndex];
        
        if (audio) {
            // Set volume based on SFX slider
            const sfxVolume = getSFXVolume();
            
            // Clone the audio to avoid interrupting ongoing playback
            const audioClone = audio.cloneNode();
            audioClone.volume = sfxVolume * 0.3; // Reduced volume for hover sounds
            audioClone.currentTime = 0;
            
            audioClone.play().catch(error => {
                console.warn('Could not play tile sound:', error);
            });
        }
        
    } catch (error) {
        console.warn('Error playing tile sound:', error);
    }
}

// --- Seeded PRNG for deterministic world generation ---
let prngSeed = worldSeed;
function seededRandom() {
    prngSeed = (prngSeed * 1664525 + 1013904223) % 4294967296;
    return prngSeed / 4294967296;
}

function createFurry() {
    const furryNames = Object.keys(furryData);
    const name = furryNames[Math.floor(Math.random() * furryNames.length)];

    const data = furryData[name];
    const stats = data.stats;
    return {
      name: name,
      category: data.category,
      HP: stats.hp,
      power: stats.fight,
      flirt: stats.flirt,
      feast: stats.feast,
      fuck: stats.fuck,
      flee: stats.flee,
      feed: stats.feed,
    };
}


function renderMinimap() {
    const canvas = document.getElementById('minimap');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const scale = canvas.width / mapSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Render base map tiles
    for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {
            if (visited[i][j]) {
                ctx.fillStyle = getTileColor(i, j);
            } else {
                ctx.fillStyle = 'gray';
            }
            ctx.fillRect(j * scale, i * scale, scale, scale);
        }
    }
    
    // Apply sonar pulse effect
    applySonarPulse(ctx, scale);
    
    // Draw player position (always visible)
    const centerX = (playerPosition.y + 0.5) * scale;
    const centerY = (playerPosition.x + 0.5) * scale;
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(centerX, centerY, scale * 0.4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add white center dot
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX, centerY, scale * 0.2, 0, 2 * Math.PI);
    ctx.fill();
}

function applySonarPulse(ctx, scale) {
    const currentTime = Date.now();
    const timeSinceLastPulse = currentTime - lastPulseTime;
    
    // Check if we should start a new pulse
    if (timeSinceLastPulse >= PULSE_INTERVAL) {
        lastPulseTime = currentTime;
    }
    
    // Calculate pulse progress (0 to 1)
    const pulseProgress = Math.min(timeSinceLastPulse / PULSE_DURATION, 1);
    
    if (pulseProgress < 1) {
        const centerX = (playerPosition.y + 0.5) * scale;
        const centerY = (playerPosition.x + 0.5) * scale;
        const maxRadius = Math.max(ctx.canvas.width, ctx.canvas.height) * 1.5;
        const currentRadius = pulseProgress * maxRadius;
        
        // Create image data to manipulate pixels
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        
        // Apply pulse effect to pixels
        for (let x = 0; x < ctx.canvas.width; x++) {
            for (let y = 0; y < ctx.canvas.height; y++) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                
                // Check if this pixel is within the pulse ring
                const ringThickness = 8; // Thinner pulse ring
                const ringStart = currentRadius - ringThickness;
                const ringEnd = currentRadius;
                
                if (distance >= ringStart && distance <= ringEnd) {
                    // Calculate intensity based on position within ring and overall progress
                    const ringPosition = (distance - ringStart) / ringThickness;
                    const baseIntensity = 1 - pulseProgress; // Fade out over time
                    const ringIntensity = 1 - ringPosition; // Fade out across ring thickness
                    const finalIntensity = baseIntensity * ringIntensity;
                    
                    // Apply bright pulse color
                    const pixelIndex = (y * ctx.canvas.width + x) * 4;
                    const pulseColor = {
                        r: 255,
                        g: 100 + (155 * finalIntensity), // More green when brighter
                        b: 100 + (155 * finalIntensity)  // More blue when brighter
                    };
                    
                    // Blend with existing pixel color
                    data[pixelIndex] = Math.min(255, data[pixelIndex] + pulseColor.r * finalIntensity * 0.8);
                    data[pixelIndex + 1] = Math.min(255, data[pixelIndex + 1] + pulseColor.g * finalIntensity * 0.6);
                    data[pixelIndex + 2] = Math.min(255, data[pixelIndex + 2] + pulseColor.b * finalIntensity * 0.6);
                }
            }
        }
        
        // Apply the modified image data back to canvas
        ctx.putImageData(imageData, 0, 0);
    }
}

function startMinimapAnimation() {
    if (pulseAnimationId) return; // Already running
    
    lastPulseTime = Date.now(); // Initialize pulse timing
    
    function animate() {
        renderMinimap();
        pulseAnimationId = requestAnimationFrame(animate);
    }
    
    pulseAnimationId = requestAnimationFrame(animate);
}

function stopMinimapAnimation() {
    if (pulseAnimationId) {
        cancelAnimationFrame(pulseAnimationId);
        pulseAnimationId = null;
    }
}

// Make animation functions globally available
window.startMinimapAnimation = startMinimapAnimation;
window.stopMinimapAnimation = stopMinimapAnimation;

  function getTileColor(x, y) {
    const tileType = map[x][y];
    switch (tileType) {
      case 'grass':
        return 'green';
      case 'forest':
        return 'brown';
            case 'pond':
                return 'blue';
            case 'swamp':
                return '#2e8b57';
            case 'tundra':
                return '#e0f7fa';
            case 'rock':
                return 'gray';
            default:
                return 'gray';
    }
}

  function isTileVisible(x, y) {
    const distance = Math.sqrt((x - playerPosition.x) ** 2 + (y - playerPosition.y) ** 2);
    return distance <= viewRange;
}

function updateVisitedTiles() {
    for (let i = playerPosition.x - viewRange; i <= playerPosition.x + viewRange; i++) {
        for (let j = playerPosition.y - viewRange; j <= playerPosition.y + viewRange; j++) {
            const wrapX = (i + mapSize) % mapSize;
            const wrapY = (j + mapSize) % mapSize;
            visited[wrapX][wrapY] = true;
        }
    }
}

function toggleMinimapSize() {
    const minimap = document.getElementById('minimap');
    if (!minimap) return;
    minimapExpanded = !minimapExpanded;
    if (minimapExpanded) {
        minimap.classList.add('expanded');
        minimap.width = 440;
        minimap.height = 440;
    } else {
        minimap.classList.remove('expanded');
        minimap.width = 220;
        minimap.height = 220;
    }
    renderMinimap();
}

function highlightTile(tile, x, y) {
    if (!tile) return;

    const canMove = Math.abs(x - playerPosition.x) <= 1 && Math.abs(y - playerPosition.y) <= 1;
    if (canMove) {
        try {
            tile.classList.add('highlighted');
            
            // Play random tile sound when hovering over neighboring tiles
            playRandomTileSound();
        } catch (error) {
            console.error('highlightTile: error highlighting tile', error);
        }
    }
}

// Function to unhighlight a tile
function unhighlightTile(tile) {
    tile.classList.remove('highlighted');
}

// Function to move the player to a new position
function movePlayer(x, y) {
    // Guard against movement before the map is generated
    if (!map.length) {
        return;
    }

    if (x === playerPosition.x && y === playerPosition.y) {
        // If the player is already on this tile, do nothing
        return;
    }

    const canMove = Math.abs(x - playerPosition.x) <= 1 && Math.abs(y - playerPosition.y) <= 1;

    // Wrap coordinates that fall outside the map bounds
    if (x < 0) x = mapSize - 1;
    else if (x >= mapSize) x = 0;
    if (y < 0) y = mapSize - 1;
    else if (y >= mapSize) y = 0;

    if (currentFurry && currentFurry.hostile && currentEncounterPos && (x !== currentEncounterPos.x || y !== currentEncounterPos.y)) {
        const NarratorLines = getCurrentNarratorLines();
        updateNarrator(NarratorLines.hostileBlock);
        return;
    }

    if (canMove) {
        clearNarrator();
        previousPosition = { x: playerPosition.x, y: playerPosition.y };
        playerPosition = { x, y };
        if (!map[x] || map[x][y] === undefined) {
            return;
        }
        narrateTile(map[x][y]);
        updateVisitedTiles();

        tilesWalked++;
        totalTilesWalked++;
        // Change hunger step to 40 tiles
        if (tilesWalked >= 40) {
            playerStats.hunger = Math.max(playerStats.hunger - hungerDepletionRate, 0);
            tilesWalked -= 40;
            updateHPBars();
        }

        if (totalTilesWalked > 0 && totalTilesWalked % TILE_HUNGER_RAMP === 0) {
            hungerDepletionRate += HUNGER_DEPLETION_RAMP;
        }

        // Clear current encounter UI when leaving tile, but keep persistent data
        if (currentEncounterPos && (x !== currentEncounterPos.x || y !== currentEncounterPos.y)) {
            // Update persistent encounter with current state before leaving
            updatePersistentEncounter();
            
            hideEnemyCard();
            hideHostileOverlay();
            clearSleepDebuffs();
            currentFurry = null;
            currentEncounterPos = null;
            currentEncounterKey = null;
        }

        renderMap(); // Update map before checking for encounters

        // Prevent encounters during game loading
        if (isGameLoading) {
            return;
        }

        const encounteredFurry = furries[x] ? furries[x][y] : null;

        if (encounteredFurry) {
            encounterFurry(encounteredFurry);
        }
    }
}

// Function to initialize game
function initGame() {
    // currently no initialization needed
}

initGame();

// Function to handle furry encounters
function encounterFurry(furry) {
    if (!furry) {
        console.error('Error: furry is null or undefined');
        return;
    }

    // Prevent encounters during game loading
    if (isGameLoading) {
        console.log('Preventing encounter during game loading');
        return;
    }

    const encounterKey = `${playerPosition.x}_${playerPosition.y}`;
    currentEncounterKey = encounterKey;
    
    // Check if we have a persistent encounter at this location
    if (persistentEncounters[encounterKey]) {
        // Restore persistent encounter
        const persistentData = persistentEncounters[encounterKey];
        currentFurry = persistentData.furry;
        enemyGroup = persistentData.enemyGroup || [persistentData.furry];
        console.log('Restored persistent encounter at', encounterKey);
    } else {
        // Create new encounter
        currentFurry = furry;
        enemyGroup = [furry];
        
        // Generate enemy group if needed
        if (Math.random() < 0.3) {
            const extra = Math.floor(Math.random() * 3) + 1; // 1-3 extra for total 2-4
            for (let i = 0; i < extra; i++) {
                // Each enemy is individually randomized: 70% chance same type, 30% chance random type
                const sameKind = Math.random() < 0.7;
                if (sameKind) {
                    // Create a new enemy of the same type (unique name & stats)
                    enemyGroup.push(createEnemyOfType(furry.type));
                } else {
                    // Create a completely random enemy
                    enemyGroup.push(generateRandomEnemy());
                }
            }
        }
        
        // Save to persistent storage
        savePersistentEncounter(encounterKey, currentFurry, enemyGroup);
    }
    currentEncounterPos = { x: playerPosition.x, y: playerPosition.y };

    // Rest of encounter setup...
    const enemyNameEl = document.getElementById('encounteredFurry');
    if (enemyNameEl) enemyNameEl.textContent = currentFurry.name;
    
    // Show the enemy card with all the information
    showEnemyCard();
}

// Save encounter state to persistent storage
function savePersistentEncounter(encounterKey, furry, group) {
    persistentEncounters[encounterKey] = {
        furry: JSON.parse(JSON.stringify(furry)), // Deep copy
        enemyGroup: JSON.parse(JSON.stringify(group)), // Deep copy
        lastModified: Date.now()
    };
}

// Update persistent encounter with current battle state
function updatePersistentEncounter() {
    if (currentEncounterKey && currentFurry) {
        savePersistentEncounter(currentEncounterKey, currentFurry, enemyGroup);
    }
}

// Remove encounter from persistent storage (when truly defeated)
function removePersistentEncounter(encounterKey) {
    if (persistentEncounters[encounterKey]) {
        delete persistentEncounters[encounterKey];
        console.log('Removed persistent encounter at', encounterKey);
    }
}

// Clear all persistent encounters (during repopulation)
function clearAllPersistentEncounters() {
    persistentEncounters = {};
    currentEncounterKey = null;
    console.log('Cleared all persistent encounters for repopulation');
}

// Repopulate the world - clears all persistent encounters and respawns enemies
function repopulateWorld() {
    console.log('Starting world repopulation...');
    
    // Clear all persistent encounters
    clearAllPersistentEncounters();
    
    // Clear current encounter if player is in one
    if (currentFurry) {
        hideEnemyCard();
        hideHostileOverlay();
        currentFurry = null;
        currentEncounterPos = null;
        currentEncounterKey = null;
    }
    
    // Clear all furries from the world
    for (let x = 0; x < furries.length; x++) {
        if (furries[x]) {
            for (let y = 0; y < furries[x].length; y++) {
                furries[x][y] = null;
            }
        }
    }
    
    // Respawn new furries
    spawnFurries(2000); // Spawn a good amount to repopulate
    
    // Update UI
    renderMap();
    updateFurryCounter();
    
    console.log('World repopulation complete!');
}

// Expose repopulation function globally for manual testing
window.repopulateWorld = repopulateWorld;

function showEnemyCard() {
    if (!currentFurry) return;
    
    const typeBadge = document.getElementById('furryTypeBadge');
    if (typeBadge && currentFurry.category) {
        typeBadge.textContent = currentFurry.category;
        typeBadge.className = `type-badge type-${currentFurry.category.toLowerCase()}`;
    }

    const sizeBadge = document.getElementById('furrySizeBadge');
    if (sizeBadge && currentFurry.size) {
        sizeBadge.textContent = currentFurry.size;
        sizeBadge.className = `size-badge size-${currentFurry.size.toLowerCase()}`;
    }

    // Use existing global element references instead of redeclaring
    if (enemyHP && currentFurry.hp !== undefined && currentFurry.maxHp !== undefined) {
        enemyHP.textContent = `${currentFurry.hp}/${currentFurry.maxHp}`;
    }
    const enemyFightVal = document.getElementById('enemyFightVal');
    if (enemyFightVal && currentFurry.fight !== undefined) enemyFightVal.textContent = currentFurry.fight;
    const enemyFlirtVal = document.getElementById('enemyFlirtVal');
    if (enemyFlirtVal && currentFurry.flirt !== undefined) enemyFlirtVal.textContent = currentFurry.flirt;
    const enemyFeastVal = document.getElementById('enemyFeastVal');
    if (enemyFeastVal && currentFurry.feast !== undefined) enemyFeastVal.textContent = currentFurry.feast;
    const enemyFuckVal = document.getElementById('enemyFuckVal');
    if (enemyFuckVal && currentFurry.fuck !== undefined) enemyFuckVal.textContent = currentFurry.fuck;
    const enemyFleeVal = document.getElementById('enemyFleeVal');
    if (enemyFleeVal && currentFurry.flee !== undefined) enemyFleeVal.textContent = currentFurry.flee;
    const enemyFeedVal = document.getElementById('enemyFeedVal');
    if (enemyFeedVal && currentFurry.feed !== undefined) enemyFeedVal.textContent = currentFurry.feed;
    // Use existing global element references
    if (enemyFlirtBar && currentFurry.flirtBar !== undefined) {
        enemyFlirtBar.style.width = `${currentFurry.flirtBar}%`;
    }
    if (enemyFlirtText && currentFurry.flirtBar !== undefined) {
        enemyFlirtText.textContent = currentFurry.flirtBar >= 100 ? 'Horny' : Math.floor(currentFurry.flirtBar);
    }
    renderEnemyGroup();

    updateHPBars();
    const enemyCard = document.getElementById('enemyCard');
    if (enemyCard) {
        const enemyBoard = document.getElementById('enemyBoard');
        if (enemyCardHideTimeout) {
            clearTimeout(enemyCardHideTimeout);
            enemyCardHideTimeout = null;
        }
        enemyCard.style.display = 'block';
        if (enemyBoard) enemyBoard.style.display = 'block';
        enemyCard.classList.remove('slide-in-right', 'slide-out-right');
        void enemyCard.offsetWidth;
        enemyCard.classList.add('slide-in-right');
        // Update enemy UI to hide the "no one is here" hint after a brief delay
        setTimeout(() => setEnemyEmptyUI(), 50);
    }
    const playerCard = document.getElementById('playerCard');
    if (playerCard) {
        playerCard.style.display = 'block';
        if (playerCardFirstSlide) {
            playerCard.classList.remove('slide-in-left');
            void playerCard.offsetWidth;
            playerCard.classList.add('slide-in-left');
            playerCardFirstSlide = false;
        }
    }
    const NarratorLines = getCurrentNarratorLines();
    // Determine if we should enter battle mode
    const shouldBeBattleMode = currentFurry.hostile && followers.length > 0;
    
    if (currentFurry.hostile) {
        updateNarratorCritical(NarratorLines.hostileEncounter(currentFurry.name));
        showHostileOverlay();
        
        if (shouldBeBattleMode) {
            enterBattleMode();
        }
    } else {
        updateNarratorAction(NarratorLines.nonhostileEncounter(currentFurry.name));
        hideHostileOverlay();
        exitBattleMode();
    }
}

// --- Turn Order UI Gating ---
window.updateTurnUI = function updateTurnUI() {
    console.log('Legacy updateTurnUI called - using new battle UI system');
    updateBattleUI();
};

// Ensure .inactive style exists for grayed out cards
let inactiveStyle = document.getElementById('inactive-card-style');
if (!inactiveStyle) {
    inactiveStyle = document.createElement('style');
    inactiveStyle.id = 'inactive-card-style';
    inactiveStyle.textContent = `.stat-card.inactive { opacity: 0.4; pointer-events: none; filter: grayscale(0.7); transition: all 0.3s ease; }\n#enemyTurnBtn { padding: 10px 24px; font-size: 18px; background: #e5d7b8; border: 2px solid #b09a6b; border-radius: 8px; cursor: pointer; font-weight: bold; }\n#enemyTurnBtn:active { background: #d6c6a8; }`;
    document.head.appendChild(inactiveStyle);
}

// Execute enemy turn automatically
let enemyTurnTimeoutId = null; // Track enemy turn timeout to prevent conflicts

function executeEnemyTurn(enemyIndex) {
    console.log('Enemy turn - index:', enemyIndex);
    
    if (!enemyGroup || enemyIndex >= enemyGroup.length) {
        console.error('Invalid enemy index for turn:', enemyIndex);
        // Skip this turn and move to next participant
        nextTurn();
        return;
    }
    
    const enemy = enemyGroup[enemyIndex];
    if (!enemy || enemy.hp <= 0) {
        console.log('Enemy is defeated, skipping turn');
        nextTurn();
        return;
    }
    
    // Status effects are now checked in startCurrentTurn() - no need to duplicate here
    
    console.log(`${enemy.name}'s turn - executing AI action`);
    
    // Simple enemy AI: choose highest stat action, but prefer combat actions over flee
    const combatActions = ['fight', 'flirt', 'feast', 'fuck', 'feed'];
    const allActions = ['fight', 'flirt', 'feast', 'fuck', 'flee', 'feed'];
    
    let bestAction = 'fight';
    let bestValue = enemy.fight;
    
    // First, check combat actions
    combatActions.forEach(action => {
        if (enemy[action] > bestValue) {
            bestAction = action;
            bestValue = enemy[action];
        }
    });
    
    // Only consider flee if:
    // 1. Enemy is low on health (less than 30%)
    // 2. OR flee stat is significantly higher than best combat action (20+ difference)
    const healthPercent = (enemy.hp / enemy.maxHp) * 100;
    const shouldConsiderFlee = healthPercent < 30 || enemy.flee > bestValue + 20;
    
    if (shouldConsiderFlee && enemy.flee > bestValue) {
        bestAction = 'flee';
        bestValue = enemy.flee;
    }
    
    // Execute the enemy action
    if (bestAction === 'flee') {
        // Enemy attempts to flee from combat
        attemptEnemyFlee();
    } else {
        // For most actions, enemy performs an attack (simplified AI)
        // Call the actual enemy attack function to deal damage
        performEnemyAttack(enemy);
    }
    
    // Add some visual feedback
    const enemyCards = document.querySelectorAll('#enemyCard, .enemy-group-member');
    if (enemyCards[enemyIndex]) {
        enemyCards[enemyIndex].classList.add('flash');
        setTimeout(() => enemyCards[enemyIndex].classList.remove('flash'), 300);
    }
    
    // Enemy action completed - advance to next turn (only if enemy didn't flee)
    if (currentFurry && bestAction !== 'flee') {
        console.log('Enemy action completed, advancing turn in 1500ms');
        // Clear any previous enemy turn timeout to prevent conflicts
        if (enemyTurnTimeoutId) {
            clearTimeout(enemyTurnTimeoutId);
        }
        enemyTurnTimeoutId = setTimeout(() => {
            console.log('Enemy turn delay completed, calling nextTurn()');
            if (typeof nextTurn === 'function') nextTurn();
            enemyTurnTimeoutId = null; // Clear the timeout ID after use
        }, 1500);
    } else if (!currentFurry) {
        console.log('Enemy fled or was defeated, turn will be handled by combat end logic');
    }
}

// Legacy function - replaced by simple battle system
window.initializeTurnOrder = function() {
    console.log('Legacy initializeTurnOrder called - using new simple battle system');
    enterBattleMode();
};

// Proper battle turn management
window.battleState = {
    isBattle: false,
    turnOrder: [], // Array of {type: 'player'/'ally'/'enemy', index: number, name: string}
    currentTurnIndex: 0,
    waitingForAction: false
};

window.enterBattleMode = function() {
    console.log('Entering battle mode - building turn order');
    window.battleState.isBattle = true;
    window.battleState.waitingForAction = false;
    
    // Build turn order based on flee stats
    const turnOrder = [];
    
    // Add player
    turnOrder.push({
        type: 'player',
        index: 0,
        name: 'Player',
        flee: playerStats.flee
    });
    
    // Add allies
    followers.forEach((ally, i) => {
        turnOrder.push({
            type: 'ally',
            index: i,
            name: ally.name,
            flee: ally.flee
        });
    });
    
    // Add enemies (from enemyGroup, currentFurry is enemyGroup[0])
    enemyGroup.forEach((enemy, i) => {
        if (enemy.hostile && enemy.hp > 0) {
            turnOrder.push({
                type: 'enemy',
                index: i,
                name: enemy.name,
                flee: enemy.flee
            });
        }
    });
    
    // Sort by flee stat (highest first)
    turnOrder.sort((a, b) => b.flee - a.flee);
    
    window.battleState.turnOrder = turnOrder;
    window.battleState.currentTurnIndex = 0;
    
    console.log('Battle turn order:', turnOrder.map(t => `${t.name} (${t.type}, flee: ${t.flee})`));
    
    startCurrentTurn();
};

window.exitBattleMode = function() {
    console.log('Exiting battle mode - switching to inter-party mode');
    window.battleState.isBattle = false;
    window.battleState.turnOrder = [];
    window.battleState.currentTurnIndex = 0;
    window.battleState.waitingForAction = false;
    updateBattleUI();
};

window.startCurrentTurn = function() {
    if (!window.battleState.isBattle || window.battleState.turnOrder.length === 0) return;
    
    const currentTurn = window.battleState.turnOrder[window.battleState.currentTurnIndex];
    console.log(`Starting turn: ${currentTurn.name} (${currentTurn.type})`);
    
    // Check if current participant can act (not sleeping, stunned, etc.)
    if (!canParticipantAct(currentTurn)) {
        console.log(`${currentTurn.name} cannot act (sleeping/stunned), skipping turn`);
        const NarratorLines = getCurrentNarratorLines();
        if (currentTurn.type === 'enemy') {
            updateNarrator(NarratorLines.enemySleeping ? NarratorLines.enemySleeping(currentTurn.name) : `${currentTurn.name} is unable to act.`);
        } else {
            updateNarrator(`${currentTurn.name} is unable to act.`);
        }
        // Skip this turn and go to next
        setTimeout(() => nextTurn(), 1000);
        return;
    }
    
    window.battleState.waitingForAction = true;
    updateBattleUI();
    
    // If it's an enemy turn, execute automatically after delay
    if (currentTurn.type === 'enemy') {
        window.battleState.waitingForAction = false;
        setTimeout(() => {
            executeEnemyTurnAction(currentTurn);
        }, 1000);
    }
};

// Update battle UI based on current turn
window.updateBattleUI = function() {
    const playerCard = document.getElementById('playerCard');
    const followerCards = document.querySelectorAll('.follower-card:not(.enemy-group-member)');
    
    // Clear all card inactive states first
    if (playerCard) playerCard.classList.remove('inactive');
    followerCards.forEach(c => c.classList.remove('inactive'));
    
    if (!window.battleState.isBattle) {
        // Inter-party mode: all cards always active
        console.log('Inter-party mode: all cards active');
        return;
    }
    
    if (window.battleState.turnOrder.length === 0) {
        console.log('No turn order yet, keeping all cards active');
        return;
    }
    
    const currentTurn = window.battleState.turnOrder[window.battleState.currentTurnIndex];
    console.log(`Update UI for ${currentTurn.name}'s turn (${currentTurn.type})`);
    
    // In battle mode, only the current turn's card is active
    if (currentTurn.type === 'player') {
        // Player's turn - only player card active
        followerCards.forEach(c => c.classList.add('inactive'));
        console.log('Player turn: player card active, allies inactive');
    } else if (currentTurn.type === 'ally') {
        // Specific ally's turn - only that ally card active
        if (playerCard) playerCard.classList.add('inactive');
        followerCards.forEach((c, i) => {
            if (i !== currentTurn.index) {
                c.classList.add('inactive');
            }
        });
        console.log(`Ally ${currentTurn.index} turn: only that ally active`);
    } else {
        // Enemy turn - all player/ally cards inactive
        if (playerCard) playerCard.classList.add('inactive');
        followerCards.forEach(c => c.classList.add('inactive'));
        console.log('Enemy turn: all player/ally cards inactive');
    }
};

// Advance to next turn in battle
window.nextTurn = function() {
    if (!window.battleState.isBattle || window.battleState.turnOrder.length === 0) return;
    
    console.log('Advancing turn...');
    
    // Clean up defeated participants first
    if (!cleanupTurnOrder()) {
        // Battle ended due to no valid participants
        return;
    }
    
    // Move to next participant
    window.battleState.currentTurnIndex = (window.battleState.currentTurnIndex + 1) % window.battleState.turnOrder.length;
    
    // Start the new turn
    startCurrentTurn();
};

// Execute specific enemy's turn action
window.executeEnemyTurnAction = function(enemyTurn) {
    console.log(`Executing enemy turn: ${enemyTurn.name} (index ${enemyTurn.index})`);
    
    // Find the actual enemy object from enemyGroup
    let actingEnemy = enemyGroup[enemyTurn.index];
    
    if (!actingEnemy || actingEnemy.hp <= 0 || !actingEnemy.hostile) {
        console.log('Enemy no longer valid for combat, skipping turn');
        nextTurn();
        return;
    }
    
    // Execute enemy attack
    performEnemyAttack(actingEnemy);
    
    // Advance to next turn
    setTimeout(() => {
        nextTurn();
    }, 500);
};

// Legacy function - remove all the complex logic
window.oldNextTurn = function() {
    console.log('oldNextTurn() called');
    if (!window.battleTurnOrder || window.battleTurnOrder.length === 0) {
        console.log('No battle turn order, exiting nextTurn');
        return;
    }
    
    console.log('Current battle turn order:', window.battleTurnOrder.map(p => `${p.name} (${p.type})`));
    console.log('Current turn index before advancement:', window.battleTurnIndex);
    
    let attempts = 0;
    const maxAttempts = window.battleTurnOrder.length + 1; // Prevent infinite loops
    
    do {
        // Move to next participant in the cycle
        window.battleTurnIndex = (window.battleTurnIndex + 1) % window.battleTurnOrder.length;
        attempts++;
        
        // Check if we've completed a full round (back to index 0)
        if (window.battleTurnIndex === 0) {
            console.log('Completed full round, resorting turn order by flee stats');
            // Rebuild and resort turn order to ensure highest flee goes first each round
            initializeTurnOrder();
            return; // initializeTurnOrder will call updateTurnUI
        }
        
        const currentParticipant = window.battleTurnOrder[window.battleTurnIndex];
        console.log(`Turn ${window.battleTurnIndex}: ${currentParticipant.name} (${currentParticipant.type})`);
        
        // Check if current participant is still valid (not defeated/removed)
        if (isParticipantValid(currentParticipant)) {
            console.log(`Found valid participant: ${currentParticipant.name}`);
            break; // Found valid participant
        }
        
        console.log(`Participant ${currentParticipant.name} is no longer valid, skipping...`);
        
    } while (attempts < maxAttempts);
    
    // If we couldn't find any valid participants, rebuild the turn order
    if (attempts >= maxAttempts) {
        console.log('No valid participants found, rebuilding turn order...');
        initializeTurnOrder();
        return;
    }
    
    // Update UI to reflect new turn
    console.log('Updating turn UI for new turn');
    if (typeof updateTurnUI === 'function') updateTurnUI();
    
    // If it's an enemy's turn, trigger their AI action
    const current = window.battleTurnOrder[window.battleTurnIndex];
    if (current && current.type === 'enemy') {
        console.log('Enemy turn detected, executing enemy action');
        // Don't call nextTurn() here - let executeEnemyTurn handle turn advancement
        setTimeout(() => executeEnemyTurn(current.index), 500);
    } else {
        console.log(`Waiting for ${current.type} to take action`);
    }
};

// Check if a participant is still valid (not defeated/removed)
function isParticipantValid(participant) {
    if (participant.type === 'player') {
        return playerStats.hp > 0; // Player is valid if alive
    } else if (participant.type === 'ally') {
        return participant.index < followers.length && followers[participant.index].hp > 0;
    } else if (participant.type === 'enemy') {
        return participant.index < enemyGroup.length && enemyGroup[participant.index].hp > 0;
    }
    return false;
}

// Hook up enemy turn button
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('enemyTurnBtn');
    if (btn) {
        btn.onclick = function() {
            if (typeof nextTurn === 'function') nextTurn();
        };
    }
});

function gainXP(amount) {
    const oldPercent = Math.min(playerStats.xp / xpThreshold * 100, 100);
    playerStats.xp += amount;
    const newPercent = Math.min(playerStats.xp / xpThreshold * 100, 100);
    animateStatBar('playerXPBar', oldPercent, newPercent);
    const parent = document.getElementById('playerXPBar').parentElement;
    showFloatingText(parent, `+${amount}`, 'up', newPercent);
    checkXP();
}

function levelUp() {
    playerStats.level += 1;
    updatePlayerStats(); // update the player's stats display
}

function checkXP() {
    while (playerStats.xp >= xpThreshold) {
        playerStats.xp -= xpThreshold;
        playerStats.level += 1;
        xpThreshold += 100;
        animateStatBar('playerXPBar', 100, 0);
        const levelEl = document.getElementById('playerLevelText');
        showFloatingText(levelEl.parentElement, '+1', 'up');
    }
    updatePlayerStats();
}

// Global variable to prevent rapid double-clicks
let lastActionTime = 0;

// Function to restore active states if they get accidentally cleared by CSS animations
function restorePendingActionStates() {
    if (pendingAction) {
        // Find all buttons with pending action data attributes and ensure they have active class
        document.querySelectorAll('[data-pending-action]').forEach(btn => {
            if (!btn.classList.contains('active')) {
                console.log('Restoring active class for', btn.getAttribute('data-pending-action'), 'button');
                btn.classList.add('active');
            }
        });
    }
}

// Update turn order indices when a participant is removed from arrays
function updateTurnOrderAfterRemoval(removedType, removedIndex) {
    if (!window.battleState.isBattle) return;
    
    console.log(`Updating turn order after ${removedType} removal at index ${removedIndex}`);
    
    // Update indices in turn order
    window.battleState.turnOrder = window.battleState.turnOrder.filter((turn, turnIndex) => {
        if (turn.type === removedType) {
            if (turn.index === removedIndex) {
                // Remove this turn entry - the participant was removed
                console.log(`Removing ${turn.name} from turn order`);
                if (turnIndex <= window.battleState.currentTurnIndex) {
                    // Adjust current turn index if we're removing someone before/at current turn
                    window.battleState.currentTurnIndex = Math.max(0, window.battleState.currentTurnIndex - 1);
                }
                return false; // Remove this entry
            } else if (turn.index > removedIndex) {
                // Shift down indices for participants after the removed one
                turn.index--;
                console.log(`Shifted ${turn.name} index from ${turn.index + 1} to ${turn.index}`);
            }
        }
        return true; // Keep this entry
    });
    
    // Ensure current index is within bounds
    if (window.battleState.turnOrder.length > 0) {
        window.battleState.currentTurnIndex = window.battleState.currentTurnIndex % window.battleState.turnOrder.length;
    } else {
        // No participants left, end battle
        exitBattleMode();
    }
    
    console.log('Updated turn order:', window.battleState.turnOrder.map(t => `${t.name}(${t.type}:${t.index})`));
}

// Check if a turn participant can act (not sleeping, stunned, etc.)
function canParticipantAct(turnInfo) {
    if (turnInfo.type === 'player') {
        // Player can always act (no status effects implemented for player yet)
        return playerStats.hp > 0;
    } else if (turnInfo.type === 'ally') {
        // Check ally status effects
        const ally = followers[turnInfo.index];
        if (!ally || ally.hp <= 0) return false;
        if (ally.sleeping) return false;
        // Add other status effects here as needed
        return true;
    } else if (turnInfo.type === 'enemy') {
        // Check enemy status effects
        const enemy = enemyGroup[turnInfo.index];
        if (!enemy || enemy.hp <= 0 || !enemy.hostile) return false;
        if (enemy.sleeping) return false;
        // Add other status effects here as needed
        return true;
    }
    return false;
}

// Clean up turn order by removing defeated participants
function cleanupTurnOrder() {
    if (!window.battleState.isBattle) return;
    
    const originalLength = window.battleState.turnOrder.length;
    let currentIndex = window.battleState.currentTurnIndex;
    
    // Remove defeated/invalid participants from turn order
    window.battleState.turnOrder = window.battleState.turnOrder.filter((turn, index) => {
        const canAct = canParticipantAct(turn);
        const isSleeping = turn.type === 'enemy' ? (enemyGroup[turn.index]?.sleeping || false) : 
                         turn.type === 'ally' ? (followers[turn.index]?.sleeping || false) : false;
        
        if (!canAct && !isSleeping && index <= currentIndex) {
            // If we remove someone before current turn, adjust current index
            currentIndex--;
        }
        return canAct || isSleeping; // Keep sleeping participants, they might wake up
    });
    
    // Check if battle should end
    const hasValidEnemies = window.battleState.turnOrder.some(t => t.type === 'enemy' && canParticipantAct(t));
    const hasValidPlayers = window.battleState.turnOrder.some(t => (t.type === 'player' || t.type === 'ally') && canParticipantAct(t));
    
    if (!hasValidEnemies || !hasValidPlayers) {
        // Battle should end - one side has no valid participants
        console.log('Battle ending - no valid participants on one side');
        setTimeout(() => {
            if (!hasValidPlayers) {
                // Player side defeated
                if (playerStats.hp <= 0) {
                    handlePlayerDeath(currentFurry?.type || 'unknown');
                }
            } else {
                // Enemies defeated - victory!
                hideEnemyCard();
                currentFurry = null;
                currentEncounterPos = null;
            }
            exitBattleMode();
        }, 1000);
        return false;
    }
    
    if (window.battleState.turnOrder.length === 0) {
        // Shouldn't happen, but safety check
        console.log('No participants left, ending battle');
        exitBattleMode();
        return false;
    }
    
    // Ensure current index is within bounds
    window.battleState.currentTurnIndex = Math.max(0, Math.min(currentIndex, window.battleState.turnOrder.length - 1));
    
    if (originalLength !== window.battleState.turnOrder.length) {
        console.log('Turn order cleaned up:', window.battleState.turnOrder.map(t => t.name));
    }
    
    return true;
}

function selectAction(action, button) {
    // Prevent rapid double-clicks (less than 100ms apart)
    const now = Date.now();
    if (now - lastActionTime < 100) {
        console.log('DEBUG: Ignoring rapid double-click');
        return;
    }
    lastActionTime = now;
    
    console.log(`selectAction: ${action}, battle mode: ${window.battleState.isBattle}`);
    
    // In battle mode, check if it's player's turn (except flirt which is always allowed)
    if (window.battleState.isBattle && window.battleState.turnOrder.length > 0 && action !== 'flirt') {
        const currentTurn = window.battleState.turnOrder[window.battleState.currentTurnIndex];
        if (!currentTurn || currentTurn.type !== 'player') {
            console.log(`Not player's turn (current: ${currentTurn?.type} ${currentTurn?.name})`);
            return;
        }
        if (!window.battleState.waitingForAction) {
            console.log('Not waiting for action right now');
            return;
        }
    }
    
    // Special handling for flirt - allow selection of player as source
    if (action === 'flirt') {
        console.log(`Flirt clicked. Current pendingAction: ${pendingAction}, pendingActor:`, pendingActor);
        
        if (pendingAction) {
            // If the same action and actor, toggle off (but only if button is already active)
            if (pendingAction === 'flirt' && pendingActor && pendingActor.type === 'player' && 
                button && button.classList.contains('active')) {
                console.log('Toggling flirt off');
                pendingAction = null;
                pendingActor = null;
                if (button) {
                    button.classList.remove('active');
                    button.removeAttribute('data-pending-action');
                }
                updateCardGlow();
                return;
            }
            // If another action is already selected, ignore
            console.log(`Another action already pending (${pendingAction}), ignoring flirt click`);
            return;
        }
        // First click: select player as flirt source
        console.log('Setting flirt as pending action');
        pendingAction = 'flirt';
        pendingActor = { type: 'player' };
        // Remove active class from ALL buttons EXCEPT the one we're about to activate
        document.querySelectorAll('#playerCard .stat-btn').forEach(btn => {
            if (btn !== button) btn.classList.remove('active');
        });
        document.querySelectorAll('.follower-card .stat-btn').forEach(btn => {
            if (btn !== button) btn.classList.remove('active');
        });
        if (button) {
            button.classList.add('active');
            // Add a data attribute to make the active state more persistent
            button.setAttribute('data-pending-action', 'flirt');
            console.log('Added active class and data attribute to flirt button');
            

        }
        updateCardGlow();
        console.log('DEBUG: About to return from flirt section, pendingAction:', pendingAction, 'pendingActor:', pendingActor);
        return;
    }
    
    // For all other actions, allow inter-party interactions even without enemies
    // Note: we'll handle target selection in the card click handlers
    
    if (pendingAction) {
        // If the same action and actor, toggle off (but only if button is already active)
        if (pendingAction === action && pendingActor && pendingActor.type === 'player' && 
            button && button.classList.contains('active')) {
            console.log('DEBUG: Toggling off action', action, 'because same action already pending');
            pendingAction = null;
            pendingActor = null;
            if (button) {
                button.classList.remove('active');
                button.removeAttribute('data-pending-action');
            }
            updateCardGlow();
        }
        // If another action is already selected, ignore
        return;
    }
    if (action === 'fuck' && playerStats.hunger <= 0) {
        const NarratorLines = getCurrentNarratorLines();
        updateNarrator(NarratorLines.hungerTooLow);
        if (button) button.classList.remove('active');
        return;
    }
    pendingAction = action;
    pendingActor = { type: 'player' };
    document.querySelectorAll('#playerCard .stat-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');
    updateCardGlow();
}

function selectFollowerAction(index, action, button) {
    console.log(`selectFollowerAction: ally ${index}, ${action}, battle mode: ${window.gameMode.isBattle}, current turn: ${window.gameMode.currentTurn}`);
    
    // Check if action is allowed in current mode/turn
    if (window.gameMode.isBattle && window.gameMode.currentTurn !== 'ally' && action !== 'flirt') {
        console.log('Not ally\'s turn in battle mode, action blocked');
        return;
    }
    
    // Flirt: allow selecting any actor as source, then any player/ally as target
    if (action === 'flirt') {
        if (pendingAction) {
            // If the same action and actor, toggle off
            if (pendingAction === 'flirt' && pendingActor && pendingActor.type === 'ally' && pendingActor.index === index) {
                pendingAction = null;
                pendingActor = null;
                if (button) button.classList.remove('active');
                updateCardGlow();
            } else if (pendingAction === 'flirt' && pendingActor) {
                // Flirt is already pending, so this is the target selection
                flirtActorToTarget(pendingActor, { type: 'ally', index });
                pendingAction = null;
                pendingActor = null;
                document.querySelectorAll('.follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('#playerCard .stat-btn').forEach(btn => btn.classList.remove('active'));
                updateCardGlow();
            }
            // If another action is already selected, ignore
            return;
        }
        // First click: select this ally as flirt source
        pendingAction = 'flirt';
        pendingActor = { type: 'ally', index };
        document.querySelectorAll('.follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('#playerCard .stat-btn').forEach(btn => btn.classList.remove('active'));
        if (button) button.classList.add('active');
        updateCardGlow();
        return;
    }
    
    // Allow all actions even without enemies for inter-party interactions
    
    // Prevent multiple actions if one is already pending or being processed
    if (pendingAction) {
        // If the same action and actor, toggle off
        if (pendingAction === action && pendingActor && pendingActor.type === 'ally' && pendingActor.index === index) {
            pendingAction = null;
            pendingActor = null;
            if (button) button.classList.remove('active');
            updateCardGlow();
        }
        // If another action is already selected or processing, ignore
        return;
    }
    
    // Check if it's this ally's turn in the turn order
    if (window.battleTurnOrder && window.battleTurnOrder.length > 0) {
        const currentTurn = window.battleTurnOrder[window.battleTurnIndex];
        if (currentTurn.type !== 'ally' || currentTurn.index !== index) {
            // Not this ally's turn, ignore
            return;
        }
    }
    pendingAction = action;
    pendingActor = { type: 'ally', index };
    document.querySelectorAll('.follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#playerCard .stat-btn').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');
    updateCardGlow();

}

// Flirt logic: source (player/ally) flirts with target (player/ally)
function flirtActorToTarget(source, target) {
    let src, srcName, srcFlirt;
    if (source.type === 'player') {
        src = playerStats;
        srcName = playerStats.name || 'You';
        srcFlirt = playerStats.flirt;
    } else {
        src = followers[source.index];
        srcName = src.name;
        srcFlirt = src.flirt;
    }
    let tgt, tgtName, tgtGender, tgtIndex;
    if (target.type === 'ally' && !followers[target.index]) return;
    if (target.type === 'player') {
        tgt = playerStats;
        tgtName = playerStats.name || 'You';
        tgtGender = playerStats.gender || 'unknown';
        tgtIndex = null;
    } else if (target.type === 'ally') {
        tgt = followers[target.index];
        tgtName = tgt.name;
        tgtGender = tgt.gender || 'unknown';
        tgtIndex = target.index;
    } else if (target.type === 'enemy') {
        if (!currentFurry) return;
        tgt = currentFurry;
        tgtName = currentFurry.name || currentFurry.type || 'Enemy';
        tgtGender = currentFurry.gender || 'unknown';
        tgtIndex = null;
    }
    const NarratorLines = getCurrentNarratorLines();
    if (target.type === 'player') {
        // Only allies can flirt with player (narrate only)
        if (source.type === 'ally') {
            let narration = NarratorLines.allyFlirtPlayer ? NarratorLines.allyFlirtPlayer(srcName, tgtGender, src.fingers, src.skin, src.hand, src.mouth) : [];
            if (narration.length > 0) {
                updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
            }
        }
        // Player cannot flirt with self
    } else if (target.type === 'ally') {
        // Player or ally can flirt with ally (fill bar)
        const oldPercent = tgt.flirtBar || 0;
        tgt.flirtBar = Math.min((tgt.flirtBar || 0) + (srcFlirt || 15), 100);
        let narration = [];
        if (source.type === 'ally') {
            // Ally flirting with another ally
            narration = NarratorLines.allyFlirtAlly ? NarratorLines.allyFlirtAlly(srcName, tgtName, tgtGender) : [];
        } else {
            // Player flirting with ally
            narration = NarratorLines.playerFlirtAlly ? NarratorLines.playerFlirtAlly(tgtName, tgtGender) : [];
        }
        if (narration.length > 0) {
            updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
        }
        // Animate flirt bar
        const card = document.getElementById(`follower-${tgtIndex}`);
        if (card) {
            const flirtFill = card.querySelector('.flirt-fill');
            if (flirtFill) flirtFill.style.width = `${tgt.flirtBar}%`;
            const flirtText = card.querySelector('.flirt-text');
            if (flirtText) flirtText.textContent = tgt.flirtBar >= 100 ? 'Horny' : Math.floor(tgt.flirtBar);
            showFloatingText(card.querySelector('.flirt-bar'), `+${srcFlirt || 15}`, 'up', tgt.flirtBar);
        }
    } else if (target.type === 'enemy') {
        // Player or ally can flirt with enemy (fill bar)
        const enemyIndex = target.index || 0;
        const targetEnemy = enemyIndex === 0 ? currentFurry : enemyGroup[enemyIndex];
        if (!targetEnemy) return;
        
        const oldPercent = targetEnemy.flirtBar || 0;
        const flirtAmount = srcFlirt || 15;
        targetEnemy.flirtBar = Math.min((targetEnemy.flirtBar || 0) + flirtAmount, 100);
        let narration = [];
        if (source.type === 'ally') {
            narration = NarratorLines.allyFlirtEnemy ? NarratorLines.allyFlirtEnemy(srcName, targetEnemy.name, targetEnemy.gender) : [];
        } else {
            narration = NarratorLines.playerFlirtHostileEnemy ? NarratorLines.playerFlirtHostileEnemy(targetEnemy.type, targetEnemy.gender) : [];
        }
        if (narration && narration.length > 0) {
            updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
        }
        
        // Update the correct flirt bar (main enemy or group member)
        if (enemyIndex === 0) {
            // Main enemy
            const flirtBar = document.getElementById('enemyFlirtBar');
            const flirtText = document.getElementById('enemyFlirtText');
            if (flirtBar) {
                flirtBar.style.width = `${targetEnemy.flirtBar}%`;
                showFloatingText(flirtBar.parentElement, `+${flirtAmount}`, 'up', targetEnemy.flirtBar);
            }
            if (flirtText) flirtText.textContent = targetEnemy.flirtBar >= 100 ? 'Horny' : Math.floor(targetEnemy.flirtBar);
        } else {
            // Group member
            const enemyCard = document.querySelector(`[data-enemy-index="${enemyIndex}"]`);
            if (enemyCard) {
                const flirtBar = enemyCard.querySelector('.flirt-fill');
                const flirtText = enemyCard.querySelector('.flirt-text');
                if (flirtBar) {
                    flirtBar.style.width = `${targetEnemy.flirtBar}%`;
                    showFloatingText(enemyCard.querySelector('.flirt-bar'), `+${flirtAmount}`, 'up', targetEnemy.flirtBar);
                }
                if (flirtText) flirtText.textContent = targetEnemy.flirtBar >= 100 ? 'Horny' : Math.floor(targetEnemy.flirtBar);
            }
        }
        
        updateHPBars();
        // Update persistent encounter after stat change
        updatePersistentEncounter();
        // Deactivate stat buttons and update card glow (identical to ally logic)
        // BUT preserve the active state of the pending action button
        document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => {
            // Only remove active if this button doesn't correspond to the current pending action
            if (pendingAction && btn.textContent.toLowerCase() === pendingAction) {
                // Keep this button active since it's the pending action
                return;
            }
            btn.classList.remove('active');
        });
        updateCardGlow();
        // Turn advancement will be handled by executeActionOnEnemy
        // Don't call nextTurn here to prevent premature turn skipping
    }
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    updateHPBars();
}

// Execute inter-party actions (player ↔ ally interactions)
function executeInterPartyAction(source, target, action) {
    // Don't allow self-targeting for most actions
    if (source.type === target.type && source.index === target.index) {
        if (action !== 'flirt') return; // Only flirt can be used on self (for player)
        if (source.type === 'ally') return; // Allies can't flirt with themselves
    }
    
    // Clear pending action state
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    
    // Route to specific action handler
    switch(action) {
        case 'flirt':
            executeInterPartyFlirt(source, target);
            break;
        case 'feast':
            executeInterPartyFeast(source, target);
            break;
        case 'fuck':
            executeInterPartyFuck(source, target);
            break;
        case 'feed':
            executeInterPartyFeed(source, target);
            break;
        case 'fight':
            executeInterPartyFight(source, target);
            break;
        default:
            console.log('Unknown inter-party action:', action);
    }
    
    // Update UI after action
    updatePlayerStats();
    updateFollowersUI();
    updateHPBars();
}

// Inter-party flirt mechanics
function executeInterPartyFlirt(source, target) {
    flirtActorToTarget(source, target); // Use existing function
}

// Inter-party feast mechanics
function executeInterPartyFeast(source, target) {
    const NarratorLines = getCurrentNarratorLines();
    
    if (source.type === 'player' && target.type === 'ally') {
        // Player feasts on ally - player gets XP, ally dies
        const ally = followers[target.index];
        if (!ally) return;
        
        const xpGain = getXPGain(ally.size || 'Medium');
        gainXP(xpGain);
        
        // Remove ally from followers
        followers.splice(target.index, 1);
        
        // Update turn order after ally removal
        updateTurnOrderAfterRemoval('ally', target.index);
        
        // Narration
        const narration = NarratorLines.playerFeastAlly(ally.name, ally.gender || 'unknown');
        updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
        
    } else if (source.type === 'ally' && target.type === 'player') {
        // Ally feasts on player - kills player
        const ally = followers[source.index];
        if (!ally) return;
        
        // Kill player
        playerStats.hp = 0;
        
        // Narration
        const narration = NarratorLines.allyFeastPlayer(ally.name, ally.gender || 'unknown');
        updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
        
        // Handle player death
        handlePlayerDeath('ally');
        
    } else if (source.type === 'ally' && target.type === 'ally') {
        // Ally feasts on another ally - source gets XP, target dies
        const sourceAlly = followers[source.index];
        const targetAlly = followers[target.index];
        if (!sourceAlly || !targetAlly) return;
        
        const xpGain = getXPGain(targetAlly.size || 'Medium');
        sourceAlly.xp = (sourceAlly.xp || 0) + xpGain;
        
        // Remove target ally
        followers.splice(target.index, 1);
        
        // Update turn order after ally removal
        updateTurnOrderAfterRemoval('ally', target.index);
        
        // Narration
        const narration = NarratorLines.allyFeastAlly(sourceAlly.name, targetAlly.name, targetAlly.gender || 'unknown');
        updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
    }
}

// Inter-party fuck mechanics  
function executeInterPartyFuck(source, target) {
    const NarratorLines = getCurrentNarratorLines();
    
    // Check player hunger for actions involving player
    if (source.type === 'player' && playerStats.hunger <= 0) {
        updateNarrator(NarratorLines.hungerTooLow);
        return;
    }
    
    if (source.type === 'player' && target.type === 'ally') {
        // Player fucks ally - heal both, reset ally flirt, deplete player hunger
        const ally = followers[target.index];
        if (!ally) return;
        
        // Heal both
        const oldPlayerHP = playerStats.hp;
        const oldAllyHP = ally.hp;
        playerStats.hp = 100;
        ally.hp = ally.maxHp;
        
        // Reset ally flirt
        ally.flirtBar = 0;
        
        // Deplete player hunger
        playerStats.hunger = Math.max(playerStats.hunger - 20, 0);
        
        // Show healing effects
        if (oldPlayerHP < 100) {
            const playerCard = document.getElementById('playerCard');
            if (playerCard) showFloatingText(playerCard, `+${100 - oldPlayerHP}`, 'up', 100);
        }
        if (oldAllyHP < ally.maxHp) {
            const allyCard = document.getElementById(`follower-${target.index}`);
            if (allyCard) showFloatingText(allyCard, `+${ally.maxHp - oldAllyHP}`, 'up', 100);
        }
        
        // Narration
        const narration = NarratorLines.playerFuckAlly(ally.name, ally.gender || 'unknown');
        updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
        
    } else if (source.type === 'ally' && target.type === 'player') {
        // Ally fucks player - heal both, reset ally flirt, deplete player hunger
        const ally = followers[source.index];
        if (!ally) return;
        
        // Heal both
        const oldPlayerHP = playerStats.hp;
        const oldAllyHP = ally.hp;
        playerStats.hp = 100;
        ally.hp = ally.maxHp;
        
        // Reset ally flirt
        ally.flirtBar = 0;
        
        // Deplete player hunger
        playerStats.hunger = Math.max(playerStats.hunger - 20, 0);
        
        // Show healing effects
        if (oldPlayerHP < 100) {
            const playerCard = document.getElementById('playerCard');
            if (playerCard) showFloatingText(playerCard, `+${100 - oldPlayerHP}`, 'up', 100);
        }
        if (oldAllyHP < ally.maxHp) {
            const allyCard = document.getElementById(`follower-${source.index}`);
            if (allyCard) showFloatingText(allyCard, `+${ally.maxHp - oldAllyHP}`, 'up', 100);
        }
        
        // Narration
        const narration = NarratorLines.allyFuckPlayer(ally.name, ally.gender || 'unknown');
        updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
        
    } else if (source.type === 'ally' && target.type === 'ally') {
        // Ally fucks ally - no heal, reset both flirt bars
        const sourceAlly = followers[source.index];
        const targetAlly = followers[target.index];
        if (!sourceAlly || !targetAlly) return;
        
        // Reset both flirt bars
        sourceAlly.flirtBar = 0;
        targetAlly.flirtBar = 0;
        
        // Narration
        const narration = NarratorLines.allyFuckAlly(sourceAlly.name, targetAlly.name, targetAlly.gender || 'unknown');
        updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
    }
}

// Inter-party feed mechanics
function executeInterPartyFeed(source, target) {
    const NarratorLines = getCurrentNarratorLines();
    
    if (source.type === 'player' && target.type === 'ally') {
        const ally = followers[target.index];
        if (!ally) return;
        const narration = NarratorLines.playerFeedAlly(ally.name, ally.gender || 'unknown');
        updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
    } else if (source.type === 'ally' && target.type === 'player') {
        const ally = followers[source.index];
        if (!ally) return;
        const narration = NarratorLines.allyFeedPlayer(ally.name, ally.gender || 'unknown');
        updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
    } else if (source.type === 'ally' && target.type === 'ally') {
        const sourceAlly = followers[source.index];
        const targetAlly = followers[target.index];
        if (!sourceAlly || !targetAlly) return;
        const narration = NarratorLines.allyFeedAlly(sourceAlly.name, targetAlly.name, targetAlly.gender || 'unknown');
        updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
    }
}

// Inter-party fight mechanics
function executeInterPartyFight(source, target) {
    const NarratorLines = getCurrentNarratorLines();
    
    if (source.type === 'player' && target.type === 'ally') {
        const ally = followers[target.index];
        if (!ally) return;
        const narration = NarratorLines.playerFightAlly(ally.name, ally.gender || 'unknown');
        updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
    } else if (source.type === 'ally' && target.type === 'player') {
        const ally = followers[source.index];
        if (!ally) return;
        const narration = NarratorLines.allyFightPlayer(ally.name, ally.gender || 'unknown');
        updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
    } else if (source.type === 'ally' && target.type === 'ally') {
        const sourceAlly = followers[source.index];
        const targetAlly = followers[target.index];
        if (!sourceAlly || !targetAlly) return;
        const narration = NarratorLines.allyFightAlly(sourceAlly.name, targetAlly.name, targetAlly.gender || 'unknown');
        updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
    }
}

function updateCardGlow() {
    const enemyCard = document.getElementById('enemyCard');
    const playerCard = document.getElementById('playerCard');
    const followerCards = document.querySelectorAll('.follower-card');
    
    // Remove glow from all cards (but preserve other classes like 'inactive')
    if (enemyCard) enemyCard.classList.remove('glow');
    if (playerCard) playerCard.classList.remove('glow');
    followerCards.forEach(c => c.classList.remove('glow'));
    
    if (!pendingAction) return;
    
    // Add glow to enemy (target) only if there's a pending action
    if (enemyCard) enemyCard.classList.add('glow');
    
    // For non-fight actions, add glow to source actors too (but only if they're not inactive)
    if (pendingAction !== 'fight') {
        if (pendingActor && pendingActor.type === 'player') {
            if (playerCard && !playerCard.classList.contains('inactive')) {
                playerCard.classList.add('glow');
            }
            // Add glow to all active allies 
            followerCards.forEach(c => {
                if (!c.classList.contains('inactive') && !c.classList.contains('enemy-group-member')) {
                    c.classList.add('glow');
                }
            });
        } else if (pendingActor && pendingActor.type === 'ally') {
            if (playerCard && !playerCard.classList.contains('inactive')) {
                playerCard.classList.add('glow');
            }
            const card = Array.from(followerCards).find((c, i) => 
                !c.classList.contains('enemy-group-member') && 
                !c.classList.contains('inactive') && 
                i === pendingActor.index
            );
            if (card) card.classList.add('glow');
        }
    }
}

function renderEnemyGroup() {
    const container = document.getElementById('enemyFollowersContainer');
    if (!container) return;
    Array.from(container.querySelectorAll('.enemy-group-member')).forEach(el => el.remove());
    enemyGroup.slice(1).forEach((e, index) => {
        const realIndex = index + 1; // Actual index in enemyGroup (since we're skipping [0])
        const card = document.createElement('div');
        card.className = 'stat-card follower-card enemy-group-member';
        card.dataset.enemyIndex = realIndex; // Store which enemy this represents
        card.innerHTML = `
            <h3>${e.name}</h3>
            <div class="hp-bar"><div class="hp-fill" style="width:${(e.hp / e.maxHp) * 100}%"></div><span class="hp-text">${e.hp}/${e.maxHp}</span></div>
            <div class="flirt-bar"><div class="flirt-fill" style="width:${e.flirtBar}%"></div><span class="flirt-text">${Math.floor(e.flirtBar)}</span></div>
            <div class="stat-buttons">
                <button class="stat-btn enemy-stat" disabled>Fight <span>${e.fight}</span></button>
                <button class="stat-btn enemy-stat" disabled>Flirt <span>${e.flirt}</span></button>
                <button class="stat-btn enemy-stat" disabled>Feast <span>${e.feast}</span></button>
                <button class="stat-btn enemy-stat" disabled>Fuck <span>${e.fuck}</span></button>
                <button class="stat-btn enemy-stat" disabled>Flee <span>${e.flee}</span></button>
                <button class="stat-btn enemy-stat" disabled>Feed <span>${e.feed}</span></button>
            </div>
        `;
        
        // Make this enemy card clickable for targeting
        card.addEventListener('click', () => {
            targetedEnemyIndex = realIndex;
            console.log(`Targeted enemy ${realIndex}:`, e.name);
            
            // Visual feedback - highlight targeted enemy
            container.querySelectorAll('.enemy-group-member').forEach(c => c.classList.remove('targeted'));
            card.classList.add('targeted');
            
            // Execute pending action on this specific enemy
            if (pendingAction) {
                executeActionOnEnemy(realIndex);
            }
        });
        
        container.appendChild(card);
        
        // Add slide-in animation with staggered timing
        setTimeout(() => {
            card.classList.add('slide-in-right');
        }, index * 10); // 10ms delay between each card
    });
    const board = document.getElementById('enemyBoard');
    if (board) board.style.display = 'block';
    
    // Staggered reveal and empty hint
    if (window.revealEnemyCardsStaggered) {
        window.revealEnemyCardsStaggered();
    } else {
        // Fallback: add .reveal with a small delay
        const cards = Array.from(container.querySelectorAll('.stat-card'));
        cards.forEach((el, i) => {
            setTimeout(() => el.classList.add('reveal'), i * 80);
        });
    }
    
    // Update enemy UI after all cards are set up
    setEnemyEmptyUI();
}

// Execute action on specific enemy (0 = main enemy, 1+ = group members)
function executeActionOnEnemy(enemyIndex) {
    if (!pendingAction) return;
    
    const targetEnemy = enemyIndex === 0 ? currentFurry : enemyGroup[enemyIndex];
    if (!targetEnemy) return;
    
    console.log(`Executing ${pendingAction} on enemy ${enemyIndex}:`, targetEnemy.name);
    
    if (pendingAction === 'fight') {
        if (pendingActor && pendingActor.type === 'ally') {
            const ally = followers[pendingActor.index];
            if (ally) allyFightEnemy(ally, pendingActor.index, enemyIndex);
        } else {
            startFightSequenceOnEnemy(enemyIndex);
        }
    } else if (pendingAction === 'flirt') {
        if (pendingActor && pendingActor.type === 'ally') {
            flirtActorToTarget(pendingActor, { type: 'enemy', index: enemyIndex });
        } else {
            playerFlirtEnemy(enemyIndex);
        }
    } else if (pendingAction === 'feast') {
        if (pendingActor && pendingActor.type === 'ally') {
            const ally = followers[pendingActor.index];
            if (ally) allyFeastEnemy(ally, pendingActor.index, enemyIndex);
        } else {
            playerFeastEnemy(enemyIndex);
        }
    } else if (pendingAction === 'fuck') {
        if (pendingActor && pendingActor.type === 'ally') {
            const ally = followers[pendingActor.index];
            if (ally) allyFuckEnemy(ally, pendingActor.index, enemyIndex);
        } else {
            playerFuckEnemy(enemyIndex);
        }
    } else if (pendingAction === 'feed') {
        if (pendingActor && pendingActor.type === 'ally') {
            const ally = followers[pendingActor.index];
            if (ally) allyFeedEnemy(ally, pendingActor.index, enemyIndex);
        } else {
            playerFeedEnemy(enemyIndex);
        }
    } else if (pendingAction === 'flee') {
        if (pendingActor && pendingActor.type === 'ally') {
            const ally = followers[pendingActor.index];
            if (ally) allyFleeFromEnemy(ally, pendingActor.index, enemyIndex);
        } else {
            playerFleeFromEnemy(enemyIndex);
        }
    }
    
    // Clear pending action
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    
    // Advance turn in battle mode (only for combat actions, not flirt)
    if (window.battleState.isBattle && pendingAction !== 'flirt') {
        console.log('Combat action completed, advancing turn');
        window.battleState.waitingForAction = false;
        setTimeout(() => {
            nextTurn();
        }, 500);
    }
}

// Remove specific enemy from group (0 = main enemy, 1+ = group members)
function removeEnemyFromGroup(enemyIndex, defeatedBy = null) {
    console.log(`Removing enemy ${enemyIndex} from group, defeated by: ${defeatedBy || 'unknown'}`);
    
    let defeatedEnemy = null;
    
    if (enemyIndex === 0) {
        defeatedEnemy = currentFurry;
        // Removing main enemy - promote next enemy or end encounter
        if (enemyGroup.length > 1) {
            // Promote the first group member to main enemy
            currentFurry = enemyGroup[1];
            enemyGroup.splice(1, 1); // Remove the promoted enemy from group
            
            // Update turn order after enemy removal from group
            updateTurnOrderAfterRemoval('enemy', 1);
            
            // Update main enemy card
            updateEnemyCard();
            console.log('Promoted new main enemy:', currentFurry.name);
        } else {
            // No more enemies - end encounter
            currentFurry = null;
            enemyGroup = [];
            
            // Update turn order since main enemy is gone
            updateTurnOrderAfterRemoval('enemy', 0);
            
            // Award XP for defeating enemy if not recruited
            if (defeatedEnemy && !defeatedEnemy.recruited && defeatedBy) {
                const xpGain = getXPGain(defeatedEnemy.size);
                if (defeatedBy === 'player') {
                    gainXP(xpGain);
                    console.log(`Player gained ${xpGain} XP for defeating ${defeatedEnemy.name}`);
                } else if (defeatedBy.startsWith('ally')) {
                    // Award XP to ally
                    const allyIndex = parseInt(defeatedBy.split('-')[1]);
                    if (followers[allyIndex]) {
                        followers[allyIndex].xp = (followers[allyIndex].xp || 0) + xpGain;
                        console.log(`${followers[allyIndex].name} gained ${xpGain} XP for defeating ${defeatedEnemy.name}`);
                    }
                }
                
                // Mark enemy as defeated in persistent encounters
                markEnemyAsDefeated(defeatedEnemy);
            }
            
            endEncounter();
            return;
        }
    } else {
        // Remove specific group member
        if (enemyIndex < enemyGroup.length) {
            defeatedEnemy = enemyGroup[enemyIndex];
            enemyGroup.splice(enemyIndex, 1);
            
            // Update turn order after enemy removal
            updateTurnOrderAfterRemoval('enemy', enemyIndex);
            
            console.log('Removed group member at index', enemyIndex);
        }
    }
    
    // Award XP for defeating enemy if not recruited
    if (defeatedEnemy && !defeatedEnemy.recruited && defeatedBy) {
        const xpGain = getXPGain(defeatedEnemy.size);
        if (defeatedBy === 'player') {
            gainXP(xpGain);
            console.log(`Player gained ${xpGain} XP for defeating ${defeatedEnemy.name}`);
        } else if (defeatedBy.startsWith('ally')) {
            // Award XP to ally
            const allyIndex = parseInt(defeatedBy.split('-')[1]);
            if (followers[allyIndex]) {
                followers[allyIndex].xp = (followers[allyIndex].xp || 0) + xpGain;
                console.log(`${followers[allyIndex].name} gained ${xpGain} XP for defeating ${defeatedEnemy.name}`);
            }
        }
        
        // Mark enemy as defeated in persistent encounters
        markEnemyAsDefeated(defeatedEnemy);
    }
    
    // Re-render the group to reflect changes
    renderEnemyGroup();
    
    // Update persistent encounter
    updatePersistentEncounter();
    
    // IMPORTANT: Rebuild turn order since participants changed
    if (currentFurry && currentFurry.hostile) {
        console.log('Rebuilding turn order after enemy removal');
        initializeTurnOrder();
    }
    
    // Check if all enemies are gone
    if (!currentFurry && enemyGroup.length === 0) {
        setEnemyEmptyUI();
    }
}

// Mark enemy as defeated in persistent encounters to prevent re-encountering
function markEnemyAsDefeated(enemy) {
    if (!enemy || !currentEncounterKey) return;
    
    console.log(`Marking ${enemy.name} as defeated in persistent encounters`);
    
    // Remove from persistent encounters entirely - enemy is truly defeated
    if (currentEncounterKey) {
        removePersistentEncounter(currentEncounterKey);
        console.log('Removed defeated enemy from persistent encounters');
    }
    
    // Clear the tile position so a new enemy can spawn there
    if (currentEncounterPos && furries[currentEncounterPos.x]) {
        furries[currentEncounterPos.x][currentEncounterPos.y] = null;
        // Spawn a new furry of the same type to replace the defeated one
        spawnSingleFurry(enemy.type);
        console.log(`Spawned new ${enemy.type} to replace defeated enemy`);
    }
}

// New enemy-specific action functions
function playerFlirtEnemy(enemyIndex) {
    const targetEnemy = enemyIndex === 0 ? currentFurry : enemyGroup[enemyIndex];
    if (!targetEnemy) return;
    
    // Use existing playerFlirt logic but on specific enemy
    const tempCurrentFurry = currentFurry;
    currentFurry = targetEnemy;
    playerFlirt();
    currentFurry = tempCurrentFurry;
    
    // Update the specific enemy's card if it's a group member
    if (enemyIndex > 0) {
        const enemyCard = document.querySelector(`[data-enemy-index="${enemyIndex}"]`);
        if (enemyCard) {
            const flirtBar = enemyCard.querySelector('.flirt-fill');
            const flirtText = enemyCard.querySelector('.flirt-text');
            if (flirtBar) flirtBar.style.width = `${targetEnemy.flirtBar}%`;
            if (flirtText) flirtText.textContent = targetEnemy.flirtBar >= 100 ? 'Horny' : Math.floor(targetEnemy.flirtBar);
        }
    }
    
    // Turn advancement handled by executeActionOnEnemy
}

function playerFeastEnemy(enemyIndex) {
    const targetEnemy = enemyIndex === 0 ? currentFurry : enemyGroup[enemyIndex];
    if (!targetEnemy) return;
    
    // Execute feast on specific enemy
    const tempCurrentFurry = currentFurry;
    currentFurry = targetEnemy;
    playerFeast();
    currentFurry = tempCurrentFurry;
    
    // If enemy was defeated, remove from group
    if (targetEnemy.hp <= 0) {
        removeEnemyFromGroup(enemyIndex, 'player');
    }
    
    // Turn advancement handled by executeActionOnEnemy
}

function playerFuckEnemy(enemyIndex) {
    const targetEnemy = enemyIndex === 0 ? currentFurry : enemyGroup[enemyIndex];
    if (!targetEnemy) return;
    
    // Execute fuck on specific enemy
    const tempCurrentFurry = currentFurry;
    currentFurry = targetEnemy;
    playerFuck();
    currentFurry = tempCurrentFurry;
    
    // If enemy was recruited, remove from group
    if (targetEnemy.recruited) {
        removeEnemyFromGroup(enemyIndex);
    }
    
    // Turn advancement handled by executeActionOnEnemy
}

function playerFeedEnemy(enemyIndex) {
    const targetEnemy = enemyIndex === 0 ? currentFurry : enemyGroup[enemyIndex];
    if (!targetEnemy) return;
    
    // Execute feed on specific enemy
    const tempCurrentFurry = currentFurry;
    currentFurry = targetEnemy;
    playerFeed();
    currentFurry = tempCurrentFurry;
    
    // Turn advancement handled by executeActionOnEnemy
}

function playerFleeFromEnemy(enemyIndex) {
    const targetEnemy = enemyIndex === 0 ? currentFurry : enemyGroup[enemyIndex];
    if (!targetEnemy) return;
    
    // Execute flee from encounter (not specific enemy, flees from entire encounter)
    const fleeResult = attemptFlee();
    
    // Only advance turn if flee failed AND we're still in battle
    if (!fleeResult && window.battleState.isBattle && currentFurry) {
        if (typeof nextTurn === 'function') nextTurn();
    }
}

function allyFleeFromEnemy(ally, allyIndex, enemyIndex) {
    // For now, allies can't flee individually - this could be implemented later
    const NarratorLines = getCurrentNarratorLines();
    const narration = NarratorLines.allyFleeStays(ally.name, ally.gender || 'unknown');
    updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
    
    // Turn advancement handled by executeActionOnEnemy
}

function startFightSequenceOnEnemy(enemyIndex) {
    const targetEnemy = enemyIndex === 0 ? currentFurry : enemyGroup[enemyIndex];
    if (!targetEnemy) return;
    
    // Execute fight on specific enemy
    const tempCurrentFurry = currentFurry;
    currentFurry = targetEnemy;
    startFightSequence();
    currentFurry = tempCurrentFurry;
    
    // If enemy was defeated, remove from group
    if (targetEnemy.hp <= 0) {
        removeEnemyFromGroup(enemyIndex, 'player');
    }
}

// Placeholder functions for ally actions on specific enemies
function allyFeastEnemy(ally, allyIndex, enemyIndex) {
    const targetEnemy = enemyIndex === 0 ? currentFurry : enemyGroup[enemyIndex];
    if (!targetEnemy) return;
    
    // Execute feast on specific enemy (similar to allyAttack but with feast stats)
    const tempCurrentFurry = currentFurry;
    currentFurry = targetEnemy;
    allyFeast(ally, allyIndex);
    currentFurry = tempCurrentFurry;
    
    // If enemy was defeated, remove from group
    if (targetEnemy.hp <= 0) {
        removeEnemyFromGroup(enemyIndex, `ally-${allyIndex}`);
    }
}

function allyFightEnemy(ally, allyIndex, enemyIndex) {
    const targetEnemy = enemyIndex === 0 ? currentFurry : enemyGroup[enemyIndex];
    if (!targetEnemy) return;
    
    // Execute fight on specific enemy
    const tempCurrentFurry = currentFurry;
    currentFurry = targetEnemy;
    allyAttack(ally, allyIndex, false); // Don't auto-schedule enemy turn
    currentFurry = tempCurrentFurry;
    
    // If enemy was defeated, remove from group
    if (targetEnemy.hp <= 0) {
        removeEnemyFromGroup(enemyIndex, `ally-${allyIndex}`);
    }
}

function allyFuckEnemy(ally, allyIndex, enemyIndex) {
    // For now, redirect to existing allyFuck function
    allyFuck(ally, allyIndex);
}

function allyFeedEnemy(ally, allyIndex, enemyIndex) {
    // For now, redirect to existing allyFeed function
    allyFeed(ally, allyIndex);
}

function onEnemyCardClick() {
    console.log('DEBUG: onEnemyCardClick triggered, pendingAction:', pendingAction, 'pendingActor:', pendingActor);
    targetedEnemyIndex = 0; // Main enemy
    console.log('Targeted main enemy:', currentFurry?.name);
    
    // Visual feedback
    document.querySelectorAll('.enemy-group-member').forEach(c => c.classList.remove('targeted'));
    
    if (pendingAction) {
        executeActionOnEnemy(0);
    }
}

function playerAttack(scheduleEnemyTurn = true) {
    if (!currentFurry) return;
    if (!currentFurry.hostile && gameMode !== 'peaceful') {
        makeEnemyHostile();
    }
    const valEl = document.getElementById('playerFightVal');
    const damage = valEl ? parseInt(valEl.textContent, 10) || playerStats.fight : playerStats.fight;
    const oldHpPercent = Math.max(currentFurry.hp, 0) / currentFurry.maxHp * 100;
    currentFurry.hp = Math.max(currentFurry.hp - damage, 0);
    const newHpPercent = Math.max(currentFurry.hp, 0) / currentFurry.maxHp * 100;
    const oldFlirt = currentFurry.flirtBar;
    currentFurry.flirtBar = 0;
    const NarratorLines = getCurrentNarratorLines();
    updateNarrator(NarratorLines.playerDamage(damage));
    const enemyCard = document.getElementById('enemyCard');
    if (enemyCard) {
        enemyCard.classList.add('damage-effect', 'flash-effect');
        setTimeout(() => enemyCard.classList.remove('damage-effect', 'flash-effect'), 300);
        enemyCard.classList.remove('glow');
    }

    // Deactivate the fight button after the attack
    pendingAction = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    animateStatBar('enemyHPBar', oldHpPercent, newHpPercent);
    const hpParent = document.getElementById('enemyHPBar').parentElement;
    showFloatingText(hpParent, `-${damage}`, 'down', newHpPercent);
    if (oldFlirt > 0) {
        animateStatBar('enemyFlirtBar', oldFlirt, 0);
        const flirtParent = document.getElementById('enemyFlirtBar').parentElement;
        showFloatingText(flirtParent, `-${Math.floor(oldFlirt)}`, 'down', 0);
    }
    updateHPBars();
    if (currentFurry.hp <= 0) {
        if (!currentFurry.wounded) {
            currentFurry.wounded = true;
            const NarratorLines = getCurrentNarratorLines();
            updateNarrator(NarratorLines.furryWounded);
            updateHPBars();
            // Update persistent encounter with wounded state
            updatePersistentEncounter();
        } else {
            const type = currentFurry.type;
            gainXP(getXPGain(currentFurry.size));
            
            // Remove from persistent encounters - enemy is truly defeated
            if (currentEncounterKey) {
                removePersistentEncounter(currentEncounterKey);
            }
            
            // Clear from tile and spawn new elsewhere 
            if (currentEncounterPos && furries[currentEncounterPos.x]) {
                furries[currentEncounterPos.x][currentEncounterPos.y] = null;
                spawnSingleFurry(type);
            }
            showOutcome('You won the battle!', () => {
                hideEnemyCard();
                hideHostileOverlay();
                currentFurry = null;
                currentEncounterPos = null;
                currentEncounterKey = null;
                renderMap();
                updatePlayerStats();
            });
            return;
        }
    }
    if (currentFurry.hostile && scheduleEnemyTurn) {
        setTimeout(enemyTurn, 500);
    }
}

async function attackFollowers() {
    for (const [idx, ally] of followers.entries()) {
        if (!currentFurry || currentFurry.hp <= 0) break;
        await new Promise(r => setTimeout(r, 400));
        allyAttack(ally, idx, false);
    }
}

function allyAttack(ally, index, scheduleEnemyTurn = true) {
    if (!currentFurry) return;
    if (!currentFurry.hostile && gameMode !== 'peaceful') {
        makeEnemyHostile();
    }
    const damage = ally.fight;
    const oldHpPercent = Math.max(currentFurry.hp, 0) / currentFurry.maxHp * 100;
    currentFurry.hp = Math.max(currentFurry.hp - damage, 0);
    const newHpPercent = Math.max(currentFurry.hp, 0) / currentFurry.maxHp * 100;
    const oldFlirt = currentFurry.flirtBar;
    currentFurry.flirtBar = 0;
    const NarratorLines = getCurrentNarratorLines();
    updateNarrator(NarratorLines.allyDamage(ally.name, damage));
    const enemyCard = document.getElementById('enemyCard');
    if (enemyCard) {
        enemyCard.classList.add('damage-effect', 'flash-effect');
        setTimeout(() => enemyCard.classList.remove('damage-effect', 'flash-effect'), 300);
        enemyCard.classList.remove('glow');
    }
    animateStatBar('enemyHPBar', oldHpPercent, newHpPercent);
    const hpParent = document.getElementById('enemyHPBar').parentElement;
    showFloatingText(hpParent, `-${damage}`, 'down');
    if (oldFlirt > 0) {
        animateStatBar('enemyFlirtBar', oldFlirt, 0);
        const flirtParent = document.getElementById('enemyFlirtBar').parentElement;
        showFloatingText(flirtParent, `-${Math.floor(oldFlirt)}`, 'down');
    }
    updateHPBars();
    if (currentFurry.hp <= 0) {
        if (!currentFurry.wounded) {
            currentFurry.wounded = true;
            const NarratorLines = getCurrentNarratorLines();
            updateNarrator(NarratorLines.furryWounded);
            updateHPBars();
            // Update persistent encounter with wounded state
            updatePersistentEncounter();
        } else {
            const type = currentFurry.type;
            // Award XP to the ally who defeated the enemy
            const xpGain = getXPGain(currentFurry.size);
            ally.xp = (ally.xp || 0) + xpGain;
            console.log(`${ally.name} gained ${xpGain} XP for defeating ${currentFurry.name}`);
            
            // Remove from persistent encounters - enemy is truly defeated
            if (currentEncounterKey) {
                removePersistentEncounter(currentEncounterKey);
            }
            
            // Clear from tile and spawn new elsewhere 
            if (currentEncounterPos && furries[currentEncounterPos.x]) {
                furries[currentEncounterPos.x][currentEncounterPos.y] = null;
                spawnSingleFurry(type);
            }
            showOutcome('You won the battle!', () => {
                hideEnemyCard();
                hideHostileOverlay();
                currentFurry = null;
                currentEncounterPos = null;
                currentEncounterKey = null;
                renderMap();
                updatePlayerStats();
            });
        }
    }
    if (currentFurry.hostile && scheduleEnemyTurn) {
        setTimeout(enemyTurn, 500);
    }
}

async function hostileRound() {
    const order = [];
    order.push({ type: 'player', flee: playerStats.flee });
    followers.forEach((ally, i) => order.push({ type: 'ally', flee: ally.flee, index: i }));
    order.push({ type: 'enemy', flee: currentFurry.flee });
    order.sort((a, b) => b.flee - a.flee);
    for (const ent of order) {
        if (!currentFurry || currentFurry.hp <= 0 || playerStats.hp <= 0) break;
        await new Promise(r => setTimeout(r, 400));
        if (ent.type === 'player') {
            playerAttack(false);
        } else if (ent.type === 'ally') {
            const ally = followers[ent.index];
            if (ally) allyAttack(ally, ent.index, false);
        } else {
            enemyTurn();
        }
    }
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    updateHPBars();
}


async function startFightSequence() {
    if (!currentFurry) return;
    if (currentFurry.hostile) {
        await hostileRound();
        return;
    }
    if (pendingActor && pendingActor.type === 'ally') {
        const ally = followers[pendingActor.index];
        if (ally) allyAttack(ally, pendingActor.index, false); // Don't auto-schedule enemy turn
    } else {
        playerAttack(false); // Don't auto-schedule enemy turn
    }
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    
    // Turn advancement handled by executeActionOnEnemy
}





function playerFlirt() {
    if (!currentFurry) return;
    const valEl = document.getElementById('playerFlirtVal');
    const amount = valEl ? parseInt(valEl.textContent, 10) || playerStats.flirt : playerStats.flirt;
    const type = currentFurry.type;
    const gender = (window.furryGender && furryGender[type]) || 'unknown';
    const NarratorLines = getCurrentNarratorLines();
    if (currentFurry.flirtReady) {
        // Enemy is already at 100% flirt (Horny) - apply debuff instead of making neutral
        if (currentFurry.hostile) {
            applyFlirtDebuff(currentFurry);
        } else {
            // Already neutral, just show warm message
            updateNarrator(NarratorLines.furryWarms ? NarratorLines.furryWarms(type) : []);
        }
    } else {
        const oldPercent = currentFurry.flirtBar;
        currentFurry.flirtBar = Math.min(currentFurry.flirtBar + amount, 100);
        let narration;
        if (currentFurry.hostile) {
            narration = NarratorLines.playerFlirtHostileEnemy ? NarratorLines.playerFlirtHostileEnemy(type, gender) : [];
        } else {
            narration = NarratorLines.playerFlirtNonhostileEnemy ? NarratorLines.playerFlirtNonhostileEnemy(type, gender) : [];
        }
        if (narration.length > 0) {
            updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
        }
        animateStatBar('enemyFlirtBar', oldPercent, currentFurry.flirtBar);
        const parent = document.getElementById('enemyFlirtBar').parentElement;
        showFloatingText(parent, `+${amount}`, 'up', currentFurry.flirtBar);
        if (currentFurry.flirtBar >= 100) {
            currentFurry.flirtReady = true;
            if (NarratorLines.furryInterested) updateNarrator(NarratorLines.furryInterested(type, gender));
        }
        if (currentFurry.hostile) {
            setTimeout(enemyTurn, 500);
        }
    }
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    updateHPBars();
}

function recruitCurrentFurry() {
    if (!currentFurry) return;
    
    // Mark enemy as recruited for group-aware recruitment
    currentFurry.recruited = true;
    
    // Add to followers
    followers.push({ ...currentFurry });
    gainXP(getXPGain(currentFurry.size));
    
    // Check if this is the last enemy in the encounter
    const hasOtherEnemies = enemyGroup && enemyGroup.length > 0;
    
    if (!hasOtherEnemies) {
        // No other enemies - end entire encounter
        if (currentEncounterKey) {
            removePersistentEncounter(currentEncounterKey);
        }
        
        if (currentEncounterPos && furries[currentEncounterPos.x]) {
            furries[currentEncounterPos.x][currentEncounterPos.y] = null;
            spawnSingleFurry(currentFurry.type);
        }
        
        hideEnemyCard();
        hideHostileOverlay();
        clearSleepDebuffs();
        currentFurry = null;
        currentEncounterPos = null;
        currentEncounterKey = null;
        renderMap();
        clearTurnOrder();
    } else {
        // Other enemies remain - just update the persistent encounter data
        updatePersistentEncounter();
        console.log('Enemy recruited but other enemies remain in group');
    }
    
    updateFollowersUI();
    updatePlayerStats();
}

function playerFeast() {
    if (!currentFurry) return;
    const valEl = document.getElementById('playerFeastVal');
    const feastStat = valEl ? parseInt(valEl.textContent, 10) || playerStats.feast : playerStats.feast;

    let chance = 0;
    if (currentFurry.flirtBar >= 100) {
        chance = 1;
    } else if (currentFurry.wounded) {
        chance = 1;
    } else {
        const hpFactor = (currentFurry.maxHp - currentFurry.hp) / currentFurry.maxHp;
        chance = (feastStat / 100) * (0.5 + hpFactor);
        if (!currentFurry.hostile) chance += 0.2;
        chance = Math.min(chance, 1);
    }
    const NarratorLines = getCurrentNarratorLines();
    if (Math.random() < chance) {
        const size = currentFurry.size;
        let gain = 0;
        if (size === 'Small') gain = 10;
        else if (size === 'Medium') gain = 20;
        else gain = 30;
        playerStats.hunger = Math.min(playerStats.hunger + gain, 100);
        gainXP(getXPGain(currentFurry.size));
        
        // Remove from persistent encounters since enemy is feasted on
        if (currentEncounterKey) {
            removePersistentEncounter(currentEncounterKey);
        }
        
        if (currentEncounterPos && furries[currentEncounterPos.x]) {
            furries[currentEncounterPos.x][currentEncounterPos.y] = null;
            spawnSingleFurry(currentFurry.type);
        }
        updateNarrator(NarratorLines.feastSuccess(currentFurry.type, gain));
        hideEnemyCard();
        hideHostileOverlay();
        currentFurry = null;
        currentEncounterPos = null;
        currentEncounterKey = null;
        renderMap();
    } else {
        updateNarrator(NarratorLines.feastFail);
        if (!currentFurry.hostile && gameMode !== 'peaceful') {
            makeEnemyHostile();
        }
        if (currentFurry.hostile) {
            setTimeout(enemyTurn, 500);
        }
    }
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    updateHPBars();
}

function playerFuck() {
    if (!currentFurry) return;
    if (playerStats.hunger <= 0) {
        const NarratorLines = getCurrentNarratorLines();
        updateNarrator(NarratorLines.hungerTooLow);
        pendingAction = null;
        pendingActor = null;
        document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
        updateCardGlow();
        return;
    }
    const valEl = document.getElementById('playerFunVal');
    const fuckStat = valEl ? parseInt(valEl.textContent, 10) || playerStats.fuck : playerStats.fuck;
    let success = false;
    if (currentFurry.flirtBar >= 100) {
        success = true;
    } else {
        const flirtFactor = currentFurry.flirtBar / 100 + (currentFurry.hostile ? 0 : 0.5);
        const base = currentFurry.hostile ? 1000 : 200;
        const chance = (fuckStat / base) * flirtFactor;
        success = Math.random() < chance;
    }
    if (success) {
    const NarratorLines = getCurrentNarratorLines();
    updateNarrator(NarratorLines.recruitSuccess(currentFurry.type));
        const oldPlayerHP = playerStats.hp;
        const oldEnemyHP = currentFurry.hp;
        const oldEnemyFlirt = currentFurry.flirtBar;
        playerStats.hp = 100;
        currentFurry.hp = currentFurry.maxHp;
        currentFurry.flirtBar = 0;
        animateStatBar('playerHPBar', oldPlayerHP, 100);
        const playerParent = document.getElementById('playerHPBar').parentElement;
        const playerHeal = 100 - oldPlayerHP;
        if (playerHeal > 0) showFloatingText(playerParent, `+${playerHeal}`, 'up', 100);
        animateStatBar('enemyHPBar', (oldEnemyHP / currentFurry.maxHp) * 100, 100);
        const enemyParent = document.getElementById('enemyHPBar').parentElement;
        const enemyHeal = currentFurry.maxHp - oldEnemyHP;
        if (enemyHeal > 0) showFloatingText(enemyParent, `+${enemyHeal}`, 'up', 100);
        if (oldEnemyFlirt > 0) {
            animateStatBar('enemyFlirtBar', oldEnemyFlirt, 0);
            const flirtParent = document.getElementById('enemyFlirtBar').parentElement;
            showFloatingText(flirtParent, `-${Math.floor(oldEnemyFlirt)}`, 'down', 0);
        }
        recruitCurrentFurry();
        playerStats.hunger = Math.max(playerStats.hunger - 20, 0);
        updateHPBars();
        pendingAction = null;
        pendingActor = null;
        document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
        updateCardGlow();
        return;
    } else {
        const NarratorLines = getCurrentNarratorLines();
        updateNarrator(NarratorLines.actionFail);
        if (currentFurry.hostile) {
            setTimeout(enemyTurn, 500);
        }
    }
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    updateHPBars();
}

function playerFeed() {
    if (!currentFurry) return;
    const valEl = document.getElementById('playerFeedVal');
    const feedStat = valEl ? parseInt(valEl.textContent, 10) || playerStats.feed : playerStats.feed;
    
    let success = false;
    if (currentFurry.flirtBar >= 100) {
        success = true;
    } else {
        const flirtFactor = currentFurry.flirtBar / 100 + (currentFurry.hostile ? 0 : 0.5);
        const base = currentFurry.hostile ? 1000 : 150;
        const chance = (feedStat / base) * flirtFactor;
        success = Math.random() < chance;
    }
    
    const NarratorLines = getCurrentNarratorLines();
    if (success) {
        updateNarrator(NarratorLines.recruitSuccess(currentFurry.type));
        recruitCurrentFurry();
    } else {
        updateNarrator(NarratorLines.actionFail);
        if (!currentFurry.hostile && gameMode !== 'peaceful') {
            currentFurry.hostile = true;
            showHostileOverlay();
        }
        if (currentFurry.hostile) {
            setTimeout(enemyTurn, 500);
        }
    }
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    updateHPBars();
}

function allyFeed(ally, index) {
    if (!currentFurry) return;
    const feedStat = ally.feed;
    
    let success = false;
    if (currentFurry.flirtBar >= 100) {
        success = true;
    } else {
        const flirtFactor = currentFurry.flirtBar / 100 + (currentFurry.hostile ? 0 : 0.5);
        const base = currentFurry.hostile ? 1000 : 150;
        const chance = (feedStat / base) * flirtFactor;
        success = Math.random() < chance;
    }
    
    const NarratorLines = getCurrentNarratorLines();
    if (success) {
        updateNarrator(NarratorLines.recruitSuccess(currentFurry.type));
        recruitCurrentFurry();
    } else {
        updateNarrator(NarratorLines.actionFail);
        if (!currentFurry.hostile && gameMode !== 'peaceful') {
            currentFurry.hostile = true;
            showHostileOverlay();
        }
        if (currentFurry.hostile) {
            setTimeout(enemyTurn, 500);
        }
    }
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    updateHPBars();
}



function allyFlirt(ally, index) {
    if (!currentFurry) return;
    const amount = ally.flirt;
    const type = currentFurry.type;
    const gender = (window.furryGender && furryGender[type]) || 'unknown';
    const NarratorLines = getCurrentNarratorLines();
    if (currentFurry.flirtReady) {
        // Enemy is already at 100% flirt (Horny) - apply debuff instead of making neutral
        if (currentFurry.hostile) {
            applyFlirtDebuff(currentFurry);
        } else {
            // Already neutral, just show warm message
            updateNarrator(NarratorLines.furryWarms ? NarratorLines.furryWarms(type) : []);
        }
    } else {
        const oldPercent = currentFurry.flirtBar;
        currentFurry.flirtBar = Math.min(currentFurry.flirtBar + amount, 100);
        // Use appropriate narration based on enemy hostility
        let narration;
        if (currentFurry.hostile) {
            narration = NarratorLines.playerFlirtHostileEnemy ? NarratorLines.playerFlirtHostileEnemy(type, gender) : [];
        } else {
            narration = NarratorLines.playerFlirtNonhostileEnemy ? NarratorLines.playerFlirtNonhostileEnemy(type, gender) : [];
        }
        if (narration.length > 0) {
            updateNarrator(narration[Math.floor(Math.random() * narration.length)]);
        }
        animateStatBar('enemyFlirtBar', oldPercent, currentFurry.flirtBar);
        const parent = document.getElementById('enemyFlirtBar').parentElement;
        showFloatingText(parent, `+${amount}`, 'up', currentFurry.flirtBar);
        if (currentFurry.flirtBar >= 100) {
            currentFurry.flirtReady = true;
            if (NarratorLines.furryInterested) updateNarrator(NarratorLines.furryInterested(type, gender));
        }
        if (currentFurry.hostile) {
            setTimeout(enemyTurn, 500);
        }
    }
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    updateHPBars();
}

function allyFeast(ally, index) {
    if (!currentFurry) return;
    const feastStat = ally.feast;
    let chance = 0;
    if (currentFurry.flirtBar >= 100) {
        chance = 1;
    } else if (currentFurry.wounded) {
        chance = 1;
    } else {
        const hpFactor = (currentFurry.maxHp - currentFurry.hp) / currentFurry.maxHp;
        chance = (feastStat / 100) * (0.5 + hpFactor);
        if (!currentFurry.hostile) chance += 0.2;
        chance = Math.min(chance, 1);
    }
    const NarratorLines = getCurrentNarratorLines();
    if (Math.random() < chance) {
        const type = currentFurry.type;
        // Give XP to the ally who feasted, not the player
        const xpGain = getXPGain(currentFurry.size);
        ally.xp = (ally.xp || 0) + xpGain;
        
        // Check for ally level up
        while (ally.xp >= ally.level * 100) {
            ally.xp -= ally.level * 100;
            ally.level++;
            // Increase ally stats on level up
            ally.maxHp += 10;
            ally.hp = ally.maxHp;
            ally.fight += 2;
            ally.flirt += 2;
            ally.feast += 2;
            ally.fuck += 2;
            ally.flee += 2;
            ally.feed += 2;
        }
        
        // Remove from persistent encounters since enemy is feasted on by ally
        if (currentEncounterKey) {
            removePersistentEncounter(currentEncounterKey);
        }
        
        if (currentEncounterPos && furries[currentEncounterPos.x]) {
            furries[currentEncounterPos.x][currentEncounterPos.y] = null;
            spawnSingleFurry(currentFurry.type);
        }
        updateNarrator(NarratorLines.feastSuccess(currentFurry.type, 0));
        hideEnemyCard();
        hideHostileOverlay();
        currentFurry = null;
        currentEncounterPos = null;
        currentEncounterKey = null;
        currentEncounterPos = null;
        renderMap();
    } else {
        updateNarrator(NarratorLines.feastFail(currentFurry.type));
        if (!currentFurry.hostile && gameMode !== 'peaceful') {
            currentFurry.hostile = true;
            showHostileOverlay();
        }
        if (currentFurry.hostile) {
            setTimeout(enemyTurn, 500);
        }
    }
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    updateHPBars();
}

function allyFuck(ally, index) {
    if (!currentFurry) return;
    const fuckStat = ally.fuck;
    let success = false;
    if (currentFurry.flirtBar >= 100) {
        success = true;
    } else {
        const flirtFactor = currentFurry.flirtBar / 100 + (currentFurry.hostile ? 0 : 0.5);
        const base = currentFurry.hostile ? 1000 : 200;
        const chance = (fuckStat / base) * flirtFactor;
        success = Math.random() < chance;
    }
    const NarratorLines = getCurrentNarratorLines();
    if (success) {
        updateNarrator(NarratorLines.allyMadeOut(ally.name, currentFurry.gender || 'unknown'));
        const oldEnemyFlirt = currentFurry.flirtBar;
        if (oldEnemyFlirt > 0) {
            currentFurry.flirtBar = 0;
            animateStatBar('enemyFlirtBar', oldEnemyFlirt, 0);
            const flirtParent = document.getElementById('enemyFlirtBar').parentElement;
            showFloatingText(flirtParent, `-${Math.floor(oldEnemyFlirt)}`, 'down', 0);
        }
        if (currentFurry.hostile) {
            setTimeout(enemyTurn, 500);
        }
    } else {
        updateNarrator(NarratorLines.actionFail);
        if (currentFurry.hostile) {
            setTimeout(enemyTurn, 500);
        }
    }
    pendingAction = null;
    pendingActor = null;
    document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
    updateCardGlow();
    updateHPBars();
}

// Perform enemy attack action during their turn
function performEnemyAttack(enemy) {
    if (!enemy || !enemy.hostile || enemy.hp <= 0) return;
    const NarratorLines = getCurrentNarratorLines();
    const dmg = enemy.fight;
    const targets = [{ type: 'player' }];
    followers.forEach((_, i) => targets.push({ type: 'ally', index: i }));
    const target = targets[Math.floor(Math.random() * targets.length)];
    
    if (target.type === 'player') {
        const oldPercent = Math.max(playerStats.hp, 0) / 100 * 100;
        playerStats.hp = Math.max(playerStats.hp - dmg, 0);
        const newPercent = Math.max(playerStats.hp, 0) / 100 * 100;
        updateNarrator(NarratorLines.enemyHitPlayer(enemy.type, dmg));
        const playerCard = document.getElementById('playerCard');
        if (playerCard) {
            playerCard.classList.add('damage-effect', 'flash-effect');
            setTimeout(() => playerCard.classList.remove('damage-effect', 'flash-effect'), 300);
        }
        animateStatBar('playerHPBar', oldPercent, newPercent);
        const parent = document.getElementById('playerHPBar').parentElement;
        showFloatingText(parent, `-${dmg}`, 'down');
        updatePlayerStats();
        updateHPBars();
        if (playerStats.hp <= 0) {
            const type = enemy.type;
            hideEnemyCard();
            currentFurry = null;
            currentEncounterPos = null;
            handlePlayerDeath(type);
        }
    } else {
        const ally = followers[target.index];
        if (!ally) return;
        const oldPercent = Math.max(ally.hp, 0) / ally.maxHp * 100;
        ally.hp = Math.max(ally.hp - dmg, 0);
        const newPercent = Math.max(ally.hp, 0) / ally.maxHp * 100;
        updateNarrator(NarratorLines.enemyHitAlly(enemy.type, ally.name, dmg));
        const card = document.getElementById(`follower-${target.index}`);
        if (card) {
            card.classList.add('damage-effect', 'flash-effect');
            setTimeout(() => card.classList.remove('damage-effect', 'flash-effect'), 300);
            animateStatBar(`followerHPBar-${target.index}`, oldPercent, newPercent);
            const parent = card.querySelector('.hp-bar');
            if (parent) showFloatingText(parent, `-${dmg}`, 'down');
            const hpText = card.querySelector('.hp-text');
            if (hpText) hpText.textContent = `${ally.hp}/${ally.maxHp}`;
        }
        if (ally.hp <= 0) {
            // Enemy gets XP for defeating ally
            const xpGain = getXPGain(ally.size || 'Medium');
            enemy.xp = (enemy.xp || 0) + xpGain;
            console.log(`${enemy.name} gained ${xpGain} XP for defeating ${ally.name}`);
            
            followers.splice(target.index, 1);
            
            // Update turn order after ally removal
            updateTurnOrderAfterRemoval('ally', target.index);
            
            updateFollowersUI();
            
            const NarratorLines = getCurrentNarratorLines();
            updateNarrator(NarratorLines.allyDefeated(ally.name, enemy.name));
        }
    }
}

// Legacy enemy turn function - kept for backward compatibility but modified to use new turn system
function enemyTurn() {
    // Only execute if not using the new turn order system
    if (window.battleTurnOrder && window.battleTurnOrder.length > 0) {
        console.log('Battle turn system active - skipping legacy enemyTurn');
        return;
    }
    
    if (!currentFurry || !currentFurry.hostile || currentFurry.hp <= 0) return;
    performEnemyAttack(currentFurry);
}

function attemptEnemyFlee() {
    if (!currentFurry) return;
    
    const NarratorLines = getCurrentNarratorLines();
    if (Math.random() * 100 < currentFurry.flee) {
        updateNarrator(NarratorLines.enemyFled(currentFurry.type));
        hideEnemyCard();
        hideHostileOverlay();
        
        // Remove the fleeing enemy from the encounter
        if (currentEncounterKey) {
            removePersistentEncounter(currentEncounterKey);
        }
        
        currentFurry = null;
        currentEncounterPos = null;
        currentEncounterKey = null;
        
        // Clear turn order since combat ended
        if (typeof clearTurnOrder === 'function') {
            clearTurnOrder();
        }
    } else {
        updateNarrator(NarratorLines.enemyFleeFail(currentFurry.type));
        // Enemy flee failed, continue to next turn
        setTimeout(() => {
            if (typeof nextTurn === 'function') nextTurn();
        }, 1500);
    }
}

function attemptFlee() {
    if (!currentFurry) return true; // No enemy, flee successful
    const wasHostile = currentFurry.hostile;
    let fleeChance = 100;
    if (currentFurry.hostile) {
        const diff = playerStats.flee - currentFurry.flee;
        fleeChance = Math.max(5, Math.min(95, 50 + diff * 5));
    }
    if (!currentFurry.hostile || Math.random() * 100 < fleeChance) {
        showOutcome('You fled from the battle!', () => {
            hideEnemyCard();
            if (currentEncounterPos && furries[currentEncounterPos.x] && furries[currentEncounterPos.x][currentEncounterPos.y]) {
                furries[currentEncounterPos.x][currentEncounterPos.y].hostile = wasHostile;
            }
            currentFurry = null;
            currentEncounterPos = null;
            playerPosition = { x: previousPosition.x, y: previousPosition.y };
            previousPosition = { x: playerPosition.x, y: playerPosition.y };
            hideHostileOverlay();
            renderMap();
        });
        return true; // Flee successful
    } else {
        const NarratorLines = getCurrentNarratorLines();
        updateNarrator(NarratorLines.playerFleeFail);
        setTimeout(enemyTurn, 500);
        return false; // Flee failed
    }
    
    // Update persistent encounter after enemy turn
    updatePersistentEncounter();
}

function getXPGain(size) {
    switch (size) {
        case 'Small':
            return 10;
        case 'Medium':
            return 30;
        case 'Large':
            return 50;
        default:
            return 0;
    }
}

// Function to initialize the game
function updatePlayerStatsDisplay() {
    // Force update of all player UI elements
    updatePlayerStats();
    updateHPBars();
    
    // Also update any other player-related UI
    const nameEl = document.getElementById('playerName');
    if (nameEl) nameEl.textContent = window.playerName || playerName;
    
    console.log('[UI UPDATE] Player stats display updated - HP:', playerStats.hp, '/', playerStats.maxHp);
}

function performPostLoadSafetyCheck(loadSaveData) {
    console.log('[POST-LOAD] Performing safety check...');
    
    // Check if keep progress is enabled and this might be a death-revival situation
    const keepProgress = window.keepProgressOnDeath !== false;
    
    // Safety check 1: Ensure player has valid HP values
    if (!playerStats.maxHp || playerStats.maxHp <= 0) {
        console.warn('[POST-LOAD] Invalid maxHp detected, fixing...');
        playerStats.maxHp = 100;
    }
    
    if (playerStats.hp > playerStats.maxHp) {
        console.warn('[POST-LOAD] HP exceeds maxHp, capping...');
        playerStats.hp = playerStats.maxHp;
    }
    
    if (playerStats.hp <= 0 && keepProgress) {
        console.warn('[POST-LOAD] Player has 0 HP with keep progress enabled - auto-healing...');
        playerStats.hp = playerStats.maxHp;
    }
    
    // Safety check 2: Ensure player is in a safe location if keep progress enabled
    if (keepProgress && !isSafeLocation(playerPosition.x, playerPosition.y)) {
        console.warn('[POST-LOAD] Player is in unsafe location with keep progress enabled - moving to safety...');
        const safeLocation = findSafeSpawnLocation();
        if (safeLocation) {
            playerPosition.x = safeLocation.x;
            playerPosition.y = safeLocation.y;
            previousPosition = { x: playerPosition.x, y: playerPosition.y };
            console.log('[POST-LOAD] Moved player to safe location:', safeLocation);
        }
    }
    
    // Safety check 3: Clear any hostile encounters if player was auto-revived
    if (keepProgress && currentFurry && currentFurry.hostile) {
        console.warn('[POST-LOAD] Clearing hostile encounter after auto-revival...');
        currentFurry = null;
        enemyGroup = [];
        hideHostileOverlay();
        
        // Update window globals
        window.currentFurry = null;
        window.enemyGroup = [];
    }
    
    // Force UI update after safety checks
    updatePlayerStatsDisplay();
    render();
    
    console.log('[POST-LOAD] Safety check complete - Player HP:', playerStats.hp, '/', playerStats.maxHp, 'Position:', playerPosition);
}

export function startGame(loadSaveData) {
    // Set loading flag to prevent encounters during loading
    isGameLoading = true;
    
    // Show furry counter when entering game

    setTimeout(updateFurryCounter, 100);
    playerCardFirstSlide = true;
    // Check if the start container exists
    const startContainer = document.getElementById('startContainer');
    if (startContainer === null) {
        console.error('Could not find element with id "startContainer"');
        return;
    }

    // Check if the game container exists
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer === null) {
        console.error('Could not find element with id "gameContainer"');
        return;
    }

    const settingsOverlay = document.getElementById('settingsOverlay');
    if (settingsOverlay) settingsOverlay.style.display = 'none';

    const nameEl = document.getElementById('playerName');
    if (nameEl) nameEl.textContent = window.playerName || playerName;

    // Hide the start container
    startContainer.style.display = 'none';

    // Show the game container
    gameContainer.style.display = 'flex';
    const boardEl = document.getElementById('board');
    if (boardEl) boardEl.style.display = 'block';
    const playerCard = document.getElementById("playerCard");
    if (playerCard) {
        playerCard.style.display = "block";
        playerCard.classList.remove('slide-in-left');
        void playerCard.offsetWidth;
        playerCard.classList.add('slide-in-left');
    }
    playerCardFirstSlide = false;
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.style.display = 'grid';
    const minimapEl = document.getElementById('minimap');
    if (minimapEl) {
        minimapEl.style.display = 'block';
        // Start the pulse animation for the player position
        startMinimapAnimation();
    }
    const outcome = document.getElementById('outcomeScreen');
    if (outcome) outcome.style.display = 'none';
    const narrator = document.getElementById('battleNarrator');
    if (narrator) narrator.style.display = 'block';

    // Always sync worldSeed, playerPosition, playerStats, totalTilesWalked, and persistentEncounters to window for saving
    window.worldSeed = worldSeed;
    window.playerPosition = playerPosition;
    window.playerStats = playerStats;
    window.totalTilesWalked = totalTilesWalked;
    window.persistentEncounters = persistentEncounters;
    // Save current encounter state for mid-battle saves
    window.currentFurry = currentFurry;
    window.enemyGroup = enemyGroup;
    window.currentEncounterPos = currentEncounterPos;
    window.currentEncounterKey = currentEncounterKey;
    // For loaded games
    if (loadSaveData && typeof loadSaveData === 'object') {
        // Restore furry population count if present (for future use)
        if (typeof loadSaveData.furryPopulation === 'number') {
            setTimeout(() => updateFurryCounter(), 200);
        }
        worldSeed = loadSaveData.worldSeed ?? worldSeed;
        mapSize = loadSaveData.mapSize ?? mapSize;
        playerName = loadSaveData.playerName ?? playerName;
        gameMode = loadSaveData.gameMode ?? gameMode;
        if (Array.isArray(loadSaveData.followers)) followers = JSON.parse(JSON.stringify(loadSaveData.followers));
        if (loadSaveData.playerStats) Object.assign(playerStats, loadSaveData.playerStats);
        if (typeof loadSaveData.xp === 'number') playerStats.xp = loadSaveData.xp;
        if (typeof loadSaveData.level === 'number') playerStats.level = loadSaveData.level;
        map = Array.isArray(loadSaveData.map) ? JSON.parse(JSON.stringify(loadSaveData.map)) : [];
        furries = Array.isArray(loadSaveData.furries) ? JSON.parse(JSON.stringify(loadSaveData.furries)) : [];
        decorations = Array.isArray(loadSaveData.decorations) ? JSON.parse(JSON.stringify(loadSaveData.decorations)) : [];
        visited = Array.isArray(loadSaveData.visited) ? JSON.parse(JSON.stringify(loadSaveData.visited)) : [];
        // Restore persistent encounters
        persistentEncounters = (loadSaveData.persistentEncounters && typeof loadSaveData.persistentEncounters === 'object') 
            ? JSON.parse(JSON.stringify(loadSaveData.persistentEncounters)) : {};
        
        // Only generate map if not present in save
        if (!map.length) generateMap(worldSeed);
        // Restore player position after map generation
        playerPosition = loadSaveData.playerPosition || { x: 0, y: 0 };
        previousPosition = { x: playerPosition.x, y: playerPosition.y };
        // Restore day/night cycle
        if (typeof loadSaveData.cycleStartTime === 'number') {
            cycleStartTime = loadSaveData.cycleStartTime;
            window.cycleStartTime = cycleStartTime;
        }
        // Restore encounter state
        if (loadSaveData.encounterState) {
            const { currentFurry: savedFurry, currentEncounterPos: savedPos, enemyGroup: savedGroup, currentEncounterKey: savedKey, battleTurnOrder: savedTurnOrder, battleTurnIndex: savedTurnIndex } = loadSaveData.encounterState;
            currentFurry = savedFurry ? JSON.parse(JSON.stringify(savedFurry)) : null;
            currentEncounterPos = savedPos ? { ...savedPos } : null;
            currentEncounterKey = savedKey || null;
            enemyGroup = Array.isArray(savedGroup) ? JSON.parse(JSON.stringify(savedGroup)) : [];
            window.currentFurry = currentFurry;
            window.currentEncounterPos = currentEncounterPos;
            window.currentEncounterKey = currentEncounterKey;
            window.enemyGroup = enemyGroup;
            
            // Restore battle turn state if it exists
            if (Array.isArray(savedTurnOrder) && savedTurnOrder.length > 0) {
                window.battleTurnOrder = JSON.parse(JSON.stringify(savedTurnOrder));
                window.battleTurnIndex = savedTurnIndex || 0;
                console.log('Restored battle turn state - Order:', window.battleTurnOrder, 'Index:', window.battleTurnIndex);
            }
            
            // If there is an active encounter, restore the enemy board UI WITHOUT triggering new encounter generation
            if (currentFurry && currentEncounterPos) {
                // Directly show the enemy card and UI without calling encounterFurry
                const enemyNameEl = document.getElementById('encounteredFurry');
                if (enemyNameEl) enemyNameEl.textContent = currentFurry.name;
                showEnemyCard();
                console.log('Restored active encounter from save:', currentFurry.name);
                
                // If the encounter was hostile, restore battle state
                if (currentFurry.hostile) {
                    showHostileOverlay();
                    
                    // If no saved turn order exists, recalculate it
                    if (!window.battleTurnOrder || window.battleTurnOrder.length === 0) {
                        initializeTurnOrder();
                        console.log('No saved turn order - recalculated:', window.battleTurnOrder);
                    }
                    
                    // Always update UI to reflect current turn state
                    setTimeout(() => {
                        if (typeof updateTurnUI === 'function') {
                            updateTurnUI();
                            console.log('Turn UI updated after load');
                        }
                    }, 100);
                }
            }
        }
        updateVisitedTiles();
        renderMap();
        updatePlayerStats();
        updateFollowersUI();
        
        // Post-load safety check: Ensure player is in a valid state
        performPostLoadSafetyCheck(loadSaveData);
        
    // Ensure window globals are up to date for saving
    window.worldSeed = worldSeed;
    window.playerPosition = playerPosition;
    window.playerStats = playerStats;
    window.totalTilesWalked = totalTilesWalked;
    window.map = map;
    window.furries = furries;
    window.decorations = decorations;
    window.visited = visited;
    window.followers = followers;
        // Save immediately after loading
        if (typeof window.quickAutosave === 'function') setTimeout(window.quickAutosave, 50);
        
        // Clear loading flag after everything is restored
        setTimeout(() => {
            isGameLoading = false;
            console.log('Game loading complete - encounters enabled');
        }, 100);
        return;
    }
    followers = [];
    resetPlayerStats();
    map = [];
    furries = [];
    decorations = [];
    visited = [];
    worldSeed = Math.floor(Math.random() * 1e9);
    playerPosition = { x: 0, y: 0 };
    window.worldSeed = worldSeed;
    window.playerPosition = playerPosition;
    generateMap(worldSeed);
    updateVisitedTiles();
    renderMap();
    updatePlayerStats();
    updateFollowersUI();
    setTimeout(updateFurryCounter, 200);
    // Save immediately after new game loads
    if (typeof window.quickAutosave === 'function') setTimeout(window.quickAutosave, 50);
    
    // Clear loading flag after new game is set up
    setTimeout(() => {
        isGameLoading = false;
        console.log('New game setup complete - encounters enabled');
    }, 100);
}

function checkPlayerHP() {
    const playerHPElement = document.getElementById('playerHP');
    if (playerHPElement === null) {
        console.error('Could not find element with id "playerHP"');
        return;
    }

    let playerHP;
    try {
        playerHP = parseInt(playerHPElement.textContent, 10);
    } catch (error) {
        console.error('Error parsing player HP value:', error);
        return;
    }

    if (isNaN(playerHP) || playerHP <= 0) {
        console.error('Could not parse player HP value or it was already 0 or below');
        return;
    }

    // Set a minimum of 0
    playerHP = Math.max(0, playerHP);
    playerHPElement.textContent = playerHP.toString();
}

function resetPlayerStats() {
    playerStats.hp = 100;
    playerStats.xp = 0;
    playerStats.level = 1;
    playerStats.fight = 15;
    playerStats.flirt = 15;
    playerStats.feast = 15;
    playerStats.fuck = 20;
    playerStats.flee = 20;
    playerStats.feed = 10;
    playerStats.hunger = 100;
    tilesWalked = 0;
    totalTilesWalked = 0;
    hungerDepletionRate = 10;
    xpThreshold = 100;
    updatePlayerStats();
}

function resetUIPositions() {
    try {
        const startContainer = document.getElementById('startContainer');
        if (!startContainer) {
            console.error('Could not find element with id "startContainer"');
            return;
        }

        startContainer.style.justifyContent = 'center';
        // You can add more adjustments if needed
    } catch (error) {
        console.error('Unexpected error occurred while resetting UI positions:', error);
    }
}

// Function to handle player defeat
function despawnAllFurries() {
    for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {
            if (furries[i]) {
                furries[i][j] = null;
            }
        }
    }
    updateFurryCounter();
}

function handlePlayerDeath(furryType) {
    isPlayerDead = true; // Mark player as dead
    
    // Check if keep progress is enabled
    if (window.keepProgressOnDeath) {
        showDeathScreen(furryType);
    } else {
        // Original behavior - wipe save and go to main menu
        showOutcome(`You were defeated by the ${furryType}...`, () => {
            // Wipe save data
            wipeSaveData();
            returnToMainMenu();
        });
    }
}

function showDeathScreen(furryType) {
    const screen = document.getElementById('deathScreen');
    const messageEl = document.getElementById('deathMessage');
    const reviveBtn = document.getElementById('deathReviveBtn');
    const mainMenuBtn = document.getElementById('deathMainMenuBtn');
    
    if (!screen || !messageEl || !reviveBtn || !mainMenuBtn) {
        console.error('[SAFETY] Death screen elements not found, falling back to basic death handling');
        // Fallback to original death handling
        showOutcome(`You were defeated by the ${furryType}...`, () => {
            returnToMainMenu();
        });
        return;
    }
    
    // Security: Validate furryType
    const safeFurryType = (typeof furryType === 'string' && furryType.length > 0) ? furryType : 'unknown enemy';
    messageEl.textContent = `You were defeated by the ${safeFurryType}...`;
    
    // Security: Remove existing event listeners to prevent duplication
    const newReviveBtn = reviveBtn.cloneNode(true);
    const newMainMenuBtn = mainMenuBtn.cloneNode(true);
    reviveBtn.parentNode.replaceChild(newReviveBtn, reviveBtn);
    mainMenuBtn.parentNode.replaceChild(newMainMenuBtn, mainMenuBtn);
    
    newReviveBtn.onclick = () => {
        screen.style.display = 'none';
        
        // Security: Add delay to prevent rapid clicking
        newReviveBtn.disabled = true;
        setTimeout(() => {
            if (newReviveBtn) newReviveBtn.disabled = false;
        }, 1000);
        
        revivePlayer();
    };
    
    newMainMenuBtn.onclick = () => {
        screen.style.display = 'none';
        
        // Security: Add delay to prevent rapid clicking  
        newMainMenuBtn.disabled = true;
        setTimeout(() => {
            if (newMainMenuBtn) newMainMenuBtn.disabled = false;
        }, 1000);
        
        returnToMainMenu(); // Don't wipe save when keep progress enabled
    };
    
    screen.style.display = 'flex';
}

function wipeSaveData() {
    // Clear the current save slot
    if (window.stopGameTimers) {
        window.stopGameTimers();
    }
    
    // Use slots.js deleteSlot function if available
    if (typeof window.currentSaveSlot !== 'undefined' && window.currentSaveSlot !== null) {
        localStorage.removeItem(`tileSave${window.currentSaveSlot}`);
    }
}

function returnToMainMenu() {
    isPlayerDead = false; // Reset death state
    
    const battleCont = document.getElementById('battleContainer');
    const battleNarr = document.getElementById('battleNarrator');
    const gameContainer = document.getElementById('gameContainer');
    const startContainer = document.getElementById('startContainer');
    
    if (battleCont) battleCont.style.display = 'none';
    if (battleNarr) battleNarr.style.display = 'none';
    if (gameContainer) {
        gameContainer.style.display = 'none';
        // Stop minimap animation when game is hidden
        stopMinimapAnimation();
    }
    if (startContainer) startContainer.style.display = 'flex';

    currentFurry = null;
    hideHostileOverlay();
    despawnAllFurries();
    
    // Only clear followers if keep progress is disabled
    if (!window.keepProgressOnDeath) {
        followers = [];
        console.log('[MAIN MENU] Followers cleared - keep progress disabled');
    } else {
        console.log('[MAIN MENU] Followers preserved - keep progress enabled');
    }
    
    updateFollowersUI();
}

function revivePlayer() {
    // Security: Prevent multiple concurrent revival attempts
    if (!isPlayerDead) {
        console.warn('[SAFETY] Revival attempted but player is not dead');
        return;
    }
    
    isPlayerDead = false; // Mark player as alive again
    
    // Security: Validate and restore player stats
    if (!playerStats || typeof playerStats !== 'object') {
        console.error('[SAFETY] playerStats is invalid, cannot revive');
        return;
    }
    
    // Restore player to full health
    if (typeof playerStats.maxHp === 'number' && playerStats.maxHp > 0) {
        playerStats.hp = playerStats.maxHp;
    } else {
        console.warn('[SAFETY] maxHp is invalid, setting to 100');
        playerStats.maxHp = 100;
        playerStats.hp = 100;
    }
    
    // Clear any ongoing battle state to prevent duplication
    currentFurry = null;
    enemyGroup = [];
    targetedEnemyIndex = 0;
    
    // Clear battle state object if it exists
    if (window.battleState) {
        window.battleState.turnOrder = [];
        window.battleState.turnIndex = 0;
        window.battleState.inBattle = false;
    }
    
    hideHostileOverlay();
    
    // Find a safe location to spawn
    const safeLocation = findSafeSpawnLocation();
    if (safeLocation) {
        playerPosition.x = safeLocation.x;
        playerPosition.y = safeLocation.y;
        
        // Security: Validate the position was set correctly
        if (playerPosition.x !== safeLocation.x || playerPosition.y !== safeLocation.y) {
            console.error('[SAFETY] Failed to set player position correctly');
        }
    } else {
        console.error('[SAFETY] Could not find safe location for revival');
    }
    
    // Update UI with error handling
    try {
        if (typeof updatePlayerStatsDisplay === 'function') {
            updatePlayerStatsDisplay();
        }
        if (typeof render === 'function') {
            render();
        }
    } catch (error) {
        console.error('[SAFETY] Error updating UI after revival:', error);
    }
    
    // Save the revival state with error handling
    try {
        if (typeof window.quickAutosave === 'function') {
            window.isManualSaveInProgress = true; // Prevent auto-save notification
            window.quickAutosave();
            window.isManualSaveInProgress = false;
            
            // Show revival save notification
            if (typeof window.showSaveNotification === 'function') {
                window.showSaveNotification('Progress Saved - Revived', 'auto');
            }
        }
    } catch (error) {
        console.error('[SAFETY] Error saving after revival:', error);
    }
    
    console.log('[REVIVAL] Player revived successfully at position:', playerPosition);
}

function findSafeSpawnLocation() {
    // Security: Validate player position exists
    if (!playerPosition) {
        console.warn('[SAFETY] playerPosition is null, using map center');
        playerPosition = { x: Math.floor(mapSize / 2), y: Math.floor(mapSize / 2) };
    }
    
    // Try to move player one tile back from where they came
    const previousPos = findPreviousSafePosition();
    if (previousPos && isSafeLocation(previousPos.x, previousPos.y)) {
        return previousPos;
    }
    
    // If previous position isn't safe, find a random safe location
    return findRandomSafeLocation();
}

function findPreviousSafePosition() {
    // Security: Validate playerPosition
    if (!playerPosition || typeof playerPosition.x !== 'number' || typeof playerPosition.y !== 'number') {
        return null;
    }
    
    // Try positions adjacent to current position (simulating "one tile back")
    const directions = [
        { x: -1, y: 0 }, { x: 1, y: 0 }, 
        { x: 0, y: -1 }, { x: 0, y: 1 },
        { x: -1, y: -1 }, { x: -1, y: 1 },
        { x: 1, y: -1 }, { x: 1, y: 1 }
    ];
    
    for (const dir of directions) {
        const newX = playerPosition.x + dir.x;
        const newY = playerPosition.y + dir.y;
        
        if (isValidPosition(newX, newY) && isSafeLocation(newX, newY)) {
            return { x: newX, y: newY };
        }
    }
    
    return null;
}

function findRandomSafeLocation() {
    // Security: Validate mapSize exists and is valid
    const size = (typeof mapSize === 'number' && mapSize > 0) ? mapSize : 100;
    
    const maxAttempts = 100;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        
        if (isSafeLocation(x, y)) {
            return { x, y };
        }
        
        attempts++;
    }
    
    // Fallback to spawn point (center of map)
    const centerX = Math.floor(size / 2);
    const centerY = Math.floor(size / 2);
    console.warn('[SAFETY] Could not find safe location, using map center:', { x: centerX, y: centerY });
    return { x: centerX, y: centerY };
}

function isSafeLocation(x, y) {
    // Security: Validate inputs
    if (typeof x !== 'number' || typeof y !== 'number') {
        return false;
    }
    
    // Check if position is valid
    if (!isValidPosition(x, y)) return false;
    
    // Security: Check if data structures exist before accessing them
    if (furries && furries[x] && furries[x][y]) {
        for (const furry of furries[x][y]) {
            if (furry && furry.hostile) {
                return false;
            }
        }
    }
    
    // Security: Check if persistentEncounters exists
    if (persistentEncounters) {
        const encounterKey = `${x}_${y}`;
        if (persistentEncounters[encounterKey]) {
            const encounter = persistentEncounters[encounterKey];
            if (encounter.furry && encounter.furry.hostile) {
                return false;
            }
            if (encounter.enemyGroup && Array.isArray(encounter.enemyGroup)) {
                for (const enemy of encounter.enemyGroup) {
                    if (enemy && enemy.hostile) {
                        return false;
                    }
                }
            }
        }
    }
    
    return true;
}

function isValidPosition(x, y) {
    // Security: Validate inputs and mapSize
    if (typeof x !== 'number' || typeof y !== 'number') {
        return false;
    }
    
    const size = (typeof mapSize === 'number' && mapSize > 0) ? mapSize : 100;
    return x >= 0 && x < size && y >= 0 && y < size;
}

function updateFollowersUI() {
    const container = document.getElementById('followersContainer');
    if (!container) return;
    container.innerHTML = '';
    followers.forEach((f, i) => {
        const card = document.createElement('div');
        card.className = 'stat-card follower-card';
        card.id = `follower-${i}`;
        const name = document.createElement('h4');
        name.textContent = f.name;
        card.appendChild(name);

        // XP bar (match player, above level)
        const xpBar = document.createElement('div');
        xpBar.className = 'stat-bar';
        const xpFill = document.createElement('div');
        xpFill.className = 'stat-bar-fill';
        const xp = f.xp || 0;
        const xpThreshold = f.xpThreshold || 100;
        xpFill.style.width = `${Math.min(xp / xpThreshold * 100, 100)}%`;
        xpBar.appendChild(xpFill);
        const xpText = document.createElement('span');
        xpText.className = 'bar-text';
        xpText.textContent = `${xp}/${xpThreshold}`;
        xpBar.appendChild(xpText);
        card.appendChild(xpBar);

        // Level display (match player, below XP bar)
        const levelDiv = document.createElement('div');
        levelDiv.innerHTML = 'Lvl: <span class="playerLevelText">' + (f.level || 1) + '</span>';
        card.appendChild(levelDiv);

        // HP bar
        const hpBar = document.createElement('div');
        hpBar.className = 'hp-bar';
        const hpFill = document.createElement('div');
        hpFill.className = 'hp-fill';
        hpFill.id = `followerHPBar-${i}`;
        hpBar.appendChild(hpFill);
        const hpText = document.createElement('span');
        hpText.className = 'hp-text';
        hpBar.appendChild(hpText);
        hpFill.style.width = `${Math.max(f.hp, 0) / f.maxHp * 100}%`;
        hpText.textContent = `${f.hp}/${f.maxHp}`;
        card.appendChild(hpBar);

        // Flirt bar
        const flirtBar = document.createElement('div');
        flirtBar.className = 'flirt-bar';
        const flirtFill = document.createElement('div');
        flirtFill.className = 'flirt-fill';
        flirtBar.appendChild(flirtFill);
        const flirtText = document.createElement('span');
        flirtText.className = 'flirt-text';
        flirtBar.appendChild(flirtText);
        const flirtBarVal = typeof f.flirtBar === 'number' ? f.flirtBar : 0;
        flirtFill.style.width = `${flirtBarVal}%`;
        flirtText.textContent = flirtBarVal >= 100 ? 'Horny' : Math.floor(flirtBarVal);
        card.appendChild(flirtBar);

        // Stat buttons
        const statsDiv = document.createElement('div');
        statsDiv.className = 'stat-buttons';
        const statMap = [
            { label: 'Fight', value: f.fight, action: 'fight' },
            { label: 'Flirt', value: f.flirt, action: 'flirt' },
            { label: 'Feast', value: f.feast, action: 'feast' },
            { label: 'Fuck', value: f.fuck, action: 'fuck' },
            { label: 'Flee', value: f.flee, action: 'flee' },
            { label: 'Feed', value: f.feed, action: 'feed' }
        ];
        statMap.forEach(({ label, value, action }) => {
            const box = document.createElement('button');
            box.className = 'stat-btn';
            box.textContent = `${label} `;
            const span = document.createElement('span');
            span.textContent = value;
            box.appendChild(span);
            box.addEventListener('click', () => selectFollowerAction(i, action, box));
            statsDiv.appendChild(box);
        });
        card.appendChild(statsDiv);
        container.appendChild(card);
    });

    // Attach flirt target click listeners synchronously
    const playerCard = document.getElementById('playerCard');
    if (playerCard) {
        playerCard.onclick = function() {
            if (pendingAction && pendingActor) {
                executeInterPartyAction(pendingActor, { type: 'player' }, pendingAction);
            }
        };
    }
    document.querySelectorAll('.follower-card').forEach((card, i) => {
        card.onclick = function(e) {
            // Only trigger if the card itself was clicked, not a child button
            if (e.target !== card) return;
            if (pendingAction && pendingActor) {
                executeInterPartyAction(pendingActor, { type: 'ally', index: i }, pendingAction);
            }
        };
    });
    // Add flirt click for enemy card
    const enemyCard = document.getElementById('enemyCard');
    if (enemyCard) {
        enemyCard.onclick = function(e) {
            if (pendingAction === 'flirt' && pendingActor) {
                flirtActorToTarget(pendingActor, { type: 'enemy' });
                pendingAction = null;
                pendingActor = null;
                document.querySelectorAll('#playerCard .stat-btn, .follower-card .stat-btn').forEach(btn => btn.classList.remove('active'));
                updateCardGlow();
            }
        };
    }
}

function updateSlotButtons() {
    const slots = datastore.all();
    document.querySelectorAll('.save-slot').forEach(btn => {
        const slot = parseInt(btn.dataset.slot, 10);
        const data = slots[slot];
        if (data && data.playerName) {
            btn.textContent = `Slot ${slot + 1}: ${data.playerName}`;
        } else {
            btn.textContent = `Slot ${slot + 1}: Empty`;
        }
    });
}

function openSettingsBoard() {
    updateSlotButtons();
    const board = document.getElementById('settingsBoard');
    if (board) board.classList.add('open');
}

function closeSettingsBoard() {
    const board = document.getElementById('settingsBoard');
    if (board) board.classList.remove('open');
    selectedSlot = null;
    document.querySelectorAll('.save-slot').forEach(b => b.classList.remove('selected'));
}

document.querySelectorAll('.save-slot').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedSlot = parseInt(btn.dataset.slot, 10);
        const data = datastore.load(selectedSlot) || {};
        const nameInput = document.getElementById('playerNameInput');
        const sizeSelect = document.getElementById('mapSizeSelect');
        const modeSelect = document.getElementById('gameModeSelect');
        if (nameInput) nameInput.value = data.playerName || '';
        if (sizeSelect) sizeSelect.value = data.mapSize || '100';
        if (modeSelect) modeSelect.value = data.gameMode || 'normal';
        document.querySelectorAll('.save-slot').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});

const playBtnElement = document.getElementById('playButton');
if (playBtnElement) {
    playBtnElement.addEventListener('click', function() {
        openSettingsBoard();
    // const minimap = document.getElementById('minimap');
    // if (minimap !== null) minimap.style.zIndex = 1;

        const narratorEl = document.getElementById('battleNarrator');
        if (narratorEl !== null) narratorEl.style.zIndex = 1;

        const screenEl = document.getElementById('Screen');
        if (screenEl !== null) screenEl.style.zIndex = -2;
    });
}

const closeSettingsBtn = document.getElementById('closeSettingsBtn');
if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', closeSettingsBoard);
}

const startGameBtn = document.getElementById('startGameBtn');
if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        if (selectedSlot === null) return;
        const nameInput = document.getElementById('playerNameInput');
        if (nameInput && nameInput.value.trim()) {
            playerName = nameInput.value.trim();
        }
        const sizeSelect = document.getElementById('mapSizeSelect');
        if (sizeSelect) {
            const val = parseInt(sizeSelect.value, 10);
            if (!isNaN(val)) mapSize = val;
        }
        const modeSelect = document.getElementById('gameModeSelect');
        if (modeSelect) {
            gameMode = modeSelect.value;
        }

        datastore.save(selectedSlot, { playerName, mapSize, gameMode });

        enemyStatMultiplier = 1;
        for (const type in hostilityChances) {
            hostilityChances[type] = baseHostilityChances[type];
        }
        if (gameMode === 'peaceful') {
            for (const type in hostilityChances) {
                hostilityChances[type] = 0;
            }
        } else if (gameMode === 'easy') {
            enemyStatMultiplier = 0.75;
        } else if (gameMode === 'hard') {
            enemyStatMultiplier = 1.25;
        }

        startGame();
        closeSettingsBoard();
    });
}

updateSlotButtons();

document.querySelectorAll('#playerCard .stat-btn').forEach(btn => {
    const action = btn.dataset.action;
    if (action) {
        btn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent bubbling up to playerCard
            selectAction(action, btn);
        });
    }
});
const enemyCardEl = document.getElementById('enemyCard');

if (enemyCardEl) {
    enemyCardEl.addEventListener('click', onEnemyCardClick);
}

// Keyboard movement controls
// Touch/Swipe movement controls for mobile
let touchStartX = null, touchStartY = null;
const swipeThreshold = 75; // Minimum px for swipe
const gameContainer = document.getElementById('gameContainer');
if (gameContainer) {
    gameContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    });
    gameContainer.addEventListener('touchend', function(e) {
        if (touchStartX === null || touchStartY === null) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        let x = playerPosition.x;
        let y = playerPosition.y;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold) {
            // Horizontal swipe
            if (dx > 0) y += 1; // Swipe right
            else y -= 1; // Swipe left
        } else if (Math.abs(dy) > swipeThreshold) {
            // Vertical swipe
            if (dy > 0) x += 1; // Swipe down
            else x -= 1; // Swipe up
        } else {
            touchStartX = null; touchStartY = null; return;
        }
        movePlayer(x, y);
        touchStartX = null; touchStartY = null;
    });
}
let movementKeyHeld = false;
const movementKeys = [
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'
];

document.addEventListener('keydown', (e) => {
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
    }
    if (movementKeyHeld || !movementKeys.includes(e.key)) return;
    movementKeyHeld = true;

    let x = playerPosition.x;
    let y = playerPosition.y;
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            x -= 1;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            x += 1;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            y -= 1;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            y += 1;
            break;
        default:
            movementKeyHeld = false;
            return;
    }
    e.preventDefault();
    movePlayer(x, y);
});

document.addEventListener('keyup', (e) => {
    if (movementKeys.includes(e.key)) {
        movementKeyHeld = false;
    }
});

// Periodically add more furries to the map
setInterval(() => spawnFurries(500), 60000);