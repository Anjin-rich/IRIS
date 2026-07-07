function showBackupModal() {
  document.getElementById('backupModal').classList.add('open');
  toggleSidebar();
}

function closeBackupModal() { document.getElementById('backupModal').classList.remove('open'); }

function exportBackup() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Iris_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 数据已导出');
  closeBackupModal();
}

function handleBackupImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (confirm('⚠️ 导入将覆盖当前所有数据，确认继续？')) {
        Object.assign(state, data);
        if (!state.stats) state.stats = {};
        ['todoCount', 'studyCount', 'workCount', 'sportCount', 'readCount', 'diaryCount',
          'afkCount', 'bookCount', 'achievementExp', 'signinExp'
        ].forEach(k => {
          if (state.stats[k] === undefined) state.stats[k] = 0;
        });
        if (!state.ownedPets) state.ownedPets = [];
        if (!state.customMoods) state.customMoods = [];
        if (!state.ownedDecorations) state.ownedDecorations = [];
        if (!state.dailyTodoExp) state.dailyTodoExp = {};
        if (!state.settings) state.settings = { sound: true };
        if (!state.petMood) state.petMood = {};
        if (!state.energyHistory) state.energyHistory = {};
        if (!state.hiddenTodoIds) state.hiddenTodoIds = [];
        if (!state.energySpends) state.energySpends = [];
        if (!state.shopItems) state.shopItems = DEFAULT_SHOP_ITEMS;
        if (!state.meditationRecords) state.meditationRecords = [];
        if (!state.customMoodsDate) state.customMoodsDate = null;
        if (!state.routineFoldState) state.routineFoldState = {};
        if (state.energySelectionCount === undefined) state.energySelectionCount = 0;
        if (!state.energySelectionDate) state.energySelectionDate = null;
        saveState();
        showToast('📥 数据导入成功！');
        setTimeout(() => location.reload(), 500);
      }
    } catch (err) {
      showToast('❌ 导入失败，文件格式错误');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function showStorageFullModal() { document.getElementById('storageFullModal').classList.add('open'); }

function closeStorageFullModal() { document.getElementById('storageFullModal').classList.remove('open'); }

function openResetConfirmModal() {
  document.getElementById('resetConfirmModal').classList.add('open');
  toggleSidebar();
}

function closeResetConfirmModal() { document.getElementById('resetConfirmModal').classList.remove('open'); }

function confirmReset() {
  localStorage.removeItem('IrisState');
  location.reload();
}
