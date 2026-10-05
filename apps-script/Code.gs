// Code.gs

function doGet(e) {
  const action = e.parameter.action;
  
  if (!action) {
    return makeJsonResponse(apiFail('UNKNOWN_ACTION', 'Parameter action tidak ditemukan'));
  }

  if (action === 'students.list') {
    return withRead(action, function() {
      return getStudentsList();
    });
  }

  if (action === 'validate') {
    return withRead(action, function() {
      return validateSpreadsheets();
    });
  }

  if (action === 'absensi.getDay') {
    return withRead(action, function() {
      return getAbsenDay(e.parameter.date);
    });
  }

  if (action === 'absensi.monthOverview') {
    return withRead(action, function() {
      return getAbsenMonthOverview(e.parameter.month);
    });
  }
  
  return makeJsonResponse(apiFail('UNKNOWN_ACTION', 'Action GET tidak dikenali: ' + action));
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return makeJsonResponse(apiFail('INVALID_INPUT', 'Body bukan JSON valid'));
  }

  const action = body.action;
  const params = body.params || {};

  if (!action) {
    return makeJsonResponse(apiFail('UNKNOWN_ACTION', 'Action POST tidak ditemukan'));
  }

  if (action === 'absensi.saveDay') {
    return withLock(action, function() { return saveAbsenDay(params); });
  }

  if (action === 'absensi.clearDay') {
    return withLock(action, function() { return clearAbsenDay(params); });
  }

  if (action === 'absensi.setLibur') {
    return withLock(action, function() { return setLiburDay(params); });
  }

  return makeJsonResponse(apiFail('UNKNOWN_ACTION', 'Action POST tidak dikenali: ' + action));
}
