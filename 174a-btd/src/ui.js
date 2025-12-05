// ui.js - Enhanced UI with menus, warnings, and advanced scoring
import { WEAPONS, setCurrentWeapon, getCurrentWeapon } from './weapons.js';
import { loadWeaponModel } from './objects.js';

export function initUI(container) {
    let score = 0;
    let highScore = parseInt(localStorage.getItem('btd-highscore') || '0');
    let combo = 0;
    let multiplier = 1;
    let lives = 50;
    let gameStarted = false;
    let gamePaused = false;
    let lastHitTime = 0;
    let currentWaveNum = 0;
    let balloonsRemaining = 0;

    // Main menu - BTD style with wood/brown theme
    const mainMenu = document.createElement('div');
    Object.assign(mainMenu.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #4a7c3f 0%, #2d5a27 50%, #1a3d15 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000',
    });

    const title = document.createElement('div');
    title.textContent = 'BLOONS TOWER DEFENSE';
    Object.assign(title.style, {
        fontSize: '48px',
        color: '#ffd700',
        fontWeight: 'bold',
        marginBottom: '30px',
        textShadow: '3px 3px 0px #8B4513, 5px 5px 8px rgba(0,0,0,0.5)',
        letterSpacing: '2px',
        fontFamily: 'Arial Black, sans-serif',
    });
    mainMenu.appendChild(title);

    const startButton = document.createElement('button');
    startButton.textContent = 'PLAY';
    Object.assign(startButton.style, {
        fontSize: '24px',
        padding: '15px 60px',
        background: 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)',
        color: 'white',
        border: '3px solid #2E7D32',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 4px 0px #1B5E20, 0 6px 10px rgba(0,0,0,0.3)',
        transition: 'all 0.15s',
        fontFamily: 'Arial Black, sans-serif',
    });
    startButton.onmouseover = () => {
        startButton.style.transform = 'translateY(-2px)';
        startButton.style.boxShadow = '0 6px 0px #1B5E20, 0 8px 15px rgba(0,0,0,0.3)';
    };
    startButton.onmouseout = () => {
        startButton.style.transform = 'translateY(0)';
        startButton.style.boxShadow = '0 4px 0px #1B5E20, 0 6px 10px rgba(0,0,0,0.3)';
    };
    startButton.onmousedown = () => {
        startButton.style.transform = 'translateY(2px)';
        startButton.style.boxShadow = '0 2px 0px #1B5E20, 0 3px 5px rgba(0,0,0,0.3)';
    };
    mainMenu.appendChild(startButton);

    const instructions = document.createElement('div');
    instructions.innerHTML = `
        <div style="margin-top: 40px; text-align: center; line-height: 1.8;">
            <div style="font-size: 20px; color: #ffd700; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">High Score: ${highScore}</div>
            <div style="margin-top: 12px; font-size: 14px; color: #b8e6b8;">Hold mouse to shoot • Pop all the balloons!</div>
        </div>
    `;
    mainMenu.appendChild(instructions);
    container.appendChild(mainMenu);

    // Weapon Selection Menu - BTD style
    const weaponMenu = document.createElement('div');
    Object.assign(weaponMenu.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #4a7c3f 0%, #2d5a27 50%, #1a3d15 100%)',
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000',
    });

    const weaponTitle = document.createElement('div');
    weaponTitle.textContent = 'SELECT WEAPON';
    Object.assign(weaponTitle.style, {
        fontSize: '36px',
        color: '#ffd700',
        fontWeight: 'bold',
        marginBottom: '40px',
        textShadow: '2px 2px 0px #8B4513',
        fontFamily: 'Arial Black, sans-serif',
    });
    weaponMenu.appendChild(weaponTitle);

    const weaponGrid = document.createElement('div');
    Object.assign(weaponGrid.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        maxWidth: '800px',
    });

    // Create weapon selection cards - BTD style
    Object.values(WEAPONS).forEach(weapon => {
        const card = document.createElement('div');
        Object.assign(card.style, {
            padding: '20px',
            background: 'linear-gradient(180deg, #8B6914 0%, #6B4F0E 100%)',
            border: '3px solid #5D4E37',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        });

        card.innerHTML = `
            <div style="font-size: 22px; color: #ffd700; font-weight: bold; margin-bottom: 8px; font-family: Arial Black, sans-serif;">
                ${weapon.name}
            </div>
            <div style="font-size: 13px; color: #e8d5a3; margin-bottom: 12px; line-height: 1.5;">
                ${weapon.description}
            </div>
            <div style="display: flex; justify-content: space-around; margin-top: 12px;">
                <div style="text-align: center;">
                    <div style="color: #ff9999; font-size: 11px;">DAMAGE</div>
                    <div style="color: white; font-size: 18px; font-weight: bold;">${weapon.damage}x</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #99ff99; font-size: 11px;">FIRE RATE</div>
                    <div style="color: white; font-size: 18px; font-weight: bold;">${(1/weapon.fireRate).toFixed(1)}/s</div>
                </div>
            </div>
        `;

        card.onmouseover = () => {
            card.style.transform = 'translateY(-3px)';
            card.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
            card.style.borderColor = '#ffd700';
        };
        card.onmouseout = () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            card.style.borderColor = '#5D4E37';
        };
        card.onclick = () => {
            setCurrentWeapon(weapon.id);
            weaponMenu.style.display = 'none';

            // Load weapon model
            if (window.gameCamera) {
                loadWeaponModel(window.gameCamera, weapon);
            }

            startGame();
            if (window.onGameStart) window.onGameStart();
        };

        weaponGrid.appendChild(card);
    });

    weaponMenu.appendChild(weaponGrid);
    container.appendChild(weaponMenu);

    // Crosshair
    const crosshair = document.createElement('div');
    crosshair.textContent = '+';
    Object.assign(crosshair.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '32px',
        color: '#4ecdc4',
        pointerEvents: 'none',
        userSelect: 'none',
        textShadow: '0 0 10px rgba(78, 205, 196, 0.8)',
        display: 'none',
    });
    container.appendChild(crosshair);

    // HUD Container
    const hudContainer = document.createElement('div');
    Object.assign(hudContainer.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        padding: '15px',
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'none',
        fontFamily: 'Arial, sans-serif',
    });
    container.appendChild(hudContainer);

    // Score and stats panel - BTD wood style
    const statsPanel = document.createElement('div');
    Object.assign(statsPanel.style, {
        position: 'absolute',
        top: '15px',
        left: '15px',
        padding: '12px 18px',
        background: 'linear-gradient(180deg, #8B6914 0%, #6B4F0E 100%)',
        borderRadius: '8px',
        border: '3px solid #5D4E37',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
    });

    const scoreDiv = document.createElement('div');
    scoreDiv.textContent = `Score: ${score}`;
    Object.assign(scoreDiv.style, {
        fontSize: '20px',
        color: '#ffd700',
        fontWeight: 'bold',
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
        marginBottom: '4px',
    });
    statsPanel.appendChild(scoreDiv);

    const highScoreDiv = document.createElement('div');
    highScoreDiv.textContent = `Best: ${highScore}`;
    Object.assign(highScoreDiv.style, {
        fontSize: '14px',
        color: '#e8d5a3',
        marginBottom: '6px',
    });
    statsPanel.appendChild(highScoreDiv);

    const comboDiv = document.createElement('div');
    comboDiv.textContent = '';
    Object.assign(comboDiv.style, {
        fontSize: '16px',
        color: '#ff9999',
        fontWeight: 'bold',
        marginTop: '6px',
    });
    statsPanel.appendChild(comboDiv);

    const weaponDiv = document.createElement('div');
    Object.assign(weaponDiv.style, {
        fontSize: '12px',
        color: '#b8e6b8',
        marginTop: '8px',
        paddingTop: '6px',
        borderTop: '1px solid rgba(255,255,255,0.2)',
    });
    statsPanel.appendChild(weaponDiv);

    // Wave info (integrated into stats panel)
    const waveDivider = document.createElement('div');
    Object.assign(waveDivider.style, {
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255,255,255,0.2)',
    });

    const waveNumDiv = document.createElement('div');
    waveNumDiv.textContent = 'WAVE 1';
    Object.assign(waveNumDiv.style, {
        fontSize: '16px',
        color: '#ffd700',
        fontWeight: 'bold',
        marginBottom: '2px',
    });
    waveDivider.appendChild(waveNumDiv);

    const balloonsRemainingDiv = document.createElement('div');
    balloonsRemainingDiv.textContent = '0 left to pop';
    Object.assign(balloonsRemainingDiv.style, {
        fontSize: '13px',
        color: '#e8d5a3',
    });
    waveDivider.appendChild(balloonsRemainingDiv);

    statsPanel.appendChild(waveDivider);
    hudContainer.appendChild(statsPanel);

    // Lives display - BTD style
    const livesDiv = document.createElement('div');
    livesDiv.textContent = `Lives: ${lives}`;
    Object.assign(livesDiv.style, {
        position: 'absolute',
        top: '15px',
        right: '15px',
        fontSize: '20px',
        color: '#ff6666',
        fontWeight: 'bold',
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
        padding: '10px 18px',
        background: 'linear-gradient(180deg, #8B6914 0%, #6B4F0E 100%)',
        borderRadius: '8px',
        border: '3px solid #5D4E37',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
    });
    hudContainer.appendChild(livesDiv);



    // Hint text
    const hintDiv = document.createElement('div');
    hintDiv.textContent = 'Press ESC to pause';
    Object.assign(hintDiv.style, {
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '14px',
        color: 'white',
        textShadow: '0 0 5px black',
        opacity: '0.6',
    });
    hudContainer.appendChild(hintDiv);

    // Warning indicators container
    const warningsContainer = document.createElement('div');
    Object.assign(warningsContainer.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
    });
    container.appendChild(warningsContainer);

    // Pause menu
    const pauseMenu = document.createElement('div');
    Object.assign(pauseMenu.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '999',
    });

    const pauseTitle = document.createElement('div');
    pauseTitle.textContent = 'PAUSED';
    Object.assign(pauseTitle.style, {
        fontSize: '48px',
        color: '#ffd93d',
        fontWeight: 'bold',
        marginBottom: '30px',
        textShadow: '0 0 20px rgba(255, 217, 61, 0.8)',
    });
    pauseMenu.appendChild(pauseTitle);

    const resumeButton = document.createElement('button');
    resumeButton.textContent = 'RESUME';
    Object.assign(resumeButton.style, {
        fontSize: '20px',
        padding: '12px 35px',
        backgroundColor: '#4ecdc4',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginBottom: '15px',
    });
    pauseMenu.appendChild(resumeButton);

    const restartButton = document.createElement('button');
    restartButton.textContent = 'RESTART';
    Object.assign(restartButton.style, {
        fontSize: '20px',
        padding: '12px 35px',
        backgroundColor: '#ff6b6b',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    });
    pauseMenu.appendChild(restartButton);

    container.appendChild(pauseMenu);

    // Game over screen
    const gameOverScreen = document.createElement('div');
    Object.assign(gameOverScreen.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000',
    });

    const gameOverTitle = document.createElement('div');
    gameOverTitle.textContent = 'GAME OVER';
    Object.assign(gameOverTitle.style, {
        fontSize: '56px',
        color: '#ff6b6b',
        fontWeight: 'bold',
        marginBottom: '20px',
        textShadow: '0 0 30px rgba(255, 107, 107, 0.8)',
    });
    gameOverScreen.appendChild(gameOverTitle);

    const finalScoreDiv = document.createElement('div');
    Object.assign(finalScoreDiv.style, {
        fontSize: '32px',
        color: '#ffd93d',
        marginBottom: '40px',
    });
    gameOverScreen.appendChild(finalScoreDiv);

    const playAgainButton = document.createElement('button');
    playAgainButton.textContent = 'PLAY AGAIN';
    Object.assign(playAgainButton.style, {
        fontSize: '24px',
        padding: '15px 40px',
        backgroundColor: '#4ecdc4',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
    });
    gameOverScreen.appendChild(playAgainButton);

    container.appendChild(gameOverScreen);

    // Functions
    function startGame() {
        gameStarted = true;
        mainMenu.style.display = 'none';
        hudContainer.style.display = 'block';
        crosshair.style.display = 'block';
        score = 0;
        combo = 0;
        currentWaveNum = 0;
        multiplier = 1;
        lives = 50;
        updateScore();
        updateWaveDisplay();
        updateLives();
        updateWeaponDisplay();
    }

    function updateWeaponDisplay() {
        const weapon = getCurrentWeapon();
        weaponDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 2px;">${weapon.name}</div>
            <div style="font-size: 10px; opacity: 0.8;">DMG: ${weapon.damage}x | Rate: ${(1/weapon.fireRate).toFixed(1)}/s</div>
        `;
    }

    function updateScore() {
        scoreDiv.textContent = `Score: ${score}`;
        highScoreDiv.textContent = `Best: ${highScore}`;
        if (combo > 1) {
            comboDiv.textContent = `${combo}x COMBO!`;
            comboDiv.style.display = 'block';
        } else {
            comboDiv.style.display = 'none';
        }
    }

    function addScore(points) {
        const now = Date.now();
        if (now - lastHitTime < 3000) {
            combo++;
            multiplier = Math.min(Math.floor(combo / 3) + 1, 5);
        } else {
            combo = 1;
            multiplier = 1;
        }
        lastHitTime = now;

        score += points * multiplier;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('btd-highscore', highScore.toString());
        }
        updateScore();

        // Combo timeout
        setTimeout(() => {
            if (Date.now() - lastHitTime >= 3000) {
                combo = 0;
                multiplier = 1;
                updateScore();
            }
        }, 3000);
    }

    function updateLives() {
        livesDiv.textContent = `Lives: ${lives}`;
        if (lives <= 10) {
            livesDiv.style.animation = 'pulse 0.5s infinite';
        }
    }

    function loseLife(damage = 1) {
        lives -= damage;
        updateLives();
        if (lives <= 0) {
            gameOver();
        }
        showLifeLostWarning();
    }

    function showLifeLostWarning() {
        const warning = document.createElement('div');
        warning.innerHTML = '⚠️ BALLOON ESCAPED!';
        Object.assign(warning.style, {
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '48px',
            color: '#ff4444',
            fontWeight: '900',
            textShadow: '0 0 30px rgba(255, 0, 0, 0.8), 2px 2px 0px black',
            animation: 'zoomFadeOut 2s forwards',
            zIndex: '900',
            whiteSpace: 'nowrap',
            fontFamily: 'Arial, sans-serif'
        });
        container.appendChild(warning);
        setTimeout(() => warning.remove(), 2000);
    }

    function showSpawnWarning(x, y) {
        const warning = document.createElement('div');
        warning.innerHTML = '⚠️';
        Object.assign(warning.style, {
            position: 'absolute',
            left: x + '%',
            top: y + '%',
            fontSize: '64px',
            color: '#ffcc00',
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(255, 204, 0, 1), 2px 2px 0px black',
            animation: 'pulseWarning 0.5s 3',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
        });
        warningsContainer.appendChild(warning);
        setTimeout(() => warning.remove(), 1500);
    }

    function gameOver() {
        gameStarted = false;
        hudContainer.style.display = 'none';
        crosshair.style.display = 'none';
        gameOverScreen.style.display = 'flex';
        finalScoreDiv.textContent = `Final Score: ${score}${score >= highScore ? ' 🏆 NEW HIGH SCORE!' : ''}`;
    }

    function pauseGame() {
        if (!gameStarted || gamePaused) return;
        gamePaused = true;
        pauseMenu.style.display = 'flex';
    }

    function resumeGame() {
        gamePaused = false;
        pauseMenu.style.display = 'none';
    }

    // Event listeners
    startButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        weaponMenu.style.display = 'flex';
    });

    resumeButton.addEventListener('click', () => {
        resumeGame();
        if (window.onGameResume) window.onGameResume();
    });

    restartButton.addEventListener('click', () => {
        location.reload();
    });

    playAgainButton.addEventListener('click', () => {
        location.reload();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && gameStarted) {
            if (gamePaused) {
                resumeGame();
                if (window.onGameResume) window.onGameResume();
            } else {
                pauseGame();
            }
        }
    });

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
        @keyframes zoomFadeOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            10% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
        }
        @keyframes pulseWarning {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes waveNotification {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            30% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);

    // Wave display functions
    function updateWaveDisplay() {
        waveNumDiv.textContent = `Wave ${currentWaveNum}`;
        balloonsRemainingDiv.textContent = `${balloonsRemaining} left to pop`;
    }

    function showWaveStart(waveNum, description) {
        currentWaveNum = waveNum;
        updateWaveDisplay();

        const notification = document.createElement('div');
        notification.innerHTML = `<div style="font-size: 42px; margin-bottom: 8px; font-family: Arial Black, sans-serif;">WAVE ${waveNum}</div><div style="font-size: 20px; opacity: 0.9;">${description}</div>`;
        Object.assign(notification.style, {
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffd700',
            fontWeight: 'bold',
            textShadow: '3px 3px 0px #8B4513, 0 0 20px rgba(0,0,0,0.5)',
            textAlign: 'center',
            animation: 'waveNotification 2.5s forwards',
            zIndex: '900',
            pointerEvents: 'none',
        });
        container.appendChild(notification);
        setTimeout(() => notification.remove(), 2500);
    }

    function updateBalloonsRemaining(count) {
        balloonsRemaining = count;
        updateWaveDisplay();
    }

    return {
        setScore: (newScore) => { score = newScore; updateScore(); },
        getScore: () => score,
        addScore,
        loseLife,
        showSpawnWarning,
        isGameStarted: () => gameStarted,
        isGamePaused: () => gamePaused,
        showWaveStart,
        updateBalloonsRemaining,
        crosshair,
        scoreDiv,
        hintDiv
    };
}
