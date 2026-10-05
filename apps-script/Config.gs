// Config.gs

const CONFIG = {
  LOCK_TIMEOUT_MS: 30000,
  
  KAS_PER_MINGGU: 2000,
  MINGGU_PER_SEMESTER: 22,
  
  JUMLAH_BAB: 5,
  SLOT_PER_BAB: 4,
  
  OFFSET_BARIS_ABSENSI: 6,
  OFFSET_BARIS_NILAI: 6,
  OFFSET_BARIS_KAS: 5,
  
  KAS_SEMESTER_SHEET: {
    'ganjil': 'Tahun 2026',
    'genap': 'Semester Genap 2026-2027'
  },
  
  MAPEL: [
    'Bahasa Indonesia',
    'Seni Rupa',
    'Bahasa Jawa',
    'Bahasa Inggris',
    'IPAS',
    'Matematika',
    'Pendidikan Pancasila'
  ]
};

function getSsId(type) {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty(type + '_SS_ID');
  if (!id) {
    throw { code: 'UNKNOWN', message: 'Property ' + type + '_SS_ID belum diset' };
  }
  return id;
}

function getAbsensiSs() { return SpreadsheetApp.openById(getSsId('ABSENSI')); }
function getNilaiSs() { return SpreadsheetApp.openById(getSsId('NILAI')); }
function getKasSs() { return SpreadsheetApp.openById(getSsId('KAS')); }
