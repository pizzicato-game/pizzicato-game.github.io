import HandScene from '../scenes/handScene'
import { absPath, assert } from '../core/common'
import { config } from '../managers/storageManager'
import { GameObject, PhaserText, Sprite, TimerEvent, Tween } from '../core/phaserTypes'
import {
  countdownTextOptions,
  countdownTextureOptions,
  metronomeMinimumBarCount,
  metronomeOptions,
  undefinedText
} from '../core/config'

export default class Metronome extends GameObject {
  private beat: number = 0
  private timer: TimerEvent

  private countdownText: PhaserText
  private countdownTexture: Sprite
  private shrinkTween: Tween

  constructor(scene: HandScene) {
    super(scene, 'metronome')
    this.timer = new TimerEvent({})
    this.countdownText = this.scene.add
      .text(countdownTextOptions.position.x, countdownTextOptions.position.y, undefinedText, {
        font: countdownTextOptions.font,
        color: countdownTextOptions.color
      })
      .setOrigin(0.5, 0.5)
      .setScale(countdownTextOptions.scale)
      .setDepth(countdownTextOptions.depth)
    this.setVisible(false)
  }

  public preload() {
    this.scene.load.image(countdownTextureOptions.key, absPath(countdownTextureOptions.path))
    this.scene.load.audio(metronomeOptions.highKey, absPath(metronomeOptions.highPath))
    this.scene.load.audio(metronomeOptions.lowKey, absPath(metronomeOptions.lowPath))
  }

  public unload() {
    this.scene.cache.audio.remove(metronomeOptions.highKey)
    this.scene.cache.audio.remove(metronomeOptions.lowKey)
  }

  public setup() {
    this.countdownTexture = this.scene.add
      .sprite(countdownTextOptions.position.x, countdownTextOptions.position.y, countdownTextureOptions.key)
      .setScale(countdownTextureOptions.scale)
      .setVisible(false)
      .setOrigin(0.5, 0.5)
      .setAlpha(countdownTextureOptions.opacity)
      .setDepth(countdownTextureOptions.depth)
  }

  public setVisible(visible: boolean) {
    if (this.countdownText != undefined) this.countdownText.setVisible(visible)
    if (this.countdownTexture != undefined) this.countdownTexture.setVisible(visible)
  }

  public stop() {
    this.setVisible(false)
    if (this.scene != undefined) {
      this.scene.time.removeEvent(this.timer)
      this.scene.sound.stopByKey(metronomeOptions.highKey)
      this.scene.sound.stopByKey(metronomeOptions.lowKey)
      if (this.shrinkTween != undefined) this.scene.tweens.remove(this.shrinkTween)
    }
  }

  /**
   * @param beatDuration Time in ms between beats.
   * @param barCount amount of bars this should play.
   */
  public play(beatsPerBar: number, beatDuration: number, barCount: number) {
    this.beat = 0
    this.stop()
    this.timer = this.scene.time.addEvent({
      callback: this.tick.bind(this, beatsPerBar, beatDuration, barCount),
      delay: beatDuration,
      loop: true,
      startAt: beatDuration
    })
  }

  private tick(beatsPerBar: number, beatDuration: number, barCount: number) {
    assert(barCount >= metronomeMinimumBarCount, 'Cannot display metronome for less than minimum bar count')
    // Only display countdown text on the last bar of the metronome.

    const totalBeats = beatsPerBar * barCount
    const beatInBar = this.beat % beatsPerBar
    const finalBeat = beatInBar == 0
    const soundKey = finalBeat ? metronomeOptions.highKey : metronomeOptions.lowKey

    if (this.beat >= totalBeats) {
      this.setVisible(false)
      return
    } else {
      // Check metronome has not exited early.
      if (this.countdownText.active) {
        this.scene.sound.play(soundKey, {
          volume: config.backgroundMusicLevel
        })
      }
    }

    // Display countdown on the final bar.
    assert(totalBeats - beatsPerBar >= 0)
    if (this.beat >= totalBeats - beatsPerBar) {
      // Check metronome has not exited early.
      if (this.countdownText.active && !config.disableVisualMetronome) {
        this.display(beatInBar + metronomeMinimumBarCount, beatDuration)
      }
    }

    this.beat++
  }

  private display(beat: number, beatDuration: number) {
    this.countdownText.setText(beat.toString())
    this.countdownText.setScale(countdownTextOptions.scale)
    this.countdownTexture.setScale(countdownTextureOptions.scale)
    this.setVisible(true)
    this.shrinkTween = this.scene.tweens.add({
      targets: [this.countdownText, this.countdownTexture],
      ease: countdownTextOptions.ease,
      duration: beatDuration * 0.9, // 0.9 provides a short buffer for next countdown number to spawn
      scale: 0,
      repeat: 0
    })
  }
}
