function init() {
  checkEnergySelectionReset();

  if (!state.shopItems || state.shopItems.length === 0) {
    state.shopItems = DEFAULT_SHOP_ITEMS;
    saveState();
  }
  resetCustomMoods();
  updateSidebarInfo();
  updatePetUI();
  updateLockBadge();
  renderMoodSelector();
  renderTodos();
  renderRoutines();
  renderAchievements();
  renderDiaries();
  renderCalendar();
  renderBooks();
  updateEnergyDisplay();
  updateAfkUI();
  updateTotalMeditationDisplay();
  updateEnergyUI();
  updateDiaryRemain();

  const today = getTodayDateKey();
  const currentMode = state.energyHistory[today];
  if (currentMode) {
    const selectEl = document.getElementById('energySelect');
    const cardEl = document.getElementById('energyCard');
    const contentEl = document.getElementById('energyCardContent');
    if (selectEl) selectEl.classList.add('hidden');
    if (cardEl) {
      cardEl.classList.add('show');
      cardEl.className = 'energy-bar-card show';
      cardEl.classList.add(`state-${currentMode}`);
      const barEl = cardEl.closest('.energy-bar-compact');
      if (barEl) {
        barEl.classList.remove('state-high', 'state-low', 'state-rest');
        barEl.classList.add(`state-${currentMode}`);
      }
    }
    if (contentEl) {
      const msg = getRandomMessage(currentMode);
      contentEl.textContent = msg;
    }
    updateWeatherEffect(currentMode);
  } else {
    const selectEl = document.getElementById('energySelect');
    const cardEl = document.getElementById('energyCard');
    if (selectEl) selectEl.classList.remove('hidden');
    if (cardEl) {
      cardEl.classList.remove('show');
      cardEl.className = 'energy-bar-card';
      const barEl = cardEl.closest('.energy-bar-compact');
      if (barEl) {
        barEl.classList.remove('state-high', 'state-low', 'state-rest');
      }
    }
    updateWeatherEffect(null);
  }

  setupEnergyCardLongPress();
  setupTodoListDelegation();

  document.getElementById('diaryPrompt').textContent = '💭 ' + getRandomPrompt();
  if (state.currentAfk && !state.currentAfk.isPaused) {
    startAfkTimer();
    document.getElementById('meditationCircle').classList.add('breathing');
  }
  document.getElementById('todoInput').addEventListener('keydown', e => {
    if (e.key === 'Enter')
      addTodo();
  });
  document.getElementById('diaryInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.ctrlKey) saveDiary();
  });
  document.getElementById('editDiaryModal').addEventListener('click', function (e) {
    if (e.target === this) closeEditDiary();
  });
  document.getElementById('diaryViewerModal').addEventListener('click', function (e) {
    if (e.target === this) closeDiaryViewer();
  });
  checkGenAchievements();
  if (state.isFirstLaunch) {
    setTimeout(startGuide, 500);
  }
  if (state.lockPassword && state.lockPassword.length === 4) {
    setTimeout(showLockScreen, 400);
  }
  console.log('🌸 Iris v4.2 手账版 · 能量即选择');
}

init();
