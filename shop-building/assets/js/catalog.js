/* =========================================================
   فروشگاه اینترنتی عبداللهی - داده و ابزارهای مشترک (catalog.js)
   دسته‌ها، محصولات نمونه (با variation)، سبد/علاقه‌مندی، کارت محصول
   و انتخابگر variation که در صفحه‌ی فروشگاه و صفحه‌ی محصول مشترک است.

   نکته: داده‌ها نمونه (Demo) هستند. در ووکامرس این بخش با
   WP_Query / تابع wc_get_product() و ساختار محصول متغیر جایگزین می‌شود.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = s => document.querySelector(s);
  const fa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const money = n => fa(Math.round(n).toLocaleString('en-US'));
  const norm = s => String(s).toLowerCase()
    .replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\u200c/g, ' ')
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim();

  /* =========================================================
     1) Category tree
        [نام، تعداد محصول | زیرمجموعه‌ها، (اختیاری) محصولات مستقیم]
     ========================================================= */
  const TREE = [
    ['لوازم آشپزخانه', [
      ['آبچکان', 2],
      ['سینک', [['سینک تو کار', 10], ['سینک رو کار', 4], ['سینک گرانیتی', 3], ['سینک زیر سطحی (کورینی)', 2], ['سینک کلاسیک', 2]]],
      ['فر، گاز و هود', [
        ['مایکروویو', 3],
        ['اجاق گاز', [['اجاق گاز صفحه ای', [['اجاق گاز برقی', 4], ['اجاق گاز استیل', 8], ['اجاق گاز شیشه ای', 12]]]]],
        ['فر روکار', [['فر برقی', 3]]],
        ['هود', [['هود مخفی', 6], ['هود مورب', 5]]],
        ['فر توکار', [['فر ترکیبی (گازی و برقی)', 2], ['فر توکار برقی', 6]]]
      ]]
    ]],
    ['تاسیسات ساختمان', [
      ['سرمایشی گرمایشی', [['کولر آبی', 3], ['شوفاژ', 2], ['رادیاتور', 2], ['اسپلیت', 4]]],
      ['تصفیه آب و پمپ آب', 2]
    ]],
    ['سرویس حمام', [
      ['قفسه حوله', 2], ['کنج حمام', 3], ['حوله خشک کن', 3],
      ['وان و جکوزی', [['وان', 2], ['جکوزی', 3]]]
    ]],
    ['ست روشویی و اکسسوری', [['ست روشویی و کابینت', 8]]],
    ['سرویس بهداشتی', [
      ['جا مایع', 3], ['سطل و برس', 2],
      ['اکسسوری بهداشتی', [['سرویس 5 پارچه', 2], ['ست 3 پارچه', 2]]],
      ['جا دستمال', 2],
      ['چینی بهداشتی', [['توالت فرنگی', 6], ['توالت ایرانی', 4], ['والهنگ', 3]]],
      ['فلاش تانک', [['کلید فلاش تانک', 3], ['فلاش تانک روکار', 3], ['فلاش تانک توکار', 3]]]
    ]],
    ['کاشی، سرامیک و ملزومات', [
      ['قرنیز', 4], ['پرسلان', 10], ['سرامیک بدنه سفید', 24],
      ['ملزومات کاشی و سرامیک', [['کفشور', 5], ['همتراز', 1], ['چسب سرامیک و کاشی', 2], ['نوار کنج', 1]]],
      ['کاشی', 6], ['سرامیک بدنه قرمز', 6], ['اسلب', 5]
    ]],
    ['شیرآلات', [
      ['شیر آلات روکار', [
        ['شیر دیگ پر کن', 2], ['ظرفشویی شاوری', 2], ['شیر ظرفشویی دوکاره', 2], ['پیسوار', 1],
        ['روشویی ایستاده', 2], ['شیلنگ', 2], ['شیر روشویی', 8], ['شیر ظرفشویی', 8], ['شیر توالت', 6], ['شیر دوش', 8]
      ]],
      ['شیر آلات توکار', [['شیر توالت', 3], ['شیر دوش', 3], ['شیر روشویی', 3]]],
      ['علم دوش', [['پنل دوش', 2]], 3]
    ]],
    ['لوازم خانگی', [
      ['چای و قهوه ساز', 4], ['پنکه', 3], ['لباسشویی', 3],
      ['یخچال فریزر', [['دوقلو', 2], ['کمبی', 2]]],
      ['بخاری', 2], ['لوازم آرایشی و بهداشتی', 3], ['ماشین ظرفشویی', 2], ['آب سردکن', 2], ['ترازو', 2],
      ['صوتی و تصویری', 3], ['شستشو و نظافت', 3], ['لوازم پخت و پز', 4], ['نوشیدنی ساز', 2],
      ['خردکن و غذاساز', 3], ['اتو', 3]
    ]]
  ];

  const nodeMap = {};
  const leaves = [];
  function build(list, parent, level) {
    return list.map(([name, v, direct = 0]) => {
      const path = [...parent, name];
      const node = {
        name, path, key: path.join('/'), level, children: [],
        leaf: typeof v === 'number', count: typeof v === 'number' ? v : 0, direct
      };
      nodeMap[node.key] = node;
      if (Array.isArray(v)) node.children = build(v, path, level + 1);
      if (node.leaf || node.direct) leaves.push(node);
      return node;
    });
  }
  const ROOTS = build(TREE, [], 0);

  /* =========================================================
     2) Attribute filter groups (مطابق فیلترهای سایت اصلی)
     ========================================================= */
  const OPT = {
    sdim: ['40*40 سانتی متر', '50 در 100 سانتی متر', '50 در 116 سانتی متر', '50 در 120 سانتی متر', '50*105 سانتی متر', '50*50 سانتی متر', '50*80 سانتی متر', '52*120', '60 در 100 سامتی متر', '60 در 116 سانتی متر', '60 در 120 سانتی متر', '74*50 سانتی متر', '90*50 سانتی متر'],
    size: ['100*100', '100*40', '120*40', '120*60', '13*100', '160*80', '240*120', '270*120', '30*10', '30*30', '300*120', '50*50', '60*30', '60*60', '61*61', '80*80', '81*81', '90*30'],
    color: ['آبی', 'زرد', 'سبز', 'سفید', 'طلایی', 'طوسی تیره', 'طوسی روشن', 'طوسی و خاکستری', 'قرمز', 'قهوه ای', 'کرم و بژ', 'مشکی', 'نقره ای'],
    sthick: ['0.5 میلی متر', '0.7 میلی متر', '0.8 میلی متر', '1 میلی متر', '1.5 میلی متر'],
    sdir: ['لگن چپ، سینی راست', 'لگن راست، سینی چپ'],
    sdepth: ['15 سانتی متر', '17 سانتی متر', '20 سانتی متر', '22 سانتی متر', '25 سانتی متر'],
    grade: ['UN', 'درجه CM', 'درجه چهار', 'درجه دو', 'درجه سه', 'درجه یک', 'گرید A', 'گرید B', 'گرید C', 'گرید D'],
    body: ['پرسلان', 'سرامیک بدنه سفید', 'سرامیک بدنه قرمز', 'کاشی'],
    factory: ['آیداسرام', 'ارس', 'الوند', 'امین', 'باستان میبد', 'برج اردکان', 'بوم سرامیک', 'پارسیان', 'پردیس سرام', 'تکسرام', 'جواهر یزد', 'حافظ', 'درساسرام', 'دی', 'راک سرام', 'رزنتایل', 'ریباز', 'زئوس', 'ساناز', 'سرام برش', 'سمنان', 'سمنت سرام', 'سها سرام', 'شمس یزد', 'صبا کاشی', 'صدراسرام', 'ضامن پاژ', 'عقیق', 'فخار', 'فرزاد', 'فیورنزا', 'کارناوال لوکس', 'کاشی کسری', 'کژال سرام', 'کلایمبر', 'کوثر ابرکوه', 'گلدن سرام', 'لیماک', 'مریم', 'مهتاب', 'مهساسرام', 'نازسرام', 'نایین', 'نوین سرام', 'نیلو', 'هانیس', 'ونوس'],
    usage: ['آشپزخانه', 'بین کابینتی', 'پذیرایی', 'پله و زیرپله', 'تجاری و پارکینگ', 'حیاط', 'دستشویی و حمام', 'گوشه دیوار', 'مینیاتوری و استخری', 'نما و راهرو'],
    glaze: ['براق', 'پولیش', 'مات', 'نانو و سوپرپولیش'],
    design: ['تزئینی و سنتی', 'جدید', 'رستیک', 'ساده', 'طرح آجرنما', 'طرح سنگ', 'قدیم', 'کلکته', 'هندسی']
  };

  const GROUPS = [
    { k: 'sdim', t: 'ابعاد سینک' },
    { k: 'size', t: 'ابعاد سرامیک' },
    { k: 'color', t: 'رنگ سرامیک' },
    { k: 'sthick', t: 'ضخامت سینک' },
    { k: 'sdir', t: 'جهت لگن و سینی' },
    { k: 'sdepth', t: 'عمق لگن سینک' },
    { k: 'grade', t: 'درجه سرامیک' },
    { k: 'body', t: 'جنس بدنه سرامیک' },
    { k: 'factory', t: 'کارخانه سرامیک' },
    { k: 'usage', t: 'کاربری سرامیک' },
    { k: 'glaze', t: 'لعاب سرامیک' },
    { k: 'design', t: 'طرح سرامیک' }
  ].map(g => ({ ...g, o: OPT[g.k] }));

  /* =========================================================
     3) Demo products
     ========================================================= */
  function rng(seed) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const R = rng(1404);
  const pick = a => a[Math.floor(R() * a.length)];
  const between = (a, b) => a + Math.floor(R() * (b - a + 1));
  const rnd = (n, s) => Math.round(n / s) * s;
  const pickN = (a, n) => { const c = [...a], o = []; while (o.length < n && c.length) o.push(c.splice(Math.floor(R() * c.length), 1)[0]); return o; };
  const wpick = pairs => { let t = pairs.reduce((s, p) => s + p[1], 0), r = R() * t; for (const [v, w] of pairs) { if ((r -= w) <= 0) return v; } return pairs[0][0]; };

  const BRANDS = {
    'لوازم آشپزخانه': ['ایلیا استیل', 'اخوان', 'استیل البرز', 'بیمکث', 'داتیس', 'کن'],
    'تاسیسات ساختمان': ['پیشرو', 'ایران رادیاتور', 'گرین', 'سیمرغ', 'بوتان'],
    'سرویس حمام': ['سارانیک', 'آرین تکنیک', 'ایمن آب', 'آکوا', 'رویال'],
    'ست روشویی و اکسسوری': ['کاترین', 'آرتا', 'پارس', 'مهرنوش'],
    'سرویس بهداشتی': ['مروارید', 'ایمن آب', 'آرین تکنیک', 'گلسار فارس', 'ایران خزر'],
    'کاشی، سرامیک و ملزومات': ['آرین تکنیک', 'ایمن آب', 'رویال', 'ایران خزر'],
    'شیرآلات': ['ادرینا', 'طاها شیر', 'هوکولکس', 'شلر', 'راسان', 'کسری'],
    'لوازم خانگی': ['بیسمارک', 'اسنوا', 'پارس خزر', 'دوو', 'فکر', 'مایر']
  };
  const EXTRA = {
    'لوازم آشپزخانه': ['جنس: استیل', 'دارای گارانتی معتبر', 'ساخت ایران'],
    'تاسیسات ساختمان': ['دارای گارانتی', 'بهره‌وری انرژی بالا'],
    'سرویس حمام': ['جنس: آلومینیوم', 'رنگبندی متنوع'],
    'ست روشویی و اکسسوری': ['جنس: ام‌دی‌اف', 'دارای آینه و باکس'],
    'سرویس بهداشتی': ['درجه: یک', 'ساخت ایران'],
    'کاشی، سرامیک و ملزومات': ['جنس: استیل', 'کاربری: حمام و سرویس بهداشتی'],
    'شیرآلات': ['دارای ۱۰ سال گارانتی', 'مدل کارتریج: ساخت اسپانیا', 'رنگبندی: کروم و مشکی مات'],
    'لوازم خانگی': ['دارای گارانتی معتبر', 'ضمانت اصالت کالا']
  };
  const MODELS = ['کلودی', 'میلان', 'رومینا', 'پرستیژ', 'آتلانتیک', 'ونوس', 'اورانوس', 'دیانا', 'سوفیا', 'آلفا', 'نوین', 'ستایش', 'آرتین', 'پارمیس'];
  const CER_NAMES = ['توکا', 'تیفانی', 'فاوانیا', 'رویال', 'ریبون', 'مونا گلد', 'ساوج', 'آساره', 'سایا', 'شاین', 'سیروان', 'پیترا', 'امیلیا', 'فلورانس', 'ماهون', 'کلکته', 'یوتا', 'پانچ'];

  const PRICES = [
    ['آبچکان', 1e6, 3e6], ['سینک', 8e6, 26e6], ['اجاق', 12e6, 50e6], ['مایکروویو', 8e6, 20e6], ['هود', 8e6, 30e6],
    ['فر ترکیبی', 35e6, 60e6], ['فر توکار', 25e6, 60e6], ['فر برقی', 15e6, 35e6], ['کولر', 15e6, 45e6], ['اسپلیت', 35e6, 90e6],
    ['شوفاژ', 5e6, 25e6], ['رادیاتور', 5e6, 25e6], ['تصفیه', 8e6, 40e6], ['قفسه', 1e6, 4e6], ['کنج', 1e6, 4e6],
    ['حوله خشک', 3e6, 12e6], ['جکوزی', 60e6, 250e6], ['ست روشویی', 15e6, 60e6], ['جا مایع', .5e6, 3e6], ['سطل', .5e6, 2e6],
    ['سرویس 5', 3e6, 12e6], ['ست 3', 2e6, 8e6], ['جا دستمال', .4e6, 2e6], ['کلید فلاش', .5e6, 3e6], ['فلاش تانک', 2e6, 25e6],
    ['پنل دوش', 8e6, 40e6], ['علم دوش', 8e6, 40e6], ['شیلنگ', .3e6, 1.5e6], ['پیسوار', 2e6, 8e6], ['شیر', 3e6, 25e6],
    ['توالت', 6e6, 30e6], ['والهنگ', 8e6, 28e6], ['وان', 25e6, 90e6], ['کفشور', .8e6, 3e6], ['همتراز', .1e6, .5e6],
    ['چسب', .2e6, .6e6], ['نوار کنج', .1e6, .5e6], ['یخچال', 60e6, 250e6], ['لباسشویی', 40e6, 120e6], ['ماشین ظرفشویی', 60e6, 110e6],
    ['آب سردکن', 8e6, 30e6], ['پنکه', 2e6, 10e6], ['بخاری', 5e6, 25e6], ['چای', 3e6, 60e6], ['ترازو', .5e6, 3e6],
    ['صوتی', 2e6, 40e6], ['شستشو', 1e6, 20e6], ['پخت', 2e6, 30e6], ['نوشیدنی', 3e6, 40e6], ['خردکن', 2e6, 25e6],
    ['اتو', 1.5e6, 12e6], ['آرایشی', 1e6, 12e6]
  ];
  const priceRange = name => { const f = PRICES.find(p => name.includes(p[0])); return f ? [f[1], f[2]] : [1e6, 10e6]; };

  const ICONS = [
    ['سینک', 'p-sink'], ['اجاق', 'p-stove'], ['هود', 'p-hood'], ['مایکروویو', 'p-oven'], ['فر ', 'p-oven'], ['فر', 'p-oven'],
    ['شیر', 'p-faucet'], ['علم دوش', 'p-faucet'], ['پنل دوش', 'p-faucet'], ['پیسوار', 'p-faucet'], ['شیلنگ', 'p-faucet'],
    ['توالت', 'p-toilet'], ['والهنگ', 'p-toilet'], ['فلاش', 'p-toilet'], ['جا مایع', 'p-box'], ['سطل', 'p-box'], ['جا دستمال', 'p-box'], ['اکسسوری', 'p-box'], ['سرویس 5', 'p-box'], ['ست 3', 'p-box'],
    ['وان', 'p-bath'], ['جکوزی', 'p-bath'], ['کنج', 'p-bath'], ['قفسه', 'p-bath'], ['حوله', 'p-bath'],
    ['کولر', 'p-ac'], ['اسپلیت', 'p-ac'], ['شوفاژ', 'p-ac'], ['رادیاتور', 'p-ac'],
    ['روشویی', 'p-vanity'], ['یخچال', 'p-fridge'], ['لباسشویی', 'p-washer'], ['ظرفشویی', 'p-washer'],
    ['چای', 'p-coffee'], ['قهوه', 'p-coffee'], ['نوشیدنی', 'p-coffee'], ['پنکه', 'p-fan'],
    ['سرامیک', 'p-tile'], ['کاشی', 'p-tile'], ['پرسلان', 'p-tile'], ['قرنیز', 'p-tile'], ['اسلب', 'p-tile'],
    ['کفشور', 'p-tile'], ['همتراز', 'p-tile'], ['چسب', 'p-tile'], ['نوار', 'p-tile']
  ];
  const iconFor = text => (ICONS.find(i => text.includes(i[0])) || [0, 'p-box'])[1];

  const CER_LEAVES = ['قرنیز', 'پرسلان', 'سرامیک بدنه سفید', 'کاشی', 'سرامیک بدنه قرمز', 'اسلب'];
  const BIG_SIZES = ['13*100', '30*10', '240*120', '270*120', '300*120', '160*80'];
  const isCer = p => p[0] === 'کاشی، سرامیک و ملزومات' && CER_LEAVES.includes(p[p.length - 1]);
  const isSink = p => p.includes('سینک') && p.length === 3;

  const usedNames = new Set();
  const uniq = name => { let n = name, i = 2; while (usedNames.has(n)) n = name + ' ' + fa(i++); usedNames.add(n); return n; };

  function makeProduct(path, o) {
    const keys = path.map((_, i) => path.slice(0, i + 1).join('/'));
    const top = path[0];
    const iconText = path.join(' ') + ' ' + o.name;
    const stock = o.stock !== undefined ? o.stock : R() > 0.1;
    const p = {
      id: 0, name: uniq(o.name), keys, path,
      brand: o.brand || '', pmin: o.pmin, pmax: o.pmax || o.pmin,
      variable: !!(o.pmax && o.pmax !== o.pmin),
      old: o.old || 0, disc: o.disc || 0,
      stock, inst: o.inst !== false, perInst: o.perInst || 0,
      icon: iconFor(path[path.length - 1] + ' ' + o.name) || iconFor(iconText),
      specs: o.specs || [], a: o.a || {},
      pop: between(1, 100), rate: +(3.4 + R() * 1.6).toFixed(1),
      top
    };
    if (p.variable) addVariations(p);
    return p;
  }

  /* ----- محصول متغیر (Variable product): ویژگی‌ها + variationها ----- */
  const VATTR_BY_NAME = [
    ['بنیتا', [['رنگ', ['سفید کروم', 'کروم مات']]]],
    ['هیرا', [['رنگ', ['سفید کروم', 'سفید طلایی', 'مشکی طلایی مات']]]],
    ['اسپیدا', [['رنگ', ['کروم', 'مشکی مات', 'طلایی']]]]
  ];
  function defaultVattrs(path) {
    if (path[0] === 'شیرآلات') return [['رنگ', pickN(['کروم', 'مشکی مات', 'طلایی', 'سفید کروم'], between(2, 3))]];
    if (path.includes('ست روشویی و کابینت')) return [['رنگ', pickN(['سفید', 'مشکی', 'طوسی', 'قهوه ای'], between(2, 3))], ['اندازه', ['60 سانتی متر', '80 سانتی متر']]];
    return [['رنگ', pickN(['سفید', 'مشکی', 'طوسی'], 2)]];
  }
  function addVariations(p) {
    const found = VATTR_BY_NAME.find(v => p.name.includes(v[0]));
    const attrs = found ? found[1] : defaultVattrs(p.path);
    let combos = [{}];
    attrs.forEach(([n, opts]) => { combos = combos.flatMap(c => opts.map(o => ({ ...c, [n]: o }))); });
    const last = Math.max(1, combos.length - 1);
    p.vattrs = attrs.map(([name, opts]) => ({ name, opts }));
    p.vars = combos.map((attrs2, i) => {
      const price = i === 0 ? p.pmin : i === combos.length - 1 ? p.pmax : rnd(p.pmin + (p.pmax - p.pmin) * i / last, 1000);
      return {
        attrs: attrs2, price,
        old: p.disc ? rnd(price / (1 - p.disc / 100), 1000) : 0,   // قیمت قبل از تخفیف (regular_price)
        stock: p.stock && (i === 0 || R() > 0.15)
      };
    });
  }

  function discount(pmin, variable) {
    if (R() > 0.35) return {};
    const d = pick([5, 10, 15, 20, 25, 30]);
    return { disc: d, old: variable ? 0 : rnd(pmin / (1 - d / 100), 1000) };
  }

  function genCeramic(node) {
    const leaf = node.name;
    const sizes = leaf === 'قرنیز' ? ['13*100', '30*10']
      : leaf === 'اسلب' ? ['240*120', '270*120', '300*120', '160*80']
        : OPT.size.filter(s => !BIG_SIZES.includes(s));
    const size = pick(sizes);
    const [w, h] = size.split('*').map(Number);
    const factory = pick(OPT.factory), glaze = pick(OPT.glaze), design = pick(OPT.design), color = pick(OPT.color);
    const grade = wpick([['درجه دو', 40], ['درجه یک', 40], ['درجه سه', 12], ['درجه چهار', 5], ['گرید A', 2], ['UN', 1]]);
    const body = { 'پرسلان': 'پرسلان', 'کاشی': 'کاشی', 'سرامیک بدنه قرمز': 'سرامیک بدنه قرمز' }[leaf] || (leaf === 'اسلب' ? 'پرسلان' : 'سرامیک بدنه سفید');
    const usage = leaf === 'قرنیز' ? ['گوشه دیوار'] : pickN(OPT.usage.filter(u => u !== 'گوشه دیوار'), between(2, 4));
    const per = leaf === 'اسلب' ? 5.6e6 : leaf === 'قرنیز' ? 0.9e6 : between(12, 26) * 1e5;
    const price = Math.max(90000, rnd((w * h / 10000) * per, 1000));
    const word = leaf === 'پرسلان' ? 'پرسلان' : leaf === 'کاشی' ? 'کاشی' : leaf === 'اسلب' ? 'پرسلان اسلب' : leaf === 'قرنیز' ? 'قرنیز' : 'سرامیک';
    const gtxt = grade.startsWith('درجه') ? ' ' + grade : '';
    const name = `${word} ${pick(CER_NAMES)} ${glaze === 'نانو و سوپرپولیش' ? 'نانوپولیش' : glaze} ${factory}${gtxt} ${size}`;
    return makeProduct(node.path, {
      name, brand: factory, pmin: price, ...discount(price, false), perInst: R() > .5 ? rnd(price / 4, 250) : 0,
      specs: [`ابعاد: ${size}`, `برند: ${factory}`, `لعاب: ${glaze}`, `درجه: ${grade}`],
      a: { size: [size], color: [color], grade: [grade], body: [body], factory: [factory], usage, glaze: [glaze], design: [design] }
    });
  }

  function genSink(node) {
    const brand = pick(BRANDS['لوازم آشپزخانه']);
    const dim = pick(OPT.sdim), th = wpick([['0.8 میلی متر', 70], ['0.5 میلی متر', 8], ['0.7 میلی متر', 8], ['1 میلی متر', 10], ['1.5 میلی متر', 4]]);
    const dir = pick(OPT.sdir), depth = wpick([['20 سانتی متر', 60], ['22 سانتی متر', 15], ['15 سانتی متر', 10], ['17 سانتی متر', 10], ['25 سانتی متر', 5]]);
    const [a, b] = priceRange('سینک');
    const price = rnd(a + R() * (b - a), 1000);
    return makeProduct(node.path, {
      name: `${node.name} ${brand} مدل ${pick(MODELS)} ${between(100, 900)}`, brand, pmin: price, ...discount(price, false),
      specs: [`برند: ${brand}`, `ابعاد: ${dim}`, `ضخامت: ${th}`, `عمق لگن: ${depth}`],
      a: { sdim: [dim], sthick: [th], sdir: [dir], sdepth: [depth] }
    });
  }

  function genGeneric(node) {
    const top = node.path[0];
    const brand = pick(BRANDS[top]);
    const [a, b] = priceRange(node.name);
    const pmin = rnd(a + R() * (b - a), 1000);
    const variable = /شیر|فلاش|ست|وان/.test(node.name) && R() < 0.4;
    const pmax = variable ? rnd(pmin * (1.1 + R() * .6), 1000) : 0;
    return makeProduct(node.path, {
      name: `${node.name} ${brand} مدل ${pick(MODELS)}${R() < .5 ? ' ' + between(100, 900) : ''}`,
      brand, pmin, pmax, ...discount(pmin, variable),
      perInst: !variable && R() > .5 ? rnd(pmin / 4, 250) : 0,
      specs: [`برند: ${brand}`, pick(EXTRA[top])]
    });
  }

  /* ----- محصولات واقعی (نمونه‌ی صفحه‌ی اصلی و فروشگاه) ----- */
  const KC = 'کاشی، سرامیک و ملزومات';
  const cer = (size, factory, grade, glaze, color, design, body, usage) => ({
    a: { size: [size], color: [color], grade: [grade], body: [body], factory: [factory], usage, glaze: [glaze], design: Array.isArray(design) ? design : [design] },
    specs: [`ابعاد: ${size}`, `برند: ${factory}`, `لعاب: ${glaze}`, `درجه: ${grade}`], brand: factory
  });
  const sink = (dim, brand) => ({
    a: { sdim: [dim], sthick: ['0.8 میلی متر'], sdir: ['لگن چپ، سینی راست'], sdepth: ['20 سانتی متر'] },
    specs: [`برند: ${brand}`, `ابعاد: ${dim}`, 'ضخامت: 0.8 میلی متر', 'عمق لگن: 20 سانتی متر'], brand
  });
  const faucetSpecs = (brand, extra) => ({ brand, specs: [`برند: ${brand}`, ...extra] });
  const ROU = ['شیرآلات', 'شیر آلات روکار'];

  const REAL = [
    [['لوازم آشپزخانه', 'فر، گاز و هود', 'اجاق گاز', 'اجاق گاز صفحه ای', 'اجاق گاز استیل'], 'اجاق گاز رومیزی S513 ایلیا استیل', 34647750, 0, { old: 46197000, disc: 25, brand: 'ایلیا استیل', specs: ['برند: ایلیا استیل', 'جنس: استیل', 'دارای گارانتی معتبر'] }],
    [['لوازم آشپزخانه', 'فر، گاز و هود', 'اجاق گاز', 'اجاق گاز صفحه ای', 'اجاق گاز شیشه ای'], 'اجاق گاز شیشه ای G528 ایلیا استیل', 28144500, 0, { old: 37526000, disc: 25, brand: 'ایلیا استیل', specs: ['برند: ایلیا استیل', 'صفحه: شیشه‌ای', 'دارای گارانتی معتبر'] }],
    [['لوازم آشپزخانه', 'فر، گاز و هود', 'اجاق گاز', 'اجاق گاز صفحه ای', 'اجاق گاز شیشه ای'], 'اجاق گاز شیشه ای G401 ایلیا استیل', 22476750, 0, { old: 29969000, disc: 25, brand: 'ایلیا استیل', specs: ['برند: ایلیا استیل', 'صفحه: شیشه‌ای', 'دارای گارانتی معتبر'] }],
    [['لوازم آشپزخانه', 'فر، گاز و هود', 'فر توکار', 'فر توکار برقی'], 'فر توکار برقی مدل IO 201 ایلیا استیل', 38159250, 0, { old: 50879000, disc: 25, brand: 'ایلیا استیل', specs: ['برند: ایلیا استیل', 'نوع: توکار برقی'] }],
    [[...ROU, 'شیر دوش'], 'شیر دوش ادرینا مدل میلان', 8917350, 9692000, { disc: 15, ...faucetSpecs('ادرینا', ['مدل: میلان', 'دارای گارانتی']) }],
    [[...ROU, 'شیر روشویی'], 'شیر روشویی ادرینا مدل کلودی', 6928350, 0, { old: 8151000, disc: 15, ...faucetSpecs('ادرینا', ['مدل: کلودی', 'دارای گارانتی']) }],
    [[...ROU, 'شیر دوش'], 'شیر دوش ادرینا مدل کلودی', 7359300, 0, { old: 8658000, disc: 15, ...faucetSpecs('ادرینا', ['مدل: کلودی', 'دارای گارانتی']) }],
    [[...ROU, 'شیر توالت'], 'شیر توالت ادرینا مدل کلودی', 6590050, 0, { old: 7753000, disc: 15, ...faucetSpecs('ادرینا', ['مدل: کلودی', 'دارای گارانتی']) }],
    [['لوازم آشپزخانه', 'سینک', 'سینک تو کار'], 'سینک توکار ایلیا استیل مدل ۲۰۱۸', 14156250, 0, { old: 18875000, disc: 25, ...sink('50 در 116 سانتی متر', 'ایلیا استیل') }],
    [['لوازم آشپزخانه', 'سینک', 'سینک تو کار'], 'سینک توکار ایلیا استیل مدل ۲۰۲۰', 15293250, 0, { old: 20391000, disc: 25, ...sink('60 در 120 سانتی متر', 'ایلیا استیل') }],
    [[...ROU, 'شیر توالت'], 'شیر توالت طاها شیر _ هوکولکس بنیتا (۵۰۶)', 16400000, 19200000, faucetSpecs('طاها شیر', ['رنگبندی: سفید کروم و کروم مات', 'مدل کارتریج: ساخت اسپانیا', 'دارای ۱۰ سال گارانتی'])],
    [[...ROU, 'شیر دوش'], 'شیر حمام مدل بنیتا طاها شیر _ هوکولکس (۵۰۶-306)', 21900000, 24600000, faucetSpecs('طاها شیر', ['رنگبندی: سفید کروم و کروم مات', 'مدل کارتریج: ساخت اسپانیا', 'دارای ۱۰ سال گارانتی'])],
    [[...ROU, 'شیر روشویی'], 'شیر روشویی طاها شیر _ هوکولکس هیرا', 12400000, 21600000, faucetSpecs('طاها شیر', ['رنگبندی: سفید کروم، سفید طلایی، مشکی طلایی مات', 'مدل کارتریج: ساخت اسپانیا', 'دارای ۱۰ سال گارانتی'])],
    [['شیرآلات', 'شیر آلات توکار', 'شیر روشویی'], 'روشویی توکار طاها شیر _ هوکولکس اسپیدا (۵۰۹) + جعبه انتظار', 26900000, 30000000, faucetSpecs('هوکولکس', ['مدل کارتریج: ساخت اسپانیا', 'دارای ۱۰ سال گارانتی'])],
    [['سرویس بهداشتی', 'چینی بهداشتی', 'توالت ایرانی'], 'سنگ توالت مروارید مدل مگا', 7051000, 8921000, { perInst: 262500, ...faucetSpecs('مروارید', ['طراحی توالت: غیر طبی', 'درجه: یک و دو و سه']) }],
    [['سرویس حمام', 'کنج حمام'], 'کنج آلومینیوم ۲طبقه/مفتولی B۲', 1050000, 1200000, { specs: ['جنس: آلومینیوم', 'درجه: یک', 'رنگبندی: طلایی، سیلور و سفید'] }],
    [[KC, 'سرامیک بدنه سفید'], 'بدنه سفید بتی طوسی پولیش (برند climber) درجه دو ۱۰۰*۱۰۰', 1555000, 0, cer('100*100', 'کلایمبر', 'درجه دو', 'پولیش', 'طوسی و خاکستری', 'ساده', 'سرامیک بدنه سفید', ['پذیرایی', 'نما و راهرو'])],
    [['سرویس بهداشتی', 'چینی بهداشتی', 'والهنگ'], 'اکسسوری استراکچر والهنگ (شیر برنجی) ایمن آب مدل WT۲۱', 24800000, 0, { perInst: 540000, ...faucetSpecs('ایمن آب', ['نوع نصب: توکار', 'سیستم فلاشینگ: دو زمانه']) }],
    [[KC, 'ملزومات کاشی و سرامیک', 'کفشور'], 'کفشور خطی استیل 60 سانت مشبک طرح A خروجی کنار مدل آرین BS-SM', 2160000, 0, { perInst: 540000, ...faucetSpecs('آرین تکنیک', ['جنس: تمام استیل', 'طول: ۶۰ سانتی‌متر']) }],
    [['سرویس بهداشتی', 'چینی بهداشتی', 'توالت فرنگی'], 'توالت فرنگی نسکافه ای مات مروارید مدل ورونا ۶۱', 28270000, 0, { inst: false, ...faucetSpecs('مروارید', ['رنگ: نسکافه‌ای مات', 'جنس بدنه: سرامیک', 'خروجی سیفون: به کف']) }],
    [['لوازم خانگی', 'چای و قهوه ساز'], 'دستگاه اسپرسوساز بیسمارک مدل BM۱۰۱-BM ۸۵۰', 59726000, 0, { perInst: 281000, ...faucetSpecs('بیسمارک', ['فشار بخار: ۲۰ بار', 'توان مصرفی: ۲۰۰۰ وات']) }],
    [[KC, 'سرامیک بدنه سفید'], 'سرامیک صدرا سرام مدل توکا براق 40*120', 1124000, 0, { perInst: 442000, ...cer('120*40', 'صدراسرام', 'درجه دو', 'براق', 'سفید', 'ساده', 'سرامیک بدنه سفید', ['حیاط', 'بین کابینتی', 'پله و زیرپله', 'تجاری و پارکینگ']) }],
    [[KC, 'سرامیک بدنه سفید'], 'سرامیک صدرا سرام مدل تیفانی نانوپولیش 120*60', 1768000, 0, { perInst: 415000, ...cer('120*60', 'صدراسرام', 'درجه دو', 'نانو و سوپرپولیش', 'طوسی و خاکستری', ['رستیک', 'طرح سنگ'], 'سرامیک بدنه سفید', ['دستشویی و حمام', 'پذیرایی', 'آشپزخانه', 'نما و راهرو', 'تجاری و پارکینگ']) }],
    [[KC, 'سرامیک بدنه سفید'], 'سرامیک صدرا سرام مدل فاوانیا روشن نانوپولیش 120*60', 1660000, 0, { perInst: 247500, ...cer('120*60', 'صدراسرام', 'درجه یک', 'نانو و سوپرپولیش', 'طوسی روشن', ['رستیک', 'طرح سنگ'], 'سرامیک بدنه سفید', ['دستشویی و حمام', 'پذیرایی', 'آشپزخانه', 'نما و راهرو', 'تجاری و پارکینگ']) }],
    [[KC, 'سرامیک بدنه سفید'], 'سرامیک ضامن پاژ مدل رویال طوسی تیره مات 120*60', 990000, 0, { perInst: 23500, ...cer('120*60', 'ضامن پاژ', 'درجه یک', 'مات', 'طوسی تیره', ['رستیک', 'طرح سنگ'], 'سرامیک بدنه سفید', ['دستشویی و حمام', 'پذیرایی', 'آشپزخانه', 'نما و راهرو', 'تجاری و پارکینگ']) }],
    [[KC, 'قرنیز'], 'قرنیز بدنه سفید گلدن سرام 13*100', 94000, 0, { perInst: 155250, ...cer('13*100', 'گلدن سرام', 'درجه یک', 'براق', 'سفید', 'رستیک', 'سرامیک بدنه سفید', ['گوشه دیوار']) }],
    [[KC, 'کاشی'], 'کاشی مریم مدل هانول دکور براق ۳۰*۹۰', 621000, 0, { perInst: 242500, ...cer('90*30', 'مریم', 'گرید A', 'براق', 'سفید', 'ساده', 'کاشی', ['دستشویی و حمام', 'آشپزخانه', 'بین کابینتی']) }],
    [['ست روشویی و اکسسوری', 'ست روشویی و کابینت'], 'کابینت روشویی فول ست مشکی کاترین مدل پرتو 80', 44900000, 0, { perInst: 106250, ...faucetSpecs('کاترین', ['نوع: فول‌ست کابینت روشویی', 'رنگ: مشکی', 'دارای آینه']) }],
    [[KC, 'اسلب'], 'پرسلان اسلب ماهون طوسی روشن کاشی زئوس ۱۲۰*۲۴۰', 3599000, 0, { perInst: 388750, ...cer('240*120', 'زئوس', 'درجه یک', 'پولیش', 'طوسی روشن', 'طرح سنگ', 'پرسلان', ['پذیرایی', 'نما و راهرو']) }]
  ];

  const PRODUCTS = [];
  REAL.forEach(([path, name, pmin, pmax, ex], i) => {
    const p = makeProduct(path, { name, pmin, pmax, ...ex, stock: true });
    p.id = 2000 - i;
    PRODUCTS.push(p);
  });

  const generated = [];
  leaves.forEach(node => {
    const n = (node.leaf ? node.count : 0) + node.direct;
    const realCount = REAL.filter(r => r[0].join('/') === node.key).length;
    for (let i = 0; i < Math.max(0, n - realCount); i++) {
      generated.push(isCer(node.path) ? genCeramic(node) : isSink(node.path) ? genSink(node) : genGeneric(node));
    }
  });
  for (let i = generated.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [generated[i], generated[j]] = [generated[j], generated[i]]; }
  generated.forEach((p, i) => { p.id = i + 1; p.nname = ''; PRODUCTS.push(p); });
  PRODUCTS.forEach(p => { p.nname = norm(p.name + ' ' + p.brand); });

  /* =========================================================
     Store: علاقه‌مندی، مقایسه و سبد خرید (ذخیره در localStorage)
     در ووکامرس: WC()->cart و wishlist افزونه
     ========================================================= */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem('ab_' + k)) || []; } catch (e) { return []; } },
    set(k, v) { try { localStorage.setItem('ab_' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    fav() { return this.get('fav'); },
    cmp() { return this.get('cmp'); },
    toggle(k, id) {
      const a = this.get(k), i = a.indexOf(id);
      i < 0 ? a.push(id) : a.splice(i, 1);
      this.set(k, a); this.sync();
      return i < 0;
    },
    addCart(id, vi, qty) {
      const a = this.get('cart'), q = qty || 1;
      const row = a.find(r => r.id === id && r.vi === (vi == null ? -1 : vi));
      row ? row.qty += q : a.push({ id, vi: vi == null ? -1 : vi, qty: q });
      this.set('cart', a); this.sync();
    },
    setQty(id, vi, qty) {
      const k = vi == null ? -1 : vi;
      let a = this.get('cart');
      const row = a.find(r => r.id === id && r.vi === k);
      if (row) row.qty = qty;
      a = a.filter(r => r.qty > 0);
      this.set('cart', a); this.sync();
    },
    removeCart(id, vi) { this.setQty(id, vi, 0); },
    clearCart() { this.set('cart', []); this.sync(); },
    cartCount() { return this.get('cart').reduce((s, r) => s + r.qty, 0); },
    user() { try { return JSON.parse(localStorage.getItem('ab_user')) || null; } catch (e) { return null; } },
    saveUser(u) { try { u ? localStorage.setItem('ab_user', JSON.stringify(u)) : localStorage.removeItem('ab_user'); } catch (e) { /* ignore */ } },
    orders() { return this.get('orders'); },
    addOrder(o) { const a = this.orders(); a.unshift(o); this.set('orders', a); },
    sync() {
      const f = $('#fc'), c = $('#cc');
      if (f) f.textContent = fa(this.fav().length);
      if (c) c.textContent = fa(this.cartCount());
      if (this.onSync) this.onSync();
    }
  };

  /* سطرهای سبد خرید (محصول، variation، قیمت واحد و جمع) */
  function cartLines() {
    return store.get('cart').map(r => {
      const p = PRODUCTS.find(x => x.id === r.id);
      if (!p) return null;
      const v = r.vi >= 0 && p.vars ? p.vars[r.vi] : null;
      const unit = v ? v.price : p.pmin, old = v ? v.old : p.old;
      return {
        p, v, vi: r.vi, qty: r.qty, unit, old,
        label: v ? Object.keys(v.attrs).map(k => `${k}: ${v.attrs[k]}`).join('، ') : '',
        total: unit * r.qty
      };
    }).filter(Boolean);
  }

  /* کد تخفیف نمونه (در ووکامرس: کوپن) */
  const COUPONS = { SAZE10: { pct: 10, title: 'کد تخفیف ۱۰٪' } };

  /* روش‌های ارسال نمونه (در ووکامرس: Shipping Zones/Methods) */
  const SHIPS = {
    pickup: { t: 'تحویل حضوری از فروشگاه', d: 'اصفهان، نجف‌آباد، بلوار دانشگاه آزاد، جنب پل دانشگاه', price: 0 },
    truck: { t: 'ارسال با باربری (پس‌کرایه)', d: 'کرایه‌ی حمل هنگام تحویل بار به باربری پرداخت می‌شود. مناسب سرامیک و کالاهای حجیم.', price: 0 },
    courier: { t: 'پیک اختصاصی (اصفهان و نجف‌آباد)', d: 'ارسال همان روز برای سفارش‌های داخل شهر', price: 150000 }
  };

  function totals(lines, coupon, ship) {
    const sub = lines.reduce((s, l) => s + l.total, 0);
    const saved = lines.reduce((s, l) => s + (l.old && l.old > l.unit ? (l.old - l.unit) * l.qty : 0), 0);
    const c = COUPONS[coupon];
    const cd = c ? Math.round(sub * c.pct / 100) : 0;
    const sp = ship && SHIPS[ship] ? SHIPS[ship].price : 0;
    return { sub, saved, cd, sp, total: sub - cd + sp, coupon: c ? coupon : '' };
  }

  /* =========================================================
     قیمت و کارت محصول
     ========================================================= */
  function priceHTML(p, st) {
    // st: { variation, matches } برای محصول متغیر
    if (!p.stock) return '<span class="n" style="font-size:14px">ناموجود</span>';
    if (p.variable) {
      if (st && st.variation) {
        const v = st.variation;
        return `${v.old ? `<span class="o">${money(v.old)}</span>` : ''}<span class="n">${money(v.price)}<small>تومان</small></span>`;
      }
      const m = (st && st.matches && st.matches.length ? st.matches : p.vars).filter(v => v.stock);
      const lo = Math.min(...m.map(v => v.price)), hi = Math.max(...m.map(v => v.price));
      return lo === hi ? `<span class="n">${money(lo)}<small>تومان</small></span>`
        : `<span class="n"><small class="from">از</small>${money(lo)}<small>تومان</small></span>`;
    }
    return `${p.old ? `<span class="o">${money(p.old)}</span>` : ''}<span class="n">${money(p.pmin)}<small>تومان</small></span>`;
  }

  function cardHTML(p, flags) {
    const fav = (flags && flags.fav) || new Set(), cmp = (flags && flags.cmp) || new Set();
    const href = `product.html?id=${p.id}`;
    const btn = !p.stock ? `<a href="${href}" class="opt">اطلاعات بیشتر</a>`
      : p.variable ? `<button type="button" class="opt" data-act="quick">انتخاب گزینه‌ها</button>`
        : `<button type="button" class="add" data-act="add" aria-label="افزودن به سبد"><svg class="i"><use href="#i-cart"/></svg></button>`;
    const inst = p.perInst ? `هر قسط ${money(p.perInst)} تومان` : p.inst ? 'پرداخت اقساطی' : '';
    return `<article class="card${p.stock ? '' : ' out'}" data-id="${p.id}">
      <div class="im">
        ${p.disc && p.stock ? `<span class="off">٪${fa(p.disc)}</span>` : ''}
        ${p.stock ? '' : '<span class="oos">ناموجود</span>'}
        <div class="qa">
          <button type="button" class="qb fav${fav.has(p.id) ? ' on' : ''}" data-act="fav" aria-label="علاقه‌مندی"><svg class="i"><use href="#i-heart"/></svg></button>
          <button type="button" class="qb qs" data-act="quick" aria-label="نمایش سریع"><svg class="i"><use href="#i-eye"/></svg></button>
          <button type="button" class="qb qs cmp${cmp.has(p.id) ? ' on' : ''}" data-act="cmp" aria-label="افزودن به مقایسه"><svg class="i"><use href="#i-compare"/></svg></button>
        </div>
        <a class="im-l" href="${href}" tabindex="-1" aria-hidden="true"><svg class="pic"><use href="#${p.icon}"/></svg></a>
      </div>
      ${p.brand ? `<div class="br">${p.brand}</div>` : '<div class="br">&nbsp;</div>'}
      <h3><a href="${href}">${p.name}</a></h3>
      <ul class="specs">${p.specs.slice(0, 2).map(s => `<li>${s}</li>`).join('')}</ul>
      <div class="pr"><div>${priceHTML(p)}</div>${btn}</div>
      ${inst && p.stock ? `<div class="inst">${inst}</div>` : `<div class="inst none">&nbsp;</div>`}
    </article>`;
  }

  /* =========================================================
     انتخابگر variation (مثل فرم variations_form ووکامرس)
     - گزینه‌های ناموجود غیرفعال می‌شوند
     - تا انتخاب همه‌ی ویژگی‌ها، قیمت به‌صورت بازه نمایش داده می‌شود
     - cb({sel, variation, full, matches}) بعد از هر تغییر صدا زده می‌شود
     ========================================================= */
  function mountPicker(p, root, cb) {
    const sel = {};
    const matching = ex => p.vars.filter(v => Object.keys(ex).every(k => v.attrs[k] === ex[k]));
    function draw() {
      root.innerHTML = p.vattrs.map(a => {
        const opts = a.opts.map(o => {
          const t = { ...sel, [a.name]: o };
          const ok = matching(t).some(v => v.stock);
          return `<button type="button" class="vopt${sel[a.name] === o ? ' on' : ''}${ok ? '' : ' dis'}" data-a="${a.name}" data-o="${o}"${ok ? '' : ' aria-disabled="true"'}>${fa(o)}</button>`;
        }).join('');
        return `<div class="vrow"><span class="vl">${a.name}${sel[a.name] ? `: <b>${fa(sel[a.name])}</b>` : ''}</span><div class="vopts">${opts}</div></div>`;
      }).join('') + `<button type="button" class="vclear"${Object.keys(sel).length ? '' : ' hidden'}>پاک کردن انتخاب‌ها</button>`;
      const m = matching(sel), full = p.vattrs.every(a => sel[a.name]);
      const variation = full ? m[0] : null;
      cb({ sel, variation, vi: variation ? p.vars.indexOf(variation) : -1, full, matches: m });
    }
    root.onclick = e => {
      const b = e.target.closest('.vopt');
      if (b) {
        if (b.classList.contains('dis')) return;
        const a = b.dataset.a, o = b.dataset.o;
        sel[a] === o ? delete sel[a] : (sel[a] = o);
        draw();
      } else if (e.target.closest('.vclear')) {
        Object.keys(sel).forEach(k => delete sel[k]);
        draw();
      }
    };
    draw();
  }

  window.CATALOG = {
    $, fa, money, norm, TREE, ROOTS, nodeMap, leaves, OPT, GROUPS, PRODUCTS,
    store, priceHTML, cardHTML, mountPicker, cartLines, COUPONS, SHIPS, totals
  };
})();
