/* Client API ke backend (Apps Script Web App / mock-server lokal).
 * - Jika WEB_APP_URL masih placeholder -> tolak langsung dengan pesan konfigurasi (bukan "Failed to fetch").
 * - Jika fetch gagal di tingkat jaringan -> pesan koneksi yang jelas (URL ditampilkan agar mudah dicek).
 * - Jika server merespons non-2xx / {ok:false} -> teruskan pesan error dari server. */
var Api={
  netErr:function(e){return (e instanceof TypeError)||/failed to fetch|networkerror|load failed|network request failed/i.test(String((e&&e.message)||''));},
  guard:function(){
    if(CONFIG.isPlaceholder&&CONFIG.isPlaceholder()){
      throw new Error('Backend belum dikonfigurasi. Klik \u2699 Atur Backend di layar login, lalu isi URL Web App Apps Script (/exec). Lihat docs/DEPLOY.md langkah 2-3.');
    }
  },
  call:function(action,payload,noAuth){
    try{Api.guard();}catch(e){return Promise.reject(e);}
    var token=noAuth?'':(CONFIG.TOKEN||'');
    var url=CONFIG.WEB_APP_URL;
    return fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:action,token:token,payload:payload||{}})})
      .catch(function(e){
        if(Api.netErr(e))throw new Error('Tidak dapat terhubung ke server ('+url+'). Periksa koneksi internet / URL Web App, atau jalankan "npm start" bila memakai mock lokal.');
        throw e;
      })
      .then(function(r){
        if(!r.ok)throw new Error('Server merespons '+r.status+'. Periksa URL Web App sudah benar dan sudah di-Deploy sebagai Web App.');
        return r.json();
      })
      .then(function(j){
        if(!j.ok)throw new Error(j.error||'API error');
        if(action==='login'){try{localStorage.setItem('laundry_token',j.data.token);}catch(e){}CONFIG.TOKEN=j.data.token;}
        return j.data;
      });
  },
  get:function(q){
    try{Api.guard();}catch(e){return Promise.reject(e);}
    return fetch(CONFIG.WEB_APP_URL+q)
      .catch(function(e){
        if(Api.netErr(e))throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet / URL Web App.');
        throw e;
      })
      .then(function(r){return r.json();})
      .then(function(j){if(!j.ok)throw new Error(j.error);return j.data;});
  }
};
