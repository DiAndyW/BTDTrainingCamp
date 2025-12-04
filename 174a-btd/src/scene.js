// scene.js - Scene, camera, renderer, and lights setup
import * as THREE from 'three';
import { createGroundTexture } from './textures.js';

export function initScene(container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202535);

    // Camera
    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.6, 10);
    scene.add(camera);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2); // Increased intensity
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased intensity
    dirLight.position.set(-10, 20, -10); // Better angle
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048); // Higher res shadows
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    dirLight.shadow.bias = -0.001; // Reduce shadow acne
    scene.add(dirLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundTexture = createGroundTexture();
    const groundMat = new THREE.MeshStandardMaterial({ 
        map: groundTexture,
        roughness: 0.8,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Fog
    scene.fog = new THREE.Fog(0x202535, 10, 50);

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
