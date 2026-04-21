/* eslint-disable no-undef */
/* eslint @typescript-eslint/no-var-requires: "off" */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { app, protocol, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// NOTE: Change these file paths if you change the file structure.
const packageJsonPath = '../../package.json';
const electronPreloadPath = 'preload.js';
const appProtocolName = 'app';

const localHostURL = 'http://localhost:3000';

const packageJson = require(path.join(__dirname, packageJsonPath));
const packagedDistRoot = path.join(__dirname, '../../dist');

const capitalize = s => (s && s[0].toUpperCase() + s.slice(1)) || '';

const windowProperties = {
  title: capitalize(packageJson.name), // Use the name property of package.json as there window title.
  aspectRatio: 16 / 9,
  width: 1920,
  height: 1080,
  minWidth: 1280,
  minHeight: 720,
  maximize: true,
  center: true,
  stealFocus: true, // Required otherwise alt-tabbing causes huge desync of audio and visuals.
  openDevTools: false,
};

// At one point this was needed for something but now it seems obsolete.
// Leaving it in case commenting it broke something that will later need to be fixed.
protocol.registerSchemesAsPrivileged([
  {
    scheme: appProtocolName,
    privileges: {
      standard: true,
      secure: true,
      stream: true,
      supportFetchAPI: true,
      bypassCSP: true,
    },
  },
]);

// Let electron reload by itself.
if (
  process.env.ELECTRON_DEBUG === 'true' ||
  process.env.ELECTRON_DEBUG === 'vscode'
) {
  try {
    const electronReload = require('electron-reload');
    electronReload(__dirname, {});
  } catch (error) {
    console.warn('electron-reload is unavailable, skipping hot reload.');
  }
}

let mainWindow = undefined;

function registerAppProtocol() {
  protocol.registerFileProtocol(appProtocolName, (request, callback) => {
    const requestUrl = new URL(request.url);
    const requestedPath = decodeURIComponent(requestUrl.pathname).replace(
      /^\/+/,
      '',
    );
    const resolvedPath = requestedPath === '' ? 'index.html' : requestedPath;
    const executableRoot = path.dirname(app.getPath('exe'));
    const editableRoot = app.isPackaged ? executableRoot : packagedDistRoot;
    const shouldUseEditableRoot =
      resolvedPath.startsWith('data/') ||
      resolvedPath.startsWith('levels/') ||
      resolvedPath.startsWith('csv/');

    callback({
      path: path.join(
        shouldUseEditableRoot ? editableRoot : packagedDistRoot,
        resolvedPath,
      ),
    });
  });
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: windowProperties.title,
    center: windowProperties.center,
    width: windowProperties.width,
    height: windowProperties.height,
    minWidth: windowProperties.minWidth,
    minHeight: windowProperties.minHeight,
    autoHideMenuBar: true,
    useContentSize: true,
    frame: true,
    icon: path.join(__dirname, '../../dist/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, electronPreloadPath),
      contextIsolation: true,
      nodeIntegration: true,
      webSecurity: false,
      // allowRunningInsecureContent: true,
    },
  });
  if (windowProperties.maximize) {
    mainWindow.maximize();
  }

  // Hot reload.
  if (process.env.ELECTRON_HOT === 'true') {
    mainWindow.loadURL(localHostURL);
  } else {
    mainWindow.loadURL(`${appProtocolName}://-/index.html`);
  }

  if (process.env.ELECTRON_DEBUG === 'true' && windowProperties.openDevTools) {
    mainWindow.webContents.openDevTools();
  }

  // Maintain aspect ratio when scaling.
  mainWindow.setAspectRatio(windowProperties.aspectRatio);
  app.focus({ steal: windowProperties.stealFocus });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  registerAppProtocol();
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it is common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('get-app-path', () => {
  return app.isPackaged ? path.dirname(app.getPath('exe')) : app.getAppPath();
});
