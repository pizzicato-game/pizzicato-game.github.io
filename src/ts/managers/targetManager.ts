import Target from '../objects/target';

export class TargetManager {
  private targets: Target[] = [];

  constructor() {}

  public start() {
    this.destroyTargets();
  }

  public destroyTarget(target: Target) {
    target.destroyTarget();
    const index = this.targets.indexOf(target, 0);
    if (index > -1) {
      this.targets.splice(index, 1);
    }
  }

  public destroyTargets() {
    const targets: Target[] = [...this.targets];
    for (const target of targets) {
      this.destroyTarget(target);
    }
  }

  public addTarget(target: Target) {
    this.targets.push(target);
  }

  public getPreviousTargets(target: Target): Target[] {
    return this.targets.filter((t: Target) => t.songTime < target.songTime);
  }
}
