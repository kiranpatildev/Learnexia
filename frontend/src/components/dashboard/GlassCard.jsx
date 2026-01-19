import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export function GlassCard({
    children,
    className = '',
    enableHover = true,
    glowColor = '132, 0, 255',
    onClick
}) {
    const cardRef = useRef(null);
    const glowRef = useRef(null);

    useEffect(() => {
        if (!enableHover || !cardRef.current) return;

        const card = cardRef.current;
        const glow = glowRef.current;

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            if (glow) {
                glow.style.setProperty('--glow-x', `${x}%`);
                glow.style.setProperty('--glow-y', `${y}%`);
            }
        };

        const handleMouseEnter = () => {
            gsap.to(card, {
                scale: 1.02,
                duration: 0.3,
                ease: 'power2.out'
            });
            if (glow) {
                gsap.to(glow, {
                    opacity: 1,
                    duration: 0.3
                });
            }
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
            if (glow) {
                gsap.to(glow, {
                    opacity: 0,
                    duration: 0.3
                });
            }
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [enableHover]);

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            className={`relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 transition-all ${onClick ? 'cursor-pointer' : ''} ${className}`}
            style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
        >
            <div
                ref={glowRef}
                className="absolute inset-0 opacity-0 pointer-events-none"
                style={{
                    '--glow-x': '50%',
                    '--glow-y': '50%',
                    background: `radial-gradient(600px circle at var(--glow-x) var(--glow-y), rgba(${glowColor}, 0.15), transparent 40%)`
                }}
            />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
