import {
  PlayableTrackLayerData,
  SongTimePosition,
  TrackData,
  TrackLayerData,
} from '../level/trackTypes';
import HandScene from '../scenes/handScene';
import { absPath, assert } from '../core/common';
import { AudioTrack, Scene, SoundConfig } from '../core/phaserTypes';
import {
  barLength,
  levelDir,
  levelJsonFileName,
  minuteInMilliseconds,
  soundFileExtension,
  ticksPerBar,
  undefinedText,
} from '../core/config';

export class Track {
  public data: TrackData;
  public scene: Scene;

  private readonly trackKey: string = undefinedText;
  private trackDir?: string;

  // Default placeholders until bpm is set.
  private bpm: number = 0;
  private beatLength_: number = 1;

  constructor(scene: Scene, trackKey: string) {
    this.scene = scene;
    this.trackKey = trackKey;
    this.trackDir = levelDir + this.trackKey + '/';
    this.scene.load.json(
      this.trackKey,
      absPath(this.trackDir + levelJsonFileName),
    );
  }

  public get beatLength() {
    return this.beatLength_;
  }

  public setBPM(bpmIndex: number) {
    assert(this.data != undefined, 'preload JSON before setting BPM');
    assert(bpmIndex < this.data.bpm.length, 'BPM index out of range');
    this.bpm = this.data.bpm[bpmIndex];

    const ticksPerBeat: number =
      ticksPerBar / this.data.timeSignatureDenominator;

    this.beatLength_ = this.songTimePositionToTime({
      bar: 1,
      step: 1 + ticksPerBeat,
      tick: 0,
    });
  }

  public getBPM() {
    assert(this.data != undefined, 'preload JSON before retrieving BPM');
    assert(this.bpm != 0, 'Track BPM has not been set');
    return this.bpm;
  }

  // Preloads all the notes in levelDir/<trackKey>/<layer_id>/<soundKey>.<soundFileExtension>
  private preloadNotes() {
    assert(this.trackDir != undefined, 'Preload track before preloading notes');
    this.forEachLayer(undefined, (layer: PlayableTrackLayerData) => {
      // If layer has nodes, preload all the node sounds.
      const l = layer as PlayableTrackLayerData;
      l.nodes.forEach((node, _nodeIndex) => {
        const soundKey: string = this.getSoundKey(layer, node.soundKey);
        const soundPath: string =
          this.trackDir + layer.id + '/' + node.soundKey + soundFileExtension;
        if (!this.scene.cache.audio.exists(soundKey) && node.soundKey !== '') {
          this.scene.load.audio(soundKey, absPath(soundPath));
        }
      });
    });
  }

  private unloadNotes() {
    this.forEachLayer(undefined, (layer: PlayableTrackLayerData) => {
      const l = layer as PlayableTrackLayerData;
      l.nodes.forEach((node, _nodeIndex) => {
        this.scene.cache.audio.remove(this.getSoundKey(layer, node.soundKey));
      });
    });
  }

  // Preloads all the audio loop track in levelDir/<trackKey>/<layer_id>/<soundKey>.<soundFileExtension>
  private preloadLoops() {
    this.forEachLayer((layer: TrackLayerData) => {
      assert(layer.soundLoopKeys !== undefined);
      assert(layer.soundLoopKeys.length > 0);
      layer.soundLoopKeys.forEach(loopKey => {
        const soundKey: string = this.getSoundKey(layer, loopKey);
        const soundPath: string =
          this.trackDir + layer.id + '/' + loopKey + soundFileExtension;
        if (!this.scene.cache.audio.exists(soundKey) && loopKey !== '') {
          this.scene.load.audio(soundKey, absPath(soundPath));
        }
      });
    });
  }

  private unloadLoops() {
    this.forEachLayer((layer: TrackLayerData) => {
      layer.soundLoopKeys.forEach(loopKey => {
        this.scene.cache.audio.remove(this.getSoundKey(layer, loopKey));
      });
    });
  }

  public getSoundKey(layer: TrackLayerData, soundKey: string): string {
    assert(soundKey !== undefined);
    return this.trackKey + '/' + layer.id + '/' + soundKey;
  }

  // layerCallback is called first for all layers.
  // playableLayerCallback is called after layerCallback for each layer with the playable property set to true.
  public forEachLayer(
    layerCallback?: (layer: TrackLayerData, index: number) => void,
    playableLayerCallback?: (
      playableLayer: PlayableTrackLayerData,
      index: number,
    ) => void,
  ) {
    assert(this.data != undefined, 'JSON has not finished preloading');
    // Ensures playable layers get indexes starting from 0.
    let unplayableIndexOffset: number = 0;
    this.data.layers.forEach((layer, index) => {
      if (!layer.playable) {
        unplayableIndexOffset++;
      }
      layerCallback?.(layer, index);
      if (layer.playable) {
        const l = layer as PlayableTrackLayerData;
        playableLayerCallback?.(l, index - unplayableIndexOffset);
      }
    });
  }

  public addBackgroundAudioTracks(
    scene: HandScene,
    soundConfig: SoundConfig,
    bpmIndex: number,
    predicate?: (layer: TrackLayerData, index: number) => boolean,
  ): AudioTrack[] {
    const audioTracks: AudioTrack[] = [];
    this.forEachLayer((layer: TrackLayerData, index: number) => {
      if (predicate == undefined || predicate(layer, index)) {
        assert(layer.soundLoopKeys !== undefined);
        assert(
          bpmIndex < layer.soundLoopKeys.length,
          'BPM index out of range of layer sound loop keys',
        );
        audioTracks.push(
          scene.sound.add(
            this.getSoundKey(layer, layer.soundLoopKeys[bpmIndex]),
            soundConfig,
          ),
        );
      }
    });
    return audioTracks;
  }

  /**
   * Convert time in seconds into a SongTimePosition object.
   * @param time time in milliseconds from song start to convert.
   * @return a new SongTimePosition object.
   */
  timeToSongTimePosition(time: number): SongTimePosition {
    assert(this.bpm != 0, 'set BPM before retrieving song times');
    const beats = time / (minuteInMilliseconds / this.bpm);
    const bar = Math.floor(beats / this.data.timeSignatureNumerator) + 1;
    const beatInBar = beats % this.data.timeSignatureNumerator;
    const step =
      Math.floor(
        beatInBar *
          (barLength / this.data.timeSignatureDenominator) *
          barLength,
      ) + 1;
    const beatInStep = (beatInBar * barLength) % 1;
    const tick = Math.floor(beatInStep * (this.data.timeBasePPQ / barLength));
    return { bar, step, tick };
  }

  /**
   * Convert a SongTimePosition object into time in seconds.
   * @param position, a SongTimePosition instance to convert
   * @return time in milliseconds.
   */
  songTimePositionToTime(position: SongTimePosition): number {
    assert(this.bpm != 0, 'set BPM before retrieving song times');
    const beats =
      (position.bar - 1) * this.data.timeSignatureNumerator +
      (position.step - 1) /
        (barLength * (barLength / this.data.timeSignatureDenominator)) +
      position.tick / this.data.timeBasePPQ;
    const time = beats * (minuteInMilliseconds / this.bpm);
    return time;
  }

  public preload(scene: HandScene) {
    this.scene = scene;
    this.data = this.scene.cache.json.get(this.trackKey);
    assert(this.data !== undefined, 'Failed to retrieve JSON for track');
    this.parseJson();
    this.preloadLoops();
    this.preloadNotes();
  }

  public unload() {
    this.unloadLoops();
    this.unloadNotes();
  }

  private parseJson() {
    this.setTimePositionDefaults();
    this.sortNodes();
  }

  private setTimePositionDefaults() {
    this.forEachLayer(undefined, (layer: PlayableTrackLayerData) => {
      const setDefaults = (
        timePosition: SongTimePosition,
        barDefault: number,
        stepDefault: number,
        tickDefault: number,
      ) => {
        if (!timePosition.bar) timePosition.bar = barDefault;
        if (!timePosition.step) timePosition.step = stepDefault;
        if (!timePosition.tick) timePosition.tick = tickDefault;
      };

      assert(
        layer.progressCount <= layer.nodes.length,
        "Progress count threshold for layer '" +
          layer.id +
          "' of track '" +
          this.trackKey +
          "' cannot be higher than the node count.",
      );

      // Preview time is not a time position, hence bar and step set to 0.
      setDefaults(layer.previewTime, 0, 0, 0);

      layer.nodes.forEach(node => {
        // For time positions, 1 and 1 for bar and step are more human readable.
        // Tick range starts from 0.
        setDefaults(node.timePosition, 1, 1, 0);
      });
    });
  }

  private sortNodes() {
    this.forEachLayer(undefined, (layer: PlayableTrackLayerData) => {
      layer.nodes.sort((a, b) => {
        // Compare bars
        if (a.timePosition.bar !== b.timePosition.bar)
          return a.timePosition.bar - b.timePosition.bar;
        // Bars are equal, compare steps
        if (a.timePosition.step !== b.timePosition.step)
          return a.timePosition.step - b.timePosition.step;
        // Steps are equal, compare ticks
        return a.timePosition.tick - b.timePosition.tick;
      });
    });
  }
}
