import { GameObject, MatterOverlapData, Vector2 } from '../core/phaserTypes';
import { Track } from '../level/track';

// Interfaces

export interface ConfigData {
  targetSize: number;
  fingerSize: number;
  // On which loop does the skip option become available.
  enableSkipButton: boolean;
  skipLoopThreshold: number;

  singlePinchRequirement: boolean;
  disableVisualMetronome: boolean;
  fancyEffectsDisabled: boolean;

  enableCameraVisibility: boolean;
  cameraOpacity: number;

  enableAutoSkip: boolean;
  autoSkipThreshold: number;
  autoSaveCSV: boolean;

  disableLayerProgression: boolean;
  disableSonification: boolean;
  indexFingerOnly: boolean;

  sonificationLevel: number;
  backgroundMusicLevel: number;

  onTimeDuration: number;
  lateTimeDuration: number;

  [key: string]: unknown;
}

export interface TargetTweenOptions {
  // Relative to displayWidth and displayHeight of the inner target sprite.
  scale: number;
  // Tint of the inner target sprite.
  color: number;
  // Tween transition function.
  ease: string;
}

export interface TextOptions {
  position: Vector2;
  color: string;
  font: string;
  scale: number;
  depth: number;
  ease?: string;
}

export interface WebcamOptions {
  visible: boolean;
  flip: boolean;
  opacity: number;
  objectFit: string; // 'fill', etc
}

export interface LandmarkOptions {
  lineWidth: number;
  color: number;
  alpha: number;
  radius: number;
}

export interface LandmarkConnectionOptions {
  lineWidth: number;
  color: number;
  alpha: number;
}

export interface PinchCallbacks {
  startPinch?: () => void;
  pinched?: () => void;
  endPinch?: () => void;
  startHover?: () => void;
  hovering?: () => void;
  endHover?: () => void;
}

export interface Observer {
  object: GameObject;
  fingerName: string;
  wasHovering?: boolean;
}

export type OverlapCallback = (overlap?: MatterOverlapData) => void;

export interface HitInfo {
  noteID: number; // What's the noteID in the loop.
  loopNumber: number; // What's the loop count when this was played?
  playerTime: number; // When player hit the target. -1 if the player missed the target.
  correctTime: number; // When player was supposed to hit the target.
  classification: string; // Categorical attribute that denotes what we classified this hit as, see score.ts class.
}

export class LayerStats {
  total: number = 1; // Default: 1 to avoid potential division by 0 errors.
  required: number = 1; // Default: 1 to avoid potential division by 0 errors.
  correct: number = 0;
  early: number = 0;
  late: number = 0;
  miss: number = 0;
  loop: number = 1; // Starts from 1 for human readability.
  hits: Array<HitInfo> = [];
}

export class LevelStats {
  constructor(track: Track) {
    this.id = `${track.data.displayName.replace(/\s/g, '')}@${track.getBPM()}bpm_${new Date()
      .toLocaleString('en-GB')
      .replace(/\s/g, '')
      .replace(/,/g, '_')
      .replace(/[:/]/g, '-')}`;
  }

  id: string;
  maxStreak: number = 0;
  layersStats: Array<LayerStats> = [];
}
