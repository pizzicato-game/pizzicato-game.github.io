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

//todo this is the old function.
// export function levelStatsToCSV(levelStats: LevelStats): string {
//   let csvContent =
//     'maxStreak,total,required,onTime,early,late,miss,loop,times\n'; // column headers
//
//   for (const layerStats of levelStats.layersStats) {
//     const times = layerStats.hits
//       .map(
//         (hitInfo: HitInfo) =>
//           `playerTime: ${hitInfo.playerTime}, correctTime: ${hitInfo.correctTime}`,
//       )
//       .join('|'); // convert HitInfo to string
//     const row = `${levelStats.maxStreak},${layerStats.total},${layerStats.required},${layerStats.correct},${layerStats.early},${layerStats.late},${layerStats.miss},${layerStats.loop},"${times}"\n`;
//     csvContent += row;
//   }
//   return csvContent;
// }
