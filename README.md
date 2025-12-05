# Bloon Towers Defense Training Camp

A 3D first-person shooter (FPS) physics-based aim trainer inspired by the classic Balloon Tower Defense game, built with Three.js and vanilla JavaScript.

**Team Members:** Andy Wang, Charlton Shih, David Han

---

## Project Goal

Train your aim by shooting balloons that follow parabolic trajectories before they escape!

**Gameplay Loop:**

- Balloons spawn in waves with increasing difficulty
- Players use FPS controls (WASD + mouse) to navigate and aim
- Shoot projectiles at moving balloons to score points
- Lose lives when balloons escape - survive as many waves as possible!

---

## Core Features

| Feature                 | Technical Implementation                                                   |
| ----------------------- | -------------------------------------------------------------------------- |
| **FPS Controls**        | PointerLockControls + WASD movement with wall collision detection          |
| **Physics Simulation**  | Kinematic equations with configurable gravity for projectiles and balloons |
| **Collision Detection** | Bounding sphere collision system between projectiles and balloons          |
| **Shadow Mapping**      | PCFSoftShadowMap with directional light casting                            |
| **3D Environment**      | Procedurally generated scene with Toon/Phong shading                       |

---

## Advanced Features

### Wave System (`waves.js`)

- 10+ predefined waves with increasing difficulty
- Procedural wave generation for infinite gameplay
- Shuffled spawn queues for variety

### Balloon Type Hierarchy (`balloons.js`)

- 9 balloon types: Red → Blue → Green → Yellow → Pink → Black → White → Lead
- Each type has health, speed multiplier, and child spawning (like BTD!)
- Health bars for multi-hit balloons

### Multiple Weapons (`weapons.js`)

- **Hand Gun** - Balanced fire rate and damage
- **Machine Gun** - High fire rate, low damage
- **Ice Knives** - Spread shot with 3D model projectiles

### Trajectory Preview (`trajectory.js`)

- Real-time dashed line showing projectile flight path
- Uses Euler integration to predict physics

---

## Visual & Interactive Features

### Particle System (`particles.js`)

- Explosion effects on balloon pop
- Sparkle effects for combo milestones

### UI System (`ui.js`)

- BTD-style menu with floating balloon decorations
- Combo scoring system with graffiti-style popup text
- Wave announcements and progress tracking
- Pause/Resume functionality
- Settings menu with configurable gravity, balloon size, spawn direction

### Procedural Textures (`textures.js`)

- Canvas-based ground texture with grass, path, and flowers
- Cartoon-style visual aesthetic

---

## 3D Assets & Models

- **OBJ Model Loading** with MTL materials support
- Custom 3D models:
  - Player hand/weapons
  - Machine gun with Blender materials
  - Knife projectiles for Ice Knives weapon
  - Traffic cones for environment decoration
- **Custom Balloon Meshes** loaded from OBJ files

---

## Tech Stack

- **Three.js** - 3D graphics library
- **Vite** - Build tool and dev server
- **Vanilla JavaScript** - No frameworks, pure JS

---

## 📁 Technical Architecture

```
main.js (Game Loop)
├── scene.js (3D Environment Setup)
├── controls.js (FPS Input Handling)
├── balloons.js (Balloon Logic + Types)
├── projectiles.js (Shooting Mechanics)
├── waves.js (Wave Management)
├── weapons.js (Weapon Configurations)
├── particles.js (Explosion Effects)
├── trajectory.js (Aim Preview)
├── textures.js (Procedural Textures)
├── objects.js (3D Model Loading)
├── walls.js (Collision Boundaries)
└── ui.js (All UI/HUD Elements)
```

---

## Graphics Techniques Used

| Technique                    | Implementation                           |
| ---------------------------- | ---------------------------------------- |
| **Toon Shading**             | MeshToonMaterial for cartoon look        |
| **Phong Shading**            | MeshPhongMaterial for reflective objects |
| **Shadow Mapping**           | DirectionalLight with PCFSoftShadowMap   |
| **Procedural Textures**      | Canvas API for ground texture            |
| **Fog**                      | THREE.Fog for depth effect               |
| **Hemisphere Lighting**      | Sky-to-ground ambient gradient           |
| **ACES Filmic Tone Mapping** | Enhanced color rendering                 |

---

## Challenges & Solutions

| Challenge                                 | Solution                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------- |
| **Balloon Hierarchy (children spawning)** | Recursive damage function that spawns child balloons at parent position when popped |
| **3D Model Projectiles**                  | OBJLoader with custom material application, added spinning animation                |
| **Collision with OBJ models**             | Used bounding spheres with fallback radius calculations                             |
| **Pause System with Spawning**            | Added callback system (`isPausedCallback`) to delay spawns while paused             |
| **Performance with Many Particles**       | Limited particle lifetimes and object pooling patterns                              |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npx vite
```

---

## Controls

| Input     | Action                                                                  |
| --------- | ----------------------------------------------------------------------- |
| **Click** | Lock mouse pointer (first click) / Shoot projectile (subsequent clicks) |
| **WASD**  | Move around                                                             |
| **Mouse** | Look around (when pointer is locked)                                    |
| **ESC**   | Pause game / Unlock pointer                                             |

---
