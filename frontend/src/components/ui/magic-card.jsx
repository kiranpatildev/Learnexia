import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import './magic-card.css';

/**
 * MagicContainer
 * Wraps a group of MagicCards to manage the Spotlight effect.
 * Tracks mouse movement within the container and updates CSS variables on children.
 */
export const MagicContainer = ({
    children,
    className = "",
    spotlightColor = "132, 0, 255", // default purple
    spotlightRadius = 300
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const cards = container.querySelectorAll('.magic-card');

        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            // Optional: Performance check - only if mouse is near container
            // For now, we update always to allow "fading out" logic

            cards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const x = e.clientX - cardRect.left;
                const y = e.clientY - cardRect.top;

                // Set mouse position for the card's internal gradient (border)
                card.style.setProperty('--glow-x', `${x}px`);
                card.style.setProperty('--glow-y', `${y}px`);
                card.style.setProperty('--glow-rgb', spotlightColor);
                card.style.setProperty('--glow-radius', `${spotlightRadius}px`);

                // Calculate intensity based on distance from cursor
                // Center of the card relative to viewport
                const cardCenterX = cardRect.left + cardRect.width / 2;
                const cardCenterY = cardRect.top + cardRect.height / 2;

                const dist = Math.hypot(e.clientX - cardCenterX, e.clientY - cardCenterY);
                const maxDist = spotlightRadius + Math.max(cardRect.width, cardRect.height) / 2;

                let intensity = 0;
                if (dist < maxDist) {
                    // Linear falloff
                    intensity = 1 - (dist / maxDist);
                }

                card.style.setProperty('--glow-intensity', intensity.toFixed(2));
            });
        };

        const handleMouseLeave = () => {
            cards.forEach(card => {
                card.style.setProperty('--glow-intensity', '0');
            });
        };

        // We listen on window to ensure smooth tracking even if fast cursor leaves exact element,
        // but traditionally for "Spotlight" we listen on the container. 
        // Let's listen on container for better performance, but window is smoother.
        // Compromise: Listen on container for mousemove.
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [spotlightColor, spotlightRadius]);

    return (
        <div ref={containerRef} className={`magic-spotlight-container ${className}`}>
            {children}
        </div>
    );
};

/**
 * MagicCard
 * A card component that reacts to the MagicContainer's spotlight logic.
 * Also includes Tilt effect on hover.
 */
export const MagicCard = ({
    children,
    className = "",
    onClick,
    enableTilt = true,
    background = "bg-slate-900" // allow overriding generic dark bg
}) => {
    const cardRef = useRef(null);

    useEffect(() => {
        if (!enableTilt || !cardRef.current) return;

        const card = cardRef.current;

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Limit tilt range
            const rotateX = ((y - centerY) / centerY) * -5; // max 5deg
            const rotateY = ((x - centerX) / centerX) * 5;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.2,
                ease: 'power2.out',
                transformPerspective: 1000
            });
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [enableTilt]);

    return (
        <div
            ref={cardRef}
            className={`magic-card ${background} ${className}`}
            onClick={onClick}
        >
            <div className="magic-card-content h-full w-full">
                {children}
            </div>
        </div>
    );
};
