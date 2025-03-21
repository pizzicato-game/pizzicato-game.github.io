import HandScene from '../scenes/handScene';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import {
  config,
  defaultConfig,
  updateConfig,
  updateConfigValue,
} from '../managers/storageManager';
import webcam from '../objects/webcam';
import { EventEmitter, Sprite, Tween, Vector2 } from '../core/phaserTypes';
import {
  escapeKey,
  fingerColors,
  optionsCheckboxOffset,
  optionsSliderLabelOffset,
  targetGlowOptions,
  thumbFingerId,
  undefinedText,
} from '../core/config';
import { assert } from '../core/common';

export default class Options extends HandScene {
  private back: Button;
  private resetConfig: Button;
  private onTimeDurationLimits: Vector2;

  private targetExample: Sprite;
  private rotateTween: Tween;
  private glowTween: Tween;
  private glow: Phaser.FX.Glow | undefined;

  options: (Slider | Checkbox)[] = [];

  private emitter: EventEmitter;

  constructor() {
    super('options');
  }

  private saveAndExit() {
    webcam.setVisibility(config.enableCameraVisibility);
    //this.setOpacity(config.cameraOpacity);
    if (this.rotateTween) this.rotateTween.destroy();
    if (this.glowTween) this.glowTween.destroy();
    if (this.glow) this.glow.destroy();
    this.scene.start('mainMenu');
  }

  public create() {
    super.create();

    this.onTimeDurationLimits = new Vector2(50, 1000);

    this.createOptions();
  }

  private normalizeDuration(duration: number) {
    if (duration < 0) {
      return 0.001; // Handle negative durations
    }

    const normalizedDuration =
      (duration - this.onTimeDurationLimits.x) /
      (this.onTimeDurationLimits.y - this.onTimeDurationLimits.x);

    // Ensure the normalized duration is within the 0-1 range
    return 1.0 - Math.max(0, Math.min(1, normalizedDuration));
  }

  private setGlowTimeScale(duration: number) {
    this.glowTween.setTimeScale(this.normalizeDuration(duration));
  }

  private createOptions() {
    assert(config != undefined, 'Failed to fetch configuration data');

    const optionsSliderSize = new Vector2(
      this.width * 0.26,
      this.height * 0.03,
    );

    const halfButtonGapX: number = this.width * 0.15;

    this.back = new Button(
      this,
      'BACK',
      this.center.x - halfButtonGapX,
      this.height - 100,
      () => {
        this.saveAndExit();
      },
    );
    this.resetConfig = new Button(
      this,
      'RESET TO\nDEFAULT',
      this.center.x + halfButtonGapX,
      this.height - 100,
      () => {
        console.info('INFO: Reset config to default');
        updateConfig(defaultConfig, false);
        for (const option of this.options) {
          option.reset(config);
        }
        this.setGlowTimeScale(config['onTimeDuration'] / 2);
        webcam.setVisibility(config.enableCameraVisibility);
      },
    );

    this.input.keyboard!.on(escapeKey, () => {
      this.saveAndExit();
    });

    const _background1l: Sprite = this.add
      .sprite(this.width * 0.09, this.height * 0.05, 'optionsBackground')
      .setOrigin(0, 0)
      .setAlpha(0.8)
      .setDisplaySize(this.width * 0.28, this.height * 0.185);

    const _background2l: Sprite = this.add
      .sprite(this.width * 0.09, this.height * 0.26, 'optionsBackground')
      .setOrigin(0, 0)
      .setAlpha(0.8)
      .setDisplaySize(this.width * 0.28, this.height * 0.27);

    const _background3l: Sprite = this.add
      .sprite(this.width * 0.09, this.height * 0.55, 'optionsBackground')
      .setOrigin(0, 0)
      .setAlpha(0.8)
      .setDisplaySize(this.width * 0.28, this.height * 0.23);

    const _background1r: Sprite = this.add
      .sprite(this.width * 0.63, this.height * 0.05, 'optionsBackground')
      .setOrigin(0, 0)
      .setAlpha(0.8)
      .setDisplaySize(this.width * 0.28, this.height * 0.185);

    const _background2r: Sprite = this.add
      .sprite(this.width * 0.63, this.height * 0.26, 'optionsBackground')
      .setOrigin(0, 0)
      .setAlpha(0.8)
      .setDisplaySize(this.width * 0.28, this.height * 0.27);

    const _background3r: Sprite = this.add
      .sprite(this.width * 0.63, this.height * 0.55, 'optionsBackground')
      .setOrigin(0, 0)
      .setAlpha(0.8)
      .setDisplaySize(this.width * 0.28, this.height * 0.23);

    // --------------------------------------------------------

    this.targetExample = this.add
      .sprite(
        this.width * 0.5,
        this.height * 0.1 + this.height * 0.08 * 0 + this.height * 0.15,
        'targetInner',
      )
      .setTint(fingerColors[thumbFingerId])
      .setScale(config['targetSize']);
    // Make target spin on repeat.
    this.rotateTween = this.tweens.add({
      targets: [this.targetExample],
      rotation: 2 * Math.PI,
      ease: 'Power0',
      duration: 1000,
      repeat: -1,
    });
    this.glow = this.targetExample.postFX.addGlow(
      targetGlowOptions.color,
      0,
      0,
      false,
      targetGlowOptions.quality,
      targetGlowOptions.distance,
    );
    const glowDuration: number = config['onTimeDuration'] / 2;
    this.glowTween = this.tweens.add({
      targets: this.glow,
      outerStrength: targetGlowOptions.outerStrength,
      yoyo: true,
      duration: glowDuration,
      ease: targetGlowOptions.ease,
      repeat: -1,
    });
    this.setGlowTimeScale(glowDuration);
    if (config['postProcessingDisabled'] && this.glowTween) {
      this.glowTween.pause();
    }
    const targetScaleSlider = new Slider(
      this,
      new Vector2(this.width * 0.1, this.height * 0.1 + this.height * 0.08 * 0),
      optionsSliderSize,
      new Vector2(0, optionsSliderLabelOffset.y),
      config,
      'targetSize',
      new Vector2(0.5, 3),
      (slider: Slider) => {
        slider.label!.setText('Target Scale: ' + slider.getStringValue());
        const sliderValue: number = slider.getValue();
        updateConfigValue(slider.key, sliderValue);
        this.targetExample.setScale(sliderValue);
      },
    );
    this.options.push(targetScaleSlider);
    this.add.existing(targetScaleSlider);

    // --------------------------------------------------------

    const fingerScaleSlider = new Slider(
      this,
      new Vector2(this.width * 0.1, this.height * 0.1 + this.height * 0.08 * 1),
      optionsSliderSize,
      new Vector2(0, optionsSliderLabelOffset.y),
      config,
      'fingerSize',
      new Vector2(0.5, 3),
      (slider: Slider) => {
        if (slider.label)
          slider.label.setText('Finger Scale: ' + slider.getStringValue());
        const sliderValue: number = slider.getValue();
        updateConfigValue(slider.key, sliderValue);
        this.hand.setFingerScale(sliderValue);
      },
    );
    this.options.push(fingerScaleSlider);
    this.add.existing(fingerScaleSlider);

    // --------------------------------------------------------

    const opacityCallback = (slider: Slider) => {
      if (slider == undefined || !slider.active) return;
      if (slider.label && slider.label.active)
        slider.label.setText('Camera Opacity: ' + slider.getStringValue());
      updateConfigValue(slider.key, slider.getValue());
      this.setOpacity(config[slider.key] as number);
    };

    const cameraOpacitySlider = new Slider(
      this,
      new Vector2(
        this.width * 0.1,
        this.height * 0.32 + this.height * 0.08 * 0,
      ),
      optionsSliderSize,
      optionsSliderLabelOffset,
      config,
      'cameraOpacity',
      new Vector2(0.01, 1.0),
      opacityCallback,
    );
    const cameraVisibility = new Checkbox(
      this,
      new Vector2(
        this.width * 0.1,
        this.height * 0.32 + this.height * 0.08 * 0 + optionsCheckboxOffset.y,
      ),
      25,
      undefined,
      undefinedText,
      config,
      'enableCameraVisibility',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
        webcam.setVisibility(checkbox.isChecked);
        if (checkbox.isChecked) {
          cameraOpacitySlider.draw();
        } else {
          cameraOpacitySlider.setValue(config['cameraOpacity']);
          opacityCallback(cameraOpacitySlider);
          this.setOpacity(0);
          cameraOpacitySlider.hide('Show Camera');
        }
      },
    );
    this.options.push(cameraOpacitySlider);
    this.options.push(cameraVisibility);
    this.add.existing(cameraOpacitySlider);
    this.add.existing(cameraVisibility);

    // --------------------------------------------------------

    const layerSkipLoopSlider = new Slider(
      this,
      new Vector2(
        this.width * 0.1,
        this.height * 0.32 + this.height * 0.08 * 1,
      ),
      optionsSliderSize,
      optionsSliderLabelOffset,
      config,
      'skipButtonAppearsAfterLoop',
      new Vector2(1, 16),
      (slider: Slider) => {
        slider.label!.setText(
          'Skip Button After Loop: ' + slider.getStringValue(),
        );
        updateConfigValue(slider.key, slider.getValue());
      },
    ).setIsInteger(true);
    const layerSkipButton = new Checkbox(
      this,
      new Vector2(
        this.width * 0.1,
        this.height * 0.32 + this.height * 0.08 * 1 + optionsCheckboxOffset.y,
      ),
      25,
      undefined,
      undefinedText,
      config,
      'showSkipButton',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
        if (checkbox.isChecked) {
          layerSkipLoopSlider.draw();
        } else {
          layerSkipLoopSlider.hide('Show Layer Skip Button');
        }
      },
    );
    this.options.push(layerSkipLoopSlider);
    this.options.push(layerSkipButton);
    this.add.existing(layerSkipLoopSlider);
    this.add.existing(layerSkipButton);

    // --------------------------------------------------------

    const layerskipButtonAppearsAfterLoopSlider = new Slider(
      this,
      new Vector2(
        this.width * 0.1,
        this.height * 0.32 + this.height * 0.08 * 2,
      ),
      optionsSliderSize,
      optionsSliderLabelOffset,
      config,
      'skipLayersAutomaticallyAfterLoop',
      new Vector2(1, 16),
      (slider: Slider) => {
        slider.label!.setText(
          'Skip Layers After Loop: ' + slider.getStringValue(),
        );
        updateConfigValue(slider.key, slider.getValue());
      },
    ).setIsInteger(true);
    const skipLayers = new Checkbox(
      this,
      new Vector2(
        this.width * 0.1,
        this.height * 0.32 + this.height * 0.08 * 2 + optionsCheckboxOffset.y,
      ),
      25,
      undefined,
      undefinedText,
      config,
      'skipLayersAutomatically',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
        if (checkbox.isChecked) {
          layerskipButtonAppearsAfterLoopSlider.draw();
        } else {
          layerskipButtonAppearsAfterLoopSlider.hide(
            'Skip Layers Automatically',
          );
        }
      },
    );
    this.options.push(layerskipButtonAppearsAfterLoopSlider);
    this.options.push(skipLayers);
    this.add.existing(layerskipButtonAppearsAfterLoopSlider);
    this.add.existing(skipLayers);

    // --------------------------------------------------------

    const disableLayerProgress = new Checkbox(
      this,
      new Vector2(
        this.width * 0.1,
        this.height * 0.57 + this.height * 0.08 * 0,
      ),
      25,
      new Vector2(-optionsCheckboxOffset.x, 0),
      'Disable Layer Progression',
      config,
      'disableLayerProgression',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
      },
    );
    this.options.push(disableLayerProgress);
    this.add.existing(disableLayerProgress);

    // --------------------------------------------------------

    const fingerPinchesOnly = new Checkbox(
      this,
      new Vector2(
        this.width * 0.1,
        this.height * 0.57 + this.height * 0.08 * 1,
      ),
      25,
      new Vector2(-optionsCheckboxOffset.x, 0),
      'Index Finger Pinches Only',
      config,
      'indexFingerOnly',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
      },
    );
    this.options.push(fingerPinchesOnly);
    this.add.existing(fingerPinchesOnly);

    // --------------------------------------------------------

    const disableEffects = new Checkbox(
      this,
      new Vector2(
        this.width * 0.1,
        this.height * 0.57 + this.height * 0.08 * 2,
      ),
      25,
      new Vector2(-optionsCheckboxOffset.x, 0),
      'Disable Post-Processing',
      config,
      'postProcessingDisabled',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
        if (checkbox.isChecked) {
          if (this.glowTween) {
            this.glowTween.restart();
            this.glowTween.pause();
          }
          if (this.glow) {
            this.targetExample.postFX.disable();
          }
        } else if (!checkbox.isChecked) {
          if (this.glowTween && this.targetExample) this.glowTween.resume();
          if (this.glow) this.targetExample.postFX.enable();
        }
      },
    );
    this.options.push(disableEffects);
    this.add.existing(disableEffects);

    // -------------------------------------------------------- RIGHT ALIGNMENT --------------------------------------------------------

    const onTimeDurationSlider = new Slider(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.1 + this.height * 0.08 * 0,
      ),
      optionsSliderSize,
      new Vector2(0, optionsSliderLabelOffset.y),
      config,
      'onTimeDuration',
      this.onTimeDurationLimits,
      (slider: Slider) => {
        slider.label!.setText(
          'On Time Duration: ' + slider.getStringValue() + ' ms',
        );
        updateConfigValue(slider.key, slider.getValue());
        this.setGlowTimeScale(config['onTimeDuration'] / 2);
      },
    ).setIsInteger(true);
    this.options.push(onTimeDurationSlider);
    this.add.existing(onTimeDurationSlider);

    // --------------------------------------------------------

    const lateDurationSlider = new Slider(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.1 + this.height * 0.08 * 1,
      ),
      optionsSliderSize,
      new Vector2(0, optionsSliderLabelOffset.y),
      config,
      'lateTimeDuration',
      new Vector2(50, 1000),
      (slider: Slider) => {
        slider.label!.setText(
          'Late Time Duration: ' + slider.getStringValue() + ' ms',
        );
        updateConfigValue(slider.key, slider.getValue());
      },
    ).setIsInteger(true);
    this.options.push(lateDurationSlider);
    this.add.existing(lateDurationSlider);

    // --------------------------------------------------------

    const pinchVolumeSlider = new Slider(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.32 + this.height * 0.08 * 0,
      ),
      optionsSliderSize,
      new Vector2(0, optionsSliderLabelOffset.y),
      config,
      'pinchVolume',
      new Vector2(0, 1),
      (slider: Slider) => {
        slider.label!.setText('Pinch Volume: ' + slider.getStringValue());
        updateConfigValue(slider.key, slider.getValue());
      },
    );
    this.options.push(pinchVolumeSlider);
    this.add.existing(pinchVolumeSlider);

    // --------------------------------------------------------

    const backgroundVolumeSlider = new Slider(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.32 + this.height * 0.08 * 1,
      ),
      optionsSliderSize,
      new Vector2(0, optionsSliderLabelOffset.y),
      config,
      'backgroundMusicVolume',
      new Vector2(0, 1),
      (slider: Slider) => {
        slider.label!.setText('Track Volume: ' + slider.getStringValue());
        updateConfigValue(slider.key, slider.getValue());
      },
    );
    this.options.push(backgroundVolumeSlider);
    this.add.existing(backgroundVolumeSlider);

    // --------------------------------------------------------

    const mousePinchesEnabled = new Checkbox(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.32 + this.height * 0.08 * 1.5,
      ),
      25,
      new Vector2(-optionsCheckboxOffset.x, 0),
      'Enable Mouse Pinches',
      config,
      'mousePinchesEnabled',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
      },
    );
    this.options.push(mousePinchesEnabled);
    this.add.existing(mousePinchesEnabled);

    // --------------------------------------------------------

    const requireSinglePinch = new Checkbox(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.32 + this.height * 0.08 * 2,
      ),
      25,
      new Vector2(-optionsCheckboxOffset.x, 0),
      'Ignore Multifinger Pinches',
      config,
      'ignoreMultifingerPinches',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
      },
    );
    this.options.push(requireSinglePinch);
    this.add.existing(requireSinglePinch);

    // --------------------------------------------------------

    const displayVisualMetronome = new Checkbox(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.57 + this.height * 0.08 * 0,
      ),
      25,
      new Vector2(-optionsCheckboxOffset.x, 0),
      'Display Visual Metronome',
      config,
      'displayVisualMetronome',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
      },
    );
    this.options.push(displayVisualMetronome);
    this.add.existing(displayVisualMetronome);

    // --------------------------------------------------------

    const sonificationEnabled = new Checkbox(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.57 + this.height * 0.08 * 0.5,
      ),
      25,
      new Vector2(-optionsCheckboxOffset.x, 0),
      'Enable Sonification',
      config,
      'sonificationEnabled',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
      },
    );
    this.options.push(sonificationEnabled);
    this.add.existing(sonificationEnabled);

    const synchronizationEnabled = new Checkbox(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.57 + this.height * 0.08 * 1,
      ),
      25,
      new Vector2(-optionsCheckboxOffset.x, 0),
      'Enable Synchronization',
      config,
      'synchronizationEnabled',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
      },
    );
    this.options.push(synchronizationEnabled);
    this.add.existing(synchronizationEnabled);

    const unplayableBackingTracksEnabled = new Checkbox(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.57 + this.height * 0.08 * 1.5,
      ),
      25,
      new Vector2(-optionsCheckboxOffset.x, 0),
      'Enable Unplayable Backing Tracks',
      config,
      'unplayableBackingTracksEnabled',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
      },
    );
    this.options.push(unplayableBackingTracksEnabled);
    this.add.existing(unplayableBackingTracksEnabled);

    const playableBackingTracksEnabled = new Checkbox(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.57 + this.height * 0.08 * 2.0,
      ),
      25,
      new Vector2(-optionsCheckboxOffset.x, 0),
      'Enable Playable Backing Tracks',
      config,
      'playableBackingTracksEnabled',
      (checkbox: Checkbox) => {
        updateConfigValue(checkbox.key, checkbox.isChecked);
      },
    );
    this.options.push(playableBackingTracksEnabled);
    this.add.existing(playableBackingTracksEnabled);

    // --------------------------------------------------------

    // TODO: Re-enable this once there is a way to store it automatically on a server or elsewhere.
    // const autoSaveCSV = new Checkbox(
    //   this,
    //   new Vector2(this.width * 0.64, this.height * 0.57 + this.height * 0.08 * 2),
    //   25,
    //   new Vector2(-optionsCheckboxOffset.x, 0),
    //   'Automatically Save CSV',
    //   config,
    //   'autoSaveCSV',
    //   (checkbox: Checkbox) => {
    //     config[checkbox.key] = checkbox.isChecked
    //   }
    // )
    // this.options.push(autoSaveCSV)
    // this.add.existing(autoSaveCSV)

    // -------------------------------------------------------- MENU BUTTONS --------------------------------------------------------
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
  }
}
