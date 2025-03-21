/* eslint-disable no-undef */
/* eslint @typescript-eslint/no-var-requires: "off" */
const { contextBridge, ipcRenderer } = require('electron');
// const fs = require('fs');
// const path = require('path');

window.addEventListener('DOMContentLoaded', async () => {
  // ...
});

let appPath = '';

contextBridge.exposeInMainWorld('electron', {
  initVariables: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('get-app-path')
        .then(appPathResult => {
          appPath = appPathResult;
          resolve(true);
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  getAppPath: () => appPath,
  isDebugMode: () => {
    return process.env.ELECTRON_DEBUG === 'true';
  },
  // storeData: (path, data) => storeData(path, data),
  // listSubDirectories: parentDir => listSubDirectories(parentDir),
  // fileExists: absoluteFilePath => fileExists(absoluteFilePath),
});

// function fileExists(absoluteFilePath) {
//   return fs.existsSync(absoluteFilePath);
// }

// function listSubDirectories(parentDir) {
//   return fs
//     .readdirSync(parentDir, { withFileTypes: true })
//     .filter(dirent => dirent.isDirectory())
//     .map(dirent => dirent.name);
// }

// function storeData(filePath, data) {
//   fs.mkdirSync(path.dirname(filePath), { recursive: true });
//   fs.writeFileSync(filePath, data);
// }

// function loadData(filePath) {
//   return fs.readFileSync(filePath, 'utf8');
// }
