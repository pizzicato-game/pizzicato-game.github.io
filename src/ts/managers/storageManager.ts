/* eslint-disable no-async-promise-executor */
import { ConfigData, LevelStats } from '../core/interfaces';
import { levelStatsToCSV } from '../util/csvFormat';
import { absPath, loadJSONData, storeData } from '../core/common';
import { configFilePath, csvFileExtension } from '../core/config';
import FileSaver from 'file-saver';
import {
  currentUser,
  getCurrentUserConfig,
  getCurrentUserName,
  writeDataToCurrentUser,
} from '../core/game';

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
    let guest: boolean = false;
    if (currentUser) {
      if (config) {
        guest = false;
        resolve(config);
      } else {
        await getCurrentUserConfig()
          .then((pair: [ConfigData, string]) => {
            const [data, configName] = pair;
            console.info(
              'INFO: Playing as "' +
                getCurrentUserName() +
                '" with config: "' +
                configName +
                '"',
            );
            guest = false;
            updateConfig(data);
            resolve(data);
          })
          .catch(err => {
            console.info('INFO: ' + err);
            guest = true;
          });
      }
    } else {
      guest = true;
    }
    if (guest) {
      console.info('INFO: Playing as guest');
      await loadJSONData(absPath(filePath))
        .then((result: unknown) => {
          const data = result as ConfigData;
          updateConfig(data);
          resolve(data);
        })
        .catch(() => {
          reject();
        });
    }
  });
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
