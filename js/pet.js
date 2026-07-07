function updatePetUI() {
  const container = document.getElementById('petContainer');
  if (state.pet) {
    container.style.display = 'block';
    document.getElementById('petEmoji').textContent = state.pet.emoji || '🐱';
    const decoEl = document.getElementById('petDecoration');
    if (state.equippedDecoration) {
      decoEl.style.display = 'block';
      decoEl.textContent = state.equippedDecoration;
    } else { decoEl.style.display = 'none'; }
    document.getElementById('petStatusBadge').textContent = state.pet.name || '🐱';
    if (!window.petMoveInterval) {
      window.petMoveInterval = setInterval(() => {
        const c = document.getElementById('petContainer');
        if (!c || c.style.display === 'none') return;
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 120;
        const x = Math.random() * maxX;
        const y = 60 + Math.random() * (maxY - 60);
        c.style.transition = 'all 0.8s ease';
        c.style.left = x + 'px';
        c.style.bottom = y + 'px';
      }, 4000);
    }
  } else {
    container.style.display = 'none';
    document.getElementById('petStatusBadge').textContent = '无';
    if (window.petMoveInterval) {
      clearInterval(window.petMoveInterval);
      window.petMoveInterval = null;
    }
  }
}

function showPetHome() {
  const grid = document.getElementById('petHomeGrid');
  if (state.ownedPets.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-regular fa-paw"></i>还没有桌宠，去小铺领养吧</div>`;
  } else {
    grid.innerHTML = state.ownedPets.map((p, idx) => {
      const isActive = state.pet && state.pet.emoji === p.emoji;
      const petDef = state.petData.find(d => d.emoji === p.emoji);
      const rarity = petDef ? petDef.rarity : 'common';
      const color = getRarityColor(rarity);
      return `
        <div class="pet-card ${isActive ? 'owned' : ''}" onclick="selectPetFromHome(${idx})" style="border-color: ${isActive ? 'var(--accent-yellow-dark)' : color};">
          <span class="emoji">${p.emoji}</span>
          <div class="name">${p.name}</div>
          <div class="rarity" style="color:${color};">${getRarityLabel(rarity)}</div>
          ${isActive ? '<div class="badge">已携带</div>' : ''}
        </div>
      `;
    }).join('');
  }
  document.getElementById('petHomeModal').classList.add('open');
}

function closePetHome() { document.getElementById('petHomeModal').classList.remove('open'); }

function selectPetFromHome(idx) {
  const pet = state.ownedPets[idx];
  if (!pet) return;
  state.pet = { ...pet };
  saveState();
  updatePetUI();
  showToast(`🐾 已携带 ${pet.emoji} ${pet.name}`);
  closePetHome();
}

function getRarityColor(rarity) {
  const map = {
    'common': 'var(--rarity-common)',
    'rare': 'var(--rarity-rare)',
    'epic': 'var(--rarity-epic)',
    'legendary': 'var(--rarity-legendary)'
  };
  return map[rarity] || 'var(--text-sub)';
}

function getRarityLabel(rarity) {
  const map = { 'common': '普通', 'rare': '稀有', 'epic': '史诗', 'legendary': '传说' };
  return map[rarity] || rarity;
}
