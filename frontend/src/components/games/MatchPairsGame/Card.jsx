
import React from 'react';

export const Card = ({ card, onFlip }) => {
    const handleClick = () => {
        if (!card.isFlipped && !card.isMatched) {
            onFlip(card.id);
        }
    };

    // Card colors based on type
    const getCardColor = () => {
        if (card.isMatched) {
            return 'from-green-500 to-emerald-500 border-green-400';
        }
        if (card.type === 'term') {
            return 'from-blue-500 to-cyan-500 border-blue-400';
        }
        return 'from-purple-500 to-pink-500 border-purple-400';
    };

    // Tailwind classes for flip effect
    // We need 'preserve-3d' and 'backface-hidden'
    // Assuming tailwind has these or standard css

    return (
        <div
            onClick={handleClick}
            className={`
        relative w-full aspect-[3/4] cursor-pointer perspective-1000
        ${card.isMatched ? 'opacity-80' : 'hover:scale-105'}
        transition-all duration-300
      `}
        >
            <div className={`
        relative w-full h-full transition-transform duration-500
        transform-style-preserve-3d
        ${card.isFlipped ? 'rotate-y-180' : ''}
      `}>
                {/* Card Back (Face Down) */}
                <div className={`
            absolute inset-0 w-full h-full 
            bg-gradient-to-br from-indigo-600 to-violet-800
            rounded-xl shadow-xl border-2 border-indigo-400/30
            flex items-center justify-center
            backface-hidden
            ${card.isFlipped ? 'invisible-when-flipped' : ''} 
            /* 'invisible-when-flipped' isn't real, backface-hidden handles it if rotated */
          `}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <span className="text-4xl">🎴</span>
                </div>

                {/* Card Front (Face Up) */}
                <div className={`
            absolute inset-0 w-full h-full
            bg-white rounded-xl shadow-xl border-2
            flex items-center justify-center p-4 text-center
            ${card.isMatched ? 'border-green-400 bg-green-50' : 'border-slate-200'}
            transform rotate-y-180
          `}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="flex flex-col items-center">
                        <span className={`text-sm font-semibold mb-2 uppercase tracking-wider ${card.type === 'term' ? 'text-blue-500' : 'text-purple-500'
                            }`}>
                            {card.type}
                        </span>
                        <p className={`font-medium ${card.content.length > 50 ? 'text-xs' : 'text-sm'
                            } text-slate-800`}>
                            {card.content}
                        </p>

                        {card.isMatched && (
                            <div className="absolute top-2 right-2 text-green-500 text-lg">
                                ✓
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
