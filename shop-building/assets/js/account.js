/* =========================================================
   فروشگاه اینترنتی عبداللهی - حساب کاربری (account.html)
   ورود با کد پیامکی، داشبورد، سفارش‌ها، آدرس‌ها، علاقه‌مندی‌ها، جزئیات حساب
   در ووکامرس: woocommerce/myaccount/*  (ورود پیامکی با افزونه‌ی OTP)
   ========================================================= */
(function () {
  'use strict';
  const C = window.CATALOG;
  const { $, fa, money, store, PRODUCTS, cardHTML } = C;
  const root = $('#accRoot');
  const toEn = s => String(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const getAddr = () => { try { return JSON.parse(localStorage.getItem('ab_addr')) || null; } catch (e) { return null; } };

  const PANELS = [
    ['dashboard', 'داشبورد', 'i-home'],
    ['orders', 'سفارش‌ها', 'i-list'],
    ['addresses', 'آدرس‌ها', 'i-pin'],
    ['wishlist', 'علاقه‌مندی‌ها', 'i-heart'],
    ['details', 'جزئیات حساب', 'i-user']
  ];
  const panelId = () => { const h = location.hash.slice(1); return PANELS.some(p => p[0] === h) ? h : 'dashboard'; };

  /* ---------------- ورود ---------------- */
  function loginView() {
    root.innerHTML = `
    <div class="auth bx">
      <h2 style="text-align:center;font-size:20px;margin-bottom:6px">ورود / ثبت‌نام</h2>
      <p class="muted" style="text-align:center;font-size:13.5px;margin-bottom:20px">شماره‌ی موبایل خود را وارد کنید تا کد تأیید برایتان ارسال شود.</p>
      <form id="lg1" novalidate>
        <label class="fl" data-f="m"><span>شماره‌ی موبایل</span><input class="ltr" name="m" inputmode="numeric" placeholder="09123456789" autocomplete="tel"><em class="em">شماره‌ی موبایل معتبر وارد کنید.</em></label>
        <button class="btn" type="submit">دریافت کد تأیید</button>
      </form>
      <form id="lg2" novalidate hidden>
        <p class="hint" id="lgInfo" style="margin-bottom:12px"></p>
        <label class="fl" data-f="c"><span>کد تأیید</span><input class="ltr" name="c" inputmode="numeric" maxlength="5" placeholder="•••••" autocomplete="one-time-code"><em class="em">کد ۵ رقمی را وارد کنید.</em></label>
        <button class="btn" type="submit">ورود</button>
        <p class="sep2"><button type="button" id="lgBack" style="color:var(--primary);font-weight:700">ویرایش شماره</button></p>
        <p class="hint" style="text-align:center">کد نمونه: هر عدد ۵ رقمی (مثلاً ۱۲۳۴۵)</p>
      </form>
    </div>`;
    let mobile = '';
    $('#lg1').addEventListener('submit', e => {
      e.preventDefault();
      const m = toEn(e.target.m.value).trim();
      const wrap = e.target.querySelector('[data-f]');
      if (!/^09\d{9}$/.test(m)) { wrap.classList.add('bad'); return; }
      wrap.classList.remove('bad');
      mobile = m;
      e.target.hidden = true;
      $('#lg2').hidden = false;
      $('#lgInfo').textContent = `کد تأیید به شماره‌ی ${fa(m)} ارسال شد.`;
      $('#lg2').c.focus();
    });
    $('#lgBack').addEventListener('click', () => { $('#lg2').hidden = true; $('#lg1').hidden = false; });
    $('#lg2').addEventListener('submit', e => {
      e.preventDefault();
      const c = toEn(e.target.c.value).trim();
      const wrap = e.target.querySelector('[data-f]');
      if (!/^\d{5}$/.test(c)) { wrap.classList.add('bad'); return; }
      store.saveUser({ mobile, first: '', last: '', email: '' });
      C.say('با موفقیت وارد شدید');
      render();
    });
    root.addEventListener('input', e => { const f = e.target.closest('[data-f]'); if (f) f.classList.remove('bad'); });
  }

  /* ---------------- پنل‌ها ---------------- */
  const statusTag = s => `<span class="tag${s === 'تحویل شده' ? ' g' : ''}">${s}</span>`;
  const dFa = iso => new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

  function pDashboard(user) {
    const orders = store.orders();
    return `<div class="bx"><h2>سلام ${user.first ? user.first + ' ' + user.last : 'به حساب کاربری خود خوش آمدید'} 👋</h2>
      <p class="muted" style="line-height:2">از اینجا می‌توانید سفارش‌های اخیر، آدرس‌ها و محصولات مورد علاقه‌ی خود را مدیریت کنید.</p>
      <div class="kpis">
        <div class="kpi"><b>${fa(orders.length)}</b><span>سفارش ثبت‌شده</span></div>
        <div class="kpi"><b>${fa(store.fav().length)}</b><span>علاقه‌مندی</span></div>
        <div class="kpi"><b>${fa(store.cartCount())}</b><span>کالا در سبد خرید</span></div>
      </div>
    </div>`;
  }

  function pOrders() {
    const orders = store.orders();
    if (!orders.length) return `<div class="bx empty-pg"><svg class="pic"><use href="#p-box"/></svg><h2>هنوز سفارشی ثبت نکرده‌اید</h2><p>پس از اولین خرید، سفارش‌های شما اینجا نمایش داده می‌شود.</p><a href="shop.html" class="btn">مشاهده‌ی محصولات</a></div>`;
    return `<div class="bx"><h2>سفارش‌های من</h2><table class="tbl rsp"><thead><tr><th>شماره</th><th>تاریخ</th><th>وضعیت</th><th>مبلغ</th><th></th></tr></thead><tbody>
      ${orders.map(o => `<tr><td data-l="شماره">${fa(o.id)}</td><td data-l="تاریخ">${dFa(o.date)}</td><td data-l="وضعیت">${statusTag(o.status)}</td><td data-l="مبلغ">${money(o.totals.total)} تومان</td><td><a class="tag" href="order-received.html?o=${o.id}">مشاهده</a></td></tr>`).join('')}
      </tbody></table></div>`;
  }

  function pAddresses() {
    const a = getAddr();
    return `<div class="bx"><h2>آدرس‌ها</h2>${a
      ? `<div class="addr"><h4>آدرس ارسال و صورتحساب</h4>${a.first} ${a.last}<br>${a.province}، ${a.city}<br>${a.address}<br>کد پستی: ${fa(a.zip)} · موبایل: ${fa(a.mobile)}</div><p class="hint" style="margin-top:12px">آدرس بعد از ثبت سفارش بعدی به‌روز می‌شود.</p>`
      : `<p class="muted">هنوز آدرسی ثبت نشده است. آدرس شما هنگام ثبت اولین سفارش ذخیره می‌شود.</p>`}</div>`;
  }

  function wishlistHTML() {
    const ids = store.fav();
    const list = ids.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
    if (!list.length) return `<div class="bx empty-pg"><svg class="pic"><use href="#i-heart"/></svg><h2>لیست علاقه‌مندی‌ها خالی است</h2><p>با زدن قلب روی محصولات، آن‌ها را اینجا ذخیره کنید.</p><a href="shop.html" class="btn">مشاهده‌ی محصولات</a></div>`;
    return `<div class="bx"><h2>علاقه‌مندی‌ها (${fa(list.length)})</h2><div class="grid shop-grid" id="wGrid" style="grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">${list.map(p => cardHTML(p, { fav: new Set(ids), cmp: new Set(store.cmp()) })).join('')}</div></div>`;
  }

  function pDetails(user) {
    return `<div class="bx"><h2>جزئیات حساب</h2><form id="dtF" novalidate><div class="fg2">
      <label class="fl"><span>نام</span><input name="first" value="${user.first || ''}"></label>
      <label class="fl"><span>نام خانوادگی</span><input name="last" value="${user.last || ''}"></label>
      <label class="fl"><span>شماره‌ی موبایل</span><input class="ltr" value="${user.mobile || ''}" disabled></label>
      <label class="fl"><span>ایمیل</span><input class="ltr" name="email" value="${user.email || ''}"></label>
      </div><button class="btn" type="submit" style="margin-top:16px">ذخیره‌ی تغییرات</button></form></div>`;
  }

  function render() {
    const user = store.user();
    const id = panelId();
    if (!user) {
      if (location.hash === '#wishlist') {
        root.innerHTML = `<div>${wishlistHTML()}<p class="muted" style="margin-top:16px;text-align:center">برای مشاهده‌ی سفارش‌ها و حساب کاربری <a href="account.html" style="color:var(--primary);font-weight:700">وارد شوید</a>.</p></div>`;
        bindWish();
      } else loginView();
      return;
    }
    const ini = (user.first || 'ک').charAt(0);
    const body = { dashboard: pDashboard, orders: pOrders, addresses: pAddresses, wishlist: wishlistHTML, details: pDetails }[id](user);
    root.innerHTML = `<div class="acc-layout">
      <aside class="bx acc-nav" aria-label="حساب کاربری">
        <div class="acc-user"><span class="av">${ini}</span><span><b>${user.first ? user.first + ' ' + user.last : 'کاربر عزیز'}</b><small class="ltr" style="display:block;text-align:right">${fa(user.mobile)}</small></span></div>
        ${PANELS.map(p => `<a href="#${p[0]}" class="${p[0] === id ? 'on' : ''}"><svg class="i"><use href="#${p[2]}"/></svg>${p[1]}</a>`).join('')}
        <a href="#" class="out" id="logout"><svg class="i"><use href="#i-logout"/></svg>خروج</a>
      </aside>
      <div>${body}</div>
    </div>`;
    $('#logout').addEventListener('click', e => { e.preventDefault(); store.saveUser(null); location.hash = ''; render(); C.say('از حساب خارج شدید'); });
    const f = $('#dtF');
    if (f) f.addEventListener('submit', e => {
      e.preventDefault();
      store.saveUser({ ...user, first: f.first.value.trim(), last: f.last.value.trim(), email: f.email.value.trim() });
      C.say('تغییرات ذخیره شد');
      render();
    });
    if (id === 'wishlist') bindWish();
  }

  function bindWish() {
    const g = $('#wGrid');
    if (!g) return;
    g.addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      e.preventDefault();
      const p = PRODUCTS.find(x => x.id === +b.closest('.card').dataset.id), act = b.dataset.act;
      if (act === 'fav') { store.toggle('fav', p.id); render(); }
      else if (act === 'add') { store.addCart(p.id, -1, 1); C.say('به سبد خرید اضافه شد'); }
      else if (act === 'cmp') { const on = store.toggle('cmp', p.id); b.classList.toggle('on', on); }
      else location.href = 'product.html?id=' + p.id;
    });
  }

  addEventListener('hashchange', render);
  render();
})();
