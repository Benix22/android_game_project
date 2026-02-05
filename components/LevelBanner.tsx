import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface LevelBannerProps {
    text: string;
}

export const LevelBanner: React.FC<LevelBannerProps> = ({ text }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withSequence(
            withTiming(1.2, { duration: 500, easing: Easing.out(Easing.back(1.5)) }),
            withTiming(1, { duration: 200 })
        );
        opacity.value = withTiming(1, { duration: 300 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.banner, animatedStyle]}>
                <Text style={styles.text}>{text}</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50, // On top of everything
        backgroundColor: 'rgba(0,0,0,0.3)' // Slight dim
    },
    banner: {
        paddingHorizontal: 40,
        paddingVertical: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    text: {
        fontSize: 40,
        fontWeight: '900',
        color: '#222',
        letterSpacing: 3,
        textAlign: 'center'
    }
});
