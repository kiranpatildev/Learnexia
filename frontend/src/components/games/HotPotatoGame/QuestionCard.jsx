import React from 'react';

export const QuestionCard = ({ question }) => {
    return (
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 w-full max-w-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none group-hover:opacity-50 transition-opacity" />
            <div className="text-white text-2xl md:text-3xl font-bold text-center leading-relaxed drop-shadow-md relative z-10">
                {question}
            </div>
        </div>
    );
};
