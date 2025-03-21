function millisecondsToSeconds(time, roundTo = 3) {
  return parseFloat((time / 1000).toFixed(roundTo));
}

function levelStatsToCSV(id, levelStats) {
  if (!levelStats.hasOwnProperty('layersStats')) {
    return '';
  }

  let csvContent = id + '\n';

  // Row labels.
  csvContent +=
    'layerID,noteID,pinchType,loopNumber,playerTime,correctTime,classification,normalizedTargetRadius,normalizedTargetPositionX,normalizedTargetPositionY,normalizedFingerRadius,normalizedPinkyFingerPositionX,normalizedPinkyFingerPositionY,normalizedRingFingerPositionX,normalizedRingFingerPositionY,normalizedMiddleFingerPositionX,normalizedMiddleFingerPositionY,normalizedIndexFingerPositionX,normalizedIndexFingerPositionY,normalizedThumbFingerPositionX,normalizedThumbFingerPositionY\n';

  let addedRows = 0;

  for (const layerStats of levelStats.layersStats) {
    const layerID = levelStats.layersStats.indexOf(layerStats);
    if (!layerStats.hasOwnProperty('hits')) {
      continue;
    }
    for (const hitInfo of layerStats.hits) {
      if (
        !hitInfo.hasOwnProperty('noteID') ||
        !hitInfo.hasOwnProperty('pinchType') ||
        !hitInfo.hasOwnProperty('loopNumber') ||
        !hitInfo.hasOwnProperty('playerTime') ||
        !hitInfo.hasOwnProperty('correctTime') ||
        !hitInfo.hasOwnProperty('classification') ||
        !hitInfo.hasOwnProperty('normalizedTargetRadius') ||
        !hitInfo.hasOwnProperty('normalizedTargetPosition') ||
        !hitInfo.hasOwnProperty('normalizedFingerRadius') ||
        !hitInfo.hasOwnProperty('normalizedPinkyFingerPosition') ||
        !hitInfo.hasOwnProperty('normalizedRingFingerPosition') ||
        !hitInfo.hasOwnProperty('normalizedMiddleFingerPosition') ||
        !hitInfo.hasOwnProperty('normalizedIndexFingerPosition') ||
        !hitInfo.hasOwnProperty('normalizedThumbFingerPosition')
      ) {
        continue;
      }
      const fingerRadius = hitInfo.normalizedFingerRadius
        ? hitInfo.normalizedFingerRadius
        : null;
      const [targetX, targetY] = hitInfo.normalizedTargetPosition;
      const [pinkyX, pinkyY] = hitInfo.normalizedPinkyFingerPosition
        ? hitInfo.normalizedPinkyFingerPosition
        : [null, null];
      const [ringX, ringY] = hitInfo.normalizedRingFingerPosition
        ? hitInfo.normalizedRingFingerPosition
        : [null, null];
      const [middleX, middleY] = hitInfo.normalizedMiddleFingerPosition
        ? hitInfo.normalizedMiddleFingerPosition
        : [null, null];
      const [indexX, indexY] = hitInfo.normalizedIndexFingerPosition
        ? hitInfo.normalizedIndexFingerPosition
        : [null, null];
      const [thumbX, thumbY] = hitInfo.normalizedThumbFingerPosition
        ? hitInfo.normalizedThumbFingerPosition
        : [null, null];

      const row = `${layerID},${hitInfo.noteID},${hitInfo.pinchType},${hitInfo.loopNumber},${millisecondsToSeconds(hitInfo.playerTime)},${millisecondsToSeconds(hitInfo.correctTime)},${hitInfo.classification},${hitInfo.normalizedTargetRadius},${targetX},${targetY},${fingerRadius},${pinkyX},${pinkyY},${ringX},${ringY},${middleX},${middleY},${indexX},${indexY},${thumbX},${thumbY}\n`;

      csvContent += row;
      addedRows++;
    }
  }
  if (addedRows == 0) {
    return '';
  }
  return csvContent;
}

function addCSVToSheet(sheet, csvData) {
  // Parses CSV file into data array.
  let data = Utilities.parseCsv(csvData);
  // Gets the row and column coordinates for next available range in the spreadsheet.
  let startRow = sheet.getLastRow() + 1;
  let startCol = 1;
  // Determines the incoming data size.
  let numRows = data.length;
  let numColumns = data[0].length;

  // Appends data into the sheet.
  sheet.getRange(startRow, startCol, numRows, numColumns).setValues(data);
}

function getAllPizzicatoData() {
  const databaseURL =
    'https://pizzicato-1f765-default-rtdb.europe-west1.firebasedatabase.app/';
  const secret = 'INSERTSECRETKEYHERE';

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var sheets = ss.getSheets();

  // 4. Get the database reference
  const db = FirebaseApp.getDatabaseByUrl(databaseURL, secret); // Use databaseURL

  const userData = JSON.parse(JSON.stringify(db.getData()));
  const users = userData['users'];

  sheets.forEach(function (sheet) {
    if (sheet.getName() != 'BaseSheet') {
      ss.deleteSheet(sheet);
    }
  });

  for (var key in users) {
    const user = users[key];
    if (user.hasOwnProperty('name')) {
      const userSheet = ss.insertSheet(user.name);
      let csv = 'Username:,' + user.name + '\n';
      if (user.hasOwnProperty('lastLogin')) {
        csv += 'Last Login:,' + user.lastLogin + '\n';
      }
      if (user.hasOwnProperty('config')) {
        csv += 'User Config:,' + user.config + '\n';
      }
      if (user.hasOwnProperty('data')) {
        csv += '\n';
        for (var dataId in user.data) {
          const data = user.data[dataId];
          csv += levelStatsToCSV(dataId, data);
        }
      }
      addCSVToSheet(userSheet, csv);
    }
  }

  //var sheet = sheets.getSheetByName(name);

  // if (yourNewSheet != null) {
  //     activeSpreadsheet.deleteSheet(yourNewSheet);
  // }

  // yourNewSheet = activeSpreadsheet.insertSheet();
  // yourNewSheet.setName(name);

  // for (i = 0; i < users.length; i++) {
  //   userData[i];
  // }
  // sheet.getRange("A1").setNumberFormat('@STRING@').setValue(userData);
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp, SlidesApp or FormApp.
  ui.createMenu('Pizzicato Scripts')
    .addItem('Refresh All Data', 'getAllPizzicatoData')
    .addToUi();
}

// function getFirebaseUrl(jsonPath) {
//   /*
//   We then make a URL builder
//   This takes in a path, and
//   returns a URL that updates the data in that path
//   */
//   return (
//     'https://pizzicato-1f765-default-rtdb.europe-west1.firebasedatabase.app/' +
//     jsonPath +
//     '.json?auth=' +
//     secret
//   )
// }

// function syncMasterSheet(excelData) {
//   /*
//   We make a PUT (update) request,
//   and send a JSON payload
//   More info on the REST API here : https://firebase.google.com/docs/database/rest/start
//   */
//   var options = {
//     method: 'put',
//     contentType: 'application/json',
//     payload: JSON.stringify(excelData)
//   }
//   var fireBaseUrl = getFirebaseUrl('masterSheet')

//   /*
//   We use the UrlFetchApp google scripts module
//   More info on this here : https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
//   */
//   UrlFetchApp.fetch(fireBaseUrl, options)
// }

// function startSync() {
//   //Get the currently active sheet
//   var sheet = SpreadsheetApp.getActiveSheet()
//   //Get the number of rows and columns which contain some content
//   var [rows, columns] = [sheet.getLastRow(), sheet.getLastColumn()]
//   //Get the data contained in those rows and columns as a 2 dimensional array
//   var data = sheet.getRange(1, 1, rows, columns).getValues()

//   //Use the syncMasterSheet function defined before to push this data to the "masterSheet" key in the firebase database
//   syncMasterSheet(data)
// }
