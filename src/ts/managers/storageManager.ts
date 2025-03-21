import { ConfigData, LevelStats } from '../core/interfaces';
import { levelStatsToCSV } from '../util/csvFormat';
import { csvFileExtension } from '../core/config';
import FileSaver from 'file-saver';
import { currentUser, writeDataToCurrentUser } from '../core/game';

export let defaultConfig: ConfigData;
export let config: ConfigData;

export function updateConfig(
  data: ConfigData,
  announceInConsole: boolean = true,
) {
  config = structuredClone(data);
  if (announceInConsole) {
    console.info('INFO: Config set to:');
    console.info(config);
  }
}

export function updateDefaultConfig(data: ConfigData) {
  defaultConfig = data;
  console.info('INFO: Default config set to:');
  console.info(defaultConfig);
}

export function updateConfigValue(key: keyof ConfigData, value: unknown) {
  config[key] = value;
}

export function saveToCSV(data: LevelStats) {
  const blob = new Blob([levelStatsToCSV(data)], {
    type: 'text/plain;charset=utf-8',
  });
  FileSaver.saveAs(blob, data.id + csvFileExtension);
  //saveCSV(data.id, levelStatsToCSV(data));
}

export function autoSaveToCSV(data: LevelStats) {
  // TODO: Figure this out in browser.
  //saveCSV(data.id, levelStatsToCSV(data));
  if (currentUser) {
    const jsonData = JSON.parse(JSON.stringify(data));
    writeDataToCurrentUser(data.id, jsonData)
      .then(result => {
        console.info('INFO: ' + result);
      })
      .catch(err => {
        console.info('INFO: ' + err);
      });
  }
}

// export function saveCSV(fileName: string, csv: string): void {
//   const path = absRootPath(csvFilePath) + fileName + csvFileExtension;
//   storeData(path, csv);
// }
