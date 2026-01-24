import React from 'react';

const GridCell = ({ r, c, cellData, isSelected, isRelated, status, onClick, value, number }) => {
    // status: 'correct' | 'incorrect' | null

    const blocked = cellData ? cellData.is_blocked : true;

    if (blocked) {
        return <div className="w-full h-full bg-slate-900 border border-slate-800" />;
    }

    let statusClass = '';
    // Only show status colors if NOT selected (selected highlights override status for clarity while typing)
    if (!isSelected) {
        if (status === 'correct') statusClass = 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-400 font-bold';
        if (status === 'incorrect') statusClass = 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-400 font-bold relative overflow-hidden';
    }

    return (
        <div
            className={`
                relative w-full aspect-square flex items-center justify-center 
                border select-none cursor-pointer transition-colors duration-200
                text-xl font-bold shadow-sm
                ${isSelected ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300 dark:ring-indigo-900 z-10' :
                    isRelated ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800' :
                        statusClass || 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'}
            `}
            onClick={() => onClick(r, c)}
        >
            {number && (
                <span className={`absolute top-0.5 left-1 text-[0.65rem] font-medium leading-none ${isSelected ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                    {number}
                </span>
            )}
            <span className="mt-1">{value}</span>
        </div>
    );
};

export default GridCell;
