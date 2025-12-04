// game.js - Game Logic Manager
export class GameManager {
    constructor(ui) {
        this.ui = ui;
        this.wave = 1;
        this.score = 0;
        this.money = 0; // Separate from score? Let's use score as money for simplicity or separate it. 
                        // Plan said "Spend score". Let's use a "Money" counter that increases with score.
        this.lives = 5;
        
        this.upgrades = {
            rapidFire: { level: 0, cost: 100, max: 5, name: "Rapid Fire" },
            multiShot: { level: 0, cost: 500, max: 1, name: "Multi-Shot" },
            damage: { level: 0, cost: 200, max: 5, name: "Damage Up" }
        };

        this.waveActive = false;
        this.enemiesRemaining = 0;
        this.waveTimer = 0;
    }

    startWave(scene, spawnBalloonFunc) {
        if (this.waveActive) return;
        
        this.waveActive = true;
        this.ui.updateWave(this.wave);
        
        // Wave logic:
        // Wave 1: 5 Red
        // Wave 2: 10 Red
        // Wave 3: 5 Red, 3 Blue
        // Wave 4: 10 Blue
        // Wave 5: 5 Green (Tank)
        // Wave 10: 1 Yellow (Boss)
        
        const waveConfig = this.getWaveConfig(this.wave);
        this.enemiesRemaining = waveConfig.count;
        
        let spawned = 0;
        const interval = setInterval(() => {
            if (spawned >= waveConfig.count) {
                clearInterval(interval);
                return;
            }
            
            // Determine type based on wave progression
            const type = this.getEnemyTypeForWave(this.wave, spawned);
            spawnBalloonFunc(scene, null, type);
            spawned++;
            
        }, waveConfig.interval);
    }

    getWaveConfig(wave) {
        // Simple difficulty scaling
        return {
            count: 5 + Math.floor(wave * 1.5),
            interval: Math.max(500, 2000 - wave * 100)
        };
    }

    getEnemyTypeForWave(wave, index) {
        if (wave % 10 === 0 && index === 0) return 'yellow'; // Boss every 10 waves
        if (wave >= 5 && index % 3 === 0) return 'green';
        if (wave >= 3 && index % 2 === 0) return 'blue';
        return 'red';
    }

    enemyDefeated(points) {
        this.score += points;
        this.money += points;
        this.enemiesRemaining--;
        this.ui.updateScore(this.score, this.money);
        
        if (this.enemiesRemaining <= 0) {
            this.endWave();
        }
    }
    
    enemyEscaped() {
        this.lives--;
        this.enemiesRemaining--;
        this.ui.updateLives(this.lives);
        
        if (this.enemiesRemaining <= 0) {
            this.endWave();
        }
        
        if (this.lives <= 0) {
            this.ui.gameOver(this.score);
        }
    }

    endWave() {
        this.waveActive = false;
        this.wave++;
        this.ui.showWaveComplete(this.wave);
    }

    buyUpgrade(type) {
        const upgrade = this.upgrades[type];
        if (upgrade && this.money >= upgrade.cost && upgrade.level < upgrade.max) {
            this.money -= upgrade.cost;
            upgrade.level++;
            upgrade.cost = Math.floor(upgrade.cost * 1.5);
            this.ui.updateScore(this.score, this.money);
            this.ui.updateShop(this.upgrades);
            return true;
        }
        return false;
    }
    
    getUpgradeLevel(type) {
        return this.upgrades[type].level;
    }
}
