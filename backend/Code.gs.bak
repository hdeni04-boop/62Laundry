/************************************************************
 * LAUNDRY APP — Backend Code.gs (1 Outlet MVP)
 * DB: Google Spreadsheet | Frontend: HTML/CSS/JS murni
 * Deploy: Extensions > Apps Script > Deploy > New deployment > Web app
 ************************************************************/
var SHEET_USERS='Users',SHEET_OUTLETS='Outlets',SHEET_CUSTOMERS='Customers',
SHEET_SERVICES='Services',SHEET_ORDERS='Orders',SHEET_ITEMS='OrderItems',
SHEET_LOGS='StatusLogs',SHEET_PAY='Payments';
var OUTLET_DEFAULT='OUT-01';
var ALLOWED_NEXT={DITERIMA:['DICUCI','DIBATALKAN'],DICUCI:['DIKERINGKAN','DIBATALKAN'],DIKERINGKAN:['DISETRIKA','DIBATALKAN'],DISETRIKA:['SIAP_DIAMBIL','DIBATALKAN'],SIAP_DIAMBIL:['SELESAI','DIBATALKAN'],SELESAI:[],DIBATALKAN:[]};

function getApiToken(){return PropertiesService.getScriptProperties().getProperty('API_TOKEN')||'GANTI_TOKEN_RAHASIA';}
function getSs(){var id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');return id?SpreadsheetApp.openById(id):SpreadsheetApp.getActiveSpreadsheet();}
function sh(name){return getSs().getSheetByName(name);}
function rows(name){var s=sh(name);if(!s)return[];var v=s.getDataRange().getValues();if(v.length<2)return[];var h=v[0],out=[];for(var i=1;i<v.length;i++){var o={_row:i+1};for(var j=0;j<h.length;j++)o[h[j]]=v[i][j];out.push(o);}return out;}
function appendRow(name,arr){sh(name).appendRow(arr);SpreadsheetApp.flush();}
function pad(n,l){n=String(n);while(n.length<l)n='0'+n;return n;}
function todayStr(){return Utilities.formatDate(new Date(),Session.getScriptTimeZone()||'Asia/Jakarta','yyyy-MM-dd');}
function nowStr(){return Utilities.formatDate(new Date(),Session.getScriptTimeZone()||'Asia/Jakarta','yyyy-MM-dd HH:mm:ss');}
function json(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function ok(data){return json({ok:true,data:data});}
function fail(msg){return json({ok:false,error:String(msg)});}
function checkAuth(token){return String(token||'')===String(getApiToken());}
function findUserByPin(pin){var a=rows(SHEET_USERS);for(var i=0;i<a.length;i++){if(String(a[i].pin)===String(pin)&&String(a[i].aktif).toUpperCase()==='TRUE')return a[i];}return null;}

function doGet(e){
  e=e||{};var p=e.parameter||{};
  if(p.action==='ping')return ok({time:nowStr()});
  if(p.action==='track'&&p.code)return trackPublic(p.code);
  return ok({app:'LaundryApp 1-Outlet',time:nowStr(),hint:'POST {action,token,payload}'});
}
function doPost(e){
  try{
    var body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    var action=body.action||'',token=body.token||'',payload=body.payload||{};
    if(action!=='login'&&!checkAuth(token))return fail('Unauthorized: token salah.');
    switch(action){
      case 'login':return actLogin(payload);
      case 'getServices':return ok(actServices());
      case 'getCustomers':return ok(actGetCustomers(payload));
      case 'createCustomer':return ok(actCreateCustomer(payload));
      case 'createOrder':return ok(actCreateOrder(payload));
      case 'listOrders':return ok(actListOrders(payload));
      case 'getOrderDetail':return ok(actGetDetail(payload));
      case 'updateStatus':return ok(actUpdateStatus(payload));
      case 'addPayment':return ok(actAddPayment(payload));
      case 'dailyOmzet':return ok(actOmzet(payload));
      case 'ping':return ok({time:nowStr()});
      default:return fail('Action tidak dikenal: '+action);
    }
  }catch(err){Logger.log(err);return fail(err&&err.message||err);}
}
function trackPublic(code){
  var d=getOrderById(String(code).trim());
  if(!d)return json({ok:false,error:'Nota tidak ditemukan'});
function actLogin(p){var u=findUserByPin(p.pin);if(!u)throw new Error('PIN salah / user nonaktif');return{token:getApiToken(),user:{user_id:String(u.user_id),nama:String(u.nama),role:String(u.role)}};}
function actServices(){return rows(SHEET_SERVICES).filter(function(s){return String(s.aktif).toUpperCase()==='TRUE';}).map(function(s){return{service_id:String(s.service_id),nama:String(s.nama),satuan:String(s.satuan),harga:Number(s.harga)||0,estimasi_hari:Number(s.estimasi_hari)||2};});}
function actGetCustomers(p){var q=String((p&&p.q)||'').toLowerCase(),a=rows(SHEET_CUSTOMERS),out=[];for(var i=a.length-1;i>=0&&out.length<100;i--){var nm=String(a[i].nama||'').toLowerCase(),wa=String(a[i].wa||'').toLowerCase();if(!q||nm.indexOf(q)>-1||wa.indexOf(q)>-1)out.push({customer_id:String(a[i].customer_id),nama:String(a[i].nama),wa:String(a[i].wa||''),alamat:String(a[i].alamat||'')});}return out;}
function nextCustomerId(){var a=rows(SHEET_CUSTOMERS),mx=0;for(var i=0;i<a.length;i++){var m=/CUS-(\d+)/.exec(String(a[i].customer_id||''));if(m)mx=Math.max(mx,parseInt(m[1],10));}return 'CUS-'+pad(mx+1,4);}
function actCreateCustomer(p){if(!p.nama)throw new Error('Nama customer wajib');var id=nextCustomerId();appendRow(SHEET_CUSTOMERS,[id,p.nama,p.wa||'',p.alamat||'']);return{customer_id:id};}
function svcMap(){var m={};rows(SHEET_SERVICES).forEach(function(s){m[String(s.service_id)]=s;});return m;}
function nextOrderId(){var d=Utilities.formatDate(new Date(),Session.getScriptTimeZone()||'Asia/Jakarta','yyyyMMdd');var a=rows(SHEET_ORDERS),mx=0;for(var i=0;i<a.length;i++){var m=new RegExp('LND-'+d+'-(\\d+)').exec(String(a[i].order_id||''));if(m)mx=Math.max(mx,parseInt(m[1],10));}return 'LND-'+d+'-'+pad(mx+1,4);}
function getOrderById(id){var a=rows(SHEET_ORDERS),o=null;for(var i=0;i<a.length;i++)if(String(a[i].order_id)===String(id))o=a[i];if(!o)return null;var items=rows(SHEET_ITEMS).filter(function(r){return String(r.order_id)===String(id);});var logs=rows(SHEET_LOGS).filter(function(r){return String(r.order_id)===String(id);});var pays=rows(SHEET_PAY).filter(function(r){return String(r.order_id)===String(id);});return{order:o,items:items,logs:logs,payments:pays};}
function actCreateOrder(p){var lock=LockService.getScriptLock();lock.waitLock(30000);try{
function actListOrders(p){p=p||{};var st=String(p.status||''),q=String(p.q||'').toLowerCase(),lim=Math.min(Number(p.limit)||50,100);var cust={};rows(SHEET_CUSTOMERS).forEach(function(c){cust[String(c.customer_id)]=String(c.nama);});var a=rows(SHEET_ORDERS),out=[];for(var i=a.length-1;i>=0&&out.length<lim;i--){var o=a[i];if(st&&String(o.status)!==st)continue;var nm=(cust[String(o.customer_id)]||'').toLowerCase();if(q&&(String(o.order_id).toLowerCase().indexOf(q)<0&&nm.indexOf(q)<0))continue;out.push({order_id:String(o.order_id),tanggal_masuk:String(o.tanggal_masuk||''),customer_nama:cust[String(o.customer_id)]||String(o.customer_id),total:Number(o.total)||0,sisa:Number(o.sisa)||0,status:String(o.status),estimasi_selesai:String(o.estimasi_selesai||'')});}return out;}
function actGetDetail(p){var d=getOrderById(p.order_id);if(!d)throw new Error('Order?');var cust={};rows(SHEET_CUSTOMERS).forEach(function(c){cust[String(c.customer_id)]=c;});return{order:d.order,customer:cust[String(d.order.customer_id)]||null,items:d.items,logs:d.logs,payments:d.payments};}
function actUpdateStatus(p){var d=getOrderById(p.order_id);if(!d)throw new Error('Order?');var dari=String(d.order.status),ke=String(p.ke||'');if((ALLOWED_NEXT[dari]||[]).indexOf(ke)<0)throw new Error('Ilegal: '+dari+'->'+ke);var s=sh(SHEET_ORDERS),vals=s.getDataRange().getValues();for(var i=1;i<vals.length;i++){if(String(vals[i][0])===String(p.order_id)){s.getRange(i+1,10).setValue(ke);break;}}appendRow(SHEET_LOGS,[Utilities.getUuid(),p.order_id,dari,ke,p.oleh||'',nowStr(),p.catatan||'']);SpreadsheetApp.flush();return{order_id:String(p.order_id),dari:dari,ke:ke};}
function actAddPayment(p){var d=getOrderById(p.order_id);if(!d)throw new Error('Order?');var jml=Number(p.jumlah)||0;if(jml<=0)throw new Error('Jumlah>0');var sisa=(Number(d.order.sisa)||0)-jml;if(sisa<0)throw new Error('Overpay, sisa '+d.order.sisa);appendRow(SHEET_PAY,[Utilities.getUuid(),p.order_id,jml,p.metode||'Cash',nowStr(),p.kasir||'']);var s=sh(SHEET_ORDERS),vals=s.getDataRange().getValues();for(var i=1;i<vals.length;i++){if(String(vals[i][0])===String(p.order_id)){s.getRange(i+1,7).setValue((Number(vals[i][6])||0)+jml);s.getRange(i+1,8).setValue(sisa);break;}}SpreadsheetApp.flush();return{payment_id:'PAY-'+Date.now(),sisa:sisa};}
function actOmzet(p){var t=String((p&&p.tanggal)||todayStr());var a=rows(SHEET_ORDERS),om=0,n=0,lunas=0,bl=0;for(var i=0;i<a.length;i++){if(String(a[i].tanggal_masuk)===t&&String(a[i].status)!=='DIBATALKAN'){om+=Number(a[i].total)||0;n++;if((Number(a[i].sisa)||0)<=0)lunas++;else bl++;}}var pays=rows(SHEET_PAY).filter(function(r){return String(r.tanggal||'').indexOf(t)===0;}).reduce(function(x,r){return x+(Number(r.jumlah)||0);},0);return{tanggal:t,total_omzet:om,total_order:n,lunas:lunas,belum_lunas:bl,kas_masuk:pays};}
if(!p.customer_id)throw new Error('customer_id wajib');if(!p.items||!p.items.length)throw new Error('items kosong');
var sm=svcMap(),total=0,estMax=0,lines=[];
for(var i=0;i<p.items.length;i++){var it=p.items[i],s=sm[String(it.service_id)];if(!s)throw new Error('Service? '+it.service_id);var qty=Number(it.qty)||0;if(qty<=0)throw new Error('Qty>0');var pr=Number(s.harga)||0;total+=pr*qty;estMax=Math.max(estMax,Number(s.estimasi_hari)||2);lines.push([null,String(it.service_id),qty,pr,pr*qty]);}
var oid=nextOrderId(),dp=Number(p.bayar_dp)||0,metode=p.metode||'Cash',tgl=todayStr();
var est=new Date();est.setDate(est.getDate()+estMax);
var estStr=Utilities.formatDate(est,Session.getScriptTimeZone()||'Asia/Jakarta','yyyy-MM-dd');
appendRow(SHEET_ORDERS,[oid,tgl,p.customer_id,OUTLET_DEFAULT,p.kasir||'',total,dp,total-dp,metode,'DITERIMA',estStr]);
for(var j=0;j<lines.length;j++){lines[j][0]=oid;appendRow(SHEET_ITEMS,lines[j]);}
appendRow(SHEET_LOGS,[Utilities.getUuid(),oid,'','DITERIMA',p.kasir||'',nowStr(),p.catatan||'Order dibuat']);
if(dp>0)appendRow(SHEET_PAY,[Utilities.getUuid(),oid,dp,metode,tgl+' 00:00:00',p.kasir||'']);
return{order_id:oid,total:total,sisa:total-dp,estimasi_selesai:estStr};}finally{lock.releaseLock();}}
  return ok({order_id:d.order.order_id,status:d.order.status,estimasi_selesai:String(d.order.estimasi_selesai||''),tanggal_masuk:String(d.order.tanggal_masuk||''),logs:d.logs.map(function(l){return{ke:l.ke,timestamp:String(l.timestamp||''),catatan:String(l.catatan||'')}})});
}
