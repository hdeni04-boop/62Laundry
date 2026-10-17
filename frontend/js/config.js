/* Konfigurasi backend + token.
 * Prioritas penentuan WEB_APP_URL:
 * 1) Parameter URL ?webapp=https://... (otomatis disimpan ke localStorage)
 * 2) localStorage 'laundry_webapp' (diatur via panel Setup di layar login / menu Setting)
 * 3) Default: localhost -> location.origin + '/exec' | selain itu -> URL Web App Apps Script produksi.
 * Jika URL masih berisi PASTE_ID_DISINI berarti backend BELUM dikonfigurasi (lihat docs/DEPLOY.md langkah 2-3). */
var CONFIG=(function(){
  var PLACEHOLDER='PASTE_ID_DISINI';
  var PROD_URL='https://script.google.com/macros/s/PASTE_ID_DISINI/exec';
  var qs=function(k){try{return new URLSearchParams(location.search).get(k);}catch(e){return null;}};
  var isLocal=(location.hostname==='localhost'||location.hostname==='127.0.0.1');
  var defWebApp=isLocal?location.origin+'/exec':PROD_URL;
  try{
    var qp=qs('webapp');
    if(qp){qp=decodeURIComponent(qp);if(/^https?:\/\//i.test(qp)){try{localStorage.setItem('laundry_webapp',qp);}catch(e){}}}
  }catch(e){}
  var saved='';try{saved=localStorage.getItem('laundry_webapp')||'';}catch(e){}
  var webapp=saved||defWebApp;
  var tok='GANTI_TOKEN_RAHASIA';try{tok=localStorage.getItem('laundry_token')||tok;}catch(e){}
  return{
    WEB_APP_URL:webapp,
    TOKEN:tok,
    PLACEHOLDER:PLACEHOLDER,
    DEFAULT_URL:defWebApp,
    isLocal:isLocal,
    isPlaceholder:function(){return String(this.WEB_APP_URL||'').indexOf(this.PLACEHOLDER)>-1;},
    setWebApp:function(url){url=String(url||'').trim();if(!/^https?:\/\//i.test(url))throw new Error('URL tidak valid. Harus diawali http:// atau https://');try{localStorage.setItem('laundry_webapp',url);}catch(e){}this.WEB_APP_URL=url;return url;},
    resetWebApp:function(){try{localStorage.removeItem('laundry_webapp');}catch(e){}this.WEB_APP_URL=this.DEFAULT_URL;return this.WEB_APP_URL;}
  };
})();
