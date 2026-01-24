
import React from 'react';

export const MatchAnimation = ({ show }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
            <div className="animate-bounce">
                <div className="text-9xl filter drop-shadow-lg">✨</div>
            </div>
        </div>
    );
};
