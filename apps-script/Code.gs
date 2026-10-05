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

  if (action === 'absensi.summary') {
    return withRead(action, function() {
      return getAbsenSummary(e.parameter.from, e.parameter.to, e.parameter.no);
    });
  }
  
  if (action === 'nilai.subjects') {
    return withRead(action, function() {
      return getNilaiSubjects();
    });
  }

  if (action === 'nilai.getSheet') {
    return withRead(action, function() {
      return getNilaiSheetData(e.parameter.mapel);
    });
  }
  
  if (action === 'kas.getData') {
    return withRead(action, function() {
      return getKasData(parseInt(e.parameter.year, 10));
    });
  }

  if (action === 'kas.summary') {
    return withRead(action, function() {
      return getKasSummary(parseInt(e.parameter.year, 10));
    });
  }

  if (action === 'kas.expenses.list') {
    return withRead(action, function() {
      return listKasExpenses();
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

  if (action === 'kas.setWeek') {
    return withLock(action, function() { return setKasWeek(params); });
  }

  if (action === 'kas.pay') {
    return withLock(action, function() { return payKas(params); });
  }

  if (action === 'kas.createYear') {
    return withLock(action, function() { return createKasYear(params); });
  }

  if (action === 'kas.expenses.add') {
    return withLock(action, function() { return addKasExpense(params); });
  }

  if (action === 'kas.expenses.update') {
    return withLock(action, function() { return updateKasExpense(params); });
  }

  if (action === 'kas.expenses.delete') {
    return withLock(action, function() { return deleteKasExpense(params); });
  }

  if (action === 'nilai.addDaily') {
    return withLock(action, function() { return addNilaiDaily(params); });
  }

  if (action === 'nilai.setExam') {
    return withLock(action, function() { return setNilaiExam(params); });
  }

  if (action === 'nilai.setCell') {
    return withLock(action, function() { return setNilaiCell(params); });
  }

  return makeJsonResponse(apiFail('UNKNOWN_ACTION', 'Action POST tidak dikenali: ' + action));
}
