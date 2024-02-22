import { TargetTweenOptions } from '../core/interfaces'
import HandScene from '../scenes/handScene'
import { config } from '../managers/storageManager'
import { PlayableLayer } from '../level/layer'
import { absPath } from '../core/common'

import { AudioTrack, MatterSprite, PhaserText, Sprite, Tween, Vector2 } from '../core/phaserTypes'
import {
  deadTargetOptions,
  earlyTargetOptions,
  fingerColors,
  lateTargetOptions,
  targetTextDepth,
  onTimeTargetOptions,
  outerRingStartScale,
  targetCollisionLabel,
  targetDeathDuration,
  targetGlowOptions,
  targetRotationDuration,
  targetRotationEase,
  targetTextOptions,
  targetTextureOptions,
  undefinedText,
  outerRingDepth,
  targetDepth
} from '../core/config'
import setInteraction from '../util/interaction'

export default class Target extends MatterSprite {
  public readonly scene: HandScene
  public readonly sound: AudioTrack
  public readonly songTime: number
  public readonly nodeIndex: number

  private readonly outerRing: Sprite
  private readonly fingerId: string
  private readonly lifetime: number
  private readonly spriteScale: number

  private onTargetMiss?: () => void

  private rotateTween: Tween | undefined
  private earlyTween: Tween | undefined
  private onTimeTween: Tween | undefined
  private lateTween: Tween | undefined
  private deathTween: Tween | undefined
  private glowTween: Tween | undefined
  private glow: Phaser.FX.Glow | undefined
  private targetText: PhaserText

  // Based on user options.
  public readonly onTimeDuration: number
  private readonly lateDuration: number
  // Based on layer preview time and onTimeDuration.
  private readonly earlyDuration: number
  // deadDuration is constant and taken from config.ts

  public static preload(scene: HandScene) {
    scene.load.image(targetTextureOptions.keyInner, absPath(targetTextureOptions.pathInner))
    scene.load.image(targetTextureOptions.keyOuter, absPath(targetTextureOptions.pathOuter))
  }

  public static unload(scene: HandScene) {
    scene.textures.remove(targetTextureOptions.keyInner)
    scene.textures.remove(targetTextureOptions.keyOuter)
  }

  constructor(
    scene: HandScene,
    songTime: number,
    position: Vector2,
    lifetime: number,
    soundKey: string,
    layer: PlayableLayer,
    fingerId: string,
    nodeIndex: number
  ) {
    super(scene.matter.world, position.x, position.y, layer.data.spriteKeyInner, undefined, {
      render: {
        visible: true
      }
    })
    this.scene = scene
    this.lifetime = lifetime
    this.fingerId = fingerId
    this.nodeIndex = nodeIndex

    this.spriteScale = config.targetSize

    this.scene.add.existing(this)

    this.songTime = this.lifetime + songTime

    this.lateDuration = config.lateTimeDuration
    this.onTimeDuration = config.onTimeDuration
    this.earlyDuration = this.lifetime - this.onTimeDuration / 2

    this.sound = this.scene.sound.add(soundKey, {
      volume: config.sonificationLevel
    })

    this.setScale(this.spriteScale)
    this.setTint(fingerColors[this.fingerId])
    this.setDepth(targetDepth)
    setInteraction(this, true)

    this.setCircle(this.displayWidth / 2, {
      label: layer.level.trackKey + '-' + layer.data.id + targetCollisionLabel + nodeIndex.toString()
    })

    this.setSensor(true)

    if (!config.fancyEffectsDisabled) {
      this.glow = this.postFX.addGlow(
        targetGlowOptions.color,
        0,
        0,
        false,
        targetGlowOptions.quality,
        targetGlowOptions.distance
      )
    }

    // Outer target
    this.outerRing = this.scene.add.sprite(position.x, position.y, layer.data.spriteKeyOuter)
    this.outerRing.setScale(this.spriteScale * outerRingStartScale)
    this.outerRing.setDepth(outerRingDepth)

    this.targetText = new PhaserText(this.scene, 0, 0, undefinedText, {})

    this.addTargetText()

    this.setupTweens()
  }

  public setOnTargetMiss(onTargetMiss: () => void) {
    this.onTargetMiss = onTargetMiss
  }

  public setOnTargetHit(onTargetHit: () => void) {
    this.scene.hand.addPinchCheck(this.fingerId, this, {
      startPinch: onTargetHit
    })
    this.once('pointerdown', onTargetHit)
  }

  private addTargetText() {
    this.targetText = this.scene.add.text(
      this.x,
      this.y,
      // Node count starts from 1 (humans).
      (this.nodeIndex + 1).toString(),
      {
        font: targetTextOptions.font,
        color: targetTextOptions.color
      }
    )
    this.targetText.setOrigin(0.5, 0.5)
    this.targetText.setDepth(targetTextDepth)
  }

  private createTween(targets: (Sprite | PhaserText)[], options: TargetTweenOptions, duration: number) {
    for (const target of targets) {
      target.tint = options.color
    }
    const tween: Tween = this.scene.tweens.add({
      targets: targets,
      displayWidth: this.displayWidth * options.scale,
      displayHeight: this.displayHeight * options.scale,
      ease: options.ease,
      duration: duration,
      repeat: 0
    })
    return tween
  }

  private setupTweens() {
    if (!config.fancyEffectsDisabled) {
      // Make target spin on repeat.
      this.rotateTween = this.scene.tweens.add({
        targets: [this],
        rotation: 2 * Math.PI,
        ease: targetRotationEase,
        duration: targetRotationDuration,
        repeat: -1
      })
    }

    // Shrink target
    this.earlyTween = this.createTween([this.outerRing], earlyTargetOptions, this.earlyDuration)
    this.earlyTween.on('complete', () => {
      this.onTimeTween = this.createTween(
        [this],
        {
          ...onTimeTargetOptions,
          scale: 1
        },
        this.onTimeDuration
      )
      if (!config.fancyEffectsDisabled && this.glow != undefined) {
        this.glowTween = this.scene.tweens.add({
          targets: this.glow,
          outerStrength: targetGlowOptions.outerStrength,
          yoyo: true,
          // This makes glow start and end at the beginning and end of the 'on time duration'
          duration: this.onTimeDuration / 2,
          ease: targetGlowOptions.ease
        })
      }
      this.onTimeTween.on('complete', () => {
        if (this.glow != undefined) {
          this.glow.destroy()
        }
        this.lateTween = this.createTween(
          [this, this.outerRing],
          {
            ...lateTargetOptions,
            scale: 1
          },
          this.lateDuration
        )
        this.lateTween.on('complete', () => {
          setInteraction(this, false)
          this.deathTween = this.createTween(
            [this, this.outerRing, this.targetText],
            deadTargetOptions,
            targetDeathDuration
          )
          if (this.onTargetMiss != undefined) {
            this.deathTween.on('complete', this.onTargetMiss)
          }
        })
      })
    })
  }

  public destroyTarget() {
    this.scene.hand.removePinchCheck(this.fingerId, this)
    this.off('pointerdown')

    if (this.rotateTween != undefined) this.scene.tweens.remove(this.rotateTween)
    if (this.earlyTween != undefined) this.scene.tweens.remove(this.earlyTween)
    if (this.onTimeTween != undefined) this.scene.tweens.remove(this.onTimeTween)
    if (this.lateTween != undefined) this.scene.tweens.remove(this.lateTween)
    if (this.deathTween != undefined) this.scene.tweens.remove(this.deathTween)
    if (this.glowTween != undefined) this.scene.tweens.remove(this.glowTween)
    if (this.glow != undefined) this.glow.destroy()
    if (this.targetText != undefined) this.targetText.destroy()

    this.outerRing.destroy()

    this.destroy()
  }
}
