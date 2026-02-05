import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    Easing,
    cancelAnimation,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { GAME_CONFIG } from '../constants/GameConfig';

interface FallingBallProps {
    id: string;
    color: string;
    speed: number;
    onHit: (id: string, color: string) => void;
    gameHeight: number;
    paused?: boolean;
}

export const FallingBall: React.FC<FallingBallProps> = ({ id, color, speed, onHit, gameHeight, paused }) => {
    const translateY = useSharedValue(-GAME_CONFIG.BALL_SIZE);

    useEffect(() => {
        if (paused) {
            cancelAnimation(translateY);
            return;
        }

        // Calculate duration based on distance and speed factor
        const targetDistance = GAME_CONFIG.PADDLE_Y_POS + GAME_CONFIG.BALL_SIZE;
        const baseDuration = 3000;
        const totalDuration = baseDuration / speed; // Time to travel full distance

        // Calculate remaining distance and duration
        // logic: we want to maintain the same CONSTANT velocity.
        // Velocity = TotalDistance / TotalDuration
        // RemainingDuration = RemainingDistance / Velocity

        const currentPos = translateY.value;
        const remainingDistance = targetDistance - currentPos;

        // Guard against already finished or weird states (though < 0 usually handled by hit check/cleanup)
        if (remainingDistance <= 0) return;

        const velocity = targetDistance / totalDuration;
        const duration = remainingDistance / velocity;

        translateY.value = withTiming(targetDistance, {
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
    }, [speed, paused]);

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
