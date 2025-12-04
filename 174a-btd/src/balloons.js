// balloons.js - Balloon creation and management
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const balloons = [];
const objLoader = new OBJLoader();
let onBalloonEscape = null;
let onBalloonSpawn = null;

// Balloon materials
const materials = {
    red: new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.3, metalness: 0.1 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x0088ff, roughness: 0.3, metalness: 0.1 }),
    green: new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.3, metalness: 0.1 }),
    yellow: new THREE.MeshStandardMaterial({ color: 0xffff00, roughness: 0.3, metalness: 0.1 })
};

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

                    child.material = materials.red; // Default
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

export function spawnBalloon(scene, startY = null, type = 'red') {
    const yPos = startY !== null ? startY : 0.5 + Math.random() * 4;

    // Show spawn warning UI
    if (onBalloonSpawn) {
        onBalloonSpawn(15, 50); // 15% left, 50% height
    }

    // Config based on type
    let speed = 1.5;
    let health = 1;
    let scale = 1.0;
    let radius = 1.3;
    
    if (type === 'blue') { speed = 2.5; }
    if (type === 'green') { speed = 1.2; health = 2; scale = 1.1; }
    if (type === 'yellow') { speed = 0.8; health = 5; scale = 2.0; radius = 2.5; }

    // Spawn after warning delay
    setTimeout(() => {
        createBalloonMesh((balloonMesh) => {
            // Start off-screen left
            balloonMesh.position.set(-5, yPos, -10);
            
            // Apply type-specific material and scale
            balloonMesh.traverse((child) => {
                if (child.isMesh && child.geometry.type !== 'CylinderGeometry') { // Avoid string (cylinder-ish?) No string is OBJ too.
                    // We need to identify the balloon body vs string.
                    // In createBalloonMesh, we added balloonObject then stringObject.
                    // But here we have the group.
                    // Let's just apply to the first child which is the balloon body usually?
                    // Actually createBalloonMesh loads them async.
                    // Let's assume the material assignment in createBalloonMesh is default red.
                    // We can override it here.
                    // The balloon body has > 100 vertices usually.
                    if (child.geometry.attributes.position.count > 100) {
                         child.material = materials[type];
                    }
                }
            });
            
            balloonMesh.scale.multiplyScalar(scale);
            
            scene.add(balloonMesh);

            // Movement
            const velocity = new THREE.Vector3(speed, 0.1, 0);

            balloons.push({
                mesh: balloonMesh,
                velocity,
                radius: radius * scale,
                time: Math.random() * Math.PI * 2,
                health: health,
                type: type,
                maxHealth: health
            });
        });
    }, 1500);
}

export function updateBalloons(scene, dt, gravity) {
    for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];

        // Handle dying state (deflating/escaping)
        if (b.isDying) {
            b.mesh.position.y += dt * 5; // Fly up quickly
            b.mesh.scale.multiplyScalar(0.95); // Shrink
            b.mesh.rotation.y += dt * 10; // Spin

            if (b.mesh.scale.x < 0.1) {
                // Actually remove
                scene.remove(b.mesh);
                b.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.dispose();
                        child.material.dispose();
                    }
                });
                balloons.splice(i, 1);
                
                // Spawn replacement if it was an escape
                if (b.wasEscape) {
                    // spawnBalloon(scene); // Don't auto-spawn in wave mode
                }
            }
            continue;
        }

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
        if (y < -0.5) {
            if (onBalloonEscape) onBalloonEscape();

            // Start dying animation instead of instant remove
            b.isDying = true;
            b.wasEscape = true;
            // continue; // Let the loop continue to handle the dying state next frame
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
