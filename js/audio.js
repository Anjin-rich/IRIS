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
//  书架重设计
// ============================================================
let tempBookCover = null;
let selectedBookStatus = '在读';
let currentDetailBookId = null;

// 封面上传
document.getElementById('bookCoverInput')?.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = ev => {
      tempBookCover = ev.target.result;
      const preview = document.getElementById('bookCoverPreview');
      preview.src = tempBookCover;
      preview.style.display = 'block';
      const upload = document.querySelector('.entry-cover-upload');
      if (upload) upload.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
});

// 分类选择：自定义切换
document.getElementById('bookCategorySelect')?.addEventListener('change', function () {
  const customInput = document.getElementById('bookCustomCategoryInput');
  if (this.value === 'custom') {
    customInput.style.display = 'block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
  }
});

// 状态选择
function selectBookStatus(el) {
  document.querySelectorAll('.entry-status-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedBookStatus = el.dataset.status;
}

// ===== 搜索（Google Books API，免费无需密钥） =====
async function searchBooks() {
  const query = document.getElementById('bookSearchInput').value.trim();
  if (!query) return;
  const resultsDiv = document.getElementById('entrySearchResults');
  resultsDiv.innerHTML = '<div style="text-align:center;padding:12px;font-size:0.72rem;color:var(--main-purple);">搜索中...</div>';
  const isISBN = /^[\d-]{10,}$/.test(query);
  // 按顺序尝试多个搜索关键词组合
  const queries = [];
  if (isISBN) {
    queries.push(`q=isbn:${query.replace(/-/g, '')}`);
  } else {
    queries.push(`q=${encodeURIComponent(query)}`);
    queries.push(`q=${encodeURIComponent(query)}&langRestrict=zh`);
    if (/[\u4e00-\u9fa5]/.test(query)) {
      queries.push(`q=intitle:${encodeURIComponent(query)}`);
    }
  }
  let found = null;
  for (let i = 0; i < queries.length && !found; i++) {
    try {
      const resp = await fetch(`https://www.googleapis.com/books/v1/volumes?${queries[i]}&maxResults=8`);
      if (!resp.ok) continue;
      const data = await resp.json();
      if (data.items && data.items.length > 0) {
        found = data.items;
        break;
      }
    } catch (e) {}
  }
  if (!found || found.length === 0) {
    resultsDiv.innerHTML =
      `<div style="padding:14px;font-size:0.72rem;color:var(--main-purple);text-align:center;line-height:1.6;">
        未在书库中找到匹配结果<br>
        <span style="color:#b7a7c9;font-size:0.65rem;">可尝试：作者+书名 · 或直接手动填写下方字段</span>
      </div>`;
    return;
  }
  resultsDiv.innerHTML = found.slice(0, 6).map(item => {
    const v = item.volumeInfo || {};
    const cover = v.imageLinks?.thumbnail?.replace('http:', 'https:') || '';
    const title = v.title || '';
    const author = (v.authors || []).join(', ');
    const pages = v.pageCount || 0;
    const coverHtml = cover
      ? `<img src="${cover}" alt="${escapeHtml(title)}">`
      : `<div style="width:30px;height:40px;background:var(--light-purple);border-radius:4px;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-book" style="color:var(--main-purple);opacity:0.5;font-size:0.6rem;"></i></div>`;
    return `<div class="entry-search-result-item" onclick='selectSearchResult(${JSON.stringify({title,author,cover,pages}).replace(/'/g,"&#39;")})'>
      ${coverHtml}
      <div class="entry-search-result-info">
        <div class="entry-search-result-title">${escapeHtml(title)}</div>
        <div class="entry-search-result-author">${escapeHtml(author)}${pages ? ' · ' + pages + '页' : ''}</div>
      </div>
    </div>`;
  }).join('');
}

function selectSearchResult(book) {
  document.getElementById('bookTitleInput').value = book.title || '';
  document.getElementById('bookAuthorInput').value = book.author || '';
  if (book.pages) document.getElementById('bookPagesInput').value = book.pages;
  if (book.cover) {
    tempBookCover = book.cover;
    const preview = document.getElementById('bookCoverPreview');
    preview.src = book.cover;
    preview.style.display = 'block';
    const upload = document.querySelector('.entry-cover-upload');
    if (upload) upload.style.display = 'none';
  }
  document.getElementById('entrySearchResults').innerHTML = '';
  showToast('已填充信息，可继续编辑');
}

// ===== 扫码（BarcodeDetector API，仅支持Chrome Android） =====
async function scanBarcode() {
  if (!('BarcodeDetector' in window)) {
    showToast('当前浏览器不支持扫码，请手动输入ISBN');
    return;
  }
  try {
    const video = document.createElement('video');
    video.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:9999;';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ 关闭';
    closeBtn.style.cssText = 'position:fixed;top:16px;right:16px;z-index:10000;background:rgba(0,0,0,0.6);color:#fff;border:none;padding:8px 16px;border-radius:20px;font-size:0.8rem;';
    document.body.appendChild(video);
    document.body.appendChild(closeBtn);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
    video.play();
    const detector = new BarcodeDetector({ formats: ['ean_13'] });
    let scanning = true;
    const detect = async () => {
      if (!scanning) return;
      try {
        const codes = await detector.detect(video);
        if (codes.length > 0) {
          document.getElementById('bookSearchInput').value = codes[0].rawValue;
          scanning = false;
          stream.getTracks().forEach(t => t.stop());
          video.remove();
          closeBtn.remove();
          searchBooks();
          return;
        }
      } catch (e) {}
      requestAnimationFrame(detect);
    };
    detect();
    closeBtn.onclick = () => {
      scanning = false;
      stream.getTracks().forEach(t => t.stop());
      video.remove();
      closeBtn.remove();
    };
  } catch (e) {
    showToast('无法访问摄像头');
  }
}

// ===== 录入全屏页 =====
function openBookEntry() {
  document.getElementById('bookEntryModal').classList.add('open');
  document.getElementById('bookSearchInput').value = '';
  document.getElementById('entrySearchResults').innerHTML = '';
  document.getElementById('bookTitleInput').value = '';
  document.getElementById('bookAuthorInput').value = '';
  document.getElementById('bookPagesInput').value = '';
  document.getElementById('bookCategorySelect').value = '';
  document.getElementById('bookCustomCategoryInput').style.display = 'none';
  document.getElementById('bookCustomCategoryInput').value = '';
  document.getElementById('bookCoverPreview').style.display = 'none';
  document.querySelector('.entry-cover-upload').style.display = 'flex';
  document.getElementById('bookCoverInput').value = '';
  document.querySelectorAll('.entry-status-chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.entry-status-chip[data-status="在读"]').classList.add('active');
  selectedBookStatus = '在读';
  tempBookCover = null;
}

function closeBookEntry() {
  document.getElementById('bookEntryModal').classList.remove('open');
}

function submitBookEntry() {
  const title = document.getElementById('bookTitleInput').value.trim();
  if (!title) { showToast('请填写书名'); return; }
  const author = document.getElementById('bookAuthorInput').value.trim();
  const pages = parseInt(document.getElementById('bookPagesInput').value) || 0;
  const categorySelect = document.getElementById('bookCategorySelect');
  let category = categorySelect.value;
  if (category === 'custom') {
    category = document.getElementById('bookCustomCategoryInput').value.trim() || '';
  }
  const record = {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    title,
    author,
    cover: tempBookCover || null,
    progress: 0,
    currentPage: 0,
    totalPages: pages,
    category: category || '',
    status: selectedBookStatus,
    rating: 0,
    excerpt: '',
    timeline: [],
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
  saveState();
  renderBooks();
  renderAchievements();
  closeBookEntry();
  showToast(`已收录《${title}》 +2`);
}

// 分类 → 书脊颜色
function spineClassOf(category) {
  if (category === '思维/认知' || category === '个人成长') return 'spine-blue';
  if (category === '文学/小说') return 'spine-purple';
  return 'spine-white';
}

// ===== 渲染书架 =====
function renderBookshelfFilters() {
  const filterDiv = document.getElementById('bookshelfFilters');
  if (!filterDiv) return;
  const categories = ['all', '思维/认知', '个人成长', '文学/小说'];
  state.books.forEach(b => {
    if (b.category && !categories.includes(b.category)) categories.push(b.category);
  });
  filterDiv.innerHTML = categories.map(cat => {
    const label = cat === 'all' ? '全部' : cat;
    const count = cat === 'all' ? state.books.length : state.books.filter(b => b.category === cat).length;
    return `<span class="bookshelf-filter-chip ${state.bookFilter === cat ? 'active' : ''}" onclick="setBookFilter('${cat}')">${label}${count > 0 ? ' ' + count : ''}</span>`;
  }).join('');
}

function setBookFilter(cat) {
  state.bookFilter = cat;
  saveState();
  renderBooks();
}

function renderBooks() {
  const shelf = document.getElementById('fbBookshelf');
  if (!shelf) return;
  renderBookshelfFilters();
  if (state.books.length === 0) {
    shelf.innerHTML = `<div class="bookshelf-empty">
      <i class="fa-solid fa-book-open bookshelf-empty-icon"></i>
      <div class="bookshelf-empty-text">书架还是空的</div>
      <div class="bookshelf-empty-hint">点击右上角加号添加第一本书</div>
    </div>`;
    updateBookCountSubtitle();
    return;
  }
  const filtered = state.bookFilter === 'all' ? state.books : state.books.filter(b => b.category === state.bookFilter);
  if (filtered.length === 0) {
    shelf.innerHTML = `<div class="bookshelf-empty">
      <div class="bookshelf-empty-text">该分类下暂无书籍</div>
    </div>`;
    updateBookCountSubtitle();
    return;
  }
  shelf.innerHTML = filtered.map(book => {
    const spineClass = spineClassOf(book.category);
    const coverHtml = book.cover
      ? `<img src="${book.cover}" alt="${escapeHtml(book.title)}">`
      : `<i class="fa-solid fa-book book-icon-placeholder"></i>`;
    // hover 只显示第一条金句摘录
    const firstQuoteItem = (book.timeline || []).find(t => t.quote);
    const ribbonHtml = firstQuoteItem
      ? `<div class="fb-book-ribbon">"${escapeHtml(firstQuoteItem.quote.slice(0, 28))}"</div>`
      : '';
    return `<div class="fb-book-card ${spineClass}" onclick="openBookDetail('${book.id}')" title="${escapeHtml(book.title)}">
      <div class="fb-cover-area">${coverHtml}</div>
      <div class="fb-title-strip">${escapeHtml(book.title)}</div>
      ${ribbonHtml}
    </div>`;
  }).join('');
  updateBookCountSubtitle();
}

// ===== 详情页封面上传 =====
document.getElementById('detailCoverInput')?.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file || !currentDetailBookId) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const dataUrl = ev.target.result;
    const book = state.books.find(b => b.id === currentDetailBookId);
    if (book) {
      book.cover = dataUrl;
      saveState();
      renderBooks();
      openBookDetail(currentDetailBookId);
      showToast('封面已更新');
    }
  };
  reader.readAsDataURL(file);
  this.value = '';
});

function uploadDetailCover() {
  document.getElementById('detailCoverInput')?.click();
}

// ===== 书籍详情全屏页 =====
function openBookDetail(id) {
  const book = state.books.find(b => b.id === id);
  if (!book) return;
  currentDetailBookId = id;
  document.getElementById('bookDetailTitle').textContent = book.title;
  document.getElementById('bookDetailTitleText').textContent = book.title;
  document.getElementById('bookDetailAuthor').textContent = book.author || '未知作者';
  // 封面（占位：淡紫底 + 紫色书图标）
  const coverDiv = document.getElementById('bookDetailCover');
  coverDiv.style.background = '';
  coverDiv.textContent = '';
  if (book.cover) {
    coverDiv.innerHTML = `<img src="${book.cover}" alt="${escapeHtml(book.title)}">`;
  } else {
    coverDiv.innerHTML = `<i class="fa-solid fa-book cover-placeholder-icon"></i>`;
  }
  // 评分
  renderBookRating(book.rating || 0);
  // 进度
  const progress = book.progress || 0;
  document.getElementById('bookDetailProgress').value = progress;
  updateProgressText();
  // 时间轴
  renderBookTimeline(book);
  document.getElementById('bookDetailModal').classList.add('open');
}

function updateProgressText() {
  const el = document.getElementById('bookDetailProgressText');
  const range = document.getElementById('bookDetailProgress');
  if (!el || !range) return;
  el.textContent = range.value + '%';
}

function closeBookDetail() {
  document.getElementById('bookDetailModal').classList.remove('open');
  currentDetailBookId = null;
}

// ===== 评分 =====
function renderBookRating(rating) {
  const div = document.getElementById('bookDetailRating');
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= rating;
    html += `<span class="star ${filled ? 'active' : ''}" onclick="setBookRating(${i})" onmouseenter="previewStars(${i})" onmouseleave="renderBookRating(${currentDetailBookId ? (state.books.find(b=>b.id===currentDetailBookId)?.rating||0) : 0})">${filled ? '★' : '☆'}</span>`;
  }
  div.innerHTML = html;
}
function previewStars(n) {
  const div = document.getElementById('bookDetailRating');
  if (!div) return;
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= n ? 'active' : ''}" onclick="setBookRating(${i})">${i <= n ? '★' : '☆'}</span>`;
  }
  div.innerHTML = html;
}

function setBookRating(stars) {
  const book = state.books.find(b => b.id === currentDetailBookId);
  if (!book) return;
  book.rating = stars;
  saveState();
  renderBookRating(stars);
  showToast(`评分：${stars}星`);
}

// ===== 时间轴 =====
function renderBookTimeline(book) {
  const div = document.getElementById('bookTimeline');
  const tl = book.timeline || [];
  if (tl.length === 0) {
    div.innerHTML = '<div style="text-align:center;padding:20px;font-size:0.72rem;color:#b0a5c0;">还没有阅读记录，点击上方按钮开始</div>';
    return;
  }
  div.innerHTML = tl.slice().reverse().map(item => {
    const dt = new Date(item.date);
    const dateStr = `${dt.getMonth() + 1}月${dt.getDate()}日 ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    const dotClass = item.type === 'quote' ? 'gold' : (item.type === 'thinking' ? 'light' : '');
    const quoteHtml = item.quote ? `<div class="bd-tl-quote">${escapeHtml(item.quote)}</div>` : '';
    const textHtml = item.text ? `<div class="bd-tl-text">${escapeHtml(item.text)}</div>` : '';
    const pageLabel = item.page ? ` · 第${item.page}页` : '';
    return `<div class="bd-tl-item">
      <div class="bd-tl-dot ${dotClass}"></div>
      <div class="bd-tl-date">${dateStr}${pageLabel}</div>
      ${textHtml}
      ${quoteHtml}
    </div>`;
  }).join('');
}

// ===== 进度更新弹窗 =====
function openProgressUpdate() {
  const book = state.books.find(b => b.id === currentDetailBookId);
  if (!book) return;
  document.getElementById('progressDate').textContent = new Date().toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  document.getElementById('progressPageInput').value = book.currentPage || '';
  document.getElementById('progressNoteInput').value = '';
  document.getElementById('progressQuoteInput').value = '';
  document.getElementById('progressUpdateModal').classList.add('open');
}

function closeProgressUpdate() {
  document.getElementById('progressUpdateModal').classList.remove('open');
}

function saveProgressUpdate() {
  const book = state.books.find(b => b.id === currentDetailBookId);
  if (!book) return;
  const page = parseInt(document.getElementById('progressPageInput').value) || 0;
  const note = document.getElementById('progressNoteInput').value.trim();
  const quote = document.getElementById('progressQuoteInput').value.trim();
  if (!note && !quote && !page) { showToast('请填写一些内容'); return; }
  // 更新进度
  if (page > 0) {
    book.currentPage = page;
    if (book.totalPages > 0) {
      book.progress = Math.min(100, Math.round(page / book.totalPages * 100));
    } else {
      book.progress = Math.min(100, page > 0 ? Math.max(book.progress || 0, 10) : 0);
    }
  }
  // 添加时间轴
  book.timeline = book.timeline || [];
  book.timeline.push({
    date: new Date().toISOString(),
    type: 'progress',
    page: page || 0,
    text: note,
    quote: quote
  });
  saveState();
  renderBooks();
  // 刷新详情页
  openBookDetail(currentDetailBookId);
  closeProgressUpdate();
  showToast('已记录阅读进度');
}

// ===== 思考记录弹窗 =====
function openNoteEditor(type) {
  const book = state.books.find(b => b.id === currentDetailBookId);
  if (!book) return;
  document.getElementById('noteDate').textContent = new Date().toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  document.getElementById('noteTextInput').value = '';
  document.getElementById('noteQuoteInput').value = '';
  document.getElementById('noteEditorModal').classList.add('open');
}

function closeNoteEditor() {
  document.getElementById('noteEditorModal').classList.remove('open');
}

function saveNoteEntry() {
  const book = state.books.find(b => b.id === currentDetailBookId);
  if (!book) return;
  const text = document.getElementById('noteTextInput').value.trim();
  const quote = document.getElementById('noteQuoteInput').value.trim();
  if (!text && !quote) { showToast('请写一些思考'); return; }
  book.timeline = book.timeline || [];
  book.timeline.push({
    date: new Date().toISOString(),
    type: 'thinking',
    page: 0,
    text: text,
    quote: quote
  });
  saveState();
  renderBooks();
  openBookDetail(currentDetailBookId);
  closeNoteEditor();
  showToast('已记录思考');
}

// ===== 删除书籍 =====
function deleteBook() {
  if (!currentDetailBookId) return;
  const book = state.books.find(b => b.id === currentDetailBookId);
  const title = book ? book.title : '这本书';
  showConfirmModal({
    title: '删除书籍',
    message: `确定要删除《${title}》吗？\n所有阅读历程和笔记都会一并清除，且无法恢复。`,
    confirmText: '删除',
    confirmClass: 'danger',
    onConfirm: () => {
      state.books = state.books.filter(b => b.id !== currentDetailBookId);
      state.stats.bookCount = Math.max(0, (state.stats.bookCount || 0) - 1);
      saveState();
      renderBooks();
      closeBookDetail();
      showToast('已删除');
    }
  });
}
