// src/main.js
import './index.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

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
        const actualMove = moveSpeed * dt;
        if (moveForward) controls.moveForward(actualMove);
        if (moveBackward) controls.moveForward(-actualMove);
        if (moveLeft) controls.moveRight(-actualMove);
        if (moveRight) controls.moveRight(actualMove);
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

