import { useState, useRef, useCallback } from 'react';

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
        setScore((prev) => prev + 1);
        // Increase speed slightly with every point, capped at some sensible max if needed
        setGameSpeed((prev) => Math.min(prev + 0.05, 5));
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
