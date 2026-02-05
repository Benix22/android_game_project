import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';
import { COLORS, GAME_CONFIG } from '../constants/GameConfig';

interface ColorPaddleProps {
    rotation: number; // 0, 1, 2, ...
    mode: 'normal' | 'hard';
}

// Helper to draw a segment
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

export const ColorPaddle: React.FC<ColorPaddleProps> = ({ rotation, mode }) => {
    const rotationAnim = useSharedValue(0);
    const isHard = mode === 'hard';
    const segmentAngle = isHard ? 90 : 120;

    useEffect(() => {
        // Multiplier depends on mode: 120 deg for 3-seg, 90 deg for 4-seg
        rotationAnim.value = withSpring(rotation * segmentAngle, {
            stiffness: 150,
            damping: 15,
            mass: 0.8
        });
    }, [rotation, segmentAngle]);

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
                <G rotation={isHard ? -45 : -60} origin={`${radius}, ${radius}`}>
                    {isHard ? (
                        <>
                            {/* 4 Segments: Red, Blue, Green, Yellow */}
                            {/* Order matches ALL_COLORS: R, B, G, Y */}
                            <Path d={createArc(0, 90, radius)} fill={COLORS.RED} />
                            <Path d={createArc(90, 180, radius)} fill={COLORS.BLUE} />
                            <Path d={createArc(180, 270, radius)} fill={COLORS.GREEN} />
                            <Path d={createArc(270, 360, radius)} fill={COLORS.YELLOW} />
                        </>
                    ) : (
                        <>
                            {/* 3 Segments */}
                            <Path d={createArc(0, 120, radius)} fill={COLORS.RED} />
                            <Path d={createArc(120, 240, radius)} fill={COLORS.GREEN} />
                            <Path d={createArc(240, 360, radius)} fill={COLORS.BLUE} />
                        </>
                    )}
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
