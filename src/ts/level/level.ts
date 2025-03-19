import { Track } from '../level/track';
import { absPath, assert, fileExistsRelative } from '../core/common';
import HandScene from '../scenes/handScene';
import { PlayableTrackLayerData, TrackLayerData } from '../level/trackTypes';
import { PlayableLayer } from '../level/layer';
import { Streak } from '../level/streak';
import { Score } from '../level/score';
import { config, autoSaveToCSV } from '../managers/storageManager';
import { AudioTrack, SoundConfig } from '../core/phaserTypes';
import {
  invalidBpmIndex,
  layerStartTimeDelay,
  levelBackgroundFileName,
  levelDir,
  levelPreviewFileName,
  levelStartTimeDelay,
  metronomeMinimumBarCount,
  undefinedText,
} from '../core/config';

export default class Level {
  private trackKey_: string = undefinedText;
  private finishCallback: () => void = () => {};
  private abortCallback: () => void = () => {};

  public track: Track;
  public scene: HandScene;
  public streak: Streak;
  public score: Score;

  public activeLayerIndex: number = 0;
  public playableLayers: PlayableLayer[] = [];
  private activeAudioTracks: AudioTrack[] = [];
  private bpmIndex_: number = invalidBpmIndex;

  constructor(trackKey: string) {
    this.trackKey_ = trackKey;
    this.track = new Track(this.trackKey_);
  }

  public setBPM(bpmIndex: number) {
    assert(
      bpmIndex != invalidBpmIndex,
      'BPM must be set before starting the level',
    );
    this.track.setBPM(bpmIndex);
    this.bpmIndex_ = bpmIndex;
  }

  get bpmIndex() {
    return this.bpmIndex_;
  }

  get trackKey() {
    return this.trackKey_;
  }

  public init(scene: HandScene) {
    this.scene = scene;
    this.streak = new Streak(this.scene);
    this.score = new Score(this.track);
    this.preloadLayers();
  }

  public hasCustomBackground(): boolean {
    return fileExistsRelative(levelDir + this.getBackgroundTextureKey());
  }

  public hasPreviewVideo(): boolean {
    return fileExistsRelative(levelDir + this.getPreviewVideoKey());
  }

  public getBackgroundTextureKey(): string {
    return this.trackKey + '/' + levelBackgroundFileName;
  }

  public getPreviewVideoKey(): string {
    return this.trackKey + '/' + levelPreviewFileName;
  }

  public preloadTrack(scene: HandScene) {
    const previewFile = levelDir + this.getPreviewVideoKey();
    const backgroundFile = levelDir + this.getBackgroundTextureKey();

    if (fileExistsRelative(previewFile)) {
      scene.load.video(this.getPreviewVideoKey(), absPath(previewFile), true);
    }
    if (fileExistsRelative(backgroundFile)) {
      scene.load.image(this.getBackgroundTextureKey(), absPath(backgroundFile));
    }
    this.track.preload(scene);
  }

  public unloadTrack(scene: HandScene) {
    this.track.unload(scene);
  }

  private preloadLayers() {
    this.track.preloadNotes(this.scene);
    this.playableLayers = [];

    this.track.forEachLayer(
      undefined,
      (layer: PlayableTrackLayerData, _layerIndex: number) => {
        const playableLayer = new PlayableLayer(this.scene, this, layer);
        this.playableLayers.push(playableLayer);
      },
    );
  }

  private unloadLayers() {
    this.playableLayers.forEach((layer: PlayableLayer) => {
      layer.unload();
    });

    this.track.unloadNotes(this.scene);
  }

  public start(finishCallback: () => void, abortCallback: () => void) {
    this.activeLayerIndex = 0;

    this.removeBackgroundAudio(this.scene);

    this.playableLayers.forEach((layer: PlayableLayer) => {
      layer.stop();
    });

    this.streak.stop();

    this.setBPM(this.bpmIndex_);
    this.finishCallback = finishCallback;
    this.abortCallback = abortCallback;
    // TODO: Consider showing something before first layer starts.
    this.scene.time.delayedCall(levelStartTimeDelay, () => {
      this.startLayer();
    });
  }

  public addBackgroundAudio(
    scene: HandScene,
    soundConfig: SoundConfig,
    predicate?: (layer: TrackLayerData, index: number) => boolean,
  ) {
    assert(
      this.bpmIndex_ != invalidBpmIndex,
      'Set BPM before adding background audio to level',
    );
    this.removeBackgroundAudio(scene);
    this.activeAudioTracks = this.track.addBackgroundAudioTracks(
      scene,
      soundConfig,
      this.bpmIndex_,
      predicate,
    );
  }

  public removeBackgroundAudio(scene: HandScene) {
    this.activeAudioTracks.forEach((track: AudioTrack) => {
      track.stop();
      scene.sound.remove(track);
    });
    this.activeAudioTracks = [];
  }

  public playBackgroundAudio() {
    this.activeAudioTracks.forEach((track: AudioTrack) => {
      track.setMute(false);
      track.play();
    });
  }

  public setBackgroundAudioMute(state: boolean) {
    this.activeAudioTracks.forEach((track: AudioTrack) => {
      track.setMute(state);
    });
  }

  private startLayer() {
    const layer: PlayableLayer = this.getActiveLayer();
    const activeIndex: number = this.activeLayerIndex;

    // Must be called before layer start, otherwise infoHud.start will not have correct loop count.
    this.score.resetLayerScores(
      layer.data.nodes.length,
      layer.data.progressCount,
    );

    // Make sure the delay is at least 1 bar, even with lower preview time.
    const barLength = this.track.songTimePositionToTime({
      bar: 1 + metronomeMinimumBarCount,
      step: 1,
      tick: 0,
    });
    const delay = Math.max(barLength, layer.getPreviewTime());

    layer.start(delay);

    const backgroundLayers: string[] = [...layer.data.backgroundLayers];

    // Disabling sonification causes current layer loop
    // to also be played and target sounds to be disabled.
    if (config.disableSonification) {
      backgroundLayers.push(layer.data.id);
    }

    this.addBackgroundAudio(
      this.scene,
      {
        loop: true,
        volume: config.backgroundMusicLevel,
      },
      (otherLayer: TrackLayerData, _index: number) => {
        return backgroundLayers.includes(otherLayer.id);
      },
    );

    this.scene.time.delayedCall(delay, () => {
      // Ensure that layer has not been skipped.
      if (this.activeLayerIndex == activeIndex) {
        this.playBackgroundAudio();
      }
    });
  }

  public getActiveLayer(): PlayableLayer {
    assert(
      this.activeLayerIndex < this.playableLayers.length,
      'Active layer index cannot exceed number of playable layers',
    );
    return this.playableLayers[this.activeLayerIndex];
  }

  public transitionLayers() {
    if (config.autoSaveCSV) {
      autoSaveToCSV(this.score.levelStats);
    }

    if (this.activeLayerIndex < this.playableLayers.length) {
      const previousLayer: PlayableLayer = this.getActiveLayer();
      previousLayer.preDelayStop();

      this.removeBackgroundAudio(this.scene);

      this.activeLayerIndex++;
      const activeIndex: number = this.activeLayerIndex;

      if (this.activeLayerIndex >= this.playableLayers.length) {
        this.score.saveLayerScores();
        previousLayer.postDelayStop();
        this.end();
        return;
      } else {
        this.scene.time.delayedCall(layerStartTimeDelay, () => {
          // Ensure that layer has not been skipped.
          if (this.activeLayerIndex == activeIndex) {
            this.score.saveLayerScores();
            previousLayer.postDelayStop();
            this.startLayer();
          }
        });
      }
    }
  }

  private stop() {
    this.removeBackgroundAudio(this.scene);
    this.streak.stop();
    this.unloadLayers();
  }

  public end() {
    this.stop();
    this.finishCallback();
  }

  public abort() {
    if (config.autoSaveCSV) {
      this.score.saveLayerScores();
      autoSaveToCSV(this.score.levelStats);
    }
    this.stop();
    this.abortCallback();
  }

  public update(time: number) {
    if (this.activeLayerIndex < this.playableLayers.length) {
      this.getActiveLayer().update(time);
    }
  }

  public getAudioLoopTime(): number {
    return this.activeAudioTracks.at(-1)!.duration;
  }
}
