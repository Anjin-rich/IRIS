// ============================================================
//  工具函数
// ============================================================

// 兜底：pet.js 未加载时防止 ReferenceError
if (typeof updatePetUI !== 'function') {
  window.updatePetUI = function() {};
}
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

let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstallPrompt = e; });

function showInstallModal() {
  const steps = document.getElementById('installSteps');
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isChrome = /Chrome/i.test(ua) && !/Edg/i.test(ua);
  const isEdge = /Edg/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
  let html = '';

  if (isChrome || isEdge) {
    html = '<p style="font-size:2rem;">⬇️</p>' +
      '<p><b>添加到主屏幕</b></p>' +
      '<p style="font-size:0.85rem;color:var(--text-sub);">点击浏览器地址栏右侧的 <b>安装</b> 按钮<br>或点击菜单 → <b>安装应用</b></p>' +
      '<button onclick="triggerInstall()" style="margin-top:12px;padding:10px 24px;border-radius:20px;background:var(--main-purple);color:white;border:none;font-size:0.95rem;cursor:pointer;">一键安装</button>';
  } else if (isIOS) {
    html = '<p style="font-size:2rem;">📲</p>' +
      '<p><b>Safari 浏览器</b></p>' +
      '<p style="font-size:0.85rem;color:var(--text-sub);">1. 用 <b>Safari</b> 打开此页面<br>2. 点击底部 <b>分享按钮</b> (⬆️)<br>3. 选择 <b>添加到主屏幕</b></p>' +
      '<p style="font-size:0.75rem;color:var(--text-sub);margin-top:8px;">其他浏览器不支持安装，请复制链接到 Safari 打开</p>';
  } else if (isAndroid) {
    html = '<p style="font-size:2rem;">📲</p>' +
      '<p><b>添加到主屏幕</b></p>' +
      '<p style="font-size:0.85rem;color:var(--text-sub);">点击浏览器菜单 → <b>添加到主屏幕</b><br>或 <b>安装应用</b></p>' +
      '<p style="font-size:0.75rem;color:var(--text-sub);margin-top:8px;">推荐使用 Chrome / Edge 浏览器获得最佳体验</p>';
  } else {
    html = '<p style="font-size:2rem;">📲</p>' +
      '<p><b>添加到主屏幕</b></p>' +
      '<p style="font-size:0.85rem;color:var(--text-sub);">点击浏览器菜单 → <b>添加到主屏幕</b>或<b>安装应用</b></p>';
  }
  steps.innerHTML = html;
  document.getElementById('installModal').classList.add('open');
}

async function triggerInstall() {
  if (!deferredInstallPrompt) {
    showToast('请使用浏览器菜单中的「安装应用」选项');
    return;
  }
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === 'accepted') showToast('🎉 安装成功！');
  deferredInstallPrompt = null;
  closeModal('installModal');
}


