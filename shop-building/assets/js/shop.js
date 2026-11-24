/* =========================================================
   فروشگاه اینترنتی عبداللهی - صفحه‌ی فروشگاه
   لیست محصولات + فیلترها (دسته‌بندی، موجودی، قیمت و ویژگی‌ها)
   داده‌ها از catalog.js خوانده می‌شود.
   ========================================================= */
(function () {
  'use strict';
  const C = window.CATALOG;
  const { $, fa, money, norm, nodeMap, ROOTS, GROUPS, PRODUCTS, store, cardHTML, priceHTML, mountPicker } = C;
  /* =========================================================
     4) State
     ========================================================= */
  const S = {
    q: '', cat: null, av: new Set(), pmin: null, pmax: null,
    attrs: {}, sort: 'new', per: 24, shown: 24,
    open: {}, exp: new Set(), more: new Set(),
    fav: new Set(store.fav()), cmp: new Set(store.cmp())
  };

  function matches(p, skip) {
    if (S.q && !S.q.split(' ').every(w => p.nname.includes(w))) return false;
    if (skip !== 'cat' && S.cat && !p.keys.includes(S.cat)) return false;
    if (skip !== 'av' && S.av.size && !S.av.has(p.stock ? 'in' : 'out')) return false;
    if (skip !== 'price') {
      if (S.pmin != null && p.pmax < S.pmin) return false;
      if (S.pmax != null && p.pmin > S.pmax) return false;
    }
    for (const g of GROUPS) {
      if (skip === g.k) continue;
      const sel = S.attrs[g.k];
      if (sel && sel.size && !(p.a[g.k] || []).some(v => sel.has(v))) return false;
    }
    return true;
  }

  function facets() {
    const F = { cat: {}, av: { in: 0, out: 0 }, groups: {}, has: {} };
    GROUPS.forEach(g => { F.groups[g.k] = {}; F.has[g.k] = false; });
    for (const p of PRODUCTS) {
      if (matches(p, 'cat')) p.keys.forEach(k => { F.cat[k] = (F.cat[k] || 0) + 1; });
      if (matches(p, 'av')) F.av[p.stock ? 'in' : 'out']++;
      const inCat = !S.cat || p.keys.includes(S.cat);
      GROUPS.forEach(g => {
        const vals = p.a[g.k];
        if (!vals) return;
        if (inCat) F.has[g.k] = true;
        if (matches(p, g.k)) vals.forEach(v => { F.groups[g.k][v] = (F.groups[g.k][v] || 0) + 1; });
      });
    }
    return F;
  }

  /* =========================================================
     5) Render: filters sidebar
     ========================================================= */
  const fBody = $('#fBody');
  const esc = s => String(s).replace(/"/g, '&quot;');

  function section(id, title, body, defOpen) {
    const open = S.open[id] !== undefined ? S.open[id] : defOpen;
    return `<details class="fs" data-id="${id}" ${open ? 'open' : ''}><summary>${title}<svg class="i"><use href="#i-chev"/></svg></summary><div class="fs-b">${body}</div></details>`;
  }

  function treeHTML(nodes, F) {
    return nodes.map(n => {
      const c = F.cat[n.key] || 0, has = n.children.length, open = S.exp.has(n.key);
      let h = `<div class="ct-row${S.cat === n.key ? ' on' : ''}${c === 0 ? ' dim' : ''}" style="--lv:${n.level}" data-cat="${esc(n.key)}">`;
      h += has
        ? `<button type="button" class="ct-car${open ? ' o' : ''}" data-tog="${esc(n.key)}" aria-label="باز و بسته کردن"><svg class="i"><use href="#i-chev"/></svg></button>`
        : '<span class="ct-sp"></span>';
      h += `<span class="ct-n">${n.name}</span><span class="ct-c">(${fa(c)})</span></div>`;
      if (has && open) h += treeHTML(n.children, F);
      return h;
    }).join('');
  }

  function groupHTML(g, F) {
    const counts = F.groups[g.k], sel = S.attrs[g.k] || new Set(), LIM = 8;
    const isOn = o => counts[o] || sel.has(o);
    const sorted = [...g.o.filter(isOn), ...g.o.filter(o => !isOn(o))];
    const expanded = S.more.has(g.k);
    const list = expanded || sorted.length <= LIM ? sorted : sorted.slice(0, LIM);
    let h = list.map(o => {
      const n = counts[o] || 0;
      return `<label class="op${n || sel.has(o) ? '' : ' dim'}"><input type="checkbox" data-g="${g.k}" data-v="${esc(o)}" ${sel.has(o) ? 'checked' : ''}><bdi>${fa(o)}</bdi><em>(${fa(n)})</em></label>`;
    }).join('');
    if (sorted.length > LIM) h += `<button type="button" class="more-btn" data-more="${g.k}">${expanded ? 'نمایش کمتر' : `نمایش بیشتر (${fa(sorted.length - LIM)})`}</button>`;
    return h;
  }

  function renderFilters(F) {
    let h = '';
    h += section('av', 'وضعیت موجودی',
      `<label class="op"><input type="checkbox" data-av="in" ${S.av.has('in') ? 'checked' : ''}>محصولات موجود<em>(${fa(F.av.in)})</em></label>
       <label class="op"><input type="checkbox" data-av="out" ${S.av.has('out') ? 'checked' : ''}>محصولات ناموجود<em>(${fa(F.av.out)})</em></label>`, true);

    h += section('price', 'فیلتر قیمت',
      `<div class="pi"><input type="text" inputmode="numeric" id="pMin" placeholder="حداقل قیمت" value="${S.pmin != null ? S.pmin.toLocaleString('en-US') : ''}"><span>تا</span><input type="text" inputmode="numeric" id="pMax" placeholder="حداکثر قیمت" value="${S.pmax != null ? S.pmax.toLocaleString('en-US') : ''}"></div>
       <span class="p-unit">قیمت‌ها به تومان</span>
       <button type="button" class="btn line p-apply" id="pApply">اعمال قیمت</button>`, true);

    h += section('cat', 'دسته محصولات',
      `<div class="ct-row ct-all${S.cat ? '' : ' on'}" style="--lv:0" data-cat=""><span class="ct-sp"></span><span class="ct-n">همه محصولات</span><span class="ct-c">(${fa(Object.keys(F.cat).length ? ROOTS.reduce((s, r) => s + (F.cat[r.key] || 0), 0) : 0)})</span></div>` + treeHTML(ROOTS, F), true);

    GROUPS.forEach(g => {
      if (!F.has[g.k] && !(S.attrs[g.k] && S.attrs[g.k].size)) return;
      const selected = S.attrs[g.k] && S.attrs[g.k].size;
      h += section('g-' + g.k, g.t, groupHTML(g, F), !!selected);
    });
    fBody.innerHTML = h;
  }

  /* =========================================================
     6) Render: products grid
     ========================================================= */
  function sortList(list) {
    const by = {
      new: (a, b) => b.id - a.id,
      pop: (a, b) => b.pop - a.pop,
      rate: (a, b) => b.rate - a.rate || b.pop - a.pop,
      asc: (a, b) => a.pmin - b.pmin,
      desc: (a, b) => b.pmin - a.pmin
    };
    return list.sort(by[S.sort]);
  }

  /* ----- chips ----- */
  function renderChips() {
    const chips = [];
    if (S.q) chips.push(['q', '', `جستجو: ${S.q}`]);
    if (S.cat) chips.push(['cat', '', nodeMap[S.cat].name]);
    S.av.forEach(v => chips.push(['av', v, v === 'in' ? 'موجود' : 'ناموجود']));
    if (S.pmin != null || S.pmax != null) {
      chips.push(['price', '', `قیمت: ${S.pmin != null ? 'از ' + money(S.pmin) : ''} ${S.pmax != null ? 'تا ' + money(S.pmax) : ''}`.trim()]);
    }
    GROUPS.forEach(g => (S.attrs[g.k] || new Set()).forEach(v => chips.push(['attr', g.k + '|' + v, `${g.t}: ${fa(v)}`])));
    $('#chips').innerHTML = chips.length
      ? chips.map(c => `<span class="fchip"><button type="button" data-chip="${c[0]}" data-val="${esc(c[1])}" aria-label="حذف"><svg class="i"><use href="#i-close"/></svg></button>${c[2]}</span>`).join('') +
        '<span class="fchip clear" data-chip="all">حذف همه فیلترها</span>'
      : '';
    const badge = $('#fBadge');
    badge.hidden = !chips.length;
    badge.textContent = fa(chips.length);
  }

  /* ----- breadcrumb + title ----- */
  function renderCrumbs() {
    let h = '<a href="index3.html">خانه</a><span class="sep">/</span>';
    if (!S.cat) h += '<b>فروشگاه</b>';
    else {
      h += '<a href="#" data-crumb="">فروشگاه</a>';
      const path = nodeMap[S.cat].path;
      path.forEach((n, i) => {
        const key = path.slice(0, i + 1).join('/');
        h += '<span class="sep">/</span>' + (i === path.length - 1 ? `<b>${n}</b>` : `<a href="#" data-crumb="${esc(key)}">${n}</a>`);
      });
    }
    $('#crumbs').innerHTML = h;
    $('#shopTitle').textContent = S.cat ? nodeMap[S.cat].name : 'فروشگاه';
    document.title = (S.cat ? nodeMap[S.cat].name : 'فروشگاه') + ' | فروشگاه اینترنتی عبداللهی';
  }

  /* ----- main render ----- */
  function render(opts = {}) {
    const F = facets();
    const list = sortList(PRODUCTS.filter(p => matches(p, null)));
    const total = list.length;
    const shown = Math.min(S.shown, total);

    if (!opts.keepFilters) renderFilters(F);
    renderChips();
    renderCrumbs();

    $('#grid').innerHTML = list.slice(0, shown).map(p => cardHTML(p, { fav: S.fav, cmp: S.cmp })).join('');
    $('#empty').hidden = total > 0;
    $('#moreWrap').hidden = total === 0;
    $('#loadMore').hidden = shown >= total;
    $('#resultInfo').textContent = total ? `نمایش ${fa(1)}–${fa(shown)} از ${fa(total)} نتیجه` : 'نتیجه‌ای یافت نشد';
    $('#shownInfo').textContent = total ? `${fa(shown)} محصول از ${fa(total)} محصول نمایش داده شد` : '';
    $('#fCount').textContent = fa(total);
    S._list = list;
  }

  function refresh(resetPage = true) {
    if (resetPage) S.shown = S.per;
    render();
  }

  /* =========================================================
     7) Events
     ========================================================= */
  const toastEl = $('#toast');
  let toastTimer;
  function say(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
  }

  function selectCat(key) {
    S.cat = key || null;
    if (key) { const parts = key.split('/'); parts.forEach((_, i) => S.exp.add(parts.slice(0, i + 1).join('/'))); }
    refresh();
  }

  function parseNum(v) {
    const n = parseInt(norm(v).replace(/[^\d]/g, ''), 10);
    return isNaN(n) ? null : n;
  }

  function clearAll() {
    S.q = ''; S.cat = null; S.av.clear(); S.pmin = S.pmax = null; S.attrs = {};
    $('#hQ').value = ''; $('#mQ').value = '';
    refresh();
  }

  /* sidebar */
  fBody.addEventListener('toggle', e => {
    const d = e.target.closest && e.target.closest('details.fs');
    if (d) S.open[d.dataset.id] = d.open;
  }, true);

  fBody.addEventListener('click', e => {
    const tog = e.target.closest('[data-tog]');
    if (tog) {
      const k = tog.dataset.tog;
      S.exp.has(k) ? S.exp.delete(k) : S.exp.add(k);
      render({}); return;
    }
    const row = e.target.closest('[data-cat]');
    if (row) { const k = row.dataset.cat; selectCat(S.cat === k ? null : k || null); return; }
    const more = e.target.closest('[data-more]');
    if (more) { const k = more.dataset.more; S.more.has(k) ? S.more.delete(k) : S.more.add(k); render({}); return; }
    if (e.target.closest('#pApply')) applyPrice();
  });

  fBody.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.av) { t.checked ? S.av.add(t.dataset.av) : S.av.delete(t.dataset.av); refresh(); }
    else if (t.dataset.g) {
      const set = S.attrs[t.dataset.g] || (S.attrs[t.dataset.g] = new Set());
      t.checked ? set.add(t.dataset.v) : set.delete(t.dataset.v);
      refresh();
    } else if (t.id === 'pMin' || t.id === 'pMax') applyPrice();
  });

  function applyPrice() {
    S.pmin = parseNum($('#pMin').value);
    S.pmax = parseNum($('#pMax').value);
    if (S.pmin != null && S.pmax != null && S.pmin > S.pmax) [S.pmin, S.pmax] = [S.pmax, S.pmin];
    refresh();
  }

  /* chips + breadcrumb + empty state */
  $('#chips').addEventListener('click', e => {
    const c = e.target.closest('[data-chip]');
    if (!c) return;
    const type = c.dataset.chip, val = c.dataset.val;
    if (type === 'all') return clearAll();
    if (type === 'q') { S.q = ''; $('#hQ').value = ''; $('#mQ').value = ''; }
    if (type === 'cat') S.cat = null;
    if (type === 'av') S.av.delete(val);
    if (type === 'price') S.pmin = S.pmax = null;
    if (type === 'attr') { const [k, v] = val.split('|'); S.attrs[k] && S.attrs[k].delete(v); }
    refresh();
  });
  $('#crumbs').addEventListener('click', e => {
    const a = e.target.closest('[data-crumb]');
    if (!a) return;
    e.preventDefault();
    selectCat(a.dataset.crumb || null);
  });
  $('#clearAll').addEventListener('click', clearAll);
  $('#emptyClear').addEventListener('click', clearAll);

  /* search (header + toolbar share one state) */
  function onSearch(v, other) {
    S.q = norm(v);
    other.value = v;
    refresh();
  }
  $('#hQ').addEventListener('input', e => onSearch(e.target.value, $('#mQ')));
  $('#mQ').addEventListener('input', e => onSearch(e.target.value, $('#hQ')));

  /* sort / per-page / load more */
  $('#sort').addEventListener('change', e => { S.sort = e.target.value; refresh(); });
  $('#pp').addEventListener('click', e => {
    const b = e.target.closest('button[data-n]');
    if (!b) return;
    S.per = +b.dataset.n;
    document.querySelectorAll('#pp button').forEach(x => x.classList.toggle('on', x === b));
    refresh();
  });
  $('#loadMore').addEventListener('click', () => { S.shown += S.per; render({ keepFilters: true }); });

  /* product cards */
  const byId = id => PRODUCTS.find(p => p.id === +id);
  $('#grid').addEventListener('click', e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    e.preventDefault();
    const card = btn.closest('.card'), p = byId(card.dataset.id);
    const act = btn.dataset.act;
    if (act === 'add') addToCart(p, -1, 1);
    if (act === 'fav') {
      const on = store.toggle('fav', p.id);
      on ? S.fav.add(p.id) : S.fav.delete(p.id);
      btn.classList.toggle('on', on);
      say(on ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد');
    }
    if (act === 'cmp') {
      if (!S.cmp.has(p.id) && S.cmp.size >= 4) return say('حداکثر ۴ محصول را می‌توانید مقایسه کنید');
      const on = store.toggle('cmp', p.id);
      on ? S.cmp.add(p.id) : S.cmp.delete(p.id);
      btn.classList.toggle('on', on);
      say(on ? `به مقایسه اضافه شد (${fa(S.cmp.size)} محصول)` : 'از مقایسه حذف شد');
    }
    if (act === 'quick') openQuick(p);
  });

  function addToCart(p, vi, qty) {
    store.addCart(p.id, vi, qty);
    say('به سبد خرید اضافه شد');
  }

  /* quick view (برای محصول متغیر، انتخابگر variation دارد) */
  const qv = $('#qv'), qvBox = $('#qvBox');
  let qvProduct = null, qvState = null;
  function openQuick(p) {
    qvProduct = p; qvState = null;
    const simplePrice = !p.stock ? '<span style="font-size:16px;color:var(--mute)">ناموجود</span>'
      : `${p.old ? `<s>${money(p.old)} تومان</s>` : ''}${money(p.pmin)}<small>تومان</small>`;
    qvBox.innerHTML = `
      <button type="button" class="q-x" id="qvX" aria-label="بستن"><svg class="i"><use href="#i-close"/></svg></button>
      <div class="q-im"><svg class="pic" viewBox="0 0 64 64"><use href="#${p.icon}"/></svg></div>
      <div class="q-in">
        ${p.brand ? `<div class="q-br">${p.brand}</div>` : ''}
        <h2>${p.name}</h2>
        <div class="q-pr" id="qvPrice">${p.variable ? priceHTML(p) : simplePrice}</div>
        ${p.variable ? '<div class="vars" id="qvVars"></div>' : ''}
        <ul class="q-sp">${p.specs.map(s => `<li>${s}</li>`).join('')}</ul>
        <div class="q-acts">
          ${p.stock ? `<button type="button" class="btn" id="qvAdd"${p.variable ? ' disabled' : ''}><svg class="i"><use href="#i-cart"/></svg><span id="qvAddT">${p.variable ? 'گزینه‌ها را انتخاب کنید' : 'افزودن به سبد خرید'}</span></button>`
            : '<span class="btn line" style="cursor:default">این محصول فعلاً ناموجود است</span>'}
          <a class="btn line" href="product.html?id=${p.id}">مشاهده صفحه‌ی محصول</a>
        </div>
      </div>`;
    qv.classList.add('open');
    if (p.variable && p.stock) {
      mountPicker(p, $('#qvVars'), st => {
        qvState = st;
        $('#qvPrice').innerHTML = priceHTML(p, st);
        const b = $('#qvAdd');
        b.disabled = !st.full;
        $('#qvAddT').textContent = st.full ? 'افزودن به سبد خرید' : 'گزینه‌ها را انتخاب کنید';
      });
    }
  }
  const closeQuick = () => qv.classList.remove('open');
  qvBox.addEventListener('click', e => {
    if (e.target.closest('#qvX')) closeQuick();
    const add = e.target.closest('#qvAdd');
    if (add && !add.disabled) {
      addToCart(qvProduct, qvState && qvState.full ? qvState.vi : -1, 1);
      closeQuick();
    }
  });
  $('#qvOv').addEventListener('click', closeQuick);
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeQuick(); closeFilters(); drawer.classList.remove('open'); } });

  /* mobile filter drawer */
  const filters = $('#filters'), fOv = $('#fOv');
  const openFilters = () => { filters.classList.add('open'); fOv.classList.add('open'); };
  function closeFilters() { filters.classList.remove('open'); fOv.classList.remove('open'); }
  $('#fOpen').addEventListener('click', openFilters);
  [$('#fClose'), $('#fApply'), fOv].forEach(el => el.addEventListener('click', closeFilters));

  /* menu drawer + back to top */
  const drawer = $('#drawer');
  $('#openMenu').addEventListener('click', () => drawer.classList.add('open'));
  [$('#dov'), $('#dx')].forEach(el => el.addEventListener('click', () => drawer.classList.remove('open')));
  const toTop = $('#tt');
  addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > 600), { passive: true });
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* =========================================================
     8) Init (از آدرس: ?cat=نام دسته  و  ?q=عبارت جستجو)
     ========================================================= */
  const params = new URLSearchParams(location.search);
  const catParam = params.get('cat');
  if (catParam && nodeMap[catParam]) {
    S.cat = catParam;
    catParam.split('/').forEach((_, i, a) => S.exp.add(a.slice(0, i + 1).join('/')));
  }
  if (params.get('q')) { S.q = norm(params.get('q')); $('#hQ').value = $('#mQ').value = params.get('q'); }
  store.sync();
  render();
})();
