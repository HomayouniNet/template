/* =========================================================
   فروشگاه اینترنتی عبداللهی - مقالات (blog.html و post.html)
   در وردپرس: home.php / single.php (مطالب = Posts)
   ========================================================= */
(function () {
  'use strict';
  const C = window.CATALOG;
  const { $, fa } = C;

  const CATS = ['راهنمای خرید', 'آموزش و نگهداری', 'دکوراسیون'];
  const POSTS = [
    {
      id: 1, cat: 0, c: 0, icon: 'p-tile', date: '۲۹ مهر ۱۴۰۵', min: 6,
      title: 'راهنمای انتخاب سرامیک مناسب برای آشپزخانه و حمام',
      ex: 'ابعاد، لعاب، درجه‌ی کیفی و میزان جذب آب؛ چهار نکته‌ای که قبل از خرید سرامیک باید بدانید.',
      body: [
        ['p', 'انتخاب سرامیک برای فضاهای مرطوب مثل حمام و آشپزخانه فقط به ظاهر محدود نمی‌شود. لیز نبودن سطح، جذب آب پایین و مقاومت در برابر لکه از مهم‌ترین معیارهاست.'],
        ['h', '۱) ابعاد مناسب'],
        ['p', 'در فضاهای کوچک، سرامیک‌های بزرگ‌تر درز کمتری ایجاد می‌کنند و فضا را بازتر نشان می‌دهند. اما در کف حمام به‌دلیل شیب کفشور، ابعاد کوچک‌تر نصب راحت‌تری دارند.'],
        ['h', '۲) نوع لعاب'],
        ['ul', ['لعاب مات: لیزی کمتر و مناسب کف حمام و حیاط', 'لعاب براق: بازتاب نور بیشتر و مناسب دیوار', 'پولیش: ظاهر شیشه‌ای و مناسب پذیرایی']],
        ['h', '۳) درجه‌ی کیفی'],
        ['p', 'درجه‌ی یک بهترین کیفیت از نظر ابعاد و رنگ است. درجه‌ی دو برای پروژه‌هایی با بودجه‌ی محدودتر انتخاب مناسبی است، به‌شرط آنکه همه‌ی کارتن‌ها از یک بچ تولید باشند.'],
        ['q', 'نکته: همیشه ۵ تا ۱۰ درصد بیشتر از متراژ مورد نیاز سفارش دهید تا برای برش و ضایعات مشکلی نداشته باشید.']
      ]
    },
    {
      id: 2, cat: 0, c: 1, icon: 'p-tile', date: '۲۲ مهر ۱۴۰۵', min: 5,
      title: 'تفاوت کاشی، سرامیک و پرسلان چیست؟',
      ex: 'سه واژه‌ای که زیاد می‌شنوید ولی تفاوتشان را کمتر می‌دانید؛ از جنس بدنه تا جذب آب.',
      body: [
        ['p', 'در بازار ایران سه عبارت «کاشی»، «سرامیک» و «پرسلان» رایج است و بسیاری آن‌ها را مترادف می‌دانند؛ در حالی که از نظر بدنه و کاربرد تفاوت دارند.'],
        ['h', 'کاشی'],
        ['p', 'معمولاً برای دیوار استفاده می‌شود، بدنه‌ی متخلخل‌تری دارد و جذب آبش بیشتر است. برای کف مناسب نیست.'],
        ['h', 'سرامیک'],
        ['p', 'سرامیک بدنه‌ی سفید یا قرمز دارد و برای کف و دیوار فضاهای داخلی کاربرد دارد. قیمت مناسب و تنوع طرح بالایی دارد.'],
        ['h', 'پرسلان'],
        ['p', 'بدنه‌ی بسیار فشرده با جذب آب نزدیک به صفر دارد؛ مقاومت بالا در برابر سایش و یخ‌زدگی که آن را برای نما، پارکینگ و فضاهای پرتردد ایده‌آل می‌کند.']
      ]
    },
    {
      id: 3, cat: 0, c: 2, icon: 'p-faucet', date: '۱۵ مهر ۱۴۰۵', min: 5,
      title: 'چگونه شیرآلات باکیفیت را از بی‌کیفیت تشخیص دهیم؟',
      ex: 'جنس بدنه، نوع کارتریج و ضخامت آبکاری سه معیار اصلی کیفیت شیرآلات هستند.',
      body: [
        ['p', 'شیرآلات از معدود وسایلی هستند که روزانه بارها استفاده می‌شوند. خرید ارزان‌تر ممکن است در کوتاه‌مدت صرفه‌جویی باشد، اما نشتی و خرابی زودهنگام هزینه‌ی بیشتری ایجاد می‌کند.'],
        ['ul', ['بدنه‌ی برنجی یا برنز نسبت به آلیاژهای ارزان وزن بیشتری دارد', 'کارتریج سرامیکی با برند معتبر، عمر طولانی‌تری دارد', 'آبکاری یکنواخت و بدون حباب نشانه‌ی کیفیت ساخت است', 'گارانتی معتبر و خدمات پس از فروش را حتماً بررسی کنید']],
        ['p', 'پیشنهاد می‌کنیم قبل از خرید، از مشاوران فروشگاه برای تطبیق مدل شیر با نوع سینک یا روشویی خود راهنمایی بگیرید.']
      ]
    },
    {
      id: 4, cat: 0, c: 3, icon: 'p-sink', date: '۸ مهر ۱۴۰۵', min: 4,
      title: 'سینک توکار، روکار یا زیرسطحی؟ کدام را انتخاب کنیم؟',
      ex: 'مقایسه‌ی سه مدل رایج سینک ظرفشویی از نظر نصب، ظاهر و قیمت.',
      body: [
        ['p', 'نوع نصب سینک روی ظاهر آشپزخانه و راحتی کار روزانه اثر مستقیم دارد.'],
        ['h', 'توکار'],
        ['p', 'محبوب‌ترین مدل است؛ لبه‌ی سینک روی سطح کابینت قرار می‌گیرد و نصب ساده‌ای دارد.'],
        ['h', 'روکار'],
        ['p', 'بدون نیاز به برش سطح کابینت، مناسب آشپزخانه‌های کوچک و اجاره‌ای است.'],
        ['h', 'زیرسطحی (کورینی)'],
        ['p', 'سطح کانتر و سینک یکپارچه به نظر می‌رسد و تمیز کردن آن راحت‌تر است؛ البته به نصب دقیق‌تر و کانتر مقاوم نیاز دارد.']
      ]
    },
    {
      id: 5, cat: 0, c: 0, icon: 'p-oven', date: '۱ مهر ۱۴۰۵', min: 5,
      title: 'فر توکار یا فر روکار؟ راهنمای انتخاب',
      ex: 'اگر در حال طراحی آشپزخانه‌ی جدید هستید، پیش از خرید فر این نکات را بخوانید.',
      body: [
        ['p', 'فر توکار داخل کابینت نصب می‌شود و ظاهری یکپارچه دارد؛ فر روکار روی سطح قرار می‌گیرد و جابه‌جایی آن آسان‌تر است.'],
        ['ul', ['اندازه‌ی کابینت را قبل از خرید فر توکار اندازه بگیرید', 'فرهای ترکیبی (گازی و برقی) برای افراد حرفه‌ای‌تر مناسب‌اند', 'مصرف انرژی و تعداد برنامه‌های پخت را مقایسه کنید']],
        ['q', 'نکته: برای نصب فر توکار حتماً از اتصالات برق استاندارد و ارت‌دار استفاده کنید.']
      ]
    },
    {
      id: 6, cat: 1, c: 1, icon: 'p-box', date: '۲۴ شهریور ۱۴۰۵', min: 4,
      title: 'نکات نگهداری و شستشوی سرامیک و پرسلان',
      ex: 'با چند روش ساده، ظاهر سرامیک و پرسلان را سال‌ها مثل روز اول نگه دارید.',
      body: [
        ['p', 'شستشوی مداوم با مواد شوینده‌ی نامناسب باعث کدر شدن لعاب می‌شود. استفاده از شوینده‌ی خنثی بهترین انتخاب است.'],
        ['ul', ['از اسیدهای قوی روی درزها پرهیز کنید', 'برای لکه‌های سمج از جوش‌شیرین و پارچه‌ی نرم استفاده کنید', 'درز بین سرامیک‌ها را هر چند ماه یک بار بررسی کنید', 'زیر پایه‌ی مبلمان سنگین از لایی‌های نمدی استفاده کنید']],
        ['p', 'در حمام، تهویه‌ی مناسب از رشد کپک روی درزها جلوگیری می‌کند.']
      ]
    },
    {
      id: 7, cat: 2, c: 3, icon: 'p-tile', date: '۱۷ شهریور ۱۴۰۵', min: 5,
      title: 'اسلب پرسلان چیست و چه کاربردی دارد؟',
      ex: 'صفحات بزرگ پرسلان که کانتر آشپزخانه، دیوار و نمای ساختمان را متحول کرده‌اند.',
      body: [
        ['p', 'اسلب پرسلان صفحاتی در ابعاد بسیار بزرگ (مثل ۱۲۰×۲۴۰ یا ۱۲۰×۳۰۰ سانتی‌متر) است که با طرح سنگ یا مرمر تولید می‌شود.'],
        ['h', 'کاربردها'],
        ['ul', ['کانتر و سطح آشپزخانه', 'دیوار پذیرایی و حمام', 'نمای ساختمان و میز غذاخوری']],
        ['p', 'مزیت اصلی اسلب، درز بسیار کم و مقاومت بالا در برابر لک و خط‌وخش است.']
      ]
    },
    {
      id: 8, cat: 1, c: 2, icon: 'p-box', date: '۱۰ شهریور ۱۴۰۵', min: 3,
      title: 'متراژ سرامیک مورد نیاز را چطور حساب کنیم؟',
      ex: 'یک فرمول ساده برای برآورد تعداد کارتن سرامیک و درصد ضایعات.',
      body: [
        ['p', 'ابتدا طول و عرض فضا را در هم ضرب کنید تا متراژ به دست آید. سپس بسته به ابعاد سرامیک و نحوه‌ی نصب، بین ۵ تا ۱۰ درصد برای ضایعات اضافه کنید.'],
        ['q', 'برای محاسبه‌ی سریع، می‌توانید از «ماشین حساب نمایشگاه» فروشگاه عبداللهی استفاده کنید.'],
        ['p', 'اگر نصب به‌صورت اریب یا طرح‌دار انجام می‌شود، درصد ضایعات را تا ۱۵ درصد در نظر بگیرید.']
      ]
    }
  ];

  const cardHTML = p => `<article class="pcard"><a class="cv c${p.c}" href="post.html?id=${p.id}" aria-label="${p.title}"><svg class="pic"><use href="#${p.icon}"/></svg></a>
    <div class="tx"><div class="pm"><span class="tag">${CATS[p.cat]}</span><span>${p.date}</span></div>
    <h3><a href="post.html?id=${p.id}">${p.title}</a></h3><p>${p.ex}</p>
    <div class="pm"><span>مطالعه: ${fa(p.min)} دقیقه</span></div></div></article>`;

  const sideHTML = () => `
    <div class="bx"><h3>جستجو در مقالات</h3><form class="sbar" id="bSearch" onsubmit="return false"><input class="in" id="bQ" placeholder="عنوان مقاله …"><button aria-label="جستجو"><svg class="i"><use href="#i-search"/></svg></button></form></div>
    <div class="bx"><h3>دسته‌بندی</h3><ul>${CATS.map((c, i) => `<li><a href="blog.html?cat=${i}">${c}<span class="muted">${fa(POSTS.filter(p => p.cat === i).length)}</span></a></li>`).join('')}</ul></div>
    <div class="bx"><h3>تازه‌ترین مطالب</h3><ul>${POSTS.slice(0, 4).map(p => `<li><a href="post.html?id=${p.id}"><span>${p.title}</span></a></li>`).join('')}</ul></div>
    <div class="bx" style="background:var(--primary);color:#fff;border:0;text-align:center"><h3 style="color:#fff">ماشین حساب نمایشگاه</h3><p style="font-size:13px;opacity:.9;line-height:2;margin-bottom:12px">متراژ و تعداد کارتن سرامیک را سریع برآورد کنید.</p><a class="btn o" href="https://batmisaze.ir/mashin-hesab/" target="_blank" rel="noopener">ورود به ماشین حساب</a></div>`;

  /* ---------- لیست مقالات ---------- */
  const list = $('#blogList');
  if (list) {
    const params = new URLSearchParams(location.search);
    let cat = params.has('cat') ? +params.get('cat') : -1, q = '';
    $('#blogSide').innerHTML = sideHTML();
    const draw = () => {
      const items = POSTS.filter(p => (cat < 0 || p.cat === cat) && (!q || p.title.includes(q) || p.ex.includes(q)));
      $('#blogCats').innerHTML = `<button type="button" data-c="-1" class="${cat < 0 ? 'on' : ''}">همه</button>` + CATS.map((c, i) => `<button type="button" data-c="${i}" class="${cat === i ? 'on' : ''}">${c}</button>`).join('');
      if (!items.length) { list.innerHTML = '<div class="bx empty-pg"><h2>مقاله‌ای پیدا نشد</h2><p>عبارت دیگری را جستجو کنید.</p></div>'; return; }
      const f = items[0], rest = items.slice(1);
      list.innerHTML = `<article class="feat"><a class="cv c${f.c}" href="post.html?id=${f.id}"><svg class="pic"><use href="#${f.icon}"/></svg></a><div class="tx"><div class="pm"><span class="tag">${CATS[f.cat]}</span><span>${f.date}</span></div><h2><a href="post.html?id=${f.id}">${f.title}</a></h2><p>${f.ex}</p><a class="btn" href="post.html?id=${f.id}">ادامه‌ی مطلب</a></div></article>
        ${rest.length ? `<div class="post-grid">${rest.map(cardHTML).join('')}</div>` : ''}`;
    };
    $('#blogCats').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) { cat = +b.dataset.c; draw(); } });
    document.addEventListener('input', e => { if (e.target.id === 'bQ') { q = e.target.value.trim(); draw(); } });
    draw();
  }

  /* ---------- مقاله‌ی تکی ---------- */
  const art = $('#postRoot');
  if (art) {
    const id = +new URLSearchParams(location.search).get('id') || 1;
    const p = POSTS.find(x => x.id === id);
    $('#blogSide').innerHTML = sideHTML();
    if (!p) {
      art.innerHTML = '<div class="bx empty-pg"><h2>مقاله پیدا نشد</h2><a href="blog.html" class="btn">بازگشت به مقالات</a></div>';
    } else {
      document.title = p.title + ' | فروشگاه اینترنتی عبداللهی';
      $('#crumbs').innerHTML = `<a href="index3.html">خانه</a><span class="sep">/</span><a href="blog.html">مقالات</a><span class="sep">/</span><a href="blog.html?cat=${p.cat}">${CATS[p.cat]}</a><span class="sep">/</span><b>${p.title}</b>`;
      const txt = p.body.map(b => b[0] === 'p' ? `<p>${b[1]}</p>` : b[0] === 'h' ? `<h2>${b[1]}</h2>` : b[0] === 'q' ? `<blockquote>${b[1]}</blockquote>` : `<ul>${b[1].map(x => `<li>${x}</li>`).join('')}</ul>`).join('');
      const rel = POSTS.filter(x => x.id !== p.id).sort((a, b) => (b.cat === p.cat) - (a.cat === p.cat)).slice(0, 2);
      art.innerHTML = `<article class="article"><div class="cv c${p.c}"><svg class="pic"><use href="#${p.icon}"/></svg></div>
        <div class="bd"><div class="pm"><span class="tag">${CATS[p.cat]}</span><span>${p.date}</span><span>مطالعه: ${fa(p.min)} دقیقه</span></div>
        <h1>${p.title}</h1><div class="txt">${txt}</div>
        <div class="share"><span>اشتراک‌گذاری:</span><a href="#" aria-label="تلگرام"><svg class="i"><use href="#i-send"/></svg></a><a href="#" aria-label="واتساپ"><svg class="i"><use href="#i-wa"/></svg></a><a href="#" aria-label="ایتا"><svg class="i"><use href="#i-chat"/></svg></a></div></div></article>
        <div class="rel-p"><div class="sh"><h2>مطالب مرتبط</h2></div><div class="post-grid">${rel.map(cardHTML).join('')}</div></div>`;
    }
  }
})();
