import { ConfigData, LevelStats } from 'core/interfaces';
import { levelStatsToCSV } from 'util/csvFormat';
import { absRootPath, absPath } from 'core/common';
import {
  configFilePath,
  csvFileExtension,
  csvFilePath,
  defaultConfigFilePath,
} from 'core/config';

export let config: ConfigData;

function updateConfig(data: ConfigData) {
  config = data;
}

export function saveConfigData(data: ConfigData): void {
  window.electron.storeData(absPath(configFilePath), JSON.stringify(data));
  updateConfig(data);
}

export function loadDefaultConfigData(): ConfigData {
  const data = JSON.parse(
    window.electron.loadData(absPath(defaultConfigFilePath)),
  );
  updateConfig(data);
  return data;
}

export function loadConfigData(): ConfigData {
  try {
    const data = JSON.parse(window.electron.loadData(absPath(configFilePath)));
    updateConfig(data);
    return data;
  } catch (e) {
    return loadDefaultConfigData();
  }
}

export function saveToCSV(data: LevelStats) {
  saveCSV(data.id, levelStatsToCSV(data));
}

function saveCSV(fileName: string, csv: string): void {
  const path = absRootPath(csvFilePath) + fileName + csvFileExtension;

  window.electron.storeData(path, csv);
}
