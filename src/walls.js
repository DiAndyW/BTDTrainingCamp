// walls.js - Wall creation and collision detection
import * as THREE from 'three';

export function initWalls(scene) {
    const wallMaterial = new THREE.MeshPhongMaterial({
        color: 0xb1bdb7,
        side: THREE.DoubleSide
    });
    const wallHeight = 3;
    const wallThickness = 0.2;
    const roomWidth = 6;
    const roomDepth = 6;
    const roomCenterZ = 10;

    const walls = [];

    // Back wall (behind player)
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(roomWidth, wallHeight, wallThickness),
        wallMaterial
    );
    backWall.position.set(0, wallHeight / 2, roomCenterZ + roomDepth / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    scene.add(backWall);
    walls.push(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth),
        wallMaterial
    );
    leftWall.position.set(-roomWidth / 2, wallHeight / 2, roomCenterZ);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    scene.add(leftWall);
    walls.push(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth),
        wallMaterial
    );
    rightWall.position.set(roomWidth / 2, wallHeight / 2, roomCenterZ);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    scene.add(rightWall);
    walls.push(rightWall);

    // Front wall - left section (next to window)
    const windowWidth = 3;
    const frontLeftWall = new THREE.Mesh(
        new THREE.BoxGeometry((roomWidth - windowWidth) / 2, wallHeight, wallThickness),
        wallMaterial
    );
    frontLeftWall.position.set(-roomWidth / 2 + (roomWidth - windowWidth) / 4, wallHeight / 2, roomCenterZ - roomDepth / 2);
    frontLeftWall.castShadow = true;
    frontLeftWall.receiveShadow = true;
    scene.add(frontLeftWall);
    walls.push(frontLeftWall);

    // Front wall - right section (next to window)
    const frontRightWall = new THREE.Mesh(
        new THREE.BoxGeometry((roomWidth - windowWidth) / 2, wallHeight, wallThickness),
        wallMaterial
    );
    frontRightWall.position.set(roomWidth / 2 - (roomWidth - windowWidth) / 4, wallHeight / 2, roomCenterZ - roomDepth / 2);
    frontRightWall.castShadow = true;
    frontRightWall.receiveShadow = true;
    scene.add(frontRightWall);
    walls.push(frontRightWall);

    // Window frame top
    const windowTop = new THREE.Mesh(
        new THREE.BoxGeometry(windowWidth, 0.5, wallThickness),
        wallMaterial
    );
    windowTop.position.set(0, wallHeight - 0.25, roomCenterZ - roomDepth / 2);
    windowTop.castShadow = true;
    windowTop.receiveShadow = true;
    scene.add(windowTop);
    walls.push(windowTop);

    // Window sill bottom
    const windowBottom = new THREE.Mesh(
        new THREE.BoxGeometry(windowWidth, 0.8, wallThickness),
        wallMaterial
    );
    windowBottom.position.set(0, 0.4, roomCenterZ - roomDepth / 2);
    windowBottom.castShadow = true;
    windowBottom.receiveShadow = true;
    scene.add(windowBottom);
    walls.push(windowBottom);

    // Collision detection function
    function checkWallCollision(position, radius = 0.5) {
        // Check collision at ground level (player's body), not camera height
        const bodyPosition = new THREE.Vector3(position.x, 1.0, position.z);

        for (const wall of walls) {
            const wallBox = new THREE.Box3().setFromObject(wall);
            const playerSphere = new THREE.Sphere(bodyPosition, radius);
            if (wallBox.intersectsSphere(playerSphere)) {
                return true;
            }
        }
        return false;
    }

    return {
        walls,
        checkWallCollision
    };
}
