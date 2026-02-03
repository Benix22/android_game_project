import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS, GAME_CONFIG } from '../constants/GameConfig';

interface ColorPaddleProps {
    rotation: number; // 0, 1, 2 (representing 0, 120, 240 degrees)
}

// Helper to draw a segment (120 degrees arc)
const createArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(radius, radius, radius, endAngle);
    const end = polarToCartesian(radius, radius, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
        "M", radius, radius,
        "L", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "L", radius, radius
    ].join(" ");

    return d;
};

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

export const ColorPaddle: React.FC<ColorPaddleProps> = ({ rotation }) => {
    const rotationAnim = useSharedValue(0);

    useEffect(() => {
        // rotation is 0, 1, or 2. We multiply by 120 to get degrees.
        rotationAnim.value = withSpring(rotation * 120, {
            stiffness: 150,
            damping: 15,
            mass: 0.8
        });
    }, [rotation]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotationAnim.value}deg` }],
        };
    });

    const size = GAME_CONFIG.PADDLE_SIZE;
    const radius = size / 2;

    return (
        <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
            <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
                <G rotation={-60} origin={`${radius}, ${radius}`}>
                    <Path d={createArc(0, 120, radius)} fill={COLORS.RED} />
                    <Path d={createArc(120, 240, radius)} fill={COLORS.GREEN} />
                    <Path d={createArc(240, 360, radius)} fill={COLORS.BLUE} />
                </G>
            </Svg>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
