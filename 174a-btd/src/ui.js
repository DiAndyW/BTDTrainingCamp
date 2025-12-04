// ui.js - Enhanced UI with menus, warnings, and advanced scoring

export function initUI(container) {
    let score = 0;
    let highScore = parseInt(localStorage.getItem('btd-highscore') || '0');
    let combo = 0;
    let multiplier = 1;
    let lives = 5;
    let gameStarted = false;
    let gamePaused = false;
    let lastHitTime = 0;

    // Main menu
    const mainMenu = document.createElement('div');
    Object.assign(mainMenu.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000',
    });

    const title = document.createElement('div');
    title.textContent = 'BALLOON TOWER DEFENSE';
    Object.assign(title.style, {
        fontSize: '48px',
        color: '#ff6b6b',
        fontWeight: 'bold',
        marginBottom: '30px',
        textShadow: '0 0 20px rgba(255, 107, 107, 0.8)',
    });
    mainMenu.appendChild(title);

    const startButton = document.createElement('button');
    startButton.textContent = 'START GAME';
    Object.assign(startButton.style, {
        fontSize: '24px',
        padding: '15px 40px',
        backgroundColor: '#4ecdc4',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(78, 205, 196, 0.4)',
        transition: 'all 0.3s',
    });
    startButton.onmouseover = () => {
        startButton.style.backgroundColor = '#45b8b0';
        startButton.style.transform = 'scale(1.1)';
    };
    startButton.onmouseout = () => {
        startButton.style.backgroundColor = '#4ecdc4';
        startButton.style.transform = 'scale(1)';
    };
    mainMenu.appendChild(startButton);

    const instructions = document.createElement('div');
    instructions.innerHTML = `
        <div style="margin-top: 40px; color: white; text-align: center; line-height: 1.8;">
            <div style="margin-top: 20px; font-size: 18px; color: #ff6b6b;">High Score: ${highScore}</div>
        </div>
    `;
    mainMenu.appendChild(instructions);
    container.appendChild(mainMenu);

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
        padding: '20px',
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'none',
    });
    container.appendChild(hudContainer);

    // Score and stats panel
    const statsPanel = document.createElement('div');
    Object.assign(statsPanel.style, {
        position: 'absolute',
        top: '20px',
        left: '20px',
        padding: '15px 25px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '10px',
        border: '2px solid #4ecdc4',
        boxShadow: '0 0 20px rgba(78, 205, 196, 0.3)',
    });

    const scoreDiv = document.createElement('div');
    scoreDiv.textContent = `Score: ${score}`;
    Object.assign(scoreDiv.style, {
        fontSize: '24px',
        color: '#ffd93d',
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(255, 217, 61, 0.5)',
        marginBottom: '8px',
    });
    statsPanel.appendChild(scoreDiv);

    const highScoreDiv = document.createElement('div');
    highScoreDiv.textContent = `High: ${highScore}`;
    Object.assign(highScoreDiv.style, {
        fontSize: '16px',
        color: '#ff6b6b',
        marginBottom: '8px',
    });
    statsPanel.appendChild(highScoreDiv);

    const comboDiv = document.createElement('div');
    comboDiv.textContent = '';
    Object.assign(comboDiv.style, {
        fontSize: '20px',
        color: '#ff6b6b',
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(255, 107, 107, 0.8)',
        marginTop: '8px',
    });
    statsPanel.appendChild(comboDiv);

    const waveDiv = document.createElement('div');
    waveDiv.textContent = 'Wave: 1';
    Object.assign(waveDiv.style, {
        fontSize: '24px',
        color: '#4ecdc4',
        fontWeight: 'bold',
        marginTop: '15px',
        textShadow: '0 0 10px rgba(78, 205, 196, 0.8)',
    });
    statsPanel.appendChild(waveDiv);

    hudContainer.appendChild(statsPanel);

    // Shop Toggle Button
    const shopToggleBtn = document.createElement('button');
    shopToggleBtn.textContent = '🛒 SHOP (B)';
    Object.assign(shopToggleBtn.style, {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        fontSize: '18px',
        backgroundColor: '#ffd93d',
        color: 'black',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        pointerEvents: 'auto',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
    });
    shopToggleBtn.onclick = () => {
        shopContainer.style.display = shopContainer.style.display === 'none' ? 'block' : 'none';
    };
    hudContainer.appendChild(shopToggleBtn);

    // Shop UI
    const shopContainer = document.createElement('div');
    Object.assign(shopContainer.style, {
        position: 'absolute',
        bottom: '70px', // Moved up to sit above toggle button
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '10px',
        border: '2px solid #ffd93d',
        display: 'none', // Hidden by default
        pointerEvents: 'auto', // Enable clicks
    });
    hudContainer.appendChild(shopContainer);

    const shopTitle = document.createElement('div');
    shopTitle.textContent = 'SHOP (Press B)';
    Object.assign(shopTitle.style, {
        color: '#ffd93d',
        fontWeight: 'bold',
        marginBottom: '10px',
        textAlign: 'center',
    });
    shopContainer.appendChild(shopTitle);

    const upgradeButtons = {};

    function createUpgradeButton(id, name, cost) {
        const btn = document.createElement('button');
        btn.textContent = `${name} ($${cost})`;
        Object.assign(btn.style, {
            display: 'block',
            width: '100%',
            padding: '8px',
            marginBottom: '5px',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '5px',
            cursor: 'pointer',
        });
        btn.onclick = () => {
             if (window.gameManager && window.gameManager.buyUpgrade(id)) {
                 // Success
             }
        };
        shopContainer.appendChild(btn);
        upgradeButtons[id] = btn;
    }

    createUpgradeButton('rapidFire', 'Rapid Fire', 100);
    createUpgradeButton('multiShot', 'Multi-Shot', 500);
    createUpgradeButton('damage', 'Damage Up', 200);

    // Lives display
    const livesDiv = document.createElement('div');
    livesDiv.textContent = `lives: ${lives}`;
    Object.assign(livesDiv.style, {
        position: 'absolute',
        top: '20px',
        right: '20px',
        fontSize: '28px',
        color: '#ff6b6b',
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(255, 107, 107, 0.8)',
        padding: '10px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '10px',
        border: '2px solid #ff6b6b',
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
        shopContainer.style.display = 'block';
        score = 0;
        combo = 0;
        multiplier = 1;
        lives = 5;
        updateScore();
        updateLives();
    }

    function updateScore() {
        scoreDiv.textContent = `Score: ${score}`;
        highScoreDiv.textContent = `High: ${highScore}`;
        if (combo > 1) {
            comboDiv.textContent = `🔥 ${combo}x COMBO! (${multiplier}x multiplier)`;
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
        livesDiv.textContent = `lives: ${lives}`;
        if (lives <= 2) {
            livesDiv.style.animation = 'pulse 0.5s infinite';
        }
    }

    function loseLife() {
        lives--;
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
        startGame();
        if (window.onGameStart) window.onGameStart();
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
        if (e.key.toLowerCase() === 'b' && gameStarted && !gamePaused) {
            shopContainer.style.display = shopContainer.style.display === 'none' ? 'block' : 'none';
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
    `;
    document.head.appendChild(style);

    return {
        setScore: (newScore) => { score = newScore; updateScore(); },
        getScore: () => score,
        addScore,
        loseLife,
        showSpawnWarning,
        isGameStarted: () => gameStarted,
        isGamePaused: () => gamePaused,
        crosshair,
        scoreDiv,
        hintDiv,
        updateScore: (s, m) => { score = s; updateScore(); },
        updateLives: (l) => { lives = l; updateLives(); },
        updateWave: (w) => { waveDiv.textContent = `Wave: ${w}`; },
        updateShop: (upgrades) => {
             for (const [key, data] of Object.entries(upgrades)) {
                 if (upgradeButtons[key]) {
                     upgradeButtons[key].textContent = `${data.name} (Lvl ${data.level}) - $${data.cost}`;
                     if (data.level >= data.max) {
                         upgradeButtons[key].textContent = `${data.name} (MAX)`;
                         upgradeButtons[key].disabled = true;
                     }
                 }
             }
        },
        showWaveComplete: (w) => {
             const msg = document.createElement('div');
             msg.textContent = `WAVE ${w-1} COMPLETE!`;
             Object.assign(msg.style, {
                 position: 'absolute',
                 top: '30%',
                 left: '50%',
                 transform: 'translate(-50%, -50%)',
                 fontSize: '48px',
                 color: '#4ecdc4',
                 fontWeight: 'bold',
                 textShadow: '0 0 20px rgba(78, 205, 196, 0.8)',
                 animation: 'fadeOut 3s forwards',
                 pointerEvents: 'none'
             });
             container.appendChild(msg);
             setTimeout(() => msg.remove(), 3000);
        }
    };
}
