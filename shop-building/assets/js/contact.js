/* =========================================================
   فروشگاه اینترنتی عبداللهی - فرم تماس (contact.html)
   در وردپرس: Contact Form 7 / WPForms
   ========================================================= */
(function () {
  'use strict';
  const C = window.CATALOG;
  const form = C.$('#ctForm');
  if (!form) return;
  const toEn = s => String(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const rules = {
    name: s => s.trim().length > 1,
    mobile: s => /^09\d{9}$/.test(toEn(s).trim()),
    msg: s => s.trim().length > 9
  };
  form.addEventListener('input', e => { const f = e.target.closest('[data-f]'); if (f) f.classList.remove('bad'); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    Object.keys(rules).forEach(k => {
      const el = form.elements[k], good = rules[k](el.value);
      el.closest('[data-f]').classList.toggle('bad', !good);
      ok = ok && good;
    });
    if (!ok) return C.say('لطفاً فیلدهای مشخص‌شده را اصلاح کنید');
    form.reset();
    C.say('پیام شما ارسال شد. به‌زودی با شما تماس می‌گیریم.');
  });
})();
