// ============================================================
//  Core Energy Functions
// ============================================================

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
//  Energy Selection + Long Press Interaction
// ============================================================

// Energy messages
const ENERGY_MESSAGES = {
  high: [
    '你身上有光，去把今天点亮吧。',
    '我生机勃勃，我爱得容易，没有人在我之上。',
    '我可以去任何地方，做任何事情。今天，世界是我的牡蛎。',
    '我自己的声音，今天，它很响亮，它很清晰。',
    '我选择快乐，它是我抵抗世界的方式。',
    '我感觉自己像一匹待跑的马，骨骼里都是风。',
    '是的，我可以。这个词组里藏着整个宇宙的肯定。',
    '像一棵树一样，向上，向着光，把根扎得更深。',
    '把今天的干劲拧成一股绳，去拉动你想搬的山。',
    '别浪费这股劲儿，它攒了一整个深睡眠才赶来见你。',
    '奔跑吧，风会接住你。'
  ],
  low: [
    '缓慢也是速度的一种，温柔也是力量的一种。',
    '不必匆忙。不必火花四溅。不必成为别人，只需做自己。',
    '我仍有热情，给寂静，给等待，给尚未到来的明天。',
    '耐心，是我今天唯一的任务。',
    '像月亮一样，圆缺有时。此刻的黯淡，只是光在另一面。',
    '我想，比起太阳，我更愿意做一盏灯——不必照亮全世界，只照亮眼前的路。',
    '有时，仅仅是把双脚放在地板上，就是一种胜利。',
    '省电模式下，只做最重要的小事，比如呼吸，比如喝水。',
    '像一棵傍晚的树，安静地站着就很好了。',
    '今天不和世界赛跑，陪着影子散步就好。',
    '允许今天的自己，是一朵云，飘到哪里算哪里。'
  ],
  rest: [
    '休息不是停滞，是另一种形式的生长。',
    '这间房间，是我自己的房间。',
    '我关上门，把世界留在外面，这样我才能把自己留在里面。',
    '无所事事的重要，在于它是灵感的温床。',
    '躺在床上，让思绪漫游，这不是懒惰，这是工作——是灵魂的工作。',
    '冬天是用来休息的季节，土地在沉睡中积蓄力量，你也一样。',
    '我什么也不做，就这样待着。这本身就是一种了不起的抵抗。',
    '一个人待着的时候，我并不孤单。我与我体内的千万个自己相聚。',
    '世界不会趁你睡着就塌掉，放心闭眼。',
    '被子是白天的括号，把今天轻轻括起来，先不解释了。',
    '把疲惫叠好放进抽屉，明天再拿出来洗。',
    '你不需要永远在线，你可以暂时离开一下。'
  ]
};

// Insert zero-width space after comma to hint browser to break line
function getRandomMessage(mode) {
  const msgs = ENERGY_MESSAGES[mode] || ENERGY_MESSAGES.rest;
  let msg = msgs[Math.floor(Math.random() * msgs.length)];
  msg = msg.replace(/[，,]\s*/g, (match) => match + '\u200B');
  return msg;
}

// Cross-day reset check
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
      if (cardEl) cardEl.classList.remove('show');
    }
    saveState();
    renderTodos();
    updateEnergyUI();
  }
}

// Select energy mode
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
    showToast('长按卡片可重置选择');
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
  } else {
    showToast(`✨ 免费选择（第 ${state.energySelectionCount} 次）`);
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
  cardEl2.classList.add('show');
  cardEl2.className = 'energy-bar-card show';
  cardEl2.classList.add(`mode-${mode}`);
  const msg = getRandomMessage(mode);
  contentEl.textContent = msg;
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
  }

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

  let timer = null;
  let isCooldown = false;
  const DURATION = 600;

  const startPress = (e) => {
    e.preventDefault();
    if (!cardEl.classList.contains('show')) return;
    if (isCooldown) return;

    cardEl.classList.add('long-press-active');

    timer = setTimeout(() => {
      resetEnergySelection();
      cardEl.classList.remove('long-press-active');
      cardEl.classList.add('long-press-done');
      isCooldown = true;
      setTimeout(() => {
        cardEl.classList.remove('long-press-done');
        isCooldown = false;
      }, 500);
      timer = null;
    }, DURATION);
  };

  const endPress = (e) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    cardEl.classList.remove('long-press-active');
  };

  cardEl.removeEventListener('pointerdown', startPress);
  cardEl.removeEventListener('pointerup', endPress);
  cardEl.removeEventListener('pointercancel', endPress);

  cardEl.addEventListener('pointerdown', startPress);
  cardEl.addEventListener('pointerup', endPress);
  cardEl.addEventListener('pointercancel', endPress);
}

// ============================================================
//  Update Energy UI
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

  const streakDisplay = document.getElementById('energyStreakDisplay');
  if (streakDisplay) {
    streakDisplay.textContent = `🔥 连续 ${state.energyStreak || 0} 天`;
  }
}
