import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const STAT_COLORS = {
    red: {
        bg: 'from-red-500 to-red-600',
        shadow: 'rgba(239, 68, 68, 0.3)',
        glow: '239, 68, 68'
    },
    orange: {
        bg: 'from-orange-500 to-orange-600',
        shadow: 'rgba(249, 115, 22, 0.3)',
        glow: '249, 115, 22'
    },
    blue: {
        bg: 'from-blue-500 to-blue-600',
        shadow: 'rgba(59, 130, 246, 0.3)',
        glow: '59, 130, 246'
    },
    purple: {
        bg: 'from-purple-500 to-purple-600',
        shadow: 'rgba(168, 85, 247, 0.3)',
        glow: '168, 85, 247'
    },
    green: {
        bg: 'from-emerald-500 to-emerald-600',
        shadow: 'rgba(16, 185, 129, 0.3)',
        glow: '16, 185, 129'
    }
};

export function AnimatedStatCard({
    label,
    value,
    icon: Icon,
    color = 'purple',
    suffix = '',
    showCheckmark = false
}) {
    const cardRef = useRef(null);
    const valueRef = useRef(null);
    const colorConfig = STAT_COLORS[color] || STAT_COLORS.purple;

    useEffect(() => {
        if (!valueRef.current) return;

        // Animate number count-up
        const target = typeof value === 'number' ? value : parseInt(value) || 0;
        const obj = { val: 0 };

        gsap.to(obj, {
            val: target,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: () => {
                if (valueRef.current) {
                    valueRef.current.textContent = Math.round(obj.val);
                }
            }
        });
    }, [value]);

    useEffect(() => {
        if (!cardRef.current) return;

        const card = cardRef.current;

        const handleMouseEnter = () => {
            gsap.to(card, {
                y: -4,
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div ref={cardRef} className="relative">
            <div
                className={`relative rounded-3xl bg-gradient-to-br ${colorConfig.bg} p-6 overflow-hidden`}
                style={{
                    boxShadow: `0 8px 24px ${colorConfig.shadow}`
                }}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl transform translate-x-8 -translate-y-8" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl transform -translate-x-4 translate-y-4" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="text-white/80 text-sm font-medium">{label}</div>
                        {showCheckmark && (
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="flex items-end justify-between">
                        <div className="text-4xl font-bold text-white">
                            <span ref={valueRef}>0</span>
                            {suffix && <span className="text-2xl ml-1">{suffix}</span>}
                        </div>
                        {Icon && (
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
