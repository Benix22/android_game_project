import { useCallback, useState } from 'react';
import { LEVEL_THRESHOLDS } from '../constants/GameConfig';

export const useGameLoop = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [gameSpeed, setGameSpeed] = useState(1);

    const startGame = useCallback(() => {
        setIsPlaying(true);
        setIsGameOver(false);
        setScore(0);
        setGameSpeed(1);
    }, []);

    const endGame = useCallback(() => {
        setIsPlaying(false);
        setIsGameOver(true);
    }, []);

    const incrementScore = useCallback(() => {
        setScore((prev) => {
            const newScore = prev + 1;

            // Speed Logic
            setGameSpeed((prevSpeed) => {
                // Hard Mode / Level 3 Reset:
                if (newScore === LEVEL_THRESHOLDS.LEVEL_2 || newScore === LEVEL_THRESHOLDS.LEVEL_3) {
                    return 1;
                }
                // Otherwise increment
                return Math.min(prevSpeed + 0.05, 5);
            });

            return newScore;
        });
    }, []);

    return {
        isPlaying,
        isGameOver,
        score,
        gameSpeed,
        startGame,
        endGame,
        incrementScore,
    };
};
