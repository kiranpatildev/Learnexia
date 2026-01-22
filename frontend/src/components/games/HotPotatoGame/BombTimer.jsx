import React, { useState, useEffect, useRef } from 'react';

export const useTimer = (initialTime, onExpire, isPaused = false) => {
    const [timeRemaining, setTimeRemaining] = useState(initialTime);
    const intervalRef = useRef(null);

    useEffect(() => {
        setTimeRemaining(initialTime); // Reset when initialTime changes
    }, [initialTime]);

    // Start timer
    useEffect(() => {
        if (isPaused || timeRemaining <= 0) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                const newTime = prev - 0.1; // Tick every 100ms

                if (newTime <= 0) {
                    clearInterval(intervalRef.current);
                    if (onExpire) onExpire();
                    return 0;
                }

                return newTime;
            });
        }, 100);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [timeRemaining, isPaused, onExpire, initialTime]);

    const resetTimer = (newTime) => {
        setTimeRemaining(newTime);
    };

    const progress = (timeRemaining / initialTime) * 100;

    const getTimerColor = () => {
        if (progress > 60) return 'text-green-500';
        if (progress > 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    return {
        timeRemaining,
        progress,
        resetTimer,
        timerColor: getTimerColor()
    };
};

export const BombTimer = ({ timeLimit, onExpire, isPaused }) => {
    const { timeRemaining, progress, timerColor } = useTimer(
        timeLimit,
        onExpire,
        isPaused
    );

    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Circular Progress Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                    cx="96"
                    cy="96"
                    r="88"
                    className="text-gray-700"
                    strokeWidth="8"
                    fill="none"
                />
                <circle
                    cx="96"
                    cy="96"
                    r="88"
                    className={`${timerColor} transition-all duration-100 ease-linear`}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                />
            </svg>

            <div className="absolute flex flex-col items-center">
                <div className={`text-6xl mb-2 transition-transform duration-300 ${isPaused ? '' : 'animate-pulse'}`}>
                    💣
                </div>
                <div className="text-3xl font-bold text-white font-mono">
                    {timeRemaining.toFixed(1)}s
                </div>
            </div>

            {progress < 30 && !isPaused && (
                <div className="absolute -bottom-8 w-full text-center animate-bounce text-red-500 font-bold">
                    ⚠️ HURRY! ⚠️
                </div>
            )}
        </div>
    );
};
