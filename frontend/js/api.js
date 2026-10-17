/* Client API ke backend (Apps Script Web App / mock-server lokal).
 * - Mode demo (?demo=1): login demo offline tanpa backend, untuk pratinjau UI di hosting statis.
 * - Jika fetch gagal di tingkat jaringan -> pesan koneksi yang jelas + cara memperbaiki.
 * - Jika server merespons non-2xx / {ok:false} -> teruskan pesan error dari server. */
var Api={
  demo:function(){try{return new URLSearchParams(location.search).get('demo')==='1';}catch(e){return false;}},
  demoLogin:function(pin){
    pin=String(pin||'').trim();
    var users={'1111':{user_id:'USR-02',nama:'Kasir 1 (Demo)',role:'kasir'},'123123@':{user_id:'USR-01',nama:'Owner (Demo)',role:'owner'}};
    var u=users[pin];
    if(!u)throw new Error('PIN salah');
    return{token:'DEMO',user:u};
  },
  netErr:function(e){return (e instanceof TypeError)||/failed to fetch|networkerror|load failed|network request failed/i.test(String((e&&e.message)||''));},
  call:function(action,payload,noAuth){
    if(Api.demo()&&action==='login'){
      return Promise.resolve().then(function(){
        var r=Api.demoLogin((payload||{}).pin);
        try{localStorage.setItem('laundry_token',r.token);}catch(e){}CONFIG.TOKEN=r.token;
        return r;
      });
    }
    var token=noAuth?'':(CONFIG.TOKEN||'');
    var url=CONFIG.WEB_APP_URL;
    return fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:action,token:token,payload:payload||{}})})
      .catch(function(e){
        if(Api.netErr(e))throw new Error('Backend belum tersambung. '+(Api.demo()?'':'Buka dengan ?demo=1 untuk mode demo, atau ')+'isi URL Web App /exec yang valid di js/config.js (lihat docs/DEPLOY.md langkah 2).');
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
    return fetch(CONFIG.WEB_APP_URL+q)
      .catch(function(e){
        if(Api.netErr(e))throw new Error('Backend belum tersambung. Isi URL Web App /exec yang valid di js/config.js (lihat docs/DEPLOY.md langkah 2).');
        throw e;
      })
      .then(function(r){return r.json();})
      .then(function(j){if(!j.ok)throw new Error(j.error);return j.data;});
  }
};
