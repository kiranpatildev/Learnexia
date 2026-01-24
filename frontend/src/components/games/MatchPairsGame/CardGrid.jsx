
import React from 'react';
import { Card } from './Card';

export const CardGrid = ({ cards, onCardFlip }) => {
    // Determine grid columns based on number of cards
    // 12 cards -> 3x4 or 4x3
    // 16 cards -> 4x4
    // 20 cards -> 5x4

    const getGridClass = () => {
        const count = cards.length;
        if (count <= 12) return 'grid-cols-3 md:grid-cols-4';
        if (count <= 16) return 'grid-cols-4 md:grid-cols-4';
        return 'grid-cols-4 md:grid-cols-5';
    };

    return (
        <div className={`grid ${getGridClass()} gap-4 md:gap-6 w-full max-w-4xl mx-auto`}>
            {cards.map((card) => (
                <Card
                    key={card.id}
                    card={card}
                    onFlip={onCardFlip}
                />
            ))}
        </div>
    );
};
