/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

// eslint-disable-next-line no-undef
const repositoryRoot = path.resolve(__dirname, '..');
const releaseRoot = path.join(repositoryRoot, 'release');
const unpackedRoot = path.join(releaseRoot, 'win-unpacked');
const distRoot = path.join(repositoryRoot, 'dist');

function removeEntry(entryPath) {
  fs.rmSync(entryPath, { recursive: true, force: true });
}

function copyDirectoryContents(sourceDir, destinationDir) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  fs.mkdirSync(destinationDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);
    fs.cpSync(sourcePath, destinationPath, {
      recursive: true,
      force: true,
      dereference: true,
    });
  }
}

function flattenReleaseFolder() {
  if (!fs.existsSync(unpackedRoot)) {
    throw new Error(`Expected unpacked build output at ${unpackedRoot}`);
  }

  for (const entry of fs.readdirSync(releaseRoot, { withFileTypes: true })) {
    if (entry.name === 'win-unpacked') {
      continue;
    }
    removeEntry(path.join(releaseRoot, entry.name));
  }

  copyDirectoryContents(unpackedRoot, releaseRoot);

  copyDirectoryContents(
    path.join(distRoot, 'data'),
    path.join(releaseRoot, 'data'),
  );
  copyDirectoryContents(
    path.join(distRoot, 'levels'),
    path.join(releaseRoot, 'levels'),
  );

  removeEntry(unpackedRoot);
}

flattenReleaseFolder();
