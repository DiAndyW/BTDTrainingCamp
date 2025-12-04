// weapons.js - Weapon configurations and stats

export const WEAPONS = {
    HAND_GUN: {
        id: 'HAND_GUN',
        name: 'Hand Gun',
        damage: 1,
        fireRate: 0.3,      
        projectileSpeed: 50,
        projectileColor: 0x000000,
        projectileSize: 0.1,
        description: 'Standard weapon. Balanced fire rate and damage.',
        modelPath: '../models/hand.obj',
        modelScale: { x: 0.1, y: 0.1, z: 0.1 },
        modelPosition: { x: 0.15, y: -0.3, z: -0.62 },
        modelRotation: { x: 0, y: Math.PI * 3 / 2, z: 0 },
        modelMaterial: { color: 0xb35432, type: 'phong' },
        projectileType: 'sphere'  // Use sphere projectile
    },
    MACHINE_GUN: {
        id: 'MACHINE_GUN',
        name: 'Machine Gun',
        damage: 0.5,
        fireRate: 0.15,
        projectileSpeed: 60,
        projectileColor: 0xff9900,
        projectileSize: 0.08,
        description: 'High fire rate with lower damage.',
        modelPath: '../models/machinegun.obj',
        mtlPath: '../models/machinegun.mtl',
        useBlenderMaterials: true,
        modelScale: { x: 0.1, y: 0.1, z: 0.1 },
        modelPosition: { x: 0.25, y: -0.2, z: -0.2 },
        modelRotation: { x: 0, y: Math.PI * 25/16, z: Math.PI / 2 },
        modelMaterial: { color: 0xb35432, type: 'phong' },
        projectileType: 'sphere'  // Use sphere projectile
    },
    ICE_KNIVES: {
        id: 'ICE_KNIVES',
        name: 'Ice Knives',
        damage: 2,
        fireRate: 0.6,
        projectileSpeed: 40,
        projectileColor: 0x87CEEB,
        projectileSize: 0.15,
        description: 'Heavy spread damage with moderate fire rate.',
        modelPath: '../models/knives.obj',
        modelScale: { x: 0.15, y: 0.15, z: 0.15 },
        modelPosition: { x: 0.5, y: -0.2, z: -0.55 },
        modelRotation: { x: Math.PI * 2 / 3, y: Math.PI, z: Math.PI / 2 },
        modelMaterial: {
            color: 0xAAFFFF,
            type: 'standard',
            metalness: 0.2,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9,
            emissive: 0x0088FF,
            emissiveIntensity: 0.3
        },
        projectileType: 'model',  // Use 3D model projectile
        projectileModel: '../models/knife.obj',
        projectileModelScale: { x: 0.1, y: 0.1, z: 0.1 },
        projectileModelMaterial: {
            color: 0xAAFFFF,
            type: 'standard',
            metalness: 0.2,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9,
            emissive: 0x0088FF,
            emissiveIntensity: 0.3
        }
    }
};

// Default weapon
export let currentWeapon = WEAPONS.HAND_GUN;

export function setCurrentWeapon(weaponId) {
    if (WEAPONS[weaponId]) {
        currentWeapon = WEAPONS[weaponId];
        return true;
    }
    return false;
}

export function getCurrentWeapon() {
    return currentWeapon;
}
