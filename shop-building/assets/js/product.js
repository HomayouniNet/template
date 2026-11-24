/* =========================================================
   فروشگاه اینترنتی عبداللهی - صفحه‌ی تکی محصول
   آدرس: product.html?id=شناسه
   داده‌ها از catalog.js خوانده می‌شود (در ووکامرس: single-product.php)
   ========================================================= */
(function () {
  'use strict';
  const { $, fa, money, nodeMap, GROUPS, PRODUCTS, store, cardHTML, priceHTML, mountPicker } = window.CATALOG;

  const id = +new URLSearchParams(location.search).get('id');
  const p = PRODUCTS.find(x => x.id === id);
  const root = $('#pdRoot');

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let tt;
  function say(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => toastEl.classList.remove('show'), 2000);
  }

  /* ---------- menu drawer, back-to-top, search ---------- */
  const drawer = $('#drawer');
  $('#openMenu').addEventListener('click', () => drawer.classList.add('open'));
  [$('#dov'), $('#dx')].forEach(el => el.addEventListener('click', () => drawer.classList.remove('open')));
  const toTop = $('#tt');
  addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > 600), { passive: true });
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  $('#hSearch').addEventListener('submit', e => {
    e.preventDefault();
    const q = $('#hQ').value.trim();
    location.href = 'shop.html' + (q ? '?q=' + encodeURIComponent(q) : '');
  });
  store.sync();

  /* ---------- not found ---------- */
  if (!p) {
    $('#crumbs').innerHTML = '<a href="index3.html">خانه</a><span class="sep">/</span><a href="shop.html">فروشگاه</a>';
    root.innerHTML = `<div class="nf"><svg class="pic"><use href="#p-box"/></svg><h1>محصول مورد نظر پیدا نشد</h1><a href="shop.html" class="btn">بازگشت به فروشگاه</a></div>`;
    return;
  }

  document.title = p.name + ' | فروشگاه اینترنتی عبداللهی';

  /* ---------- breadcrumb ---------- */
  let crumbs = '<a href="index3.html">خانه</a><span class="sep">/</span><a href="shop.html">فروشگاه</a>';
  p.path.forEach((n, i) => {
    const key = p.path.slice(0, i + 1).join('/');
    crumbs += `<span class="sep">/</span><a href="shop.html?cat=${encodeURIComponent(key)}">${n}</a>`;
  });
  crumbs += `<span class="sep">/</span><b>${p.name}</b>`;
  $('#crumbs').innerHTML = crumbs;

  /* ---------- spec rows ---------- */
  const rows = [];
  if (p.brand) rows.push(['برند', p.brand]);
  rows.push(['دسته‌بندی', p.path.join(' ‹ ')]);
  p.specs.forEach(s => {
    const i = s.indexOf(':');
    if (i > 0) { const k = s.slice(0, i).trim(); if (k !== 'برند') rows.push([k, s.slice(i + 1).trim()]); }
    else rows.push(['ویژگی', s]);
  });
  GROUPS.forEach(g => {
    const v = p.a[g.k];
    if (v && v.length && !rows.some(r => r[1] === v.join('، '))) rows.push([g.t, v.map(fa).join('، ')]);
  });
  if (p.vattrs) p.vattrs.forEach(a => rows.push([a.name, a.opts.map(fa).join('، ')]));

  /* ---------- markup ---------- */
  const stars = n => Array.from({ length: 5 }, (_, i) => `<svg style="opacity:${i < Math.round(n) ? 1 : .25}"><use href="#i-star"/></svg>`).join('');
  const starCount = 12 + (p.pop * 3) % 90;
  const dscBadge = p.disc && p.stock ? `<span class="off">٪${fa(p.disc)}</span>` : '';

  root.innerHTML = `
  <article class="pd product">
    <div class="pd-gal">
      <div class="main">${dscBadge}<svg class="pic" viewBox="0 0 64 64"><use href="#${p.icon}"/></svg></div>
      <div class="thumbs">${[0, 1, 2, 3].map(i => `<button type="button" class="${i === 0 ? 'on' : ''}" aria-label="تصویر ${fa(i + 1)}"><svg class="pic" viewBox="0 0 64 64"><use href="#${p.icon}"/></svg></button>`).join('')}</div>
    </div>
    <div class="pd-in">
      ${p.brand ? `<div class="br">${p.brand}</div>` : ''}
      <h1>${p.name}</h1>
      <div class="pd-meta">
        <span class="st">${stars(p.rate)} <span>${fa(p.rate)}</span></span>
        <span>(${fa(starCount)} دیدگاه)</span>
        <span>کد محصول: ${fa(p.id + 1000)}</span>
        <span class="${p.stock ? 'ok' : 'no'}" id="pdStock">${p.stock ? 'موجود در انبار' : 'ناموجود'}</span>
      </div>
      <div class="pd-price" id="pdPrice"></div>
      <ul class="pd-short">${p.specs.map(s => `<li>${s}</li>`).join('')}</ul>
      <form class="variations_form" id="pdForm" onsubmit="return false">
        ${p.variable && p.stock ? '<div class="vars" id="pdVars"></div>' : ''}
        <div class="pd-buy">
          ${p.stock ? `<div class="qty"><button type="button" id="qPlus" aria-label="افزایش"><svg class="i"><use href="#i-plus"/></svg></button><input id="qty" type="text" inputmode="numeric" value="${fa(1)}" aria-label="تعداد"><button type="button" id="qMinus" aria-label="کاهش"><svg class="i"><use href="#i-minus"/></svg></button></div>
          <button type="button" class="btn add-big" id="pdAdd"${p.variable ? ' disabled' : ''}><svg class="i"><use href="#i-cart"/></svg><span id="pdAddT">${p.variable ? 'گزینه‌ها را انتخاب کنید' : 'افزودن به سبد خرید'}</span></button>`
    : '<span class="btn line" style="cursor:default;flex:1">این محصول فعلاً ناموجود است</span>'}
          <button type="button" class="sq fav${store.fav().includes(p.id) ? ' on' : ''}" id="pdFav" aria-label="علاقه‌مندی"><svg class="i"><use href="#i-heart"/></svg></button>
          <button type="button" class="sq cmp${store.cmp().includes(p.id) ? ' on' : ''}" id="pdCmp" aria-label="مقایسه"><svg class="i"><use href="#i-compare"/></svg></button>
        </div>
      </form>
      <div class="pd-feat">
        <div><svg class="i"><use href="#i-truck"/></svg>ارسال به سراسر کشور</div>
        <div><svg class="i"><use href="#i-shield"/></svg>ضمانت اصالت کالا</div>
        <div><svg class="i"><use href="#i-card"/></svg>امکان پرداخت اقساطی</div>
      </div>
    </div>
  </article>

  <section>
    <div class="tabs" role="tablist">
      <button type="button" class="on" data-t="d">توضیحات</button>
      <button type="button" data-t="s">مشخصات</button>
      <button type="button" data-t="r">دیدگاه‌ها (${fa(starCount)})</button>
    </div>
    <div class="tabp on" id="t-d"><p>${p.name} از محصولات دسته‌ی «${p.path[p.path.length - 1]}» فروشگاه اینترنتی عبداللهی است. این کالا با ضمانت اصالت و امکان ارسال به سراسر کشور عرضه می‌شود. برای مشاوره‌ی خرید و اطلاع از موجودی دقیق می‌توانید با شماره‌ی <b>۰۹۱۳۰۷۷۲۸۰۹</b> تماس بگیرید.</p></div>
    <div class="tabp" id="t-s"><table class="spec-t">${rows.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('')}</table></div>
    <div class="tabp" id="t-r"><p>هنوز دیدگاهی ثبت نشده است. (در ووکامرس این بخش با فرم دیدگاه استاندارد جایگزین می‌شود.)</p></div>
  </section>

  <section class="rel" id="rel"></section>`;

  /* ---------- price / variation ---------- */
  const priceBox = $('#pdPrice');
  function renderPrice(st) {
    if (!p.stock) { priceBox.innerHTML = '<div class="row"><span class="n" style="font-size:18px;color:var(--mute)">ناموجود</span></div>'; return; }
    let h;
    if (p.variable) {
      const v = st && st.variation;
      h = `<div class="row">${priceHTML(p, st)}${p.disc && (!st || !st.full || (v && v.old)) ? `<span class="dsc">٪${fa(p.disc)}</span>` : ''}</div>`;
    }
    else h = `<div class="row">${p.disc ? `<span class="o">${money(p.old)}</span><span class="dsc">٪${fa(p.disc)}</span>` : ''}${priceHTML({ ...p, old: 0 })}</div>`;
    if (p.perInst) h += `<span class="ins">هر قسط ${money(p.perInst)} تومان</span>`;
    priceBox.innerHTML = h;
  }
  renderPrice(null);

  let state = null;
  if (p.variable && p.stock) {
    mountPicker(p, $('#pdVars'), st => {
      state = st;
      renderPrice(st);
      const b = $('#pdAdd');
      b.disabled = !st.full;
      $('#pdAddT').textContent = st.full ? 'افزودن به سبد خرید' : 'گزینه‌ها را انتخاب کنید';
    });
  }

  /* ---------- quantity / add to cart / fav / compare ---------- */
  const qty = $('#qty');
  const getQty = () => Math.max(1, Math.min(99, parseInt(String(qty.value).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)), 10) || 1));
  if (qty) {
    $('#qPlus').addEventListener('click', () => { qty.value = fa(Math.min(99, getQty() + 1)); });
    $('#qMinus').addEventListener('click', () => { qty.value = fa(Math.max(1, getQty() - 1)); });
    qty.addEventListener('change', () => { qty.value = fa(getQty()); });
    $('#pdAdd').addEventListener('click', e => {
      if (e.currentTarget.disabled) return;
      store.addCart(p.id, state && state.full ? state.vi : -1, getQty());
      say('به سبد خرید اضافه شد');
    });
  }
  $('#pdFav').addEventListener('click', e => {
    const on = store.toggle('fav', p.id);
    e.currentTarget.classList.toggle('on', on);
    say(on ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد');
  });
  $('#pdCmp').addEventListener('click', e => {
    if (!store.cmp().includes(p.id) && store.cmp().length >= 4) return say('حداکثر ۴ محصول را می‌توانید مقایسه کنید');
    const on = store.toggle('cmp', p.id);
    e.currentTarget.classList.toggle('on', on);
    say(on ? 'به مقایسه اضافه شد' : 'از مقایسه حذف شد');
  });

  /* ---------- tabs ---------- */
  document.querySelector('.tabs').addEventListener('click', e => {
    const b = e.target.closest('button[data-t]');
    if (!b) return;
    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('.tabp').forEach(x => x.classList.toggle('on', x.id === 't-' + b.dataset.t));
  });

  /* ---------- related products ---------- */
  const key = p.keys[p.keys.length - 1];
  let rel = PRODUCTS.filter(x => x.id !== p.id && x.keys.includes(key) && x.stock);
  if (rel.length < 3) rel = rel.concat(PRODUCTS.filter(x => x.id !== p.id && x.top === p.top && x.stock && !rel.includes(x)));
  rel = rel.slice(0, 3);
  if (rel.length) {
    $('#rel').innerHTML = `<div class="sh"><h2>محصولات مرتبط</h2><a href="shop.html?cat=${encodeURIComponent(key)}" class="more">مشاهده همه<svg class="i"><use href="#i-arrow"/></svg></a></div><div class="grid shop-grid" id="relGrid">${rel.map(x => cardHTML(x, { fav: new Set(store.fav()), cmp: new Set(store.cmp()) })).join('')}</div>`;
    $('#relGrid').addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      e.preventDefault();
      const rp = PRODUCTS.find(x => x.id === +btn.closest('.card').dataset.id);
      const act = btn.dataset.act;
      if (act === 'add') { store.addCart(rp.id, -1, 1); say('به سبد خرید اضافه شد'); }
      else if (act === 'fav') { const on = store.toggle('fav', rp.id); btn.classList.toggle('on', on); say(on ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد'); }
      else if (act === 'cmp') { const on = store.toggle('cmp', rp.id); btn.classList.toggle('on', on); say(on ? 'به مقایسه اضافه شد' : 'از مقایسه حذف شد'); }
      else location.href = 'product.html?id=' + rp.id;
    });
  }
})();
