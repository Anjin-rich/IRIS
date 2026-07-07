function saveState() {
  try {
    localStorage.setItem('IrisState', JSON.stringify(state));
  } catch (e) {
    const isQuota = e.name === 'QuotaExceededError' ||
      e.code === 22 ||
      e.code === 1014 ||
      (typeof DOMException !== 'undefined' && e instanceof DOMException && e.name === 'QuotaExceededError');
    if (isQuota) {
      showStorageFullModal();
    }
    // 即使存储失败也更新UI，避免界面卡死
  }
  updateEnergyDisplay();
  updateSidebarInfo();
  updatePetUI();
  updateLockBadge();
  renderMoodSelector();
  updateEnergyUI();
  updateDiaryRemain();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

function updateSidebarInfo() {
  document.getElementById('sidebarName').textContent = state.userName || '旅者';
  document.getElementById('sidebarId').textContent = 'ID: ' + (state.userId || 'LQ-0001');
  const avatar = document.getElementById('sidebarAvatar');
  if (state.avatar) avatar.innerHTML = `<img src="${state.avatar}" alt="avatar">`;
  else avatar.innerHTML = '<i class="fa-regular fa-user"></i>';
  const headerAvatar = document.getElementById('headerAvatar');
  if (state.avatar) headerAvatar.innerHTML = `<img src="${state.avatar}" alt="avatar">`;
  else headerAvatar.innerHTML = '<i class="fa-regular fa-user"></i>';
}

function changeAvatar() { document.getElementById('avatarInput').click(); }

function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    state.avatar = ev.target.result;
    saveState();
    updateSidebarInfo();
    showToast('✅ 头像已更新');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function updateLockBadge() {
  const badge = document.getElementById('lockStatusBadge');
  if (state.lockPassword && state.lockPassword.length === 4) {
    badge.textContent = '已设置';
    badge.style.color = 'var(--accent-yellow-dark)';
  } else {
    badge.textContent = '未设置';
    badge.style.color = 'var(--text-sub)';
  }
}

function editUserName() {
  document.getElementById('editNameInput').value = state.userName || '旅者';
  document.getElementById('editNameModal').classList.add('open');
}

function closeEditNameModal() { document.getElementById('editNameModal').classList.remove('open'); }

function saveUserName() {
  const name = document.getElementById('editNameInput').value.trim();
  if (!name) { showToast('名字不能为空'); return; }
  state.userName = name;
  saveState();
  showToast('✅ 名字已更新');
  closeEditNameModal();
}

function toggleGroup(groupId) {
  const body = document.getElementById(groupId + 'Body');
  const chevron = document.getElementById(groupId + 'Chevron');
  if (body) { body.classList.toggle('open'); if (chevron) chevron.classList.toggle('open'); }
}
