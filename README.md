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
| `npm run start`  | Run in Browser (open locally, hot reloading) |
| `npm run build`  | Build a local version (in dist directory)    |
| `npm run deploy` | Update website with changes                  |

## Project Structure

`main.js` Entry point for Electron

`index.html` Entry point for HTML

`game.ts` Entry point for Phaser

`assets` Location of binary resources

## Dependencies

- [Node.Js](https://nodejs.org/en/download/) : Node JS
- [Phaser](https://phaser.io/) : HTML5 Game Framework
- [TypeScript](https://www.typescriptlang.org/) : Better than JavaScript

## Known Issues

From [natonato](https://github.com/natonato)'s [template repository](https://github.com/natonato/phaser3-typescript-vite-electron-template):

- Electron `useContentSize` not working properly.
  - Electron appears to include a title bar and menu in width/height by default.
  - `useContentSize` option was expected to solve this problem because it takes the size of the browser window and uses it, but the problem is that the phaser has set the 'height:100%' option throughout the document.
- Running Electron with Devtool, keyboard input ignored.
  - Devtool snatched keyboard input.
- There was a bug in Electron `24.x.x`, so version 23 was used instead.

## Thanks to

[natonato](https://github.com/natonato) for his [great phaser electron template](https://github.com/natonato/phaser3-typescript-vite-electron-template).
