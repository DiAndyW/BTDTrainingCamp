// textures.js - Cartoonish procedural texture generation
import * as THREE from 'three';

export function createGroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Bright cartoon grass base
    const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.5, '#66BB6A');
    gradient.addColorStop(1, '#4CAF50');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    // Add stylized grass patches
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const colors = ['#43A047', '#2E7D32', '#81C784', '#A5D6A7'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        
        // Draw grass blade
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 3, y - 10 - Math.random() * 10);
        ctx.lineTo(x + 3, y - 10 - Math.random() * 10);
        ctx.closePath();
        ctx.fill();
    }

    // Draw cartoon-style path (balloon track)
    const pathY = 410;
    
    // Path base
    ctx.beginPath();
    ctx.moveTo(0, pathY);
    ctx.lineTo(1024, pathY);
    ctx.lineWidth = 70;
    ctx.strokeStyle = '#D4A574'; // Light brown
    ctx.stroke();

    // Path border (darker)
    ctx.beginPath();
    ctx.moveTo(0, pathY - 35);
    ctx.lineTo(1024, pathY - 35);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#8B6914';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pathY + 35);
    ctx.lineTo(1024, pathY + 35);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#8B6914';
    ctx.stroke();

    // Add pebbles to path
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * 1024;
        const y = pathY - 25 + Math.random() * 50;
        const size = 3 + Math.random() * 5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.5 ? '#C4A484' : '#B8956E';
        ctx.fill();
    }

    // Add flowers scattered on grass
    const flowerColors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF9EAA'];
    for (let i = 0; i < 300; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        
        // Skip if on path
        if (y > pathY - 50 && y < pathY + 50) continue;
        
        const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
        const size = 4 + Math.random() * 4;
        
        // Draw simple flower
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Flower center
        ctx.beginPath();
        ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
}
