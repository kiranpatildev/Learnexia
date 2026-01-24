
import random
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class Word:
    """Represents a word to be placed in the crossword"""
    text: str
    clue: str
    direction: str  # 'across' or 'down'
    row: int = -1
    col: int = -1
    number: int = 0
    
    def __len__(self):
        return len(self.text)


@dataclass
class Cell:
    """Represents a single cell in the crossword grid"""
    letter: str = ''  # Empty string means blocked cell
    number: int = 0   # Clue number (if word starts here)
    is_blocked: bool = False


class CrosswordGrid:
    """
    Generates a valid crossword puzzle grid using a constraint-based algorithm.
    
    Algorithm:
    1. Sort words by length (longest first)
    2. Place first word in center
    3. For each remaining word:
       a. Find all possible placements (intersecting with existing words)
       b. Score each placement (prefer more intersections, central location)
       c. Place word at best-scored position
    4. Validate grid connectivity
    """
    
    def __init__(self, words_data: List[Dict], grid_size: int = 15):
        """
        Initialize crossword generator
        
        Args:
            words_data: List of {word: str, clue: str} dicts
            grid_size: Size of square grid (default 15x15)
        """
        self.grid_size = grid_size
        self.grid = [[Cell(is_blocked=True) for _ in range(grid_size)] 
                     for _ in range(grid_size)]
        
        # Convert to Word objects and sort by length (longest first)
        self.words = [
            Word(text=w['word'].upper(), clue=w['clue'], direction='')
            for w in words_data
        ]
        self.words.sort(key=lambda w: len(w.text), reverse=True)
        
        self.placed_words: List[Word] = []
        self.word_number = 1
    
    def generate(self) -> Optional[Dict]:
        """
        Generate the crossword grid.
        
        Returns:
            Dict with grid layout and word placements, or None if failed
        """
        try:
            if not self.words:
                return None

            # Place first word horizontally in center
            first_word = self.words[0]
            center_row = self.grid_size // 2
            center_col = max(0, (self.grid_size - len(first_word.text)) // 2)
            
            self._place_word(first_word, center_row, center_col, 'across')
            
            # Try to place remaining words
            for word in self.words[1:]:
                if not self._place_word_with_intersections(word):
                    # logger.warning(f"Could not place word: {word.text}")
                    # Continue anyway - partial crossword is ok
                    pass
            
            # Validate minimum connectivity or count
            # Use stricter validation for higher quality
            if len(self.placed_words) < len(self.words) * 0.6:  # At least 60% placed
                logger.error(f"Grid generation failed: too few words placed ({len(self.placed_words)}/{len(self.words)})")
                return None
            
            return self._export_grid()
            
        except Exception as e:
            logger.error(f"Crossword generation error: {e}")
            return None
    
    def _place_word(self, word: Word, row: int, col: int, direction: str) -> bool:
        """
        Place a word on the grid at specified position.
        
        Args:
            word: Word object to place
            row: Starting row
            col: Starting column
            direction: 'across' or 'down'
        
        Returns:
            True if placed successfully
        """
        # Validate placement
        if not self._is_valid_placement(word.text, row, col, direction):
            return False
        
        # Place word
        word.row = row
        word.col = col
        word.direction = direction
        word.number = self.word_number
        self.word_number += 1
        
        # Update grid
        for i, letter in enumerate(word.text):
            if direction == 'across':
                cell = self.grid[row][col + i]
                cell.letter = letter
                cell.is_blocked = False
                if i == 0:
                    cell.number = word.number
            else:  # down
                cell = self.grid[row + i][col]
                cell.letter = letter
                cell.is_blocked = False
                if i == 0:
                    cell.number = word.number
        
        self.placed_words.append(word)
        return True
    
    def _is_valid_placement(self, text: str, row: int, col: int, direction: str) -> bool:
        """Check if word can be legally placed at position"""
        # Check boundaries
        if direction == 'across':
            if col + len(text) > self.grid_size:
                return False
        else:  # down
            if row + len(text) > self.grid_size:
                return False
        
        # Check each cell
        for i, letter in enumerate(text):
            r = row + (i if direction == 'down' else 0)
            c = col + (i if direction == 'across' else 0)
            
            cell = self.grid[r][c]
            
            # If cell has letter, must match
            if cell.letter:
                if cell.letter != letter:
                    return False
            else:
                # Check perpendicular conflicts
                if not self._check_perpendicular_space(r, c, direction):
                    return False
        
        # Check surrounding cells (head and tail) to ensure words don't run into each other
        if direction == 'across':
            # Check left of start
            if col > 0 and self.grid[row][col - 1].letter:
                return False
            # Check right of end
            if col + len(text) < self.grid_size and self.grid[row][col + len(text)].letter:
                return False
        else: # down
            # Check above start
            if row > 0 and self.grid[row - 1][col].letter:
                return False
            # Check below end
            if row + len(text) < self.grid_size and self.grid[row + len(text)][col].letter:
                return False

        return True
    
    def _check_perpendicular_space(self, row: int, col: int, direction: str) -> bool:
        """
        Ensure no perpendicular words conflict.
        If we are placing a letter in an empty cell, we must ensure we aren't creating 
        unintended 2-letter words with adjacent cells.
        """
        if direction == 'across':
            # Check above and below
            # If there is a letter above OR below, it implies we are forming a new down word.
            # But since we are placing a NEW word, these neighbors must be empty unless 
            # we are crossing an existing word (which is handled by cell.letter check).
            # So if cell is empty, neighbors perpendicular must be empty.
            if row > 0 and self.grid[row - 1][col].letter:
                return False
            if row < self.grid_size - 1 and self.grid[row + 1][col].letter:
                return False
        else:  # down
            # Check left and right
            if col > 0 and self.grid[row][col - 1].letter:
                return False
            if col < self.grid_size - 1 and self.grid[row][col + 1].letter:
                return False
        
        return True
    
    def _place_word_with_intersections(self, word: Word) -> bool:
        """
        Find best placement for word that intersects existing words.
        """
        possible_placements = []
        
        # Try both directions
        for direction in ['across', 'down']:
            # For each placed word
            for placed_word in self.placed_words:
                # Find intersection points
                intersections = self._find_intersections(word.text, placed_word)
                
                for word_idx, placed_idx in intersections:
                    # Calculate grid position
                    if direction == 'across' and placed_word.direction == 'down':
                        # New word crosses existing DOWN word
                        row = placed_word.row + placed_idx
                        col = placed_word.col - word_idx
                    elif direction == 'down' and placed_word.direction == 'across':
                        # New word crosses existing ACROSS word
                        row = placed_word.row - word_idx
                        col = placed_word.col + placed_idx
                    else:
                        continue  # Can't intersect parallel words (simplification)
                    
                    # Validate and score
                    # Ensure position is within grid boundaries before checking validity
                    if 0 <= row < self.grid_size and 0 <= col < self.grid_size:
                        if self._is_valid_placement(word.text, row, col, direction):
                            score = self._score_placement(word.text, row, col, direction)
                            possible_placements.append((score, row, col, direction))
        
        # Sort by score and try best placements
        possible_placements.sort(reverse=True)
        
        for score, row, col, direction in possible_placements[:20]:  # Try top 20
            if self._place_word(word, row, col, direction):
                return True
        
        return False
    
    def _find_intersections(self, word1: str, word2: Word) -> List[Tuple[int, int]]:
        """Find all possible intersection points between two words"""
        intersections = []
        for i, letter1 in enumerate(word1):
            for j, letter2 in enumerate(word2.text):
                if letter1 == letter2:
                    intersections.append((i, j))
        return intersections
    
    def _score_placement(self, text: str, row: int, col: int, direction: str) -> float:
        """
        Score a potential word placement.
        Higher score = better placement.
        """
        score = 0.0
        
        # Count intersections
        intersections = 0
        for i in range(len(text)):
            r = row + (i if direction == 'down' else 0)
            c = col + (i if direction == 'across' else 0)
            if self.grid[r][c].letter:
                intersections += 1
        
        score += intersections * 10  # Major factor
        
        # Centrality bonus
        center = self.grid_size // 2
        if direction == 'across':
            word_center_row = row
            word_center_col = col + len(text) / 2
        else:
            word_center_row = row + len(text) / 2
            word_center_col = col
            
        distance = abs(word_center_row - center) + abs(word_center_col - center)
        score -= distance * 0.5
        
        return score
    
    def _export_grid(self) -> Dict:
        """Export grid to JSON-serializable format"""
        # Compact grid (remove excess empty rows/cols)
        min_row, max_row, min_col, max_col = self._get_bounds()
        
        # Adjust grid size if needed or keep original? 
        # For simplicity, returning the visible bounding box with some padding would be nice, 
        # but maintaining the fixed grid size is easier for UI initially.
        # Let's crop to visible area to save space and make it look better.
        
        height = max_row - min_row + 1
        width = max_col - min_col + 1
        
        compact_grid = []
        for r in range(min_row, max_row + 1):
            row_data = []
            for c in range(min_col, max_col + 1):
                cell = self.grid[r][c]
                row_data.append({
                    'letter': cell.letter if not cell.is_blocked else None,
                    'number': cell.number if cell.number > 0 else None,
                    'is_blocked': cell.is_blocked
                })
            compact_grid.append(row_data)
        
        # Separate across and down clues
        across_words = [w for w in self.placed_words if w.direction == 'across']
        down_words = [w for w in self.placed_words if w.direction == 'down']
        
        # Re-number words based on top-left to bottom-right order
        # This is standard crossword numbering: 
        # Sort all starting cells by (row, col). Assign numbers sequentially.
        
        # Gather all starting positions
        starts = {} # (r, c) -> number
        
        # We need to preserve the numbers assigned during generation OR reassign them?
        # Usually reassigning is better for "1, 2, 3..." clean look.
        # But 'placed_words' already have numbers. Let's just use them but they might be unordered.
        # Let's re-number for professional polish.
        
        # 1. Find all cells that start a word
        starting_cells = set()
        for w in self.placed_words:
            starting_cells.add((w.row, w.col))
        
        # 2. Sort by row, then col
        sorted_starts = sorted(list(starting_cells), key=lambda x: (x[0], x[1]))
        
        # 3. Assign numbers
        start_map = {pos: i+1 for i, pos in enumerate(sorted_starts)}
        
        # 4. Update words
        for w in self.placed_words:
            w.number = start_map[(w.row, w.col)]
        
        # 5. Sort lists
        across_words.sort(key=lambda w: w.number)
        down_words.sort(key=lambda w: w.number)
        
        # 6. Update grid numbers
        for r_idx, row_data in enumerate(compact_grid):
            for c_idx, cell_data in enumerate(row_data):
                abs_r = min_row + r_idx
                abs_c = min_col + c_idx
                if (abs_r, abs_c) in start_map:
                    cell_data['number'] = start_map[(abs_r, abs_c)]
                else:
                    cell_data['number'] = None # Clear old numbers

        return {
            'grid': compact_grid,
            'grid_size': {
                'rows': height,
                'cols': width
            },
            'across_clues': [
                {
                    'number': w.number,
                    'clue': w.clue,
                    'answer': w.text,
                    'length': len(w.text),
                    'row': w.row - min_row,
                    'col': w.col - min_col
                }
                for w in across_words
            ],
            'down_clues': [
                {
                    'number': w.number,
                    'clue': w.clue,
                    'answer': w.text,
                    'length': len(w.text),
                    'row': w.row - min_row,
                    'col': w.col - min_col
                }
                for w in down_words
            ],
            'total_words': len(self.placed_words)
        }
    
    def _get_bounds(self) -> Tuple[int, int, int, int]:
        """Get the bounding box of placed words"""
        min_row, max_row = self.grid_size, 0
        min_col, max_col = self.grid_size, 0
        
        for word in self.placed_words:
            if word.direction == 'across':
                min_row = min(min_row, word.row)
                max_row = max(max_row, word.row)
                min_col = min(min_col, word.col)
                max_col = max(max_col, word.col + len(word.text) - 1)
            else:  # down
                min_row = min(min_row, word.row)
                max_row = max(max_row, word.row + len(word.text) - 1)
                min_col = min(min_col, word.col)
                max_col = max(max_col, word.col)
        
        # Add padding
        min_row = max(0, min_row - 1)
        max_row = min(self.grid_size - 1, max_row + 1)
        min_col = max(0, min_col - 1)
        max_col = min(self.grid_size - 1, max_col + 1)
        
        return min_row, max_row, min_col, max_col


def generate_crossword_grid(words_data: List[Dict], grid_size: int = 15) -> Optional[Dict]:
    """
    Main function to generate crossword puzzle.
    
    Args:
        words_data: List of {word: str, clue: str}
        grid_size: Grid dimensions
    
    Returns:
        Grid data dict or None if failed
    """
    generator = CrosswordGrid(words_data, grid_size)
    return generator.generate()
