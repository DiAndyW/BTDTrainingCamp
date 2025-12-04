// textures.js - Procedural texture generation
import * as THREE from 'three';

export function createGroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base Grass
    ctx.fillStyle = '#338c1f';
    ctx.fillRect(0, 0, 1024, 1024);

    // Add noise for grass texture
    for (let i = 0; i < 50000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const w = Math.random() * 3 + 1;
        const h = Math.random() * 3 + 1;
        ctx.fillStyle = Math.random() > 0.5 ? '#2a7a18' : '#3e9e25';
        ctx.fillRect(x, y, w, h);
    }

    // Draw Track (Simple S-curve or straight line matching balloon path)
    // Balloons spawn at x=-5, z=-10 and move x+=1.5, z+=0
    // So the path is a straight line along Z=-10?
    // Wait, let's check balloon movement in balloons.js
    // velocity = (1.5, 0.1, 0)
    // start: (-5, y, -10)
    // So it's a straight line from left to right at z=-10.
    
    // Let's draw a dirt path along that line
    // Map world coordinates to texture coordinates
    // Plane is 100x100. Center is (0,0).
    // Texture covers -50 to 50 in both X and Z.
    // z=-10 corresponds to...
    // 0 -> 512 (center)
    // -50 -> 0
    // 50 -> 1024
    // z=-10 -> 512 + (-10/100 * 1024) = 512 - 102.4 = 409.6 ~ 410
    
    const pathY = 410; // In texture space (which maps to Z in world)
    
    ctx.beginPath();
    ctx.moveTo(0, pathY);
    ctx.lineTo(1024, pathY);
    ctx.lineWidth = 60; // Width of path
    ctx.strokeStyle = '#8B4513'; // SaddleBrown
    ctx.stroke();

    // Add noise to path
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 1024;
        const y = pathY - 30 + Math.random() * 60;
        ctx.fillStyle = Math.random() > 0.5 ? '#A0522D' : '#6F4E37';
        ctx.fillRect(x, y, 4, 4);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(1, 1); 
    
    return texture;
}
