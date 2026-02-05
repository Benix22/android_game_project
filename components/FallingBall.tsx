import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    Easing,
    cancelAnimation,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { ALL_COLORS, GAME_CONFIG } from '../constants/GameConfig';

interface FallingBallProps {
    id: string;
    color: string;
    speed: number;
    origin?: 'top' | 'bottom'; // New prop
    onHit: (id: string, color: string, origin: 'top' | 'bottom') => void;
    gameHeight: number;
    paused?: boolean;
    isLevel3?: boolean;
    paddleY: number;
}

export const FallingBall: React.FC<FallingBallProps> = ({ id, color, speed, origin = 'top', onHit, gameHeight, paused, isLevel3, paddleY }) => {
    // Initial position depends on origin
    const startPos = origin === 'top' ? -GAME_CONFIG.BALL_SIZE : gameHeight;
    const translateY = useSharedValue(startPos);

    // Level 3 Logic
    const [currentBallColor, setCurrentBallColor] = React.useState(color);
    const hasSwitchedColor = useSharedValue(false);

    useAnimatedReaction(
        () => translateY.value,
        (currentValue: number) => {
            if (isLevel3 && !hasSwitchedColor.value) {
                // Calculate percentage traveled
                let start = origin === 'top' ? -GAME_CONFIG.BALL_SIZE : gameHeight;
                let end = origin === 'top'
                    ? paddleY - (GAME_CONFIG.PADDLE_SIZE / 2) - GAME_CONFIG.BALL_SIZE
                    : paddleY + (GAME_CONFIG.PADDLE_SIZE / 2);

                const totalDist = Math.abs(end - start);
                const currentDist = Math.abs(currentValue - start);

                if (currentDist >= totalDist * 0.25) {
                    hasSwitchedColor.value = true;
                    runOnJS(handleColorSwitch)();
                }
            }
        }
    );

    function handleColorSwitch() {
        const pool = ALL_COLORS;
        let newColor = pool[Math.floor(Math.random() * pool.length)];
        // Ensure strictly different
        while (newColor === currentBallColor) {
            newColor = pool[Math.floor(Math.random() * pool.length)];
        }
        setCurrentBallColor(newColor);
    }

    useEffect(() => {
        if (paused) {
            cancelAnimation(translateY);
            return;
        }

        // Calculate Target based on Origin and Paddle Y
        let targetDistance = 0;
        if (origin === 'top') {
            // Falls down to Paddle Top
            targetDistance = paddleY - (GAME_CONFIG.PADDLE_SIZE / 2) - GAME_CONFIG.BALL_SIZE;
        } else {
            // Falls UP to Paddle Bottom
            targetDistance = paddleY + (GAME_CONFIG.PADDLE_SIZE / 2);
        }

        const baseDuration = 3000;
        const totalDuration = baseDuration / speed;

        const currentPos = translateY.value;
        const remainingDistance = Math.abs(targetDistance - currentPos); // Distance is absolute

        // Velocity reference
        const refDistance = gameHeight / 2;
        const refVelocity = refDistance / (1500 / speed);

        const duration = remainingDistance / refVelocity;

        if (remainingDistance <= 0) return;

        translateY.value = withTiming(targetDistance, {
            duration: duration,
            easing: Easing.linear
        }, (finished) => {
            if (finished) {
                runOnJS(onHit)(id, currentBallColor, origin);
            }
        });

        return () => {
            cancelAnimation(translateY);
        };
    }, [speed, paused, currentBallColor, origin, paddleY, gameHeight]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View
            style={[
                styles.ball,
                { backgroundColor: currentBallColor, width: GAME_CONFIG.BALL_SIZE, height: GAME_CONFIG.BALL_SIZE, borderRadius: GAME_CONFIG.BALL_SIZE / 2 },
                animatedStyle
            ]}
        />
    );
};

const styles = StyleSheet.create({
    ball: {
        position: 'absolute',
        top: 0,
        // centered horizontally handled by parent or here if we pass width
        // Assuming parent centers it:
        left: '50%',
        marginLeft: -GAME_CONFIG.BALL_SIZE / 2,
    },
});
