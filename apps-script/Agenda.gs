// Agenda.gs

/**
 * Membaca jadwal agenda dari sheet "Agenda" di spreadsheet Nilai
 * Mengembalikan agenda yang cocok dengan bulan yang diminta.
 */
function getAgendaMonth(payload) {
  const year = payload.year;
  const month = payload.month;
  
  if (!year || !month) {
    throw new Error('INVALID_INPUT: year atau month kosong');
  }

  const ss = getNilaiSs();
  const sheet = ss.getSheetByName('Agenda');
  
  // Jika sheet belum dibuat, kembalikan array kosong (tidak error)
  if (!sheet) {
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const tanggalStr = String(data[i][0] || '').trim();
    if (tanggalStr.startsWith(prefix)) {
      result.push({
        tanggal: tanggalStr,
        mapel: String(data[i][1] || '').trim(),
        keterangan: String(data[i][2] || '').trim()
      });
    }
  }
  
  return result;
}

/**
 * Mencatat agenda otomatis ke sheet Agenda (jika belum ada)
 * Tanggal yang dicatat selalu tanggal saat fungsi ini dijalankan.
 */
function recordAgendaIfNotExists(mapel, keterangan) {
  const ss = getNilaiSs();
  let sheet = ss.getSheetByName('Agenda');
  
  if (!sheet) {
    sheet = ss.insertSheet('Agenda');
    sheet.appendRow(['Tanggal', 'Mapel', 'Keterangan']);
    // format header
    sheet.getRange('A1:C1').setFontWeight('bold').setBackground('#ffff00');
  }
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowMapel = String(data[i][1] || '').trim();
    const rowKet = String(data[i][2] || '').trim();
    
    // Jika penilaian yang sama sudah pernah diinput (meski di hari sebelumnya), abaikan.
    if (rowMapel === mapel && rowKet === keterangan) {
      return;
    }
  }
  
  // Belum ada, tambahkan dengan tanggal hari ini
  const todayStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
  sheet.appendRow([todayStr, mapel, keterangan]);
}
