/**
 * Interface to implement FL studio's timeposition datatype.
 */
export interface SongTimePosition {
  bar: number; // Musical bar. range: [1..inf]
  step: number; // Bar is subdivided into 16 steps. range: [1..16]
  tick: number; // Step is subdivided into timebase / 4 (default 96) steps. range: [0..(n-1)].
}

export interface TrackPinchNode extends TrackNode {
  finger: string; // Finger id for the corresponding pinch check (note: this is never thumb!).
}

export interface TrackNode {
  timePosition: SongTimePosition;
  normalizedPosition: [number, number]; // [x, y]
  soundKey: string; // Sound key for the target.
}

export interface PlayableTrackLayerData extends TrackLayerData {
  playable: true; // True if layer is playable.
  previewTime: SongTimePosition; // How far in advance are nodes spawned? Higher values give players a longer time to respond.
  // Number of nodes which must be pinched 'on time' before progressing to the next playable layer.
  // If >= nodes.length or == -1, all layer nodes must be pinched (100% perfect completion).
  progressCount: number;
  nodes: TrackNode[]; // List of nodes that are supposed to be spawned.
  backgroundLayers: string[]; // List of layer ids that play in the background.
  spriteKeyInner: string; // Sprite key for inner (static) target.
  spriteKeyOuter: string; // Sprite key for outer (shrinking) target.
}

export interface TrackLayerData {
  playable: boolean; // False if unplayable, true if playable.
  id: string; // Id of the layer.
  lengthInBars: number; // Length of this layer in bars, likely: 4, 8, 12, 16.
  soundLoopKeys: string[]; // List of sound per bpm that plays in a loop when this is not the current player.
}

export interface TrackData {
  id: string; // Id of the song
  displayName: string; // The name of the song that will be displayed in menus.
  bpm: number[]; // List of BPMs  the song is designed to play at.
  timeSignatureNumerator: number; // Default: 4.
  timeSignatureDenominator: number; // Default: 4.
  timeBasePPQ: number; // Set to 96 unless you are sure you need something else.
  layers: TrackLayerData[];
}
