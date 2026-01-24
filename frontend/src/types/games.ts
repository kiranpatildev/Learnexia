export interface CrosswordCell {
    r: number;
    c: number;
    value?: string; // Solution letter
    number?: number;
    is_blocked: boolean;
    clues?: { [direction: string]: number };
}

export interface CrosswordClue {
    number: number;
    clue: string;
    answer: string;
    length: number;
    row: number;
    col: number;
}

export interface CrosswordGridData {
    grid: CrosswordCell[][];
    grid_size: { rows: number; cols: number } | number;
    across_clues: CrosswordClue[];
    down_clues: CrosswordClue[];
    total_words: number;
}

export interface CrosswordGameState {
    gridData: CrosswordGridData | null;
    userInputs: { [key: string]: string }; // "r,c" -> char
    selectedCell: { r: number; c: number } | null;
    direction: 'across' | 'down';
    score: number;
    gameState: 'loading' | 'playing' | 'checking' | 'completed' | 'error';
}
