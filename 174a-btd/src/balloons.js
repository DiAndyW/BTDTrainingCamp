// balloons.js - Balloon creation and management
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const balloons = [];
const objLoader = new OBJLoader();

// Balloon body material
const balloonMaterial = new THREE.MeshPhongMaterial({
    color: 0x2f52d4,  // Red/pink balloon
    shininess: 80,
    specular: 0x222222,
    flatShading: false,
});

// String material
const stringMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,  // White string
    shininess: 30,
});

function createBalloonMesh(callback) {
    const group = new THREE.Group();
    let loadedCount = 0;

    // Load balloon body
    objLoader.load(
        '../models/balloon.obj',
        function (balloonObject) {
            // Apply transformations
            balloonObject.scale.set(0.5, 0.5, 0.5);

            // Apply balloon material
            balloonObject.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.computeVertexNormals();
                    child.material = balloonMaterial;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            group.add(balloonObject);
            loadedCount++;
            if (loadedCount === 2) callback(group);
        },
        function (xhr) {
            console.log(`Balloon body: ${(xhr.loaded / xhr.total * 100)}% loaded`);
        },
        function (error) {
            console.error('Error loading balloon:', error);
        }
    );

    // Load string
    objLoader.load(
        '../models/string.obj',
        function (stringObject) {
            // Apply transformations
            stringObject.scale.set(0.5, 0.5, 0.5);

            // Position the string below the balloon
            // Adjust these values to align the string properly
            stringObject.position.set(-0.5, -0.4, 1.5);

            // Apply string material
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
        },
        function (xhr) {
            console.log(`String: ${(xhr.loaded / xhr.total * 100)}% loaded`);
        },
        function (error) {
            console.error('Error loading string:', error);
        }
    );
}

export function spawnBalloon(scene) {
    createBalloonMesh((balloonMesh) => {
        balloonMesh.position.set(-5, 2, -10);
        scene.add(balloonMesh);

        const velocity = new THREE.Vector3(6, 6, 0);

        balloons.push({
            mesh: balloonMesh,
            velocity,
            radius: 0.5,
        });
    });
}

export function updateBalloons(scene, dt, gravity) {
    const tmpB = new THREE.Vector3();

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
            // Always keep at least one balloon
            spawnBalloon(scene);
        }
    }

    return tmpB;
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
