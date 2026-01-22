import { useState, useEffect } from 'react';
import FallingOrb from './FallingOrb';

export default function GameCanvas({ options, onOrbClick, onMiss, isPaused, difficulty = 'MEDIUM' }) {
    const speeds = { EASY: 12000, MEDIUM: 8000, HARD: 6000 };
    const duration = speeds[difficulty] || 8000;

    const [orbs, setOrbs] = useState([]);

    useEffect(() => {
        // Initialize orbs for the current question
        // We stagger them slightly or launch them together?
        // For "Fall Drop", typically they fall together or in a wave.
        // Let's spawn them all at top with random X positions distributed across 4 lanes.

        const laneWidth = 100 / 4; // 25% per lane

        const newOrbs = options.map((text, index) => {
            // Calculate lane center + slight random jitter
            const laneCenter = (index * laneWidth) + (laneWidth / 2);
            const jitter = (Math.random() * 10) - 5; // +/- 5% jitter

            return {
                id: `orb-${index}`,
                text: text,
                index: index,
                x: Math.max(5, Math.min(95, laneCenter + jitter)), // Clamp between 5-95%
                y: -15, // Start above screen
                delay: index * 200 // Slight stagger for visual appeal
            };
        });

        setOrbs(newOrbs);

        // Trigger falling animation after mount
        const timer = setTimeout(() => {
            setOrbs(prev => prev.map(o => ({ ...o, y: 110 }))); // Move to below screen
        }, 100);

        // Fail-safe timer (if they miss all)
        // Duration should match CSS transition time (e.g. 8s)
        const failTimer = setTimeout(() => {
            if (!isPaused) {
                onMiss();
            }
        }, duration + 500); // fall + buffer

        return () => {
            clearTimeout(timer);
            clearTimeout(failTimer);
        };
    }, [options]); // Re-run when options change (new question)

    return (
        <div className="flex-1 relative overflow-hidden min-h-[60vh]">
            {orbs.map((orb) => (
                <FallingOrb
                    key={orb.id}
                    orb={orb}
                    onClick={() => !isPaused && onOrbClick(orb.index)}
                    isPaused={isPaused}
                    duration={duration}
                />

            ))}
        </div>
    );
}
