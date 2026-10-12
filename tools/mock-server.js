/** Mock backend lokal — kontrak sama dengan Code.gs (demo tanpa deploy). */
var http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
var ROOT=path.join(__dirname,'..','frontend'),PORT=process.env.PORT||8080,TOKEN='GANTI_TOKEN_RAHASIA';
var MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
var ALLOWED_NEXT={DITERIMA:['DICUCI','DIBATALKAN'],DICUCI:['DIKERINGKAN','DIBATALKAN'],DIKERINGKAN:['DISETRIKA','DIBATALKAN'],DISETRIKA:['SIAP_DIAMBIL','DIBATALKAN'],SIAP_DIAMBIL:['SELESAI','DIBATALKAN'],SELESAI:[],DIBATALKAN:[]};
var now=function(){return new Date().toISOString().slice(0,19).replace('T',' ');};
var dstr=function(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
var d8=function(){return dstr().replace(/-/g,'');};
var DB={users:[{user_id:'USR-01',nama:'Owner',pin:'123456',role:'owner',outlet_id:'OUT-01',aktif:'TRUE'},{user_id:'USR-02',nama:'Kasir 1',pin:'1111',role:'kasir',outlet_id:'OUT-01',aktif:'TRUE'}],
customers:[{customer_id:'CUS-0001',nama:'Budi Santoso',wa:'0812111222',alamat:'Jl. Mawar 1'},{customer_id:'CUS-0002',nama:'Siti Aminah',wa:'0812333444',alamat:'Jl. Melati 2'}],
services:[{service_id:'SRV-01',nama:'Cuci Kering Reguler',satuan:'kg',harga:7000,estimasi_hari:2,aktif:'TRUE'},{service_id:'SRV-02',nama:'Cuci + Setrika Reguler',satuan:'kg',harga:10000,estimasi_hari:3,aktif:'TRUE'},{service_id:'SRV-03',nama:'Express 1 Hari',satuan:'kg',harga:15000,estimasi_hari:1,aktif:'TRUE'},{service_id:'SRV-04',nama:'Satuan / Helm / Sepatu',satuan:'pcs',harga:25000,estimasi_hari:3,aktif:'TRUE'}],
orders:[],items:[],logs:[],pays:[],walogs:[]};
var normWA=function(w){w=String(w||'').replace(/\D/g,'');if(!w)return'';if(w[0]==='0')w='62'+w.slice(1);return w;};
var cust=function(id){return DB.customers.find(function(c){return c.customer_id===id;})||{};};
var svc=function(id){return DB.services.find(function(s){return s.service_id===id;});};
var ord=function(id){return DB.orders.find(function(o){return o.order_id===id;});};
var base=function(req){return 'http://'+req.headers.host;};
function actions(p,req){
  var pl=p.payload||{},a=p.action;
  switch(a){
    case 'login':{var u=DB.users.find(function(x){return x.pin===String(pl.pin)&&x.aktif==='TRUE';});if(!u)throw new Error('PIN salah');return{token:TOKEN,user:{user_id:u.user_id,nama:u.nama,role:u.role}};}
    case 'getServices':return DB.services.filter(function(s){return s.aktif==='TRUE';});
    case 'getCustomers':{var q=String(pl.q||'').toLowerCase();return DB.customers.slice(-100).reverse().filter(function(c){return !q||c.nama.toLowerCase().indexOf(q)>-1||String(c.wa).indexOf(q)>-1;});}
    case 'createCustomer':{var id='CUS-'+String(DB.customers.length+1).padStart(4,'0');DB.customers.push({customer_id:id,nama:pl.nama,wa:pl.wa||'',alamat:pl.alamat||''});return{customer_id:id};}
    case 'createOrder':{
      if(!pl.customer_id)throw new Error('customer_id?');if(!pl.items||!pl.items.length)throw new Error('items?');
      var total=0,est=0;
      pl.items.forEach(function(it){var s=svc(it.service_id);if(!s)throw new Error('Svc? '+it.service_id);var q=Number(it.qty)||0;if(q<=0)throw new Error('Qty>0');total+=s.harga*q;est=Math.max(est,s.estimasi_hari);});
      var n=DB.orders.filter(function(o){return o.order_id.indexOf('LND-'+d8())===0;}).length+1;
      var oid='LND-'+d8()+'-'+String(n).padStart(4,'0'),dp=Number(pl.bayar_dp)||0;
      var e=new Date();e.setDate(e.getDate()+est);var eS=e.toISOString().slice(0,10);
      DB.orders.push({order_id:oid,tanggal_masuk:dstr(),customer_id:pl.customer_id,outlet_id:'OUT-01',kasir:pl.kasir||'',total:total,bayar_dp:dp,sisa:total-dp,metode:pl.metode||'Cash',status:'DITERIMA',estimasi_selesai:eS});
      pl.items.forEach(function(it){var s=svc(it.service_id),q=Number(it.qty)||0;DB.items.push({order_id:oid,service_id:it.service_id,service_nama:s.nama,qty:q,harga_satuan:s.harga,subtotal:s.harga*q});});
      DB.logs.push({log_id:crypto.randomUUID(),order_id:oid,dari:'',ke:'DITERIMA',oleh:pl.kasir||'',timestamp:now(),catatan:'Order dibuat'});
      if(dp>0)DB.pays.push({payment_id:crypto.randomUUID(),order_id:oid,jumlah:dp,metode:pl.metode||'Cash',tanggal:now(),kasir:pl.kasir||''});
      return{order_id:oid,total:total,sisa:total-dp,estimasi_selesai:eS,track_url:base(req)+'/?code='+oid,wa_link:waLinkFor(oid,req)};}

    case 'listOrders':{var cm={};DB.customers.forEach(function(c){cm[c.customer_id]=c;});var st=String(pl.status||''),q=String(pl.q||'').toLowerCase();return DB.orders.slice().reverse().filter(function(o){return (!st||o.status===st)&&(!q||o.order_id.toLowerCase().indexOf(q)>-1||cm[o.customer_id].nama.toLowerCase().indexOf(q)>-1);}).slice(0,100).map(function(o){var c=cm[o.customer_id]||{};return{order_id:o.order_id,tanggal_masuk:o.tanggal_masuk,customer_nama:c.nama||o.customer_id,customer_wa:c.wa||'',total:o.total,sisa:o.sisa,status:o.status,estimasi_selesai:o.estimasi_selesai};});}
    case 'getOrderDetail':{var o=ord(pl.order_id);if(!o)throw new Error('Order?');return{order:o,customer:cust(o.customer_id),items:DB.items.filter(function(i){return i.order_id===o.order_id;}),logs:DB.logs.filter(function(l){return l.order_id===o.order_id;}),payments:DB.pays.filter(function(x){return x.order_id===o.order_id;}),track_url:base(req)+'/?code='+o.order_id,wa_link:waLinkFor(o.order_id,req)};}
    case 'updateStatus':{var o=ord(pl.order_id);if(!o)throw new Error('Order?');var dari=o.status,ke=String(pl.ke||'');if((ALLOWED_NEXT[dari]||[]).indexOf(ke)<0)throw new Error('Ilegal '+dari+'->'+ke);o.status=ke;DB.logs.push({log_id:crypto.randomUUID(),order_id:o.order_id,dari:dari,ke:ke,oleh:pl.oleh||'',timestamp:now(),catatan:pl.catatan||''});var wa='';if(ke==='SIAP_DIAMBIL'||ke==='SELESAI'){wa=waLinkFor(o.order_id,req);DB.walogs.push({log_id:crypto.randomUUID(),order_id:o.order_id,ke:ke,wa:normWA(cust(o.customer_id).wa),link:wa,timestamp:now(),via:'LINK',status:'ready-to-send'});}return{order_id:o.order_id,dari:dari,ke:ke,wa_link:wa,wa_sent:wa?'LINK (klik utk kirim)':''};}
    case 'addPayment':{var o=ord(pl.order_id);if(!o)throw new Error('Order?');var j=Number(pl.jumlah)||0;if(j<=0)throw new Error('Jumlah>0');var sisa=o.sisa-j;if(sisa<0)throw new Error('Overpay sisa '+o.sisa);DB.pays.push({payment_id:crypto.randomUUID(),order_id:o.order_id,jumlah:j,metode:pl.metode||'Cash',timestamp:now(),kasir:pl.kasir||''});o.bayar_dp+=j;o.sisa=sisa;return{payment_id:'PAY-'+Date.now(),sisa:sisa};}
    case 'dailyOmzet':{var t=String(pl.tanggal||dstr()),om=0,n=0,lu=0,bl=0;DB.orders.forEach(function(o){if(o.tanggal_masuk===t&&o.status!=='DIBATALKAN'){om+=o.total;n++;if(o.sisa<=0)lu++;else bl++;}});var kas=DB.pays.filter(function(x){return String(x.timestamp).indexOf(t)===0;}).reduce(function(s,x){return s+x.jumlah;},0);return{tanggal:t,total_omzet:om,total_order:n,lunas:lu,belum_lunas:bl,kas_masuk:kas};}
    case 'dashboard':return actDashboard();
    case 'waLink':return{link:waLinkFor(pl.order_id,req)};
    case 'seedCheck':return{users:DB.users.length,customers:DB.customers.length,services:DB.services.length,orders:DB.orders.length};
    case 'ping':return{time:now()};
    default:throw new Error('Unknown: '+a);
  }
}
function waLinkFor(oid,req){var o=ord(oid);if(!o)return'';var c=cust(o.customer_id),wa=normWA(c.wa);if(!wa)return'';var msg=o.status==='SIAP_DIAMBIL'?('Halo '+(c.nama||'Kak')+', cucian '+oid+' SUDAH SIAP DIAMBIL di Laundry Barokah (OUT-01). Estimasi awal '+o.estimasi_selesai+'. Tks!'):o.status==='SELESAI'?('Halo '+(c.nama||'Kak')+', order '+oid+' SELESAI. Terima kasih sudah laundry di kami!'):('Halo '+(c.nama||'Kak')+', status '+oid+': '+o.status+'.');return 'https://wa.me/'+wa+'?text='+encodeURIComponent(msg);}
function json(res,code,obj){res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(obj));}
function actDashboard(){var t=dstr(),sts=['DITERIMA','DICUCI','DIKERINGKAN','DISETRIKA','SIAP_DIAMBIL','SELESAI','DIBATALKAN'],sc={},om=0,n=0,bl=0;sts.forEach(function(s){sc[s]=0;});var days={};for(var i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var ds=d.toISOString().slice(0,10);days[ds]={tanggal:ds,total_omzet:0,total_order:0};}DB.orders.forEach(function(o){var st=o.status;if(sc[st]!==undefined)sc[st]++;if(o.tanggal_masuk===t&&st!=='DIBATALKAN'){om+=o.total;n++;if(o.sisa>0)bl++;}var day=days[o.tanggal_masuk];if(day&&st!=='DIBATALKAN'){day.total_omzet+=o.total;day.total_order++;}});var s7=[];for(var k in days)s7.push(days[k]);return{omzet_hari_ini:om,order_hari_ini:n,siap_diambil:sc.SIAP_DIAMBIL,belum_lunas:bl,status_counts:sc,stats7:s7};}
http.createServer(function(req,res){
  var u=new URL(req.url,'http://x');
  if(u.pathname==='/exec'||u.pathname.indexOf('/exec')===0){
    if(req.method==='GET'){
      var a=u.searchParams.get('action');
      if(a==='ping')return json(res,200,{ok:true,data:{time:now()}});
      if(a==='track'){var o=ord(u.searchParams.get('code')||'');if(!o)return json(res,404,{ok:false,error:'Nota?'});return json(res,200,{ok:true,data:{order_id:o.order_id,status:o.status,estimasi_selesai:o.estimasi_selesai,tanggal_masuk:o.tanggal_masuk,sisa:o.sisa,logs:DB.logs.filter(function(l){return l.order_id===o.order_id;}).map(function(l){return{ke:l.ke,timestamp:l.timestamp,catatan:l.catatan}})}});}
      return json(res,200,{ok:true,data:{app:'LaundryMock',time:now()}});
    }
    var b='';req.on('data',function(c){b+=c;});req.on('end',function(){
      try{var p=JSON.parse(b||'{}');
        if(p.action!=='login'&&String(p.token||'')!==TOKEN)return json(res,401,{ok:false,error:'Unauthorized'});
        return json(res,200,{ok:true,data:actions(p,req)});
      }catch(e){return json(res,400,{ok:false,error:e.message||String(e)});}
    });
    return;
  }
  var f=path.normalize(path.join(ROOT,u.pathname==='/'?'index.html':u.pathname.slice(1)));
  if(f.indexOf(ROOT)!==0)return json(res,403,{error:'forbidden'});
  fs.readFile(f,function(e,d){if(e)return json(res,404,{error:'not found'});res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});res.end(d);});
}).listen(PORT,function(){console.log('Laundry mock running: http://localhost:'+PORT);});
