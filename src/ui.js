// ui.js - Enhanced UI with menus, warnings, and advanced scoring
import { WEAPONS, setCurrentWeapon, getCurrentWeapon } from './weapons.js';
import { loadWeaponModel } from './objects.js';
import { getGravity, setGravity, getBalloonSize, setBalloonSize, getSpawnDirection, setSpawnDirection, getMovementPattern, setMovementPattern, getBaseSpeed, setBaseSpeed, resetConfig } from './config.js';
import { audioManager } from './audio.js';

export function initUI(container) {
    let score = 0;
    let highScore = parseInt(localStorage.getItem('btd-highscore') || '0');
    let combo = 0;
    let multiplier = 1;
    let lives = 10;
    let gameStarted = false;
    let gamePaused = false;
    let lastHitTime = 0;
    const COMBO_WINDOW = 3000; // 3 seconds
    let currentWaveNum = 0;
    let balloonsRemaining = 0;
    let lowLivesWarningPlayed = false; // Track if low lives warning has been played

    // Add Google Font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Bangers&family=Fredoka:wght@400;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Main menu - Premium BTD style with animated background
    const mainMenu = document.createElement('div');
    Object.assign(mainMenu.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: `
            radial-gradient(ellipse at 30% 20%, rgba(120, 200, 80, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(50, 120, 50, 0.4) 0%, transparent 50%),
            linear-gradient(180deg, #5a9c4f 0%, #3d7a37 30%, #2d5a27 60%, #1a3d15 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000',
        overflow: 'hidden',
    });

    // Decorative floating balloons
    const createFloatingBalloon = (color, left, delay, size) => {
        const balloon = document.createElement('div');
        Object.assign(balloon.style, {
            position: 'absolute',
            width: size + 'px',
            height: (size * 1.2) + 'px',
            background: `radial-gradient(ellipse at 30% 20%, ${color}ee 0%, ${color}aa 50%, ${color}88 100%)`,
            borderRadius: '50% 50% 50% 50%',
            left: left + '%',
            bottom: '-100px',
            opacity: '0.6',
            animation: `floatUp ${8 + Math.random() * 4}s linear infinite`,
            animationDelay: delay + 's',
            pointerEvents: 'none',
            boxShadow: `inset -${size / 8}px -${size / 8}px ${size / 4}px rgba(0,0,0,0.2), inset ${size / 10}px ${size / 10}px ${size / 5}px rgba(255,255,255,0.3)`,
        });
        return balloon;
    };

    const balloonColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8'];
    for (let i = 0; i < 12; i++) {
        const balloon = createFloatingBalloon(
            balloonColors[i % balloonColors.length],
            Math.random() * 100,
            Math.random() * 8,
            30 + Math.random() * 25
        );
        mainMenu.appendChild(balloon);
    }

    // Title container with decorative frame
    const titleContainer = document.createElement('div');
    Object.assign(titleContainer.style, {
        position: 'relative',
        marginBottom: '20px',
    });

    const titleBanner = document.createElement('div');
    Object.assign(titleBanner.style, {
        background: 'linear-gradient(180deg, #c4943a 0%, #a67c30 20%, #8B6914 50%, #6B4F0E 100%)',
        padding: '25px 50px',
        borderRadius: '15px',
        border: '5px solid #5D4E37',
        boxShadow: '0 8px 0px #3d2e1e, 0 12px 30px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.2)',
        position: 'relative',
    });

    const title = document.createElement('div');
    title.textContent = 'BLOONS TOWER';
    Object.assign(title.style, {
        fontSize: '52px',
        color: '#ffeaa0',
        fontWeight: 'bold',
        textShadow: `
            0 4px 0px #8B4513, 
            0 6px 0px #654321,
            0 8px 15px rgba(0,0,0,0.4),
            2px 2px 0 #8B4513,
            -2px -2px 0 #8B4513
        `,
        letterSpacing: '3px',
        fontFamily: '"Bangers", "Arial Black", sans-serif',
        textAlign: 'center',
        lineHeight: '1',
    });
    titleBanner.appendChild(title);

    const titleSub = document.createElement('div');
    titleSub.textContent = 'DEFENSE';
    Object.assign(titleSub.style, {
        fontSize: '38px',
        color: '#ff6b6b',
        fontWeight: 'bold',
        textShadow: `
            0 3px 0px #8B4513,
            0 5px 10px rgba(0,0,0,0.4),
            2px 2px 0 #8B4513,
            -2px -2px 0 #8B4513
        `,
        letterSpacing: '8px',
        fontFamily: '"Bangers", "Arial Black", sans-serif',
        textAlign: 'center',
        marginTop: '5px',
    });
    titleBanner.appendChild(titleSub);

    // Decorative corner badges
    const createCornerBadge = (emoji, top, left, right, bottom) => {
        const badge = document.createElement('div');
        badge.textContent = emoji;
        Object.assign(badge.style, {
            position: 'absolute',
            fontSize: '28px',
            ...(top !== null && { top: top + 'px' }),
            ...(left !== null && { left: left + 'px' }),
            ...(right !== null && { right: right + 'px' }),
            ...(bottom !== null && { bottom: bottom + 'px' }),
            filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.5))',
        });
        return badge;
    };
    titleBanner.appendChild(createCornerBadge('🎈', -15, -15, null, null));
    titleBanner.appendChild(createCornerBadge('🎯', -15, null, -15, null));
    titleBanner.appendChild(createCornerBadge('💥', null, -15, null, -15));
    titleBanner.appendChild(createCornerBadge('🏆', null, null, -15, -15));

    titleContainer.appendChild(titleBanner);
    mainMenu.appendChild(titleContainer);

    // Start button - Premium styling
    const startButton = document.createElement('button');
    startButton.textContent = '▶  PLAY';
    Object.assign(startButton.style, {
        fontSize: '28px',
        padding: '18px 70px',
        background: 'linear-gradient(180deg, #66d96a 0%, #4CAF50 30%, #388E3C 70%, #2E7D32 100%)',
        color: 'white',
        border: '4px solid #1B5E20',
        borderRadius: '50px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: `
            0 6px 0px #1B5E20, 
            0 8px 20px rgba(0,0,0,0.4),
            inset 0 2px 0 rgba(255,255,255,0.3),
            inset 0 -2px 5px rgba(0,0,0,0.2)
        `,
        transition: 'all 0.15s ease',
        fontFamily: '"Fredoka", "Arial Black", sans-serif',
        letterSpacing: '2px',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        marginTop: '20px',
    });
    startButton.onmouseover = () => {
        startButton.style.transform = 'translateY(-3px) scale(1.02)';
        startButton.style.boxShadow = `
            0 9px 0px #1B5E20, 
            0 12px 25px rgba(0,0,0,0.4),
            inset 0 2px 0 rgba(255,255,255,0.3),
            inset 0 -2px 5px rgba(0,0,0,0.2),
            0 0 30px rgba(76, 175, 80, 0.4)
        `;
        startButton.style.background = 'linear-gradient(180deg, #7ae97e 0%, #5fbf63 30%, #4CAF50 70%, #388E3C 100%)';
    };
    startButton.onmouseout = () => {
        startButton.style.transform = 'translateY(0) scale(1)';
        startButton.style.boxShadow = `
            0 6px 0px #1B5E20, 
            0 8px 20px rgba(0,0,0,0.4),
            inset 0 2px 0 rgba(255,255,255,0.3),
            inset 0 -2px 5px rgba(0,0,0,0.2)
        `;
        startButton.style.background = 'linear-gradient(180deg, #66d96a 0%, #4CAF50 30%, #388E3C 70%, #2E7D32 100%)';
    };
    startButton.onmousedown = () => {
        startButton.style.transform = 'translateY(3px) scale(0.98)';
        startButton.style.boxShadow = `
            0 2px 0px #1B5E20, 
            0 4px 10px rgba(0,0,0,0.3),
            inset 0 2px 0 rgba(255,255,255,0.3),
            inset 0 -2px 5px rgba(0,0,0,0.2)
        `;
    };
    mainMenu.appendChild(startButton);

    // Settings button - Premium styling
    const settingsButton = document.createElement('button');
    settingsButton.innerHTML = 'SETTINGS';
    Object.assign(settingsButton.style, {
        fontSize: '20px',
        padding: '12px 40px',
        background: 'linear-gradient(180deg, #8a95d9 0%, #5b6ab5 30%, #3d4a8f 70%, #2e3a6f 100%)',
        color: 'white',
        border: '4px solid #1a2550',
        borderRadius: '50px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: `
            0 5px 0px #1a2550,
            0 7px 15px rgba(0,0,0,0.4),
            inset 0 2px 0 rgba(255,255,255,0.3),
            inset 0 -2px 5px rgba(0,0,0,0.2)
        `,
        transition: 'all 0.15s ease',
        fontFamily: '"Fredoka", "Arial Black", sans-serif',
        letterSpacing: '2px',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        marginTop: '15px',
    });
    settingsButton.onmouseover = () => {
        settingsButton.style.transform = 'translateY(-3px) scale(1.02)';
        settingsButton.style.boxShadow = `
            0 8px 0px #1a2550,
            0 10px 20px rgba(0,0,0,0.4),
            inset 0 2px 0 rgba(255,255,255,0.3),
            inset 0 -2px 5px rgba(0,0,0,0.2),
            0 0 25px rgba(138, 149, 217, 0.4)
        `;
        settingsButton.style.background = 'linear-gradient(180deg, #9ba8e6 0%, #6c7dc5 30%, #4e5fa0 70%, #3a4780 100%)';
    };
    settingsButton.onmouseout = () => {
        settingsButton.style.transform = 'translateY(0) scale(1)';
        settingsButton.style.boxShadow = `
            0 5px 0px #1a2550,
            0 7px 15px rgba(0,0,0,0.4),
            inset 0 2px 0 rgba(255,255,255,0.3),
            inset 0 -2px 5px rgba(0,0,0,0.2)
        `;
        settingsButton.style.background = 'linear-gradient(180deg, #8a95d9 0%, #5b6ab5 30%, #3d4a8f 70%, #2e3a6f 100%)';
    };
    settingsButton.onmousedown = () => {
        settingsButton.style.transform = 'translateY(2px) scale(0.98)';
        settingsButton.style.boxShadow = `
            0 2px 0px #1a2550,
            0 4px 10px rgba(0,0,0,0.3),
            inset 0 2px 0 rgba(255,255,255,0.3),
            inset 0 -2px 5px rgba(0,0,0,0.2)
        `;
    };
    mainMenu.appendChild(settingsButton);

    // Instructions panel
    const instructionsPanel = document.createElement('div');
    Object.assign(instructionsPanel.style, {
        marginTop: '35px',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.25)',
        padding: '20px 40px',
        borderRadius: '15px',
        backdropFilter: 'blur(5px)',
        border: '2px solid rgba(255,255,255,0.1)',
    });

    const highScoreDisplay = document.createElement('div');
    highScoreDisplay.innerHTML = `<span style="color: #ffd700;">High Score:</span> <span style="color: #fff; font-weight: bold;">${highScore}</span>`;
    Object.assign(highScoreDisplay.style, {
        fontSize: '22px',
        marginBottom: '12px',
        fontFamily: '"Fredoka", sans-serif',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    });
    instructionsPanel.appendChild(highScoreDisplay);

    const controlsInfo = document.createElement('div');
    controlsInfo.innerHTML = `
        <span style="opacity: 0.9;">Hold mouse to shoot</span>
        <span style="margin: 0 10px; opacity: 0.5;">•</span>
        <span style="opacity: 0.9;">Pop all the balloons!</span>
    `;
    Object.assign(controlsInfo.style, {
        fontSize: '15px',
        color: '#c8f0c8',
        fontFamily: '"Fredoka", sans-serif',
    });
    instructionsPanel.appendChild(controlsInfo);

    mainMenu.appendChild(instructionsPanel);
    container.appendChild(mainMenu);

    // Weapon Selection Menu - Premium BTD style
    const weaponMenu = document.createElement('div');
    Object.assign(weaponMenu.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: `
            radial-gradient(ellipse at 50% 30%, rgba(100, 180, 70, 0.3) 0%, transparent 60%),
            linear-gradient(180deg, #5a9c4f 0%, #3d7a37 30%, #2d5a27 60%, #1a3d15 100%)
        `,
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000',
    });

    const weaponTitleBanner = document.createElement('div');
    Object.assign(weaponTitleBanner.style, {
        background: 'linear-gradient(180deg, #c4943a 0%, #8B6914 50%, #6B4F0E 100%)',
        padding: '18px 45px',
        borderRadius: '12px',
        border: '4px solid #5D4E37',
        boxShadow: '0 6px 0px #3d2e1e, 0 10px 25px rgba(0,0,0,0.4)',
        marginBottom: '35px',
    });

    const weaponTitle = document.createElement('div');
    weaponTitle.textContent = 'SELECT WEAPON';
    Object.assign(weaponTitle.style, {
        fontSize: '32px',
        color: '#ffeaa0',
        fontWeight: 'bold',
        textShadow: '0 3px 0px #8B4513, 0 5px 10px rgba(0,0,0,0.4)',
        fontFamily: '"Bangers", "Arial Black", sans-serif',
        letterSpacing: '2px',
    });
    weaponTitleBanner.appendChild(weaponTitle);
    weaponMenu.appendChild(weaponTitleBanner);

    const weaponGrid = document.createElement('div');
    Object.assign(weaponGrid.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '25px',
        maxWidth: '850px',
        padding: '10px',
    });

    // Create weapon selection cards - Premium BTD style
    Object.values(WEAPONS).forEach(weapon => {
        const card = document.createElement('div');
        Object.assign(card.style, {
            padding: '22px 25px',
            background: `
                linear-gradient(180deg, #c4943a 0%, #a67c30 15%, #8B6914 50%, #6B4F0E 100%)
            `,
            border: '4px solid #5D4E37',
            borderRadius: '15px',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            textAlign: 'center',
            boxShadow: '0 6px 0px #3d2e1e, 0 8px 20px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.15)',
            position: 'relative',
            overflow: 'hidden',
        });

        // Shine effect overlay
        const shine = document.createElement('div');
        Object.assign(shine.style, {
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.5s ease',
            pointerEvents: 'none',
        });
        card.appendChild(shine);

        const cardContent = document.createElement('div');
        cardContent.innerHTML = `
            <div style="font-size: 24px; color: #ffeaa0; font-weight: bold; margin-bottom: 10px; font-family: 'Bangers', 'Arial Black', sans-serif; letter-spacing: 1px; text-shadow: 0 2px 0 rgba(0,0,0,0.3);">
                ${weapon.name}
            </div>
            <div style="font-size: 14px; color: #e8d5a3; margin-bottom: 15px; line-height: 1.6; font-family: 'Fredoka', sans-serif;">
                ${weapon.description}
            </div>
            <div style="display: flex; justify-content: space-around; margin-top: 15px; padding-top: 12px; border-top: 2px solid rgba(255,255,255,0.15);">
                <div style="text-align: center; background: rgba(0,0,0,0.2); padding: 8px 18px; border-radius: 8px;">
                    <div style="color: #ff9999; font-size: 11px; font-weight: bold; letter-spacing: 1px; font-family: 'Fredoka', sans-serif;">DAMAGE</div>
                    <div style="color: white; font-size: 22px; font-weight: bold; font-family: 'Bangers', sans-serif;">${weapon.damage}x</div>
                </div>
                <div style="text-align: center; background: rgba(0,0,0,0.2); padding: 8px 18px; border-radius: 8px;">
                    <div style="color: #99ff99; font-size: 11px; font-weight: bold; letter-spacing: 1px; font-family: 'Fredoka', sans-serif;">FIRE RATE</div>
                    <div style="color: white; font-size: 22px; font-weight: bold; font-family: 'Bangers', sans-serif;">${(1 / weapon.fireRate).toFixed(1)}/s</div>
                </div>
            </div>
        `;
        card.appendChild(cardContent);

        card.onmouseover = () => {
            card.style.transform = 'translateY(-6px) scale(1.02)';
            card.style.boxShadow = '0 12px 0px #3d2e1e, 0 16px 35px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.2), 0 0 25px rgba(255, 215, 0, 0.3)';
            card.style.borderColor = '#ffd700';
            shine.style.left = '150%';
        };
        card.onmouseout = () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 6px 0px #3d2e1e, 0 8px 20px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.15)';
            card.style.borderColor = '#5D4E37';
            shine.style.left = '-100%';
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

    // Back button for weapon menu
    const weaponBackButton = document.createElement('button');
    weaponBackButton.innerHTML = '◀ Back';
    Object.assign(weaponBackButton.style, {
        fontSize: '18px',
        padding: '12px 40px',
        background: 'linear-gradient(180deg, #66d96a 0%, #4CAF50 50%, #388E3C 100%)',
        color: 'white',
        border: '4px solid #2E7D32',
        borderRadius: '50px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 4px 0px #1B5E20, 0 6px 15px rgba(0,0,0,0.3)',
        transition: 'all 0.15s ease',
        fontFamily: '"Fredoka", "Arial Black", sans-serif',
        letterSpacing: '2px',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        marginTop: '25px',
    });
    weaponBackButton.onmouseover = () => {
        weaponBackButton.style.transform = 'translateY(-2px)';
        weaponBackButton.style.boxShadow = '0 6px 0px #1B5E20, 0 8px 20px rgba(0,0,0,0.4)';
    };
    weaponBackButton.onmouseout = () => {
        weaponBackButton.style.transform = 'translateY(0)';
        weaponBackButton.style.boxShadow = '0 4px 0px #1B5E20, 0 6px 15px rgba(0,0,0,0.3)';
    };
    weaponMenu.appendChild(weaponBackButton);

    container.appendChild(weaponMenu);

    // Settings Menu - Premium BTD style
    const settingsMenu = document.createElement('div');
    Object.assign(settingsMenu.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: `
            radial-gradient(ellipse at 50% 30%, rgba(100, 140, 180, 0.3) 0%, transparent 60%),
            linear-gradient(180deg, #4a5a7f 0%, #364a6f 30%, #253550 60%, #1a2540 100%)
        `,
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000',
    });

    const settingsPanel = document.createElement('div');
    Object.assign(settingsPanel.style, {
        background: 'linear-gradient(180deg, #c4943a 0%, #8B6914 50%, #6B4F0E 100%)',
        padding: '40px 60px',
        borderRadius: '20px',
        border: '5px solid #5D4E37',
        boxShadow: '0 8px 0px #3d2e1e, 0 15px 40px rgba(0,0,0,0.6)',
        textAlign: 'center',
        maxWidth: '500px',
    });

    const settingsTitle = document.createElement('div');
    settingsTitle.textContent = 'SETTINGS';
    Object.assign(settingsTitle.style, {
        fontSize: '38px',
        color: '#ffeaa0',
        fontWeight: 'bold',
        marginBottom: '30px',
        textShadow: '0 3px 0px #8B4513, 0 5px 15px rgba(0,0,0,0.4)',
        fontFamily: '"Bangers", "Arial Black", sans-serif',
        letterSpacing: '2px',
    });
    settingsPanel.appendChild(settingsTitle);

    // Gravity control
    const gravityContainer = document.createElement('div');
    Object.assign(gravityContainer.style, {
        marginBottom: '25px',
        textAlign: 'left',
    });

    const gravityLabel = document.createElement('div');
    gravityLabel.textContent = 'Gravity:';
    Object.assign(gravityLabel.style, {
        fontSize: '18px',
        color: '#ffeaa0',
        fontWeight: 'bold',
        marginBottom: '10px',
        fontFamily: '"Fredoka", sans-serif',
    });
    gravityContainer.appendChild(gravityLabel);

    const gravitySlider = document.createElement('input');
    gravitySlider.type = 'range';
    gravitySlider.min = '-20';
    gravitySlider.max = '0';
    gravitySlider.step = '0.1';
    gravitySlider.value = getGravity().toString();
    Object.assign(gravitySlider.style, {
        width: '100%',
        height: '8px',
        borderRadius: '5px',
        outline: 'none',
        background: 'linear-gradient(90deg, #ff6b6b 0%, #ffeaa0 100%)',
        cursor: 'pointer',
    });
    gravityContainer.appendChild(gravitySlider);

    const gravityValue = document.createElement('div');
    gravityValue.textContent = `${getGravity().toFixed(1)} m/s²`;
    Object.assign(gravityValue.style, {
        fontSize: '16px',
        color: '#e8d5a3',
        marginTop: '8px',
        fontFamily: '"Fredoka", sans-serif',
    });
    gravityContainer.appendChild(gravityValue);

    settingsPanel.appendChild(gravityContainer);

    // Balloon size control
    const sizeContainer = document.createElement('div');
    Object.assign(sizeContainer.style, {
        marginBottom: '30px',
        textAlign: 'left',
    });

    const sizeLabel = document.createElement('div');
    sizeLabel.textContent = 'Balloon Size:';
    Object.assign(sizeLabel.style, {
        fontSize: '18px',
        color: '#ffeaa0',
        fontWeight: 'bold',
        marginBottom: '10px',
        fontFamily: '"Fredoka", sans-serif',
    });
    sizeContainer.appendChild(sizeLabel);

    const sizeSlider = document.createElement('input');
    sizeSlider.type = 'range';
    sizeSlider.min = '0.5';
    sizeSlider.max = '2.0';
    sizeSlider.step = '0.1';
    sizeSlider.value = getBalloonSize().toString();
    Object.assign(sizeSlider.style, {
        width: '100%',
        height: '8px',
        borderRadius: '5px',
        outline: 'none',
        background: 'linear-gradient(90deg, #4ecdc4 0%, #ff6b6b 100%)',
        cursor: 'pointer',
    });
    sizeContainer.appendChild(sizeSlider);

    const sizeValue = document.createElement('div');
    sizeValue.textContent = `${getBalloonSize().toFixed(1)}x`;
    Object.assign(sizeValue.style, {
        fontSize: '16px',
        color: '#e8d5a3',
        marginTop: '8px',
        fontFamily: '"Fredoka", sans-serif',
    });
    sizeContainer.appendChild(sizeValue);

    settingsPanel.appendChild(sizeContainer);

    // Base speed control
    const speedContainer = document.createElement('div');
    Object.assign(speedContainer.style, {
        marginBottom: '30px',
        textAlign: 'left',
    });

    const speedLabel = document.createElement('div');
    speedLabel.textContent = 'Base Speed:';
    Object.assign(speedLabel.style, {
        fontSize: '18px',
        color: '#ffeaa0',
        fontWeight: 'bold',
        marginBottom: '10px',
        fontFamily: '"Fredoka", sans-serif',
    });
    speedContainer.appendChild(speedLabel);

    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '0.5';
    speedSlider.max = '3.0';
    speedSlider.step = '0.1';
    speedSlider.value = getBaseSpeed().toString();
    Object.assign(speedSlider.style, {
        width: '100%',
        height: '8px',
        borderRadius: '5px',
        outline: 'none',
        background: 'linear-gradient(90deg, #45b7d1 0%, #f9ca24 100%)',
        cursor: 'pointer',
    });
    speedContainer.appendChild(speedSlider);

    const speedValue = document.createElement('div');
    speedValue.textContent = `${getBaseSpeed().toFixed(1)}x`;
    Object.assign(speedValue.style, {
        fontSize: '16px',
        color: '#e8d5a3',
        marginTop: '8px',
        fontFamily: '"Fredoka", sans-serif',
    });
    speedContainer.appendChild(speedValue);

    settingsPanel.appendChild(speedContainer);

    // Spawn direction control
    const spawnContainer = document.createElement('div');
    Object.assign(spawnContainer.style, {
        marginBottom: '25px',
        textAlign: 'left',
    });

    const spawnLabel = document.createElement('div');
    spawnLabel.textContent = 'Spawn Direction:';
    Object.assign(spawnLabel.style, {
        fontSize: '18px',
        color: '#ffeaa0',
        fontWeight: 'bold',
        marginBottom: '10px',
        fontFamily: '"Fredoka", sans-serif',
    });
    spawnContainer.appendChild(spawnLabel);

    const spawnControlContainer = document.createElement('div');
    Object.assign(spawnControlContainer.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(0,0,0,0.2)',
        padding: '10px',
        borderRadius: '12px',
    });

    const spawnOptions = [ 'random', 'left', 'right'];
    const spawnLabels = { 'random': 'Random', 'left': 'Left', 'right': 'Right' };
    let currentSpawnIndex = spawnOptions.indexOf(getSpawnDirection());

    const spawnLeftArrow = document.createElement('button');
    spawnLeftArrow.textContent = '◀';
    Object.assign(spawnLeftArrow.style, {
        fontSize: '20px',
        padding: '8px 15px',
        background: 'linear-gradient(180deg, #888 0%, #666 50%, #555 100%)',
        color: 'white',
        border: '3px solid #333',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 3px 0px #222, 0 4px 10px rgba(0,0,0,0.3)',
        transition: 'all 0.15s ease',
    });

    const spawnValueDisplay = document.createElement('div');
    spawnValueDisplay.textContent = spawnLabels[getSpawnDirection()];
    Object.assign(spawnValueDisplay.style, {
        flex: '1',
        fontSize: '16px',
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: '"Fredoka", sans-serif',
    });

    const spawnRightArrow = document.createElement('button');
    spawnRightArrow.textContent = '▶';
    Object.assign(spawnRightArrow.style, {
        fontSize: '20px',
        padding: '8px 15px',
        background: 'linear-gradient(180deg, #888 0%, #666 50%, #555 100%)',
        color: 'white',
        border: '3px solid #333',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 3px 0px #222, 0 4px 10px rgba(0,0,0,0.3)',
        transition: 'all 0.15s ease',
    });

    [spawnLeftArrow, spawnRightArrow].forEach(btn => {
        btn.onmouseover = () => {
            btn.style.transform = 'translateY(-2px)';
        };
        btn.onmouseout = () => {
            btn.style.transform = 'translateY(0)';
        };
    });

    spawnControlContainer.appendChild(spawnLeftArrow);
    spawnControlContainer.appendChild(spawnValueDisplay);
    spawnControlContainer.appendChild(spawnRightArrow);
    spawnContainer.appendChild(spawnControlContainer);
    settingsPanel.appendChild(spawnContainer);

    // Movement pattern control
    const patternContainer = document.createElement('div');
    Object.assign(patternContainer.style, {
        marginBottom: '30px',
        textAlign: 'left',
    });

    const patternLabel = document.createElement('div');
    patternLabel.textContent = 'Movement Pattern:';
    Object.assign(patternLabel.style, {
        fontSize: '18px',
        color: '#ffeaa0',
        fontWeight: 'bold',
        marginBottom: '10px',
        fontFamily: '"Fredoka", sans-serif',
    });
    patternContainer.appendChild(patternLabel);

    const patternControlContainer = document.createElement('div');
    Object.assign(patternControlContainer.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(0,0,0,0.2)',
        padding: '10px',
        borderRadius: '12px',
    });

    const patternOptions = ['random', 'NORMAL', 'ZIGZAG', 'SINE', 'SPIRAL', 'RISE'];
    const patternLabels = { 'random': 'Random', 'NORMAL': 'Normal', 'ZIGZAG': 'Zigzag', 'SINE': 'Sine', 'SPIRAL': 'Spiral', 'RISE': 'Rise' };
    let currentPatternIndex = patternOptions.indexOf(getMovementPattern());

    const patternLeftArrow = document.createElement('button');
    patternLeftArrow.textContent = '◀';
    Object.assign(patternLeftArrow.style, {
        fontSize: '20px',
        padding: '8px 15px',
        background: 'linear-gradient(180deg, #888 0%, #666 50%, #555 100%)',
        color: 'white',
        border: '3px solid #333',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 3px 0px #222, 0 4px 10px rgba(0,0,0,0.3)',
        transition: 'all 0.15s ease',
    });

    const patternValueDisplay = document.createElement('div');
    patternValueDisplay.textContent = patternLabels[getMovementPattern()];
    Object.assign(patternValueDisplay.style, {
        flex: '1',
        fontSize: '16px',
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: '"Fredoka", sans-serif',
    });

    const patternRightArrow = document.createElement('button');
    patternRightArrow.textContent = '▶';
    Object.assign(patternRightArrow.style, {
        fontSize: '20px',
        padding: '8px 15px',
        background: 'linear-gradient(180deg, #888 0%, #666 50%, #555 100%)',
        color: 'white',
        border: '3px solid #333',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 3px 0px #222, 0 4px 10px rgba(0,0,0,0.3)',
        transition: 'all 0.15s ease',
    });

    [patternLeftArrow, patternRightArrow].forEach(btn => {
        btn.onmouseover = () => {
            btn.style.transform = 'translateY(-2px)';
        };
        btn.onmouseout = () => {
            btn.style.transform = 'translateY(0)';
        };
    });

    patternControlContainer.appendChild(patternLeftArrow);
    patternControlContainer.appendChild(patternValueDisplay);
    patternControlContainer.appendChild(patternRightArrow);
    patternContainer.appendChild(patternControlContainer);
    settingsPanel.appendChild(patternContainer);

    // Buttons container
    const settingsButtonsContainer = document.createElement('div');
    Object.assign(settingsButtonsContainer.style, {
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        marginTop: '10px',
    });

    // Reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    Object.assign(resetButton.style, {
        fontSize: '16px',
        padding: '12px 30px',
        background: 'linear-gradient(180deg, #ff8a8a 0%, #ff6b6b 50%, #e55555 100%)',
        color: 'white',
        border: '3px solid #c44',
        borderRadius: '30px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 4px 0px #a33, 0 6px 15px rgba(0,0,0,0.3)',
        fontFamily: '"Fredoka", sans-serif',
        transition: 'all 0.15s ease',
    });
    resetButton.onmouseover = () => {
        resetButton.style.transform = 'translateY(-2px)';
        resetButton.style.boxShadow = '0 6px 0px #a33, 0 8px 20px rgba(0,0,0,0.4)';
    };
    resetButton.onmouseout = () => {
        resetButton.style.transform = 'translateY(0)';
        resetButton.style.boxShadow = '0 4px 0px #a33, 0 6px 15px rgba(0,0,0,0.3)';
    };
    settingsButtonsContainer.appendChild(resetButton);

    // Back button
    const backButton = document.createElement('button');
    backButton.innerHTML = '◀ Back';
    Object.assign(backButton.style, {
        fontSize: '16px',
        padding: '12px 30px',
        background: 'linear-gradient(180deg, #66d96a 0%, #4CAF50 50%, #388E3C 100%)',
        color: 'white',
        border: '3px solid #2E7D32',
        borderRadius: '30px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 4px 0px #1B5E20, 0 6px 15px rgba(0,0,0,0.3)',
        fontFamily: '"Fredoka", sans-serif',
        transition: 'all 0.15s ease',
        letterSpacing: '2px',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    });
    backButton.onmouseover = () => {
        backButton.style.transform = 'translateY(-2px)';
        backButton.style.boxShadow = '0 6px 0px #1B5E20, 0 8px 20px rgba(0,0,0,0.4)';
    };
    backButton.onmouseout = () => {
        backButton.style.transform = 'translateY(0)';
        backButton.style.boxShadow = '0 4px 0px #1B5E20, 0 6px 15px rgba(0,0,0,0.3)';
    };
    settingsButtonsContainer.appendChild(backButton);

    settingsPanel.appendChild(settingsButtonsContainer);
    settingsMenu.appendChild(settingsPanel);
    container.appendChild(settingsMenu);

    // Crosshair - Premium design
    const crosshair = document.createElement('div');
    Object.assign(crosshair.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '40px',
        height: '40px',
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'none',
    });

    // Create SVG crosshair
    crosshair.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" style="filter: drop-shadow(0 0 8px rgba(78, 205, 196, 0.8));">
            <circle cx="20" cy="20" r="12" fill="none" stroke="#4ecdc4" stroke-width="2" opacity="0.8"/>
            <circle cx="20" cy="20" r="3" fill="#4ecdc4"/>
            <line x1="20" y1="2" x2="20" y2="10" stroke="#4ecdc4" stroke-width="2" stroke-linecap="round"/>
            <line x1="20" y1="30" x2="20" y2="38" stroke="#4ecdc4" stroke-width="2" stroke-linecap="round"/>
            <line x1="2" y1="20" x2="10" y2="20" stroke="#4ecdc4" stroke-width="2" stroke-linecap="round"/>
            <line x1="30" y1="20" x2="38" y2="20" stroke="#4ecdc4" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
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
        fontFamily: '"Fredoka", Arial, sans-serif',
    });
    container.appendChild(hudContainer);

    // Score and stats panel - Premium BTD wood style
    const statsPanel = document.createElement('div');
    Object.assign(statsPanel.style, {
        position: 'absolute',
        top: '15px',
        left: '15px',
        padding: '15px 22px',
        background: 'linear-gradient(180deg, #c4943a 0%, #a67c30 20%, #8B6914 50%, #6B4F0E 100%)',
        borderRadius: '12px',
        border: '4px solid #5D4E37',
        boxShadow: '0 5px 0px #3d2e1e, 0 8px 20px rgba(0, 0, 0, 0.5), inset 0 2px 0 rgba(255,255,255,0.15)',
        minWidth: '180px',
    });

    const scoreDiv = document.createElement('div');
    scoreDiv.innerHTML = `💰 Score: <span style="color: #fff;">${score}</span>`;
    Object.assign(scoreDiv.style, {
        fontSize: '20px',
        color: '#ffeaa0',
        fontWeight: 'bold',
        textShadow: '0 2px 3px rgba(0,0,0,0.4)',
        marginBottom: '6px',
    });
    statsPanel.appendChild(scoreDiv);

    const highScoreDiv = document.createElement('div');
    highScoreDiv.innerHTML = `🏆 Best: <span style="color: #e8d5a3;">${highScore}</span>`;
    Object.assign(highScoreDiv.style, {
        fontSize: '14px',
        color: '#e8d5a3',
        marginBottom: '8px',
    });
    statsPanel.appendChild(highScoreDiv);

    const comboDiv = document.createElement('div');
    comboDiv.textContent = '';
    Object.assign(comboDiv.style, {
        fontSize: '18px',
        color: '#ff6b6b',
        fontWeight: 'bold',
        marginTop: '8px',
        textShadow: '0 0 10px rgba(255, 107, 107, 0.6)',
    });
    statsPanel.appendChild(comboDiv);

    const weaponDiv = document.createElement('div');
    Object.assign(weaponDiv.style, {
        fontSize: '13px',
        color: '#c8f0c8',
        marginTop: '10px',
        paddingTop: '10px',
        borderTop: '2px solid rgba(255,255,255,0.15)',
    });
    statsPanel.appendChild(weaponDiv);

    // Wave info (integrated into stats panel)
    const waveDivider = document.createElement('div');
    Object.assign(waveDivider.style, {
        marginTop: '10px',
        paddingTop: '10px',
        borderTop: '2px solid rgba(255,255,255,0.15)',
    });

    const waveNumDiv = document.createElement('div');
    waveNumDiv.innerHTML = '🌊 <span style="color: #ffeaa0;">WAVE 1</span>';
    Object.assign(waveNumDiv.style, {
        fontSize: '17px',
        color: '#ffd700',
        fontWeight: 'bold',
        marginBottom: '4px',
    });
    waveDivider.appendChild(waveNumDiv);

    const balloonsRemainingDiv = document.createElement('div');
    balloonsRemainingDiv.innerHTML = '<span style="color: #e8d5a3;">0 left to pop</span>';
    Object.assign(balloonsRemainingDiv.style, {
        fontSize: '14px',
        color: '#e8d5a3',
    });
    waveDivider.appendChild(balloonsRemainingDiv);

    statsPanel.appendChild(waveDivider);
    hudContainer.appendChild(statsPanel);

    // Lives display - Premium BTD style
    const livesDiv = document.createElement('div');
    livesDiv.innerHTML = `❤️ Lives: <span style="color: #fff;">${lives}</span>`;
    Object.assign(livesDiv.style, {
        position: 'absolute',
        top: '15px',
        right: '15px',
        fontSize: '20px',
        color: '#ff6b6b',
        fontWeight: 'bold',
        textShadow: '0 2px 3px rgba(0,0,0,0.4)',
        padding: '15px 22px',
        background: 'linear-gradient(180deg, #c4943a 0%, #a67c30 20%, #8B6914 50%, #6B4F0E 100%)',
        borderRadius: '12px',
        border: '4px solid #5D4E37',
        boxShadow: '0 5px 0px #3d2e1e, 0 8px 20px rgba(0, 0, 0, 0.5), inset 0 2px 0 rgba(255,255,255,0.15)',
    });
    hudContainer.appendChild(livesDiv);



    // Hint text
    const hintDiv = document.createElement('div');
    hintDiv.textContent = '⏸️ Press ESC to pause';
    Object.assign(hintDiv.style, {
        position: 'absolute',
        bottom: '25px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '14px',
        color: 'rgba(255,255,255,0.7)',
        textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        background: 'rgba(0,0,0,0.3)',
        padding: '8px 20px',
        borderRadius: '20px',
        backdropFilter: 'blur(5px)',
    });
    hudContainer.appendChild(hintDiv);

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

    // Flash Overlay for high combos
    const flashOverlay = document.createElement('div');
    Object.assign(flashOverlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '500', // Below menus but above game
        opacity: '0',
        transition: 'opacity 0.1s ease-out'
    });
    container.appendChild(flashOverlay);

    // Combo Meter (under stats panel)
    const comboMeterContainer = document.createElement('div');
    Object.assign(comboMeterContainer.style, {
        width: '100%',
        height: '6px',
        background: 'rgba(0,0,0,0.3)',
        marginTop: '8px',
        borderRadius: '3px',
        overflow: 'hidden',
        display: 'none' // Hidden by default
    });

    const comboMeterFill = document.createElement('div');
    Object.assign(comboMeterFill.style, {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, #ff9900, #ffcc00)',
        transition: 'width 0.1s linear'
    });
    comboMeterContainer.appendChild(comboMeterFill);
    statsPanel.appendChild(comboMeterContainer);

    // Pause menu - Premium styling
    const pauseMenu = document.createElement('div');
    Object.assign(pauseMenu.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)',
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '999',
        backdropFilter: 'blur(5px)',
    });

    const pausePanel = document.createElement('div');
    Object.assign(pausePanel.style, {
        background: 'linear-gradient(180deg, #c4943a 0%, #8B6914 50%, #6B4F0E 100%)',
        padding: '40px 60px',
        borderRadius: '20px',
        border: '5px solid #5D4E37',
        boxShadow: '0 8px 0px #3d2e1e, 0 15px 40px rgba(0,0,0,0.6)',
        textAlign: 'center',
    });

    const pauseTitle = document.createElement('div');
    pauseTitle.textContent = '⏸PAUSED';
    Object.assign(pauseTitle.style, {
        fontSize: '42px',
        color: '#ffeaa0',
        fontWeight: 'bold',
        marginBottom: '35px',
        textShadow: '0 3px 0px #8B4513, 0 5px 15px rgba(0,0,0,0.4)',
        fontFamily: '"Bangers", "Arial Black", sans-serif',
        letterSpacing: '2px',
    });
    pausePanel.appendChild(pauseTitle);

    const resumeButton = document.createElement('button');
    resumeButton.textContent = '▶ RESUME';
    Object.assign(resumeButton.style, {
        fontSize: '20px',
        padding: '14px 45px',
        background: 'linear-gradient(180deg, #66d96a 0%, #4CAF50 50%, #388E3C 100%)',
        color: 'white',
        border: '3px solid #2E7D32',
        borderRadius: '30px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginBottom: '15px',
        boxShadow: '0 4px 0px #1B5E20, 0 6px 15px rgba(0,0,0,0.3)',
        fontFamily: '"Fredoka", sans-serif',
        transition: 'all 0.15s ease',
        display: 'block',
        width: '100%',
    });
    resumeButton.onmouseover = () => {
        resumeButton.style.transform = 'translateY(-2px)';
        resumeButton.style.boxShadow = '0 6px 0px #1B5E20, 0 8px 20px rgba(0,0,0,0.4)';
    };
    resumeButton.onmouseout = () => {
        resumeButton.style.transform = 'translateY(0)';
        resumeButton.style.boxShadow = '0 4px 0px #1B5E20, 0 6px 15px rgba(0,0,0,0.3)';
    };
    pausePanel.appendChild(resumeButton);

    const restartButton = document.createElement('button');
    restartButton.textContent = 'RESTART';
    Object.assign(restartButton.style, {
        fontSize: '20px',
        padding: '14px 45px',
        background: 'linear-gradient(180deg, #ff8a8a 0%, #ff6b6b 50%, #e55555 100%)',
        color: 'white',
        border: '3px solid #c44',
        borderRadius: '30px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 4px 0px #a33, 0 6px 15px rgba(0,0,0,0.3)',
        fontFamily: '"Fredoka", sans-serif',
        transition: 'all 0.15s ease',
        display: 'block',
        width: '100%',
    });
    restartButton.onmouseover = () => {
        restartButton.style.transform = 'translateY(-2px)';
        restartButton.style.boxShadow = '0 6px 0px #a33, 0 8px 20px rgba(0,0,0,0.4)';
    };
    restartButton.onmouseout = () => {
        restartButton.style.transform = 'translateY(0)';
        restartButton.style.boxShadow = '0 4px 0px #a33, 0 6px 15px rgba(0,0,0,0.3)';
    };
    pausePanel.appendChild(restartButton);

    pauseMenu.appendChild(pausePanel);
    container.appendChild(pauseMenu);

    // Game over screen - Premium styling
    const gameOverScreen = document.createElement('div');
    Object.assign(gameOverScreen.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at center, rgba(40,0,0,0.9) 0%, rgba(20,0,0,0.98) 100%)',
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000',
    });

    const gameOverPanel = document.createElement('div');
    Object.assign(gameOverPanel.style, {
        background: 'linear-gradient(180deg, #c4943a 0%, #8B6914 50%, #6B4F0E 100%)',
        padding: '45px 70px',
        borderRadius: '20px',
        border: '5px solid #5D4E37',
        boxShadow: '0 8px 0px #3d2e1e, 0 15px 40px rgba(0,0,0,0.6)',
        textAlign: 'center',
    });

    const gameOverTitle = document.createElement('div');
    gameOverTitle.textContent = '💥 GAME OVER';
    Object.assign(gameOverTitle.style, {
        fontSize: '48px',
        color: '#ff6b6b',
        fontWeight: 'bold',
        marginBottom: '25px',
        textShadow: '0 4px 0px #8B4513, 0 0 30px rgba(255, 107, 107, 0.6)',
        fontFamily: '"Bangers", "Arial Black", sans-serif',
        letterSpacing: '2px',
    });
    gameOverPanel.appendChild(gameOverTitle);

    const finalScoreDiv = document.createElement('div');
    Object.assign(finalScoreDiv.style, {
        fontSize: '28px',
        color: '#ffeaa0',
        marginBottom: '35px',
        fontFamily: '"Fredoka", sans-serif',
        textShadow: '0 2px 4px rgba(0,0,0,0.4)',
    });
    gameOverPanel.appendChild(finalScoreDiv);

    const playAgainButton = document.createElement('button');
    playAgainButton.textContent = 'PLAY AGAIN';
    Object.assign(playAgainButton.style, {
        fontSize: '22px',
        padding: '16px 50px',
        background: 'linear-gradient(180deg, #66d96a 0%, #4CAF50 50%, #388E3C 100%)',
        color: 'white',
        border: '4px solid #2E7D32',
        borderRadius: '35px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 5px 0px #1B5E20, 0 8px 20px rgba(0,0,0,0.4)',
        fontFamily: '"Fredoka", sans-serif',
        transition: 'all 0.15s ease',
    });
    playAgainButton.onmouseover = () => {
        playAgainButton.style.transform = 'translateY(-2px)';
        playAgainButton.style.boxShadow = '0 7px 0px #1B5E20, 0 10px 25px rgba(0,0,0,0.5)';
    };
    playAgainButton.onmouseout = () => {
        playAgainButton.style.transform = 'translateY(0)';
        playAgainButton.style.boxShadow = '0 5px 0px #1B5E20, 0 8px 20px rgba(0,0,0,0.4)';
    };
    gameOverPanel.appendChild(playAgainButton);

    gameOverScreen.appendChild(gameOverPanel);
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
        lives = 10;
        updateScore();
        updateWaveDisplay();
        updateLives();
        updateWeaponDisplay();
    }

    function updateWeaponDisplay() {
        const weapon = getCurrentWeapon();
        weaponDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 3px;">${weapon.name}</div>
            <div style="font-size: 11px; opacity: 0.85;">${weapon.damage}x DMG | ${(1 / weapon.fireRate).toFixed(1)}/s</div>
        `;
    }

    function updateScore() {
        scoreDiv.innerHTML = `Score: <span style="color: #fff;">${score}</span>`;
        highScoreDiv.innerHTML = `Best: <span style="color: #e8d5a3;">${highScore}</span>`;
        if (combo > 1) {
            comboDiv.innerHTML = `<span style="color: #ffcc00;">${combo}x</span> COMBO!`;
            comboDiv.style.display = 'block';
        } else {
            comboDiv.style.display = 'none';
        }
    }

    function addScore(points) {
        const now = Date.now();
        if (now - lastHitTime < COMBO_WINDOW) {
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

        return { combo, multiplier };
    }

    function updateComboTimer() {
        if (combo > 1) {
            const now = Date.now();
            const timeRemaining = Math.max(0, COMBO_WINDOW - (now - lastHitTime));
            const pct = (timeRemaining / COMBO_WINDOW) * 100;

            comboMeterContainer.style.display = 'block';
            comboMeterFill.style.width = pct + '%';

            // Color shift based on time
            if (pct < 30) comboMeterFill.style.background = '#ff4444';
            else if (pct < 60) comboMeterFill.style.background = '#ffbb33';
            else comboMeterFill.style.background = 'linear-gradient(90deg, #ff9900, #ffcc00)';

            if (timeRemaining <= 0) {
                combo = 0;
                multiplier = 1;
                updateScore();
            }
        } else {
            comboMeterContainer.style.display = 'none';
        }
    }

    function triggerScreenFlash(color = 'white') {
        flashOverlay.style.transition = 'none';
        flashOverlay.style.backgroundColor = color;
        flashOverlay.style.opacity = '0.3';

        requestAnimationFrame(() => {
            flashOverlay.style.transition = 'opacity 0.4s ease-out';
            flashOverlay.style.opacity = '0';
        });
    }

    function updateLives() {
        livesDiv.innerHTML = `❤️ Lives: <span style="color: #fff;">${lives}</span>`;
        if (lives <= 5) {
            livesDiv.style.animation = 'pulse 0.5s infinite';
            livesDiv.style.color = '#ff4444';
        }
    }

    function loseLife(damage = 1) {
        lives -= damage;
        updateLives();

        // Play lose life sound
        audioManager.playLoseLife();

        // Play low lives warning sound when dropping below 5 lives (only once)
        if (lives <= 5 && lives > 0 && !lowLivesWarningPlayed) {
            lowLivesWarningPlayed = true;
            audioManager.playLowLives();
        }

        if (lives <= 0) {
            gameOver();
        }
        showLifeLostWarning();
    }

    function addLives(amount = 1) {
        lives += amount;
        updateLives();

        // Reset low lives warning flag if we're above 5 lives now
        if (lives > 5) {
            lowLivesWarningPlayed = false;
        }
    }

    function showLifeLostWarning() {
        const warning = document.createElement('div');
        warning.innerHTML = 'BALLOON ESCAPED!!';
        Object.assign(warning.style, {
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '42px',
            color: '#ff6b6b',
            fontWeight: 'bold',
            textShadow: '0 4px 0px #8B4513, 0 0 30px rgba(255, 107, 107, 0.6)',
            animation: 'zoomFadeOut 2s forwards',
            zIndex: '900',
            whiteSpace: 'nowrap',
            fontFamily: '"Bangers", "Arial Black", sans-serif',
            letterSpacing: '2px',
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

        // Play game over sound
        audioManager.playGameOver();

        hudContainer.style.display = 'none';
        crosshair.style.display = 'none';
        gameOverScreen.style.display = 'flex';
        finalScoreDiv.textContent = `Final Score: ${score}${score >= highScore ? ' NEW HIGH SCORE!' : ''}`;
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

    // Weapon menu back button
    weaponBackButton.addEventListener('click', () => {
        weaponMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
    });

    // Settings event listeners
    settingsButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        settingsMenu.style.display = 'flex';
    });

    gravitySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        setGravity(value);
        gravityValue.textContent = `${value.toFixed(1)} m/s²`;
    });

    sizeSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        setBalloonSize(value);
        sizeValue.textContent = `${value.toFixed(1)}x`;
    });

    speedSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        setBaseSpeed(value);
        speedValue.textContent = `${value.toFixed(1)}x`;
    });

    // Spawn direction arrow listeners
    spawnLeftArrow.addEventListener('click', () => {
        currentSpawnIndex = (currentSpawnIndex - 1 + spawnOptions.length) % spawnOptions.length;
        const newValue = spawnOptions[currentSpawnIndex];
        setSpawnDirection(newValue);
        spawnValueDisplay.textContent = spawnLabels[newValue];
    });

    spawnRightArrow.addEventListener('click', () => {
        currentSpawnIndex = (currentSpawnIndex + 1) % spawnOptions.length;
        const newValue = spawnOptions[currentSpawnIndex];
        setSpawnDirection(newValue);
        spawnValueDisplay.textContent = spawnLabels[newValue];
    });

    // Movement pattern arrow listeners
    patternLeftArrow.addEventListener('click', () => {
        currentPatternIndex = (currentPatternIndex - 1 + patternOptions.length) % patternOptions.length;
        const newValue = patternOptions[currentPatternIndex];
        setMovementPattern(newValue);
        patternValueDisplay.textContent = patternLabels[newValue];
    });

    patternRightArrow.addEventListener('click', () => {
        currentPatternIndex = (currentPatternIndex + 1) % patternOptions.length;
        const newValue = patternOptions[currentPatternIndex];
        setMovementPattern(newValue);
        patternValueDisplay.textContent = patternLabels[newValue];
    });

    resetButton.addEventListener('click', () => {
        resetConfig();
        gravitySlider.value = getGravity().toString();
        gravityValue.textContent = `${getGravity().toFixed(1)} m/s²`;
        sizeSlider.value = getBalloonSize().toString();
        sizeValue.textContent = `${getBalloonSize().toFixed(1)}x`;
        speedSlider.value = getBaseSpeed().toString();
        speedValue.textContent = `${getBaseSpeed().toFixed(1)}x`;

        // Reset spawn direction display
        currentSpawnIndex = spawnOptions.indexOf(getSpawnDirection());
        spawnValueDisplay.textContent = spawnLabels[getSpawnDirection()];

        // Reset movement pattern display
        currentPatternIndex = patternOptions.indexOf(getMovementPattern());
        patternValueDisplay.textContent = patternLabels[getMovementPattern()];
    });

    backButton.addEventListener('click', () => {
        settingsMenu.style.display = 'none';
        mainMenu.style.display = 'flex';
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
        @keyframes floatUp {
            0% { transform: translateY(0); opacity: 0.6; }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            100% { transform: translateY(-120vh); opacity: 0; }
        }
        @keyframes gentlePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
    `;
    document.head.appendChild(style);

    // Wave display functions
    function updateWaveDisplay() {
        waveNumDiv.innerHTML = ` <span style="color: #ffeaa0;">WAVE ${currentWaveNum}</span>`;
        balloonsRemainingDiv.innerHTML = `<span style="color: #e8d5a3;">${balloonsRemaining} left to pop</span>`;
    }

    function showWaveStart(waveNum, description) {
        currentWaveNum = waveNum;
        updateWaveDisplay();

        // Play new wave sound
        audioManager.playNewWave();

        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="font-size: 52px; margin-bottom: 10px; font-family: 'Bangers', 'Arial Black', sans-serif; letter-spacing: 3px;"> WAVE ${waveNum}</div>
            <div style="font-size: 22px; opacity: 0.95; font-family: 'Fredoka', sans-serif;">${description}</div>
        `;
        Object.assign(notification.style, {
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffeaa0',
            fontWeight: 'bold',
            textShadow: '0 4px 0px #8B4513, 0 6px 15px rgba(0,0,0,0.5)',
            textAlign: 'center',
            animation: 'waveNotification 2.5s forwards',
            zIndex: '900',
            pointerEvents: 'none',
            background: 'rgba(0,0,0,0.3)',
            padding: '25px 50px',
            borderRadius: '20px',
            backdropFilter: 'blur(5px)',
        });
        container.appendChild(notification);
        setTimeout(() => notification.remove(), 2500);
    }

    function updateBalloonsRemaining(count) {
        balloonsRemaining = count;
        updateWaveDisplay();
    }

    // Graffiti Text Container
    const graffitiContainer = document.createElement('div');
    Object.assign(graffitiContainer.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden'
    });
    container.appendChild(graffitiContainer);

    // ... (rest of UI setup)

    function showGraffitiText(text, x, y) {
        const el = document.createElement('div');
        el.textContent = text;
        const rotation = (Math.random() - 0.5) * 30;
        const color = ['#ff6b6b', '#4ecdc4', '#ffeaa0', '#ff9ff3'][Math.floor(Math.random() * 4)];

        // Randomize float direction (up or down)
        const floatDirection = Math.random() > 0.5 ? -1 : 1;
        const floatDistance = 100 + Math.random() * 50;

        Object.assign(el.style, {
            position: 'absolute',
            left: x + 'px',
            top: y + 'px',
            transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(0)`,
            fontSize: '48px',
            fontFamily: '"Bangers", cursive',
            color: color,
            textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            zIndex: '800',
            // Added 'top' to transition for smooth movement
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.27), opacity 0.5s ease-in, top 0.8s ease-out',
            opacity: '1'
        });

        graffitiContainer.appendChild(el);

        // Pop in
        requestAnimationFrame(() => {
            el.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1.2)`;
        });

        // Float and fade
        setTimeout(() => {
            el.style.top = (y + (floatDistance * floatDirection)) + 'px';
            el.style.opacity = '0';
        }, 100);

        // Cleanup
        setTimeout(() => {
            el.remove();
        }, 800);
    }

    return {
        setScore: (newScore) => { score = newScore; updateScore(); },
        getScore: () => score,
        addScore,
        loseLife,
        addLives,
        showSpawnWarning,
        isGameStarted: () => gameStarted,
        isGamePaused: () => gamePaused,
        showWaveStart,
        updateBalloonsRemaining,
        updateComboTimer,
        showGraffitiText,
        crosshair,
        scoreDiv,
        hintDiv
    };
}
