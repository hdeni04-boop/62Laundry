/** Uji alur owner: login → Daftar Harga → ubah harga → simpan. */
var puppeteer = require('puppeteer-core');
(async function () {
  var b = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--no-sandbox'] });
  var pg = await b.newPage();
  await pg.setViewport({ width: 375, height: 667, isMobile: true, deviceScaleFactor: 2 });
  var errs = [];
  pg.on('pageerror', function (e) { errs.push(e.message); });
  await pg.goto('http://localhost:8080/', { waitUntil: 'networkidle2' });
  await pg.type('#pin', '123123@');
  await pg.click('#btnLogin');
  await new Promise(function (r) { setTimeout(r, 2500); });
  await pg.goto('http://localhost:8080/#/pricelist', { waitUntil: 'networkidle2' });
  await new Promise(function (r) { setTimeout(r, 1500); });
  var hasEdit = await pg.evaluate(function () { return document.querySelectorAll('[data-edit]').length; });
  console.log('TOMBOL-UBAH-OWNER:', hasEdit);
  var first = await pg.$('[data-edit]');
  if (first) {
    await first.click();
    await new Promise(function (r) { setTimeout(r, 400); });
    await pg.type('.pl-in', '9999');
    await pg.click('.pl-save');
    await new Promise(function (r) { setTimeout(r, 1500); });
    var price = await pg.evaluate(function () { var el = document.querySelector('.pl-item .pl-price'); return el ? el.textContent : null; });
    console.log('HARGA-BARU-DIUI:', price);
    var toast = await pg.evaluate(function () { var t = document.getElementById('toast'); return t ? t.textContent : ''; });
    console.log('TOAST:', toast);
    await pg.screenshot({ path: 'e:/Laundry app/tools/mobile-shots/13-owner-edit.png' });
  }
  console.log('ERRORS:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
