// particles.js - Simple particle system for balloon pops
import * as THREE from 'three';

const particles = [];

// Simple shapes - spheres only for cleaner look
const sphereGeometry = new THREE.SphereGeometry(0.1, 6, 6);

export function createExplosion(scene, position, color, count = 8) {
    const baseColor = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
        // Simple material matching balloon color
        const material = new THREE.MeshBasicMaterial({
            color: baseColor,
            transparent: true,
            opacity: 0.9,
        });

        const mesh = new THREE.Mesh(sphereGeometry, material);
        mesh.position.copy(position);
        
        // Random spread
        mesh.position.x += (Math.random() - 0.5) * 0.4;
        mesh.position.y += (Math.random() - 0.5) * 0.4;
        mesh.position.z += (Math.random() - 0.5) * 0.4;

        // Outward velocity
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            Math.random() * 3 + 1,
            (Math.random() - 0.5) * 4
        );

        scene.add(mesh);
        particles.push({
            mesh,
            velocity,
            life: 0.6 + Math.random() * 0.2,
            initialScale: 0.6 + Math.random() * 0.4
        });
    }
}

export function updateParticles(scene, dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.life -= dt;
        
        if (p.life <= 0) {
            scene.remove(p.mesh);
            p.mesh.material.dispose();
            particles.splice(i, 1);
            continue;
        }

        // Move
        p.mesh.position.addScaledVector(p.velocity, dt);
        
        // Gravity
        p.velocity.y -= 12 * dt;
        
        // Fade out
        const lifeRatio = p.life / 0.8;
        const scale = lifeRatio * p.initialScale;
        p.mesh.scale.setScalar(Math.max(0.01, scale));
        p.mesh.material.opacity = lifeRatio * 0.9;
    }
}
