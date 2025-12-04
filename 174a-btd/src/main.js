// src/main.js - Correct working collision version
import './index.css';
import * as THREE from 'three';
import { initScene } from './scene.js';
import { initUI } from './ui.js';
import { initWalls } from './walls.js';
import { loadCones, loadPlayerHand } from './objects.js';
import { spawnBalloon, updateBalloons, getBalloons, removeBalloon, setCallbacks } from './balloons.js';
import { shootProjectile, updateProjectiles, getProjectiles, removeProjectile } from './projectiles.js';
import { initControls } from './controls.js';
import { updateParticles, createExplosion } from './particles.js';
import { GameManager } from './game.js';

// Root container
const root = document.getElementById('root');
root.innerHTML = '';
root.style.margin = '0';
root.style.padding = '0';
root.style.width = '100vw';
root.style.height = '100vh';

// Main container for Three + overlays
const container = document.createElement('div');
container.style.width = '100%';
container.style.height = '100%';
container.style.position = 'relative';
container.style.overflow = 'hidden';
container.style.backgroundColor = 'black';
root.appendChild(container);

// Initialize all modules
const { scene, camera, renderer, cleanup: sceneCleanup } = initScene(container);
const ui = initUI(container);
const { addScore, loseLife, showSpawnWarning, isGameStarted, isGamePaused } = ui;
const { checkWallCollision } = initWalls(scene);

// Game Manager
const gameManager = new GameManager(ui);
window.gameManager = gameManager; // For UI access

const { updateMovement, cleanup: controlsCleanup } = initControls(
    camera,
    renderer,
    () => {
        // Check for rapid fire upgrade
        const rapidFireLevel = gameManager.getUpgradeLevel('rapidFire');
        // Base cooldown 500ms, reduce by 50ms per level
        const cooldown = Math.max(100, 500 - rapidFireLevel * 50);
        
        const now = Date.now();
        if (now - lastShotTime > cooldown) {
            shootProjectile(scene, camera, gameManager.upgrades);
            lastShotTime = now;
        }
    }
);
let lastShotTime = 0;

// Callbacks
setCallbacks(
    () => gameManager.enemyEscaped(),
    (x, y) => showSpawnWarning(x, y)
);

// Load 3D objects
loadCones(scene);
loadPlayerHand(camera);

// Start-game handler
window.onGameStart = () => {
    gameManager.startWave(scene, spawnBalloon);
};

// Physics
const gravity = new THREE.Vector3(0, -9.8, 0);
const clock = new THREE.Clock();
const moveSpeed = 8.0;

// Temp vectors
const tmpP = new THREE.Vector3();
const tmpB = new THREE.Vector3();

// Animation loop
let animationId;

function animate() {
    animationId = requestAnimationFrame(animate);
    const dt = clock.getDelta();

    if (isGameStarted() && !isGamePaused()) {

        updateMovement(dt, moveSpeed, checkWallCollision);
        updateProjectiles(scene, dt, gravity);
        updateBalloons(scene, dt, gravity);
        updateParticles(scene, dt);
        
        // Wave management
        if (!gameManager.waveActive && gameManager.lives > 0) {
             // Auto start next wave after delay? Or wait for user?
             // Let's auto start for now after a short delay handled in gameManager or here
             // Actually gameManager.endWave just updates UI.
             // Let's add a timer to start next wave
             if (!gameManager.waveTimer) {
                 gameManager.waveTimer = setTimeout(() => {
                     gameManager.startWave(scene, spawnBalloon);
                     gameManager.waveTimer = null;
                 }, 4000);
             }
        }

        const balloons = getBalloons();
        const projectiles = getProjectiles();

        // Correct working collision
        for (let i = balloons.length - 1; i >= 0; i--) {
            const b = balloons[i];
            b.mesh.getWorldPosition(tmpB);

            // Balloon radius fallback
            let bRadius = b.radius;
            if (!bRadius) {
                b.mesh.geometry.computeBoundingSphere?.();
                bRadius = b.mesh.geometry.boundingSphere?.radius || 0.75;
            }

            for (let j = projectiles.length - 1; j >= 0; j--) {
                const p = projectiles[j];
                p.mesh.getWorldPosition(tmpP);

                // Projectile radius fallback
                let pRadius = p.radius;
                if (!pRadius) {
                    p.mesh.geometry.computeBoundingSphere?.();
                    pRadius = p.mesh.geometry.boundingSphere?.radius || 0.2;
                }

                const dist = tmpB.distanceTo(tmpP);
                const hitDistance = bRadius + pRadius;

                if (dist < hitDistance) {
                    // Explosion effect
                    createExplosion(scene, tmpB, 0xff0000); // TODO: Color based on balloon type?

                    // Damage balloon
                    const damage = 1 + (gameManager.getUpgradeLevel('damage') || 0);
                    b.health -= damage;

                    // Remove projectile
                    removeProjectile(scene, j);

                    if (b.health <= 0) {
                        // Kill balloon
                        removeBalloon(scene, i);
                        gameManager.enemyDefeated(10 * (b.maxHealth || 1));
                    } else {
                        // Hit effect but not dead?
                        // Maybe flash white?
                    }

                    break;
                }
            }
        }
    }

    renderer.render(scene, camera);
}

animate();

// HMR
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        cancelAnimationFrame(animationId);
        sceneCleanup();
        controlsCleanup();
    });
}
