import { useCallback, useState } from 'react';

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
                // Hard Mode Reset: At 20 points, reset speed to base
                if (newScore === 20) {
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
