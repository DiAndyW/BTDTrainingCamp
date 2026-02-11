// balloons.js - Balloon creation and management with BTD-style types
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { getBalloonSize, getSpawnDirection, getMovementPattern, getBaseSpeed } from './config.js';

const balloons = [];
const objLoader = new OBJLoader();
let onBalloonEscape = null;
let onBalloonSpawn = null;
let onBalloonPop = null;

const PATTERNS = {
    NORMAL: 'NORMAL',
    ZIGZAG: 'ZIGZAG',
    SINE: 'SINE',
    SPIRAL: 'SPIRAL',
    RISE: 'RISE'
};

// Balloon type definitions (BTD classic hierarchy)
export const BALLOON_TYPES = {
    RED: {
        id: 'RED',
        color: 0xff4444,
        health: 1,
        children: [],
        speedMultiplier: 1.0,
        points: 10,
        name: 'Red'
    },
    BLUE: {
        id: 'BLUE',
        color: 0x4488ff,
        health: 1,
        children: ['RED'],
        speedMultiplier: 1.4,
        points: 20,
        name: 'Blue'
    },
    GREEN: {
        id: 'GREEN',
        color: 0x44ff44,
        health: 1,
        children: ['BLUE'],
        speedMultiplier: 1.8,
        points: 30,
        name: 'Green'
    },
    YELLOW: {
        id: 'YELLOW',
        color: 0xffdd44,
        health: 1,
        children: ['GREEN'],
        speedMultiplier: 3.2,
        points: 40,
        name: 'Yellow'
    },
    PINK: {
        id: 'PINK',
        color: 0xff88cc,
        health: 1,
        children: ['YELLOW'],
        speedMultiplier: 3.6,
        points: 50,
        name: 'Pink'
    },
    BLACK: {
        id: 'BLACK',
        color: 0x333333,
        health: 2,
        children: ['PINK', 'PINK'],
        speedMultiplier: 1.8,
        points: 100,
        name: 'Black'
    },
    WHITE: {
        id: 'WHITE',
        color: 0xffffff,
        health: 2,
        children: ['PINK', 'PINK'],
        speedMultiplier: 2.0,
        points: 100,
        name: 'White'
    },
    LEAD: {
        id: 'LEAD',
        color: 0x666677,
        health: 3,
        children: ['BLACK', 'BLACK'],
        speedMultiplier: 1.0,
        points: 150,
        name: 'Lead',
        metalness: 0.8,
        roughness: 0.2
    }
};

// String material (shared) - bright white cartoon string
const stringMaterial = new THREE.MeshToonMaterial({
    color: 0xffffff,
});

// Create material for a balloon type - cartoonish shiny look
function createBalloonMaterial(balloonType) {
    // Use ToonMaterial for cartoon look
    const material = new THREE.MeshToonMaterial({
        color: balloonType.color,
    });

    // For special balloons like Lead, add metallic sheen
    if (balloonType.metalness && balloonType.metalness > 0.5) {
        return new THREE.MeshStandardMaterial({
            color: balloonType.color,
            roughness: 0.2,
            metalness: 0.9,
        });
    }

    return material;
}

// HP Bar helper
function createHealthBar(health, maxHealth, balloonSize = 1.0) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#444444';
    ctx.fillRect(0, 0, 64, 8);

    // Health fill - green to red
    const ratio = health / maxHealth;
    const hue = ratio * 120; // 0=red, 120=green
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(1, 1, 62 * ratio, 6);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);

    sprite.scale.set(1.5 * balloonSize, 0.2 * balloonSize, 1);
    sprite.position.set(0, 1.8 * balloonSize, 0); // Above balloon, scaled by size

    return sprite;
}

function updateHealthBar(sprite, health, maxHealth) {
    if (!sprite) return;

    const canvas = sprite.material.map.image;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#444444';
    ctx.fillRect(0, 0, 64, 8);

    // Health fill
    const ratio = Math.max(0, health / maxHealth);
    const hue = ratio * 120;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(1, 1, 62 * ratio, 6);

    sprite.material.map.needsUpdate = true;
}

function createBalloonMesh(balloonType, callback) {
    const group = new THREE.Group();
    let loadedCount = 0;
    const material = createBalloonMaterial(balloonType);
    let balloonObjectRef = null;

    // Load balloon body
    objLoader.load(
        '../models/balloon.obj',
        function (balloonObject) {
            const sizeMultiplier = getBalloonSize();
            balloonObject.scale.set(0.8 * sizeMultiplier, 0.8 * sizeMultiplier, 0.8 * sizeMultiplier);

            balloonObject.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.computeBoundingBox();
                    const center = new THREE.Vector3();
                    child.geometry.boundingBox.getCenter(center);
                    child.geometry.translate(-center.x, -center.y, -center.z);

                    child.material = material;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            group.add(balloonObject);
            balloonObjectRef = balloonObject;
            loadedCount++;
            if (loadedCount === 2) callback(group, balloonObjectRef);
        }
    );

    // Load string
    objLoader.load(
        '../models/string.obj',
        function (stringObject) {
            const sizeMultiplier = getBalloonSize();
            stringObject.scale.set(0.7 * sizeMultiplier, 0.7 * sizeMultiplier, 0.7 * sizeMultiplier);
            stringObject.scale.y = 1.2 * sizeMultiplier; // Stretch string vertically

            // After centering balloon, string must be repositioned
            stringObject.position.set(0, -2 * sizeMultiplier, 0);

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
            if (loadedCount === 2) callback(group, balloonObjectRef);
        }
    );
}

export function spawnBalloon(scene, startY = null, balloonTypeId = 'RED', position = null) {
    // Spawn at one of the two hole heights (2 or 4.5) with slight variation
    const spawnHeights = [2, 4.5];
    const chosenHeight = spawnHeights[Math.floor(Math.random() * spawnHeights.length)];
    const yPos = startY !== null ? startY : chosenHeight + (Math.random() - 0.5) * 0.3;
    const balloonType = BALLOON_TYPES[balloonTypeId] || BALLOON_TYPES.RED;

    // Determine spawn side based on config
    const spawnDirection = getSpawnDirection();
    let spawnFromLeft;

    if (spawnDirection === 'random') {
        spawnFromLeft = Math.random() < 0.5;
    } else if (spawnDirection === 'right') {
        spawnFromLeft = false;
    } else { // 'left' or default
        spawnFromLeft = true;
    }

    // Show spawn warning UI (only for non-child balloons)
    if (onBalloonSpawn && position === null) {
        const xPercent = spawnFromLeft ? 15 : 85; // Left side or right side
        onBalloonSpawn(xPercent, 50); // x% horizontal, 50% height
    }

    // Spawn after warning delay (instant if spawned from pop)
    const delay = position !== null ? 0 : 1500;

    setTimeout(() => {
        createBalloonMesh(balloonType, (balloonMesh, balloonObject) => {
            // Start position - use spawn direction unless this is a child balloon
            const startX = position !== null ? position.x : (spawnFromLeft ? -5 : 5);
            const startZ = position !== null ? position.z : -10;
            const actualY = position !== null ? position.y : yPos;

            balloonMesh.position.set(startX, actualY, startZ);

            // HP Bar (always show for visibility)
            const balloonSize = getBalloonSize();
            const hpBar = createHealthBar(balloonType.health, balloonType.health, balloonSize);
            balloonMesh.add(hpBar);

            scene.add(balloonMesh);

            // Movement - speed based on balloon type and spawn direction
            const baseSpeed = getBaseSpeed();
            const directionMultiplier = spawnFromLeft ? 1 : -1;
            const velocity = new THREE.Vector3(
                baseSpeed * balloonType.speedMultiplier * directionMultiplier,
                0.1,
                0
            );

            // Assign pattern based on config (or random if set to 'random')
            let pattern;
            if (position !== null) {
                // Child balloons always use NORMAL pattern
                pattern = PATTERNS.NORMAL;
            } else {
                const configPattern = getMovementPattern();
                if (configPattern === 'random') {
                    const patterns = Object.values(PATTERNS);
                    pattern = patterns[Math.floor(Math.random() * patterns.length)];
                } else {
                    pattern = configPattern;
                }
            }

            balloons.push({
                mesh: balloonMesh,
                balloonObject: balloonObject, // Store reference to just the balloon part
                velocity,
                radius: 1.3 * getBalloonSize(),
                time: Math.random() * Math.PI * 2,
                type: balloonType,
                health: balloonType.health,
                maxHealth: balloonType.health,
                hpBar: hpBar,
                pattern: pattern,
                patternState: {
                    baseY: actualY, // Maintain general height
                    time: Math.random() * 10,
                    amp: 1 + Math.random(),
                    freq: 1 + Math.random()
                }
            });
        });
    }, delay);

    return balloonType;
}

export function damageBalloon(scene, index, damage = 1) {
    const b = balloons[index];
    if (!b || b.isDying) return { popped: false, points: 0, childrenSpawned: [] };

    b.health -= damage;

    if (b.health <= 0) {
        // Balloon is popped
        const position = b.mesh.position.clone();
        const points = b.type.points;
        const childrenSpawned = [];

        // Spawn children balloons
        if (b.type.children && b.type.children.length > 0) {
            b.type.children.forEach((childTypeId, idx) => {
                // Offset children slightly so they don't stack
                const offset = new THREE.Vector3(
                    (idx - (b.type.children.length - 1) / 2) * 0.5,
                    0,
                    0
                );
                const childPos = position.clone().add(offset);
                spawnBalloon(scene, null, childTypeId, childPos);
                childrenSpawned.push(childTypeId);
            });
        }

        // Remove the popped balloon
        scene.remove(b.mesh);
        b.mesh.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
        balloons.splice(index, 1);

        // Callback for pop effects
        if (onBalloonPop) {
            onBalloonPop(position, b.type.color);
        }

        return { popped: true, points, childrenSpawned, position, color: b.type.color };
    }

    // Balloon damaged but not popped - flash effect
    if (b.hpBar) {
        updateHealthBar(b.hpBar, b.health, b.maxHealth);
    }

    b.mesh.traverse((child) => {
        if (child.isMesh && child.material) {
            const originalColor = b.type.color;
            child.material.emissive = new THREE.Color(0xffffff);
            child.material.emissiveIntensity = 0.5;
            setTimeout(() => {
                if (child.material) {
                    child.material.emissive = new THREE.Color(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            }, 100);
        }
    });

    return { popped: false, points: 0, childrenSpawned: [] };
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
            }
            continue;
        }

        // Floating motion
        b.time += dt * 0.8;
        const arcOffset = Math.sin(b.time) * 0.3;

        // Light gravity
        b.velocity.addScaledVector(gravity, dt * 0.05);

        // Apply movement pattern
        const patternTime = dt * 2.0;
        b.patternState.time += patternTime;

        // Base X/Z movement
        b.mesh.position.x += b.velocity.x * dt;
        b.mesh.position.z += b.velocity.z * dt;

        // Y Movement (Gravity + Pattern)
        // Gravity
        b.velocity.addScaledVector(gravity, dt * 0.05);

        let patternY = 0;
        let patternZ = 0;

        switch (b.pattern) {
            case PATTERNS.SINE:
                patternY = Math.sin(b.patternState.time * b.patternState.freq) * b.patternState.amp * dt;
                break;
            case PATTERNS.ZIGZAG:
                patternY = (Math.sin(b.patternState.time * 3) > 0 ? 1 : -1) * dt * 2;
                break;
            case PATTERNS.SPIRAL:
                patternY = Math.cos(b.patternState.time * 2) * dt * 2;
                patternZ = Math.sin(b.patternState.time * 2) * dt * 2;
                break;
            case PATTERNS.RISE:
                patternY = dt * 3; // Slowly rise up
                break;
            default: // NORMAL
                patternY = arcOffset * dt; // Original slight bobble
                break;
        }

        b.mesh.position.y += b.velocity.y * dt + patternY;
        b.mesh.position.z += patternZ;

        const x = b.mesh.position.x;
        const y = b.mesh.position.y;

        // remove life if balloon escapes past the floor or side walls
        if (y < -0.5 || x > 6 || x < -6) {
            // Count this balloon and all its children as escaped
            const escapeDamage = countBalloonValue(b.type);
            if (onBalloonEscape) onBalloonEscape(escapeDamage);

            // Start dying animation instead of instant remove
            b.isDying = true;
        }
    }
}

// Count how many "layers" of balloons escape (recursive)
function countBalloonValue(balloonType) {
    let count = 1;
    if (balloonType.children) {
        balloonType.children.forEach(childId => {
            count += countBalloonValue(BALLOON_TYPES[childId]);
        });
    }
    return count;
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

export function clearAllBalloons(scene) {
    for (let i = balloons.length - 1; i >= 0; i--) {
        removeBalloon(scene, i);
    }
}

export function setCallbacks(escapeCallback, spawnCallback, popCallback) {
    onBalloonEscape = escapeCallback;
    onBalloonSpawn = spawnCallback;
    onBalloonPop = popCallback;
}

export function getActiveBalloonCount() {
    return balloons.filter(b => !b.isDying).length;
}

// Count how many "pops" are left - each balloon is 1, plus all its children recursively
export function getTotalBalloonsRemaining() {
    let total = 0;
    for (const balloon of balloons) {
        if (!balloon.isDying) {
            total += countBalloonLayers(balloon.typeId);
        }
    }
    return total;
}

// Helper to count layers in a balloon type (itself + children)
function countBalloonLayers(typeId) {
    const type = BALLOON_TYPES[typeId];
    if (!type) return 1;

    let count = 1; // This balloon itself
    for (const childType of type.children) {
        count += countBalloonLayers(childType);
    }
    return count;
}
