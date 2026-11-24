/* =========================================================
   فروشگاه اینترنتی عبداللهی - تسویه‌حساب و صفحه‌ی «سفارش ثبت شد»
   checkout.html و order-received.html
   در ووکامرس: woocommerce/checkout/form-checkout.php و thankyou.php
   ========================================================= */
(function () {
  'use strict';
  const C = window.CATALOG;
  const { $, fa, money, store, cartLines, totals, SHIPS, COUPONS } = C;
  const root = $('#coRoot');
  const mode = root.dataset.mode;
  const u = '<small class="u">تومان</small>';
  const PAY = {
    online: { t: 'پرداخت آنلاین (درگاه بانکی)', d: 'پرداخت امن با کارت‌های عضو شتاب' },
    cod: { t: 'پرداخت در محل', d: 'فقط برای تحویل حضوری و پیک اصفهان' },
    credit: { t: 'خرید اقساطی', d: 'کارشناسان ما برای هماهنگی اقساط با شما تماس می‌گیرند' }
  };
  const PROVINCES = ['آذربایجان شرقی', 'آذربایجان غربی', 'اردبیل', 'اصفهان', 'البرز', 'ایلام', 'بوشهر', 'تهران', 'چهارمحال و بختیاری', 'خراسان جنوبی', 'خراسان رضوی', 'خراسان شمالی', 'خوزستان', 'زنجان', 'سمنان', 'سیستان و بلوچستان', 'فارس', 'قزوین', 'قم', 'کردستان', 'کرمان', 'کرمانشاه', 'کهگیلویه و بویراحمد', 'گلستان', 'گیلان', 'لرستان', 'مازندران', 'مرکزی', 'هرمزگان', 'همدان', 'یزد'];
  const toEn = s => String(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  let coupon = '';
  try { coupon = localStorage.getItem('ab_coupon') || ''; } catch (e) { /* ignore */ }

  const mini = l => `<div class="mini"><span class="th"><svg class="pic"><use href="#${l.p.icon}"/></svg></span><span class="nm">${l.p.name}<small>${l.label ? fa(l.label) + ' · ' : ''}${fa(l.qty)} عدد</small></span><span class="pp2">${money(l.total)}</span></div>`;

  /* ======================= صفحه‌ی تسویه‌حساب ======================= */
  if (mode === 'checkout') {
    const lines = cartLines();
    if (!lines.length) {
      root.innerHTML = `<div class="bx empty-pg"><svg class="pic"><use href="#p-box"/></svg><h2>سبد خرید شما خالی است</h2><p>برای ثبت سفارش ابتدا محصولی به سبد اضافه کنید.</p><a href="shop.html" class="btn">مشاهده‌ی محصولات</a></div>`;
      $('#steps').hidden = true;
      return;
    }
    const user = store.user() || {};
    const saved = (() => { try { return JSON.parse(localStorage.getItem('ab_addr')) || {}; } catch (e) { return {}; } })();
    const v = k => (saved[k] != null ? saved[k] : user[k]) || '';
    const state = { ship: 'courier', pay: 'online' };

    const fld = (name, label, opts = {}) => `<label class="fl${opts.full ? ' full' : ''}" data-f="${name}"><span>${label}${opts.req === false ? '' : ' <i>*</i>'}</span><input name="${name}" value="${v(name)}" ${opts.ltr ? 'class="ltr"' : ''} ${opts.type ? `type="${opts.type}"` : ''} ${opts.ph ? `placeholder="${opts.ph}"` : ''} autocomplete="${opts.ac || 'off'}"><em class="em">${opts.err || 'این فیلد الزامی است.'}</em></label>`;

    function draw() {
      const t = totals(lines, coupon, state.ship);
      const sum = $('#coSum');
      if (sum) {
        sum.innerHTML = `
          <h2>سفارش شما</h2>
          ${lines.map(mini).join('')}
          <div class="r" style="margin-top:8px"><span>جمع محصولات</span><b>${money(t.sub)}${u}</b></div>
          ${t.cd ? `<div class="r disc"><span>${COUPONS[coupon].title}</span><b>− ${money(t.cd)}${u}</b></div>` : ''}
          <div class="r"><span>هزینه‌ی ارسال</span><b>${SHIPS[state.ship].cod ? '<span style="font-size:12.5px;font-weight:600">پس‌کرایه</span>' : t.sp ? money(t.sp) + u : 'رایگان'}</b></div>
          <div class="r tt2"><span>مبلغ قابل پرداخت</span><b>${money(t.total)}${u}</b></div>
          <button type="submit" class="btn" id="place">ثبت سفارش و ${state.pay === 'online' ? 'پرداخت' : 'تکمیل خرید'}</button>
          <p class="hint" style="margin-top:10px;line-height:2">با ثبت سفارش، <a href="contact.html" style="color:var(--primary);text-decoration:underline">قوانین و مقررات</a> فروشگاه را می‌پذیرید.</p>`;
      }
    }

    root.innerHTML = `
    <form class="co-layout" id="coForm" novalidate>
      <div>
        <div class="bx co-sec">
          <h2>اطلاعات صورتحساب و ارسال</h2>
          <div class="fg2">
            ${fld('first', 'نام', { ac: 'given-name' })}
            ${fld('last', 'نام خانوادگی', { ac: 'family-name' })}
            ${fld('mobile', 'شماره‌ی موبایل', { ltr: true, ph: '09123456789', ac: 'tel', err: 'شماره‌ی موبایل معتبر وارد کنید (مثال: ۰۹۱۳۰۷۷۲۸۰۹).' })}
            ${fld('email', 'ایمیل (اختیاری)', { ltr: true, req: false, ac: 'email', err: 'ایمیل معتبر نیست.' })}
            <label class="fl" data-f="province"><span>استان <i>*</i></span><select name="province"><option value="">انتخاب کنید</option>${PROVINCES.map(p => `<option${(v('province') || 'اصفهان') === p ? ' selected' : ''}>${p}</option>`).join('')}</select><em class="em">استان را انتخاب کنید.</em></label>
            ${fld('city', 'شهر')}
            ${fld('address', 'آدرس کامل', { full: true, ac: 'street-address' })}
            ${fld('zip', 'کد پستی', { ltr: true, ph: '۱۰ رقم', err: 'کد پستی باید ۱۰ رقم باشد.' })}
            <label class="fl full"><span>توضیحات سفارش (اختیاری)</span><textarea name="note" placeholder="مثلاً زمان مناسب تحویل یا توضیحات ارسال"></textarea></label>
          </div>
        </div>
        <div class="bx co-sec">
          <h2>روش ارسال</h2>
          <div class="rads" id="shipR">${Object.keys(SHIPS).map(k => `<label class="rad"><input type="radio" name="ship" value="${k}"${k === state.ship ? ' checked' : ''}><span><b>${SHIPS[k].t}</b><small>${SHIPS[k].d}</small></span><span class="pr2">${SHIPS[k].cod ? 'پس‌کرایه' : SHIPS[k].price ? money(SHIPS[k].price) + ' تومان' : 'رایگان'}</span></label>`).join('')}</div>
        </div>
        <div class="bx co-sec">
          <h2>روش پرداخت</h2>
          <div class="rads" id="payR">${Object.keys(PAY).map(k => `<label class="rad"><input type="radio" name="pay" value="${k}"${k === state.pay ? ' checked' : ''}><span><b>${PAY[k].t}</b><small>${PAY[k].d}</small></span></label>`).join('')}</div>
        </div>
      </div>
      <aside class="bx sum" id="coSum"></aside>
    </form>`;
    draw();

    const form = $('#coForm');
    form.addEventListener('change', e => {
      if (e.target.name === 'ship') state.ship = e.target.value;
      if (e.target.name === 'pay') state.pay = e.target.value;
      draw();
    });
    const rules = {
      first: s => s.trim().length > 1, last: s => s.trim().length > 1,
      mobile: s => /^09\d{9}$/.test(toEn(s).trim()),
      email: s => !s.trim() || /^\S+@\S+\.\S+$/.test(s.trim()),
      province: s => !!s, city: s => s.trim().length > 1, address: s => s.trim().length > 9,
      zip: s => /^\d{10}$/.test(toEn(s).trim())
    };
    form.addEventListener('input', e => { const f = e.target.closest('[data-f]'); if (f) f.classList.remove('bad'); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      let first = null;
      Object.keys(rules).forEach(k => {
        const el = form.elements[k], wrap = el.closest('[data-f]');
        const ok = rules[k](el.value);
        wrap.classList.toggle('bad', !ok);
        if (!ok && !first) first = el;
      });
      if (first) { first.focus(); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); C.say('لطفاً فیلدهای مشخص‌شده را اصلاح کنید'); return; }
      const f = form.elements, data = {};
      ['first', 'last', 'mobile', 'email', 'province', 'city', 'address', 'zip', 'note'].forEach(k => { data[k] = f[k].value.trim(); });
      data.mobile = toEn(data.mobile); data.zip = toEn(data.zip);
      const t = totals(lines, coupon, state.ship);
      const order = {
        id: 'AB' + (Date.now() % 1000000 + 100000),
        date: new Date().toISOString(),
        status: state.pay === 'online' ? 'در انتظار پرداخت' : 'در حال بررسی',
        ship: state.ship, pay: state.pay, coupon: t.coupon, totals: t, addr: data,
        items: lines.map(l => ({ id: l.p.id, name: l.p.name, label: l.label, qty: l.qty, unit: l.unit, icon: l.p.icon }))
      };
      store.addOrder(order);
      try { localStorage.setItem('ab_addr', JSON.stringify(data)); localStorage.removeItem('ab_coupon'); } catch (er) { /* ignore */ }
      if (!store.user()) store.saveUser({ mobile: data.mobile, first: data.first, last: data.last, email: data.email });
      store.clearCart();
      location.href = 'order-received.html?o=' + order.id;
    });
    return;
  }

  /* ======================= صفحه‌ی سفارش ثبت شد ======================= */
  const oid = new URLSearchParams(location.search).get('o');
  const order = store.orders().find(o => o.id === oid) || store.orders()[0];
  if (!order) {
    root.innerHTML = `<div class="bx empty-pg"><svg class="pic"><use href="#p-box"/></svg><h2>سفارشی پیدا نشد</h2><p>هنوز سفارشی ثبت نکرده‌اید.</p><a href="shop.html" class="btn">مشاهده‌ی محصولات</a></div>`;
    return;
  }
  const t = order.totals, d = new Date(order.date);
  const dateFa = d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
  root.innerHTML = `
    <div class="bx done-box">
      <div class="ck"><svg class="i"><use href="#i-check"/></svg></div>
      <h1>سفارش شما با موفقیت ثبت شد</h1>
      <p class="muted">از خرید شما سپاسگزاریم. برای هماهنگی نهایی به‌زودی با شما تماس می‌گیریم.</p>
      <div class="odl">
        <div>شماره‌ی سفارش<b>${fa(order.id)}</b></div>
        <div>تاریخ<b>${dateFa}</b></div>
        <div>مبلغ کل<b>${money(t.total)} تومان</b></div>
        <div>روش پرداخت<b>${PAY[order.pay].t}</b></div>
      </div>
      <div style="text-align:right;max-width:640px;margin:0 auto 22px">${order.items.map(i => `<div class="mini"><span class="th"><svg class="pic"><use href="#${i.icon}"/></svg></span><span class="nm">${i.name}<small>${i.label ? fa(i.label) + ' · ' : ''}${fa(i.qty)} عدد</small></span><span class="pp2">${money(i.unit * i.qty)}</span></div>`).join('')}</div>
      <p class="muted" style="margin-bottom:18px;font-size:13.5px">ارسال به: ${order.addr.province}، ${order.addr.city}، ${order.addr.address}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a href="account.html#orders" class="btn">پیگیری سفارش‌ها</a><a href="shop.html" class="btn line">ادامه‌ی خرید</a></div>
    </div>`;
})();
