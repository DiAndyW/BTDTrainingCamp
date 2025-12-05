// src/main.js - BTD-style game with waves and balloon types
import './index.css';
import * as THREE from 'three';
import { initScene } from './scene.js';
import { initUI } from './ui.js';
import { initWalls } from './walls.js';
import { loadCones, loadWeaponModel } from './objects.js';
import { spawnBalloon, updateBalloons, getBalloons, damageBalloon, setCallbacks, getActiveBalloonCount, clearAllBalloons, getTotalBalloonsRemaining } from './balloons.js';
import { shootProjectile, updateProjectiles, getProjectiles, removeProjectile } from './projectiles.js';
import { initControls } from './controls.js';
import { updateParticles, createExplosion } from './particles.js';
import { initWaves, startNextWave, checkWaveComplete, getWaveProgress, isWaveActive } from './waves.js';
import { TrajectoryPreview } from './trajectory.js';

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
const { addScore, loseLife, showSpawnWarning, isGameStarted, isGamePaused, showWaveStart, updateBalloonsRemaining } = ui;
const { checkWallCollision } = initWalls(scene);
const { updateMovement, cleanup: controlsCleanup } = initControls(
    camera,
    renderer,
    () => shootProjectile(scene, camera)
);

// Initialize trajectory preview
const trajectoryPreview = new TrajectoryPreview(scene, camera);

// Initialize wave system
initWaves(
    scene,
    // On wave start
    (waveNum, description, totalBalloons) => {
        showWaveStart(waveNum, description);
        updateBalloonsRemaining(totalBalloons);
    },
    // On wave complete - auto-start next wave after delay
    (waveNum) => {
        setTimeout(() => {
            startNextWave();
        }, 2000); // 2 second break between waves
    }
);

// Callbacks for balloon events
setCallbacks(
    // On escape - damage based on balloon value
    (damage) => loseLife(damage),
    // On spawn warning
    (x, y) => showSpawnWarning(x, y),
    // On pop - create explosion
    (position, color) => createExplosion(scene, position, color)
);

// Load 3D objects
loadCones(scene);

// Expose camera for weapon loading
window.gameCamera = camera;

// Start-game handler - initialize wave system
window.onGameStart = () => {
    // Auto-start first wave
    startNextWave();
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

        // Update trajectory
        trajectoryPreview.update();

        // Update balloon count in UI - show total pops remaining
        const totalRemaining = getTotalBalloonsRemaining();
        updateBalloonsRemaining(totalRemaining);

        const balloons = getBalloons();
        const projectiles = getProjectiles();

        // Collision detection with damage system
        for (let i = balloons.length - 1; i >= 0; i--) {
            const b = balloons[i];
            if (b.isDying) continue; // Skip dying balloons

            // Use balloon object position instead of full group (excludes string)
            b.balloonObject.getWorldPosition(tmpB);

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
                    // Get damage from projectile
                    const damage = p.damage || 1;

                    // Damage the balloon (may pop it and spawn children)
                    const result = damageBalloon(scene, i, damage);

                    // Remove projectile
                    removeProjectile(scene, j);

                    if (result.popped) {
                        // Award points based on balloon type
                        addScore(result.points);

                        // Create explosion at pop location
                        if (result.position) {
                            createExplosion(scene, result.position, result.color);
                        }
                    }

                    break;
                }
            }
        }

        // Check for wave completion
        checkWaveComplete();
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
