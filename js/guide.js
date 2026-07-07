let guideStep = 0;
const guideSteps = [
  { icon: '👋', title: '欢迎来到 Iris', desc: '能量即选择 · 这里是你心灵的花园。' },
  { icon: '📝', title: '创建你的待办和成长仪式', desc: '在「清单」页，你可以添加一次性待办，或创建包含多个步骤的成长仪式。' },
  { icon: '⚡', title: '攒能量，逛小铺', desc: '完成任务积攒能量，去「栖所小铺」兑换可爱的桌宠和装饰。' },
  { icon: '🖼️', title: '记录与回顾', desc: '在「时光画廊」中，你可以看到每月的能量色块、关键词和成就进度。' }
];

function startGuide() {
  if (!state.isFirstLaunch) return;
  guideStep = 0;
  document.getElementById('guideOverlay').classList.add('open');
  updateGuideUI();
}

function updateGuideUI() {
  const step = guideSteps[guideStep];
  if (!step) { finishGuide(); return; }
  document.getElementById('guideIcon').textContent = step.icon;
  document.getElementById('guideTitle').textContent = step.title;
  document.getElementById('guideDesc').textContent = step.desc;
  const dots = document.querySelectorAll('#guideProgress .dot');
  dots.forEach((dot, i) => { dot.classList.toggle('active', i === guideStep); });
  const nextBtn = document.getElementById('guideNextBtn');
  nextBtn.textContent = guideStep === guideSteps.length - 1 ? '🎉 开始使用' : '下一步 →';
}

function nextGuide() {
  if (guideStep < guideSteps.length - 1) {
    guideStep++;
    updateGuideUI();
  } else finishGuide();
}

function skipGuide() { finishGuide(); }

function finishGuide() {
  document.getElementById('guideOverlay').classList.remove('open');
  state.isFirstLaunch = false;
  saveState();
  showToast('🎉 欢迎来到 Iris！能量即选择。');
}
