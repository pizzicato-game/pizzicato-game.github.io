![5](https://github.com/user-attachments/assets/5177212a-fcff-4dc7-b25c-bbecc177b53b)

# Serious Game

This is a serious game developed for the Master's course "Building Serious Games" IN4302 at TU Delft. The publication accompanying it can be found [here](https://ieeexplore.ieee.org/document/10645594).

## Contributors

1. Ravi Snellenberg (Producer)
2. Joris Rijsdijk (Lead Designer)
3. Scott Jochems (Playtesting)
4. Martin Starkov (Lead Programmer)
5. Luca Stoffels (Lead Art and Sound)

## Available Commands

| Primary Commands | Description                                  |
| ---------------- | -------------------------------------------- |
| `npm install`    | Install project dependencies                 |
| `npm start` | Run local browser website (guest unless web setup was completed) |
| `npm run electron` | Run with Electron (locally) |
| `npm run build`  | Build a local version (in dist directory)    |
| `npm run build:exe` | Build a Windows executable folder directly in release |
| `npm run setup:web` | Easy setup for local Firebase browser login |
| `npm run check:web` | Check which Firebase project will be used |
| `npm run start:guest` | Run a guest-only browser demo |
| `npm run serve:build` | Test a production website build locally |
| `npm run admin:create -- EMAIL PATH` | Create a Firebase administrator (trusted machine only) |
| `npm run deploy` | Show GitHub Pages deployment instructions |

## Project Structure

`main.js` Entry point for Electron

`index.html` Entry point for HTML

`game.ts` Entry point for Phaser

`assets` Location of binary resources

## Dependencies

- [Node.Js](https://nodejs.org/en/download/) : Node.js LTS (GitHub Actions uses Node 22)
- [Phaser](https://phaser.io/) : HTML5 Game Framework
- [TypeScript](https://www.typescriptlang.org/) : Better than JavaScript

## Known Issues

From [natonato](https://github.com/natonato)'s [template repository](https://github.com/natonato/phaser3-typescript-vite-electron-template):

- Electron `useContentSize` not working properly.
  - Electron appears to include a title bar and menu in width/height by default.
  - `useContentSize` option was expected to solve this problem because it takes the size of the browser window and uses it, but the problem is that the phaser has set the 'height:100%' option throughout the document.
- Running Electron with Devtool, keyboard input ignored.
  - Devtool snatched keyboard input.

## Thanks to

[natonato](https://github.com/natonato) for his [great phaser electron template](https://github.com/natonato/phaser3-typescript-vite-electron-template).

## Unified Level Designer projects (Phases 1–3)

This version supports both bundled legacy MP4/MP3 levels and locally imported Level Designer JSON projects. From the main menu use **SELECT LEVEL** for legacy levels or **OPEN A LEVEL** to import and manage Designer JSON levels. Imported JSON levels use programmatically generated audio, can have their BPM/progression count adjusted, and persist locally in the browser profile. Run `npm run test:levels` for the format/asset regression checks. See [UNIFICATION_CHANGES.md](UNIFICATION_CHANGES.md) for the exact file changes, supported formats and testing limitations.

## Unified studies (phases 4–9 development branch)

This branch preserves the original Pizzicato game and unified Level Designer JSON loader, adds the four Leiden experiment levels, and introduces an optional Firebase-backed study manager with administrator/moderator/participant roles, per-week and participant-specific schedules, a central published JSON level library, local participant packs, and Electron study-data exports. The **default build still launches directly as a guest**.

**Non-coders: start with [docs/START_HERE.md](docs/START_HERE.md).** Detailed step-by-step guides:

- [Run the same online website locally with Firebase login](docs/LOCAL_WEB_SERVER.md)
- [Deploy `main` or `dev` to GitHub Pages](docs/GITHUB_PAGES.md)
- [Create a central admin database and administrator credentials](docs/ADMIN_DATABASE.md)
- [Advanced research/offline setup and limitations](docs/RESEARCH_SETUP.md)

Run `npm run setup:web` to choose a Firebase project **without changing any source code**. The local project configuration is ignored by Git; GitHub Pages uses a separate per-repository Actions secret with only PUBLIC Firebase web config. `npm test` checks level, study and web configuration source-level regressions before a release.

**Not yet verified:** an end-to-end Firebase deployment, browser runtime and actual camera/gameplay on a deployed GitHub Pages site. These must be checked before research with real participants.
