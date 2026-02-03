import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const GAME_CONFIG = {
    PADDLE_SIZE: 120, // Diameter of the rotating paddle
    BALL_SIZE: 20,
    PADDLE_Y_POS: height - 150, // Y position of the paddle center
    SPAWN_INTERVAL: 1500, // Initial spawn rate in ms
    SPEED_INCREMENT: 0.1, // How much speed increases per score
};

export const COLORS = {
    RED: '#FF5E5E',
    GREEN: '#00CC66',
    BLUE: '#5599FF',
};

export type GameColor = typeof COLORS[keyof typeof COLORS]; // Value specific color type
export const COLOR_ARRAY = [COLORS.RED, COLORS.GREEN, COLORS.BLUE] as const;
