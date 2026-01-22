import React from 'react';

export const AnswerButtons = ({ options, onSelect, disabled }) => {
    const buttonLabels = ['A', 'B', 'C', 'D'];

    const gradients = [
        'from-blue-500 to-cyan-500',
        'from-purple-500 to-pink-500',
        'from-green-500 to-emerald-500',
        'from-orange-500 to-red-500'
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
            {options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(index)}
                    disabled={disabled}
                    className={`
            relative p-6 rounded-2xl text-white font-bold text-lg
            bg-gradient-to-br ${gradients[index]}
            transform transition-all duration-200
            hover:scale-105 hover:shadow-2xl
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-4 focus:ring-white/50
            flex items-center gap-4 text-left shadow-lg border border-white/10
          `}
                >
                    <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl backdrop-blur-sm">
                        {buttonLabels[index]}
                    </div>
                    <span className="leading-snug">{option}</span>
                </button>
            ))}
        </div>
    );
};
