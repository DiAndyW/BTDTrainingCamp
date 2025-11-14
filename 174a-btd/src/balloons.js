// balloons.js - Balloon creation and management
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const balloons = [];
const objLoader = new OBJLoader();
let onBalloonEscape = null;
let onBalloonSpawn = null;

// Balloon body material
const balloonMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    shininess: 80,
    specular: 0x222222,
    flatShading: false,
});

// String material
const stringMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 30,
});

function createBalloonMesh(callback) {
    const group = new THREE.Group();
    let loadedCount = 0;

    // Load balloon body
    objLoader.load(
        '../models/balloon.obj',
        function (balloonObject) {

            balloonObject.scale.set(0.8, 0.8, 0.8);

            balloonObject.traverse((child) => {
                if (child.isMesh) {
                    // Fix: center geometry so hitbox matches balloon
                    child.geometry.computeBoundingBox();
                    const center = new THREE.Vector3();
                    child.geometry.boundingBox.getCenter(center);
                    child.geometry.translate(-center.x, -center.y, -center.z);

                    child.material = balloonMaterial;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            group.add(balloonObject);
            loadedCount++;
            if (loadedCount === 2) callback(group);
        }
    );

    // Load string
    objLoader.load(
        '../models/string.obj',
        function (stringObject) {

            stringObject.scale.set(0.7, 0.7, 0.7);
            stringObject.scale.y = 1.2; // Stretch string vertically

            // After centering balloon, string must be repositioned
            stringObject.position.set(0, -2, 0);

            stringObject.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.computeVertexNormals();
                    child.material = stringMaterial;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            group.add(stringObject);
            loadedCount++;
            if (loadedCount === 2) callback(group);
        }
    );
}

export function spawnBalloon(scene, startY = null) {
    const yPos = startY !== null ? startY : 0.5 + Math.random() * 4;

    // Show spawn warning UI
    if (onBalloonSpawn) {
        onBalloonSpawn(15, 50); // 15% left, 50% height
    }

    // Spawn after warning delay
    setTimeout(() => {
        createBalloonMesh((balloonMesh) => {
            // Start off-screen left
            balloonMesh.position.set(-5, yPos, -10);
            scene.add(balloonMesh);

            // Movement
            const velocity = new THREE.Vector3(1.5, 0.1, 0);

            balloons.push({
                mesh: balloonMesh,
                velocity,
                radius: 1.3,
                time: Math.random() * Math.PI * 2
            });
        });
    }, 1500);
}

export function updateBalloons(scene, dt, gravity) {
    for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];

        // Floating motion
        b.time += dt * 0.8;
        const arcOffset = Math.sin(b.time) * 0.3;

        // Light gravity
        b.velocity.addScaledVector(gravity, dt * 0.05);

        // Apply movement
        b.mesh.position.x += b.velocity.x * dt;
        b.mesh.position.y += (b.velocity.y + arcOffset) * dt;
        b.mesh.position.z += b.velocity.z * dt;

        const x = b.mesh.position.x;
        const y = b.mesh.position.y;

        // remove life if ballon escapes past the floor
        if (y < -2) {
            if (onBalloonEscape) onBalloonEscape();

            scene.remove(b.mesh);
            b.mesh.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            balloons.splice(i, 1);

            // Keep balloons flowing
            spawnBalloon(scene);
            continue;
        }
    }
}

export function getBalloons() {
    return balloons;
}

export function removeBalloon(scene, index) {
    const b = balloons[index];
    scene.remove(b.mesh);

    b.mesh.traverse((child) => {
        if (child.isMesh) {
            child.geometry.dispose();
            child.material.dispose();
        }
    });

    balloons.splice(index, 1);
}

export function setCallbacks(escapeCallback, spawnCallback) {
    onBalloonEscape = escapeCallback;
    onBalloonSpawn = spawnCallback;
}
