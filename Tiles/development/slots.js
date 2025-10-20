import { startGame } from './game.js';
// slots.js - handles save slots and world settings logic as a module

// Wait for DOM and game.js to load
window.addEventListener('DOMContentLoaded', () => {
  // All code from your inline script goes here, but using window.startGame

  const SAVE_PREFIX = 'tileSave';
  const SAVE_VERSION = 2;

  let currentSaveSlot = null;
  let timePlayedSeconds = 0;
  let timeTicker = null;
  let autosaveTicker = null;

  function saveKey(slot) { return `${SAVE_PREFIX}${slot}`; }
  function readSlot(slot) {
    try {
      const raw = localStorage.getItem(saveKey(slot));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      alert('Save corrupted—starting new.');
      // Optionally, delete the corrupted save:
      // localStorage.removeItem(saveKey(slot));
      return null;
    }
  }
  function writeSlot(slot, data) {
    try {
      localStorage.setItem(saveKey(slot), JSON.stringify(data));
    } catch (e) {
      alert('Failed to save game. Your browser may be out of space.');
    }
  }
  function deleteSlot(slot) {
    localStorage.removeItem(saveKey(slot));
  }
  function formatDuration(sec) {
    if (!sec || sec < 0) sec = 0;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  }
  function slotSummaryFromData(d) {
    const names = [d.playerName || 'Player'].concat(d.followers || []);
    return {
      title: d.playerName || 'Player',
      gameMode: d.gameMode || 'normal',
      mapSize: d.mapSize || 100,
      time: formatDuration(d.timePlayedSeconds || 0),
      xp: d.xp ?? 0,
      tiles: d.tilesWalked ?? 0,
      namesLine: names.join(' · ')
    };
  }
  function renderSlotsGrid() {
    const grid = document.getElementById('slotsGrid');
    grid.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const data = readSlot(i);
      const card = document.createElement('div');
      card.className = 'slot-card';
      card.dataset.slot = i;
      if (!data) {
        card.innerHTML = `
          <div class="slot-title">Slot ${i+1}</div>
          <div class="slot-empty">Empty — click to create</div>
        `;
      } else {
        const s = slotSummaryFromData(data);
        card.innerHTML = `
          <div class="slot-title">Slot ${i+1}: ${s.title}</div>
          <div class="slot-meta">Mode: ${s.gameMode} &nbsp;·&nbsp; World: ${s.mapSize}²</div>
          <div class="slot-meta">Time: ${s.time} &nbsp;·&nbsp; XP: ${s.xp} &nbsp;·&nbsp; Tiles: ${s.tiles}</div>
          <div class="names-row">${s.namesLine}</div>
        `;
      }
      card.addEventListener('click', () => openWorldSettings(i, data));
      grid.appendChild(card);
    }
  }
  function openSlotsWindow() {
    renderSlotsGrid();
    document.getElementById('slotsWindow').style.display = 'flex';
  }
  function closeSlotsWindow() {
    document.getElementById('slotsWindow').style.display = 'none';
  }
  function openWorldSettings(slot, existing) {
    currentSaveSlot = slot;
    window.currentSaveSlot = currentSaveSlot; // Update window reference
    document.getElementById('slotsWindow').style.display = 'none';
    const title = document.getElementById('wsTitle');
    const slotLabel = document.getElementById('wsSlotLabel');
    const nameInput = document.getElementById('wsPlayerName');
    const sizeSel = document.getElementById('wsMapSize');
    const modeSel = document.getElementById('wsMode');
    const autosaveCheck = document.getElementById('wsAutosave');
    const keepProgressCheck = document.getElementById('wsKeepProgress');
    const btnCont = document.getElementById('wsContinueBtn');
    const btnStart = document.getElementById('wsStartBtn');
    const btnDelete = document.getElementById('wsDeleteBtn');
    slotLabel.textContent = `Slot ${slot+1}`;
    if (existing) {
      title.textContent = 'World Settings — Edit / Continue';
      nameInput.value = existing.playerName || 'Player';
      sizeSel.value = String(existing.mapSize || 100);
      modeSel.value = existing.gameMode || 'normal';
      autosaveCheck.checked = existing.autosaveEnabled !== false; // Default to true for backwards compatibility
      keepProgressCheck.checked = existing.keepProgressOnDeath !== false; // Default to true for backwards compatibility
      btnCont.style.display = 'inline-block';
      btnDelete.style.display = 'inline-block';
      btnStart.textContent = 'Start New (Overwrite)';
      btnCont.onclick = () => {
        // Continue with saved settings (fresh world generation, same settings/meta)
        window.startFromSettings({
          slot,
          playerName: nameInput.value.trim() || 'Player',
          mapSize: parseInt(sizeSel.value,10),
          gameMode: modeSel.value,
          autosaveEnabled: autosaveCheck.checked,
          keepProgressOnDeath: keepProgressCheck.checked,
          continueSave: true,
          loadedData: existing
        });
      };
      btnDelete.onclick = () => {
        if (confirm('Delete this save? This cannot be undone.')) {
          deleteSlot(slot);
          document.getElementById('worldSettingsModal').style.display = 'none';
          openSlotsWindow();
        }
      };
    } else {
      title.textContent = 'World Settings — New World';
      nameInput.value = '';
      sizeSel.value = '100';
      modeSel.value = 'normal';
      autosaveCheck.checked = true; // Default to enabled for new worlds
      keepProgressCheck.checked = true; // Default to enabled for new worlds
      btnCont.style.display = 'none';
      btnDelete.style.display = 'none';
      btnStart.textContent = 'Start Game';
    }
    btnStart.onclick = () => {
      window.startFromSettings({
        slot,
        playerName: nameInput.value.trim() || 'Player',
        mapSize: parseInt(sizeSel.value,10),
        gameMode: modeSel.value,
        autosaveEnabled: autosaveCheck.checked,
        keepProgressOnDeath: keepProgressCheck.checked,
        continueSave: false,
        loadedData: existing || null
      });
    };
    document.getElementById('wsCancelBtn').onclick = () => {
      document.getElementById('worldSettingsModal').style.display = 'none';
      openSlotsWindow();
    };
    document.getElementById('worldSettingsModal').style.display = 'flex';
  }
  window.openSlotsWindow = openSlotsWindow;
  window.closeSlotsWindow = closeSlotsWindow;
  window.openWorldSettings = openWorldSettings;

  // Difficulty and game mode logic can stay in game.js

  // START GAME FROM SETTINGS
  window.startFromSettings = function({ slot, playerName, mapSize: ms, gameMode: gm, autosaveEnabled, keepProgressOnDeath, continueSave, loadedData }) {
    document.getElementById('worldSettingsModal').style.display = 'none';
    closeSlotsWindow();
    window.playerName = playerName;
    window.autosaveEnabled = autosaveEnabled;
    window.keepProgressOnDeath = keepProgressOnDeath;
    if (continueSave && loadedData) {
      // Overwrite loadedData's playerName, autosave, and keepProgress settings with the input
      loadedData.playerName = playerName;
      loadedData.autosaveEnabled = autosaveEnabled;
      loadedData.keepProgressOnDeath = keepProgressOnDeath;
      window.autosaveEnabled = autosaveEnabled;
      window.keepProgressOnDeath = keepProgressOnDeath;
      startGame(loadedData);
      startTimersForSaves(slot);
      setTimeout(() => quickAutosave(), 100); // Save with new name
    } else {
      window.mapSize = ms;
      if (typeof window.applyGameModeSettings === 'function') window.applyGameModeSettings(gm);
      startGame();
      setTimeout(() => {
        quickAutosave();
        startTimersForSaves(slot);
      }, 100);
    }
  };

  // AUTOSAVE + TIMER
  function startTimersForSaves(slot) {
    currentSaveSlot = slot;
    window.currentSaveSlot = currentSaveSlot; // Update window reference
    clearInterval(timeTicker);
    clearInterval(autosaveTicker);
    timeTicker = setInterval(() => { timePlayedSeconds++; }, 1000);
    
    // Only start autosave if enabled for this save
    const autosaveEnabled = window.autosaveEnabled !== false; // Default to true for backwards compatibility
    
    if (autosaveEnabled) {
      autosaveTicker = setInterval(() => { quickAutosave(); }, 30000);
    }
    
    window.addEventListener('beforeunload', quickAutosave);
  }
  
  function stopGameTimers() {
    clearInterval(timeTicker);
    clearInterval(autosaveTicker);
    timeTicker = null;
    autosaveTicker = null;
    currentSaveSlot = null;
    window.currentSaveSlot = null; // Update window reference
    timePlayedSeconds = 0;
    window.removeEventListener('beforeunload', quickAutosave);
  }
  function quickAutosave() {
    if (currentSaveSlot === null) return;
    
    // Special handling: if player is dead and keep progress is enabled, auto-revive them for save
    let shouldAutoRevive = false;
    if (window.isPlayerDead && window.keepProgressOnDeath) {
      shouldAutoRevive = true;
      console.log('[AUTO-REVIVE] Player is dead with keep progress enabled - auto-reviving for save');
      
      // Security: Validate player stats exist before modifying
      if (window.playerStats && typeof window.playerStats === 'object') {
        if (typeof window.playerStats.maxHp === 'number' && window.playerStats.maxHp > 0) {
          window.playerStats.hp = window.playerStats.maxHp;
        } else {
          // Fallback for corrupted maxHp
          window.playerStats.maxHp = 100;
          window.playerStats.hp = 100;
          console.warn('[AUTO-REVIVE] Fixed corrupted maxHp during save');
        }
      } else {
        console.error('[AUTO-REVIVE] playerStats is invalid, cannot auto-revive');
        return; // Don't save if player stats are corrupted
      }
      
      // Find a safe spawn location with error handling
      if (typeof window.findSafeSpawnLocation === 'function') {
        try {
          const safeLocation = window.findSafeSpawnLocation();
          if (safeLocation && window.playerPosition && typeof window.playerPosition === 'object') {
            window.playerPosition.x = safeLocation.x;
            window.playerPosition.y = safeLocation.y;
          }
        } catch (error) {
          console.error('[AUTO-REVIVE] Error finding safe location:', error);
        }
      }
      
      // Clear hostile encounter state to prevent save corruption
      window.currentFurry = null;
      window.enemyGroup = [];
      window.isPlayerDead = false; // Mark as revived for save
    }
    
    // Always sync all relevant state from game.js before saving
    if (typeof window.syncGameStateForSave === 'function') window.syncGameStateForSave();

    // Save full game state, including day/night and encounter state
    const payload = {
      version: SAVE_VERSION,
      playerName: window.playerName || 'Player',
      mapSize: window.mapSize || 100,
      gameMode: window.gameMode || 'normal',
      autosaveEnabled: window.autosaveEnabled !== false, // Default to true
      keepProgressOnDeath: window.keepProgressOnDeath !== false, // Default to true
      worldSeed: window.worldSeed ?? null,
      playerPosition: window.playerPosition ?? { x: 0, y: 0 },
      playerStats: window.playerStats ? { ...window.playerStats } : {},
      furryPopulation: (typeof window.getCurrentFurryCount === 'function') ? window.getCurrentFurryCount() : 0,
      timePlayedSeconds,
      xp: window.playerStats?.xp ?? 0,
      level: window.playerStats?.level ?? 1,
      tilesWalked: window.totalTilesWalked ?? 0,
      followers: window.followers ? JSON.parse(JSON.stringify(window.followers)) : [],
      map: window.map ? JSON.parse(JSON.stringify(window.map)) : [],
      furries: window.furries ? JSON.parse(JSON.stringify(window.furries)) : [],
      decorations: window.decorations ? JSON.parse(JSON.stringify(window.decorations)) : [],
      visited: window.visited ? JSON.parse(JSON.stringify(window.visited)) : [],
      persistentEncounters: window.persistentEncounters ? JSON.parse(JSON.stringify(window.persistentEncounters)) : {},
      cycleStartTime: window.cycleStartTime ?? null,
      encounterState: {
        currentFurry: window.currentFurry ? JSON.parse(JSON.stringify(window.currentFurry)) : null,
        currentEncounterPos: window.currentEncounterPos ? { ...window.currentEncounterPos } : null,
        currentEncounterKey: window.currentEncounterKey || null,
        enemyGroup: window.enemyGroup ? JSON.parse(JSON.stringify(window.enemyGroup)) : [],
        battleTurnOrder: window.battleTurnOrder ? JSON.parse(JSON.stringify(window.battleTurnOrder)) : [],
        battleTurnIndex: window.battleTurnIndex || 0,
      },
      lastSavedISO: new Date().toISOString()
    };
    // Debug: log exactly what is being saved
    console.log('[DEBUG] Manual Save Payload:', JSON.parse(JSON.stringify(payload)));
    writeSlot(currentSaveSlot, payload);
    
    // Show auto-save notification (only if not triggered by manual save)
    if (typeof window.showSaveNotification === 'function' && !window.isManualSaveInProgress) {
      window.showSaveNotification('Game Auto-Saved', 'auto');
    }
  }

  // Expose for manual save button
  window.quickAutosave = quickAutosave;
  window.stopGameTimers = stopGameTimers;
  window.currentSaveSlot = currentSaveSlot;

  // Startup hook
  window.renderSlotsGrid = renderSlotsGrid;
  document.getElementById('playButton')?.addEventListener('click', openSlotsWindow);
  document.getElementById('closeSlotsBtn')?.addEventListener('click', closeSlotsWindow);
});
