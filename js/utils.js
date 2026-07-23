// ============================================================
//  工具函数
// ============================================================
function applyTheme(theme) {
  const body = document.body;
  if (theme === 'dark') body.classList.add('dark-theme');
  else body.classList.remove('dark-theme');
  state.theme = theme;
  localStorage.setItem('IrisState', JSON.stringify(state));
  document.querySelectorAll('.theme-select-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

function setThemeFromSettings(theme) {
  applyTheme(theme);
  showToast(theme === 'light' ? '☀️ 已切换至浅色模式' : '🌙 已切换至深色模式');
}

if (state.theme === 'dark') applyTheme('dark');
else applyTheme('light');

let toastTimer = null;

function showToast(msg, duration) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration || 2200);
}

function showToastOnce(key, msg, duration) {
  if (state.shownToasts && state.shownToasts.includes(key)) return;
  showToast(msg, duration);
  if (state.shownToasts) {
    state.shownToasts.push(key);
    saveState();
  }
}

function getBeijingDateKey(date) {
  const d = date || new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const beijing = new Date(utc + 8 * 3600000);
  return beijing.toISOString().slice(0, 10);
}

function getTodayDateKey() {
  return getBeijingDateKey();
}

function triggerVibrate() {
  try { if (navigator.vibrate) navigator.vibrate([60, 40, 80]); } catch (e) { }
}

function toggleFold(id) {
  const body = document.getElementById(id);
  const chevron = document.getElementById(id + 'Chevron');
  if (body) { body.classList.toggle('open'); if (chevron) chevron.classList.toggle('open'); }
}

function openRulesModal() { document.getElementById('rulesModal').classList.add('open'); }

function closeRulesModal() { document.getElementById('rulesModal').classList.remove('open'); }

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
