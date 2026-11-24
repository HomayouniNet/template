/* =========================================================
   فروشگاه اینترنتی عبداللهی - مقایسه‌ی محصولات (compare.html)
   حداکثر ۴ محصول؛ ردیف‌های متفاوت زرد می‌شوند
   در ووکامرس: افزونه‌ی Compare یا صفحه‌ی سفارشی
   ========================================================= */
(function () {
  'use strict';
  const C = window.CATALOG;
  const { $, fa, money, store, PRODUCTS, GROUPS, priceHTML } = C;
  const root = $('#cmpRoot');
  let onlyDiff = false;

  function attrsOf(p) {
    const m = {};
    if (p.brand) m['برند'] = p.brand;
    m['دسته‌بندی'] = p.path[p.path.length - 1];
    p.specs.forEach(s => {
      const i = s.indexOf(':');
      if (i > 0) { const k = s.slice(0, i).trim(); if (k !== 'برند') m[k] = s.slice(i + 1).trim(); }
    });
    GROUPS.forEach(g => { if (p.a[g.k] && p.a[g.k].length) m[g.t] = p.a[g.k].join('، '); });
    if (p.vattrs) p.vattrs.forEach(a => { m[a.name] = a.opts.join('، '); });
    return m;
  }

  function render() {
    const list = store.cmp().map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
    if (!list.length) {
      root.innerHTML = `<div class="bx empty-pg"><svg class="pic"><use href="#i-compare"/></svg><h2>محصولی برای مقایسه انتخاب نشده است</h2><p>در لیست محصولات، روی آیکون مقایسه‌ی هر کالا بزنید (تا ۴ محصول).</p><a href="shop.html" class="btn">مشاهده‌ی محصولات</a></div>`;
      return;
    }
    const maps = list.map(attrsOf);
    const keys = [];
    maps.forEach(m => Object.keys(m).forEach(k => { if (!keys.includes(k)) keys.push(k); }));
    const rowsHTML = keys.map(k => {
      const vals = maps.map(m => m[k] || '—');
      const diff = new Set(vals).size > 1;
      if (onlyDiff && !diff) return '';
      return `<tr><th>${k}</th>${vals.map(v => `<td class="${diff ? 'diff' : ''}">${fa(v)}</td>`).join('')}</tr>`;
    }).join('');
    const col = fn => list.map(fn).join('');
    root.innerHTML = `
      <div class="cmp-tools"><label><input type="checkbox" id="onlyDiff"${onlyDiff ? ' checked' : ''}> فقط تفاوت‌ها را نشان بده</label><span class="muted">${fa(list.length)} محصول</span></div>
      <div class="cmp-wrap"><table class="cmp-t">
        <tr><th>محصول</th>${col(p => `<td class="pc"><button type="button" class="rmv" data-rm="${p.id}" aria-label="حذف از مقایسه"><svg class="i"><use href="#i-close"/></svg></button><a class="th" href="product.html?id=${p.id}"><svg class="pic"><use href="#${p.icon}"/></svg></a><a class="nm" href="product.html?id=${p.id}">${p.name}</a></td>`)}</tr>
        <tr><th>قیمت</th>${col(p => `<td class="pr3">${p.stock ? priceHTML({ ...p, old: 0 }).replace(/<small[^>]*>/g, '<small style="font-size:11px;color:var(--mute);font-weight:500;margin-inline:3px">') : '<span class="muted">ناموجود</span>'}</td>`)}</tr>
        <tr><th>امتیاز</th>${col(p => `<td>${fa(p.rate)} از ۵</td>`)}</tr>
        <tr><th>موجودی</th>${col(p => `<td class="${p.stock ? 'ok-t' : 'err-t'}">${p.stock ? 'موجود' : 'ناموجود'}</td>`)}</tr>
        ${rowsHTML}
        <tr><th></th>${col(p => `<td>${p.stock && !p.variable ? `<button type="button" class="btn" data-add="${p.id}"><svg class="i"><use href="#i-cart"/></svg>افزودن به سبد</button>` : `<a class="btn line" href="product.html?id=${p.id}">مشاهده‌ی محصول</a>`}</td>`)}</tr>
      </table></div>`;
  }

  root.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]');
    if (rm) { store.toggle('cmp', +rm.dataset.rm); render(); return; }
    const add = e.target.closest('[data-add]');
    if (add) { store.addCart(+add.dataset.add, -1, 1); C.say('به سبد خرید اضافه شد'); }
  });
  root.addEventListener('change', e => { if (e.target.id === 'onlyDiff') { onlyDiff = e.target.checked; render(); } });
  render();
})();
