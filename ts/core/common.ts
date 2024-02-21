import { Vector2 } from 'core/phaserTypes';

export function assert(
  value: boolean,
  message: string = 'no error message provided',
) {
  // TODO: This if-statement works but see if there is a way to
  // undefine the entire assert function when debugMode is false.
  if (window.electron.isDebugMode()) {
    if (!value) {
      throw new Error('Assertion failed: ' + message);
    }
  }
}

export function fileExistsRelative(relativeFilePath: string): boolean {
  return window.electron.fileExists(absPath(relativeFilePath));
}

export function fileExistsAbsolute(absoluteFilePath: string): boolean {
  return window.electron.fileExists(absoluteFilePath);
}

// Converts relative file paths to absolute ones (relative to root directory) (for executable and hot run to work correctly).
export function absRootPath(
  relPath: string,
  relativeToRootDir: string = '',
): string {
  // Format correct slashes.
  const path: string =
    window.electron.getAppPath().replace(/\\/g, '/') + relativeToRootDir;
  relPath = relPath.replace(/\\/g, '/');
  const startsWithSlash: boolean = Array.from(relPath)[0] == '/';
  // TODO: Add further checks for file path correctness.
  const absolutePath: string = startsWithSlash
    ? path + relPath
    : path + '/' + relPath;
  return absolutePath;
}

// Converts relative file paths to absolute ones (relative to src directory) (for executable and hot run to work correctly).
export function absPath(relPath: string): string {
  return absRootPath(relPath, '/src');
}

/**
 * Converts a normalized position (between 0 and 1) to a position in the window.
 *
 * @param x The normalized x-coordinate.
 * @param y The normalized y-coordinate.
 * @returns The corresponding position in the window.
 *
 * **Note:** The input values `x` and `y` must be between 0 and 1.
 */
export function normalizedToWindow(
  position: Vector2 | [number, number],
): Vector2 {
  if (position instanceof Vector2) {
    return new Vector2(
      position.x * window.innerWidth,
      position.y * window.innerHeight,
    );
  } else {
    return new Vector2(
      position[0] * window.innerWidth,
      position[1] * window.innerHeight,
    );
  }
}

// Returns a subset of array1 and array2 which contains only objects occurring in both arrays.
export function getCommonItems<T>(array1: T[], array2: T[]): T[] {
  // Convert both arrays into unique sets using the Set data structure
  const set1: Set<T> = new Set(array1);
  const set2: Set<T> = new Set(array2);

  // Create a new set to store overlapping items
  const overlappingSet: Set<T> = new Set();

  // Iterate through both sets and add common elements to the overlapping set
  for (const item of set1) {
    if (set2.has(item)) {
      overlappingSet.add(item);
    }
  }

  // Convert the overlapping set to an array
  const overlappingArray: T[] = [...overlappingSet];

  return overlappingArray;
}
export { Vector2 };
