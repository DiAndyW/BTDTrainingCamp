# Bloon Towers Defense Training Camp

A 3D first-person shooter (FPS) physics-based aim trainer built with Three.js and vanilla JavaScript.

## Features

- **FPS Controls**: WASD movement + mouse look with pointer lock
- **Physics Simulation**: Projectiles and balloons follow kinematic equations with gravity
- **Collision Detection**: Bounding sphere collision system
- **Shadow Mapping**: Realistic shadows cast by objects
- **3D Environment**: Procedurally generated balloons with Phong shading

## Tech Stack

- **Three.js** - 3D graphics library
- **Vite** - Build tool and dev server
- **Vanilla JavaScript** - No frameworks, pure JS

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Controls

- **Click** - Lock mouse pointer (first click) / Shoot projectile (subsequent clicks)
- **WASD** - Move around
- **Mouse** - Look around (when pointer is locked)

## Gameplay

Shoot projectiles at moving balloons that follow parabolic trajectories. Score points by hitting balloons before they fly away!
