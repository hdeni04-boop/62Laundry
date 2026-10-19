/* Client API ke backend (Apps Script Web App / mock-server lokal).
 * - Mode demo (?demo=1): login demo offline tanpa backend, untuk pratinjau UI di hosting statis.
 * - Jika fetch gagal di tingkat jaringan -> pesan koneksi yang jelas + cara memperbaiki.
 * - Jika server merespons non-2xx / {ok:false} -> teruskan pesan error dari server. */
var Api={
  _readCache:Object.create(null),
  _inflight:Object.create(null),
  _cacheVersion:0,
  _cacheTtl:8000,
  _loadingCount:0,
  _loadingTimer:null,
  _loadingHideTimer:null,
  _loadingVisibleAt:0,
  _loadingDelay:120,
  _loadingMinDuration:400,
  _readActions:['dashboard','listOrders','getOrderDetail','getCustomers','getServices','listStock','stockLog','getUsers','dailyOmzet','listExpenses','monthlyReport'],
  loadingStart:function(){
    Api._loadingCount++;
    clearTimeout(Api._loadingHideTimer);
    if(Api._loadingCount!==1)return;
    if(document.getElementById('dataLoader')&&document.getElementById('dataLoader').classList.contains('is-visible'))return;
    Api._loadingTimer=setTimeout(function(){
      var el=document.getElementById('dataLoader');
      if(!el||Api._loadingCount===0)return;
      el.classList.add('is-visible');
      el.setAttribute('aria-hidden','false');
      Api._loadingVisibleAt=Date.now();
    },Api._loadingDelay);
  },
  loadingEnd:function(){
    Api._loadingCount=Math.max(0,Api._loadingCount-1);
    if(Api._loadingCount)return;
    clearTimeout(Api._loadingTimer);
    Api._loadingTimer=null;
    var el=document.getElementById('dataLoader');
    if(!el||!el.classList.contains('is-visible'))return;
    var wait=Math.max(0,Api._loadingMinDuration-(Date.now()-Api._loadingVisibleAt));
    Api._loadingHideTimer=setTimeout(function(){
      if(Api._loadingCount)return;
      el.classList.remove('is-visible');
      el.setAttribute('aria-hidden','true');
      Api._loadingHideTimer=null;
    },wait);
  },
  demo:function(){try{return new URLSearchParams(location.search).get('demo')==='1';}catch(e){return false;}},
  clearCache:function(){
    Api._cacheVersion++;
    Api._readCache=Object.create(null);
    Api._inflight=Object.create(null);
  },
  copy:function(value){return value==null?value:JSON.parse(JSON.stringify(value));},
  demoLogin:function(pin){
    pin=String(pin||'').trim();
    var users={'1111':{user_id:'USR-02',nama:'Kasir 1 (Demo)',role:'kasir'},'123123@':{user_id:'USR-01',nama:'Owner (Demo)',role:'owner'}};
    var u=users[pin];
    if(!u)throw new Error('PIN salah');
    return{token:'DEMO',user:u};
  },
  netErr:function(e){return (e instanceof TypeError)||/failed to fetch|networkerror|load failed|network request failed/i.test(String((e&&e.message)||''));},
  call:function(action,payload,noAuth,options){
    if(Api.demo()&&action==='login'){
      return Promise.resolve().then(function(){
        var r=Api.demoLogin((payload||{}).pin);
        try{localStorage.setItem('laundry_token',r.token);}catch(e){}CONFIG.TOKEN=r.token;Api.clearCache();
        return r;
      });
    }
    payload=payload||{};
    var cacheable=!noAuth&&Api._readActions.indexOf(action)!==-1;
    if(action==='login'||!cacheable)Api.clearCache();
    var token=noAuth?'':(CONFIG.TOKEN||'');
    var url=CONFIG.WEB_APP_URL;
    var key=cacheable?url+'|'+token+'|'+action+'|'+JSON.stringify(payload):'';
    var now=Date.now(),cached=key&&Api._readCache[key];
    if(cached&&cached.expires>now)return Promise.resolve(Api.copy(cached.data));
    if(cached)delete Api._readCache[key];
    if(key&&Api._inflight[key])return Api._inflight[key].then(Api.copy);
    var version=Api._cacheVersion;
    var showLoading=!(options&&options.silent);
    if(showLoading)Api.loadingStart();
    var request=fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:action,token:token,payload:payload})})
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
        if(action==='login'){try{localStorage.setItem('laundry_token',j.data.token);}catch(e){}CONFIG.TOKEN=j.data.token;Api.clearCache();}
        if(key&&version===Api._cacheVersion){
          var keys=Object.keys(Api._readCache);
          if(keys.length>=50)delete Api._readCache[keys[0]];
          Api._readCache[key]={data:Api.copy(j.data),expires:Date.now()+Api._cacheTtl};
        }
        return j.data;
      });
    if(showLoading)request.then(Api.loadingEnd,Api.loadingEnd);
    if(key){
      Api._inflight[key]=request;
      request.then(function(){if(Api._inflight[key]===request)delete Api._inflight[key];},function(){if(Api._inflight[key]===request)delete Api._inflight[key];});
      return request.then(Api.copy);
    }
    if(action!=='login')return request.then(function(data){Api.clearCache();return data;},function(e){Api.clearCache();throw e;});
    return request;
  },
  get:function(q){
    Api.loadingStart();
    var request=fetch(CONFIG.WEB_APP_URL+q)
      .catch(function(e){
        if(Api.netErr(e))throw new Error('Backend belum tersambung. Isi URL Web App /exec yang valid di js/config.js (lihat docs/DEPLOY.md langkah 2).');
        throw e;
      })
      .then(function(r){return r.json();})
      .then(function(j){if(!j.ok)throw new Error(j.error);return j.data;});
    request.then(Api.loadingEnd,Api.loadingEnd);
    return request;
  }
};
