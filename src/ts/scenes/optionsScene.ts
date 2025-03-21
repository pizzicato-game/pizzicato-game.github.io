import HandScene from '../scenes/handScene';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import {
  config,
  defaultConfig,
  saveConfigData,
} from '../managers/storageManager';
import webcam from '../objects/webcam';
import { ConfigData } from '../core/interfaces';
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

export default class Options extends HandScene {
  private configData: ConfigData;
  private defaultData: ConfigData;

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

  private setConfig() {
    saveConfigData(this.configData);
    webcam.setVisibility(this.configData.enableCameraVisibility);
  }

  private saveAndExit() {
    this.setConfig();
    //this.setOpacity(this.configData.cameraOpacity);
    if (this.rotateTween != undefined) {
      this.rotateTween.destroy();
    }
    if (this.glowTween != undefined) {
      this.glowTween.destroy();
    }
    if (this.glow != undefined) {
      this.glow.destroy();
    }
    this.scene.start('mainMenu');
  }

  public create() {
    super.create();

    this.defaultData = defaultConfig;
    this.configData = config;
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
    const optionsSliderSize = new Vector2(
      this.width * 0.26,
      this.height * 0.03,
    );

    const halfButtonGapX: number = this.width * 0.15;

    this.back = new Button(
      this,
      'BACK',
      this.center.x - halfButtonGapX,
      this.height * 0.9,
      () => {
        this.saveAndExit();
      },
    );
    this.resetConfig = new Button(
      this,
      'RESET TO\nDEFAULT',
      this.center.x + halfButtonGapX,
      this.height * 0.9,
      async () => {
        console.info('INFO: Reset config data to defaults');
        for (const option of this.options) {
          option.reset(this.defaultData);
        }
        this.setGlowTimeScale(this.defaultData['onTimeDuration'] / 2);
        this.configData = structuredClone(this.defaultData);
        this.setConfig();
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
      .setScale(this.configData['targetSize']);
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
    const glowDuration: number = this.configData['onTimeDuration'] / 2;
    this.glowTween = this.tweens.add({
      targets: this.glow,
      outerStrength: targetGlowOptions.outerStrength,
      yoyo: true,
      duration: glowDuration,
      ease: targetGlowOptions.ease,
      repeat: -1,
    });
    this.setGlowTimeScale(glowDuration);
    if (
      this.configData['postProcessingDisabled'] &&
      this.glowTween != undefined
    ) {
      this.glowTween.pause();
    }
    const targetScaleSlider = new Slider(
      this,
      new Vector2(this.width * 0.1, this.height * 0.1 + this.height * 0.08 * 0),
      optionsSliderSize,
      new Vector2(0, optionsSliderLabelOffset.y),
      this.configData,
      'targetSize',
      new Vector2(0.5, 3),
      (slider: Slider) => {
        slider.label!.setText('Target Scale: ' + slider.getStringValue());
        const sliderValue: number = slider.getValue();
        this.configData[slider.key] = sliderValue;
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
      this.configData,
      'fingerSize',
      new Vector2(0.5, 3),
      (slider: Slider) => {
        if (slider.label != undefined)
          slider.label.setText('Finger Scale: ' + slider.getStringValue());
        const sliderValue: number = slider.getValue();
        this.configData[slider.key] = sliderValue;
        this.hand.setFingerScale(sliderValue);
      },
    );
    this.options.push(fingerScaleSlider);
    this.add.existing(fingerScaleSlider);

    // --------------------------------------------------------

    const opacityCallback = (slider: Slider) => {
      if (slider == undefined || !slider.active) return;
      if (slider.label != undefined && slider.label.active)
        slider.label.setText('Camera Opacity: ' + slider.getStringValue());
      this.configData[slider.key] = slider.getValue();
      this.setOpacity(this.configData[slider.key] as number);
    };

    const cameraOpacitySlider = new Slider(
      this,
      new Vector2(
        this.width * 0.1,
        this.height * 0.32 + this.height * 0.08 * 0,
      ),
      optionsSliderSize,
      optionsSliderLabelOffset,
      this.configData,
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
      this.configData,
      'enableCameraVisibility',
      (checkbox: Checkbox) => {
        this.configData[checkbox.key] = checkbox.isChecked;
        webcam.setVisibility(checkbox.isChecked);
        if (checkbox.isChecked) {
          cameraOpacitySlider.draw();
        } else {
          cameraOpacitySlider.setValue(this.configData['cameraOpacity']);
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
      this.configData,
      'skipButtonAppearsAfterLoop',
      new Vector2(1, 16),
      (slider: Slider) => {
        slider.label!.setText(
          'Skip Button After Loop: ' + slider.getStringValue(),
        );
        this.configData[slider.key] = slider.getValue();
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
      this.configData,
      'showSkipButton',
      (checkbox: Checkbox) => {
        this.configData[checkbox.key] = checkbox.isChecked;
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
      this.configData,
      'skipLayersAutomaticallyAfterLoop',
      new Vector2(1, 16),
      (slider: Slider) => {
        slider.label!.setText(
          'Skip Layers After Loop: ' + slider.getStringValue(),
        );
        this.configData[slider.key] = slider.getValue();
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
      this.configData,
      'skipLayersAutomatically',
      (checkbox: Checkbox) => {
        this.configData[checkbox.key] = checkbox.isChecked;
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
      this.configData,
      'disableLayerProgression',
      (checkbox: Checkbox) => {
        this.configData[checkbox.key] = checkbox.isChecked;
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
      this.configData,
      'indexFingerOnly',
      (checkbox: Checkbox) => {
        this.configData[checkbox.key] = checkbox.isChecked;
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
      this.configData,
      'postProcessingDisabled',
      (checkbox: Checkbox) => {
        this.configData[checkbox.key] = checkbox.isChecked;
        if (checkbox.isChecked) {
          if (this.glowTween != undefined) {
            this.glowTween.restart();
            this.glowTween.pause();
          }
          if (this.glow != undefined) {
            this.targetExample.postFX.disable();
          }
        } else if (!checkbox.isChecked) {
          if (this.glowTween != undefined && this.targetExample != undefined)
            this.glowTween.resume();
          if (this.glow != undefined) {
            this.targetExample.postFX.enable();
          }
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
      this.configData,
      'onTimeDuration',
      this.onTimeDurationLimits,
      (slider: Slider) => {
        slider.label!.setText(
          'On Time Duration: ' + slider.getStringValue() + ' ms',
        );
        this.configData[slider.key] = slider.getValue();
        this.setGlowTimeScale(this.configData['onTimeDuration'] / 2);
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
      this.configData,
      'lateTimeDuration',
      new Vector2(50, 1000),
      (slider: Slider) => {
        slider.label!.setText(
          'Late Time Duration: ' + slider.getStringValue() + ' ms',
        );
        this.configData[slider.key] = slider.getValue();
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
      this.configData,
      'pinchVolume',
      new Vector2(0, 1),
      (slider: Slider) => {
        slider.label!.setText('Pinch Volume: ' + slider.getStringValue());
        this.configData[slider.key] = slider.getValue();
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
      this.configData,
      'backgroundMusicVolume',
      new Vector2(0, 1),
      (slider: Slider) => {
        slider.label!.setText('Track Volume: ' + slider.getStringValue());
        this.configData[slider.key] = slider.getValue();
      },
    );
    this.options.push(backgroundVolumeSlider);
    this.add.existing(backgroundVolumeSlider);

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
      this.configData,
      'ignoreMultifingerPinches',
      (checkbox: Checkbox) => {
        this.configData[checkbox.key] = checkbox.isChecked;
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
      this.configData,
      'displayVisualMetronome',
      (checkbox: Checkbox) => {
        this.configData[checkbox.key] = checkbox.isChecked;
      },
    );
    this.options.push(displayVisualMetronome);
    this.add.existing(displayVisualMetronome);

    // --------------------------------------------------------

    const sonificationEnabled = new Checkbox(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.57 + this.height * 0.08 * 1,
      ),
      25,
      new Vector2(-optionsCheckboxOffset.x, 0),
      'Enable Sonification',
      this.configData,
      'sonificationEnabled',
      (checkbox: Checkbox) => {
        this.configData[checkbox.key] = checkbox.isChecked;
      },
    );
    this.options.push(sonificationEnabled);
    this.add.existing(sonificationEnabled);

    const synchronizationEnabled = new Checkbox(
      this,
      new Vector2(
        this.width * 0.64,
        this.height * 0.57 + this.height * 0.08 * 2,
      ),
      25,
      new Vector2(-optionsCheckboxOffset.x, 0),
      'Enable Synchronization',
      this.configData,
      'synchronizationEnabled',
      (checkbox: Checkbox) => {
        this.configData[checkbox.key] = checkbox.isChecked;
      },
    );
    this.options.push(synchronizationEnabled);
    this.add.existing(synchronizationEnabled);

    // --------------------------------------------------------

    // TODO: Re-enable this once there is a way to store it automatically on a server or elsewhere.
    // const autoSaveCSV = new Checkbox(
    //   this,
    //   new Vector2(this.width * 0.64, this.height * 0.57 + this.height * 0.08 * 2),
    //   25,
    //   new Vector2(-optionsCheckboxOffset.x, 0),
    //   'Automatically Save CSV',
    //   this.configData,
    //   'autoSaveCSV',
    //   (checkbox: Checkbox) => {
    //     this.configData[checkbox.key] = checkbox.isChecked
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
