// src/main.js - Vanilla JavaScript version (no React)
import './index.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// Root container
const root = document.getElementById('root');
root.innerHTML = ''; // clear anything React might have put there
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

const objLoader = new OBJLoader();

// Orange material for cones
const orangeMaterial = new THREE.MeshPhongMaterial({
    color: 0xFF8C00,
    shininess: 30
});

const conePositions = [
    { x: -2.2, z: 7.8 },   
    { x: -2.2, z: 9.3 },    
    { x: 2.2, z: 7.8 },
    { x: 2.2, z: 9.3 },      
];

conePositions.forEach((pos, index) => {
    objLoader.load(
        '../models/cone.obj',
        function (object) {
            // Apply transformations
            object.scale.set(0.5, 0.5, 0.5);
            object.position.set(pos.x, 0, pos.z);

            // Apply orange material to all meshes in the object
            object.traverse((child) => {
                if (child.isMesh) {
                    child.material = orangeMaterial;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(object);
        },
        function (xhr) {
            console.log(`Cone ${index + 1}: ${(xhr.loaded / xhr.total * 100)}% loaded`);
        },
        function (error) {
            console.error(`Error loading cone ${index + 1}:`, error);
        }
    );
});

// --- Overlays: crosshair, score, hint ---

// Crosshair
const crosshair = document.createElement('div');
crosshair.textContent = '+';
Object.assign(crosshair.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '24px',
    color: 'white',
    pointerEvents: 'none',
    userSelect: 'none',
});
container.appendChild(crosshair);

// Score
let score = 0;
const scoreDiv = document.createElement('div');
scoreDiv.textContent = `Score: ${score}`;
Object.assign(scoreDiv.style, {
    position: 'absolute',
    top: '10px',
    left: '10px',
    fontSize: '18px',
    color: 'white',
    textShadow: '0 0 5px black',
    pointerEvents: 'none',
    userSelect: 'none',
});
container.appendChild(scoreDiv);

function setScore(newScore) {
    score = newScore;
    scoreDiv.textContent = `Score: ${score}`;
}

// Hint text
const hintDiv = document.createElement('div');
hintDiv.textContent = 'Click to lock mouse. WASD to move. Click again to shoot.';
Object.assign(hintDiv.style, {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '14px',
    color: 'white',
    textShadow: '0 0 5px black',
    pointerEvents: 'none',
    userSelect: 'none',
    opacity: '0.8',
});
container.appendChild(hintDiv);

// --- THREE.JS SETUP ---

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202535);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
);
camera.position.set(0, 1.6, 10);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(-5, 10, -2);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.left = -20;
dirLight.shadow.camera.right = 20;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -20;
scene.add(dirLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshPhongMaterial({ color: 0x1f3d1f });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// --- STARTING AREA WITH WALLS AND WINDOW ---
const wallMaterial = new THREE.MeshPhongMaterial({
    color: 0x8B4513,
    side: THREE.DoubleSide
});
const wallHeight = 3;
const wallThickness = 0.2;
const roomWidth = 6;
const roomDepth = 6;
const roomCenterZ = 10;

// Array to store walls for collision detection
const walls = [];

// Back wall (behind player)
const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth, wallHeight, wallThickness),
    wallMaterial
);
backWall.position.set(0, wallHeight / 2, roomCenterZ + roomDepth / 2);
backWall.castShadow = true;
backWall.receiveShadow = true;
scene.add(backWall);
walls.push(backWall);

// Left wall
const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth),
    wallMaterial
);
leftWall.position.set(-roomWidth / 2, wallHeight / 2, roomCenterZ);
leftWall.castShadow = true;
leftWall.receiveShadow = true;
scene.add(leftWall);
walls.push(leftWall);

// Right wall
const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth),
    wallMaterial
);
rightWall.position.set(roomWidth / 2, wallHeight / 2, roomCenterZ);
rightWall.castShadow = true;
rightWall.receiveShadow = true;
scene.add(rightWall);
walls.push(rightWall);

// Front wall - left section (next to window)
const windowWidth = 3;
const frontLeftWall = new THREE.Mesh(
    new THREE.BoxGeometry((roomWidth - windowWidth) / 2, wallHeight, wallThickness),
    wallMaterial
);
frontLeftWall.position.set(-roomWidth / 2 + (roomWidth - windowWidth) / 4, wallHeight / 2, roomCenterZ - roomDepth / 2);
frontLeftWall.castShadow = true;
frontLeftWall.receiveShadow = true;
scene.add(frontLeftWall);
walls.push(frontLeftWall);

// Front wall - right section (next to window)
const frontRightWall = new THREE.Mesh(
    new THREE.BoxGeometry((roomWidth - windowWidth) / 2, wallHeight, wallThickness),
    wallMaterial
);
frontRightWall.position.set(roomWidth / 2 - (roomWidth - windowWidth) / 4, wallHeight / 2, roomCenterZ - roomDepth / 2);
frontRightWall.castShadow = true;
frontRightWall.receiveShadow = true;
scene.add(frontRightWall);
walls.push(frontRightWall);

// Window frame top
const windowTop = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth, 0.5, wallThickness),
    wallMaterial
);
windowTop.position.set(0, wallHeight - 0.25, roomCenterZ - roomDepth / 2);
windowTop.castShadow = true;
windowTop.receiveShadow = true;
scene.add(windowTop);
walls.push(windowTop);

// Window sill bottom
const windowBottom = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth, 0.8, wallThickness),
    wallMaterial
);
windowBottom.position.set(0, 0.4, roomCenterZ - roomDepth / 2);
windowBottom.castShadow = true;
windowBottom.receiveShadow = true;
scene.add(windowBottom);
walls.push(windowBottom);

// Helper function to check collision with walls
function checkWallCollision(position, radius = 0.5) {
    // Check collision at ground level (player's body), not camera height
    const bodyPosition = new THREE.Vector3(position.x, 1.0, position.z);

    for (const wall of walls) {
        const wallBox = new THREE.Box3().setFromObject(wall);
        const playerSphere = new THREE.Sphere(bodyPosition, radius);
        if (wallBox.intersectsSphere(playerSphere)) {
            return true;
        }
    }
    return false;
}

// Pointer lock controls
const controls = new PointerLockControls(camera, renderer.domElement);

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            moveForward = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveBackward = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveLeft = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveRight = true;
            break;
        default:
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            moveForward = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveBackward = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveLeft = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveRight = false;
            break;
        default:
            break;
    }
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// Click: first click locks, later clicks shoot
function onClick() {
    if (!controls.isLocked) {
        controls.lock();
    } else {
        shootProjectile();
    }
}
renderer.domElement.addEventListener('click', onClick);

// --- PHYSICS STATE ---

const gravity = new THREE.Vector3(0, -9.8, 0);
const clock = new THREE.Clock();

const projectiles = [];
const balloons = [];

const tmpP = new THREE.Vector3();
const tmpB = new THREE.Vector3();

// --- HELPERS: balloons / projectiles / spawning ---

function createBalloonMesh() {
    const group = new THREE.Group();

    const bodyGeom = new THREE.SphereGeometry(0.5, 32, 32);
    const bodyMat = new THREE.MeshPhongMaterial({
        color: 0x55aaff,
        shininess: 80,
        specular: 0x222222,
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.castShadow = true;
    group.add(body);

    const stringGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.9);
    const stringMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const string = new THREE.Mesh(stringGeom, stringMat);
    string.position.y = -0.75;
    string.castShadow = true;
    group.add(string);

    return group;
}

function spawnBalloon() {
    const balloonMesh = createBalloonMesh();
    balloonMesh.position.set(-5, 2, -10);
    scene.add(balloonMesh);

    const velocity = new THREE.Vector3(6, 6, 0);

    balloons.push({
        mesh: balloonMesh,
        velocity,
        radius: 0.5,
    });
}

// initial balloon
spawnBalloon();

function shootProjectile() {
    const origin = new THREE.Vector3();
    const dir = new THREE.Vector3();

    camera.getWorldPosition(origin);
    camera.getWorldDirection(dir);

    const speed = 25;
    const velocity = dir.multiplyScalar(speed);

    const geom = new THREE.SphereGeometry(0.1, 16, 16);
    const mat = new THREE.MeshPhongMaterial({ color: 0xff4444 });
    const bullet = new THREE.Mesh(geom, mat);
    bullet.castShadow = true;
    bullet.position.copy(origin);
    scene.add(bullet);

    projectiles.push({
        mesh: bullet,
        velocity,
        radius: 0.1,
    });
}

// Resize
function onResize() {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
}
window.addEventListener('resize', onResize);

// --- MAIN LOOP ---

const moveSpeed = 8.0;
let animationId;

function animate() {
    animationId = requestAnimationFrame(animate);

    const dt = clock.getDelta();

    if (controls.isLocked) {
        // Store previous position
        const prevPosition = camera.position.clone();

        const actualMove = moveSpeed * dt;
        if (moveForward) controls.moveForward(actualMove);
        if (moveBackward) controls.moveForward(-actualMove);
        if (moveLeft) controls.moveRight(-actualMove);
        if (moveRight) controls.moveRight(actualMove);

        // Check collision and revert if needed
        if (checkWallCollision(camera.position)) {
            camera.position.copy(prevPosition);
        }
    }

    // projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.velocity.addScaledVector(gravity, dt);
        p.mesh.position.addScaledVector(p.velocity, dt);

        if (p.mesh.position.y < -5 || p.mesh.position.lengthSq() > 10000) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
            projectiles.splice(i, 1);
        }
    }

    // balloons
    for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        b.velocity.addScaledVector(gravity, dt);
        b.mesh.position.addScaledVector(b.velocity, dt);

        if (b.mesh.position.y < -2 || b.mesh.position.lengthSq() > 10000) {
            scene.remove(b.mesh);
            b.mesh.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            balloons.splice(i, 1);
            // always keep at least one balloon
            spawnBalloon();
        }
    }

    // collisions
    for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        b.mesh.getWorldPosition(tmpB);

        for (let j = projectiles.length - 1; j >= 0; j--) {
            const p = projectiles[j];
            p.mesh.getWorldPosition(tmpP);

            const dist = tmpB.distanceTo(tmpP);
            const hitDistance = b.radius + p.radius;
            if (dist < hitDistance) {
                scene.remove(b.mesh);
                b.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.dispose();
                        child.material.dispose();
                    }
                });
                balloons.splice(i, 1);

                scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                projectiles.splice(j, 1);

                setScore(score + 1);

                spawnBalloon();
                break;
            }
        }
    }

    renderer.render(scene, camera);
}

animate();

// vite HMR
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        renderer.domElement.removeEventListener('click', onClick);
    });
}

