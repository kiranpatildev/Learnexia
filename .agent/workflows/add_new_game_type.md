---
description: How to add a new game type to the platform
---

# Adding a New Game Type

This workflow guides you through adding a new educational game type (e.g., "Word Scramble", "Memory Match").

## 1. Backend Implementation

### A. Define Game Template
1. Create a migration or usage script to add a new `GameTemplate` entry.
2. Define the `code` (e.g., `word_scramble`), `name`, `game_type`, and `default_config`.

```python
# apps/games/management/commands/create_game_templates.py
{
    'code': 'new_game_code',
    'name': 'New Game Name',
    'game_type': 'PUZZLE', # or REACTION, MEMORY, QUIZ
    # ...
}
```

### B. Update Game Generator
In `apps/games/services/game_generator.py`:
1. Add a new method `generate_new_game_content`.
2. Define the specific prompt for Gemini to generate valid JSON for this game.
3. Update `generate_game` dispatch method to call your new generator based on `template_code`.

```python
def generate_game(self, ...):
    if template_code == 'new_game_code':
        return self.generate_new_game_content(...)
```

### C. Update Scoring (Optional)
If the game has unique scoring rules, update `apps/games/services/scoring_service.py`.

## 2. Frontend Implementation

### A. Create Game Component
1. Create `frontend/src/components/games/NewGame/NewGame.jsx`.
2. Implement the gameplay logic.
   - Use `gamesService.startGame(id)` to init.
   - Use `gamesService.submitAnswer(...)` for moves.

### B. Register Route
In `frontend/src/App.jsx`:
```javascript
<Route
  path="/student/games/:id/play"
  element={
    <ProtectedRoute ...>
       <GameRouter /> {/* Logic to pick component based on game type */}
    </ProtectedRoute>
  }
/>
```
*Note: Currently `FallDropGame` is hardcoded for `/play`. To support multiple, you should create a `GamePlayerContainer` that fetches the game type first, then renders the correct component.*

## 3. Refactor Suggestion: GamePlayerContainer
To support widely different games, create a wrapper:

```javascript
// frontend/src/pages/student/GamePlayerPage.jsx
function GamePlayerPage() {
   const { game } = useGame(id);
   
   if (game.template.code === 'fall_drop') return <FallDropGame game={game} />;
   if (game.template.code === 'word_scramble') return <WordScrambleGame game={game} />;
}
```
