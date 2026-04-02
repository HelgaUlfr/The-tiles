# Tiles - Browser-Based Tile Adventure Game

## Project Overview
A browser-based tile RPG with exploration, resource management, and social/combat encounters. Built with vanilla JavaScript, HTML5, and CSS3 — no build tools or frameworks required.

## Tech Stack
- **Frontend:** Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Assets:** PNG/JPG textures, WAV sound effects
- **Storage:** Browser `localStorage` for save slots and settings
- **Server:** `serve` (npm global package) for development

## Project Structure
```
Tiles/
  README.md
  development/        # All source files served as the root
    index.html        # Main entry point (HTML + embedded CSS)
    game.js           # Core game engine (5700+ lines)
    slots.js          # Save slot management and autosave
    furries.js        # Character/NPC definitions
    narratorSettings.js
    *Narrator.js      # Biome-specific narrators (grass, forest, pond, swamp, path, tundra)
    Textures/         # PNG/JPG tile and decoration images
    Sounds/           # WAV audio files
```

## Running Locally
The workflow runs: `npx serve Tiles/development -l 5000`

Visit the preview at port 5000.

## Key Systems

### Save System (`slots.js`)
- 3 save slots stored in `localStorage` as `tileSave0`, `tileSave1`, `tileSave2`
- Autosave every 30 seconds when enabled
- Save payload includes: `playerStats`, `playerInventory`, `playerEquipment`, `followers`, `map`, `furries`, `visited`, `persistentEncounters`, `encounterState`, etc.
- `syncGameStateForSave()` in game.js syncs module-level vars to `window.*` for slots.js to read

### Inventory System (`game.js` ~line 5280+)
- `ITEM_DEFS` defines all item types (food, weapons, armor, rings, etc.)
- `playerInventory[]` holds up to 24 items; `playerEquipment{}` holds equipped slots
- `#inventoryPanel` — fixed bottom panel (slide-up, toggle with `▲ Toggle` button)
- `#equipmentModal` — full equipment screen with `#humanoidTemplate` drag-drop slots
- Inventory and equipment persist across saves
- Equipment buttons appear on player card and follower cards (not enemy cards)

### Walking Events System (`game.js` ~line 5560+)
- `checkWalkingEvent()` fires on tile movement (~7% chance)
- `isEventPending` flag blocks movement during events
- `#narratorChoices` div shows yes/no choice buttons in the narrator panel
- Events give inventory items (chests, bushes, packs, streams, camps)

### Encounter/Combat System (`game.js`)
- `persistentEncounters` tracks enemies encountered per tile (survive navigation)
- Turn-based combat with fight/flirt/feast/fuck/flee/feed actions
- `playerFeast()` gives hunger on success based on furry size; can fail and make enemy hostile
- HP bars use `.hp-fill`, `.hunger-fill`, `.flirt-fill` CSS classes

### UI Layout
- `#board` (fixed left, 260px) — player card + follower cards
- `#map` (center, grid) — tile map
- `#battleNarrator` (center below map) — narration log + event choices
- `#enemyBoard` (fixed right, 260px) — enemy card + enemy followers
- `#minimap` (fixed top-right, 220×220) — expandable to 440×440
- `#inventoryPanel` (fixed bottom-center) — collapsible inventory grid
- `#topLeftUI` (fixed top-left) — Menu + Save buttons

## Recent Changes
- Fixed broken/duplicate CSS `.stat-bar` block (lines 384–477 were malformed)
- Removed furry counter (`#furryCounter`) from HTML
- Added `#narratorChoices` HTML (`#eventChoiceA`, `#eventChoiceB`) to `#battleNarrator`
- Added full inventory panel HTML+CSS to `index.html`
- Added equipment modal HTML+CSS with `#humanoidTemplate` drag-drop slots
- Added Equipment button to player card in `#board`
- Fixed `feastFail` narrator call to pass `(currentFurry.type)` argument
- Added `playerInventory`, `playerEquipment`, `_nextItemId` to `syncGameStateForSave()`
- Added inventory loading/reset in `startGame()` (both new game and continue paths)
- Added inventory to `slots.js` save payload
- Fixed duplicate `getCurrentTileType` function declaration (removed redundant copy)
- Added `maxHp` safety guard in `startGame()` load path

## Deployment
Configured as a **static** deployment with `publicDir: "Tiles/development"`.
