// scene.js - Cartoonish scene with vibrant colors
import * as THREE from 'three';
import { createGroundTexture } from './textures.js';

export function initScene(container) {
    const scene = new THREE.Scene();
    
    // Bright, cheerful sky gradient background
    scene.background = new THREE.Color(0x87CEEB); // Sky blue

    // Camera
    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.6, 10);
    scene.add(camera);

    // Renderer with vibrant output
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Bright, warm lighting for cartoon look
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x7cfc00, 0.8);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffffcc, 1.5);
    sunLight.position.set(10, 30, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Ground with cartoonish grass
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundTexture = createGroundTexture();
    const groundMat = new THREE.MeshToonMaterial({ 
        map: groundTexture,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add decorative clouds
    addClouds(scene);

    // Add decorative trees/bushes
    addDecorations(scene);

    // Bright fog for depth without darkness
    scene.fog = new THREE.Fog(0x87CEEB, 30, 80);

    // Resize handler
    function onResize() {
        const { clientWidth, clientHeight } = container;
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight);
    }
    window.addEventListener('resize', onResize);

    return {
        scene,
        camera,
        renderer,
        cleanup: () => {
            window.removeEventListener('resize', onResize);
        }
    };
}

// Add puffy cartoon clouds
function addClouds(scene) {
    const cloudMaterial = new THREE.MeshToonMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
    });

    for (let i = 0; i < 8; i++) {
        const cloud = new THREE.Group();
        
        // Create cloud from overlapping spheres
        const numPuffs = 4 + Math.floor(Math.random() * 4);
        for (let j = 0; j < numPuffs; j++) {
            const puffSize = 1.5 + Math.random() * 2;
            const puff = new THREE.Mesh(
                new THREE.SphereGeometry(puffSize, 16, 16),
                cloudMaterial
            );
            puff.position.set(
                (j - numPuffs / 2) * 1.5,
                Math.random() * 0.5,
                Math.random() * 1 - 0.5
            );
            cloud.add(puff);
        }
        
        cloud.position.set(
            -40 + Math.random() * 80,
            15 + Math.random() * 10,
            -30 - Math.random() * 20
        );
        cloud.scale.setScalar(0.8 + Math.random() * 0.5);
        scene.add(cloud);
    }
}

// Add decorative elements
function addDecorations(scene) {
    const bushMaterial = new THREE.MeshToonMaterial({ color: 0x228B22 });
    const trunkMaterial = new THREE.MeshToonMaterial({ color: 0x8B4513 });
    
    // Add bushes along the sides
    for (let i = 0; i < 10; i++) {
        const bush = new THREE.Group();
        
        // Bush made of spheres
        for (let j = 0; j < 3; j++) {
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.5 + Math.random() * 0.3, 8, 8),
                bushMaterial
            );
            sphere.position.set(
                (Math.random() - 0.5) * 0.8,
                0.4 + Math.random() * 0.2,
                (Math.random() - 0.5) * 0.8
            );
            sphere.castShadow = true;
            bush.add(sphere);
        }
        
        const side = i % 2 === 0 ? -1 : 1;
        bush.position.set(
            -20 + i * 5,
            0,
            side * (15 + Math.random() * 5)
        );
        scene.add(bush);
    }

    // Add simple cartoon trees
    for (let i = 0; i < 6; i++) {
        const tree = new THREE.Group();
        
        // Trunk
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.5, 3, 8),
            trunkMaterial
        );
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Foliage (cone shape)
        const foliage = new THREE.Mesh(
            new THREE.ConeGeometry(2, 4, 8),
            new THREE.MeshToonMaterial({ color: 0x2E8B57 })
        );
        foliage.position.y = 5;
        foliage.castShadow = true;
        tree.add(foliage);
        
        const side = i % 2 === 0 ? -1 : 1;
        tree.position.set(
            -25 + i * 12,
            0,
            side * (20 + Math.random() * 5)
        );
        scene.add(tree);
    }
}
