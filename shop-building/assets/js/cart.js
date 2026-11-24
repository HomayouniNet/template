/* =========================================================
   فروشگاه اینترنتی عبداللهی - سبد خرید (cart.html)
   در ووکامرس: woocommerce/cart/cart.php
   ========================================================= */
(function () {
  'use strict';
  const C = window.CATALOG;
  const { $, fa, money, store, cartLines, totals, COUPONS, PRODUCTS, cardHTML } = C;
  const root = $('#cartRoot');
  let coupon = '';
  try { coupon = localStorage.getItem('ab_coupon') || ''; } catch (e) { /* ignore */ }

  const unit = '<small class="u">تومان</small>';

  function lineHTML(l) {
    const href = `product.html?id=${l.p.id}`;
    return `<div class="cl" data-id="${l.p.id}" data-vi="${l.vi}">
      <a class="th" href="${href}"><svg class="pic"><use href="#${l.p.icon}"/></svg></a>
      <div>
        <div class="nm"><a href="${href}">${l.p.name}</a></div>
        ${l.label ? `<div class="vr">${fa(l.label)}</div>` : ''}
        <div class="un">قیمت واحد: ${money(l.unit)} تومان${l.old && l.old > l.unit ? `<s>${money(l.old)}</s>` : ''}</div>
      </div>
      <div class="ctl">
        <div class="tot">${money(l.total)}<small>تومان</small></div>
        <div class="ops">
          <div class="qty"><button type="button" data-q="1" aria-label="افزایش"><svg class="i"><use href="#i-plus"/></svg></button><input type="text" inputmode="numeric" value="${fa(l.qty)}" aria-label="تعداد" data-qi><button type="button" data-q="-1" aria-label="کاهش"><svg class="i"><use href="#i-minus"/></svg></button></div>
          <button type="button" class="rm" data-rm aria-label="حذف از سبد"><svg class="i"><use href="#i-trash"/></svg></button>
        </div>
      </div>
    </div>`;
  }

  function render() {
    const lines = cartLines();
    if (!lines.length) {
      root.innerHTML = `<div class="bx empty-pg"><svg class="pic"><use href="#p-box"/></svg><h2>سبد خرید شما خالی است</h2><p>برای افزودن محصول به فروشگاه سر بزنید.</p><a href="shop.html" class="btn">مشاهده‌ی محصولات</a></div>`;
      $('#steps').hidden = true;
      return;
    }
    const t = totals(lines, coupon, null);
    root.innerHTML = `
    <div class="cart-layout">
      <div>
        <div class="bx">
          <h2>محصولات سبد خرید (${fa(lines.reduce((s, l) => s + l.qty, 0))} عدد)</h2>
          ${lines.map(lineHTML).join('')}
        </div>
        <div class="cart-act">
          <a href="shop.html" class="btn line"><svg class="i" style="transform:scaleX(-1)"><use href="#i-arrow"/></svg>ادامه‌ی خرید</a>
          <button type="button" class="btn line" id="clr">خالی کردن سبد</button>
        </div>
      </div>
      <aside class="bx sum">
        <h2>خلاصه‌ی سفارش</h2>
        <div class="r"><span>جمع محصولات</span><b>${money(t.sub)}${unit}</b></div>
        ${t.saved ? `<div class="r disc"><span>سود شما از تخفیف محصولات</span><b>${money(t.saved)}${unit}</b></div>` : ''}
        ${t.cd ? `<div class="r disc"><span>${COUPONS[coupon].title} (${coupon})</span><b>− ${money(t.cd)}${unit}</b></div>` : ''}
        <div class="r"><span>هزینه‌ی ارسال</span><b class="muted" style="font-weight:600;font-size:13px">در مرحله‌ی بعد</b></div>
        <div class="cpn"><input class="in ltr" id="cpn" placeholder="کد تخفیف" value="${coupon}" autocomplete="off"><button type="button" class="btn line" id="cpnB">${coupon ? 'حذف' : 'اعمال'}</button></div>
        <div class="cpn-msg" id="cpnM">${coupon ? '<span class="ok-t">کد تخفیف اعمال شد.</span>' : '<span class="hint">کد تخفیف نمونه: SAZE10</span>'}</div>
        <div class="r tt2"><span>مبلغ قابل پرداخت</span><b>${money(t.total)}${unit}</b></div>
        <a href="checkout.html" class="btn">ادامه و ثبت سفارش<svg class="i"><use href="#i-arrow"/></svg></a>
      </aside>
    </div>`;
    $('#steps').hidden = false;
  }

  root.addEventListener('click', e => {
    const row = e.target.closest('.cl');
    if (row) {
      const id = +row.dataset.id, vi = +row.dataset.vi;
      const cur = store.get('cart').find(r => r.id === id && r.vi === vi);
      if (e.target.closest('[data-rm]')) { store.removeCart(id, vi); render(); C.say('محصول از سبد حذف شد'); return; }
      const q = e.target.closest('[data-q]');
      if (q && cur) { store.setQty(id, vi, Math.min(99, Math.max(1, cur.qty + (+q.dataset.q)))); render(); return; }
    }
    if (e.target.closest('#clr')) { store.clearCart(); render(); return; }
    if (e.target.closest('#cpnB')) {
      if (coupon) { coupon = ''; } else {
        const v = $('#cpn').value.trim().toUpperCase();
        if (!COUPONS[v]) { $('#cpnM').innerHTML = '<span class="err-t">کد تخفیف معتبر نیست.</span>'; return; }
        coupon = v;
      }
      try { localStorage.setItem('ab_coupon', coupon); } catch (er) { /* ignore */ }
      render();
    }
  });
  root.addEventListener('change', e => {
    const inp = e.target.closest('[data-qi]');
    if (!inp) return;
    const row = inp.closest('.cl');
    const n = parseInt(String(inp.value).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)), 10) || 1;
    store.setQty(+row.dataset.id, +row.dataset.vi, Math.min(99, Math.max(1, n)));
    render();
  });

  render();

  /* پیشنهاد محصولات */
  const sug = PRODUCTS.filter(p => p.stock && !p.variable && p.disc).slice(0, 3);
  $('#sug').innerHTML = `<div class="sh"><h2>شاید به این‌ها هم نیاز داشته باشید</h2><a href="shop.html" class="more">مشاهده همه<svg class="i"><use href="#i-arrow"/></svg></a></div><div class="grid shop-grid" id="sugGrid">${sug.map(p => cardHTML(p, { fav: new Set(store.fav()), cmp: new Set(store.cmp()) })).join('')}</div>`;
  $('#sugGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    e.preventDefault();
    const p = PRODUCTS.find(x => x.id === +b.closest('.card').dataset.id), act = b.dataset.act;
    if (act === 'add') { store.addCart(p.id, -1, 1); C.say('به سبد خرید اضافه شد'); render(); }
    else if (act === 'fav') { const on = store.toggle('fav', p.id); b.classList.toggle('on', on); }
    else if (act === 'cmp') { const on = store.toggle('cmp', p.id); b.classList.toggle('on', on); }
    else location.href = 'product.html?id=' + p.id;
  });
})();
