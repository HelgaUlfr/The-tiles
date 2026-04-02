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
  example.html
  development/        # All source files served as the root
    index.html        # Main entry point
    game.js           # Core game engine
    slots.js          # Save slot management
    furries.js        # Character definitions
    narratorSettings.js
    *Narrator.js      # Biome-specific narrators
    Textures/         # PNG/JPG tile and decoration images
    Sounds/           # WAV audio files
```

## Running Locally
The workflow runs: `npx serve Tiles/development -l 5000`

Visit the preview at port 5000.

## Deployment
Configured as a **static** deployment with `publicDir: "Tiles/development"`.
