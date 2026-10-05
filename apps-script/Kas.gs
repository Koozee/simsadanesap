// Kas.gs

function getKasData(year) {
  const ss = getKasSs();
  const sheetName = 'Tahun ' + year;
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return {
      sheetExists: false,
      rows: []
    };
  }
  
  const startRow = CONFIG.OFFSET_BARIS_KAS + 1; // 6
  const numRows = 32;
  const numWeeks = CONFIG.JUMLAH_MINGGU_KAS;
  
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
    sheetExists: true,
    rows: rows
  };
}

function getKasSummary(year) {
  const ss = getKasSs();
  let pemasukan = 0;
  let pengeluaran = 0;
  
  const sheetName = 'Tahun ' + year;
  const sheet = ss.getSheetByName(sheetName);
  
  if (sheet) {
    pemasukan = parseFloat(sheet.getRange('C38').getValue()) || 0;
    pengeluaran = parseFloat(sheet.getRange('C39').getValue()) || 0;
  }
  
  return {
    pemasukan: pemasukan,
    pengeluaran: pengeluaran,
    saldo: pemasukan - pengeluaran
  };
}

function setKasWeek(params) {
  const year = params.year;
  const no = params.no;
  const week = params.week; 
  const paid = params.paid;
  
  const ss = getKasSs();
  const sheetName = 'Tahun ' + year;
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
  const numWeeks = CONFIG.JUMLAH_MINGGU_KAS;
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
  const year = params.year;
  const no = params.no;
  const count = params.count || 1;
  
  const ss = getKasSs();
  const sheetName = 'Tahun ' + year;
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw { code: 'SHEET_NOT_FOUND', message: 'Sheet semester tidak ada: ' + sheetName };
  }
  
  const row = CONFIG.OFFSET_BARIS_KAS + no;
  const numWeeks = CONFIG.JUMLAH_MINGGU_KAS;
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

function listKasExpenses() {
  const ss = getKasSs();
  const sheet = ss.getSheetByName('Catatan Pengeluaran');
  if (!sheet) return [];
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  const expenses = [];
  
  for (let i = 0; i < data.length; i++) {
    const rowNum = i + 2;
    const no = parseInt(data[i][0], 10);
    const dateVal = data[i][1];
    const amount = parseFloat(data[i][2]);
    const ket = data[i][3];
    
    // Validasi baris
    if (!isNaN(no) && no > 0 && !isNaN(amount) && amount > 0) {
      let dateStr = "";
      if (dateVal instanceof Date) {
        const y = dateVal.getFullYear();
        const m = ("0" + (dateVal.getMonth() + 1)).slice(-2);
        const d = ("0" + dateVal.getDate()).slice(-2);
        dateStr = y + "-" + m + "-" + d;
      } else {
        dateStr = String(dateVal).trim();
      }
      
      // Jika String dateStr mengandung sesuatu yang aneh, amankan:
      // Kadang formula IF(..., TODAY(), "") return teks kosong
      if (dateStr) {
        expenses.push({
          id: rowNum,
          tanggal: dateStr,
          jumlah: amount,
          keterangan: String(ket)
        });
      }
    }
  }
  return expenses;
}

function addKasExpense(params) {
  const ss = getKasSs();
  const sheet = ss.getSheetByName('Catatan Pengeluaran');
  
  const tanggal = params.tanggal;
  const jumlah = parseFloat(params.jumlah);
  const keterangan = params.keterangan;
  
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, Math.max(1, lastRow - 1), 4).getValues();
  
  let targetRow = -1;
  let totalRow = -1;
  
  // Mencari baris kosong (kolom C) atau baris total (kolom A bukan angka/C adalah rumus SUM)
  for (let i = 0; i < data.length; i++) {
    const r = i + 2;
    // Cek rumus dari Apps Script agak mahal jika dipanggil per cell,
    // Kita cek apakah cell C r itu mengandung rumus
    const formula = sheet.getRange(r, 3).getFormula();
    if (formula && formula.toUpperCase().indexOf('SUM') !== -1) {
      totalRow = r;
      break;
    }
    if (String(data[i][2]).trim() === "") {
      targetRow = r;
      break;
    }
  }
  
  if (totalRow !== -1 && targetRow === -1) {
    sheet.insertRowBefore(totalRow);
    targetRow = totalRow; 
    totalRow = totalRow + 1;
    sheet.getRange(targetRow - 1, 1).copyTo(sheet.getRange(targetRow, 1)); // copy nomor A
    sheet.getRange(totalRow, 3).setFormula("=SUM(C2:C" + (totalRow - 1) + ")");
  } else if (targetRow === -1) {
    targetRow = lastRow + 1;
  }
  
  sheet.getRange(targetRow, 1).setFormula("=ROW()-1");
  sheet.getRange(targetRow, 2).setValue(tanggal);
  sheet.getRange(targetRow, 3).setValue(jumlah);
  sheet.getRange(targetRow, 4).setValue(keterangan);
  
  return {
    id: targetRow,
    tanggal: tanggal,
    jumlah: jumlah,
    keterangan: keterangan
  };
}

function updateKasExpense(params) {
  const ss = getKasSs();
  const sheet = ss.getSheetByName('Catatan Pengeluaran');
  
  const id = params.id;
  sheet.getRange(id, 2).setValue(params.tanggal);
  sheet.getRange(id, 3).setValue(parseFloat(params.jumlah));
  sheet.getRange(id, 4).setValue(params.keterangan);
  
  return params;
}

function deleteKasExpense(params) {
  const ss = getKasSs();
  const sheet = ss.getSheetByName('Catatan Pengeluaran');
  const id = params.id;
  // Hapus sel B, C, D
  sheet.getRange(id, 2, 1, 3).clearContent();
  return { id: id };
}

function createKasYear(params) {
  const year = params.year;
  const ss = getKasSs();
  
  const newSheetName = 'Tahun ' + year;
  const prevSheetName = 'Tahun ' + (year - 1);
  
  let newSheet = ss.getSheetByName(newSheetName);
  if (newSheet) throw { code: 'SHEET_EXISTS', message: 'Sheet ' + newSheetName + ' sudah ada' };
  
  const prevSheet = ss.getSheetByName(prevSheetName);
  if (!prevSheet) throw { code: 'SHEET_NOT_FOUND', message: 'Sheet ' + prevSheetName + ' tidak ditemukan untuk disalin' };
  
  newSheet = prevSheet.copyTo(ss);
  newSheet.setName(newSheetName);
  
  const numRows = 32;
  const numWeeks = CONFIG.JUMLAH_MINGGU_KAS;
  const startRow = CONFIG.OFFSET_BARIS_KAS + 1;
  
  const falseValues = [];
  for (let r = 0; r < numRows; r++) {
    const row = [];
    for (let c = 0; c < numWeeks; c++) {
      row.push(false);
    }
    falseValues.push(row);
  }
  newSheet.getRange(startRow, 3, numRows, numWeeks).setValues(falseValues);
  
  // Kosongkan nama & NISN (opsional) atau biarkan ada. Kita biarkan karena murid biasanya tetap.
  // Tapi idealnya reset rumus total kalau perlu. Rumus sudah ikut tercopy.
  
  return { sheetName: newSheetName };
}
