/* Дни без покупок тканей — логика приложения */
(function () {
  'use strict';

  var STORAGE_KEY = 'bez-pokupok-tkaney.v1';

  var MONTHS = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  var WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  var EMOJIS = ['🎉', '💪', '🌟', '🔥', '🙌', '👏', '🏆', '💚', '✨', '🧶'];

  var PRAISE = [
    'Ещё один чистый день — ткань подождёт!',
    'Кошелёк уже дышит свободнее.',
    'Ты держишься, и это очень заметно.',
    'Отличный день без новых отрезов.',
    'Швейная машинка пока скучает, а ты — молодец.',
    'Победа над импульсом. Красиво!',
    'Ткань будет ждать, а деньги — нет. Правильный выбор.',
    'Каждый день без покупки — шаг к порядку в шкафу.',
    'Ты доказываешь, что можно и без новой ткани.',
    'Самоконтроль сегодня в отличной форме.',
    'Ни одного лишнего метра. Так держать!',
    'День засчитан — серия продолжается.',
    'Пауза в покупках делает голову яснее.',
    'Твой бюджет кланяется в пояс.',
    'Без покупок, зато с хорошим настроением.',
    'Ещё день в копилку дисциплины.',
    'Минус одна импульсивная покупка.',
    'Умница! Метры ткани побеждены.',
    'Шопинг отменён — день спасён.',
    'Каждая такая отметка — маленькая победа.',
    'Ты владеешь ситуацией, а не наоборот.',
    'Прекрасный выбор — не покупать сегодня.',
    'И шкаф не переполнится, и деньги остались.',
    'Тихий день вместо трекинга доставки — бесценно.',
    'Ты на шаг ближе к своему лучшему результату.',
    'Записано в дневник побед: одна ткань не куплена.',
    'Осознанность в действии. Прямо сейчас.',
    'Сегодня ткань не победила — победил ты.',
    'Хороший день, чтобы не начинать новый проект из ткани.',
    'Такие дни и строят привычку.'
  ];

  var el = {
    streakValue: document.getElementById('streakValue'),
    bestValue: document.getElementById('bestValue'),
    totalValue: document.getElementById('totalValue'),
    monthValue: document.getElementById('monthValue'),
    monthLabel: document.getElementById('monthLabel'),
    todayBtn: document.getElementById('todayBtn'),
    todayBtnText: document.getElementById('todayBtnText'),
    todayBtnIcon: document.getElementById('todayBtnIcon'),
    todayHint: document.getElementById('todayHint'),
    monthTitle: document.getElementById('monthTitle'),
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),
    weekdays: document.getElementById('weekdays'),
    grid: document.getElementById('calendarGrid'),
    monthSummary: document.getElementById('monthSummary'),
    modal: document.getElementById('modal'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    modalEmoji: document.getElementById('modalEmoji'),
    modalText: document.getElementById('modalText'),
    modalChips: document.getElementById('modalChips'),
    modalClose: document.getElementById('modalClose'),
    toast: document.getElementById('toast')
  };

  /* ---------- Даты ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function keyOf(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function today() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function todayKey() { return keyOf(today()); }

  /* ---------- Хранилище ---------- */
  var marked = Object.create(null);
  var storageOk = true;

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(function (k) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(k) && data[k]) marked[k] = true;
        });
      }
    } catch (e) {
      storageOk = false;
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(marked));
    } catch (e) {
      storageOk = false;
      toast('Не удалось сохранить данные (приватный режим?)');
    }
  }

  /* ---------- Подсчёты ---------- */
  // Текущая серия: подряд идущие отмеченные дни, оканчивающиеся сегодня или вчера
  function currentStreak() {
    var d = today();
    if (!marked[keyOf(d)]) {
      d.setDate(d.getDate() - 1);
      if (!marked[keyOf(d)]) return 0;
    }
    var n = 0;
    while (marked[keyOf(d)]) {
      n++;
      d.setDate(d.getDate() - 1);
      if (n > 36500) break;
    }
    return n;
  }

  function bestStreak() {
    var keys = Object.keys(marked).sort();
    var best = 0, cur = 0, prev = null;
    keys.forEach(function (k) {
      var parts = k.split('-');
      var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      if (prev) {
        var diff = Math.round((d - prev) / 86400000);
        cur = diff === 1 ? cur + 1 : 1;
      } else {
        cur = 1;
      }
      if (cur > best) best = cur;
      prev = d;
    });
    return best;
  }

  function totalDays() { return Object.keys(marked).length; }

  function monthCount(year, month) {
    var prefix = year + '-' + pad(month + 1) + '-';
    var n = 0;
    Object.keys(marked).forEach(function (k) {
      if (k.indexOf(prefix) === 0) n++;
    });
    return n;
  }

  /* ---------- Русская форма числа ---------- */
  function plural(n, one, few, many) {
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
  }

  function daysWord(n) { return plural(n, 'день', 'дня', 'дней'); }

  function fmtDate(key) {
    var p = key.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.getDate() + ' ' + MONTHS[d.getMonth()].toLowerCase();
  }

  /* ---------- Вывод ---------- */
  var lastStreak = -1;

  function render() {
    var streak = currentStreak();

    if (streak !== lastStreak) {
      el.streakValue.textContent = streak;
      if (lastStreak !== -1 && streak > lastStreak) restartPulse();
      lastStreak = streak;
    }

    el.bestValue.textContent = bestStreak();
    el.totalValue.textContent = totalDays();

    el.monthValue.textContent = monthCount(view.year, view.month);
    el.monthLabel.textContent = 'отмечено в месяце';

    renderTodayButton();
    renderCalendar();
  }

  function restartPulse() {
    el.streakValue.classList.remove('pulse');
    void el.streakValue.offsetWidth;
    el.streakValue.classList.add('pulse');
  }

  function renderTodayButton() {
    var t = todayKey();
    var isMarked = !!marked[t];
    el.todayBtn.classList.toggle('is-done', isMarked);
    el.todayBtnIcon.textContent = isMarked ? '🟢' : '✅';
    el.todayBtnText.textContent = isMarked
      ? 'Сегодня отмечено: покупки не было'
      : 'Сегодня не было покупок';
    el.todayHint.textContent = isMarked
      ? 'Нажмите ещё раз, чтобы снять отметку.'
      : 'Отметьте день, если покупки ткани не было.';
  }

  var view = (function () {
    var t = today();
    return { year: t.getFullYear(), month: t.getMonth() };
  })();

  function renderCalendar() {
    el.monthTitle.textContent = MONTHS[view.month] + ' ' + view.year;

    if (!el.weekdays.childNodes.length) {
      WEEKDAYS.forEach(function (w) {
        var s = document.createElement('span');
        s.textContent = w;
        el.weekdays.appendChild(s);
      });
    }

    var first = new Date(view.year, view.month, 1);
    var offset = (first.getDay() + 6) % 7; // неделя с понедельника
    var daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    var tKey = todayKey();
    var now = today();

    var html = '';
    for (var i = 0; i < offset; i++) html += '<span></span>';

    for (var day = 1; day <= daysInMonth; day++) {
      var key = view.year + '-' + pad(view.month + 1) + '-' + pad(day);
      var isFuture = key > tKey;
      var isToday = key === tKey;
      var isMarked = !!marked[key];

      var cls = 'day';
      if (isMarked) cls += ' day--marked';
      if (isToday) cls += ' day--today';

      html += '<button type="button" class="' + cls + '" data-key="' + key + '"' +
        (isFuture ? ' disabled' : '') +
        ' aria-pressed="' + (isMarked ? 'true' : 'false') + '"' +
        ' aria-label="' + day + ' ' + MONTHS[view.month].toLowerCase() +
        (isMarked ? ', покупки не было' : '') + '">' +
        (isMarked ? '✓' : day) +
        '</button>';
    }

    el.grid.innerHTML = html;

    // Сводка по месяцу
    var counted = monthCount(view.year, view.month);
    var passed = 0;
    if (view.year < now.getFullYear() || (view.year === now.getFullYear() && view.month < now.getMonth())) {
      passed = daysInMonth;
    } else if (view.year === now.getFullYear() && view.month === now.getMonth()) {
      passed = now.getDate();
    } else {
      passed = 0;
    }
    el.monthSummary.textContent = passed > 0
      ? 'В этом месяце отмечено ' + counted + ' из ' + passed + ' ' +
        plural(passed, 'прошедшего дня', 'прошедших дней', 'прошедших дней') + '.'
      : 'В этом месяце пока нет прошедших дней.';
  }

  /* ---------- Действия ---------- */
  function toggleDay(key) {
    if (key > todayKey()) {
      toast('Будущие дни отметить нельзя 🙂');
      return;
    }

    var wasMarked = !!marked[key];

    if (wasMarked) {
      delete marked[key];
      save();
      render();
      toast('Отметка за ' + fmtDate(key) + ' снята');
      return;
    }

    marked[key] = true;
    save();
    render();

    var streak = currentStreak();
    showPraise(streak, key);
  }

  function showPraise(streak, key) {
    var text = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    var chips = [];
    if (key === todayKey()) {
      chips.push('🔥 Серия: ' + streak + ' ' + daysWord(streak));
    } else {
      chips.push('📅 ' + fmtDate(key));
      chips.push('🔥 Серия сейчас: ' + streak + ' ' + daysWord(streak));
    }
    if (streak > 0 && streak % 7 === 0) {
      chips.push('🏅 Неделя закрыта!');
    }
    showModal(EMOJIS[Math.floor(Math.random() * EMOJIS.length)], text, chips, 'Продолжаем!');
  }

  function showModal(emoji, text, chips, btnLabel) {
    el.modalEmoji.textContent = emoji;
    el.modalText.textContent = text;
    el.modalChips.innerHTML = '';
    (chips || []).forEach(function (c) {
      var s = document.createElement('span');
      s.className = 'chip';
      s.textContent = c;
      el.modalChips.appendChild(s);
    });
    el.modalClose.textContent = btnLabel || 'Ок';
    el.modal.hidden = false;
    el.modalClose.focus();
  }

  function hideModal() {
    el.modal.hidden = true;
  }

  var toastTimer = null;
  function toast(msg) {
    clearTimeout(toastTimer);
    el.toast.hidden = false;
    el.toast.textContent = msg;
    requestAnimationFrame(function () {
      el.toast.classList.add('is-visible');
    });
    toastTimer = setTimeout(function () {
      el.toast.classList.remove('is-visible');
      setTimeout(function () { el.toast.hidden = true; }, 300);
    }, 2600);
  }

  /* ---------- События ---------- */
  el.grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.day');
    if (!btn || btn.disabled) return;
    toggleDay(btn.dataset.key);
  });

  el.todayBtn.addEventListener('click', function () {
    toggleDay(todayKey());
  });

  el.prevMonth.addEventListener('click', function () {
    view.month--;
    if (view.month < 0) { view.month = 11; view.year--; }
    render();
  });

  el.nextMonth.addEventListener('click', function () {
    view.month++;
    if (view.month > 11) { view.month = 0; view.year++; }
    render();
  });

  el.modalClose.addEventListener('click', hideModal);
  el.modalBackdrop.addEventListener('click', hideModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !el.modal.hidden) hideModal();
  });

  /* ---------- Запуск ---------- */
  load();
  render();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {
        /* офлайн-режим недоступен — приложение всё равно работает */
      });
    });
  }
})();
