// 白噪音
const soundPlayers = {};

function toggleSound(id) {
  const btn = document.querySelector(`.sound-btn[data-sound="${id}"]`);
  const volInput = btn.querySelector('.sound-volume');
  if (!soundPlayers[id]) {
    const audio = new Audio(`assets/${id}.mp3`);
    audio.loop = true;
    audio.volume = parseFloat(volInput.value) || 0.5;
    soundPlayers[id] = audio;
  }
  const player = soundPlayers[id];
  if (player.paused) {
    for (const key in soundPlayers) {
      if (key !== id && !soundPlayers[key].paused) {
        soundPlayers[key].pause();
        document.querySelector(`.sound-btn[data-sound="${key}"]`).classList.remove('active');
        document.querySelector(`.sound-btn[data-sound="${key}"] .sound-volume`).classList.remove('show');
      }
    }
    player.play().catch(e => showToast('⚠️ 无法播放音频，请检查文件是否存在'));
    btn.classList.add('active');
    volInput.classList.add('show');
  } else {
    player.pause();
    btn.classList.remove('active');
    volInput.classList.remove('show');
  }
}

function setSoundVolume(id, value) {
  if (soundPlayers[id]) soundPlayers[id].volume = parseFloat(value);
}

// ============================================================
//  书架 (与之前相同)
// ============================================================
let tempBookCover = null;

document.getElementById('bookCoverInput')?.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = ev => {
      tempBookCover = ev.target.result;
      document.getElementById('bookCoverPreview').src = tempBookCover;
      document.getElementById('bookCoverPreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

function addReadingRecord() {
  const title = document.getElementById('bookTitleInput').value.trim();
  const rawAuthor = document.getElementById('bookAuthorInput').value.trim();
  const author = (!rawAuthor || rawAuthor === '无' || rawAuthor === '未知') ? '' : rawAuthor;
  if (!title) { showToast('📚 请填写书名'); return; }
  const record = {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    title,
    author,
    cover: tempBookCover || null,
    progress: 0,
    excerpt: '',
    createdAt: new Date().toISOString()
  };
  state.books.unshift(record);
  state.stats.bookCount++;
  addEnergy(2);
  checkUnlock('book_1', state.stats.bookCount >= 1);
  checkUnlock('book_3', state.stats.bookCount >= 3);
  checkUnlock('book_5', state.stats.bookCount >= 5);
  checkUnlock('book_10', state.stats.bookCount >= 10);
  checkUnlock('book_20', state.stats.bookCount >= 20);
  checkAllRounder();
  document.getElementById('bookTitleInput').value = '';
  document.getElementById('bookAuthorInput').value = '';
  document.getElementById('bookCoverInput').value = '';
  document.getElementById('bookCoverPreview').style.display = 'none';
  tempBookCover = null;
  saveState();
  renderBooks();
  renderAchievements();
  showToast(`📖 已记录《${title}》 +2`);
}

function renderBooks() {
  const grid = document.getElementById('bookGrid');
  if (state.books.length === 0) {
    grid.innerHTML =
      `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-regular fa-books"></i>还没有阅读记录，添加一本吧</div>`;
    return;
  }
  grid.innerHTML = state.books.map(book => {
    const dt = new Date(book.createdAt);
    const dateStr = `${dt.getFullYear()} / ${String(dt.getMonth() + 1).padStart(2, '0')} / ${String(dt.getDate()).padStart(2, '0')}`;
    const authorHtml = book.author
      ? `<div class="book-author">${escapeHtml(book.author)}</div>`
      : `<div class="book-author-placeholder"></div>`;
    return `
    <div class="book-card" onclick="openBookDetail('${book.id}')" data-id="${book.id}">
      <div class="book-cover-img">
        ${book.cover ? `<img src="${book.cover}" alt="${escapeHtml(book.title)}">` : `<i class="fa-solid fa-book" style="font-size:1.4rem;opacity:0.3;"></i>`}
      </div>
      <div class="book-info">
        <div class="book-title">${escapeHtml(book.title)}</div>
        ${authorHtml}
        <div class="book-date">${dateStr}</div>
      </div>
    </div>`;
  }).join('');
}

function openBookDetail(id) {
  const book = state.books.find(b => b.id === id);
  if (!book) return;
  state.editingBookId = id;
  document.getElementById('bookDetailTitle').textContent = book.title;
  document.getElementById('bookDetailAuthor').textContent = book.author;
  const cover = document.getElementById('bookDetailCover');
  if (book.cover) {
    cover.src = book.cover;
    cover.style.display = 'block';
  } else { cover.style.display = 'none'; }
  document.getElementById('bookDetailProgress').value = book.progress || 0;
  document.getElementById('bookDetailProgressLabel').textContent = (book.progress || 0) + '%';
  document.getElementById('bookDetailExcerpt').value = book.excerpt || '';
  document.getElementById('bookDetailModal').classList.add('open');
}

function closeBookDetail() {
  document.getElementById('bookDetailModal').classList.remove('open');
  state.editingBookId = null;
}

function saveBookDetail() {
  const id = state.editingBookId;
  if (!id) return;
  const book = state.books.find(b => b.id === id);
  if (!book) return;
  const progress = parseInt(document.getElementById('bookDetailProgress').value) || 0;
  const excerpt = document.getElementById('bookDetailExcerpt').value.trim();
  book.progress = progress;
  book.excerpt = excerpt;
  saveState();
  renderBooks();
  showToast('💾 已保存');
  closeBookDetail();
}

function deleteBook() {
  const id = state.editingBookId;
  if (!id) return;
  state.books = state.books.filter(b => b.id !== id);
  state.stats.bookCount = Math.max(0, (state.stats.bookCount || 0) - 1);
  saveState();
  renderBooks();
  closeBookDetail();
  showToast('🗑️ 已删除');
}

document.getElementById('bookDetailProgress')?.addEventListener('input', function () {
  document.getElementById('bookDetailProgressLabel').textContent = this.value + '%';
});
