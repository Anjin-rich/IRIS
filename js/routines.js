let editingRoutineIdx = null;

function showEditRoutineName(idx, event) {
  if (event) event.stopPropagation();
  editingRoutineIdx = idx;
  const r = state.routines[idx];
  if (!r) return;
  document.getElementById('editRoutineNameInput').value = r.name;
  document.getElementById('editRoutineNameModal').classList.add('open');
}

function closeEditRoutineNameModal() {
  document.getElementById('editRoutineNameModal').classList.remove('open');
  editingRoutineIdx = null;
}

function confirmEditRoutineName() {
  const newName = document.getElementById('editRoutineNameInput').value.trim();
  if (!newName) { showToast('名称不能为空'); return; }
  if (editingRoutineIdx !== null) {
    state.routines[editingRoutineIdx].name = newName;
    saveState();
    renderRoutines();
  }
  closeEditRoutineNameModal();
}

// 折叠切换
function toggleRoutineFold(foldKey, event) {
  if (event) event.stopPropagation();
  if (state.routineFoldState[foldKey] === undefined) state.routineFoldState[foldKey] = true;
  state.routineFoldState[foldKey] = !state.routineFoldState[foldKey];
  saveState();
  renderRoutines();
}

// 删除仪式
function deleteRoutine(idx, event) {
  if (event) event.stopPropagation();
  if (confirm('确定删除这条成长仪式吗？')) {
    state.routines.splice(idx, 1);
    saveState();
    renderRoutines();
  }
}

// 核心渲染函数
function renderRoutines() {
  const container = document.getElementById('routineList');
  const today = getTodayDateKey();

  // 重置每日完成状态
  state.routines.forEach(r => {
    if (r.lastCompletedDate !== today) {
      r.completedToday = false;
    }
  });

  // 检测自动完成
  let needsSave = false;
  state.routines.forEach((r, idx) => {
    if (!r.completedToday && r.steps.length > 0 && r.steps.every(s => s.done)) {
      r.completedToday = true;
      r.lastCompletedDate = today;
      addEnergy(10);
      if (typeof logActivity === 'function') logActivity('routine', r.name);
      showToast(`🌟 仪式「${r.name}」完成！+10能量`);
      checkUnlock('routine_1', true);
      needsSave = true;
      setTimeout(() => {
        const cards = container.querySelectorAll('.routine-card');
        if (cards[idx]) {
          cards[idx].classList.add('completing');
          setTimeout(() => cards[idx].classList.remove('completing'), 1000);
          spawnRoutineCompleteParticles(cards[idx]);
        }
      }, 100);
    }
  });
  if (needsSave) saveState();

  if (state.routines.length === 0) {
    container.innerHTML = '';
    return;
  }

  // 构建每个仪式
  container.innerHTML = state.routines.map((r, idx) => {
    const isCompleted = r.completedToday || false;
    const steps = r.steps || [];
    const totalSteps = steps.length;
    let doneCount = steps.filter(s => s.done).length;
    let currentIdx = -1;
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i].done) { currentIdx = i; break; }
    }
    if (doneCount === totalSteps && totalSteps > 0) currentIdx = -1;

    const foldKey = r.id || 'routine_' + idx;
    const isOpen = state.routineFoldState[foldKey] !== undefined ? state.routineFoldState[foldKey] :
      true;

    // 构建步骤HTML
    let stepsHtml = '';
    steps.forEach((step, si) => {
      let stepClass = 'inactive';
      if (step.done) stepClass = 'done';
      else if (si === currentIdx) stepClass = 'active';
      if (isCompleted) stepClass = 'done';

      let star = '✧';
      if (stepClass === 'done') star = '✧';
      else if (stepClass === 'active') star = '✦';

      const clickHandler = (stepClass === 'active' && !isCompleted) ?
        `onclick="toggleStep(${idx}, ${si})"` :
        '';

      stepsHtml += `
                            <div class="step-item ${stepClass}" ${clickHandler} style="${stepClass === 'active' ? 'cursor:pointer;' : ''}">
                                <span class="step-star">${star}</span>
                                <span class="step-text">${escapeHtml(step.text)}</span>
                                ${stepClass !== 'done' ? `<span class="step-del" onclick="deleteStep(${idx}, ${si})"><i class="fa-regular fa-trash-can"></i></span>` : ''}
                            </div>
                        `;
    });

    // 完成展示
    let completedDisplay = '';
    if (isCompleted) {
      completedDisplay = `
                            <div class="routine-completed-display">
                                <span>今日仪式已完成</span>
                                <span class="stars">✦ ✦ ✦ ✦</span>
                            </div>
                        `;
    }

    const progressText = totalSteps > 0 ? `${doneCount}/${totalSteps}` : '0/0';

    return `
                        <div class="routine-card ${isCompleted ? 'completed' : ''}" data-routine-idx="${idx}">
                            <div class="routine-head">
                                <div class="routine-name" onclick="showEditRoutineName(${idx}, event)">${escapeHtml(r.name)}</div>
                                <div class="routine-actions">
                                    <span class="routine-fold-icon ${isOpen ? 'open' : ''}" onclick="toggleRoutineFold('${foldKey}', event)"><i class="fa-solid fa-chevron-down"></i></span>
                                    <button class="routine-delete-btn" onclick="deleteRoutine(${idx}, event)" title="删除仪式"><i class="fa-regular fa-trash-can"></i></button>
                                </div>
                            </div>
                            <div class="routine-steps-wrap ${isOpen ? 'open' : ''}">
                                <div class="routine-steps">
                                    ${stepsHtml}
                                </div>
                                ${completedDisplay}
                                <div class="routine-step-add">
                                    <input type="text" id="stepInput_${idx}" placeholder="添加步骤...">
                                    <button class="add-btn" onclick="addStep(${idx})">+</button>
                                </div>
                            </div>
                            <div class="routine-footer">
                                <span class="routine-reward-capsule">+10 能量</span>
                                <span class="routine-progress-text">进度 <strong>${progressText}</strong></span>
                            </div>
                        </div>
                    `;
  }).join('');
}

// 切换步骤
function toggleStep(routineIdx, stepIdx) {
  const r = state.routines[routineIdx];
  if (!r) return;
  if (r.completedToday) {
    showToast('🌟 今日仪式已完成');
    return;
  }
  const steps = r.steps;
  if (stepIdx >= steps.length) return;
  let currentIdx = -1;
  for (let i = 0; i < steps.length; i++) {
    if (!steps[i].done) { currentIdx = i; break; }
  }
  if (currentIdx === -1) { showToast('所有步骤已完成'); return; }
  if (stepIdx !== currentIdx) {
    showToast('请按顺序完成步骤 ✧');
    return;
  }
  steps[stepIdx].done = true;
  if (typeof logActivity === 'function') logActivity('routine', r.name + ' - ' + steps[stepIdx].text);
  saveState();
  renderRoutines();
}

// 添加步骤
function addStep(routineIdx) {
  const r = state.routines[routineIdx];
  if (!r) return;
  if (r.completedToday) {
    r.completedToday = false;
    r.lastCompletedDate = null;
  }
  const input = document.getElementById(`stepInput_${routineIdx}`);
  const text = input.value.trim();
  if (!text) { showToast('请输入步骤内容'); return; }
  r.steps.push({
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 4),
    text: text,
    done: false
  });
  input.value = '';
  saveState();
  renderRoutines();
}

function deleteStep(routineIdx, stepIdx) {
  const r = state.routines[routineIdx];
  if (!r) return;
  if (r.completedToday) { showToast('已完成仪式不能删除步骤'); return; }
  const steps = r.steps;
  if (steps[stepIdx].done) {
    showToast('不能删除已完成的步骤');
    return;
  }
  steps.splice(stepIdx, 1);
  saveState();
  renderRoutines();
}

function showAddRoutineModal() {
  document.getElementById('addRoutineModal').classList.add('open');
  document.getElementById('routineNameInput').value = '';
  document.getElementById('routineNameInput').focus();
}

function closeAddRoutineModal() { document.getElementById('addRoutineModal').classList.remove('open'); }

function confirmAddRoutine() {
  const name = document.getElementById('routineNameInput').value.trim();
  if (!name) { showToast('请输入仪式名称'); return; }
  state.routines.push({
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name: name.trim(),
    steps: [],
    completedToday: false,
    lastCompletedDate: null
  });
  saveState();
  renderRoutines();
  closeAddRoutineModal();
}

// 粒子特效
function spawnRoutineCompleteParticles(card) {
  const container = document.getElementById('particleContainer');
  const rect = card.getBoundingClientRect();
  const colors = ['#e8b84b', '#d4a830', '#e6dccf', '#fdf6e3', '#c5a050'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle confetti';
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.width = (4 + Math.random() * 6) + 'px';
    p.style.height = (6 + Math.random() * 8) + 'px';
    p.style.animationDuration = (1 + Math.random() * 0.8) + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    p.style.borderRadius = '2px';
    container.appendChild(p);
    setTimeout(() => p.remove(), 2000);
  }
}
