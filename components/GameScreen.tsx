import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ALL_COLORS, BASE_COLORS, COLORS, GAME_CONFIG, SCREEN_HEIGHT } from '../constants/GameConfig';
import { useGameLoop } from '../hooks/useGameLoop';
import { ColorPaddle } from './ColorPaddle';
import { FallingBall } from './FallingBall';

export const GameScreen = () => {
    const { isPlaying, isGameOver, score, gameSpeed, startGame, endGame, incrementScore } = useGameLoop();
    const [paddleRotation, setPaddleRotation] = useState(0); // 0, 1, 2, ...
    const [balls, setBalls] = useState<{ id: string; color: string; speed: number }[]>([]);

    // Track score/mode in ref for interval closure
    const scoreRef = useRef(score);
    useEffect(() => { scoreRef.current = score; }, [score]);

    // Handle Rotation Tap
    const handleTap = () => {
        if (!isPlaying) return;
        setPaddleRotation(prev => prev + 1);
    };

    // Determine active color at top based on rotation
    const getActiveColor = (rot: number) => {
        const isHard = scoreRef.current >= 20;

        if (isHard) {
            // Hard Mode (4 Segments): Red, Blue, Green, Yellow (CW on Paddle)
            // Top Color Sequence (as paddle rotates CW): Red -> Yellow -> Green -> Blue
            const index = rot % 4;
            if (index === 0) return COLORS.RED;
            if (index === 1) return COLORS.YELLOW;
            if (index === 2) return COLORS.GREEN;
            return COLORS.BLUE;
        } else {
            // Normal Mode (3 Segments): Red, Blue, Green (CW on Paddle)
            // Top Color Sequence: Red -> Blue -> Green
            const index = rot % 3;
            if (index === 0) return COLORS.RED;
            if (index === 1) return COLORS.BLUE;
            return COLORS.GREEN;
        }
    };

    // Spawning Logic
    useEffect(() => {
        if (!isPlaying) {
            setBalls([]);
            return;
        }

        const intervalMs = GAME_CONFIG.SPAWN_INTERVAL / Math.sqrt(gameSpeed); // Spawn faster as speed increases

        const spawner = setInterval(() => {
            const isHard = scoreRef.current >= 20;
            const currentPool = isHard ? ALL_COLORS : BASE_COLORS;
            const randomColor = currentPool[Math.floor(Math.random() * currentPool.length)];

            const newBall = {
                id: Date.now().toString() + Math.random(),
                color: randomColor,
                speed: gameSpeed,
            };
            setBalls(prev => [...prev, newBall]);
        }, intervalMs);

        return () => clearInterval(spawner);
    }, [isPlaying, gameSpeed]); // Intentionally omitting score to avoid interval reset jitter

    // Ref strategy for rotation to keep callback stable-ish
    const rotationRef = useRef(paddleRotation);
    useEffect(() => { rotationRef.current = paddleRotation; }, [paddleRotation]);

    const onBallHit = (id: string, color: string) => {
        if (!isPlaying) return;

        // Note: getActiveColor uses scoreRef.current, which is synced.
        // rotationRef.current is also synced.
        const activeColor = getActiveColor(rotationRef.current);

        if (activeColor === color) {
            incrementScore();
        } else {
            endGame();
        }

        setBalls(prev => prev.filter(b => b.id !== id));
    };

    const isHardMode = score >= 20;

    return (
        <TouchableOpacity activeOpacity={1} style={styles.container} onPress={handleTap}>
            {/* Score */}
            <View style={styles.scoreContainer}>
                <Text style={styles.score}>{score}</Text>
            </View>

            {/* Paddle Area */}
            <View style={[styles.paddleContainer, { top: GAME_CONFIG.PADDLE_Y_POS - GAME_CONFIG.PADDLE_SIZE / 2 }]}>
                <ColorPaddle rotation={paddleRotation} mode={isHardMode ? 'hard' : 'normal'} />
            </View>

            {/* Balls */}
            {balls.map(ball => (
                <FallingBall
                    key={ball.id}
                    id={ball.id}
                    color={ball.color}
                    speed={ball.speed}
                    onHit={onBallHit}
                    gameHeight={SCREEN_HEIGHT}
                />
            ))}

            {/* Game Over / Start UI */}
            {!isPlaying && (
                <View style={styles.overlay}>
                    <Text style={styles.title}>COLOR SWITCHER</Text>
                    {isGameOver && <Text style={styles.gameOver}>GAME OVER</Text>}
                    {isGameOver && <Text style={styles.finalScore}>Score: {score}</Text>}

                    <TouchableOpacity style={styles.btn} onPress={startGame}>
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
