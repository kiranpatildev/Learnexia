import React, { useEffect, useRef } from 'react';

const ClueItem = ({ clue, isActive, onClick }) => {
    const itemRef = useRef(null);

    useEffect(() => {
        if (isActive && itemRef.current) {
            itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isActive]);

    return (
        <li
            ref={itemRef}
            onClick={onClick}
            className={`
                cursor-pointer p-2 rounded mb-1 text-sm border-l-4 transition-all
                ${isActive
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 text-indigo-900 dark:text-indigo-100 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}
            `}
        >
            <span className="font-bold mr-2">{clue.number}.</span>
            <span>{clue.clue}</span>
        </li>
    );
};

const ClueList = ({ clues, direction, title, activeClueNumber, onClueClick }) => {
    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-800_ rounded-lg">
            <h3 className="text-lg font-bold p-3 bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-200 sticky top-0 uppercase tracking-wider text-sm border-b dark:border-slate-700">
                {title}
            </h3>
            <ul className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                {clues.map(clue => (
                    <ClueItem
                        key={clue.number}
                        clue={clue}
                        isActive={direction === title.toLowerCase() && activeClueNumber === clue.number}
                        onClick={() => onClueClick(clue, title.toLowerCase())}
                    />
                ))}
            </ul>
        </div>
    );
};

export default ClueList;
