// src/audio.js - Audio manager for game sounds
import * as THREE from 'three';

class AudioManager {
    constructor() {
        this.listener = null;
        this.sounds = new Map();
        this.audioLoader = new THREE.AudioLoader();
        this.initialized = false;
        this.soundPool = new Map(); // Pool of audio objects for each sound
        this.poolSize = 5; // Number of simultaneous sounds per type
    }

    init(camera) {
        if (this.initialized) return;

        // Create audio listener and attach to camera
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);
        this.initialized = true;

        // Load weapon sounds
        this.loadSound('hand_gun', '/sounds/gun shot.mp3');
        this.loadSound('machine_gun', '/sounds/machine gun.mp3');
        this.loadSound('ice_knives', '/sounds/knife throw.mp3');
        this.loadSound('ray_gun', '/sounds/bzz.mp3');

        // Load other sounds
        this.loadSound('balloon_pop', '/sounds/balloon pop.mp3');
        this.loadSound('lose_life', '/sounds/lose life.mp3');
        this.loadSound('low_lives', '/sounds/low health.mp3');
        this.loadSound('game_over', '/sounds/loss screen.mp3');
        this.loadSound('new_wave', '/sounds/new round.mp3');
        this.loadSound('high_combo', '/sounds/wow.mp3');
    }

    loadSound(name, path) {
        // Create a pool of audio objects for this sound
        const pool = [];

        this.audioLoader.load(
            path,
            (buffer) => {
                // Create multiple audio objects for overlapping sounds
                for (let i = 0; i < this.poolSize; i++) {
                    const audio = new THREE.Audio(this.listener);
                    audio.setBuffer(buffer);
                    audio.setVolume(0.5);
                    pool.push(audio);
                }
                this.soundPool.set(name, pool);
                console.log(`Loaded sound: ${name}`);
            },
            undefined,
            (error) => {
                console.warn(`Could not load sound: ${name} at ${path}. Add the audio file to continue.`);
            }
        );
    }

    play(name, volume = 0.5) {
        const pool = this.soundPool.get(name);
        if (!pool) return; // Sound not loaded

        // Find an available audio object (not currently playing)
        let audio = pool.find(a => !a.isPlaying);

        // If all are playing, use the first one anyway (will restart it)
        if (!audio) {
            audio = pool[0];
        }

        if (audio) {
            audio.setVolume(volume);
            if (audio.isPlaying) {
                audio.stop();
            }
            audio.play();
        }
    }

    playWeapon(weaponSoundName) {
        this.play(weaponSoundName, 0.3);
    }

    playBalloonPop() {
        this.play('balloon_pop', 0.4);
    }

    playLoseLife() {
        this.play('lose_life', 0.6);
    }

    playLowLives() {
        this.play('low_lives', 0.7);
    }

    playGameOver() {
        this.play('game_over', 0.8);
    }

    playNewWave() {
        this.play('new_wave', 0.5);
    }

    playHighCombo() {
        this.play('high_combo', 0.6);
    }

    setMasterVolume(volume) {
        if (this.listener) {
            this.listener.setMasterVolume(volume);
        }
    }
}

// Singleton instance
const audioManager = new AudioManager();

export { audioManager };
