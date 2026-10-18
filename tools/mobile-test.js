/** Test tampilan mobile: screenshot semua halaman di viewport 375x667,
 * deteksi overflow horizontal + error console.
 * Pakai: npm start (terminal 1) | node tools/mobile-test.js (terminal 2) */
var puppeteer = require('puppeteer-core');
var path = require('path');
var fs = require('fs');

var BASE = process.env.BASE_URL || 'http://localhost:8080';
var CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
var OUT = path.join(__dirname, 'mobile-shots');

var PAGES = [
  { hash: '#/dashboard', name: '01-dasbor' },
  { hash: '#/pos', name: '02-pos' },
  { hash: '#/orders', name: '03-pesanan' },
  { hash: '#/customers', name: '04-pelanggan' },
  { hash: '#/expenses', name: '05-pengeluaran' },
  { hash: '#/stock', name: '06-stok' },
  { hash: '#/settings', name: '07-setting' },
  { hash: '#/laporan', name: '08-laporan' },
  { hash: '#/help', name: '09-bantuan' },
  { hash: '#/tracking', name: '10-lacak' }
];

(async function () {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  var browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  var page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  var errors = [];
  page.on('console', function (m) { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', function (e) { errors.push('[pageerror] ' + e.message); });

  // 1. Login screen
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: path.join(OUT, '00-login.png') });
  var loginReport = await overflowCheck(page, 'login');

  // 2. Login as kasir
  await page.type('#pin', '1111');
  await page.click('#btnLogin');
  await waitForHash(page, '#/dashboard');
  await sleep(1500);

  var reports = [loginReport];
  for (var i = 0; i < PAGES.length; i++) {
    var p = PAGES[i];
    await page.goto(BASE + '/' + p.hash, { waitUntil: 'networkidle2', timeout: 30000 }).catch(function () {});
    await sleep(1800);
    await page.screenshot({ path: path.join(OUT, p.name + '.png'), fullPage: false });
    reports.push(await overflowCheck(page, p.name));
    // fullPage untuk beberapa halaman kunci
    if (['01-dasbor', '02-pos', '03-pesanan', '04-pelanggan', '08-laporan'].indexOf(p.name) > -1) {
      await page.screenshot({ path: path.join(OUT, p.name + '-full.png'), fullPage: true });
    }
  }

  console.log('\n=== OVERFLOW / LAYOUT REPORT ===');
  reports.forEach(function (r) {
    console.log(r.page + ': scrollW=' + r.scrollW + ' innerW=' + r.innerW + (r.overflow ? '  *** OVERFLOW ' + r.overflow + 'px ***' : '  ok'));
    if (r.wide.length) console.log('   elemen lebar: ' + r.wide.slice(0, 5).join(' | '));
  });
  console.log('\n=== ERRORS (' + errors.length + ') ===');
  errors.slice(0, 20).forEach(function (e) { console.log(e); });

  await browser.close();
})().catch(function (e) { console.error('FATAL:', e); process.exit(1); });

function overflowCheck(pg, name) {
  return pg.evaluate(function (pageName) {
    var iw = window.innerWidth;
    var sw = document.documentElement.scrollWidth;
    var wide = [];
    if (sw > iw) {
      document.querySelectorAll('body *').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.width > iw + 1 && r.height > 0) {
          var cls = (el.className && String(el.className).slice(0, 40)) || '';
          wide.push(el.tagName + '.' + cls + ' w=' + Math.round(r.width));
        }
      });
    }
    return { page: pageName, innerW: iw, scrollW: sw, overflow: Math.max(0, sw - iw), wide: wide };
  }, name);
}
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
async function waitForHash(pg, h) { for (var i = 0; i < 40; i++) { var ch = await pg.evaluate(function () { return location.hash; }); if (ch === h) return; await sleep(250); } }
