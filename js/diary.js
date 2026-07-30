// ============================================================
//  日记 (与之前相同，省略详细)
// ============================================================
let tempImages = [];
let selectedMood = null;
let diarySortDesc = true; // 默认倒序（最新在前）
let viewerDiaries = [];
let viewerIndex = 0;

// ===== 日记+书架入口切换 =====
function showDiaryContent() {
    document.getElementById('tab-diary').style.display = 'none';
    document.getElementById('diary-content').style.display = 'block';
    document.getElementById('books-content').style.display = 'none';
    document.getElementById('appHeader').style.display = 'none';
}

function showBookContent() {
    document.getElementById('tab-diary').style.display = 'none';
    document.getElementById('diary-content').style.display = 'none';
    document.getElementById('books-content').style.display = 'block';
    document.getElementById('appHeader').style.display = 'none';
}

function showEntryCards() {
    document.getElementById('tab-diary').style.display = 'flex';
    document.getElementById('diary-content').style.display = 'none';
    document.getElementById('books-content').style.display = 'none';
}

function updateBookCountSubtitle() {
    const count = state.books ? state.books.length : 0;
    const subtitle = document.getElementById('bookCountSubtitle');
    if (subtitle) {
        subtitle.textContent = '记录读书笔记';
    }
}

function toggleDiarySort() {
    diarySortDesc = !diarySortDesc;
    updateSortBtnStyle();
    // 如果弹窗已打开，重新渲染列表
    if (document.getElementById('allDiariesModal').classList.contains('open')) {
        openAllDiaries();
    }
}

function updateSortBtnStyle() {
    const asc = document.getElementById('sortAsc');
    const desc = document.getElementById('sortDesc');
    if (!asc || !desc) return;
    if (diarySortDesc) {
        asc.style.background = '#fff';
        asc.style.color = 'var(--text-sub)';
        desc.style.background = 'var(--light-purple)';
        desc.style.color = 'var(--dark-purple)';
    } else {
        asc.style.background = 'var(--light-purple)';
        asc.style.color = 'var(--dark-purple)';
        desc.style.background = '#fff';
        desc.style.color = 'var(--text-sub)';
    }
}

function updateDiaryRemain() {
    const todayStr = getBeijingDateKey();
    const todayCount = state.diaries.filter(d => d.createdAt && getBeijingDateKey(new Date(d.createdAt)) === todayStr).length;
    const remain = Math.max(0, 3 - todayCount);
    document.getElementById('diaryRemain').textContent = `今日剩余 ${remain}/3 篇`;
}

function getRandomPrompt() { return WARM_PROMPTS[Math.floor(Math.random() * WARM_PROMPTS.length)]; }

function refreshPrompt() { document.getElementById('diaryPrompt').textContent = getRandomPrompt(); }

function resetCustomMoods() {
    const today = getTodayDateKey();
    if (state.customMoodsDate !== today) {
        state.customMoods = [];
        state.customMoodsDate = today;
        saveState();
    }
}

// SVG表情图标
const MOOD_SVGS = {
    love: `<svg viewBox="0 0 40 40"><path d="M20 8.6 C14.8 4.7 17.4 2.1 20 4.7 C22.6 2.1 25.2 4.7 20 8.6 Z" fill="#ff8fa3"/><path d="M7 16.8 C3.4 14.1 5.2 12.3 7 14.1 C8.8 12.3 10.6 14.1 7 16.8 Z" fill="#ff8fa3"/><path d="M33 16.8 C29.4 14.1 31.2 12.3 33 14.1 C34.8 12.3 36.6 14.1 33 16.8 Z" fill="#ff8fa3"/><ellipse cx="9" cy="23.5" rx="5.5" ry="4" fill="#f5a97f"/><ellipse cx="31" cy="23.5" rx="5.5" ry="4" fill="#f5a97f"/><path d="M9 19 q4 -5 8 0" fill="none" stroke="#1c2340" stroke-width="2.4" stroke-linecap="round"/><path d="M23 19 q4 -5 8 0" fill="none" stroke="#1c2340" stroke-width="2.4" stroke-linecap="round"/><path d="M16 27.5 q4 3 8 0" fill="none" stroke="#1c2340" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    happy: `<svg viewBox="0 0 40 40"><ellipse cx="8.5" cy="20" rx="5.5" ry="4" fill="#f5a97f"/><ellipse cx="31.5" cy="20" rx="5.5" ry="4" fill="#f5a97f"/><path d="M10 15 q4 -6 8 0" fill="none" stroke="#1c2340" stroke-width="2.4" stroke-linecap="round"/><path d="M22 15 q4 -6 8 0" fill="none" stroke="#1c2340" stroke-width="2.4" stroke-linecap="round"/><path d="M11 23 q9 11 18 0 q-9 -3 -18 0" fill="#1c2340" stroke="none"/></svg>`,
    sad: `<svg viewBox="0 0 40 40"><ellipse cx="9" cy="21" rx="5.5" ry="4" fill="#f5a97f"/><ellipse cx="31" cy="21" rx="5.5" ry="4" fill="#f5a97f"/><path d="M10 17 q4 1.5 8 0" fill="none" stroke="#1c2340" stroke-width="2.2" stroke-linecap="round"/><path d="M22 17 q4 1.5 8 0" fill="none" stroke="#1c2340" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="21" cy="27" rx="3" ry="2.6" fill="#1c2340"/><path d="M23 30 q-1 3 0.5 5 q2 -1 1 -4 q-0.7 -1.3 -1.5 -1z" fill="#8fc9f0"/></svg>`,
    depress: `<svg viewBox="0 0 40 40"><ellipse cx="9" cy="21" rx="5.5" ry="4" fill="#f5a97f"/><ellipse cx="31" cy="21" rx="5.5" ry="4" fill="#f5a97f"/><circle cx="14" cy="17" r="2" fill="#1c2340"/><circle cx="26" cy="17" r="2" fill="#1c2340"/><path d="M14 27 L26 27" fill="none" stroke="#1c2340" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    worried: `<svg viewBox="0 0 40 40"><ellipse cx="9" cy="21" rx="5.5" ry="4" fill="#f5a97f"/><ellipse cx="31" cy="21" rx="5.5" ry="4" fill="#f5a97f"/><path d="M10 12 L16 10.5" fill="none" stroke="#1c2340" stroke-width="1.8" stroke-linecap="round"/><path d="M24 10.5 L30 12" fill="none" stroke="#1c2340" stroke-width="1.8" stroke-linecap="round"/><circle cx="14" cy="17" r="2" fill="#1c2340"/><circle cx="26" cy="17" r="2" fill="#1c2340"/><path d="M13 27 q7 -6 14 0" fill="none" stroke="#1c2340" stroke-width="2.4" stroke-linecap="round"/></svg>`
};

const MOOD_KEYS = ['love', 'happy', 'sad', 'depress', 'worried'];

function renderMoodSelector() {
    resetCustomMoods();
    const container = document.getElementById('moodSelector');
    
    let html = MOOD_KEYS.map(key => 
        `<button class="mood-btn" data-mood="${key}" onclick="selectMood(this)">
            <div class="mood-icon">${MOOD_SVGS[key]}</div>
        </button>`
    ).join('');
    
    html += `<label class="mood-btn mood-upload-btn" id="uploadLabel">
        <div class="mood-icon">
            <i class="fa-solid fa-camera" style="font-size: 16px; color: #867993;"></i>
        </div>
        <input type="file" id="diaryImages" accept="image/*" multiple style="display:none;"
            onchange="handleImageUpload(event)">
    </label>`;
    
    container.innerHTML = html;
    
    if (selectedMood) {
        container.querySelectorAll('.mood-btn[data-mood]').forEach(el => {
            if (el.dataset.mood === selectedMood) el.classList.add('selected');
        });
    }
}

function closeAddEmojiModal() { document.getElementById('addEmojiModal').classList.remove('open'); }

function confirmAddEmoji() {
    const emoji = document.getElementById('emojiInput').value.trim();
    if (emoji) {
        state.customMoods.push(emoji);
        state.customMoodsDate = getTodayDateKey();
        saveState();
        renderMoodSelector();
        showToast('✅ 已添加自定义表情');
    }
    closeAddEmojiModal();
}

function selectMood(el) {
    document.querySelectorAll('.mood-btn[data-mood]').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedMood = el.dataset.mood;
}

function compressImage(file, maxSizeKB = 200) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                let quality = 0.9;
                let width = img.width,
                    height = img.height;
                const maxDim = 1200;
                if (width > maxDim || height > maxDim) {
                    const ratio = Math.min(maxDim / width, maxDim / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                let dataUrl;
                let size = Infinity;
                while (size > maxSizeKB * 1024 && quality > 0.1) {
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                    size = dataUrl.length * 3 / 4;
                    quality -= 0.05;
                }
                resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const remaining = 3 - tempImages.length;
    if (files.length > remaining && remaining > 0) {
        showToast(`最多添加 3 张图片，已自动选取前 ${remaining} 张`);
    } else if (remaining <= 0) {
        showToast('最多添加 3 张图片');
        e.target.value = '';
        return;
    }
    const allowed = files.slice(0, remaining);
    for (const file of allowed) {
        try {
            const compressed = await compressImage(file);
            tempImages.push(compressed);
        } catch (err) {
            const reader = new FileReader();
            reader.onload = ev => {
                tempImages.push(ev.target.result);
                renderPreviews();
            };
            reader.readAsDataURL(file);
        }
    }
    renderPreviews();
    e.target.value = '';
}

function removeTempImage(idx) {
    tempImages.splice(idx, 1);
    renderPreviews();
}

function renderPreviews() {
    const container = document.getElementById('previewContainer');
    container.innerHTML = tempImages.map((src, idx) => `
        <div class="media-preview-wrapper">
            <img src="${src}" class="media-preview-img">
            <span class="media-delete-badge" onclick="removeTempImage(${idx})"><i class="fa-solid fa-xmark"></i></span>
        </div>
    `).join('');
    document.getElementById('uploadLabel').style.display = tempImages.length >= 3 ? 'none' : 'flex';
}

function saveDiary() {
    const text = document.getElementById('diaryInput').value.trim();
    const title = document.getElementById('diaryTitle')?.value.trim() || '';
    if (!text && !title && tempImages.length === 0) { showToast('📝 写点什么吧'); return; }
    const todayStr = getBeijingDateKey();
    const todayCount = state.diaries.filter(d => d.createdAt && getBeijingDateKey(new Date(d.createdAt)) === todayStr).length;
    if (todayCount >= 3) { showToast('📔 今天已写了3篇日记，明天再来吧！'); return; }
    const entry = {
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        title: title,
        text: text || '',
        images: [...tempImages],
        date: new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) + ' ' + new Date()
            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood: selectedMood || null,
        createdAt: new Date().toISOString()
    };
    state.diaries.unshift(entry);
    state.stats.diaryCount++;
    addEnergy(5);
    if (typeof logActivity === 'function') logActivity('diary', entry.title || '无标题', { title: entry.title, text: entry.text });
    checkUnlock('diary_3', state.stats.diaryCount >= 3);
    checkUnlock('diary_5', state.stats.diaryCount >= 5);
    checkUnlock('diary_10', state.stats.diaryCount >= 10);
    checkUnlock('diary_20', state.stats.diaryCount >= 20);
    checkAllRounder();
    document.getElementById('diaryInput').value = '';
    const titleEl = document.getElementById('diaryTitle');
    if (titleEl) titleEl.value = '';
    tempImages = [];
    selectedMood = null;
    document.querySelectorAll('.mood-btn[data-mood]').forEach(o => o.classList.remove('selected'));
    renderPreviews();
    saveState();
    renderDiaries();
    renderCalendar();
    renderAchievements();
    updateDiaryRemain();
    showToast('📖 日记已保存 +5');
    if (state.isFirstLaunch && state.diaries.length >= 1) {
        setTimeout(() => {
            if (document.getElementById('guideOverlay').classList.contains('open'))
                nextGuide();
        }, 500);
    }
}

function changeDiaryMonth(delta) {
    diaryCalendarMonth += delta;
    if (diaryCalendarMonth < 0) {
        diaryCalendarMonth = 11;
        diaryCalendarYear--;
    }
    if (diaryCalendarMonth > 11) {
        diaryCalendarMonth = 0;
        diaryCalendarYear++;
    }
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('calendarMonthYear');
    if (!grid || !monthYear) return;
    monthYear.textContent = `${diaryCalendarYear}年${diaryCalendarMonth + 1}月`;
    const firstDay = new Date(diaryCalendarYear, diaryCalendarMonth, 1).getDay();
    const daysInMonth = new Date(diaryCalendarYear, diaryCalendarMonth + 1, 0).getDate();
    const today = new Date();
    const todayStr = getBeijingDateKey(today);
    let html = '';
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    weekdays.forEach(d => html += `<div class="calendar-weekday">${d}</div>`);
    for (let i = 0; i < firstDay; i++) html += `<div class="calendar-day other-month"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(diaryCalendarYear, diaryCalendarMonth, d);
        const dateStr = getBeijingDateKey(dateObj);
        const isToday = dateStr === todayStr;
        const diary = state.diaries.find(di => {
            const diDate = new Date(di.createdAt);
            return diDate.getFullYear() === diaryCalendarYear && diDate.getMonth() ===
                diaryCalendarMonth && diDate.getDate() === d;
        });
        const hasDiary = !!diary;
        const mood = diary ? diary.mood : null;
        const dayClass =
            `calendar-day ${hasDiary ? 'has-diary' : ''} ${isToday ? 'today' : ''}`;
        const moodHtml = mood ? `<span class="mood-emoji">${mood}</span>` : '';
        html += `
            <div class="${dayClass}" onclick="viewDiaryByDate(${diaryCalendarYear}, ${diaryCalendarMonth}, ${d})">
                <span class="day-number">${d}</span>
                ${moodHtml}
            </div>
        `;
    }
    grid.innerHTML = html;
}

function viewDiaryByDate(year, month, day) {
    const targetKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const diary = state.diaries.find(di => {
        return getBeijingDateKey(new Date(di.createdAt)) === targetKey;
    });
    if (diary) {
        const text = diary.text || '(无文字)';
        const mood = diary.mood || '';
        showToast(`📅 ${targetKey} ${mood}\n${text.slice(0, 50)}${text.length > 50 ? '...' : ''}`);
    } else {
        showToast(`📅 ${targetKey} 没有日记`);
    }
}

function getMoodSvg(mood) {
    if (MOOD_SVGS[mood]) {
        return `<span class="mood-svg-icon">${MOOD_SVGS[mood]}</span>`;
    }
    return `<span class="mood-emoji">${mood}</span>`;
}

function renderDiaries() {
    const list = document.getElementById('diaryList');
    const todayKey = getBeijingDateKey();
    const todayDiaries = state.diaries.filter(d => {
        const diaryKey = getBeijingDateKey(new Date(d.createdAt));
        return diaryKey === todayKey;
    });
    if (todayDiaries.length === 0) {
        list.innerHTML =
            `<div style="text-align:center;padding:12px 0;font-size:0.9rem;color:var(--text-sub);"></div>`;
        return;
    }
    list.innerHTML = todayDiaries.map(d => `
        <div class="history-diary-card" data-imgs="${(d.images || []).join('|')}">
            <button class="diary-edit-btn" onclick="openEditDiary('${d.id}')"><i class="fa-regular fa-pen-to-square"></i></button>
            <div class="history-diary-date">${d.date}${d.mood ? getMoodSvg(d.mood) : ''}</div>
            ${d.title ? `<div class="history-diary-title">${escapeHtml(d.title)}</div>` : ''}
            <div class="history-diary-text">${escapeHtml(d.text)}</div>
            <div class="history-diary-pics lazy-images"></div>
        </div>
    `).join('');
    list.querySelectorAll('.history-diary-card').forEach(card => {
        const ids = (card.dataset.imgs || '').split('|').filter(Boolean);
        if (ids.length === 0) return;
        const container = card.querySelector('.history-diary-pics');
        Promise.all(ids.map(id => ImageDB.get(id))).then(urls => {
            container.innerHTML = urls.filter(Boolean).map(url =>
                `<img src="${url}" onclick="viewFullImage('${url.replace(/'/g, "\\'")}')" />`);
        });
    });
}

function openAllDiaries() {
    const body = document.getElementById('allDiariesBody');
    if (!state.diaries || state.diaries.length === 0) {
        body.innerHTML =
            '<div class="empty-state"><i class="fa-regular fa-folder-open"></i>还没有日记，去写第一篇吧！</div>';
        document.getElementById('allDiariesModal').classList.add('open');
        return;
    }
    // 按创建时间精确排序（ISO字符串可直接比较）
    const sorted = [...state.diaries].sort((a, b) => {
        return diarySortDesc ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt);
    });
    // 按年月分组
    const groups = {};
    sorted.forEach(d => {
        const dt = new Date(d.createdAt);
        const key = `${dt.getFullYear()}年${String(dt.getMonth() + 1).padStart(2, '0')}月`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(d);
    });
    // 月份顺序：倒序最新在前，正序最早在前
    const monthKeys = Object.keys(groups);
    if (!diarySortDesc) monthKeys.reverse();
    updateSortBtnStyle();
    body.innerHTML = monthKeys.map(month => {
        const entries = groups[month];
        return `
            <div class="diary-month-group">
                <div class="diary-month-header" onclick="toggleDiaryMonth(this)">
                    <span>${month} <span style="font-size:0.7rem;color:var(--text-sub);margin-left:4px;">${entries.length} 篇</span></span>
                    <i class="fa-solid fa-chevron-down diary-month-chevron"></i>
                </div>
                <div class="diary-month-body">
                    ${entries.map(d => `
                    <div class="history-diary-card" style="margin-bottom:8px;cursor:pointer;" onclick="closeAllDiaries();setTimeout(()=>openDiaryViewer('${d.id}'),300)" data-imgs="${(d.images || []).join('|')}">
                        <div class="history-diary-date">${d.date}${d.mood ? getMoodSvg(d.mood) : ''}</div>
                        <div class="history-diary-text">${escapeHtml(d.text)}</div>
                        <div class="history-diary-pics lazy-images"></div>
                    </div>`).join('')}
                </div>
            </div>`;
    }).join('');
    document.getElementById('allDiariesModal').classList.add('open');
    body.querySelectorAll('.history-diary-card').forEach(card => {
        const ids = (card.dataset.imgs || '').split('|').filter(Boolean);
        if (ids.length === 0) return;
        const container = card.querySelector('.history-diary-pics');
        Promise.all(ids.map(id => ImageDB.get(id))).then(urls => {
            container.innerHTML = urls.filter(Boolean).map(url =>
                `<img src="${url}" onclick="viewFullImage('${url.replace(/'/g, "\\'")}')" />`);
        });
    });
}

function closeAllDiaries() { document.getElementById('allDiariesModal').classList.remove('open'); }

function toggleDiaryMonth(headerEl) {
    const body = headerEl.nextElementSibling;
    const chevron = headerEl.querySelector('.diary-month-chevron');
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    chevron.style.transform = isOpen ? 'rotate(-90deg)' : '';
}

let editDiaryImages = [];

function openEditDiary(id) {
    const entry = state.diaries.find(d => d.id === id);
    if (!entry) return;
    editDiaryId = id;
    document.getElementById('editDiaryTitle').value = entry.title || '';
    document.getElementById('editDiaryText').value = entry.text;
    editDiaryImages = [...entry.images];
    renderEditDiaryImages();
    document.getElementById('editDiaryModal').classList.add('open');
}

function renderEditDiaryImages() {
    const container = document.getElementById('editDiaryImages');
    if (editDiaryImages.length === 0) {
        container.innerHTML = `<div style="font-size:0.75rem;color:var(--text-sub);padding:4px 0;">暂无图片</div>`;
        return;
    }
    container.innerHTML = editDiaryImages.map((src, idx) => `
        <div class="edit-img-wrapper">
            <img src="${src}" alt="日记图片">
            <span class="edit-img-del" onclick="removeEditImage(${idx})"><i class="fa-solid fa-xmark"></i></span>
        </div>
    `).join('');
}

function removeEditImage(idx) {
    editDiaryImages.splice(idx, 1);
    renderEditDiaryImages();
}

async function handleEditDiaryImageUpload(e) {
    const files = Array.from(e.target.files);
    const remaining = 3 - editDiaryImages.length;
    if (files.length > remaining && remaining > 0) {
        showToast(`最多添加 3 张图片，已自动选取前 ${remaining} 张`);
    } else if (remaining <= 0) {
        showToast('最多添加 3 张图片');
        e.target.value = '';
        return;
    }
    const allowed = files.slice(0, remaining);
    for (const file of allowed) {
        try {
            const compressed = await compressImage(file);
            editDiaryImages.push(compressed);
        } catch (err) {
            const reader = new FileReader();
            reader.onload = ev => {
                editDiaryImages.push(ev.target.result);
                renderEditDiaryImages();
            };
            reader.readAsDataURL(file);
        }
    }
    renderEditDiaryImages();
    e.target.value = '';
}

function closeEditDiary() {
    document.getElementById('editDiaryModal').classList.remove('open');
    editDiaryId = null;
    editDiaryImages = [];
}

function saveEditDiary() {
    const text = document.getElementById('editDiaryText').value.trim();
    const title = document.getElementById('editDiaryTitle').value.trim();
    if (!text && !title && editDiaryImages.length === 0) { showToast('写点什么吧'); return; }
    const entry = state.diaries.find(d => d.id === editDiaryId);
    if (entry) {
        entry.title = title;
        entry.text = text;
        entry.images = [...editDiaryImages];
        entry.updatedAt = new Date().toISOString();
        saveState();
        renderDiaries();
        renderCalendar();
    }
    closeEditDiary();
}

function deleteDiary() {
    if (!editDiaryId) return;
    if (!confirm('确定要删除这篇日记吗？此操作不可撤销。')) return;
    const idx = state.diaries.findIndex(d => d.id === editDiaryId);
    if (idx !== -1) {
        state.diaries.splice(idx, 1);
        saveState();
        renderDiaries();
        renderCalendar();
        updateDiaryRemain();
    }
    closeEditDiary();
    closeDiaryViewer();
}

function viewFullImage(src) {
    const overlay = document.createElement('div');
    overlay.style.cssText =
        'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;z-index:999;cursor:pointer;';
    overlay.innerHTML =
        `<img src="${src}" style="max-width:92%;max-height:85%;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,0.5);">`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
}

// ============================================================
//  日记浏览卡片
// ============================================================
function openDiaryViewer(id) {
    const sorted = [...state.diaries].sort((a, b) =>
        diarySortDesc ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)
    );
    viewerDiaries = sorted;
    viewerIndex = sorted.findIndex(d => d.id === id);
    if (viewerIndex === -1) viewerIndex = 0;
    renderDiaryViewer();
    document.getElementById('diaryViewerModal').classList.add('open');
}

function closeDiaryViewer() {
    document.getElementById('diaryViewerModal').classList.remove('open');
}

function navigateDiary(dir) {
    viewerIndex += dir;
    if (viewerIndex < 0) viewerIndex = 0;
    if (viewerIndex >= viewerDiaries.length) viewerIndex = viewerDiaries.length - 1;
    renderDiaryViewer();
}

async function renderDiaryViewer() {
    const d = viewerDiaries[viewerIndex];
    if (!d) return;
    document.getElementById('diaryViewerDate').textContent = d.date || '日记';
    const moodEl = document.getElementById('diaryViewerMood');
    if (d.mood) {
        moodEl.innerHTML = getMoodSvg(d.mood);
        moodEl.style.display = 'block';
    } else {
        moodEl.textContent = '';
        moodEl.style.display = 'none';
    }
    document.getElementById('diaryViewerText').textContent = d.text || '(无文字)';
    const picsEl = document.getElementById('diaryViewerPics');
    picsEl.innerHTML = '';
    if (d.images && d.images.length > 0) {
        const urls = await Promise.all(d.images.map(id => ImageDB.get(id)));
        picsEl.innerHTML = urls.filter(Boolean).map(url =>
            `<img src="${url}" onclick="viewFullImage('${url.replace(/'/g, "\\'")}')" />`
        ).join('');
    }
    document.getElementById('diaryViewerCounter').textContent =
        `${viewerIndex + 1} / ${viewerDiaries.length}`;
    const prevBtn = document.querySelector('.diary-nav-btn');
    const nextBtn = document.querySelectorAll('.diary-nav-btn')[1];
    if (prevBtn) prevBtn.disabled = viewerIndex === 0;
    if (nextBtn) nextBtn.disabled = viewerIndex === viewerDiaries.length - 1;
}

function openEditFromViewer() {
    const d = viewerDiaries[viewerIndex];
    if (!d) return;
    closeDiaryViewer();
    setTimeout(() => openEditDiary(d.id), 300);
}
