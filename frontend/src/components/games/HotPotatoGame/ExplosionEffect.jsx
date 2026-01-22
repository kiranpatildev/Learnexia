import React, { useEffect, useState } from 'react';

export const ExplosionEffect = ({ show }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (show) {
            // Generate random particles
            const newParticles = Array.from({ length: 20 }, (_, i) => ({
                id: i,
                x: Math.random() * 100 - 50, // -50 to 50
                y: Math.random() * 100 - 50
            }));
            setParticles(newParticles);
        } else {
            setParticles([]);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
            {/* Screen Flash */}
            <div className="absolute inset-0 bg-red-600 animate-pulse opacity-50" />

            {/* Explosion Particles */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute top-1/2 left-1/2 w-8 h-8 bg-orange-500 rounded-full transition-all duration-1000 ease-out"
                    style={{
                        transform: `translate(calc(-50% + ${particle.x}vw), calc(-50% + ${particle.y}vh)) scale(0)`,
                        opacity: 0,
                        animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                    }}
                />
            ))}

            {/* Explosion Text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-9xl font-black text-white animate-bounce scale-150">
                    💥
                </div>
            </div>
        </div>
    );
};
