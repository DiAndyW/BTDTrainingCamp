// controls.js - Keyboard and pointer lock controls with auto-fire support
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { getCurrentWeapon } from './weapons.js';

export function initControls(camera, renderer, onShoot) {
    const controls = new PointerLockControls(camera, renderer.domElement);

    const movement = {
        forward: false,
        backward: false,
        left: false,
        right: false
    };

    let lastShotTime = 0;
    let isMouseDown = false;

    function onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                movement.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                movement.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                movement.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                movement.right = true;
                break;
            default:
                break;
        }
    }

    function onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                movement.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                movement.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                movement.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                movement.right = false;
                break;
            default:
                break;
        }
    }

    function tryShoot() {
        const currentTime = performance.now() / 1000;
        const weapon = getCurrentWeapon();
        const timeSinceLastShot = currentTime - lastShotTime;

        if (timeSinceLastShot >= weapon.fireRate) {
            onShoot();
            lastShotTime = currentTime;
        }
    }

    function onMouseDown(event) {
        if (event.button !== 0) return; // Only left click

        if (!controls.isLocked) {
            controls.lock();
        } else {
            isMouseDown = true;
            tryShoot(); // Shoot immediately on click
        }
    }

    function onMouseUp(event) {
        if (event.button !== 0) return;
        isMouseDown = false;
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    // Also listen on document in case mouse leaves canvas while held
    document.addEventListener('mouseup', onMouseUp);

    function updateMovement(dt, moveSpeed, checkWallCollision) {
        if (controls.isLocked) {
            // Auto-fire when mouse is held down
            if (isMouseDown) {
                tryShoot();
            }

            // Store previous position
            const prevPosition = camera.position.clone();

            const actualMove = moveSpeed * dt;
            if (movement.forward) controls.moveForward(actualMove);
            if (movement.backward) controls.moveForward(-actualMove);
            if (movement.left) controls.moveRight(-actualMove);
            if (movement.right) controls.moveRight(actualMove);

            // Calculate desired delta
            const startPos = prevPosition.clone();
            const endPos = camera.position.clone();
            const delta = endPos.sub(startPos);

            // Reset to start
            camera.position.copy(startPos);

            // Try X movement
            camera.position.x += delta.x;
            if (checkWallCollision(camera.position)) {
                camera.position.x -= delta.x; // Undo X if hit
            }

            // Try Z movement
            camera.position.z += delta.z;
            if (checkWallCollision(camera.position)) {
                camera.position.z -= delta.z; // Undo Z if hit
            }
        }
    }

    return {
        controls,
        movement,
        updateMovement,
        cleanup: () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            renderer.domElement.removeEventListener('mousedown', onMouseDown);
            renderer.domElement.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mouseup', onMouseUp);
        }
    };
}
