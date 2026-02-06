import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ALL_COLORS, BASE_COLORS, COLORS, GAME_CONFIG, LEVEL_THRESHOLDS, SCREEN_HEIGHT } from '../constants/GameConfig';
import { useGameLoop } from '../hooks/useGameLoop';
import { ColorPaddle } from './ColorPaddle';
import { FallingBall } from './FallingBall';
import { LevelBanner } from './LevelBanner';

export const GameScreen = () => {
    const { isPlaying, isGameOver, score, gameSpeed, startGame, endGame, incrementScore } = useGameLoop();
    const [paddleRotation, setPaddleRotation] = useState(0); // 0, 1, 2, ...
    const [rotationDirection, setRotationDirection] = useState(1); // 1 for CW, -1 for CCW
    const [isPaused, setIsPaused] = useState(false);
    const [levelText, setLevelText] = useState<string | null>(null);
    const [balls, setBalls] = useState<{ id: string; color: string; speed: number; origin: 'top' | 'bottom' }[]>([]);
    const [sound, setSound] = useState<Audio.Sound>();
    const [failSound, setFailSound] = useState<Audio.Sound>();

    useEffect(() => {
        async function loadSound() {
            try {
                const { sound: dropSound } = await Audio.Sound.createAsync(
                    require('../assets/drop.mp3')
                );
                setSound(dropSound);

                setSound(dropSound);

                const { sound: failSnd } = await Audio.Sound.createAsync(
                    require('../assets/fail.mp3')
                );
                setFailSound(failSnd);
            } catch (e) {
                console.log("Error loading sound", e);
            }
        }
        loadSound();
        return () => {
            sound?.unloadAsync();
            failSound?.unloadAsync();
        };
    }, []);

    const isHardMode = score >= LEVEL_THRESHOLDS.LEVEL_2;
    const isLevel4 = score >= (LEVEL_THRESHOLDS.LEVEL_4 || 70);
    const isLevel5 = score >= (LEVEL_THRESHOLDS.LEVEL_5 || 100);
    const isLevel6 = score >= (LEVEL_THRESHOLDS.LEVEL_6 || 120);

    // Paddle Position: Level 4 moves to center, but Level 5 returns to bottom
    const paddleY = (isLevel4 && !isLevel5) ? SCREEN_HEIGHT / 2 : GAME_CONFIG.PADDLE_Y_POS;

    // Track score/mode in ref for interval closure
    const scoreRef = useRef(score);
    useEffect(() => { scoreRef.current = score; }, [score]);

    // Pause on Level Up (Switch to 4 colors at 20 points)
    useEffect(() => {
        if (score === LEVEL_THRESHOLDS.LEVEL_2) {
            setIsPaused(true);
            setBalls([]); // Clear balls for clean slate
            setLevelText("LEVEL 2");
            const timer = setTimeout(() => {
                setIsPaused(false);
                setLevelText(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
        if (score === LEVEL_THRESHOLDS.LEVEL_3) {
            setIsPaused(true);
            setBalls([]); // Clear balls for clean slate
            setLevelText("LEVEL 3");
            const timer = setTimeout(() => {
                setIsPaused(false);
                setLevelText(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
        if (score === LEVEL_THRESHOLDS.LEVEL_4) {
            setIsPaused(true);
            setBalls([]);
            setLevelText("LEVEL 4");
            const timer = setTimeout(() => {
                setIsPaused(false);
                setLevelText(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
        if (score === LEVEL_THRESHOLDS.LEVEL_5) {
            setIsPaused(true);
            setBalls([]);
            setLevelText("LEVEL 5"); // Ghost Mode
            const timer = setTimeout(() => {
                setIsPaused(false);
                setLevelText(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
        if (score === LEVEL_THRESHOLDS.LEVEL_6) {
            setIsPaused(true);
            setIsPaused(true);
            setBalls([]);
            setLevelText("LEVEL 6");
            setRotationDirection(-1); // Start inverted for Level 6
            const timer = setTimeout(() => {
                setIsPaused(false);
                setLevelText(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [score]);

    // Handle Rotation Tap
    const handleTap = () => {
        if (!isPlaying || isPaused) return;

        // Level 6: Dynamic Rotation
        // Use the state 'rotationDirection' which defaults to 1 and flips on score in Level 6
        setPaddleRotation(prev => prev + rotationDirection);
    };

    // Determine active color at top based on rotation
    const getActiveColor = (rot: number) => {
        const isHard = scoreRef.current >= LEVEL_THRESHOLDS.LEVEL_2;

        if (isHard) {
            // Hard Mode (4 Segments): Red, Blue, Green, Yellow (CW on Paddle)
            // Top Color Sequence (as paddle rotates CW): Red -> Yellow -> Green -> Blue
            // Safe Mod for negative numbers (Mirror Mode)
            const index = ((rot % 4) + 4) % 4;
            if (index === 0) return COLORS.RED;
            if (index === 1) return COLORS.YELLOW;
            if (index === 2) return COLORS.GREEN;
            return COLORS.BLUE;
        } else {
            // Normal Mode (3 Segments): Red, Blue, Green (CW on Paddle)
            // Top Color Sequence: Red -> Blue -> Green
            const index = ((rot % 3) + 3) % 3;
            if (index === 0) return COLORS.RED;
            if (index === 1) return COLORS.BLUE;
            return COLORS.GREEN;
        }
    };

    // Spawning Logic
    useEffect(() => {
        if (!isPlaying || isPaused) {
            if (!isPaused) setBalls([]); // Only clear balls if NOT paused (i.e. game over/stopped)
            return;
        }

        const intervalMs = GAME_CONFIG.SPAWN_INTERVAL / Math.sqrt(gameSpeed); // Spawn faster as speed increases

        const spawner = setInterval(() => {
            const isHard = scoreRef.current >= LEVEL_THRESHOLDS.LEVEL_2;
            const thresholdL4 = LEVEL_THRESHOLDS.LEVEL_4 || 70;

            // STRICT check for Level 4
            let isL4 = scoreRef.current >= thresholdL4;

            if (isL4 && scoreRef.current < thresholdL4) {
                console.error("LOGIC ERROR: isL4 true but score low!", scoreRef.current);
                isL4 = false;
            }

            const currentPool = isHard ? ALL_COLORS : BASE_COLORS;
            const randomColor = currentPool[Math.floor(Math.random() * currentPool.length)];

            // Level 4: 50% chance of top or bottom, BUT Level 5 reverts to top
            const useL4Spawner = isL4 && !isLevel5;
            const origin: 'top' | 'bottom' = useL4Spawner ? (Math.random() > 0.5 ? 'bottom' : 'top') : 'top';

            const newBall = {
                id: Date.now().toString() + Math.random(),
                color: randomColor,
                speed: gameSpeed,
                origin,
            };
            setBalls(prev => [...prev, newBall]);
        }, intervalMs);

        return () => clearInterval(spawner);
    }, [isPlaying, gameSpeed, isPaused]);

    // Ref strategy for rotation to keep callback stable-ish
    const rotationRef = useRef(paddleRotation);
    useEffect(() => { rotationRef.current = paddleRotation; }, [paddleRotation]);

    const onBallHit = (id: string, color: string, origin: 'top' | 'bottom') => {
        if (!isPlaying) return;

        // Active color depends on origin
        let activeColor = '';
        if (origin === 'top') {
            activeColor = getActiveColor(rotationRef.current);
        } else {
            // Bottom Ball logic
            const rot = rotationRef.current;
            const topIndex = ((rot % 4) + 4) % 4;
            const bottomIndex = (topIndex + 2) % 4;

            if (bottomIndex === 0) activeColor = COLORS.RED;
            else if (bottomIndex === 1) activeColor = COLORS.YELLOW;
            else if (bottomIndex === 2) activeColor = COLORS.GREEN;
            else activeColor = COLORS.BLUE;
        }

        if (activeColor === color) {
            incrementScore();
            // Play Sound
            if (sound) {
                sound.replayAsync().catch(e => console.log("Sound error", e));
            }

            // Level 6: Dynamic Rotation Switch
            if (score >= (LEVEL_THRESHOLDS.LEVEL_6 || 120)) {
                setRotationDirection(prev => prev * -1);
            }
        } else {
            console.log("!!! GAME OVER !!!");
            if (failSound) {
                failSound.replayAsync().catch(e => console.log("Fail sound error", e));
            }
            endGame();
        }

        setBalls(prev => prev.filter(b => b.id !== id));
    };

    const handleStartGame = () => {
        startGame();
        setIsPaused(true);
        setRotationDirection(1); // Reset direction
        setLevelText("LEVEL 1");
        setTimeout(() => {
            setIsPaused(false);
            setLevelText(null);
        }, 2000); // 2 seconds for Level 1 banner
    };

    return (
        <TouchableOpacity activeOpacity={1} style={styles.container} onPress={handleTap}>
            {/* Score */}
            <View style={styles.scoreContainer}>
                <Text style={styles.score}>{score}</Text>
            </View>

            {/* Paddle Area */}
            <View style={[styles.paddleContainer, { top: paddleY - GAME_CONFIG.PADDLE_SIZE / 2 }]}>
                <ColorPaddle rotation={paddleRotation} mode={isHardMode ? 'hard' : 'normal'} />
            </View>

            {/* Balls */}
            {balls.map(ball => (
                <FallingBall
                    key={ball.id}
                    id={ball.id}
                    color={ball.color}
                    speed={ball.speed}
                    origin={ball.origin}
                    onHit={onBallHit}
                    gameHeight={SCREEN_HEIGHT}
                    paused={isPaused}
                    isLevel3={score >= LEVEL_THRESHOLDS.LEVEL_3 && score < (LEVEL_THRESHOLDS.LEVEL_4 || 70)}
                    paddleY={paddleY}
                    isGhost={isLevel5 && !isLevel6}
                />
            ))}

            {levelText && <LevelBanner text={levelText} />}

            {/* Game Over / Start UI */}
            {!isPlaying && (
                <View style={styles.overlay}>
                    <Text style={styles.title}>COLOR SWITCHER</Text>
                    {isGameOver && <Text style={styles.gameOver}>GAME OVER</Text>}
                    {isGameOver && <Text style={styles.finalScore}>Score: {score}</Text>}

                    <TouchableOpacity style={styles.btn} onPress={handleStartGame}>
                        <Text style={styles.btnText}>{isGameOver ? "RETRY" : "START"}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
        alignItems: 'center',
    },
    scoreContainer: {
        marginTop: 60,
    },
    score: {
        fontSize: 60,
        fontWeight: 'bold',
        color: 'white',
        opacity: 0.3,
    },
    paddleContainer: {
        position: 'absolute',
        // 'top' set dynamically
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    title: {
        fontSize: 40,
        fontWeight: '900',
        color: 'white',
        marginBottom: 20,
        letterSpacing: 2
    },
    gameOver: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#FF5E5E',
        marginBottom: 10,
    },
    finalScore: {
        fontSize: 20,
        color: 'white',
        marginBottom: 40,
    },
    btn: {
        backgroundColor: 'white',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
    },
    btnText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        letterSpacing: 1
    }
});
