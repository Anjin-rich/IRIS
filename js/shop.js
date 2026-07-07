// ============================================================
//  商店 (与之前相同)
// ============================================================
function openShop() {
  const modal = document.getElementById('shopModal');
  renderShop();
  modal.classList.add('open');
}

function closeShop() { document.getElementById('shopModal').classList.remove('open'); }

function renderShop() {
  const grid = document.getElementById('shopGrid');
  const balance = getEnergyBalance();
  document.getElementById('shopEnergyBalance').textContent = balance;
  grid.innerHTML = state.shopItems.map(item => {
    const owned = item.unlocked;
    const canBuy = !owned && balance >= item.price && (!item.requiredAchievement || !!state.unlockedAchievements[item.requiredAchievement]);
    const locked = !owned && !canBuy;
    const equipped = item.type === 'decoration' && state.equippedDecoration === item.emoji;
    let btnHtml = '';
    if (owned) {
      if (item.type === 'decoration') {
        btnHtml = `<button class="item-btn equip ${equipped ? 'equipped' : ''}" onclick="toggleEquip('${item.id}')">${equipped ? '✅ 已佩戴' : '装备'}</button>`;
      } else {
        btnHtml = `<button class="item-btn equip" onclick="equipPet('${item.id}')">装备</button>`;
      }
    } else if (canBuy) {
      btnHtml = `<button class="item-btn buy" onclick="buyItem('${item.id}')">${item.price} 购买</button>`;
    } else {
      let reqText = '';
      if (item.requiredAchievement) {
        const ach = achievementLibrary.find(a => a.id === item.requiredAchievement);
        reqText = ach ? `需要解锁「${ach.title}」` : '需要解锁成就';
      } else {
        reqText = `需要 ${item.price} 能量`;
      }
      btnHtml = `<button class="item-btn locked" disabled>🔒 ${reqText}</button>`;
    }
    return `
      <div class="shop-item">
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-status">${owned ? '✅ 已拥有' : ''}</div>
        ${btnHtml}
      </div>
    `;
  }).join('');
}

function buyItem(itemId) {
  const item = state.shopItems.find(i => i.id === itemId);
  if (!item) return;
  if (item.unlocked) { showToast('已拥有'); return; }
  const balance = getEnergyBalance();
  if (balance < item.price) { showToast(`能量不足，需要 ${item.price}`); return; }
  if (item.requiredAchievement && !state.unlockedAchievements[item.requiredAchievement]) {
    const ach = achievementLibrary.find(a => a.id === item.requiredAchievement);
    showToast(`需要解锁成就「${ach ? ach.title : item.requiredAchievement}」`);
    return;
  }
  if (!spendEnergy(item.price)) return;
  item.unlocked = true;
  if (item.type === 'pet') {
    const petName = item.name.replace('小', '');
    state.ownedPets.push({ emoji: item.emoji, name: petName + '宝宝' });
    if (!state.pet) {
      state.pet = { emoji: item.emoji, name: petName + '宝宝' };
      updatePetUI();
    }
    checkUnlock('pet_1', true);
  } else if (item.type === 'decoration') {
    state.ownedDecorations.push(item.emoji);
  }
  saveState();
  renderShop();
  updatePetUI();
  showToast(`🎉 获得了 ${item.name}！`);
}

function equipPet(itemId) {
  const item = state.shopItems.find(i => i.id === itemId);
  if (!item || !item.unlocked) return;
  const pet = state.ownedPets.find(p => p.emoji === item.emoji);
  if (pet) {
    state.pet = { ...pet };
    saveState();
    updatePetUI();
    renderShop();
    showToast(`🐾 已装备 ${item.name}`);
  }
}

function toggleEquip(itemId) {
  const item = state.shopItems.find(i => i.id === itemId);
  if (!item || !item.unlocked) return;
  if (item.type !== 'decoration') return;
  if (state.equippedDecoration === item.emoji) {
    state.equippedDecoration = null;
    showToast('已卸下装饰');
  } else {
    state.equippedDecoration = item.emoji;
    showToast(`🎀 已佩戴 ${item.name}`);
  }
  saveState();
  updatePetUI();
  renderShop();
}
