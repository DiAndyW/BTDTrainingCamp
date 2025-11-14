// projectiles.js - Shooting and projectile management
import * as THREE from 'three';

const projectiles = [];
const raycaster = new THREE.Raycaster();

export function shootProjectile(scene, camera) {
    const origin = new THREE.Vector3();
    const dir = new THREE.Vector3();

    // Bullet initial position + direction
    camera.getWorldPosition(origin);
    camera.getWorldDirection(dir);

    const speed = 50;
    const velocity = dir.clone().multiplyScalar(speed);

    // Projectile mesh
    const geom = new THREE.SphereGeometry(0.1, 16, 16);
    const mat = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const bullet = new THREE.Mesh(geom, mat);
    bullet.castShadow = true;
    bullet.position.copy(origin);
    scene.add(bullet);

    projectiles.push({
        mesh: bullet,
        velocity,
        radius: 0.3,
        prevPos: origin.clone(),   // Store previous frame position
    });
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

        // Remove dead projectiles
        if (
            p.mesh.position.y < -5 ||
            p.mesh.position.lengthSq() > 10000
        ) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
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
    p.mesh.geometry.dispose();
    p.mesh.material.dispose();
    projectiles.splice(index, 1);
}
