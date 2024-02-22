import { ConfigData, LevelStats } from '../core/interfaces';
import { levelStatsToCSV } from '../util/csvFormat';
import { absRootPath, absPath, loadJSONData, storeData } from '../core/common';
import { configFilePath, csvFileExtension, csvFilePath } from '../core/config';
const FileSaver = require('file-saver');

export let config: ConfigData;

function updateConfig(data: ConfigData) {
  config = data;
}

export function saveConfigData(data: ConfigData): void {
  storeData(absPath(configFilePath), JSON.stringify(data));
  updateConfig(data);
}

export function loadData(filePath: string): Promise<ConfigData> {
  return new Promise<ConfigData>(async (resolve, reject) => {
    await loadJSONData(absPath(filePath))
      .then((result: unknown) => {
        const data = result as ConfigData;
        updateConfig(data);
        resolve(data);
      })
      .catch(() => {
        reject();
      });
  });
}

export function saveToCSV(data: LevelStats) {
  var blob = new Blob([levelStatsToCSV(data)], {
    type: 'text/plain;charset=utf-8',
  });
  FileSaver.saveAs(blob, data.id + csvFileExtension);
  //saveCSV(data.id, levelStatsToCSV(data))
}

export function autoSaveToCSV(data: LevelStats) {
  // TODO: Figure this out in browser.
  //saveCSV(data.id, levelStatsToCSV(data))
}

function saveCSV(fileName: string, csv: string): void {
  const path = absRootPath(csvFilePath) + fileName + csvFileExtension;

  storeData(path, csv);
}
