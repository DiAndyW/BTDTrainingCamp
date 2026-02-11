// waves.js - Wave management system for BTD-style progression
import { spawnBalloon, getActiveBalloonCount, BALLOON_TYPES } from './balloons.js';

let currentWave = 0;
let balloonsInWave = 0;
let balloonsSpawned = 0;
let waveActive = false;
let spawnTimer = null;
let onWaveComplete = null;
let onWaveStart = null;
let scene = null;
let isPausedCallback = null;

const WAVE_CONFIGS = [
    // Wave 1: Introduction - just reds
    { 
        balloons: [{ type: 'RED', count: 10 }],
        spawnDelay: 1500,
        description: 'Red Balloons'
    },
    // Wave 2: Blues appear
    { 
        balloons: [
            { type: 'RED', count: 10 },
            { type: 'BLUE', count: 5 }
        ],
        spawnDelay: 1300,
        description: 'Blue Balloons'
    },
    // Wave 3: Greens
    { 
        balloons: [
            { type: 'BLUE', count: 7 },
            { type: 'GREEN', count: 5 }
        ],
        spawnDelay: 1200,
        description: 'Green Balloons'
    },
    // Wave 4: Yellows - fast!
    { 
        balloons: [
            { type: 'GREEN', count: 10 },
            { type: 'YELLOW', count: 5 }
        ],
        spawnDelay: 1000,
        description: 'Yellow Balloons'
    },
    // Wave 5: Pinks
    { 
        balloons: [
            { type: 'YELLOW', count: 10 },
            { type: 'PINK', count: 5 }
        ],
        spawnDelay: 900,
        description: 'Pink Balloons'
    },
    // Wave 6: Blacks appear (2 HP!)
    { 
        balloons: [
            { type: 'PINK', count: 10 },
            { type: 'BLACK', count: 3 }
        ],
        spawnDelay: 1000,
        description: 'Black Balloons'
    },
    // Wave 7: Mixed assault
    { 
        balloons: [
            { type: 'GREEN', count: 15 },
            { type: 'PINK', count: 8 },
            { type: 'BLACK', count: 5 }
        ],
        spawnDelay: 800,
        description: 'Mixed Wave'
    },
    // Wave 8: Whites
    { 
        balloons: [
            { type: 'YELLOW', count: 15 },
            { type: 'BLACK', count: 5 },
            { type: 'WHITE', count: 5 }
        ],
        spawnDelay: 800,
        description: 'White Balloons'
    },
    // Wave 9: Heavy assault
    { 
        balloons: [
            { type: 'PINK', count: 10 },
            { type: 'BLACK', count: 5 },
            { type: 'WHITE', count: 3 }
        ],
        spawnDelay: 700,
        description: 'Heavy Assault'
    },
    // Wave 10: Lead appears!
    { 
        balloons: [
            { type: 'BLACK', count: 6 },
            { type: 'WHITE', count: 6 },
            { type: 'LEAD', count: 3 }
        ],
        spawnDelay: 800,
        description: 'Lead Balloons!'
    }
];

// Generate wave for waves beyond defined configs
function generateWave(waveNum) {
    const baseCount = 10 + (waveNum - WAVE_CONFIGS.length) * 5;
    const types = Object.keys(BALLOON_TYPES);
    
    const maxTypeIndex = Math.min(types.length - 1, Math.floor((waveNum - WAVE_CONFIGS.length) / 2) + 6);
    
    const balloons = [];
    for (let i = 0; i <= maxTypeIndex; i++) {
        const count = Math.max(1, Math.floor(baseCount / (i + 1)));
        balloons.push({ type: types[i], count });
    }
    
    return {
        balloons,
        spawnDelay: Math.max(400, 800 - (waveNum - WAVE_CONFIGS.length) * 30),
        description: `Wave ${waveNum}`
    };
}

function getWaveConfig(waveNum) {
    if (waveNum <= WAVE_CONFIGS.length) {
        return WAVE_CONFIGS[waveNum - 1];
    }
    return generateWave(waveNum);
}

export function initWaves(gameScene, waveStartCallback, waveCompleteCallback, isPausedFunc = null) {
    scene = gameScene;
    onWaveStart = waveStartCallback;
    onWaveComplete = waveCompleteCallback;
    isPausedCallback = isPausedFunc;
    currentWave = 0;
    balloonsInWave = 0;
    balloonsSpawned = 0;
    waveActive = false;
}

export function startNextWave() {
    if (waveActive) return false;
    
    currentWave++;
    const config = getWaveConfig(currentWave);
    
    balloonsInWave = config.balloons.reduce((sum, b) => sum + b.count, 0);
    balloonsSpawned = 0;
    waveActive = true;
    

    if (onWaveStart) {
        onWaveStart(currentWave, config.description, balloonsInWave);
    }
    

    const spawnQueue = [];
    config.balloons.forEach(({ type, count }) => {
        for (let i = 0; i < count; i++) {
            spawnQueue.push(type);
        }
    });
    

    for (let i = spawnQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [spawnQueue[i], spawnQueue[j]] = [spawnQueue[j], spawnQueue[i]];
    }
    

    let spawnIndex = 0;
    function spawnNext() {
        if (isPausedCallback && isPausedCallback()) {
            spawnTimer = setTimeout(spawnNext, 100);
            return;
        }

        if (spawnIndex < spawnQueue.length) {
            const yPos = 0.5 + Math.random() * 4;
            spawnBalloon(scene, yPos, spawnQueue[spawnIndex]);
            balloonsSpawned++;
            spawnIndex++;
            spawnTimer = setTimeout(spawnNext, config.spawnDelay);
        }
    }
    
    spawnTimer = setTimeout(spawnNext, 1000);
    
    return true;
}

export function checkWaveComplete() {
    if (waveActive && balloonsSpawned >= balloonsInWave && getActiveBalloonCount() === 0) {
        waveActive = false;
        if (onWaveComplete) {
            onWaveComplete(currentWave);
        }
        return true;
    }
    return false;
}

export function getCurrentWave() {
    return currentWave;
}

export function isWaveActive() {
    return waveActive;
}

export function getWaveProgress() {
    if (!waveActive) return { spawned: 0, total: 0, remaining: 0 };
    return {
        spawned: balloonsSpawned,
        total: balloonsInWave,
        remaining: getActiveBalloonCount()
    };
}

export function stopWave() {
    if (spawnTimer) {
        clearTimeout(spawnTimer);
        spawnTimer = null;
    }
    waveActive = false;
}
