// config.js - Game configuration settings

let gameConfig = {
    gravity: -9.8,
    balloonSize: 1.0, // Multiplier for balloon radius
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

export function getConfig() {
    return { ...gameConfig };
}

export function resetConfig() {
    gameConfig.gravity = -9.8;
    gameConfig.balloonSize = 1.0;
}
