// Students.gs

/**
 * Mengambil 32 siswa dari sheet Template
 */
function getStudentsList() {
  const ss = getAbsensiSs();
  const sheet = ss.getSheetByName('Template');
  if (!sheet) {
    throw { code: 'SHEET_NOT_FOUND', message: 'Sheet Template pada spreadsheet absensi tidak ditemukan' };
  }

  const range = sheet.getRange(7, 1, 32, 4);
  const values = range.getValues();
  
  const students = [];
  
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const noStr = String(row[0]).trim();
    if (!noStr) continue;
    
    const no = Number(noStr);
    const nipdVal = String(row[1]).trim();
    const nama = String(row[2]).trim();
    const jk = String(row[3]).trim();
    
    if (no > 0 && no <= 32) {
      students.push({
        no: no,
        nipd: nipdVal ? nipdVal : null,
        nama: nama,
        jk: (jk === 'L' || jk === 'P') ? jk : 'L' // Default L jika kosong/salah untuk mencegah type error di FE
      });
    }
  }
  
  students.sort(function(a, b) { return a.no - b.no; });
  
  return students;
}
