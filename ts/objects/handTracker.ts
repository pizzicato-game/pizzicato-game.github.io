import {
  HandLandmarker,
  HandLandmarkerResult,
  FilesetResolver,
} from '@mediapipe/tasks-vision';
import { absRootPath, absPath, normalizedToWindow, assert } from 'core/common';
import webcam from 'objects/webcam';
import {
  HandIndex,
  handLandmarkCount,
  HandLandmarkIndex,
} from 'objects/handLandmarks';
import { landmarkDetectionOptions, modelPath } from 'core/config';
import { Vector2 } from 'core/phaserTypes';

export class HandTracker {
  private results_: HandLandmarkerResult | undefined;
  private handLandmarker_: HandLandmarker | undefined;
  private lastVideoTime: number = -1;

  constructor() {}

  public async init(
    progressCallback: (text: string) => void,
  ): Promise<boolean | string | string[]> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<boolean | string | string[]>(async (resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let wasmFileset: any = undefined;
      await FilesetResolver.forVisionTasks(
        // File from: https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm
        absRootPath('node_modules/@mediapipe/tasks-vision/wasm'),
      )
        .then(result => (wasmFileset = result))
        .catch(err => {
          reject(err);
          return;
        });

      progressCallback('Loading hand landmarker...');
      // TODO: Add check that modelPath exists:
      // if (!fileExists(modelPathRelativeToSrc)) reject("Model path not found");
      landmarkDetectionOptions.baseOptions!.modelAssetPath = absPath(modelPath);

      await HandLandmarker.createFromOptions(
        wasmFileset,
        landmarkDetectionOptions,
      )
        .then(result => (this.handLandmarker_ = result))
        .catch(err => {
          if (err instanceof Event && (err as Event).type == 'error')
            reject(
              'Failed to fetch vision_wasm_internal.js in specified wasm directory',
            );
          if (err instanceof TypeError)
            reject('Failed to fetch hand_landmark.task file');
          reject(err);
          return;
        });

      resolve(true);
    });
  }

  public precache(progressCallback: (text: string) => void) {
    // MediaPipe seems to cache landmarks, so this initial update allows the game
    // loop update to start immediately with no delay before drawing landmarks.
    progressCallback('Pre-caching landmarks...');
    this.update();
  }

  public found(): boolean {
    return this.handLandmarker_ != undefined;
  }

  public update() {
    if (this.lastVideoTime == webcam.video.currentTime) return;

    this.lastVideoTime = webcam.video.currentTime;
    // This updates MediaPipe hand landmarks from webcam video.
    this.results_ = this.handLandmarker.detectForVideo(
      webcam.video,
      performance.now(),
    );
  }

  public get results(): HandLandmarkerResult {
    assert(this.results_ != undefined);
    return this.results_!;
  }

  private get handLandmarker(): HandLandmarker {
    assert(this.handLandmarker_ != undefined);
    return this.handLandmarker_!;
  }

  public landmarksFound(handIndex: HandIndex = 0): boolean {
    return (
      this.results != undefined && handIndex < this.results.landmarks.length
    );
  }

  public landmarkFound(
    landmarkIndex: HandLandmarkIndex,
    handIndex: HandIndex = 0,
  ): boolean {
    if (!this.landmarksFound(handIndex)) return false;

    const landmark = this.results.landmarks[handIndex][landmarkIndex];
    return (
      landmark.x >= 0 && landmark.x <= 1 && landmark.y >= 0 && landmark.y <= 1
    );
  }

  public getLandmarkPosition(
    landmarkIndex: HandLandmarkIndex,
    handIndex: HandIndex = 0,
  ): Vector2 | undefined {
    if (!this.landmarksFound(handIndex)) return undefined;

    const landmark = this.results.landmarks[handIndex][landmarkIndex];
    const position = normalizedToWindow(new Vector2(landmark.x, landmark.y));
    return new Vector2(
      window.innerWidth - position.x,
      position.y,
    ); /* mirror landmarks in the x-direction */
  }

  public forEachLandmarkPosition(
    landmarkPositionCallback: (position: Vector2) => void,
    handIndex: HandIndex = 0,
  ) {
    for (let i = 0; i < handLandmarkCount; ++i) {
      const position: Vector2 | undefined = this.getLandmarkPosition(
        i,
        handIndex,
      );
      if (position !== undefined) landmarkPositionCallback(position);
    }
  }
}

const handTracker: HandTracker = new HandTracker();

export default handTracker;
