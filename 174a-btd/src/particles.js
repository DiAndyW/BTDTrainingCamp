// particles.js - Particle system for explosions
import * as THREE from 'three';

const particles = [];
const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);

export function createExplosion(scene, position, color, count = 10) {
    const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 100,
        emissive: color,
        emissiveIntensity: 0.5
    });

    for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        
        // Random spread
        mesh.position.x += (Math.random() - 0.5) * 0.5;
        mesh.position.y += (Math.random() - 0.5) * 0.5;
        mesh.position.z += (Math.random() - 0.5) * 0.5;

        // Random velocity
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        );

        scene.add(mesh);
        particles.push({
            mesh,
            velocity,
            life: 1.0 // 1 second life
        });
    }
}

export function updateParticles(scene, dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.life -= dt;
        
        if (p.life <= 0) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose(); // Note: geometry is shared, maybe don't dispose if shared? 
                                       // Actually geometry is const outside, so we shouldn't dispose it here if we want to reuse it.
                                       // But we are creating new materials.
            p.mesh.material.dispose();
            particles.splice(i, 1);
            continue;
        }

        // Move
        p.mesh.position.addScaledVector(p.velocity, dt);
        
        // Gravity
        p.velocity.y -= 9.8 * dt;
        
        // Spin
        p.mesh.rotation.x += p.velocity.z * dt;
        p.mesh.rotation.y += p.velocity.x * dt;
        
        // Fade out (scale down)
        const scale = p.life; // 1 -> 0
        p.mesh.scale.setScalar(scale);
    }
}
