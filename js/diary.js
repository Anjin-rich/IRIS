// ============================================================
//  日记 (与之前相同，省略详细)
// ============================================================
let tempImages = [];
let selectedMood = null;
let diarySortDesc = true; // 默认倒序（最新在前）

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
    const todayStr = getTodayDateKey();
    const todayCount = state.diaries.filter(d => d.createdAt && d.createdAt.slice(0, 10) === todayStr).length;
    const remain = Math.max(0, 3 - todayCount);
    document.getElementById('diaryRemain').textContent = `📝 今日剩余 ${remain}/3 篇`;
}

function getRandomPrompt() { return WARM_PROMPTS[Math.floor(Math.random() * WARM_PROMPTS.length)]; }

function refreshPrompt() { document.getElementById('diaryPrompt').textContent = '💭 ' + getRandomPrompt(); }

function resetCustomMoods() {
    const today = getTodayDateKey();
    if (state.customMoodsDate !== today) {
        state.customMoods = [];
        state.customMoodsDate = today;
        saveState();
    }
}

function renderMoodSelector() {
    resetCustomMoods();
    const container = document.getElementById('moodSelector');
    const moods = getMoodEmojis();
    container.innerHTML = moods.map(emoji =>
        `<span class="mood-option" data-mood="${emoji}" onclick="selectMood(this)">${emoji}</span>`
    ).join('');
    const addBtn = document.createElement('span');
    addBtn.className = 'mood-add-btn';
    addBtn.textContent = '＋';
    addBtn.onclick = function (e) {
        e.stopPropagation();
        document.getElementById('addEmojiModal').classList.add('open');
        document.getElementById('emojiInput').value = '';
        document.getElementById('emojiInput').focus();
    };
    container.appendChild(addBtn);
    if (selectedMood) {
        container.querySelectorAll('.mood-option').forEach(el => {
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
    document.querySelectorAll('.mood-option').forEach(o => o.classList.remove('selected'));
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
    const remaining = 5 - tempImages.length;
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
    document.getElementById('uploadLabel').style.display = tempImages.length >= 5 ? 'none' : 'flex';
}

function saveDiary() {
    const text = document.getElementById('diaryInput').value.trim();
    if (!text && tempImages.length === 0) { showToast('📝 写点什么吧'); return; }
    const todayStr = getTodayDateKey();
    const todayCount = state.diaries.filter(d => d.createdAt && d.createdAt.slice(0, 10) === todayStr).length;
    if (todayCount >= 3) { showToast('📔 今天已写了3篇日记，明天再来吧！'); return; }
    const entry = {
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
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
    checkUnlock('diary_3', state.stats.diaryCount >= 3);
    checkUnlock('diary_5', state.stats.diaryCount >= 5);
    checkUnlock('diary_10', state.stats.diaryCount >= 10);
    checkUnlock('diary_20', state.stats.diaryCount >= 20);
    checkAllRounder();
    document.getElementById('diaryInput').value = '';
    tempImages = [];
    selectedMood = null;
    document.querySelectorAll('.mood-option').forEach(o => o.classList.remove('selected'));
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
    const todayStr = today.toISOString().slice(0, 10);
    let html = '';
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    weekdays.forEach(d => html += `<div class="calendar-weekday">${d}</div>`);
    for (let i = 0; i < firstDay; i++) html += `<div class="calendar-day other-month"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(diaryCalendarYear, diaryCalendarMonth, d);
        const dateStr = dateObj.toISOString().slice(0, 10);
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
    const diary = state.diaries.find(di => {
        const diDate = new Date(di.createdAt);
        return diDate.getFullYear() === year && diDate.getMonth() === month && diDate.getDate() ===
            day;
    });
    if (diary) {
        const text = diary.text || '(无文字)';
        const mood = diary.mood || '';
        const dateStr =
            `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        showToast(`📅 ${dateStr} ${mood}\n${text.slice(0, 50)}${text.length > 50 ? '...' : ''}`);
    } else {
        showToast(`📅 ${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 没有日记`);
    }
}

function renderDiaries() {
    const list = document.getElementById('diaryList');
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const recent = state.diaries.filter(d => new Date(d.createdAt) >= twoDaysAgo);
    if (recent.length === 0) {
        list.innerHTML =
            `<div style="text-align:center;padding:12px 0;font-size:0.9rem;color:var(--text-sub);">最近两天没有日记，去写一篇吧</div>`;
        return;
    }
    list.innerHTML = recent.map(d => `
        <div class="history-diary-card">
            <button class="diary-edit-btn" onclick="openEditDiary('${d.id}')"><i class="fa-regular fa-pen-to-square"></i></button>
            <div class="history-diary-date">${d.date}${d.mood ? `<span class="mood-emoji">${d.mood}</span>` : ''}</div>
            <div class="history-diary-text">${escapeHtml(d.text)}</div>
            ${d.images && d.images.length ? `<div class="history-diary-pics">${d.images.map(img => `<img src="${img}" onclick="viewFullImage('${img}')">`).join('')}</div>` : ''}
        </div>
    `).join('');
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
                    <span>📅 ${month} <span style="font-size:0.7rem;color:var(--text-sub);margin-left:4px;">${entries.length} 篇</span></span>
                    <i class="fa-solid fa-chevron-down diary-month-chevron"></i>
                </div>
                <div class="diary-month-body">
                    ${entries.map(d => `
                    <div class="history-diary-card" style="margin-bottom:8px;">
                        <button class="diary-edit-btn" onclick="openEditDiary('${d.id}')"><i class="fa-regular fa-pen-to-square"></i></button>
                        <div class="history-diary-date">${d.date}${d.mood ? `<span class="mood-emoji">${d.mood}</span>` : ''}</div>
                        <div class="history-diary-text">${escapeHtml(d.text)}</div>
                        ${d.images && d.images.length ? `<div class="history-diary-pics">${d.images.map(img => `<img src="${img}" onclick="viewFullImage('${img}')">`).join('')}</div>` : ''}
                    </div>`).join('')}
                </div>
            </div>`;
    }).join('');
    document.getElementById('allDiariesModal').classList.add('open');
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
    const remaining = 5 - editDiaryImages.length;
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
    if (!text) { showToast('日记内容不能为空'); return; }
    const entry = state.diaries.find(d => d.id === editDiaryId);
    if (entry) {
        entry.text = text;
        entry.images = [...editDiaryImages];
        entry.date = new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) + ' ' +
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (已编辑)';
        saveState();
        renderDiaries();
        renderCalendar();
        showToast('✅ 日记已更新');
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
        showToast('🗑️ 日记已删除');
    }
    closeEditDiary();
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
