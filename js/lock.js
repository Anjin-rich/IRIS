function showSettingsModal() {
  if (!state.settings) state.settings = { sound: true };
  document.getElementById('settingSoundToggle').checked = state.settings.sound !== false;
  document.querySelectorAll('.theme-select-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === state.theme);
  });
  document.getElementById('settingsModal').classList.add('open');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('open');
}

function applySettings() {
  if (!state.settings) state.settings = {};
  state.settings.sound = document.getElementById('settingSoundToggle').checked;
  saveState();
}

function openFeedbackModal() {
  document.getElementById('feedbackModal').classList.add('open');
  document.getElementById('feedbackText').value = '';
  document.getElementById('feedbackContact').value = '';
  document.getElementById('feedbackStatus').textContent = '';
  document.getElementById('feedbackType').value = '功能建议';
  document.getElementById('feedbackSubmitBtn').disabled = false;
  document.getElementById('feedbackSubmitBtn').textContent = '提交';
}

function closeFeedbackModal() {
  document.getElementById('feedbackModal').classList.remove('open');
}

async function submitFeedback() {
  const text = document.getElementById('feedbackText').value.trim();
  const type = document.getElementById('feedbackType').value;
  const contact = document.getElementById('feedbackContact').value.trim();
  const statusEl = document.getElementById('feedbackStatus');
  const btn = document.getElementById('feedbackSubmitBtn');
  if (!text) { showToast('请填写反馈内容'); return; }
  btn.disabled = true;
  btn.textContent = '发送中…';
  statusEl.textContent = '';
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: 'c5ecff1c-27b4-4d68-93d5-4fc676126481',
        subject: `[Iris反馈] ${type}`,
        from_name: 'Iris 用户反馈',
        message: `类型：${type}\n内容：${text}${contact ? '\n联系方式：' + contact : ''}`,
        botcheck: false
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast('✅ 反馈已发送，感谢你的建议！');
      statusEl.textContent = '';
      closeFeedbackModal();
    } else {
      throw new Error('发送失败');
    }
  } catch (err) {
    statusEl.textContent = '⚠️ 发送失败，请稍后再试';
    btn.disabled = false;
    btn.textContent = '提交';
  }
}

function showLockSetupModal() {
  document.getElementById('lockSetupModal').classList.add('open');
  document.getElementById('lockPasswordInput').value = state.lockPassword || '';
  document.getElementById('lockPasswordInput').type = 'password';
  const btn = document.querySelector('#lockSetupModal .toggle-vis i');
  if (btn) btn.className = 'fa-regular fa-eye';
}

function closeLockSetup() {
  document.getElementById('lockSetupModal').classList.remove('open');
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.querySelector('i').className = 'fa-regular fa-eye-slash';
  } else {
    input.type = 'password';
    btn.querySelector('i').className = 'fa-regular fa-eye';
  }
}

function saveLockPassword() {
  const pwd = document.getElementById('lockPasswordInput').value.trim();
  if (pwd === '') {
    state.lockPassword = '';
    saveState();
    showToast('🔓 锁屏密码已清除');
    closeLockSetup();
    return;
  }
  if (/^\d{4}$/.test(pwd)) {
    state.lockPassword = pwd;
    saveState();
    showToast('🔒 锁屏密码已设置');
    closeLockSetup();
  } else {
    showToast('❌ 请输入4位数字');
  }
}

let lockTempPin = '';

function showLockScreen() {
  if (state.lockPassword && state.lockPassword.length === 4) {
    document.getElementById('lockScreen').classList.add('open');
    lockTempPin = '';
    updatePinDisplay();
    document.getElementById('lockError').textContent = '';
  }
}

function lockInput(digit) {
  if (lockTempPin.length < 4) {
    lockTempPin += digit;
    updatePinDisplay();
  }
  if (lockTempPin.length === 4) { lockConfirm(); }
}

function lockDelete() {
  lockTempPin = lockTempPin.slice(0, -1);
  updatePinDisplay();
  document.getElementById('lockError').textContent = '';
}

function lockConfirm() {
  if (lockTempPin.length !== 4) { document.getElementById('lockError').textContent = '请输入4位数字'; return; }
  if (lockTempPin === state.lockPassword) {
    document.getElementById('lockScreen').classList.remove('open');
    document.getElementById('lockError').textContent = '';
    showToast('🔓 解锁成功');
  } else {
    document.getElementById('lockError').textContent = '❌ 密码错误，请重试';
    lockTempPin = '';
    updatePinDisplay();
  }
}

function updatePinDisplay() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((dot, i) => { dot.classList.toggle('filled', i < lockTempPin.length); });
}
