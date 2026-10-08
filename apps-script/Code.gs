// Paste this whole file into Google Apps Script (see README -> WISHES).
var SHEET_NAME = "Ucapan";

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(["Waktu", "Nama", "Ucapan"]); }
  return sh;
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function safe_(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }   // stops spreadsheet formulas

// Returns the latest 100 wishes, newest first.
function doGet() {
  var sh = sheet_(), n = sh.getLastRow();
  if (n < 2) return json_([]);
  var start = Math.max(2, n - 99);
  var rows = sh.getRange(start, 1, n - start + 1, 3).getValues().reverse();
  return json_(rows.map(function (r) { return { t: new Date(r[0]).getTime(), n: String(r[1]), m: String(r[2]) }; }));
}

// Saves a new wish.
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var n = String(d.n || "").trim().slice(0, 60);
    var m = String(d.m || "").trim().slice(0, 500);
    if (!n || !m || d.h) return json_({ ok: false });
    sheet_().appendRow([new Date(), safe_(n), safe_(m)]);
    return json_({ ok: true });
  } finally { lock.releaseLock(); }
}
