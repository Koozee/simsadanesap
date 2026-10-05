// Validate.gs

/**
 * Memeriksa integritas ketiga spreadsheet:
 * 1. Bisa dibuka
 * 2. Sheet wajib (Template, Mapel, Kas, Catatan) ada
 * 3. Urutan nama siswa di semua file (Nilai, Kas) sesuai dengan master di Absensi!Template
 */
function validateSpreadsheets() {
  const issues = [];
  
  let absensiSs, nilaiSs, kasSs;
  
  try { 
    absensiSs = getAbsensiSs(); 
  } catch (e) { 
    issues.push({ code: 'SHEET_NOT_FOUND', where: 'ABSENSI', message: 'Gagal membuka spreadsheet Absensi. Cek ABSENSI_SS_ID.' }); 
  }
  
  try { 
    nilaiSs = getNilaiSs(); 
  } catch (e) { 
    issues.push({ code: 'SHEET_NOT_FOUND', where: 'NILAI', message: 'Gagal membuka spreadsheet Nilai. Cek NILAI_SS_ID.' }); 
  }
  
  try { 
    kasSs = getKasSs(); 
  } catch (e) { 
    issues.push({ code: 'SHEET_NOT_FOUND', where: 'KAS', message: 'Gagal membuka spreadsheet Kas. Cek KAS_SS_ID.' }); 
  }
  
  if (!absensiSs) {
    return { ok: false, issues: issues };
  }
  
  const templateSheet = absensiSs.getSheetByName('Template');
  if (!templateSheet) {
    issues.push({ code: 'SHEET_NOT_FOUND', where: 'Absensi!Template', message: 'Sheet Template tidak ada' });
    return { ok: false, issues: issues };
  }
  
  let masterNames = [];
  try {
    masterNames = getStudentsList().map(function(s) { return s.nama; });
  } catch (e) {
    issues.push({ code: 'STRUCTURE_MISMATCH', where: 'Absensi!Template', message: 'Gagal membaca master siswa' });
    return { ok: false, issues: issues };
  }

  if (nilaiSs) {
    CONFIG.MAPEL.forEach(function(mapel) {
      const sheet = nilaiSs.getSheetByName(mapel);
      if (!sheet) {
        issues.push({ code: 'SHEET_NOT_FOUND', where: 'Nilai!' + mapel, message: 'Sheet mata pelajaran tidak ditemukan' });
        return;
      }
      
      const names = sheet.getRange(7, 3, 32, 1).getValues(); // C7:C38
      for (let i = 0; i < 32; i++) {
        if (i < masterNames.length && masterNames[i]) {
          const sheetName = String(names[i][0]).trim();
          if (sheetName && sheetName !== masterNames[i]) {
            issues.push({ 
              code: 'STRUCTURE_MISMATCH', 
              where: 'Nilai!' + mapel + '!C' + (i + 7), 
              message: 'Nama siswa berbeda. Master: ' + masterNames[i] + ', Sheet: ' + sheetName 
            });
          }
        }
      }
    });
  }

  if (kasSs) {
    const catatanSheet = kasSs.getSheetByName('Catatan Pengeluaran');
    if (!catatanSheet) {
      issues.push({ code: 'SHEET_NOT_FOUND', where: 'Kas!Catatan Pengeluaran', message: 'Sheet Catatan Pengeluaran tidak ada' });
    }
    
    for (let sem in CONFIG.KAS_SEMESTER_SHEET) {
      const sheetName = CONFIG.KAS_SEMESTER_SHEET[sem];
      const sheet = kasSs.getSheetByName(sheetName);
      if (sheet) {
        const names = sheet.getRange(6, 2, 32, 1).getValues(); // B6:B37
        for (let i = 0; i < 32; i++) {
          if (i < masterNames.length && masterNames[i]) {
            const sn = String(names[i][0]).trim();
            if (sn && sn !== masterNames[i]) {
              issues.push({ 
                code: 'STRUCTURE_MISMATCH', 
                where: 'Kas!' + sheetName + '!B' + (i + 6), 
                message: 'Nama siswa berbeda. Master: ' + masterNames[i] + ', Sheet: ' + sn 
              });
            }
          }
        }
      }
    }
  }

  return {
    ok: issues.length === 0,
    issues: issues
  };
}
