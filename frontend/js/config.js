/* Konfigurasi backend + token.
 * WEB_APP_URL dapat dioverride sekali via ?webapp=https://... (tersimpan di localStorage 'laundry_webapp').
 * Default: localhost -> location.origin + '/exec' | selain itu -> URL Web App Apps Script produksi. */
var CONFIG=(function(){
  var isLocal=(location.hostname==='localhost'||location.hostname==='127.0.0.1');
  var PROD_URL='https://script.google.com/macros/s/PASTE_ID_DISINI/exec';
  try{
    var qp=null;
    try{qp=new URLSearchParams(location.search).get('webapp');}catch(e){}
    if(qp){qp=decodeURIComponent(qp);if(/^https?:\/\//i.test(qp)){try{localStorage.setItem('laundry_webapp',qp);}catch(e){}}}
  }catch(e){}
  var saved='';try{saved=localStorage.getItem('laundry_webapp')||'';}catch(e){}
  var tok='GANTI_TOKEN_RAHASIA';try{tok=localStorage.getItem('laundry_token')||tok;}catch(e){}
  return{
    WEB_APP_URL:saved||(isLocal?location.origin+'/exec':PROD_URL),
    TOKEN:tok
  };
})();
