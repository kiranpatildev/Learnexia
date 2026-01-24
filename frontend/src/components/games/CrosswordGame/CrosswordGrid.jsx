import React from 'react';
import GridCell from './GridCell';

const CrosswordGrid = ({
    gridData,
    userInputs,
    selectedCell,
    direction,
    validationResults,
    onCellClick
}) => {
    if (!gridData || !gridData.grid) return (
        <div className="flex items-center justify-center h-64 bg-slate-100 rounded-lg">
            <span className="text-slate-400">Loading Grid...</span>
        </div>
    );

    const isRelatedImproved = (r, c) => {
        if (!selectedCell) return false;
        if (selectedCell.r === r && selectedCell.c === c) return false; // Handled by isSelected (which is primary)

        // Must match direction axis
        if (direction === 'across') {
            if (r !== selectedCell.r) return false;
            // Check connectivity: are we contiguous with selected cell without blocks?
            const start = Math.min(c, selectedCell.c);
            const end = Math.max(c, selectedCell.c);
            for (let i = start; i <= end; i++) {
                if (gridData.grid[r][i].is_blocked) return false;
            }
            return true;
        } else {
            if (c !== selectedCell.c) return false;
            const start = Math.min(r, selectedCell.r);
            const end = Math.max(r, selectedCell.r);
            for (let i = start; i <= end; i++) {
                if (gridData.grid[i][c].is_blocked) return false;
            }
            return true;
        }
    };

    // Helper to check status
    const getCellStatus = (r, c) => {
        if (!validationResults) return null;

        // Find which clues touch this cell
        const cellKey = `${r},${c}`;
        const relevantClues = [];

        // This is expensive to scan every time but for small grids (15x15) it's fine.
        // Optimization: Pre-calculate map?
        // Let's rely on simple lookups first.

        // Check if this cell is part of any Correct or Incorrect clue
        // We need to know which clues cover map[r][c].

        // Backend returns "1-across", "2-down".
        // We need to map (r,c) -> list of Clue Keys.
        // Or map Clue Keys -> list of (r,c).

        // Let's do a quick scan if we have clues
        if (!gridData.across_clues) return null;

        const isCorrect = validationResults.correct.some(key => {
            const [num, dir] = key.split('-');
            const clues = dir === 'across' ? gridData.across_clues : gridData.down_clues;
            const clue = clues.find(c => c.number === parseInt(num));
            if (!clue) return false;

            // Is cell in clue?
            if (dir === 'across') {
                return (r === clue.row && c >= clue.col && c < clue.col + clue.length);
            } else {
                return (c === clue.col && r >= clue.row && r < clue.row + clue.length);
            }
        });

        if (isCorrect) return 'correct';

        const isIncorrect = validationResults.incorrect.some(key => {
            const [num, dir] = key.split('-');
            const clues = dir === 'across' ? gridData.across_clues : gridData.down_clues;
            const clue = clues.find(c => c.number === parseInt(num));
            if (!clue) return false;

            if (dir === 'across') {
                return (r === clue.row && c >= clue.col && c < clue.col + clue.length);
            } else {
                return (c === clue.col && r >= clue.row && r < clue.row + clue.length);
            }
        });

        if (isIncorrect) return 'incorrect';

        return null;
    };

    return (
        <div className="inline-block">
            <div
                className="grid gap-[2px] bg-slate-800 p-2 rounded-lg shadow-2xl border-4 border-slate-900"
                style={{
                    gridTemplateColumns: `repeat(${gridData.grid[0].length}, minmax(32px, 48px))` // Adaptive size
                }}
            >
                {gridData.grid.map((row, r) => (
                    row.map((cell, c) => (
                        <GridCell
                            key={`${r}-${c}`}
                            r={r}
                            c={c}
                            cellData={cell}
                            value={userInputs[`${r},${c}`] || ''}
                            number={cell.number}
                            isSelected={selectedCell && selectedCell.r === r && selectedCell.c === c}
                            isRelated={isRelatedImproved(r, c)}
                            status={getCellStatus(r, c)}
                            onClick={onCellClick}
                        />
                    ))
                ))}
            </div>
        </div>
    );
};

export default CrosswordGrid;
