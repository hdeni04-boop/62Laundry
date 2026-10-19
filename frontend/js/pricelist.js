/** Daftar Harga — tampilan daftar layanan; owner dapat mengganti harga custom. */
var Pricelist = {
  _owner: false,
  render: function () {
    var me = {}; try { me = JSON.parse(localStorage.getItem('laundry_user') || '{}'); } catch (e) { }
    Pricelist._owner = me.role === 'owner';
    document.getElementById('app').innerHTML =
      '<section class="hd"><div><h1>' + ic('tag', 'lg') + ' Daftar Harga</h1><p class="mut">Harga layanan +62Laundry (OUT-01)</p></div></section>' +
      (Pricelist._owner
        ? '<div class="pl-note">' + ic('info') + ' <span>Mode <b>Owner</b> — tekan <b>Ubah</b> untuk mengganti harga layanan. Perubahan langsung dipakai di POS & nota.</span></div>'
        : '<div class="pl-note">' + ic('star') + ' <span>Hanya <b>owner</b> yang dapat mengubah harga layanan.</span></div>') +
      '<div id="plList"><div class="mut">Memuat layanan…</div></div>';
    Pricelist.load();
  },
  load: function () {
    Api.call('getServices', {}).then(function (list) {
      var box = document.getElementById('plList'); if (!box) return;
      list = list || [];
      box.innerHTML = list.map(function (s) {
        return '<div class="pl-item" data-id="' + s.service_id + '">' +
          '<div class="pl-ic">' + ic('tag') + '</div>' +
          '<div class="pl-info"><b>' + s.nama + '</b><small>' + s.service_id + ' • per ' + s.satuan + ' • estimasi ' + s.estimasi_hari + ' hari</small></div>' +
          '<div class="pl-price">' + rupiah(s.harga) + '</div>' +
          (Pricelist._owner ? '<div class="pl-edit"><button class="btn sm ghost" data-edit="' + s.service_id + '" data-harga="' + Number(s.harga) + '">' + ic('edit') + ' Ubah</button></div>' : '') +
          '</div>';
      }).join('') || '<div class="empty">' + ic('box') + ' Belum ada layanan</div>';
      box.querySelectorAll('[data-edit]').forEach(function (b) {
        b.onclick = function () { Pricelist.edit(b.dataset.edit, Number(b.dataset.harga)); };
      });
    }).catch(function (e) {
      var box = document.getElementById('plList'); if (box) box.innerHTML = '<div class="empty">' + String(e.message || e) + '</div>';
    });
  },
  edit: function (id, current) {
    var item = document.querySelector('.pl-item[data-id="' + id + '"]'); if (!item) return;
    var priceEl = item.querySelector('.pl-price'), editEl = item.querySelector('.pl-edit');
    if (!editEl) return;
    if (priceEl) priceEl.style.display = 'none';
    editEl.innerHTML = '<input class="pl-in" type="number" min="1" step="500" value="' + current + '" aria-label="Harga baru">' +
      '<button class="btn sm pl-save">' + ic('check') + ' Simpan</button>' +
      '<button class="btn sm ghost pl-cancel" aria-label="Batal">' + ic('x') + '</button>';
    var input = editEl.querySelector('.pl-in');
    input.focus(); input.select();
    editEl.querySelector('.pl-save').onclick = function () {
      var h = Number(input.value || 0);
      if (!(h > 0)) return toast('Harga harus lebih dari 0', false);
      var u = {}; try { u = JSON.parse(localStorage.getItem('laundry_user') || '{}'); } catch (e) { }
      Api.call('updateServicePrice', { service_id: id, harga: h, role: u.role || '', oleh: u.nama || '' })
        .then(function (r) { toast((r.nama || id) + ' → ' + rupiah(r.harga)); Pricelist.load(); })
        .catch(function (e) { toast(e.message, false); });
    };
    editEl.querySelector('.pl-cancel').onclick = function () { Pricelist.load(); };
    input.onkeydown = function (e) { if (e.key === 'Enter') editEl.querySelector('.pl-save').click(); };
  }
};