// projectiles.js - Shooting and projectile management
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { getCurrentWeapon } from './weapons.js';

const projectiles = [];
const raycaster = new THREE.Raycaster();
const objLoader = new OBJLoader();

export function shootProjectile(scene, camera) {
    const weapon = getCurrentWeapon();
    const origin = new THREE.Vector3();
    const dir = new THREE.Vector3();

    // Bullet initial position + direction
    camera.getWorldPosition(origin);
    camera.getWorldDirection(dir);

    if (weapon.projectileType === 'model') {
        // Shoot 3 knives with spread
        const spreadAngles = [-5, 0, 5]; // degrees: left, center, right
        const upAxis = new THREE.Vector3(0, 1, 0); // Y-axis for rotation

        spreadAngles.forEach(angleOffset => {
            // Clone and rotate direction for spread
            const spreadDir = dir.clone();
            if (angleOffset !== 0) {
                const angleRad = THREE.MathUtils.degToRad(angleOffset);
                spreadDir.applyAxisAngle(upAxis, angleRad);
            }

            const velocity = spreadDir.multiplyScalar(weapon.projectileSpeed);

            // Load knife model as projectile
            let material;
            if (weapon.projectileModelMaterial.type === 'standard') {
                const matConfig = {
                    color: weapon.projectileModelMaterial.color,
                    metalness: weapon.projectileModelMaterial.metalness || 0.3,
                    roughness: weapon.projectileModelMaterial.roughness || 0.1,
                };

                // Add optional properties
                if (weapon.projectileModelMaterial.transparent) {
                    matConfig.transparent = true;
                    matConfig.opacity = weapon.projectileModelMaterial.opacity || 1;
                }
                if (weapon.projectileModelMaterial.emissive) {
                    matConfig.emissive = weapon.projectileModelMaterial.emissive;
                    matConfig.emissiveIntensity = weapon.projectileModelMaterial.emissiveIntensity || 0;
                }

                material = new THREE.MeshStandardMaterial(matConfig);
            } else {
                material = new THREE.MeshPhongMaterial({
                    color: weapon.projectileModelMaterial.color,
                });
            }

            objLoader.load(
                weapon.projectileModel,
                function (object) {
                    object.scale.set(
                        weapon.projectileModelScale.x,
                        weapon.projectileModelScale.y,
                        weapon.projectileModelScale.z
                    );
                    object.position.copy(origin);

                    // Apply material to all meshes
                    object.traverse((child) => {
                        if (child.isMesh) {
                            child.material = material;
                            child.castShadow = true;
                        }
                    });

                    scene.add(object);

                    projectiles.push({
                        mesh: object,
                        velocity,
                        radius: weapon.projectileSize * 3,
                        prevPos: origin.clone(),
                        damage: weapon.damage,
                        isModel: true,  // Flag to identify model projectiles
                        spinSpeed: 15,  // Rotation speed for knife spin
                    });
                },
                undefined,
                function (error) {
                    console.error('Error loading projectile model:', error);
                }
            );
        });
    } else {
        // Standard sphere projectile
        const velocity = dir.clone().multiplyScalar(weapon.projectileSpeed);
        const geom = new THREE.SphereGeometry(weapon.projectileSize, 16, 16);
        
        // Check for custom projectile material (for Ray Gun glow effect)
        let mat;
        if (weapon.projectileMaterial && weapon.projectileMaterial.type === 'standard') {
            const matConfig = {
                color: weapon.projectileMaterial.color,
                metalness: weapon.projectileMaterial.metalness || 0,
                roughness: weapon.projectileMaterial.roughness || 0.5,
            };
            if (weapon.projectileMaterial.emissive) {
                matConfig.emissive = weapon.projectileMaterial.emissive;
                matConfig.emissiveIntensity = weapon.projectileMaterial.emissiveIntensity || 0;
            }
            if (weapon.projectileMaterial.transparent) {
                matConfig.transparent = true;
                matConfig.opacity = weapon.projectileMaterial.opacity || 1;
            }
            mat = new THREE.MeshStandardMaterial(matConfig);
        } else {
            mat = new THREE.MeshPhongMaterial({ color: weapon.projectileColor });
        }
        
        const bullet = new THREE.Mesh(geom, mat);
        bullet.castShadow = true;
        bullet.position.copy(origin);
        scene.add(bullet);

        projectiles.push({
            mesh: bullet,
            velocity,
            radius: weapon.projectileSize * 3,
            prevPos: origin.clone(),
            damage: weapon.damage,
            isModel: false,
        });
    }
}

export function updateProjectiles(scene, dt, gravity) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];

        // Save previous position BEFORE moving
        p.prevPos.copy(p.mesh.position);

        // Apply gravity
        p.velocity.addScaledVector(gravity, dt);

        // Move projectile
        p.mesh.position.addScaledVector(p.velocity, dt);

        // Add spinning animation for knife models
        if (p.isModel && p.spinSpeed) {
            p.mesh.rotation.z += p.spinSpeed * dt;
        }

        // Remove dead projectiles (floor, side walls, or too far away)
        if (
            p.mesh.position.y < -5 ||
            p.mesh.position.x > 6 ||
            p.mesh.position.x < -6 ||
            p.mesh.position.lengthSq() > 10000
        ) {
            scene.remove(p.mesh);
            if (p.isModel) {
                // For models, dispose all child meshes
                p.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.dispose();
                        child.material.dispose();
                    }
                });
            } else {
                // For simple geometry
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
            }
            projectiles.splice(i, 1);
            continue;
        }
    }
}

export function getProjectiles() {
    return projectiles;
}

export function removeProjectile(scene, index) {
    const p = projectiles[index];
    scene.remove(p.mesh);

    if (p.isModel) {
        // For models, dispose all child meshes
        p.mesh.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
    } else {
        // For simple geometry
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
    }

    projectiles.splice(index, 1);
}
