# Pizzicato — Phases 1–3: unified level loading

## Foundation and scope

This branch is based on **`pizzicato-game.github.io-main.zip`**, not a replacement with the Level Editor repo. The three bundled legacy levels (Birthday Vibes, Cheerful Bliss, Slow Elegance), their MP4 preview movies, PNG backgrounds, note audio and backing-loop audio remain **byte-for-byte unchanged**. The login default, CSV recording, hand-tracking, score logic, Electron entry point and webpack configuration remain those of the original Pizzicato Game.

Level Designer / Level Editor projects now load through the **same `Level`, `Track`, `PlayableLayer`, target, scoring, metronome and scoreboard pipeline** as the legacy levels. A JSON project is converted into the internal `TrackData` representation when imported. The old `info.json` levels are not converted, and their existing media paths are preserved.

## How to use

1. Run `npm install` and `npm start` from this repository. (Production browser build: `npm run build`; Electron: `npm run electron`.)
2. On the main menu, choose **SELECT LEVEL** for the original bundled levels, or **OPEN A LEVEL** to upload a Level Designer/Level Editor project `.json`.
3. Upload a Level Designer **exported project JSON**, not its MIDI file. Object-style `music.tracks` plus a string `music.timeSignature`, and older array-style tracks plus object time signatures, are both accepted.
4. On **Level Settings**, adjust the base BPM/progression threshold and choose **PLAY LEVEL**. Uploaded levels are saved to **this browser's localStorage** and appear in the upload screen's list for later play/edit/delete. They are not sent to Firebase.
5. Three BPM values are retained in the imported `TrackData` schema (base, base × 1.25, base × 1.5), but the current imported-level UI plays at the **configured base BPM**. The alternate generated BPMs are reserved for later level-selection integration; original bundled levels still have their three authored difficulty buttons. Pre-recorded legacy levels continue to use their own authored BPMs and audio assets.

**Important:** The original camera/hand-tracker setup and browser audio autoplay restrictions still apply. The new notes use browser Web Audio to generate piano-like PCM; they do not need separate MP3s/MP4s. For playable imported levels, unassigned note positions fall back to deterministic target positions. Trigger/support relationships are grouped into a chord or timed sequence. The original Level Designer is not embedded in this game; editing the notes/positions still happens in that separate app. The included `tests/fixtures/designer-export.json` is a small sample file suitable for testing the import UI.

## Exact change inventory relative to original Pizzicato Game ZIP

### Added (new files)

- `src/ts/util/levelConverter.ts` — accepts current Designer (`tracks` as name-to-notes object, signature string) and old Level Editor (`tracks` array, signature object); validates notes, preserves finger/position/trigger-support grouping, computes bars/steps, outputs internal `TrackData` with programmatic notes/chords/sequences.
- `src/ts/util/noteGenerator.ts` — Level Editor's note/chord/sequence and backing-loop generator, adapted to populate Phaser's audio cache directly instead of leaking blob URLs; handles sequence chords in backing loops.
- `src/ts/util/pianoSampler.ts` — Level Editor's synthesized piano sample generation.
- `src/ts/util/retimeProgrammaticLevel.ts` — rescales programmatic note/chord/sequence lengths when the uploaded level's base BPM is changed.
- `src/ts/managers/uploadedLevelManager.ts` — browser-local saved-level list, level data, metadata, delete, storage stats and in-place safe update with rollback on failure.
- `src/ts/scenes/levelUploadScene.ts` — JSON file selection/drag-drop, validation, conversion, saved-level browse/play/edit/delete and cleanup of DOM event listeners on scene exit.
- `src/ts/scenes/bpmAdjustmentScene.ts` — imported-level tempo and progression settings, saving imported level, and playback.
- `scripts/test-level-formats.js` — automated source-and-format regression tests (requires TypeScript, installed as an existing development dependency).
- `tests/fixtures/designer-export.json` — representative Level Designer exported JSON with a chord, placed targets and a timed sequence.
- `UNIFICATION_CHANGES.md` — this integration document.

### Modified (existing files)

- `README.md` — adds a short usage introduction linking to this detailed change log.
- `package.json` — adds `npm run test:levels`. **No production dependency changes.**
- `src/ts/core/game.ts` — registers `levelUpload` and `bpmAdjustment` scenes.
- `src/ts/scenes/mainMenuScene.ts` — rearranges menu buttons to offer **OPEN A LEVEL** while retaining legacy level selection, calibration, and options.
- `src/ts/level/trackTypes.ts` — declares programmatic note/chord/sequence nodes and optional background type; programmatic nodes carry the same finger field as legacy targets.
- `src/ts/level/track.ts` — loads either file-based or in-memory level data; generates sound buffers for programmatic nodes; handles backing tracks without audio files; generates completed-layer backing loops; includes sequence audio; handles 3/4 and 6/8 note timing; preserves original level-specific MP3 paths/rates; removes generated audio on unload.
- `src/ts/level/level.ts` — keeps the old preview MP4/background PNG loading path; skips nonexistent media for imported JSON levels; creates backing audio for completed imported layers, not legacy ones; resets progression-related temporary state between plays.
- `src/ts/scenes/levelScene.ts` — preloads imported levels and sets the initial BPM before gameplay (without resetting the selected legacy difficulty); clears temporary level audio on abort.
- `src/ts/scenes/levelSelectScene.ts` — stops legacy preview audio when leaving the selection scene or starting a level.
- `src/ts/scenes/scoreboardScene.ts` — preserves the original 1–3-layer scoreboard and supports a compact layout for levels with 4+ playable tracks; frees imported-level audio when exiting.

### Removed

- **No original repository files or legacy assets were removed.** The Level Editor's substitute `beat.wav` was deliberately **not** bundled, and its behavior that substituted another legacy level's drum loop was **not** adopted.

## Tests performed

**Passing:** `node scripts/test-level-formats.js` (47 source `.ts` files parse, checks all 3 bundled legacy `info.json` files plus their 36 MP3 loop and 124 note references, checks both Designer JSON representations, chord/sequence conversion, music timing in 6/8, BPM retiming, and mocked Track loading that verifies legacy MP3 paths versus programmatic-audio paths).

**Passing:** standalone strict TypeScript type-check of `levelConverter.ts`, `retimeProgrammaticLevel.ts` and `trackTypes.ts`.

**Not run here:** full webpack/TypeScript application build, Electron executable build and real browser/audio/hand-tracking gameplay. The execution environment could not resolve `registry.npmjs.org`, so the original npm dependencies were unavailable. After `npm install` on a developer machine, run `npm run test:levels`, `npm run lint` and `npm run build`, and manually test each bundled level and an exported Designer JSON in Chrome/Electron before merging to `main`.

## Deliberately deferred

No study database, experiment progression, admin/moderator roles or central level library (Phases 4+) were introduced. Uploaded JSON storage is local to the browser profile; syncing levels across devices and deploying a research fork remain separate work. Note synthesis still needs a real-device auditory/latency check before scientific use.
