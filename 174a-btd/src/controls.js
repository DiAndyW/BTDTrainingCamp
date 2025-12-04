// controls.js - Keyboard and pointer lock controls
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

    function onClick() {
        if (!controls.isLocked) {
            controls.lock();
        } else {
            const currentTime = performance.now() / 1000; // Convert to seconds
            const weapon = getCurrentWeapon();
            const timeSinceLastShot = currentTime - lastShotTime;

            if (timeSinceLastShot >= weapon.fireRate) {
                onShoot();
                lastShotTime = currentTime;
            }
        }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    renderer.domElement.addEventListener('click', onClick);

    function updateMovement(dt, moveSpeed, checkWallCollision) {
        if (controls.isLocked) {
            // Store previous position
            const prevPosition = camera.position.clone();

            const actualMove = moveSpeed * dt;
            if (movement.forward) controls.moveForward(actualMove);
            if (movement.backward) controls.moveForward(-actualMove);
            if (movement.left) controls.moveRight(-actualMove);
            if (movement.right) controls.moveRight(actualMove);

            // Check collision and revert if needed
            if (checkWallCollision(camera.position)) {
                camera.position.copy(prevPosition);
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
            renderer.domElement.removeEventListener('click', onClick);
        }
    };
}
