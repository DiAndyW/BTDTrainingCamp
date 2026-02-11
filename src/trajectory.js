// trajectory.js - Predicts and visualizes projectile flight path
import * as THREE from 'three';
import { getCurrentWeapon } from './weapons.js';

export class TrajectoryPreview {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.points = 50; // Number of points in the line
        this.timeStep = 0.05; // Time simulation step

        // Material for dashed line
        this.material = new THREE.LineDashedMaterial({
            color: 0xff0000, 
            dashSize: 0.5,
            gapSize: 0.2,
            opacity: 0.8,
            transparent: true,
            linewidth: 5 
        });

        // Geometry buffer
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.points * 3);
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

        // Create the line mesh
        this.line = new THREE.Line(this.geometry, this.material);
        this.line.computeLineDistances(); // Required for LineDashedMaterial

        // Add to scene
        scene.add(this.line);
    }

    update() {
        if (!this.camera) return;

        const weapon = getCurrentWeapon();
        // Don't show trajectory for instant-hit or weird weapons if any
        if (!weapon) return;

        // Start position (from camera/weapon)
        const origin = new THREE.Vector3();
        this.camera.getWorldPosition(origin);

        // Initial velocity vector
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);

        // Speed adjusted by weapon
        const speed = weapon.projectileSpeed || 50;
        const velocity = dir.multiplyScalar(speed);

        // Gravity vector
        const gravity = new THREE.Vector3(0, -9.8, 0);

        // Calculate points
        let currentPos = origin.clone();
        let currentVel = velocity.clone();

        for (let i = 0; i < this.points; i++) {
            // Store point
            this.positions[i * 3] = currentPos.x;
            this.positions[i * 3 + 1] = currentPos.y;
            this.positions[i * 3 + 2] = currentPos.z;

            // Update physics for next point (Euler integration)
            currentPos.addScaledVector(currentVel, this.timeStep);
            currentVel.addScaledVector(gravity, this.timeStep);

            // Check for floor collision/out of bounds to stop drawing early?
            // For now just draw the full arc
            if (currentPos.y < -5) break;
        }

        // Update geometry
        this.geometry.attributes.position.needsUpdate = true;
        this.line.computeLineDistances(); // Recalculate dashes
    }

    setVisibility(visible) {
        this.line.visible = visible;
    }

    dispose() {
        this.scene.remove(this.line);
        this.geometry.dispose();
        this.material.dispose();
    }
}
