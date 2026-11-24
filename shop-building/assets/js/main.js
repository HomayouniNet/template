/* =========================================================
   فروشگاه اینترنتی عبداللهی - اسکریپت صفحه‌ی اصلی
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = s => document.querySelector(s);
  const fa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const pad = n => fa(String(n).padStart(2, '0'));

  /* ---------- Products data ---------- */
  // [نام، برند، قیمت اصلی، قیمت با تخفیف، درصد تخفیف، آیکن]
  const PRODUCTS = [
    ['اجاق گاز رومیزی S513 ایلیا استیل', 'ایلیا استیل', '۴۶,۱۹۷,۰۰۰', '۳۴,۶۴۷,۷۵۰', 25, 'p-stove'],
    ['اجاق گاز شیشه‌ای G528 ایلیا استیل', 'ایلیا استیل', '۳۷,۵۲۶,۰۰۰', '۲۸,۱۴۴,۵۰۰', 25, 'p-stove'],
    ['اجاق گاز شیشه‌ای G401 ایلیا استیل', 'ایلیا استیل', '۲۹,۹۶۹,۰۰۰', '۲۲,۴۷۶,۷۵۰', 25, 'p-stove'],
    ['فر توکار برقی مدل IO 201 ایلیا استیل', 'ایلیا استیل', '۵۰,۸۷۹,۰۰۰', '۳۸,۱۵۹,۲۵۰', 25, 'p-oven'],
    ['شیر دوش ادرینا مدل میلان', 'ادرینا', '۱۰,۴۹۱,۰۰۰', '۸,۹۱۷,۳۵۰', 15, 'p-faucet'],
    ['شیر روشویی ادرینا مدل کلودی', 'ادرینا', '۸,۱۵۱,۰۰۰', '۶,۹۲۸,۳۵۰', 15, 'p-faucet'],
    ['سینک توکار ایلیا استیل مدل ۲۰۱۸', 'ایلیا استیل', '۱۸,۸۷۵,۰۰۰', '۱۴,۱۵۶,۲۵۰', 25, 'p-sink'],
    ['سینک توکار ایلیا استیل مدل ۲۰۲۰', 'ایلیا استیل', '۲۰,۳۹۱,۰۰۰', '۱۵,۲۹۳,۲۵۰', 25, 'p-sink']
  ];

  const productCard = p => `
    <article class="card">
      <div class="im"><span class="off">٪${fa(p[4])}</span>
        <button class="hrt" aria-label="علاقه‌مندی"><svg class="i"><use href="#i-heart"/></svg></button>
        <svg class="pic"><use href="#${p[5]}"/></svg></div>
      <div class="br">${p[1]}</div>
      <h3>${p[0]}</h3>
      <div class="pr">
        <div><span class="o">${p[2]}</span><span class="n">${p[3]}<small>تومان</small></span></div>
        <button class="add" aria-label="افزودن به سبد"><svg class="i"><use href="#i-cart"/></svg></button>
      </div>
      <div class="inst">پرداخت اقساطی</div>
    </article>`;

  const grid = $('#grid');
  if (grid) grid.innerHTML = PRODUCTS.map(productCard).join('');

  /* ---------- Toast + cart + favorites ---------- */
  const toast = $('#toast');
  let toastTimer, cartCount = 0, favCount = 0;

  function say(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  if (grid) {
    grid.addEventListener('click', e => {
      const add = e.target.closest('.add');
      const heart = e.target.closest('.hrt');

      if (add) {
        cartCount++;
        $('#cc').textContent = fa(cartCount);
        say('به سبد خرید اضافه شد');
      }
      if (heart) {
        const on = heart.classList.toggle('on');
        favCount += on ? 1 : -1;
        $('#fc').textContent = fa(favCount);
        say(on ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد');
      }
    });
  }

  /* ---------- Mobile drawer ---------- */
  const drawer = $('#drawer');
  $('#openMenu').addEventListener('click', () => drawer.classList.add('open'));
  [$('#dov'), $('#dx')].forEach(el => el.addEventListener('click', () => drawer.classList.remove('open')));
  drawer.querySelectorAll('.pn a').forEach(a => a.addEventListener('click', () => drawer.classList.remove('open')));

  /* ---------- Back to top ---------- */
  const toTop = $('#tt');
  addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > 600), { passive: true });
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Countdown (تا پایان هفته: جمعه ۲۳:۵۹:۵۹) ---------- */
  const end = new Date();
  end.setDate(end.getDate() + ((5 - end.getDay() + 7) % 7 || 7));
  end.setHours(23, 59, 59, 0);

  function tick() {
    let d = Math.max(0, end - Date.now());
    const days = Math.floor(d / 864e5); d -= days * 864e5;
    const hours = Math.floor(d / 36e5); d -= hours * 36e5;
    const mins = Math.floor(d / 6e4); d -= mins * 6e4;
    const secs = Math.floor(d / 1e3);
    $('#tD').textContent = pad(days);
    $('#tH').textContent = pad(hours);
    $('#tM').textContent = pad(mins);
    $('#tS').textContent = pad(secs);
  }
  tick();
  setInterval(tick, 1000);
})();
