import { LevelStats } from '../core/interfaces';

/**
 * Function to convert a levelStats object to a csv string, it's best to keep this in the same file as the interfaces.
 * @param levelStats the stats to convert.
 * @return the data in a CSV format string.
 */
export function levelStatsToCSV(levelStats: LevelStats): string {
  let csvContent =
    'layerID,noteID,loopNumber,playerTime,correctTime,classification\n'; // column headers

  for (const layerStats of levelStats.layersStats) {
    const layerID = levelStats.layersStats.indexOf(layerStats);
    for (const hitInfo of layerStats.hits) {
      const row = `${layerID},${hitInfo.noteID},${hitInfo.loopNumber},${millisecondsToSeconds(
        hitInfo.playerTime,
      )},${millisecondsToSeconds(hitInfo.correctTime)},${hitInfo.classification}\n`;
      csvContent += row;
    }
  }
  return csvContent;
}

function millisecondsToSeconds(time: number, roundTo: number = 3): number {
  return parseFloat((time / 1000).toFixed(roundTo));
}
