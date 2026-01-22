import React from 'react';

const FALL_DURATION = 8000; // 8 seconds

export default function FallingOrb({ orb, onClick, isPaused, duration = 8000 }) {

    // Determine gradient based on index for variety
    const getGradient = (idx) => {
        const styles = [
            'from-cyan-400 to-blue-600 shadow-blue-500/50',
            'from-purple-400 to-pink-600 shadow-pink-500/50',
            'from-amber-400 to-orange-600 shadow-orange-500/50',
            'from-emerald-400 to-green-600 shadow-green-500/50',
        ];
        return styles[idx % styles.length];
    };

    return (
        <div
            onClick={onClick}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation z-20 group"
            style={{
                left: `${orb.x}%`,
                top: `${orb.y}%`,
                transition: `top ${duration}ms linear`,
                transitionPlayState: isPaused ? 'paused' : 'running', // Note: CSS transitionPlayState isn't standard for regular transitions, mainly animations. 
                // For transitions, we can't easily "pause" them in mid-air without complex computed styles.
                // However, since we stop the game logic on click, visually pausing the remaining orbs isn't strictly necessary if the modal covers them.
                // But to be cleaner, if isPaused is true, we could freeze them? 
                // Actually, React re-renders might not stop the CSS transition once committed.
                // A better approach for "pausing" CSS transitions requires getComputedStyle + explicit position set.
                // For MVP, letting them fall behind the modal is acceptable, OR we accept they keep falling visually but interactions are ignored.
                // Let's stick to simplest: interactions ignored (handled in parent).
            }}
        >
            {/* Orb Visual */}
            <div className={`
                w-24 h-24 md:w-32 md:h-32 rounded-full 
                bg-gradient-to-br ${getGradient(orb.index)}
                flex items-center justify-center p-4 text-center
                shadow-lg hover:scale-110 active:scale-95 transition-transform duration-100 ease-out
                border-2 border-white/20 backdrop-blur-sm
            `}>
                <span className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-md select-none pointer-events-none">
                    {orb.text}
                </span>
            </div>

            {/* Trail Effect (simple decorative) */}
            <div className="absolute -top-4 left-1/2 w-1 h-12 bg-white/20 blur-sm rounded-full -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
