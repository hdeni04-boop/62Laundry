var fs = require('fs');
var path = require('path');
var { spawnSync } = require('child_process');
var lucide = require('lucide-static');

var root = path.join(__dirname, '..');
var frontend = path.join(root, 'frontend');
var iconMap = {
  home: 'House',
  cart: 'ShoppingCart',
  washer: 'WashingMachine',
  box: 'Package',
  minus: 'Minus',
  help: 'CircleHelp',
  clipboard: 'ClipboardList',
  users: 'UsersRound',
  pin: 'MapPin',
  chart: 'ChartNoAxesColumnIncreasing',
  more: 'Ellipsis',
  menu: 'Menu',
  edit: 'Pencil',
  bell: 'Bell',
  moon: 'Moon',
  sun: 'Sun',
  logout: 'LogOut',
  plus: 'Plus',
  search: 'Search',
  printer: 'Printer',
  wa: 'MessageCircle',
  money: 'CircleDollarSign',
  clock: 'Clock3',
  check: 'Check',
  x: 'X',
  drop: 'Droplet',
  arrow: 'ArrowRight',
  info: 'Info',
  spark: 'Sparkles',
  tag: 'Tag',
  phone: 'Smartphone',
  dot: 'Circle',
  user: 'UserRound',
  star: 'Star',
  mail: 'Mail',
  alert: 'TriangleAlert',
  calendar: 'CalendarDays',
  download: 'Download',
  settings: 'Settings',
  filter: 'ListFilter',
  received: 'PackageCheck',
  iron: 'Shirt',
  ready: 'CircleCheck',
  done: 'CheckCheck',
  cancel: 'Ban'
};

var icons = {};
Object.keys(iconMap).forEach(function (name) {
  var svg = lucide[iconMap[name]];
  if (!svg) throw new Error('Lucide icon not found: ' + iconMap[name]);
  var match = /<svg\b[^>]*>([\s\S]*?)<\/svg>/.exec(svg);
  if (!match) throw new Error('Invalid Lucide SVG: ' + iconMap[name]);
  icons[name] = match[1].trim();
});

fs.writeFileSync(
  path.join(frontend, 'js', 'lucide-icons.js'),
  'var LUCIDE_ICONS=' + JSON.stringify(icons) + ';\n'
);

var cli = path.join(path.dirname(require.resolve('@tailwindcss/cli/package.json')), 'dist', 'index.mjs');
var result = spawnSync(process.execPath, [
  cli,
  '-i', path.join(frontend, 'css', 'tailwind.input.css'),
  '-o', path.join(frontend, 'css', 'tailwind.css'),
  '--minify'
], { cwd: root, stdio: 'inherit' });

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
