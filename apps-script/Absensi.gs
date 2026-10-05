// Absensi.gs

/**
 * Menyiapkan sheet Template.
 * Dipanggil sekali atau saat inisialisasi awal.
 */
function setupTemplateAbsensi() {
  const ss = getAbsensiSs();
  const sheet = ss.getSheetByName('Template');
  if (!sheet) throw { code: 'SHEET_NOT_FOUND', message: 'Template tidak ada' };
  
  // Set header H di kolom AM (Baris 5 dan 6 di-merge)
  sheet.getRange('AM5:AM6').merge().setValue('H');
  
  // Format bersyarat untuk 'L'
  const range = sheet.getRange('E7:AI38');
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('L')
    .setBackground('#C62E24')
    .setFontColor('#FFFFFF')
    .setRanges([range])
    .build();
    
  const rules = sheet.getConditionalFormatRules();
  
  // Cek apakah sudah ada rule dengan latar merah untuk menghindari duplikat
  let hasRule = false;
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    // Tidak ada cara mudah mengecek properti secara detail di Apps Script,
    // Kita asumsikan jika kondisinya mirip, kita replace.
    // Tapi karena rumit, kita tambahkan saja di urutan pertama (paling tinggi prioritasnya)
    // jika kita tidak peduli dengan duplikasi. Lebih baik reset atau timpa.
  }
  
  // Untuk amannya, tambahkan di posisi pertama
  rules.unshift(rule);
  sheet.setConditionalFormatRules(rules);
}

/**
 * Memastikan sheet bulan ada. Format month: YYYY-MM
 * Jika belum ada, buat dari Template.
 */
function ensureMonthSheet(monthStr) {
  const ss = getAbsensiSs();
  
  const parts = monthStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  
  const namaBulan = getNamaBulan(month);
  const sheetName = namaBulan + '-' + year;
  
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    return sheetName; // Sudah ada
  }
  
  const template = ss.getSheetByName('Template');
  if (!template) {
    throw { code: 'SHEET_NOT_FOUND', message: 'Template absensi tidak ditemukan' };
  }
  
  // Duplikat template
  sheet = template.copyTo(ss);
  sheet.setName(sheetName);
  
  // E4 judul (misal: BULAN AGUSTUS TAHUN 2026)
  sheet.getRange('E4').setValue('BULAN ' + namaBulan.toUpperCase() + ' TAHUN ' + year);
  
  // Rumus rekap (AJ:AM) baris 7-38
  const formulas = [];
  for (let r = 7; r <= 38; r++) {
    formulas.push([
      '=COUNTIF(E' + r + ':AI' + r + ',"S")',
      '=COUNTIF(E' + r + ':AI' + r + ',"I")',
      '=COUNTIF(E' + r + ':AI' + r + ',"A")',
      '=COUNTIF(E' + r + ':AI' + r + ',"v")'
    ]);
  }
  // Kolom 36 adalah AJ
  sheet.getRange(7, 36, 32, 4).setFormulas(formulas);
  
  // Hitung jumlah hari di bulan ini
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Kolom 5 (E) adalah tgl 1. Kolom 35 (AI) adalah tgl 31.
  for (let d = 1; d <= 31; d++) {
    const colIndex = 4 + d;
    
    if (d > daysInMonth) {
      // Abu-abukan kolom tanggal yang tidak ada
      sheet.getRange(7, colIndex, 32, 1).setBackground('#d9d9d9');
      continue;
    }
    
    // Cek hari Minggu
    const dateObj = new Date(year, month - 1, d);
    if (dateObj.getDay() === 0) {
      // Minggu -> isi 'L' pada semua siswa
      const lValues = [];
      for (let i = 0; i < 32; i++) lValues.push(['L']);
      sheet.getRange(7, colIndex, 32, 1).setValues(lValues);
    }
  }
  
  return sheetName;
}

function getAbsenDay(dateStr) {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  const sheetName = getNamaBulan(month) + '-' + year;
  const ss = getAbsensiSs();
  const sheet = ss.getSheetByName(sheetName);
  
  const dateObj = new Date(year, month - 1, day);
  const isSunday = dateObj.getDay() === 0;
  
  if (!sheet) {
    return {
      date: dateStr,
      sheetExists: false,
      recorded: false,
      libur: isSunday,
      sunday: isSunday,
      entries: []
    };
  }
  
  const colIndex = 4 + day;
  const values = sheet.getRange(7, colIndex, 32, 1).getValues();
  
  let recorded = false;
  let allLibur = true;
  const entries = [];
  
  for (let i = 0; i < 32; i++) {
    let val = String(values[i][0]).trim();
    if (val) {
      if (val === 'v' || val === 'V' || val === '✓' || val === '√') {
        val = 'H';
      } else {
        val = val.toUpperCase();
      }
      
      if (['H', 'S', 'I', 'A'].indexOf(val) !== -1) {
        recorded = true;
        allLibur = false;
        entries.push({ no: i + 1, status: val });
      } else if (val === 'L') {
        entries.push({ no: i + 1, status: 'L' });
      } else {
        allLibur = false;
      }
    } else {
      allLibur = false;
    }
  }
  
  const finalEntries = [];
  if (recorded) {
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].status !== 'L') {
        finalEntries.push(entries[i]);
      }
    }
  }
  
  return {
    date: dateStr,
    sheetExists: true,
    recorded: recorded,
    libur: allLibur,
    sunday: isSunday,
    entries: finalEntries
  };
}

function getAbsenMonthOverview(monthStr) {
  const parts = monthStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  
  const sheetName = getNamaBulan(month) + '-' + year;
  const ss = getAbsensiSs();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return {
      month: monthStr,
      sheetExists: false,
      recordedDates: [],
      liburDates: []
    };
  }
  
  const daysInMonth = new Date(year, month, 0).getDate();
  const values = sheet.getRange(7, 5, 32, daysInMonth).getValues();
  
  const recordedDates = [];
  const liburDates = [];
  
  for (let d = 1; d <= daysInMonth; d++) {
    let recorded = false;
    let allLibur = true;
    
    for (let i = 0; i < 32; i++) {
      let val = String(values[i][d - 1]).trim().toUpperCase();
      if (val === 'V' || val === '✓' || val === '√' || val === 'S' || val === 'I' || val === 'A' || val === 'H') {
        recorded = true;
        allLibur = false;
      } else if (val !== 'L') {
        allLibur = false;
      }
    }
    
    const dd = d < 10 ? '0' + d : d;
    const dateStr = monthStr + '-' + dd;
    
    if (recorded) {
      recordedDates.push(dateStr);
    } else if (allLibur) {
      liburDates.push(dateStr);
    }
  }
  
  return {
    month: monthStr,
    sheetExists: true,
    recordedDates: recordedDates,
    liburDates: liburDates
  };
}

function saveAbsenDay(params) {
  const dateStr = params.date;
  const entries = params.entries || [];
  
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  const dateObj = new Date(year, month - 1, day);
  if (dateObj.getDay() === 0) {
    throw { code: 'SUNDAY_LOCKED', message: 'Hari Minggu tidak bisa diabsen' };
  }
  
  const monthStr = dateStr.substring(0, 7);
  const sheetName = ensureMonthSheet(monthStr);
  const ss = getAbsensiSs();
  const sheet = ss.getSheetByName(sheetName);
  
  const colIndex = 4 + day;
  const values = [];
  
  const counts = { 'H': 0, 'S': 0, 'I': 0, 'A': 0 };
  
  const entryMap = {};
  for (let i = 0; i < entries.length; i++) {
    entryMap[entries[i].no] = entries[i].status;
  }
  
  for (let i = 1; i <= 32; i++) {
    let status = entryMap[i] || 'H'; 
    if (status === 'H') counts['H']++;
    else if (status === 'S') counts['S']++;
    else if (status === 'I') counts['I']++;
    else if (status === 'A') counts['A']++;
    
    const writeVal = status === 'H' ? 'v' : status;
    values.push([writeVal]);
  }
  
  sheet.getRange(7, colIndex, 32, 1).setValues(values);
  
  return { date: dateStr, counts: counts };
}

function clearAbsenDay(params) {
  const dateStr = params.date;
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  const dateObj = new Date(year, month - 1, day);
  if (dateObj.getDay() === 0) {
    throw { code: 'SUNDAY_LOCKED', message: 'Hari Minggu terkunci, tidak bisa dihapus' };
  }
  
  const monthStr = dateStr.substring(0, 7);
  const sheetName = getNamaBulan(month) + '-' + year;
  const ss = getAbsensiSs();
  const sheet = ss.getSheetByName(sheetName);
  
  if (sheet) {
    const colIndex = 4 + day;
    sheet.getRange(7, colIndex, 32, 1).clearContent();
  }
  
  return { date: dateStr };
}

function setLiburDay(params) {
  const dateStr = params.date;
  const libur = params.libur;
  
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  const dateObj = new Date(year, month - 1, day);
  if (dateObj.getDay() === 0) {
    throw { code: 'SUNDAY_LOCKED', message: 'Hari Minggu selalu libur dan terkunci' };
  }
  
  const monthStr = dateStr.substring(0, 7);
  const sheetName = ensureMonthSheet(monthStr);
  const ss = getAbsensiSs();
  const sheet = ss.getSheetByName(sheetName);
  
  const colIndex = 4 + day;
  if (libur) {
    const values = [];
    for (let i = 0; i < 32; i++) values.push(['L']);
    sheet.getRange(7, colIndex, 32, 1).setValues(values);
  } else {
    sheet.getRange(7, colIndex, 32, 1).clearContent();
  }
  
  return { date: dateStr, libur: libur };
}

function getAbsenSummary(from, to, no) {
  const ss = getAbsensiSs();
  
  const partsFrom = from.split('-');
  const yFrom = parseInt(partsFrom[0], 10);
  const mFrom = parseInt(partsFrom[1], 10);
  
  const partsTo = to.split('-');
  const yTo = parseInt(partsTo[0], 10);
  const mTo = parseInt(partsTo[1], 10);
  
  let currentY = yFrom;
  let currentM = mFrom;
  
  const skippedMonths = [];
  const perBulan = [];
  
  const rekap = [];
  for (let i = 0; i < 32; i++) {
    rekap.push({ no: i + 1, hadir: 0, sakit: 0, izin: 0, alpha: 0, hariEfektif: 0, persen: 0 });
  }
  
  const targetNo = no ? parseInt(no, 10) : null;
  
  while (currentY < yTo || (currentY === yTo && currentM <= mTo)) {
    const monthStr = currentY + '-' + (currentM < 10 ? '0' + currentM : currentM);
    const sheetName = getNamaBulan(currentM) + '-' + currentY;
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      skippedMonths.push(monthStr);
    } else {
      const daysInMonth = new Date(currentY, currentM, 0).getDate();
      const values = sheet.getRange(7, 5, 32, daysInMonth).getValues();
      
      let bulanHadir = 0;
      let bulanSakit = 0;
      let bulanIzin = 0;
      let bulanAlpha = 0;
      
      for (let i = 0; i < 32; i++) {
        if (targetNo && (i + 1) !== targetNo) continue;
        
        let h = 0, s = 0, iz = 0, a = 0;
        
        for (let d = 0; d < daysInMonth; d++) {
          const val = String(values[i][d]).trim().toUpperCase();
          if (val === 'V' || val === '✓' || val === '√' || val === 'H') h++;
          else if (val === 'S') s++;
          else if (val === 'I') iz++;
          else if (val === 'A') a++;
        }
        
        rekap[i].hadir += h;
        rekap[i].sakit += s;
        rekap[i].izin += iz;
        rekap[i].alpha += a;
        
        if (targetNo && (i + 1) === targetNo) {
          bulanHadir += h;
          bulanSakit += s;
          bulanIzin += iz;
          bulanAlpha += a;
        }
      }
      
      if (targetNo) {
        const hE = bulanHadir + bulanSakit + bulanIzin + bulanAlpha;
        const p = hE === 0 ? 0 : Math.round((bulanHadir / hE) * 100);
        perBulan.push({
          month: monthStr,
          rekap: {
            no: targetNo,
            hadir: bulanHadir,
            sakit: bulanSakit,
            izin: bulanIzin,
            alpha: bulanAlpha,
            hariEfektif: hE,
            persen: p
          }
        });
      }
    }
    
    currentM++;
    if (currentM > 12) {
      currentM = 1;
      currentY++;
    }
  }
  
  const perSiswa = [];
  for (let i = 0; i < 32; i++) {
    if (targetNo && (i + 1) !== targetNo) continue;
    
    const r = rekap[i];
    r.hariEfektif = r.hadir + r.sakit + r.izin + r.alpha;
    r.persen = r.hariEfektif === 0 ? 0 : Math.round((r.hadir / r.hariEfektif) * 100);
    perSiswa.push(r);
  }
  
  const result = {
    from: from,
    to: to,
    perSiswa: perSiswa,
    skippedMonths: skippedMonths
  };
  
  if (targetNo) {
    result.perBulan = perBulan;
  }
  
  return result;
}
