// objects.js - Loading 3D objects (cones, dart gun)
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

let currentWeaponModel = null;

export function loadCones(scene) {
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
}

export function loadWeaponModel(camera, weaponConfig) {
    // Remove current weapon model if it exists
    if (currentWeaponModel) {
        camera.remove(currentWeaponModel);
        currentWeaponModel.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
        currentWeaponModel = null;
    }

    // Function to load and setup the OBJ model
    function setupModel(object, customMaterial = null) {
        // Scale and position for first-person view
        object.scale.set(
            weaponConfig.modelScale.x,
            weaponConfig.modelScale.y,
            weaponConfig.modelScale.z
        );

        // Position in front of camera
        object.position.set(
            weaponConfig.modelPosition.x,
            weaponConfig.modelPosition.y,
            weaponConfig.modelPosition.z
        );

        // Rotate to point forward
        object.rotation.set(
            weaponConfig.modelRotation.x,
            weaponConfig.modelRotation.y,
            weaponConfig.modelRotation.z
        );

        // Apply material to all meshes
        object.traverse((child) => {
            if (child.isMesh) {
                // Don't cast shadows for the player's weapon to avoid blocking view
                child.castShadow = false;

                // Only override material if not using Blender materials
                if (customMaterial && !weaponConfig.useBlenderMaterials) {
                    child.material = customMaterial;
                }

                // Force double-sided rendering for Blender materials
                if (weaponConfig.useBlenderMaterials && child.material) {
                    child.material.side = THREE.DoubleSide;
                }

                child.receiveShadow = false;
            }
        });

        // Add to camera so it moves with player view
        camera.add(object);
        currentWeaponModel = object;
    }

    // Check if we should use Blender materials (MTL file)
    if (weaponConfig.useBlenderMaterials && weaponConfig.mtlPath) {
        const mtlLoader = new MTLLoader();
        mtlLoader.load(
            weaponConfig.mtlPath,
            function (materials) {
                materials.preload();

                const objLoader = new OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.load(
                    weaponConfig.modelPath,
                    function (object) {
                        setupModel(object);
                    },
                    function (xhr) {
                        console.log(`Weapon model (${weaponConfig.name}): ${(xhr.loaded / xhr.total * 100)}% loaded`);
                    },
                    function (error) {
                        console.error(`Error loading weapon model (${weaponConfig.name}):`, error);
                    }
                );
            },
            undefined,
            function (error) {
                console.error(`Error loading MTL file for ${weaponConfig.name}:`, error);
            }
        );
    } else {
        // Use custom material from config
        let material;
        if (weaponConfig.modelMaterial.type === 'standard') {
            const matConfig = {
                color: weaponConfig.modelMaterial.color,
                metalness: weaponConfig.modelMaterial.metalness || 0,
                roughness: weaponConfig.modelMaterial.roughness || 0.5,
            };

            // Add optional properties
            if (weaponConfig.modelMaterial.transparent) {
                matConfig.transparent = true;
                matConfig.opacity = weaponConfig.modelMaterial.opacity || 1;
            }
            if (weaponConfig.modelMaterial.emissive) {
                matConfig.emissive = weaponConfig.modelMaterial.emissive;
                matConfig.emissiveIntensity = weaponConfig.modelMaterial.emissiveIntensity || 0;
            }

            material = new THREE.MeshStandardMaterial(matConfig);
        } else {
            material = new THREE.MeshPhongMaterial({
                color: weaponConfig.modelMaterial.color,
            });
        }

        const objLoader = new OBJLoader();
        objLoader.load(
            weaponConfig.modelPath,
            function (object) {
                setupModel(object, material);
            },
            function (xhr) {
                console.log(`Weapon model (${weaponConfig.name}): ${(xhr.loaded / xhr.total * 100)}% loaded`);
            },
            function (error) {
                console.error(`Error loading weapon model (${weaponConfig.name}):`, error);
            }
        );
    }
}

export function loadPlayerHand(camera) {
    const objLoader = new OBJLoader();

    // Hand Material
    const Material = new THREE.MeshPhongMaterial({
        color: 0xb35432,
    });

    objLoader.load(
        '../models/hand.obj',
        function (object) {
            // Scale and position for first-person view
            object.scale.set(0.1, 0.1, 0.1);

            // Position in front of camera
            object.position.set(0.15, -0.3, -0.62);

            // Rotate to point forward
            object.rotation.set(0, Math.PI*3/2, 0);

            // Apply material to all meshes
            object.traverse((child) => {
                if (child.isMesh) {
                    // Don't cast shadows for the player's hand to avoid blocking view
                    child.castShadow = false;
                    child.material = Material;
                    child.receiveShadow = false;
                }
            });

            // Add to camera so it moves with player view
            camera.add(object);
        },
        function (xhr) {
            console.log(`Player hand: ${(xhr.loaded / xhr.total * 100)}% loaded`);
        },
        function (error) {
            console.error('Error loading player hand:', error);
        }
    );
}
