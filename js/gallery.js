// ============================================================
//  时光画廊 (与之前相同)
// ============================================================
function openGalleryPreview() {
  const now = new Date();
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;
  document.getElementById('galleryModalMonth').textContent = monthLabel;
  const grid = document.getElementById('galleryColorGrid');
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  let html = '';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const mode = state.energyHistory[dateStr] || null;
    let cls = 'gc-day empty';
    let label = '·';
    if (mode === 'high') {
      cls = 'gc-day has-high';
      label = '⚡';
    } else if (mode === 'low') {
      cls = 'gc-day has-low';
      label = '🌿';
    } else if (mode === 'rest') {
      cls = 'gc-day has-rest';
      label = '🛌';
    }
    html += `<div class="${cls}">${label}</div>`;
  }
  grid.innerHTML = html;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const doneTodos = state.todos.filter(t => {
    const d = new Date(t.createdAt);
    return t.done && d >= monthStart && d <= monthEnd;
  });
  const totalTodos = state.todos.filter(t => {
    const d = new Date(t.createdAt);
    return d >= monthStart && d <= monthEnd;
  });
  const diariesThisMonth = state.diaries.filter(d => {
    const dt = new Date(d.createdAt);
    return dt >= monthStart && dt <= monthEnd;
  });
  const medSecs = state.afkSessions.filter(s => {
    const dt = new Date(s.timestamp);
    return dt >= monthStart && dt <= monthEnd;
  }).reduce((sum, s) => sum + s.duration, 0);
  document.getElementById('galleryTotalTodos').textContent = totalTodos.length;
  document.getElementById('galleryDoneTodos').textContent = doneTodos.length;
  document.getElementById('galleryDiaryCount').textContent = diariesThisMonth.length;
  document.getElementById('galleryMeditation').textContent = Math.round(medSecs / 60);
  const total = achievementLibrary.length;
  const unlocked = achievementLibrary.filter(a => !!state.unlockedAchievements[a.id]);
  const pct = total ? Math.round(unlocked.length / total * 100) : 0;
  document.getElementById('galleryUnlockedCount').textContent = unlocked.length;
  document.getElementById('galleryTotalCount').textContent = total;
  document.getElementById('galleryCompletionRate').textContent = pct + '%';
  document.getElementById('galleryTotalEnergy').textContent = getEnergyBalance();
  const allText = state.diaries.filter(d => {
    const dt = new Date(d.createdAt);
    return dt >= monthStart && dt <= monthEnd;
  }).map(d => d.text).join(' ');
  const keywords = extractKeywords(allText);
  document.getElementById('galleryKeywords').textContent = keywords.length ? keywords.join(' · ') : '💜 用日记填满这个月吧';
  document.getElementById('galleryModal').classList.add('open');
}

function closeGalleryModal() { document.getElementById('galleryModal').classList.remove('open'); }

function extractKeywords(text) {
  if (!text) return [];
  const words = [];
  const clean = text.replace(/[，,。.、！!？?\s\n\d]/g, '');
  for (let i = 0; i < clean.length - 1; i++) {
    for (let len = 2; len <= 4 && i + len <= clean.length; len++) {
      const w = clean.substring(i, i + len);
      if (w.length >= 2) words.push(w);
    }
  }
  const stopWords = ['今天', '这个', '自己', '一个', '什么', '没有', '已经', '可以', '还是', '因为', '所以', '但是', '如果', '虽然', '然后', '觉得', '非常', '有点', '真的'];
  const freq = {};
  words.forEach(w => {
    if (stopWords.includes(w)) return;
    freq[w] = (freq[w] || 0) + 1;
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 5).map(w => w[0]);
}

function shareGalleryAsImage() {
  const overlay = document.getElementById('shareLoadingOverlay');
  overlay.classList.add('open');
  const modalBody = document.getElementById('galleryModalBody');
  const clone = modalBody.cloneNode(true);
  const btn = clone.querySelector('.gallery-share-btn');
  if (btn) btn.remove();
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'background: var(--card-bg); padding: 24px 20px; border-radius: 20px; width: 420px; margin: 0 auto; font-family: "Noto Sans SC", sans-serif; color: var(--text-main);';
  const titleEl = document.createElement('div');
  titleEl.style.cssText = 'text-align:center;font-size:1.2rem;font-weight:700;color:var(--dark-purple);margin-bottom:12px;';
  titleEl.textContent = '🖼️ ' + document.getElementById('galleryModalMonth').textContent + ' · 时光画廊';
  wrapper.appendChild(titleEl);
  wrapper.appendChild(clone);
  const footer = document.createElement('div');
  footer.style.cssText = 'text-align:center;font-size:0.65rem;color:var(--text-sub);margin-top:12px;padding-top:8px;border-top:1px solid var(--border-light);';
  footer.textContent = '✨ Iris · 能量即选择';
  wrapper.appendChild(footer);
  const isDark = document.body.classList.contains('dark-theme');
  if (isDark) {
    wrapper.style.setProperty('--card-bg', '#282838');
    wrapper.style.setProperty('--dark-purple', '#ded9e8');
    wrapper.style.setProperty('--text-main', '#e6e0ed');
    wrapper.style.setProperty('--text-sub', '#a89bb8');
    wrapper.style.setProperty('--border-light', '#3e3a4a');
    wrapper.style.setProperty('--light-purple', '#3a3348');
    wrapper.style.setProperty('--item-bg', '#323244');
    wrapper.style.setProperty('--input-bg', '#323244');
  }
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.style.zIndex = '9998';
  document.body.appendChild(wrapper);
  setTimeout(() => {
    html2canvas(wrapper, {
      scale: 2,
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim() || '#ffffff',
      allowTaint: true,
      useCORS: true,
      logging: false,
      width: 420,
      height: wrapper.scrollHeight,
    }).then(canvas => {
      overlay.classList.remove('open');
      document.body.removeChild(wrapper);
      const link = document.createElement('a');
      link.download = `Iris_时光画廊_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('🖼️ 长图已保存！');
    }).catch(err => {
      console.warn('长图生成失败:', err);
      overlay.classList.remove('open');
      document.body.removeChild(wrapper);
      showToast('⚠️ 生成失败，请重试');
    });
  }, 500);
}
