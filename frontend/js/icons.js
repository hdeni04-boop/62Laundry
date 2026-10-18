function ic(name, cls) {
  var markup = LUCIDE_ICONS[name];
  if (!markup) throw new Error('Lucide icon tidak ditemukan: ' + name);
  return '<svg class="ic ' + (cls || '') + ' lucide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + markup + '</svg>';
}
function statusLabel(s){return {'DITERIMA':'Diterima','DICUCI':'Dicuci','DIKERINGKAN':'Dikeringkan','DISETRIKA':'Disetrika','SIAP_DIAMBIL':'Siap Diambil','SELESAI':'Selesai','DIBATALKAN':'Dibatalkan'}[s]||s;}
function pill(s){return '<span class="badge b-'+s+'">'+statusLabel(s)+'</span>';}
