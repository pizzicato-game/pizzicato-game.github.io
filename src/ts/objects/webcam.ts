import { WebcamOptions } from '../core/interfaces';
import { webcamSourceOptions } from '../core/config';
import { assert } from '../core/common';

class Webcam {
  // Useful to hold onto the outer wrapper for methods like setDisplaySize().
  private video_: HTMLVideoElement | undefined;

  public async init(
    options: WebcamOptions,
    width: number,
    height: number,
    progressCallback: (text: string) => void,
  ): Promise<boolean | string | string[]> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<boolean | string | string[]>(async (resolve, reject) => {
      progressCallback('LOADING WEBCAM...');

      this.setupVideoElement(options, width, height);

      // From: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
      // To select a webmca use mediaDevices.enumerateDevices() and add set
      // webcamSourceOptions.video.deviceId = myPreferredCameraDeviceId
      await navigator.mediaDevices
        .getUserMedia(webcamSourceOptions)
        .then(mediaStream => {
          // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject#supporting_fallback_to_the_src_property
          if (!('srcObject' in this.video)) {
            reject('srcObject does not exist on older browsers');
            return;
          }

          this.video.srcObject = mediaStream;

          this.video.addEventListener('loadeddata', () => {
            resolve(true);
          });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public found(): boolean {
    return this.video.srcObject != undefined;
  }

  public setVisibility(visible: boolean) {
    // For some reason excluding this line causes visibility change to fail.
    this.video.style.visibility = '';
    this.video.style.visibility = visible ? 'shown' : 'hidden';
  }

  private setupVideoElement(
    options: WebcamOptions,
    width: number,
    height: number,
  ) {
    this.video = document.body.appendChild(document.createElement('video'));
    // Mandatory settings
    this.video.autoplay = true;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.width = width;
    this.video.height = height;
    // Configurable settings
    //this.video.style.objectFit = options.objectFit; // DISCUSS: Slight but tolerable stretch of video?
    if (options.flip) {
      this.video.style.cssText +=
        '-moz-transform: translate(-50%, -50%) scale(-1, 1); \
         -webkit-transform: translate(-50%, -50%) scale(-1, 1); -o-transform: translate(-50%, -50%) scale(-1, 1); \
         transform: translate(-50%, -50%) scale(-1, 1); filter: FlipH;';
    }
    this.setVisibility(false); // Only show webcam after landmarks are pre-cached.
  }

  public get video(): HTMLVideoElement {
    assert(this.video_ != undefined);
    return this.video_!;
  }

  public set video(video: HTMLVideoElement) {
    this.video_ = video;
  }
}

const webcam: Webcam = new Webcam();

export default webcam;
