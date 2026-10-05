// Nilai.gs

function parseNilaiVal(v) {
  if (v === "" || v === null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function getNilaiSubjects() {
  return CONFIG.MAPEL;
}

function getNilaiSheetData(mapel) {
  if (CONFIG.MAPEL.indexOf(mapel) === -1) {
    throw { code: 'INVALID_INPUT', message: 'Mapel tidak valid: ' + mapel };
  }
  
  const ss = getNilaiSs();
  const sheet = ss.getSheetByName(mapel);
  if (!sheet) {
    throw { code: 'SHEET_NOT_FOUND', message: 'Sheet mapel tidak ditemukan: ' + mapel };
  }
  
  const startRow = CONFIG.OFFSET_BARIS_NILAI + 1; // 7
  const numRows = 32;
  const numCols = 28; // A to AB
  
  const values = sheet.getRange(startRow, 1, numRows, numCols).getValues();
  
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    const r = values[i];
    const no = i + 1;
    
    const daily = [];
    for (let c = 4; c < 24; c++) {
      daily.push(parseNilaiVal(r[c]));
    }
    
    rows.push({
      no: no,
      daily: daily,
      rataRata: parseNilaiVal(r[24]),
      pts: parseNilaiVal(r[25]),
      pas: parseNilaiVal(r[26]),
      nilaiAkhir: parseNilaiVal(r[27])
    });
  }
  
  return {
    mapel: mapel,
    rows: rows
  };
}

function addNilaiDaily(params) {
  const mapel = params.mapel;
  const bab = params.bab; // 1-5
  const slotRequested = params.slot; // 1-4 optional
  const scores = params.scores; // [{no, value}, ...]
  
  if (CONFIG.MAPEL.indexOf(mapel) === -1) throw { code: 'INVALID_INPUT', message: 'Mapel tidak valid' };
  if (bab < 1 || bab > 5) throw { code: 'INVALID_INPUT', message: 'Bab tidak valid' };
  
  const ss = getNilaiSs();
  const sheet = ss.getSheetByName(mapel);
  if (!sheet) throw { code: 'SHEET_NOT_FOUND', message: 'Sheet mapel tidak ditemukan' };
  
  const startRow = CONFIG.OFFSET_BARIS_NILAI + 1;
  const numRows = 32;
  
  // Base col for this bab: 5 + (bab-1)*4
  const baseCol = 5 + (bab - 1) * 4; // bab 1 -> 5 (E)
  let targetSlot = -1;
  
  if (slotRequested) {
    targetSlot = slotRequested;
  } else {
    // Find first empty column for this bab
    const babValues = sheet.getRange(startRow, baseCol, numRows, 4).getValues(); // 32x4
    for (let s = 0; s < 4; s++) {
      let isEmpty = true;
      for (let r = 0; r < numRows; r++) {
        if (babValues[r][s] !== "") {
          isEmpty = false;
          break;
        }
      }
      if (isEmpty) {
        targetSlot = s + 1;
        break;
      }
    }
  }
  
  if (targetSlot === -1) {
    throw { code: 'BAB_FULL', message: 'Semua 4 slot pada bab ini sudah terisi' };
  }
  
  const targetCol = baseCol + (targetSlot - 1);
  
  // Apply scores
  const colValues = sheet.getRange(startRow, targetCol, numRows, 1).getValues();
  for (let i = 0; i < scores.length; i++) {
    const s = scores[i];
    const rIdx = s.no - 1;
    colValues[rIdx][0] = s.value === null ? "" : s.value;
  }
  
  sheet.getRange(startRow, targetCol, numRows, 1).setValues(colValues);
  
  return {
    bab: bab,
    slotUsed: targetSlot
  };
}

function setNilaiExam(params) {
  const mapel = params.mapel;
  const type = params.type; // 'PTS' | 'PAS'
  const scores = params.scores;
  
  if (CONFIG.MAPEL.indexOf(mapel) === -1) throw { code: 'INVALID_INPUT', message: 'Mapel tidak valid' };
  
  const ss = getNilaiSs();
  const sheet = ss.getSheetByName(mapel);
  if (!sheet) throw { code: 'SHEET_NOT_FOUND', message: 'Sheet mapel tidak ditemukan' };
  
  const targetCol = type === 'PTS' ? 26 : (type === 'PAS' ? 27 : -1);
  if (targetCol === -1) throw { code: 'INVALID_INPUT', message: 'Tipe ujian tidak valid' };
  
  const startRow = CONFIG.OFFSET_BARIS_NILAI + 1;
  const numRows = 32;
  const colValues = sheet.getRange(startRow, targetCol, numRows, 1).getValues();
  
  for (let i = 0; i < scores.length; i++) {
    const s = scores[i];
    const rIdx = s.no - 1;
    colValues[rIdx][0] = s.value === null ? "" : s.value;
  }
  
  sheet.getRange(startRow, targetCol, numRows, 1).setValues(colValues);
  
  return {
    mapel: mapel,
    type: type
  };
}

function setNilaiCell(params) {
  const mapel = params.mapel;
  const no = params.no;
  const field = params.field; // 'daily' | 'pts' | 'pas'
  const bab = params.bab;
  const slot = params.slot;
  const value = params.value;
  
  if (CONFIG.MAPEL.indexOf(mapel) === -1) throw { code: 'INVALID_INPUT', message: 'Mapel tidak valid' };
  
  const ss = getNilaiSs();
  const sheet = ss.getSheetByName(mapel);
  if (!sheet) throw { code: 'SHEET_NOT_FOUND', message: 'Sheet mapel tidak ditemukan' };
  
  const row = CONFIG.OFFSET_BARIS_NILAI + no;
  let col = -1;
  
  if (field === 'daily') {
    if (!bab || !slot) throw { code: 'INVALID_INPUT', message: 'Bab dan slot wajib untuk daily' };
    col = 5 + (bab - 1) * 4 + (slot - 1);
  } else if (field === 'pts') {
    col = 26;
  } else if (field === 'pas') {
    col = 27;
  } else {
    throw { code: 'INVALID_INPUT', message: 'Field tidak valid' };
  }
  
  sheet.getRange(row, col).setValue(value === null ? "" : value);
  
  // Return the updated row data
  const updatedValues = sheet.getRange(row, 1, 1, 28).getValues()[0];
  const daily = [];
  for (let c = 4; c < 24; c++) {
    daily.push(parseNilaiVal(updatedValues[c]));
  }
  
  return {
    no: no,
    daily: daily,
    rataRata: parseNilaiVal(updatedValues[24]),
    pts: parseNilaiVal(updatedValues[25]),
    pas: parseNilaiVal(updatedValues[26]),
    nilaiAkhir: parseNilaiVal(updatedValues[27])
  };
}
