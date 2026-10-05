// Kas.gs

function getKasSemester(semester) {
  const ss = getKasSs();
  const sheetName = CONFIG.KAS_SEMESTER_SHEET[semester];
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return {
      semester: semester,
      sheetExists: false,
      rows: []
    };
  }
  
  const startRow = CONFIG.OFFSET_BARIS_KAS + 1; // 6
  const numRows = 32;
  const numWeeks = CONFIG.MINGGU_PER_SEMESTER; // 22
  
  // Baca C6:Y37
  const range = sheet.getRange(startRow, 3, numRows, numWeeks + 1);
  const values = range.getValues();
  
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    const rowValues = values[i];
    const weeks = [];
    for (let w = 0; w < numWeeks; w++) {
      weeks.push(rowValues[w] === true || rowValues[w] === 'TRUE');
    }
    const total = parseFloat(rowValues[numWeeks]) || 0;
    
    rows.push({
      no: i + 1,
      weeks: weeks,
      total: total
    });
  }
  
  return {
    semester: semester,
    sheetExists: true,
    rows: rows
  };
}

function getKasSummary() {
  const ss = getKasSs();
  let pemasukan = 0;
  let pengeluaran = 0;
  
  const ganjilName = CONFIG.KAS_SEMESTER_SHEET['ganjil'];
  const ganjilSheet = ss.getSheetByName(ganjilName);
  
  if (ganjilSheet) {
    pemasukan += parseFloat(ganjilSheet.getRange('C38').getValue()) || 0;
    pengeluaran = parseFloat(ganjilSheet.getRange('C39').getValue()) || 0;
  }
  
  const genapName = CONFIG.KAS_SEMESTER_SHEET['genap'];
  const genapSheet = ss.getSheetByName(genapName);
  if (genapSheet) {
    pemasukan += parseFloat(genapSheet.getRange('C38').getValue()) || 0;
  }
  
  return {
    pemasukan: pemasukan,
    pengeluaran: pengeluaran,
    saldo: pemasukan - pengeluaran
  };
}

function setKasWeek(params) {
  const semester = params.semester;
  const no = params.no;
  const week = params.week; // 1-22
  const paid = params.paid;
  
  const ss = getKasSs();
  const sheetName = CONFIG.KAS_SEMESTER_SHEET[semester];
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw { code: 'SHEET_NOT_FOUND', message: 'Sheet semester tidak ada: ' + sheetName };
  }
  
  // Baris = OFFSET_BARIS_KAS + no -> 5 + no
  const row = CONFIG.OFFSET_BARIS_KAS + no;
  // Kolom minggu = 2 + week
  const col = 2 + week;
  
  sheet.getRange(row, col).setValue(paid);
  
  // Baca kembali baris tersebut untuk return
  const numWeeks = CONFIG.MINGGU_PER_SEMESTER;
  const rowValues = sheet.getRange(row, 3, 1, numWeeks + 1).getValues()[0];
  
  const weeks = [];
  for (let w = 0; w < numWeeks; w++) {
    weeks.push(rowValues[w] === true || rowValues[w] === 'TRUE');
  }
  const total = parseFloat(rowValues[numWeeks]) || 0;
  
  return {
    no: no,
    weeks: weeks,
    total: total
  };
}

function payKas(params) {
  const semester = params.semester;
  const no = params.no;
  const count = params.count || 1;
  
  const ss = getKasSs();
  const sheetName = CONFIG.KAS_SEMESTER_SHEET[semester];
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw { code: 'SHEET_NOT_FOUND', message: 'Sheet semester tidak ada: ' + sheetName };
  }
  
  const row = CONFIG.OFFSET_BARIS_KAS + no;
  const numWeeks = CONFIG.MINGGU_PER_SEMESTER;
  const range = sheet.getRange(row, 3, 1, numWeeks);
  const weeksData = range.getValues()[0];
  
  const weeksChecked = [];
  let checkedCount = 0;
  
  for (let w = 0; w < numWeeks && checkedCount < count; w++) {
    if (weeksData[w] !== true && weeksData[w] !== 'TRUE') {
      weeksData[w] = true;
      weeksChecked.push(w + 1); // 1-based week
      checkedCount++;
    }
  }
  
  if (checkedCount === 0) {
    throw { code: 'NOTHING_TO_PAY', message: 'Semua minggu kas sudah lunas' };
  }
  
  // Tulis kembali seluruh minggu (1-22)
  range.setValues([weeksData]);
  
  // Baca total (kolom Y)
  const totalStr = sheet.getRange(row, 3 + numWeeks).getValue();
  const total = parseFloat(totalStr) || 0;
  
  const weeksOut = [];
  for (let w = 0; w < numWeeks; w++) {
    weeksOut.push(weeksData[w] === true || weeksData[w] === 'TRUE');
  }
  
  return {
    weeksChecked: weeksChecked,
    row: {
      no: no,
      weeks: weeksOut,
      total: total
    }
  };
}
