// config.js - Game configuration settings

let gameConfig = {
    gravity: -9.8,
    balloonSize: 1.0, // Multiplier for balloon radius
    spawnDirection: 'random', // 'left', 'right', or 'random'
    movementPattern: 'random', // 'random', 'NORMAL', 'ZIGZAG', 'SINE', 'RISE', or 'SPIRAL'
    baseSpeed: 1.5, // Base movement speed for balloons
};

export function getGravity() {
    return gameConfig.gravity;
}

export function setGravity(value) {
    gameConfig.gravity = value;
}

export function getBalloonSize() {
    return gameConfig.balloonSize;
}

export function setBalloonSize(value) {
    gameConfig.balloonSize = value;
}

export function getSpawnDirection() {
    return gameConfig.spawnDirection;
}

export function setSpawnDirection(value) {
    gameConfig.spawnDirection = value;
}

export function getMovementPattern() {
    return gameConfig.movementPattern;
}

export function setMovementPattern(value) {
    gameConfig.movementPattern = value;
}

export function getBaseSpeed() {
    return gameConfig.baseSpeed;
}

export function setBaseSpeed(value) {
    gameConfig.baseSpeed = value;
}

export function getConfig() {
    return { ...gameConfig };
}

export function resetConfig() {
    gameConfig.gravity = -9.8;
    gameConfig.balloonSize = 1.0;
    gameConfig.spawnDirection = 'random';
    gameConfig.movementPattern = 'random';
    gameConfig.baseSpeed = 1.5;
}
