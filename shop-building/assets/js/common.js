/* =========================================================
   فروشگاه اینترنتی عبداللهی - اسکریپت مشترک همه‌ی صفحه‌ها
   منوی موبایل، دکمه‌ی بازگشت به بالا، جستجوی هدر، پیام (toast)،
   شمارنده‌ی سبد/علاقه‌مندی و نوار مقایسه
   (در قالب وردپرس: assets/js/common.js با wp_enqueue_script)
   ========================================================= */
(function () {
  'use strict';
  const C = window.CATALOG;
  const { $, fa, store } = C;

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let timer;
  C.say = function (msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };

  /* ---------- منوی موبایل ---------- */
  const drawer = $('#drawer');
  if (drawer) {
    $('#openMenu').addEventListener('click', () => drawer.classList.add('open'));
    [$('#dov'), $('#dx')].forEach(el => el && el.addEventListener('click', () => drawer.classList.remove('open')));
    addEventListener('keydown', e => { if (e.key === 'Escape') drawer.classList.remove('open'); });
  }

  /* ---------- بازگشت به بالا ---------- */
  const toTop = $('#tt');
  if (toTop) {
    addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > 600), { passive: true });
    toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- جستجوی هدر: انتقال به صفحه‌ی فروشگاه ---------- */
  const hs = $('#hSearch');
  if (hs && !document.body.hasAttribute('data-own-search')) {
    hs.addEventListener('submit', e => {
      e.preventDefault();
      const q = $('#hQ').value.trim();
      location.href = 'shop.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  }

  /* ---------- نوار مقایسه (وقتی محصولی برای مقایسه انتخاب شده) ---------- */
  function cmpBar() {
    if (document.body.hasAttribute('data-no-cmpbar')) return;
    const n = store.cmp().length;
    let bar = $('#cmpBar');
    if (!n) { if (bar) bar.remove(); return; }
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'cmpBar';
      bar.className = 'cmpbar';
      document.body.appendChild(bar);
    }
    bar.innerHTML = `<span><svg class="i"><use href="#i-compare"/></svg> ${fa(n)} محصول برای مقایسه انتخاب شده</span>
      <a class="btn o" href="compare.html">مشاهده‌ی مقایسه</a>
      <button type="button" class="cmpx" aria-label="پاک کردن">پاک کردن</button>`;
    bar.querySelector('.cmpx').onclick = () => { store.set('cmp', []); store.sync(); location.reload(); };
  }
  store.onSync = cmpBar;
  store.sync();
})();
