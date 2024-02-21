const handPalmConnections: [number, number][] = [
  [0, 1],
  [0, 5],
  [9, 13],
  [13, 17],
  [5, 9],
  [0, 17],
];

const handThumbConnections: [number, number][] = [
  [1, 2],
  [2, 3],
  [3, 4],
];

const handIndexFingerConnections: [number, number][] = [
  [5, 6],
  [6, 7],
  [7, 8],
];

const handMiddleFingerConnections: [number, number][] = [
  [9, 10],
  [10, 11],
  [11, 12],
];

const handRingFingerConnections: [number, number][] = [
  [13, 14],
  [14, 15],
  [15, 16],
];

const handPinkyFingerConnections: [number, number][] = [
  [17, 18],
  [18, 19],
  [19, 20],
];

export const handConnections: Set<[number, number]> = new Set([
  ...handPalmConnections,
  ...handThumbConnections,
  ...handIndexFingerConnections,
  ...handMiddleFingerConnections,
  ...handRingFingerConnections,
  ...handPinkyFingerConnections,
]);
