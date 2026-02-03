import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ColorPaddle } from './ColorPaddle';
import { FallingBall } from './FallingBall';
import { useGameLoop } from '../hooks/useGameLoop';
import { COLORS, COLOR_ARRAY, GAME_CONFIG, SCREEN_HEIGHT } from '../constants/GameConfig';

export const GameScreen = () => {
    const { isPlaying, isGameOver, score, gameSpeed, startGame, endGame, incrementScore } = useGameLoop();
    const [paddleRotation, setPaddleRotation] = useState(0); // 0, 1, 2
    const [balls, setBalls] = useState<{ id: string; color: string; speed: number }[]>([]);

    // Refs for interval management to avoid closure staleness if not careful, 
    // though strict dependency arrays should handle it.

    // Handle Rotation Tap
    const handleTap = () => {
        if (!isPlaying) return;
        setPaddleRotation(prev => prev + 1);
    };

    // Determine active color at top based on rotation
    // Rotation 0: Red (Top is Red)
    // Rotation 1 (CW): Blue (Top is Blue)
    // Rotation 2 (CW): Green (Top is Green)
    // Cycle: R -> B -> G
    const getActiveColor = (rot: number) => {
        const index = rot % 3;
        if (index === 0) return COLORS.RED;
        if (index === 1) return COLORS.BLUE;
        return COLORS.GREEN;
    };

    // Spawning Logic
    useEffect(() => {
        if (!isPlaying) {
            setBalls([]);
            return;
        }

        const intervalMs = GAME_CONFIG.SPAWN_INTERVAL / Math.sqrt(gameSpeed); // Spawn faster as speed increases

        const spawner = setInterval(() => {
            const randomColor = COLOR_ARRAY[Math.floor(Math.random() * COLOR_ARRAY.length)];
            const newBall = {
                id: Date.now().toString() + Math.random(),
                color: randomColor,
                speed: gameSpeed,
            };
            setBalls(prev => [...prev, newBall]);
        }, intervalMs);

        return () => clearInterval(spawner);
    }, [isPlaying, gameSpeed]);

    // Collision Callback (Called by FallingBall when it hits target Y)
    const handleBallHit = useCallback((id: string, color: string) => {
        // Remove ball
        setBalls(prev => prev.filter(b => b.id !== id));

        // Check Match
        // We use a ref or functional update to access current rotation? 
        // Actually, since this callback is created once? No, useCallback dependencies.
        // Needs access to current 'paddleRotation'.

        // ISSUE: If we depend on paddleRotation, this callback changes every tap.
        // Passes new callback to existing balls? FallingBall memoization might miss it 
        // if not careful, but React re-renders FallingBall with new prop. 
        // Reanimated `runOnJS` calls the function passed. It should claim the latest closure.

        // BETTER: Use a ref for current rotation to avoid re-creating callback constantly
        // or just accept re-renders. FallingBall is simple.

        // Let's use the 'current' rotation from state accessor if possible, 
        // but here we are in a closure. 
        // Strategy: Use a Ref to track rotation for the callback.
    }, []);

    // Ref strategy for rotation to keep callback stable-ish or working correctly
    const rotationRef = useRef(paddleRotation);
    useEffect(() => { rotationRef.current = paddleRotation; }, [paddleRotation]);

    const onBallHit = (id: string, color: string) => {
        if (!isPlaying) return; // Ignore if game ended already

        const activeColor = getActiveColor(rotationRef.current);

        if (activeColor === color) {
            incrementScore();
        } else {
            endGame();
        }

        // Remove ball (UI cleanup)
        setBalls(prev => prev.filter(b => b.id !== id));
    };

    return (
        <TouchableOpacity activeOpacity={1} style={styles.container} onPress={handleTap}>
            {/* Score */}
            <View style={styles.scoreContainer}>
                <Text style={styles.score}>{score}</Text>
            </View>

            {/* Paddle Area */}
            <View style={[styles.paddleContainer, { top: GAME_CONFIG.PADDLE_Y_POS - GAME_CONFIG.PADDLE_SIZE / 2 }]}>
                <ColorPaddle rotation={paddleRotation} />
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
