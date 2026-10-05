// Utils.gs

function apiOk(data) {
  return { ok: true, data: data };
}

function apiFail(code, message) {
  return { ok: false, error: { code: code, message: message } };
}

function makeJsonResponse(result) {
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function withLock(actionName, fn) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
    if (!hasLock) {
      return makeJsonResponse(apiFail('LOCK_TIMEOUT', 'Gagal mendapatkan akses eksklusif untuk ' + actionName));
    }
    return makeJsonResponse(apiOk(fn()));
  } catch (e) {
    let code = 'UNKNOWN';
    let msg = String(e);
    if (e && e.code) {
      code = e.code;
      msg = e.message || msg;
    }
    return makeJsonResponse(apiFail(code, msg));
  } finally {
    lock.releaseLock();
  }
}

function withRead(actionName, fn) {
  try {
    return makeJsonResponse(apiOk(fn()));
  } catch (e) {
    let code = 'UNKNOWN';
    let msg = String(e);
    if (e && e.code) {
      code = e.code;
      msg = e.message || msg;
    }
    return makeJsonResponse(apiFail(code, msg));
  }
}

function getTodayWIB() {
  return Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
}

function getNamaBulan(monthNumber) {
  const nama = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return nama[monthNumber - 1];
}
