// Paste this whole file into Google Apps Script (replace the old code), then Save and redeploy (see README).
var SHEET_NAME = "Ucapan";

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(["Waktu", "Nama", "Ucapan", "Kehadiran"]); }
  else if (!sh.getRange("D1").getValue()) { sh.getRange("D1").setValue("Kehadiran"); }   // adds the new column header
  return sh;
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function safe_(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }   // stops spreadsheet formulas

// Latest 100 wishes, newest first.
function doGet() {
  var sh = sheet_(), n = sh.getLastRow();
  if (n < 2) return json_([]);
  var start = Math.max(2, n - 99);
  var rows = sh.getRange(start, 1, n - start + 1, 4).getValues().reverse();
  return json_(rows.map(function (r) {
    return { t: new Date(r[0]).getTime(), n: String(r[1]), m: String(r[2]), a: String(r[3] || "") };
  }));
}

// Saves a new wish. Attendance must be "Hadir" or "Tidak hadir".
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var n = String(d.n || "").trim().slice(0, 60);
    var m = String(d.m || "").trim().slice(0, 500);
    var a = String(d.a || "");
    if (!n || !m || d.h || (a !== "Hadir" && a !== "Tidak hadir")) return json_({ ok: false });
    sheet_().appendRow([new Date(), safe_(n), safe_(m), a]);
    return json_({ ok: true });
  } finally { lock.releaseLock(); }
}
