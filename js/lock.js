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

// ===== 锁屏密码设置 =====
function showLockSetupModal() {
  document.getElementById('lockSetupModal').classList.add('open');
  initLockSetupInputs();
}

function closeLockSetup() {
  document.getElementById('lockSetupModal').classList.remove('open');
  clearLockSetupInputs();
}

function initLockSetupInputs() {
  const passwordInputs = document.querySelectorAll('#lockPasswordInputs .lock-digit-input');
  const recoveryInputs = document.querySelectorAll('#lockRecoveryInputs .lock-digit-input');
  
  const existingPassword = state.lockPassword || '';
  const existingRecovery = state.lockRecoveryKey || '';
  
  passwordInputs.forEach((input, i) => {
    input.value = existingPassword[i] || '';
    input.type = 'password';
  });
  
  recoveryInputs.forEach((input, i) => {
    input.value = existingRecovery[i] || '';
  });
  
  setupDigitInputs('#lockPasswordInputs');
  setupDigitInputs('#lockRecoveryInputs');
  
  if (passwordInputs[0]) passwordInputs[0].focus();
}

function setupDigitInputs(containerSelector) {
  const inputs = document.querySelectorAll(`${containerSelector} .lock-digit-input`);
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = value;
      if (value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
    input.addEventListener('focus', () => {
      input.select();
    });
    input.addEventListener('keypress', (e) => {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });
  });
}

function clearLockSetupInputs() {
  document.querySelectorAll('#lockPasswordInputs .lock-digit-input').forEach(input => {
    input.value = '';
  });
  document.querySelectorAll('#lockRecoveryInputs .lock-digit-input').forEach(input => {
    input.value = '';
  });
}

function saveLockPassword() {
  const passwordInputs = document.querySelectorAll('#lockPasswordInputs .lock-digit-input');
  const recoveryInputs = document.querySelectorAll('#lockRecoveryInputs .lock-digit-input');
  
  let password = '';
  passwordInputs.forEach(input => { password += input.value; });
  
  let recoveryKey = '';
  recoveryInputs.forEach(input => { recoveryKey += input.value; });
  
  if (password === '' && recoveryKey === '') {
    state.lockPassword = '';
    state.lockRecoveryKey = '';
    saveState();
    showToast('锁屏密码已清除');
    closeLockSetup();
    return;
  }
  
  if (password !== '' && !/^\d{4}$/.test(password)) {
    showToast('请输入完整的4位数字密码');
    return;
  }
  
  if (recoveryKey !== '' && !/^\d{4}$/.test(recoveryKey)) {
    showToast('请输入完整的4位生日日期');
    return;
  }
  
  state.lockPassword = password;
  state.lockRecoveryKey = recoveryKey;
  saveState();
  showToast('锁屏密码已设置');
  closeLockSetup();
}

// ===== 锁屏解锁 =====
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
  if (lockTempPin.length === 4) {
    setTimeout(() => lockConfirm(), 150);
  }
}

function lockDelete() {
  lockTempPin = lockTempPin.slice(0, -1);
  updatePinDisplay();
  document.getElementById('lockError').textContent = '';
}

function lockConfirm() {
  if (lockTempPin.length !== 4) {
    document.getElementById('lockError').textContent = '请输入4位数字';
    return;
  }
  if (lockTempPin === state.lockPassword) {
    document.getElementById('lockScreen').classList.remove('open');
    document.getElementById('lockError').textContent = '';
    lockTempPin = '';
    updatePinDisplay();
    showToast('解锁成功');
  } else {
    document.getElementById('lockError').textContent = '密码错误，请重试';
    lockTempPin = '';
    updatePinDisplay();
  }
}

function updatePinDisplay() {
  const dots = document.querySelectorAll('#pinDisplay .pin-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < lockTempPin.length);
  });
}

// ===== 备用秘钥解锁 =====
function openRecoveryScreen() {
  if (!state.lockRecoveryKey || state.lockRecoveryKey.length !== 4) {
    showToast('未设置备用秘钥');
    return;
  }
  document.getElementById('lockRecoveryScreen').classList.add('open');
  document.getElementById('recoveryError').textContent = '';
  const inputs = document.querySelectorAll('#recoveryVerifyInputs .lock-digit-input');
  inputs.forEach(input => { input.value = ''; });
  setupDigitInputs('#recoveryVerifyInputs');
  if (inputs[0]) inputs[0].focus();
}

function closeRecoveryScreen() {
  document.getElementById('lockRecoveryScreen').classList.remove('open');
  lockTempPin = '';
  updatePinDisplay();
}

function verifyRecoveryKey() {
  const inputs = document.querySelectorAll('#recoveryVerifyInputs .lock-digit-input');
  let verifyKey = '';
  inputs.forEach(input => { verifyKey += input.value; });
  
  if (verifyKey.length !== 4) {
    document.getElementById('recoveryError').textContent = '请输入完整的4位秘钥';
    return;
  }
  
  if (verifyKey === state.lockRecoveryKey) {
    document.getElementById('lockRecoveryScreen').classList.remove('open');
    document.getElementById('lockScreen').classList.remove('open');
    document.getElementById('recoveryError').textContent = '';
    lockTempPin = '';
    updatePinDisplay();
    showToast('验证成功，已解锁');
  } else {
    document.getElementById('recoveryError').textContent = '秘钥错误，请重试';
    const inputs = document.querySelectorAll('#recoveryVerifyInputs .lock-digit-input');
    inputs.forEach(input => { input.value = ''; });
    if (inputs[0]) inputs[0].focus();
  }
}

function closeRecoveryScreen() {
  document.getElementById('lockRecoveryScreen').classList.remove('open');
  lockTempPin = '';
  updatePinDisplay();
}
