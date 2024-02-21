import { HandLandmarkerOptions } from '@mediapipe/tasks-vision';
import {
  LandmarkConnectionOptions,
  LandmarkOptions,
  TargetTweenOptions,
  TextOptions,
  WebcamOptions,
} from 'core/interfaces';
import { Vector2, normalizedToWindow } from 'core/common';
import { ParticleEmitterConfig, TextStyle } from './phaserTypes';

// Texture keys

export const fingerSpriteKey: string = 'finger';
export const previewVideoBackgroundTextureKey: string =
  'previewVideoBackground';
export const songNameBackgroundTextureKey: string = 'songNameBackground';
export const layerScoreBackgroundTextureKey: string = 'layerScoreBackground';
export const scoreboardBackgroundTextureKey: string = 'scoreboardBackground';
export const menuCalibrateButtonTextureKey: string = 'menuCalibrateButton';
export const menuSelectButtonTextureKey: string = 'menuSelectButton';
export const optionsButtonTextureKey: string = 'optionsButton';
export const targetInnerTextureKey: string = 'targetInner';
export const targetOuterTextureKey: string = 'targetOuter';
export const optionsBackgroundTextureKey: string = 'background1';
export const infoBackgroundTextureKey: string = 'infoBackground';
export const backgroundTextureKey: string = 'mainBackground';
export const playButtonTextureKey: string = 'playButton';
export const easyButtonTextureKey: string = 'easyButton';
export const mediumButtonTextureKey: string = 'mediumButton';
export const hardButtonTextureKey: string = 'hardButton';
export const backButtonTextureKey: string = 'backButton';
export const skipButtonTextureKey: string = 'skipButton';
export const buttonPinchSoundKey: string = 'buttonDing';
export const calibrationBackgroundTextureKey: string = 'calibrationBackground';
export const logoTextureKey: string = 'menuLogo';
export const resetButtonTextureKey: string = 'resetButton';
export const muteButtonTextureKey: string = 'muteButton';
export const unmuteButtonTextureKey: string = 'unmuteButton';
export const leftArrowTextureKey: string = 'leftArrow';
export const rightArrowTextureKey: string = 'rightArrow';
export const saveCSVButtonTextureKey: string = 'saveCSVButton';
export const defaultLevelBackgroundKey: string = 'defaultLevelbackground';
export const defaultLevelPreviewKey: string = 'defaultPreviewbackground';

// Texture paths

export const fingerSpritePath: string = 'assets/sprites/finger.png';
export const previewVideoBackgroundTexturePath: string =
  'assets/ui/video_background.png';
export const songNameBackgroundTexturePath: string =
  'assets/ui/song_name_background.png';
export const menuCalibrateButtonTexturePath: string =
  'assets/ui/menu_setup_camera.png';
export const menuSelectButtonTexturePath: string =
  'assets/ui/menu_select_level.png';
export const infoBackgroundTexturePath: string =
  'assets/ui/info_background.png';
export const optionsButtonTexturePath: string = 'assets/ui/menu_options.png';
export const targetInnerTexturePath: string =
  'assets/sprites/defaultTargetInner.png';
export const targetOuterTexturePath: string =
  'assets/sprites/defaultTargetOuter.png';
export const optionsBackgroundPath: string = 'assets/ui/options_background.png';
export const layerScoreBackgroundPath: string =
  'assets/ui/layer_score_background.png';
export const scoreboardBackgroundPath: string =
  'assets/ui/scoreboard_background.png';
export const backgroundTexturePath: string = 'assets/ui/menu_background.png';
export const playButtonTexturePath: string = 'assets/ui/play_button.png';
export const easyButtonTexturePath: string = 'assets/ui/easy_button.png';
export const mediumButtonTexturePath: string = 'assets/ui/medium_button.png';
export const hardButtonTexturePath: string = 'assets/ui/hard_button.png';
export const backButtonTexturePath: string = 'assets/ui/back_button.png';
export const skipButtonTexturePath: string = 'assets/ui/skip_button.png';
export const buttonPinchSoundPath: string = 'assets/sounds/ui/menu_ding.wav';
export const saveCSVButtonTexturePath: string = 'assets/ui/save_csv_button.png';
export const calibrationBackgroundTexturePath: string =
  'assets/ui/calibration_background.png';
export const logoTexturePath: string = 'assets/ui/menu_logo.png';
export const resetButtonTexturePath: string = 'assets/ui/reset_button.png';
export const muteButtonTexturePath: string = 'assets/ui/mute_button.png';
export const unmuteButtonTexturePath: string = 'assets/ui/unmute_button.png';
export const leftArrowTexturePath: string = 'assets/ui/left_arrow.png';
export const rightArrowTexturePath: string = 'assets/ui/right_arrow.png';
export const defaultLevelBackgroundPath: string =
  'assets/ui/default_level_background.png';
export const defaultLevelPreviewPath: string =
  'assets/ui/default_preview_background.png';

// Music

export const barLength: number = 4;
export const ticksPerBar: number = 16;
export const levelDir: string = 'levels/';
export const soundFileExtension: string = '.ogg';
export const levelJsonFileName: string = 'info.json';
export const levelBackgroundFileName: string = 'background.png';
export const levelPreviewFileName: string = 'preview.mp4';

// CSV

export const correctTargetId: string = 'correct';
export const earlyTargetId: string = 'early';
export const lateTargetId: string = 'late';
export const missedTargetId: string = 'missed';
export const skippedTargetId: string = 'skipped';

export const csvFilePath = '/csv/';
export const csvFileExtension = '.csv';

// Config file

export const configFilePath = 'data/config.json';
export const defaultConfigFilePath = 'data/default_config.json';

// Hand color and scale

// This is baseline relative to the sprite, not related to the finger scale option.
export const fingerSpriteScale: number = 0.3;

export const fingerColors: { [key: string]: number } = {
  thumb: 0xffffff,
  index: 0xe41a1c,
  middle: 0x984ea3,
  ring: 0x377eb8,
  pinky: 0xf781bf,
};

export const handLandmarkConnectionOptions: LandmarkConnectionOptions = {
  lineWidth: 5,
  color: 0xadd8e6,
  alpha: 0.5,
};

export const handLandmarkOptions: LandmarkOptions = {
  lineWidth: 5,
  color: 0xadd8e6,
  alpha: 1,
  radius: 0.1,
};

// Hand distance calibration

export const palmHeight = 10; // (centimeters)
export const palmWidth = 8.2; // (centimeters)
export const focalLength = 0.7; // (centimeters)

export const thumbFingerId: string = 'thumb';
export const indexFingerId: string = 'index';
export const middleFingerId: string = 'middle';
export const ringFingerId: string = 'ring';
export const pinkyFingerId: string = 'pinky';

// Hand UI interaction

export const buttonPinchFinger: string = indexFingerId;
export const uiHoverColor: number = 0xffffff; // white
export const difficultyButtonChosenTint: number = 0xe41a1c; // red

// Target general properties

// By how much is the progress incremented (must be integers) when the player hits a target.
export const targetSkipProgressImpact: number = -1;
export const targetMissProgressImpact: number = -1;
export const targetHitEarlyProgressImpact: number = 0;
export const targetHitLateProgressImpact: number = 0;
export const targetHitOnTimeProgressImpact: number = +1;

export const targetTextOptions = {
  font: '20px Arial',
  color: 'white',
};

export const targetRotationDuration: number = 1000; // Milliseconds.
export const targetRotationEase: string = 'linear';

export const targetCollisionLabel: string = '-node-';

// Target colors and scaling

// Do not change this, go up to the texture keys and paths instead.
export const targetTextureOptions = {
  keyInner: targetInnerTextureKey,
  keyOuter: targetOuterTextureKey,
  pathInner: targetInnerTexturePath,
  pathOuter: targetOuterTexturePath,
};

// Relative to the inner sprite.
export const outerRingStartScale: number = 0.5;

export const targetGlowOptions = {
  color: 0xffffff,
  quality: 0.05,
  distance: 24,
  outerStrength: 4,
  ease: 'linear',
};
export const earlyTargetOptions: TargetTweenOptions = {
  scale: 1.03, // Scale to which outer ring shrinks relative to inner sprite.
  color: 0xffffff, // (no tint).
  ease: 'linear',
};
export const onTimeTargetOptions: TargetTweenOptions = {
  scale: 0.78,
  color: 0x4daf4a,
  ease: 'linear',
};
export const lateTargetOptions: TargetTweenOptions = {
  scale: 0.3,
  color: 0xff7f00,
  ease: 'linear',
};
export const deadTargetOptions = {
  scale: 0,
  color: 0x808080,
  ease: 'cubic.in',
};
export const targetDeathDuration = 400; // milliseconds

// Level / layer

// Time delay before level starts playing after entering the level.
export const levelStartTimeDelay: number = 1000; // milliseconds
// Time delay before each layer starts playing. Not applicable to the first layer.
export const layerStartTimeDelay: number = 1000; // milliseconds

// Escape key

export const escapeKey: string = 'keydown-ESC';

// Initial loading / preload screen

export const preloadScreenText: string = 'Loading Webcam and Hand Tracker...';
export const preloadTextStyle: TextStyle = {
  font: '32px Courier',
  color: '#00ff00',
};
export const backgroundTextureOpacity: number = 0.9;

// Constants

export const levelPrefix: string = 'level';
export const minuteInMilliseconds: number = 60 * 1000;

// Streak

export const streakOnFireDuration: number = 1000; // milliseconds
export const streakOnFireColorWheelExtent: number = 30; // 1 to 255.

export const streakStartRequirement: number = 1;
export const streakOnFireRequirement: number = 2;

export const streakInfoText: string = 'Streak: ';

// By how much is the streak incremented when a player hits the target on time.
export const targetHitOnTimeStreakImpact: number = +1;

export const streakTextOptions = {
  position: normalizedToWindow(new Vector2(0.05, 0.05)),
  color: 'white',
  scale: 1,
  font: '30px Arial',
  depth: 40,
  strokeThickness: 0,
  shadowOffset: new Vector2(2, 2),
  shadowColor: 'black',
  shadowBlurRadius: 2,
};

export const streakFireOptions: ParticleEmitterConfig = {
  color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
  colorEase: 'quad.out',
  lifespan: 500,
  scale: { start: 0.7, end: 0, ease: 'sine.out' },
  speed: 200,
  advance: 500,
  frequency: 50,
  blendMode: 'ADD',
  duration: 0,
};

export const streakParticleOptions = {
  key: 'flare',
  path: 'assets/sprites/flare.png',
};

// Progress bar

// In the JSON setting a layer's progressCount to this value is
// interpreted as all the nodes of the layer being required to progress
export const entireLayerProgressRequired: number = -1;
export const startingProgress: number = 0;

export const progressBarOptions = {
  position: normalizedToWindow(new Vector2(0.5, 0)),
  size: normalizedToWindow(new Vector2(0.4, 0.04)),
  requiredTint: 0x0800ff,
  completedRequiredTint: 0x2b58a5,
  completedTint: onTimeTargetOptions.color,
  extraTint: onTimeTargetOptions.color, // Used to be: 0x0633cc
  path: 'assets/ui/progress_bar_segment.png',
  key: 'segment',
  tintByNode: false,
};

// Metronome

export const metronomeMinimumBarCount: number = 1;

export const metronomeOptions = {
  highKey: 'metronome/high',
  highPath: 'assets/sounds/metronome/high.ogg',
  lowKey: 'metronome/low',
  lowPath: 'assets/sounds/metronome/low.ogg',
};

export const countdownTextureOptions = {
  scale: 1,
  depth: 30,
  opacity: 0.3,
  key: 'countdown',
  path: 'assets/sprites/countdown.png',
};

export const countdownTextOptions: TextOptions = {
  position: normalizedToWindow(new Vector2(0.5, 0.5)),
  color: 'white',
  scale: 1,
  ease: 'Power0',
  font: '240px Arial',
  depth: 30,
};

// Info HUD (with all the layer and track info)

export const trackInfoText: string = 'Track: ';
export const loopInfoText: string = 'Loop: ';
export const layerInfoText: string = 'Layer: ';
export const layerDividerSymbol: string = '/';
export const difficultyInfoText: string = 'Difficulty: ';
export const bpmInfoText: string = 'BPM: ';

export const difficultyTextEasy: string = 'Easy';
export const difficultyTextMedium: string = 'Medium';
export const difficultyTextHard: string = 'Hard';

export const infoBackgroundOptions = {
  position: normalizedToWindow(new Vector2(0.835, 0)),
  size: new Vector2(0.16 * window.innerWidth, 0.2684 * window.innerHeight),
  textureKey: infoBackgroundTextureKey,
  opacity: 0.3,
  path: infoBackgroundTexturePath,
};

export const skipButtonOptions = {
  position: normalizedToWindow(new Vector2(0.93, 0.9)),
  scale: new Vector2(0.3, 0.3),
  soundKey: buttonPinchSoundKey,
  textureKey: skipButtonTextureKey,
  path: skipButtonTexturePath,
};

export const trackTextOptions: TextOptions = {
  position: normalizedToWindow(new Vector2(0.85, 0.02)),
  color: 'white',
  font: '20px Arial',
  scale: 1,
  depth: 40,
};

export const difficultyTextOptions: TextOptions = {
  position: normalizedToWindow(new Vector2(0.85, 0.07)),
  color: 'white',
  font: '20px Arial',
  scale: 1,
  depth: 40,
};

export const bpmTextOptions: TextOptions = {
  position: normalizedToWindow(new Vector2(0.85, 0.12)),
  color: 'white',
  font: '20px Arial',
  scale: 1,
  depth: 40,
};

export const layerTextOptions: TextOptions = {
  position: normalizedToWindow(new Vector2(0.85, 0.17)),
  color: 'white',
  font: '20px Arial',
  scale: 1,
  depth: 40,
};

export const loopTextOptions: TextOptions = {
  position: normalizedToWindow(new Vector2(0.85, 0.22)),
  color: 'white',
  font: '20px Arial',
  scale: 1,
  depth: 40,
};

// Level select scene

export const levelSelectSongNameOptions = {
  font: '50px Courier New',
  color: 'white',
};

export const defaultDifficultyButtonIndex: number = 0; // 0 Easy, 1 Medium, 2 Hard, etc.

// Calibration scene

export const calibrationMenuWebcamOpacity: number = 0.8; // 0 to 1.
export const handTooFarThreshold: number = 40; // centimeters.
export const handTooCloseThreshold: number = 20; // centimeters.

export const handDistanceTextOptions = {
  font: '60px Arial',
  color: 'white',
};
export const handDistanceTextShadowOptions = {
  x: 5,
  y: 5,
  color: 'rgba(0,0,0,0.5)',
  blur: 15,
};
export const handNotFoundText: string = 'Hand Not Recognized';
export const handTooFarText: string = 'Too Far - Estimated Distance: ';
export const handTooCloseText: string = 'Too Close - Estimated Distance: ';
export const handJustRightText: string = 'Just Right - Estimated Distance: ';
export const appendHandDistanceToText: boolean = true;
export const handDistanceUnitText: string = 'cm';

export const handTooFarColor: number = 0xff0000;
export const handTooCloseColor: number = 0x0000ff;
export const handJustRightColor: number = 0x00ff00;

// Scoreboard scene

export const scoreboardBackgroundAudioFeintness: number = 0.5;

// Level select scene

export const levelSelectDefaultLevel: number = 0;
export const levelSelectBackgroundAudioFeintness: number = 0.5;
export const levelSelectVideoOffset: number = 0.1; // Percentage vertically upward.

// User interface scales

export const levelSelectVideoScale: Vector2 = new Vector2(0.5, 0.5);
export const standardButtonScale: Vector2 = new Vector2(0.6, 0.6);
export const muteButtonScale: Vector2 = new Vector2(1.5, 1.5);

// User interfaces ratios

export const optionsCheckboxOffset = new Vector2(-32, -32);
export const optionsSliderLabelOffset = new Vector2(32, -32);
export const optionsButtonGap = 0.1;
export const optionsButtonTopLevel = 0.9;

export const calibrationButtonBottomLevel = 0.9;
export const calibrationTextTopLevel = 0.1;

export const levelSelectbuttonTopLevel = 0.07;
export const levelSelectLeftButtonOffset = 0.4;
export const levelSelectRightButtonOffset = 0.45;
export const levelSelectButtonGap = 0.235;
export const levelSelectButtonBottomLevel = 0.9;
export const levelSelectButtonMidLevel = 0.71;
export const levelSelectLevelButtonGap = 0.2;

export const mainMenuButtonGap = 0.25;
export const mainMenubuttonTopLevel = 0.75;

export const scoreboardButtonTopLevel = 0.9;
export const scoreboardRightButtonOffset = 0.45;
export const scoreboardButtonBottomLevel = 0.9;

// Scene keys

export const electronScene: string = 'electron';
export const loadingScene: string = 'loading';
export const levelScene: string = 'level';
export const scoreboardScene: string = 'scoreboard';
export const mainMenuScene: string = 'mainMenu';
export const levelSelectScene: string = 'levelSelect';
export const calibrationScene: string = 'calibration';
export const optionsScene: string = 'options';

export const initialScene: string = mainMenuScene;

// Depths

export const fingerSpriteDepth: number = 100;
export const landmarkDepth: number = 99;
export const landmarkConnectionDepth: number = 98;
export const targetTextDepth: number = 97;
export const outerRingDepth: number = 96;
export const targetDepth: number = 95;
export const sliderDepth: number = 94;
export const buttonDepth: number = 93;
export const progressBarDepth: number = 61;

// Webcam

export const webcamDisplayOptions: WebcamOptions = {
  visible: false /* false overrides opacity */,
  flip: true,
  opacity: 0,
  width: window.innerWidth,
  height: window.innerHeight,
  objectFit: 'fill',
};

export const webcamSourceOptions: MediaStreamConstraints = {
  video: {
    /* Utilized webcam resolution. */
    width: { ideal: 1280 / 2 },
    height: { ideal: 720 / 2 },
  },
  audio: false,
};

// Mediapipe

// Model file from: https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
export const modelPath: string = 'models/hand_landmarker.task';

export const landmarkDetectionOptions: HandLandmarkerOptions = {
  baseOptions: {
    delegate: 'GPU',
  },
  runningMode: 'VIDEO', // TODO: Look into using LIVE_STREAM here?
  numHands: 1,
  minHandDetectionConfidence: 0.5,
  minHandPresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
  // TODO: Look into these options and whether they do anything.
  // smoothLandmarks: true,
  // enableSegmentation: false,
  // smoothSegmentation: true,
};

// Invalid parameters

export const undefinedText: string = 'UNDEFINED';
export const invalidBpmIndex: number = -1;
export const invalidFingerIndex: number = -1;
