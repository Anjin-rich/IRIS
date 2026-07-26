// ============================================================
//  Core Energy Functions
// ============================================================

function updateWeatherEffect(mode) {}

function getEnergyBalance() {
  return (state.stats.achievementExp || 0) + (state.stats.signinExp || 0);
}

function updateEnergyDisplay() {
  document.getElementById('headerEnergy').textContent = getEnergyBalance();
}

function addEnergy(amount) {
  state.stats.achievementExp = (state.stats.achievementExp || 0) + amount;
  saveState();
  updateEnergyDisplay();
}

function spendEnergy(amount) {
  const current = getEnergyBalance();
  if (current < amount) return false;
  let remaining = amount;
  const ach = state.stats.achievementExp || 0;
  if (ach >= remaining) {
    state.stats.achievementExp -= remaining;
  } else {
    state.stats.achievementExp = 0;
    remaining -= ach;
    state.stats.signinExp = (state.stats.signinExp || 0) - remaining;
    if (state.stats.signinExp < 0) state.stats.signinExp = 0;
  }
  saveState();
  updateEnergyDisplay();
  return true;
}

// ============================================================
//  Energy Messages (original set)
// ============================================================

const ENERGY_MESSAGES = {
  high: [
    '你身上有光，\n去把今天点亮吧。',
    '我生机勃勃，我爱得容易，\n没有人在我之上。',
    '我可以去任何地方，做任何事情，\n今天世界是我的牡蛎。',
    '我自己的声音，今天，\n它很响亮，它很清晰。',
    '我选择快乐，\n它是我抵抗世界的方式。',
    '我感觉自己像一匹待跑的马，\n骨骼里都是风。',
    '是的，我可以，\n这个词组里藏着整个宇宙的肯定。',
    '像一棵树一样，向上向着光，\n把根扎得更深。',
    '把今天的干劲拧成一股绳，\n去拉动你想搬的山。',
    '别浪费这股劲儿，\n它攒了一整个深睡眠才赶来见你。',
    '奔跑吧，\n风会接住你。'
  ],
  low: [
    '缓慢也是速度的一种，\n温柔也是力量的一种。',
    '不必匆忙，不必火花四溅，\n不必成为别人，只需做自己。',
    '我仍有热情，给寂静给等待，\n给尚未到来的明天。',
    '耐心，是我今天唯一的任务。',
    '像月亮一样圆缺有时，\n此刻的黯淡只是光在另一面。',
    '比起太阳，我更愿意做一盏灯——\n不必照亮全世界，只照亮眼前的路。',
    '有时仅仅是把双脚放在地板上，\n就是一种胜利。',
    '省电模式下只做最重要的小事，\n比如呼吸，比如喝水。',
    '像一棵傍晚的树，\n安静地站着就很好了。',
    '今天不和世界赛跑，\n陪着影子散步就好。',
    '允许今天的自己是一朵云，\n飘到哪里算哪里。'
  ],
  rest: [
    '休息不是停滞，\n是另一种形式的生长。',
    '这间房间，是我自己的房间。',
    '我关上门把世界留在外面，\n这样我才能把自己留在里面。',
    '无所事事的重要，\n在于它是灵感的温床。',
    '躺在床上让思绪漫游，\n这不是懒惰，这是灵魂的工作。',
    '冬天是休息的季节，\n土地在沉睡中积蓄力量，你也一样。',
    '我什么也不做就这样待着，\n这本身就是一种了不起的抵抗。',
    '一个人待着的时候并不孤单，\n我与体内的千万个自己相聚。',
    '世界不会趁你睡着就塌掉，\n放心闭眼。',
    '被子是白天的括号，\n把今天轻轻括起来，先不解释了。',
    '把疲惫叠好放进抽屉，\n明天再拿出来洗。',
    '你不需要永远在线，\n你可以暂时离开一下。'
  ]
};

function getRandomMessage(mode) {
  const msgs = ENERGY_MESSAGES[mode] || ENERGY_MESSAGES.rest;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// ============================================================
//  Energy Selection
// ============================================================

function checkEnergySelectionReset() {
  const today = getTodayDateKey();
  if (state.energySelectionDate !== today) {
    state.energySelectionCount = 0;
    state.energySelectionDate = today;
    if (state.energyHistory && state.energyHistory[today]) {
      delete state.energyHistory[today];
      state.energyMode = null;
      state.hiddenTodoIds = [];
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
    saveState();
    renderTodos();
    updateEnergyUI();
  }
}

function selectEnergy(mode) {
  checkEnergySelectionReset();

  const today = getTodayDateKey();
  const currentMode = state.energyHistory[today];

  if (currentMode === mode) {
    showToast('已处于该能量模式');
    return;
  }

  const cardEl = document.getElementById('energyCard');
  if (cardEl && cardEl.classList.contains('show')) {
    return;
  }

  if (state.energySelectionDate !== today) {
    state.energySelectionDate = today;
    state.energySelectionCount = 0;
  }

  state.energySelectionCount++;

  let cost = 0;
  if (state.energySelectionCount > 2) {
    cost = 5;
  }

  if (cost > 0) {
    if (!spendEnergy(cost)) {
      showToast(`能量不足，需要 ${cost} 能量`);
      state.energySelectionCount--;
      saveState();
      return;
    }
    showToast(`消耗 ${cost} 能量切换能量模式`);
  }

  state.energyHistory[today] = mode;
  state.energyMode = mode;

  if (mode === 'low') {
    const undone = state.todos.filter(t => !t.done);
    state.hiddenTodoIds = undone.slice(2).map(t => t.id);
  } else if (mode === 'rest') {
    const undone = state.todos.filter(t => !t.done);
    state.hiddenTodoIds = undone.map(t => t.id);
  } else {
    state.hiddenTodoIds = [];
  }

  saveState();
  renderTodos();
  updateEnergyUI();

  // Switch UI
  const selectEl = document.getElementById('energySelect');
  const cardEl2 = document.getElementById('energyCard');
  const contentEl = document.getElementById('energyCardContent');

  selectEl.classList.add('hidden');
  cardEl2.className = 'energy-bar-card show';
  cardEl2.classList.add(`state-${mode}`);
  const barEl = cardEl2.closest('.energy-bar-compact');
  if (barEl) {
    barEl.classList.remove('state-high', 'state-low', 'state-rest');
    barEl.classList.add(`state-${mode}`);
  }
  const msg = getRandomMessage(mode);
  contentEl.textContent = msg;
  updateWeatherEffect(mode);
}

// Reset energy selection (long press trigger)
function resetEnergySelection() {
  const today = getTodayDateKey();
  if (state.energyHistory && state.energyHistory[today]) {
    delete state.energyHistory[today];
  }
  state.energyMode = null;
  state.hiddenTodoIds = [];

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
  saveState();
  renderTodos();
  updateEnergyUI();

  if (navigator.vibrate) navigator.vibrate(50);
  showToast('已重置，可重新选择能量模式');
}

// ============================================================
//  Long Press Listener (Energy Card)
// ============================================================

function setupEnergyCardLongPress() {
  const cardEl = document.getElementById('energyCard');
  if (!cardEl) return;

  let pressTimer = null;
  let isLongPress = false;
  let startX, startY;
  let starIndex = 0;
  let starInterval = null;
  const stars = cardEl.parentElement.querySelectorAll('.press-star');

  const fillStar = (idx) => {
    if (stars[idx]) {
      stars[idx].textContent = '✦';
      stars[idx].classList.add('filled');
    }
  };

  const resetStars = () => {
    stars.forEach(s => {
      s.textContent = '✧';
      s.classList.remove('filled', 'vanish');
    });
    starIndex = 0;
  };

  const vanishStars = () => {
    stars.forEach((s, i) => {
      setTimeout(() => {
        s.classList.add('vanish');
      }, i * 60);
    });
    setTimeout(resetStars, 400);
  };

  const startPress = (e) => {
    if (!cardEl.classList.contains('show')) return;
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    isLongPress = false;
    starIndex = 0;
    resetStars();

    cardEl.classList.add('pressing');
    if (pressTimer) clearTimeout(pressTimer);

    pressTimer = setTimeout(() => {
      isLongPress = true;
      fillStar(3);
      if (starInterval) { clearInterval(starInterval); starInterval = null; }
      setTimeout(() => {
        vanishStars();
        resetEnergySelection();
        cardEl.classList.remove('pressing');
      }, 150);
    }, 550);

    if (starInterval) clearInterval(starInterval);
    starInterval = setInterval(() => {
      if (!cardEl.classList.contains('pressing') || isLongPress) {
        clearInterval(starInterval);
        starInterval = null;
        return;
      }
      if (starIndex < 3) {
        fillStar(starIndex);
        starIndex++;
      }
    }, 150);
  };

  const endPress = (e) => {
    if (isLongPress) return;
    clearTimeout(pressTimer);
    pressTimer = null;
    if (starInterval) { clearInterval(starInterval); starInterval = null; }
    vanishStars();
    cardEl.classList.remove('pressing');
  };

  const movePress = (e) => {
    if (!cardEl.classList.contains('pressing')) return;
    const touch = e.touches ? e.touches[0] : e;
    if (touch && startX !== undefined && startY !== undefined) {
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        clearTimeout(pressTimer);
        pressTimer = null;
        if (starInterval) { clearInterval(starInterval); starInterval = null; }
        vanishStars();
        cardEl.classList.remove('pressing');
        startX = undefined;
        startY = undefined;
      }
    }
  };

  cardEl.removeEventListener('mousedown', startPress);
  cardEl.removeEventListener('mouseup', endPress);
  cardEl.removeEventListener('mouseleave', endPress);
  cardEl.removeEventListener('mousemove', movePress);
  cardEl.removeEventListener('touchstart', startPress);
  cardEl.removeEventListener('touchend', endPress);
  cardEl.removeEventListener('touchcancel', endPress);
  cardEl.removeEventListener('touchmove', movePress);

  cardEl.addEventListener('mousedown', startPress);
  cardEl.addEventListener('mouseup', endPress);
  cardEl.addEventListener('mouseleave', endPress);
  cardEl.addEventListener('mousemove', movePress);

  cardEl.addEventListener('touchstart', startPress, { passive: false });
  cardEl.addEventListener('touchend', endPress, { passive: true });
  cardEl.addEventListener('touchcancel', endPress, { passive: true });
  cardEl.addEventListener('touchmove', movePress, { passive: true });
}

// ============================================================
//  Update Energy UI (fixes refresh bug)
// ============================================================

function updateEnergyUI() {
  const today = getTodayDateKey();
  const currentMode = state.energyHistory[today] || null;

  document.querySelectorAll('.energy-pill-btn').forEach(btn => {
    const mode = btn.dataset.mode;
    btn.classList.remove('active-high', 'active-low', 'active-rest');
    if (currentMode === mode) {
      btn.classList.add(`active-${mode}`);
    }
  });

  const cardEl = document.getElementById('energyCard');
  const contentEl = document.getElementById('energyCardContent');
  const selectEl = document.getElementById('energySelect');

  if (currentMode && cardEl && contentEl && selectEl) {
    // Restore card state on refresh
    selectEl.classList.add('hidden');
    cardEl.className = 'energy-bar-card show';
    cardEl.classList.add(`state-${currentMode}`);
    const barEl = cardEl.closest('.energy-bar-compact');
    if (barEl) {
      barEl.classList.remove('state-high', 'state-low', 'state-rest');
      barEl.classList.add(`state-${currentMode}`);
    }
    if (!contentEl.textContent) {
      contentEl.textContent = getRandomMessage(currentMode);
    }
    updateWeatherEffect(currentMode);
  } else {
    updateWeatherEffect(null);
  }
  setupEnergyCardLongPress();
}
