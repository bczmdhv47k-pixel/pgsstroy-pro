/* PGSSTROY.PRO — патч 13.4 (заменяет 13.3: содержит всё из него)
   Подключить последней строкой перед </body>:
   <script src="pgsstroy-patch-13_4.js"></script>
   Проверка расчётов: Профиль → «🧪 Проверка расчётов». */
(function () {
  const $ = id => document.getElementById(id);

  /* ======================================================================
     ЧИСТЫЕ ФОРМУЛЫ. Интерфейс и самопроверка используют одни и те же функции.
     ====================================================================== */
  const r6 = x => Math.round(x * 1e6) / 1e6;
  const LOOK = { 'а': 'a', 'в': 'b', 'е': 'e', 'к': 'k', 'м': 'm', 'н': 'h', 'о': 'o', 'р': 'p', 'с': 'c', 'т': 't', 'х': 'x', 'у': 'y' };
  // «В25» (русская В) и «B25» (латинская B) выглядят одинаково, но это разные символы
  const normName = s => String(s || '').toLowerCase().trim().replace(/[авекмнорстху]/g, c => LOOK[c]);

  const CALC = {
    concrete({ l, w, t, reserve }) {
      const base = l * w * t;
      return { base, total: base * (1 + reserve / 100) };
    },

    // Теоретическая масса 1 м арматуры, кг: 0,00617·d² (d в мм) — совпадает с таблицей ГОСТ 5781 в пределах 0,2 %
    rebarKgPerM(d) { return 0.00617 * d * d; },

    rebar({ l, w, step, d, layers, reserve }) {
      // r6 убирает ошибку двоичной арифметики: floor(32.3*1000/100) раньше давал 322 вместо 323
      const nx = Math.floor(r6(w * 1000 / step)) + 1;   // стержней длиной l (шаг по ширине)
      const ny = Math.floor(r6(l * 1000 / step)) + 1;   // стержней длиной w (шаг по длине)
      const length = (nx * l + ny * w) * layers * (1 + reserve / 100);
      return { nx, ny, pieces: (nx + ny) * layers, length, kg: length * CALC.rebarKgPerM(d) };
    },

    earth({ l, w, h, loosening, truck }) {
      const v = l * w * h, vl = v * (1 + loosening / 100);
      return { v, vl, trips: Math.ceil(r6(vl / truck)) };
    },

    // двускатная кровля: свес по всем сторонам, угол в градусах
    roof({ L, W, overhang, angle, reserve }) {
      const l = L + 2 * overhang, w = W + 2 * overhang;
      const slope = (w / 2) / Math.cos(angle * Math.PI / 180);
      const area = 2 * l * slope;
      return { area, withWaste: area * (1 + reserve / 100) };
    },

    // кладка: раствор = объём стены − объём изделий (геометрически)
    masonry({ L, H, open, waste, jointMm, wallMm, material }) {
      const area = Math.max(0, L * H - open);
      const m = String(material).match(/(\d+)×(\d+)×(\d+)/);
      if (!(area > 0) || !m) return null;
      const w = waste / 100, j = Math.max(0, jointMm) / 1000;
      const l = +m[1] / 1000, t = +m[2] / 1000, h = +m[3] / 1000;     // длина × толщина × высота
      const isBrick = /кирпич/i.test(material);
      const T = isBrick ? Math.max(wallMm, t * 1000) / 1000 : t;       // у блоков стена = толщина блока
      const perM2 = 1 / ((l + j) * (h + j));
      const pieces = area * perM2 * (T / t) * (1 + w);
      const mortarM3 = area * T * Math.max(0, 1 - perM2 * l * h);
      const dryKg = mortarM3 * 1600 * (1 + w);                         // ≈1600 кг сухой смеси на 1 м³ раствора
      return { area, pieces, mortarM3, dryKg, bags: Math.ceil(dryKg / 25), wallVolume: area * T, T, t, isBrick };
    },

    // предварительная ведомость ВЛ
    power({ km, span, angles, wires, circuits, earthWire }) {
      const spans = Math.ceil(r6(km * 1000 / span));
      const supportsMin = spans + 1;                    // прямая трасса
      const supportsMax = supportsMin + Math.max(0, angles); // каждый угол может «сломать» пролёт и добавить опору
      const anchors = Math.min(supportsMax, 2 + Math.max(0, angles)); // две концевые + угловые
      return {
        spans, supportsMin, supportsMax, anchors,
        intermediateMin: Math.max(0, supportsMin - anchors),
        intermediateMax: Math.max(0, supportsMax - anchors),
        conductorKm: km * 3 * wires * circuits,         // 3 фазы × проводов в фазе × цепей
        earthKm: earthWire ? km : 0                      // один трос по трассе (двух цепей на одной опоре это не меняет)
      };
    },

    estimateTotals({ direct, overheadPct, profitPct, delivery, reservePct }) {
      const overhead = direct * overheadPct / 100;
      const profit = (direct + overhead) * profitPct / 100;
      const base = direct + overhead + profit + delivery;
      const reserve = base * reservePct / 100;
      return { direct, overhead, profit, delivery, reserve, total: base + reserve };
    },

    pickPrice(prices, item, type, region, city) {
      const target = normName(item.name);
      let pool = prices.filter(p => {
        const m = normName(p.material);
        return m && String(p.type || '') === String(type || '') &&
          estimateUnitOkV09(item.unit, String(p.unit || '')) &&
          (m === target || target.includes(m) || m.includes(target));
      });
      if (type === 'Сметная') pool = pool.filter(p => p.fgisVerified === true);
      const score = p => {
        let s = 0; const m = normName(p.material);
        if (m === target) s += 1000;
        if (region && regionMatches(p.region, region)) s += 300;
        if (city && String(p.city || '').toLowerCase().trim() === city.toLowerCase().trim()) s += 100;
        if (item.ksrCode && String(p.ksrCode || '') === String(item.ksrCode)) s += 500;
        if (type === 'Сметная' && item.fgisPeriod && String(p.fgisPeriod || '') === String(item.fgisPeriod)) s += 100;
        return s;
      };
      return pool.slice().sort((a, b) => score(b) - score(a))[0] || null;
    }
  };
  window.PGS_CALC = CALC;

  /* ======================================================================
     ПРЕЖНИЕ ИСПРАВЛЕНИЯ (из 13.3)
     ====================================================================== */

  // Старый showPage() не переключал папки
  window.showPage = function (id) { showPageV07(id); };

  // Не было единицы ₽/м² (кровля считается в м²)
  const pu = $('pUnit');
  if (pu && ![...pu.options].some(o => o.text === '₽/м²')) {
    const o = document.createElement('option'); o.textContent = '₽/м²'; pu.appendChild(o);
  }

  // AI-прораб
  window.sendAIMessage = async function () {
    const input = $('aiMessage'), result = $('aiResult');
    if (!input || !result) return;
    const btn = document.querySelector('#ai button.primary');
    const show = t => { result.style.display = 'block'; result.style.whiteSpace = 'pre-wrap'; result.textContent = t; };
    const message = input.value.trim();
    if (!message) return show('Напишите вопрос для AI-прораба.');
    if (message.length > 4000) return show('Вопрос слишком длинный (максимум 4000 символов).');
    if (!cloudSession) return show('Сначала войдите в облачный аккаунт.');
    if (window.__aiBusy) return;
    window.__aiBusy = true;
    if (btn) { btn.disabled = true; btn.textContent = '🤖 Думаю…'; }
    show('🤖 AI-прораб думает…');
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 60000);
    try {
      const r = await fetch(PGSSTROY_API_URL + '/api/ai', { method: 'POST', headers: cloudHeaders(), body: JSON.stringify({ message }), signal: ctl.signal });
      const data = await r.json().catch(() => ({}));
      if (r.status === 401 || r.status === 403) return show('Сессия истекла. Выйдите из облачного аккаунта и войдите снова.');
      if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status));
      show(data.answer || 'AI не вернул ответ.');
    } catch (e) {
      show(e.name === 'AbortError' ? '⏱️ AI не ответил за 60 секунд. Попробуйте ещё раз.'
        : '❌ Ошибка AI: ' + (e.message === 'Failed to fetch' ? 'сервер недоступен или адрес сайта не разрешён в настройках CORS на сервере' : e.message));
    } finally {
      clearTimeout(timer); window.__aiBusy = false;
      if (btn) { btn.disabled = false; btn.textContent = '🤖 Спросить AI-прораба'; }
    }
  };

  /* ======================================================================
     РАСЧЁТЫ В ИНТЕРФЕЙСЕ — теперь через CALC
     ====================================================================== */
  const num = id => +($(id)?.value) || 0;

  function pushCalc(type, name, qty, unit, selectId, meta) {
    db.calculations.push({
      id: Date.now(), objectId: (selectId && $(selectId)?.value) || null, type, name, qty, unit,
      unitPrice: null, total: 0, priceType: null, source: null, date: today(), meta
    });
    save();
  }

  window.calcConcrete = function () {
    const l = num('cl'), w = num('cw'), t = num('ct'), r = num('cr');
    if (!(l > 0 && w > 0 && t > 0)) return alert('Заполните размеры');
    if (r < 0) return alert('Запас не может быть отрицательным');
    const klass = $('cc').value, c = CALC.concrete({ l, w, t, reserve: r });
    pushCalc('Бетон', klass, c.total, 'м³', 'calcObjectConcrete', { baseVolume: c.base, reserve: r });
    $('concreteResult').innerHTML = `<div class="result"><div class="muted">${esc(klass)}</div>
      <div>Без запаса: <b>${c.base.toFixed(2)} м³</b></div>
      <div class="big">${c.total.toFixed(2)} м³</div><div class="muted">Запас ${r}%</div>
      <div class="notice">Цена будет подставлена в «Смету» из базы цен.</div></div>`;
  };

  window.calcRebar = function () {
    const l = num('rl'), w = num('rw'), s = num('rs'), d = num('rd'), lay = num('rlayers') || 1, r = num('rr');
    if (!(l > 0 && w > 0 && s > 0 && d > 0)) return alert('Заполните параметры (размеры, шаг и диаметр больше нуля)');
    const x = CALC.rebar({ l, w, step: s, d, layers: lay, reserve: r });
    pushCalc('Арматура', 'Ø' + d, x.kg, 'кг', 'calcObjectRebar', { length: x.length, diameter: d, layers: lay, reserve: r });
    $('rebarResult').innerHTML = `<div class="result"><div>Стержней: <b>${x.pieces}</b> <span class="muted">(${x.nx} + ${x.ny} в слое × ${lay} сл.)</span></div>
      <div>Общая длина с запасом: <b>${x.length.toFixed(1)} м</b></div>
      <div class="big">${x.kg.toFixed(1)} кг</div>
      <div class="muted">Теоретическая масса Ø${d} мм · ${CALC.rebarKgPerM(d).toFixed(3)} кг/м</div>
      <div class="notice">Без учёта защитного слоя, нахлёстов, выпусков и гнутых элементов — их закрывает запас. Цена подставится в «Смету».</div></div>`;
  };

  window.calcEarthV08 = function () {
    const l = num('ewL'), w = num('ewW'), h = num('ewH'), loos = num('ewLoos'), truck = num('ewTruck') || 20;
    if (!(l > 0 && w > 0 && h > 0)) return alert('Укажите длину, ширину и глубину больше нуля');
    if (!(truck > 0)) return alert('Укажите объём самосвала');
    const e = CALC.earth({ l, w, h, loosening: loos, truck });
    $('earthResult').innerHTML = `<div class="module-result"><div class="big">${e.v.toFixed(2)} м³</div><div>Объём в плотном теле</div><p>С разрыхлением: <b>${e.vl.toFixed(2)} м³</b><br>Ориентировочно рейсов по ${truck} м³: <b>${e.trips}</b></p><span class="mini">Прямоугольный объём без откосов. Коэффициент разрыхления уточняется по грунту.${$('ewType').value === 'Обратная засыпка' ? ' Для засыпки с уплотнением грунта нужно больше, чем объём выемки — учтите коэффициент уплотнения.' : ''}</span></div>`;
    recentCalc({ type: 'Земляные работы', name: $('ewType').value, qty: e.v, unit: 'м³', date: today() });
  };

  window.calcRoofV08 = function () {
    const L = num('rfL'), W = num('rfW'), e = num('rfE'), a = num('rfA'), r = num('rfR');
    if (!(L > 0 && W > 0)) return alert('Укажите длину и ширину здания');
    if (!(a >= 0 && a <= 80)) return alert('Угол ската должен быть от 0 до 80°');
    const x = CALC.roof({ L, W, overhang: e, angle: a, reserve: r });
    $('roofResult').innerHTML = `<div class="module-result"><div class="big">${x.withWaste.toFixed(1)} м²</div><div>Ориентировочная площадь покрытия с запасом.</div><p>Площадь скатов без запаса: ${x.area.toFixed(1)} м²</p><span class="mini">Двускатная кровля. Не учитывает ендовы, мансардные окна, нестандартные свесы и раскрой листов.</span></div>`;
    recentCalc({ type: 'Кровля', name: $('rfMat').value, qty: x.withWaste, unit: 'м²', date: today() });
  };

  window.calcFinishV08 = function () {
    const a = num('fnArea'), r = num('fnRate'), w = num('fnWaste');
    if (!(a > 0)) return alert('Укажите площадь');
    if (!(r > 0)) return alert('Укажите расход материала');
    const q = a * r * (1 + w / 100);
    $('finishResult').innerHTML = `<div class="module-result"><div class="big">${q.toFixed(1)} кг</div><div>Ориентировочная потребность материала.</div><p>Без запаса: ${(a * r).toFixed(1)} кг · с запасом: ${q.toFixed(1)} кг</p><span class="mini">Расход задаётся пользователем и должен соответствовать паспорту конкретного материала.</span></div>`;
    recentCalc({ type: 'Отделка', name: $('fnType').value, qty: q, unit: 'кг', date: today() });
  };

  window.calcMasonryV08 = function () {
    const mat = String($('mwMat').value);
    if (!(num('mwL') > 0 && num('mwH') > 0)) return alert('Укажите длину и высоту стены');
    const x = CALC.masonry({ L: num('mwL'), H: num('mwH'), open: num('mwOpen'), waste: num('mwWaste'), jointMm: num('mwJoint'), wallMm: num('mwT'), material: mat });
    if (!x) return alert('Проверьте размеры стены и выбранный материал');
    const note = !x.isBrick && Math.abs(num('mwT') - x.t * 1000) > 1 ? `<br>Толщина стены принята по блоку: ${Math.round(x.t * 1000)} мм.` : '';
    $('masonryResult').innerHTML = `<div class="module-result"><div class="big">${x.area.toFixed(2)} м²</div>
      <p>Материал: <b>${Math.ceil(x.pieces)} шт.</b> с запасом ${num('mwWaste')}%.</p>
      <p>Раствор/клей в швах: <b>${x.mortarM3.toFixed(3)} м³</b><br>Сухая смесь ≈ <b>${Math.round(x.dryKg)} кг</b> (${x.bags} меш. × 25 кг).${note}</p>
      <span class="mini">Расчёт геометрический (шов ${num('mwJoint')} мм), плотность смеси ≈1600 кг/м³. Для газоблока на клей задавайте шов 2–3 мм, для кирпича на растворе — около 10 мм.</span></div>`;
    recentCalc({ type: 'Кладка', name: mat, qty: x.pieces, unit: 'шт', date: today() });
  };

  window.calcPowerLine = function () {
    const voltage = el.plVoltage.value, power = num('plPower'), km = num('plLength'), circuits = num('plChains') || 1;
    const span = num('plSpans') || 250, angles = num('plAngles'), wires = num('plWireCount') || 1;
    if (!(km > 0 && span > 0)) return alert('Укажите длину трассы и средний пролёт');
    if (el.plCircuit.value !== 'ВЛ') return alert('В текущей версии предварительная ведомость рассчитана для ВЛ. Кабельную линию добавим отдельным расчётом.');
    const p = CALC.power({ km, span, angles, wires, circuits, earthWire: el.plEarth.value !== 'Нет' });
    const range = (a, b, u) => a === b ? `${a} ${u}` : `${a}–${b} ${u}`;
    el.powerResult.innerHTML = `<div class="result"><div class="stat">
      <div>Опоры<b>${range(p.supportsMin, p.supportsMax, 'шт.')}</b></div><div>Пролётов<b>${p.spans}</b></div><div>Провод<b>${p.conductorKm.toFixed(2)} км</b></div></div>
      <div class="item"><h3>Предварительная ведомость</h3>
      <div class="price-line"><span>Линия</span><b>${esc(voltage)} · ${circuits} цеп.</b></div>
      <div class="price-line"><span>Мощность</span><b>${power ? power.toLocaleString('ru-RU') + ' МВт' : 'не задана'}</b></div>
      <div class="price-line"><span>Длина трассы</span><b>${km.toFixed(2)} км</b></div>
      <div class="price-line"><span>Опоры всего</span><b>${range(p.supportsMin, p.supportsMax, 'шт.')}</b></div>
      <div class="price-line"><span>Анкерных (концевые + угловые)</span><b>${p.anchors} шт.</b></div>
      <div class="price-line"><span>Промежуточных</span><b>${range(p.intermediateMin, p.intermediateMax, 'шт.')}</b></div>
      <div class="price-line"><span>Провод</span><b>${p.conductorKm.toFixed(2)} км · ${esc(el.plConductor.value || 'марка не задана')}</b></div>
      <div class="price-line"><span>Грозотрос / ОКГТ (один по трассе)</span><b>${p.earthKm.toFixed(2)} км</b></div>
      <div class="notice">⚠️ Нижняя граница — прямая трасса, верхняя — каждый угол добавляет опору. Конкретное число определяют проект и пролёты по профилю. Если тросов два, умножьте длину троса на 2. Провод без запаса на стрелу провеса и монтаж.</div></div></div>`;
  };

  /* ======================================================================
     СМЕТА
     ====================================================================== */
  window.estimateTotalsV09 = function (lines) {
    return CALC.estimateTotals({
      direct: lines.reduce((s, x) => s + x.total, 0),
      overheadPct: num('estOverhead'), profitPct: num('estProfit'),
      delivery: num('estDelivery'), reservePct: num('estReserve')
    });
  };

  window.findEstimatePriceV09 = function (item, type) {
    const region = String($('estimateRegion')?.value || profileRegion() || '').trim();
    return CALC.pickPrice(db.prices, item, type, region, profileCity());
  };

  const estBox = $('estimateVersionBox');
  if (estBox && !$('estMethodNote')) {
    const n = document.createElement('div');
    n.id = 'estMethodNote'; n.className = 'notice';
    n.innerHTML = '<b>Как считается:</b> накладные расходы и сметная прибыль здесь — проценты от прямых затрат (упрощённая модель). В сметах по ФЕР/ТЕР действующие методики определяют их от фонда оплаты труда, поэтому итог может отличаться от официальной сметы.';
    estBox.parentNode.insertBefore(n, estBox);
  }

  /* ======================================================================
     САМОПРОВЕРКА (Профиль → «🧪 Проверка расчётов»)
     ====================================================================== */
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  window.runSelfTests = function () {
    const T = [];
    const t = (name, ok, detail) => T.push({ name, ok: !!ok, detail: detail || '' });

    // Бетон
    const c = CALC.concrete({ l: 10, w: 20, t: 0.2, reserve: 5 });
    t('Бетон: плита 10×20×0,2 м +5 % = 42 м³', near(c.total, 42, 1e-9), c.total.toFixed(3));

    // Масса арматуры по таблице ГОСТ 5781 (теоретическая масса 1 м, кг)
    const gost = { 6: 0.222, 8: 0.395, 10: 0.617, 12: 0.888, 14: 1.208, 16: 1.578, 20: 2.466, 25: 3.853, 32: 6.313 };
    Object.entries(gost).forEach(([d, m]) => {
      const f = CALC.rebarKgPerM(+d);
      t(`Арматура Ø${d}: ${f.toFixed(3)} кг/м (таблица ${m})`, Math.abs(f - m) / m < 0.003);
    });

    // Сетка
    const r = CALC.rebar({ l: 20, w: 10, step: 200, d: 12, layers: 1, reserve: 0 });
    t('Сетка 20×10 м, шаг 200: 51 + 101 стержень', r.nx === 51 && r.ny === 101, r.nx + ' + ' + r.ny);
    t('Сетка 20×10 м: длина 2030 м', near(r.length, 2030, 1e-9), r.length.toFixed(1));
    t('Сетка 20×10 м, Ø12: ≈1803 кг', near(r.kg, 2030 * 0.888, 3), r.kg.toFixed(1));
    const r2 = CALC.rebar({ l: 32.3, w: 1, step: 100, d: 10, layers: 1, reserve: 0 });
    t('Округление: 32,3 м при шаге 100 → 324 стержня (было 323)', r2.ny === 324, String(r2.ny));
    const r3 = CALC.rebar({ l: 10, w: 10, step: 200, d: 10, layers: 2, reserve: 0 });
    t('Два слоя дают вдвое больше стержней и металла', r3.pieces === 2 * (51 + 51) && near(r3.kg, 2 * CALC.rebar({ l: 10, w: 10, step: 200, d: 10, layers: 1, reserve: 0 }).kg, 1e-9));

    // Земляные работы
    const e = CALC.earth({ l: 10, w: 5, h: 2, loosening: 15, truck: 20 });
    t('Земляные: 10×5×2 = 100 м³, с разрыхлением 115 м³, 6 рейсов', e.v === 100 && near(e.vl, 115, 1e-9) && e.trips === 6, `${e.v}/${e.vl}/${e.trips}`);

    // Кровля
    const rf = CALC.roof({ L: 10, W: 8, overhang: 0.5, angle: 30, reserve: 10 });
    t('Кровля 10×8 м, свес 0,5, 30°: ≈114,3 м²', near(rf.area, 114.3, 0.1), rf.area.toFixed(2));
    t('Кровля +10 % запаса: ≈125,7 м²', near(rf.withWaste, 125.7, 0.1), rf.withWaste.toFixed(2));
    t('Кровля при 0° = плоская (площадь здания со свесом)', near(CALC.roof({ L: 10, W: 8, overhang: 0, angle: 0, reserve: 0 }).area, 80, 1e-9));

    // Кладка
    const mg = CALC.masonry({ L: 20, H: 5, open: 0, waste: 5, jointMm: 3, wallMm: 300, material: 'Газоблок 600×300×200' });
    t('Газоблок 20×5 м, шов 3 мм: ≈858 шт.', near(mg.pieces, 858, 1), mg.pieces.toFixed(1));
    t('Газоблок: швы занимают меньше 3 % объёма стены', mg.mortarM3 < 0.03 * mg.wallVolume, (mg.mortarM3 / mg.wallVolume * 100).toFixed(2) + ' %');
    const mb = CALC.masonry({ L: 10, H: 3, open: 0, waste: 0, jointMm: 10, wallMm: 380, material: 'Кирпич 250×120×65' });
    t('Кирпич, стена 380 мм, шов 10: 150–165 шт. на м²', mb.pieces / mb.area > 150 && mb.pieces / mb.area < 165, (mb.pieces / mb.area).toFixed(1));
    t('Кирпич: раствор 10–25 % объёма кладки', mb.mortarM3 / mb.wallVolume > 0.10 && mb.mortarM3 / mb.wallVolume < 0.25, (mb.mortarM3 / mb.wallVolume * 100).toFixed(1) + ' %');
    t('Проёмы больше стены не дают отрицательный расчёт', CALC.masonry({ L: 2, H: 2, open: 10, waste: 0, jointMm: 10, wallMm: 250, material: 'Кирпич 250×120×65' }) === null);

    // ЛЭП
    const p = CALC.power({ km: 15, span: 250, angles: 3, wires: 1, circuits: 2, earthWire: true });
    t('ВЛ 15 км, пролёт 250 м: 60 пролётов, 61–64 опоры', p.spans === 60 && p.supportsMin === 61 && p.supportsMax === 64, `${p.spans}/${p.supportsMin}-${p.supportsMax}`);
    t('ВЛ: анкерных = 2 концевые + 3 угловые = 5', p.anchors === 5, String(p.anchors));
    t('ВЛ: провод 3 фазы × 2 цепи × 15 км = 90 км', near(p.conductorKm, 90, 1e-9));
    t('ВЛ: трос один по трассе = 15 км (не растёт с числом цепей)', near(p.earthKm, 15, 1e-9));
    t('ВЛ: промежуточные + анкерные = все опоры', p.intermediateMax + p.anchors === p.supportsMax && p.intermediateMin + p.anchors === p.supportsMin);

    // Смета
    const es = CALC.estimateTotals({ direct: 1000, overheadPct: 10, profitPct: 5, delivery: 50, reservePct: 2 });
    t('Смета: 1000 +НР10 % +СП5 % +доставка 50 +резерв 2 % = 1229,10', near(es.total, 1229.1, 1e-9), es.total.toFixed(2));
    t('Смета: без процентов итог = прямые + доставка', near(CALC.estimateTotals({ direct: 500, overheadPct: 0, profitPct: 0, delivery: 20, reservePct: 0 }).total, 520, 1e-9));

    // Единицы и подбор цены
    t('Единицы: м² ↔ ₽/м² совместимы', estimateUnitOkV09('м²', '₽/м²') === true);
    t('Единицы: м³ ↔ ₽/м² несовместимы', estimateUnitOkV09('м³', '₽/м²') === false);
    const prices = [
      { material: 'Бетон В25', unit: '₽/м³', type: 'Рыночная', price: 5000 },            // русская «В»
      { material: 'Арматура А500С Ø12', unit: '₽/кг', type: 'Рыночная', price: 70 }
    ];
    t('Цена: «B25» (латиница) находит «Бетон В25» (кириллица)', CALC.pickPrice(prices, { name: 'B25', unit: 'м³' }, 'Рыночная', '', '')?.price === 5000);
    t('Цена: несовпадающая единица не подходит', CALC.pickPrice(prices, { name: 'B25', unit: 'кг' }, 'Рыночная', '', '') === null);
    t('Цена: сметная без пометки ФГИС не принимается', CALC.pickPrice([{ material: 'Бетон B25', unit: '₽/м³', type: 'Сметная', price: 1 }], { name: 'B25', unit: 'м³' }, 'Сметная', '', '') === null);

    const failed = T.filter(x => !x.ok);
    let box = $('selfTestBox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'selfTestBox'; box.className = 'notice';
      const host = document.querySelector('#profile .card:last-child') || $('profile');
      host.appendChild(box);
    }
    box.innerHTML = `<b>${failed.length ? '❌ Ошибок: ' + failed.length : '✅ Все проверки пройдены'}</b> (${T.length - failed.length} из ${T.length})` +
      `<div style="margin-top:8px;font-size:12px;line-height:1.6">${T.map(x => `${x.ok ? '✅' : '❌'} ${esc(x.name)}${x.detail ? ' — ' + esc(x.detail) : ''}`).join('<br>')}</div>`;
    return T;
  };

  const exportRow = document.querySelector('#profile .card:last-child .toolbar');
  if (exportRow && !$('selfTestBtn')) {
    const b = document.createElement('button');
    b.id = 'selfTestBtn'; b.className = 'secondary'; b.textContent = '🧪 Проверка расчётов';
    b.onclick = () => runSelfTests();
    exportRow.appendChild(b);
  }
  if (location.hash === '#selftest') {
    if (typeof enterApp === 'function') enterApp('profile'); else showPageV07('profile');
    runSelfTests();
  }
})();
