import HandScene from './handScene';
import { Button } from '../ui/button';
import Level from '../level/level';
import { levels } from './loadingScene';
import { LevelConverter } from '../util/levelConverter';
import { UploadedLevelManager } from '../managers/uploadedLevelManager';
import { defaultConfig, updateConfig } from '../managers/storageManager';
import { getStudyPlan, getStudySession, setPendingAssignment, publishedLevels } from '../study/runtime';
import { studyApi } from '../study/firebaseClient';
import { downloadResults } from '../study/offline';
import { TrackData } from '../level/trackTypes';

export default class StudySessionScene extends HandScene {
  private status: Phaser.GameObjects.Text;
  constructor() { super('studySession'); }
  preload() { levels.forEach(level => level.preload(this)); }
  create() {
    super.create();
    const session = getStudySession();
    if (!session) { this.scene.start('mainMenu'); return; }
    const plan = getStudyPlan();
    const title = this.add.text(this.center.x, 220, session.settings.title, { font: '65px Courier New', color: '#ffffff', align: 'center' }).setOrigin(.5);
    const message = plan?.beforeStart && plan.week !== 0 ? 'Your training programme has not started yet.' :
      plan?.capped ? 'You have completed the maximum sessions for this week.' :
      !plan?.assignments.length ? 'There are no levels scheduled for this week.' :
      `${session.settings.introText}\nWEEK ${plan.week} · SESSION ${plan.sessionId.split('-')[1]}\n${plan.index >= 0 ? `Level ${plan.index + 1} of ${plan.assignments.length}` : 'Session complete!'}`;
    this.add.text(this.center.x, 420, message, { font: '31px Courier New', color: '#ffffff', align: 'center', wordWrap: { width: 1500 } }).setOrigin(.5);
    this.status = this.add.text(this.center.x, 580, '', { font: '25px Courier New', color: '#ffd676', align: 'center', wordWrap: { width: 1500 } }).setOrigin(.5);
    if (plan && !plan.capped && plan.index >= 0) {
      new Button(this, 'START\nLEVEL', this.center.x + 300, 810, () => { void this.playLevel(); });
      new Button(this, 'SETUP\nCAMERA', this.center.x - 300, 810, () => this.scene.start('calibration'));
    }
    if (session.mode === 'offline') new Button(this, 'EXPORT\nRESULTS', 200, 940, () => { void downloadResults(session.account.studyId!, session.account.participantId!); });
  }
  private async playLevel() {
    const session = getStudySession(); const plan = getStudyPlan();
    if (!session || !plan || plan.capped || plan.index < 0) return;
    const assignment = plan.assignments[plan.index];
    this.status.setText('Preparing assigned level...');
    try {
      let level: Level;
      const [kind, id] = [assignment.levelId.slice(0, assignment.levelId.indexOf(':')), assignment.levelId.slice(assignment.levelId.indexOf(':') + 1)];
      if (kind === 'legacy') {
        const candidate = levels.find(item => item.trackKey === id);
        if (!candidate) throw new Error(`Legacy level ${id} is not installed`);
        level = candidate;
      } else {
        let data: unknown;
        if (kind === 'uploaded') {
          if (session.mode === 'online') throw new Error('Uploaded: levels are local to this device. Publish them to the central library for online studies.');
          data = UploadedLevelManager.loadLevelData(id);
        } else if (kind === 'library') {
          data = publishedLevels[id];
          if (!data && session.mode === 'online') data = (await studyApi.getLevel(id)).level.data;
        } else throw new Error('Unsupported level identifier');
        if (!data) throw new Error(`Level ${id} not found. Check the study library/offline pack.`);
        const track = data as TrackData;
        if (!Array.isArray(track.bpm) || !Array.isArray(track.layers)) throw new Error('Invalid published level');
        const key = LevelConverter.generateTempLevelKey();
        this.cache.json.add(key, JSON.parse(JSON.stringify(track)));
        level = new Level(this, key);
      }
      if (!level.track.data?.bpm?.[assignment.bpmIndex]) throw new Error('Assigned BPM index does not exist in this level');
      updateConfig({ ...defaultConfig, ...session.settings.defaultConfig, ...(session.settings.groupConfigs?.[session.account.group || ''] || {}), ...assignment.configOverride,
        skipLayersAutomatically: true, skipLayersAutomaticallyAfterLoop: assignment.loops });
      level.setBPM(assignment.bpmIndex);
      setPendingAssignment(plan.week, plan.sessionId, plan.index, plan.assignments.length, assignment);
      this.scene.start('level', level);
    } catch (error) {
      this.status.setText(error instanceof Error ? error.message : String(error));
    }
  }
}
