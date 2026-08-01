// ============================================================
//  能量气象图 热力表 + 时光小票
// ============================================================

let hmCurrentView = 'week';
let hmPeriodOffset = 0;
let hmAnchorDate = null; // 选中的锚点日期

// --- 工具函数 ---
function hmFmtDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function hmGetEnergy(dateKey) {
  return (state.energyHistory && state.energyHistory[dateKey]) || null;
}

// 活动量等级计算：0~5
function hmGetLevel(dateKey) {
  const logs = (state.dailyLogs && state.dailyLogs[dateKey]) || [];
  const count = logs.length;
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  if (count <= 8) return 4;
  return 5;
}

function hmGetEnergyClasses(energy, level) {
  if (level === 0 || !energy) return '';
  return 'hm-bg-' + energy + ' hm-L' + level;
}

// --- 数据记录层 ---
// type: 'todo' | 'routine' | 'card' | 'meditation' | 'diary' | 'book'
function logActivity(type, label, extra) {
  const today = getTodayDateKey();
  if (!state.dailyLogs) state.dailyLogs = {};
  if (!state.dailyLogs[today]) state.dailyLogs[today] = [];
  const entry = {
    type: type,
    label: label || '',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    ts: Date.now()
  };
  if (extra) Object.assign(entry, extra);
  state.dailyLogs[today].push(entry);
  // 同步更新能量历史，确保热力图能正确渲染
  if (!state.energyHistory) state.energyHistory = {};
  if (!state.energyHistory[today]) state.energyHistory[today] = 'high';
  saveState();
}

// --- 打开/关闭热力表 ---
function openHeatmap() {
  document.getElementById('heatmapModal').classList.add('open');
  hmAnchorDate = null;
  hmPeriodOffset = 0;
  var picker = document.getElementById('hmDatePicker');
  if (picker) picker.value = hmFmtDate(new Date());
  hmRenderAll();
}
function closeHeatmap() {
  document.getElementById('heatmapModal').classList.remove('open');
}

// --- 视图切换 ---
function hmSwitchView(view, btn) {
  hmCurrentView = view;
  hmPeriodOffset = 0;
  document.querySelectorAll('.hm-view-tab').forEach(function(t) { t.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  document.getElementById('hmWeekView').style.display = view === 'week' ? '' : 'none';
  document.getElementById('hmMonthView').style.display = view === 'month' ? '' : 'none';
  document.getElementById('hmYearView').style.display = view === 'year' ? '' : 'none';
  hmRenderAll();
}
function hmPrevPeriod() { hmPeriodOffset--; hmRenderAll(); }
function hmNextPeriod() { hmPeriodOffset++; hmRenderAll(); }

// 日期选择器回调
function hmOnDatePick(value) {
  if (!value) return;
  hmAnchorDate = value;
  hmPeriodOffset = 0;
  hmRenderAll();
}

// 点击时间标签弹出日期选择器
function hmShowDatePicker() {
  var picker = document.getElementById('hmDatePicker');
  if (!picker) return;
  picker.value = hmAnchorDate || hmFmtDate(new Date());
  picker.focus();
  if (picker.showPicker) {
    try { picker.showPicker(); } catch(e) { /* fallback below */ }
  }
  // 兼容性回退：暂时显示并触发原生点击
  var wasHidden = picker.style.opacity === '0';
  picker.style.opacity = '0.01';
  picker.style.left = '0px';
  picker.style.top = '0px';
  picker.click();
  if (wasHidden) {
    setTimeout(function() {
      picker.style.opacity = '0';
      picker.style.left = '0';
      picker.style.top = '0';
    }, 500);
  }
}

function hmRenderAll() {
  if (hmCurrentView === 'week') hmRenderWeek();
  else if (hmCurrentView === 'month') hmRenderMonth();
  else hmRenderYear();
}

// --- 周视图 ---
function hmRenderWeek() {
  var today = new Date();
  var base = hmAnchorDate ? new Date(hmAnchorDate + 'T00:00:00') : new Date(today);
  var current = new Date(base);
  current.setDate(base.getDate() - base.getDay() + 1 + hmPeriodOffset * 7);
  var end = new Date(current);
  end.setDate(current.getDate() + 6);
  document.getElementById('hmTimeLabel').textContent =
    (current.getMonth()+1) + '月' + current.getDate() + '日 - ' + (end.getMonth()+1) + '月' + end.getDate() + '日';

  var start = new Date(current);
  var dayNames = ['日','一','二','三','四','五','六'];
  var html = '<div class="hm-week-view">';
  for (var i = 0; i < 7; i++) {
    var d = new Date(start);
    d.setDate(start.getDate() + i);
    var ds = hmFmtDate(d);
    var energy = hmGetEnergy(ds);
    var level = hmGetLevel(ds);
    var cls = energy ? hmGetEnergyClasses(energy, level) : '';
    var isToday = ds === hmFmtDate(today);
    var todayRing = isToday ? 'box-shadow: 0 0 0 2px #5a4d72;' : '';
    html += '<div class="hm-week-cell">' +
      '<div class="hm-week-dow' + (isToday ? ' today' : '') + '">' + dayNames[d.getDay()] + '</div>' +
      '<div class="hm-week-dot ' + cls + '" style="' + todayRing + '" onclick="openReceipt(\'' + ds + '\')" title="' + ds + '">' +
        (level > 0 ? d.getDate() : '') + '</div>' +
      '</div>';
  }
  html += '</div>';
  document.getElementById('hmWeekView').innerHTML = html;
}

// --- 月视图 ---
function hmRenderMonth() {
  var today = new Date();
  var base = hmAnchorDate ? new Date(hmAnchorDate + 'T00:00:00') : new Date(today);
  var baseYear = base.getFullYear();
  var baseMonth = base.getMonth();
  var d = new Date(baseYear, baseMonth + hmPeriodOffset, 1);
  var year = d.getFullYear();
  var month = d.getMonth();
  document.getElementById('hmTimeLabel').textContent = year + '年' + (month+1) + '月';

  var firstDay = new Date(year, month, 1);
  var daysInMonth = new Date(year, month+1, 0).getDate();
  var startDow = firstDay.getDay();
  var weekdays = ['日','一','二','三','四','五','六'];

  var html = '<div class="hm-month-calendar">';
  html += '<div class="hm-weekday-row">';
  for (var w = 0; w < 7; w++) html += '<div class="hm-weekday">' + weekdays[w] + '</div>';
  html += '</div><div class="hm-calendar-grid">';
  for (var i = 0; i < startDow; i++) html += '<div class="hm-cal-cell empty"></div>';
  for (var day = 1; day <= daysInMonth; day++) {
    var ds = year + '-' + String(month+1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
    var energy = hmGetEnergy(ds);
    var level = hmGetLevel(ds);
    var cls = energy ? hmGetEnergyClasses(energy, level) : '';
    var isToday = ds === hmFmtDate(today);
    var activityCls = level > 0 ? 'has-activity' : '';
    var todayCls = isToday ? 'is-today' : '';
    html += '<div class="hm-cal-cell ' + cls + ' ' + activityCls + ' ' + todayCls + '" onclick="openReceipt(\'' + ds + '\')" title="' + ds + '">' + day + '</div>';
  }
  html += '</div></div>';
  document.getElementById('hmMonthView').innerHTML = html;
}

// --- 年视图 ---
function hmRenderYear() {
  var today = new Date();
  var base = hmAnchorDate ? new Date(hmAnchorDate + 'T00:00:00') : new Date(today);
  var year = base.getFullYear() + hmPeriodOffset;
  document.getElementById('hmTimeLabel').textContent = year + '年';
  var monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  var html = '<div class="hm-year-view">';
  for (var m = 0; m < 12; m++) {
    var daysInMonth = new Date(year, m+1, 0).getDate();
    var grid = '';
    for (var day = 1; day <= daysInMonth; day++) {
      var ds = year + '-' + String(m+1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
      var energy = hmGetEnergy(ds);
      var level = hmGetLevel(ds);
      var cls = energy ? hmGetEnergyClasses(energy, level) : '';
      grid += '<div class="hm-year-cell ' + cls + '" onclick="openReceipt(\'' + ds + '\')"></div>';
    }
    html += '<div class="hm-year-month"><div class="hm-year-month-name">' + monthNames[m] + '</div><div class="hm-year-month-grid">' + grid + '</div></div>';
  }
  html += '</div>';
  document.getElementById('hmYearView').innerHTML = html;
}

// --- 时光小票 ---
function openReceipt(dateStr) {
  renderReceipt(dateStr);
  document.getElementById('receiptModal').classList.add('open');
}
function closeReceipt() {
  document.getElementById('receiptModal').classList.remove('open');
}

function renderReceipt(dateStr) {
  var d = new Date(dateStr);
  var weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
  var energy = hmGetEnergy(dateStr);
  var energyLabel = energy ? ({high:'充沛能量日', low:'温和能量日', rest:'休息能量日'}[energy] || '') : '未选能量';

  var dateLineHtml =
    d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') +
    ' ' + weekdays[d.getDay()] +
    ' · <span class="receipt-energy-label">' + energyLabel + '</span>';

  var logs = (state.dailyLogs && state.dailyLogs[dateStr]) || [];

  // 灵感牌
  var cardLog = logs.find(function(l) { return l.type === 'card'; });
  var inspireHtml = '';
  if (cardLog) {
    inspireHtml = '<div class="inspire-card">' +
      '<div class="inspire-label">— 今 日 灵 感 —</div>' +
      '<div class="inspire-card-name">' + escapeHtml(cardLog.cardName || '神谕牌') + '</div>' +
      '<div class="inspire-card-meaning">"' + escapeHtml(cardLog.cardMeaning || '') + '"</div>' +
      '</div>';
  }

  // 按类型分组
  var todos = logs.filter(function(l) { return l.type === 'todo'; });
  var routines = logs.filter(function(l) { return l.type === 'routine'; });
  var books = logs.filter(function(l) { return l.type === 'book'; });
  var diaries = logs.filter(function(l) { return l.type === 'diary'; });
  var meditations = logs.filter(function(l) { return l.type === 'meditation'; });

  var html = '<div class="receipt-date-line">' + dateLineHtml + '</div>' + inspireHtml;

  // 完成明细
  html += '<div class="receipt-section"><div class="receipt-section-title">' +
    '<span class="icon">✓</span><span>完成明细</span><span class="en">(TODOS)</span></div>';
  if (todos.length > 0) {
    todos.forEach(function(l) {
      html += '<div class="receipt-item"><span class="item-label">· ' + escapeHtml(l.label) + '</span><span class="item-time">' + l.time + '</span></div>';
    });
  } else {
    html += '<div class="receipt-empty">今天还没有完成的待办</div>';
  }
  html += '</div>';

  // 仪式打卡
  html += '<div class="receipt-section"><div class="receipt-section-title">' +
    '<span class="icon">♦</span><span>仪式打卡</span><span class="en">(RITUALS)</span></div>';
  if (routines.length > 0) {
    routines.forEach(function(l) {
      html += '<div class="receipt-item"><span class="item-label">· ' + escapeHtml(l.label) + '</span><span class="item-time">' + l.time + '</span></div>';
    });
  } else {
    html += '<div class="receipt-empty">今天还没有完成的仪式</div>';
  }
  html += '</div>';

  // 阅读足迹
  html += '<div class="receipt-section"><div class="receipt-section-title">' +
    '<span class="icon">▢</span><span>阅读足迹</span><span class="en">(READING)</span></div>';
  if (books.length > 0) {
    books.forEach(function(l) {
      html += '<div class="receipt-item"><span class="item-label">· ' + escapeHtml(l.label) + '</span><span class="item-time">' + l.time + '</span></div>';
    });
  } else {
    html += '<div class="receipt-empty">今天还没有阅读记录</div>';
  }
  html += '</div>';

  // 心流
  html += '<div class="receipt-section"><div class="receipt-section-title">' +
    '<span class="icon">◎</span><span>心流时刻</span><span class="en">(FLOW)</span></div>';
  if (meditations.length > 0) {
    meditations.forEach(function(l) {
      html += '<div class="receipt-item"><span class="item-label">· ' + escapeHtml(l.label) + '</span><span class="item-time">' + l.time + '</span></div>';
    });
  } else {
    html += '<div class="receipt-empty">今天还没有心流记录</div>';
  }
  html += '</div>';

  // 日记片段
  html += '<div class="receipt-section"><div class="receipt-section-title">' +
    '<span class="icon">✎</span><span>日记片段</span><span class="en">(DIARY)</span></div>';
  if (diaries.length > 0) {
    diaries.forEach(function(l) {
      html += '<div class="receipt-diary-block">' +
        '<div class="receipt-diary-header" onclick="toggleReceiptDiary(this)">' +
        '<span class="receipt-diary-title">' + escapeHtml(l.title || '无标题') + '</span>' +
        '<span class="receipt-diary-toggle">▼</span></div>' +
        '<div class="receipt-diary-body collapsed">' + escapeHtml(l.text || '').replace(/\n/g, '<br>') + '</div>' +
        '</div>';
    });
  } else {
    html += '<div class="receipt-empty">今天还没有写日记</div>';
  }
  html += '</div>';

  // 底部
  html += '<div class="receipt-footer">' +
    '<div class="receipt-barcode">||| || |||| ||| || |||| ||</div>' +
    '<div class="receipt-thanks">THANK YOU FOR LIVING FULLY TODAY</div>' +
    '<button class="receipt-share-btn" onclick="shareReceipt()">保存小票分享图</button>' +
    '</div>';

  document.getElementById('receiptContent').innerHTML = html;
}

function toggleReceiptDiary(header) {
  var body = header.nextElementSibling;
  var toggle = header.querySelector('.receipt-diary-toggle');
  body.classList.toggle('collapsed');
  if (toggle) toggle.style.transform = body.classList.contains('collapsed') ? 'rotate(0deg)' : 'rotate(180deg)';
}

function shareReceipt() {
  showToast('分享功能开发中');
}
