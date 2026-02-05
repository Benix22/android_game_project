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
    onHit: (id: string, color: string) => void;
    gameHeight: number;
    paused?: boolean;
    isLevel3?: boolean;
}

export const FallingBall: React.FC<FallingBallProps> = ({ id, color, speed, onHit, gameHeight, paused, isLevel3 }) => {
    const translateY = useSharedValue(-GAME_CONFIG.BALL_SIZE);

    // Level 3 Logic
    const [currentBallColor, setCurrentBallColor] = React.useState(color);
    const hasSwitchedColor = useSharedValue(false);

    useAnimatedReaction(
        () => translateY.value,
        (currentValue: number) => {
            if (isLevel3 && !hasSwitchedColor.value) {
                // Determine target distance again (needs to match useEffect calc)
                const targetDistance = GAME_CONFIG.PADDLE_Y_POS - (GAME_CONFIG.PADDLE_SIZE / 2) - GAME_CONFIG.BALL_SIZE;
                const switchPoint = targetDistance * 0.5;

                if (currentValue >= switchPoint) {
                    hasSwitchedColor.value = true;
                    // Switch color!
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

        // Calculate duration based on distance and speed factor
        // Collision point: When ball bottom touches paddle top
        // Paddle Top = GAME_CONFIG.PADDLE_Y_POS - (GAME_CONFIG.PADDLE_SIZE / 2)
        // Ball Bottom (relative to translate) = translateY + GAME_CONFIG.BALL_SIZE
        // Target translateY = Paddle Top - GAME_CONFIG.BALL_SIZE
        const targetDistance = GAME_CONFIG.PADDLE_Y_POS - (GAME_CONFIG.PADDLE_SIZE / 2) - GAME_CONFIG.BALL_SIZE;
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
                runOnJS(onHit)(id, currentBallColor);
            }
        });

        return () => {
            cancelAnimation(translateY);
        };
    }, [speed, paused, currentBallColor]);

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
