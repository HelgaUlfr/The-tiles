# Tiles

This repository contains a simple browser-based tile adventure game.

## Playing

Open `development/index.html` in a modern web browser. A local HTTP server is recommended. On systems with Node.js installed you can run:

```bash
npx serve development
```

Then navigate to the shown URL.

## Features

- Configurable world settings:
  - Player name entry
  - Map sizes from 100x100 up to 1000x1000
  - Game modes: Peaceful, Easy, Normal, Hard
- Three save slots with settings stored in the browser
- Click or use **WASD** / arrow keys to move
- Random furry encounters with battle options
- Recruit followers and watch their stats
- On-screen minimap to track your position
- World wraps around so walking off one edge brings you to the opposite side
- Randomly generated mountains made of rock tiles

All source files are located in the `development` directory.