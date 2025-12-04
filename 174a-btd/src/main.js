// src/main.js - Correct working collision version
import './index.css';
import * as THREE from 'three';
import { initScene } from './scene.js';
import { initUI } from './ui.js';
import { initWalls } from './walls.js';
import { loadCones, loadWeaponModel } from './objects.js';
import { spawnBalloon, updateBalloons, getBalloons, removeBalloon, setCallbacks } from './balloons.js';
import { shootProjectile, updateProjectiles, getProjectiles, removeProjectile } from './projectiles.js';
import { initControls } from './controls.js';
import { updateParticles, createExplosion } from './particles.js';

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
const { updateMovement, cleanup: controlsCleanup } = initControls(
    camera,
    renderer,
    () => shootProjectile(scene, camera)
);

// Callbacks
setCallbacks(
    () => loseLife(),
    (x, y) => showSpawnWarning(x, y)
);

// Load 3D objects
loadCones(scene);

// Expose camera for weapon loading
window.gameCamera = camera;

// Start-game handler
window.onGameStart = () => {
    spawnBalloon(scene, 2);
    spawnBalloon(scene, 4);
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
                    // REMOVE BY INDEX (your original logic)
                    removeBalloon(scene, i);
                    removeProjectile(scene, j);

                    // Explosion effect
                    createExplosion(scene, tmpB, 0xff0000);

                    // Use damage for score calculation
                    const damageMultiplier = p.damage || 1;
                    addScore(Math.round(10 * damageMultiplier));
                    spawnBalloon(scene);

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
