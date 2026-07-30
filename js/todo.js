// Tab 切换
function switchTab(tabId, el) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    // 重置日记/书架子页面显示
    document.getElementById('diary-content').style.display = 'none';
    document.getElementById('books-content').style.display = 'none';
    document.getElementById('tab-diary').style.display = tabId === 'tab-diary' ? 'flex' : 'none';
    
    // 控制顶部导航栏显示：只在清单页显示
    const header = document.getElementById('appHeader');
    if (tabId === 'tab-todo') {
        header.style.display = 'flex';
    } else {
        header.style.display = 'none';
    }
    
    if (tabId === 'tab-achieve') renderAchievements();
    if (tabId === 'tab-diary') {
        showEntryCards();
        renderDiaries();
        renderCalendar();
        updateDiaryRemain();
    }
    if (tabId === 'tab-books') renderBooks();
    if (tabId === 'tab-afk') {
        updateEnergyUI();
        updateTotalMeditationDisplay();
    }
    if (tabId === 'tab-todo') {
        renderTodos();
        renderRoutines();
    }
}

function switchTodoTab(tabId, el) {
    document.querySelectorAll('.todo-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.todo-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'tab-routine-panel') renderRoutines();
    else renderTodos();
}

// ============================================================
//  1. 待办
// ============================================================
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    if (!text) return;
    state.todos.push({
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        text: text,
        done: false,
        createdAt: new Date().toISOString()
    });
    input.value = '';
    saveState();
    renderTodos();
    if (state.todos.length === 1 && state.isFirstLaunch) {
        setTimeout(() => {
            if (document.getElementById('guideOverlay').classList.contains('open'))
                nextGuide();
        }, 500);
    }
}

let todoDragSrc = null;

// 只保留拖拽逻辑（桌面 HTML5 draggable + 移动端 touch），长按已完成功能已移除
function setupTodoListDelegation() {
    // 拖拽事件已在 renderTodos 中绑定，此处不再重复
}

// ============================================================
//  点击星星切换待办（新函数）
// ============================================================
function handleStarClick(idx, element) {
    const todo = state.todos[idx];
    if (!todo) return;

    // 切换状态
    todo.done = !todo.done;
    if (todo.done) {
        // 从未完成变为完成 → 震动 + 音效
        playGentleSound('longPress');
        try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) { }
        state.stats.todoCount++;
        addEnergy(1);
        checkUnlock('first_todo', true);
        checkUnlock('todo_3', state.stats.todoCount >= 3);
        checkUnlock('todo_5', state.stats.todoCount >= 5);
        checkUnlock('todo_10', state.stats.todoCount >= 10);
        checkUnlock('todo_20', state.stats.todoCount >= 20);
        checkUnlock('todo_50', state.stats.todoCount >= 50);
        checkUnlock('todo_100', state.stats.todoCount >= 100);
        checkAllRounder();
        checkGenAchievements();
        if (typeof logActivity === 'function') logActivity('todo', todo.text);
    } else {
        // 从完成变为未完成
    }
    saveState();
    renderTodos();
    renderAchievements();
}

function renderTodos() {
    const list = document.getElementById('todoList');
    const visibleTodos = state.todos.filter(t => !state.hiddenTodoIds.includes(t.id));

    if (visibleTodos.length === 0) {
        list.innerHTML = '';
        return;
    }

    list.innerHTML = visibleTodos.map((todo, idx) => {
        const realIdx = state.todos.indexOf(todo);
        const starChar = todo.done ? '✦' : '✧';
        const starClass = todo.done ? 'todo-star-check done' : 'todo-star-check';
        return `
            <li class="todo-item ${todo.done ? 'done' : ''}" id="todo-${realIdx}" draggable="true" data-idx="${realIdx}" data-id="${todo.id}">
                <span class="todo-drag-handle" title="拖拽排序"><i class="fa-solid fa-grip-lines"></i></span>
                <span class="${starClass}" onclick="handleStarClick(${realIdx}, this)">${starChar}</span>
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <span class="todo-reward">+1</span>
                <span class="todo-delete" onclick="deleteTodo(${realIdx})"><i class="fa-regular fa-trash-can"></i></span>
            </li>
        `;
    }).join('');

    // 绑定拖拽事件 (桌面 + 移动端)
    list.querySelectorAll('.todo-item[draggable]').forEach(item => {
        const idx = parseInt(item.dataset.idx);

        // ---- 桌面拖拽 ----
        item.addEventListener('dragstart', function (e) {
            todoDragSrc = idx;
            this.style.opacity = '0.4';
            e.dataTransfer.effectAllowed = 'move';
            window.getSelection().removeAllRanges();
        });

        item.addEventListener('dragend', function () {
            this.style.opacity = '';
            list.querySelectorAll('.todo-item').forEach(i => i.classList.remove('drag-over'));
        });

        item.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            list.querySelectorAll('.todo-item').forEach(i => i.classList.remove('drag-over'));
            this.classList.add('drag-over');
        });

        item.addEventListener('drop', function (e) {
            e.preventDefault();
            const targetIdx = parseInt(this.dataset.idx);
            if (todoDragSrc === null || todoDragSrc === targetIdx) {
                list.querySelectorAll('.todo-item').forEach(i => i.classList.remove('drag-over'));
                return;
            }
            const moved = state.todos.splice(todoDragSrc, 1)[0];
            state.todos.splice(targetIdx, 0, moved);
            todoDragSrc = null;
            saveState();
            renderTodos();
        });

        // ---- 移动端触摸拖拽 ----
        let touchStartY = 0;
        let touchStartX = 0;
        let isDragging = false;
        let startIdx = null;

        item.addEventListener('touchstart', function (e) {
            if (e.target.closest('.todo-delete') || e.target.closest('.todo-star-check')) return;
            const touch = e.touches[0];
            touchStartY = touch.clientY;
            touchStartX = touch.clientX;
            startIdx = idx;
            isDragging = false;
            todoDragSrc = idx;
        }, { passive: true });

        item.addEventListener('touchmove', function (e) {
            const touch = e.touches[0];
            const deltaY = touch.clientY - touchStartY;
            const deltaX = touch.clientX - touchStartX;

            if (Math.abs(deltaY) < 8 && Math.abs(deltaX) < 8) return;

            e.preventDefault();
            isDragging = true;
            this.style.opacity = '0.4';

            const els = [...list.querySelectorAll('.todo-item[data-idx]')];
            let target = null;
            els.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    target = el;
                }
                el.classList.remove('drag-over');
            });
            if (target && target !== this) {
                target.classList.add('drag-over');
            }

            const listRect = list.getBoundingClientRect();
            const scrollThreshold = 60;
            if (touch.clientY - listRect.top < scrollThreshold) {
                list.scrollTop -= 10;
            } else if (listRect.bottom - touch.clientY < scrollThreshold) {
                list.scrollTop += 10;
            }
        }, { passive: false });

        item.addEventListener('touchend', function (e) {
            this.style.opacity = '';

            if (!isDragging || todoDragSrc === null) {
                list.querySelectorAll('.todo-item').forEach(i => i.classList.remove('drag-over'));
                return;
            }

            const touch = e.changedTouches[0];
            const els = [...list.querySelectorAll('.todo-item[data-idx]')];
            let targetEl = null;
            els.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    targetEl = el;
                }
                el.classList.remove('drag-over');
            });

            if (targetEl) {
                const targetIdx = parseInt(targetEl.dataset.idx);
                if (todoDragSrc !== null && todoDragSrc !== targetIdx) {
                    const moved =                     state.todos.splice(todoDragSrc, 1)[0];
                    state.todos.splice(targetIdx, 0, moved);
                    saveState();
                    renderTodos();
                }
            }
            todoDragSrc = null;
            isDragging = false;
        }, { passive: true });

        item.addEventListener('touchcancel', function () {
            this.style.opacity = '';
            list.querySelectorAll('.todo-item').forEach(i => i.classList.remove('drag-over'));
            todoDragSrc = null;
            isDragging = false;
        }, { passive: true });
    });
}

function playGentleSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;
        if (type === 'taskDone') {
            const frequencies = [1200, 1500, 1800];
            frequencies.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                const t = now + i * 0.08;
                gain.gain.setValueAtTime(0.01, t);
                gain.gain.linearRampToValueAtTime(0.10, t + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                osc.start(t);
                osc.stop(t + 0.25);
            });
        } else if (type === 'longPress') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        }
    } catch (e) { }
}

function deleteTodo(idx) {
    state.todos.splice(idx, 1);
    saveState();
    renderTodos();
}
