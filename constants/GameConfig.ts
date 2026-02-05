import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Configuration Flags
const DEBUG_ENABLED = true;
export const IS_DEBUG_MODE = DEBUG_ENABLED;

// Level Thresholds
export const LEVEL_THRESHOLDS = {
    LEVEL_2: DEBUG_ENABLED ? 10 : 20,
    LEVEL_3: DEBUG_ENABLED ? 25 : 50,
};

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
    YELLOW: '#FFD700',
};

export type GameColor = typeof COLORS[keyof typeof COLORS];

// 3 Colors (Normal)
export const BASE_COLORS = [COLORS.RED, COLORS.GREEN, COLORS.BLUE] as const;

// 4 Colors (Hard) - Order matters for rotation logic
// R -> B -> G -> Y (Clockwise check needed)
export const ALL_COLORS = [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW] as const;

// Default for initial load
export const COLOR_ARRAY = BASE_COLORS;
