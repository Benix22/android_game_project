import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    Easing,
    cancelAnimation
} from 'react-native-reanimated';
import { GAME_CONFIG } from '../constants/GameConfig';

interface FallingBallProps {
    id: string;
    color: string;
    speed: number;
    onHit: (id: string, color: string) => void;
    gameHeight: number;
}

export const FallingBall: React.FC<FallingBallProps> = ({ id, color, speed, onHit, gameHeight }) => {
    const translateY = useSharedValue(-GAME_CONFIG.BALL_SIZE);

    useEffect(() => {
        // Calculate duration based on distance and speed factor
        // Base speed: traversing screen in X seconds. 
        // speed is a multiplier (1 = normal, 2 = 2x faster -> half time)
        const distance = GAME_CONFIG.PADDLE_Y_POS + GAME_CONFIG.BALL_SIZE; // Target slightly below center of paddle
        const baseDuration = 3000;
        const duration = baseDuration / speed;

        translateY.value = withTiming(distance, {
            duration: duration,
            easing: Easing.linear
        }, (finished) => {
            if (finished) {
                runOnJS(onHit)(id, color);
            }
        });

        return () => {
            cancelAnimation(translateY);
        };
    }, [speed]); // Restart if speed changes? Ideally speed shouldn't change mid-fall for simplicity, but if it does, it resets. 
    // TODO: Optimizing speed change mid-flight is complex, assuming speed stays const for a spawned ball.

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View
            style={[
                styles.ball,
                { backgroundColor: color, width: GAME_CONFIG.BALL_SIZE, height: GAME_CONFIG.BALL_SIZE, borderRadius: GAME_CONFIG.BALL_SIZE / 2 },
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
