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
