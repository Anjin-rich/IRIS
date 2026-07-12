// Tab 切换
function switchTab(tabId, el) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'tab-achieve') renderAchievements();
    if (tabId === 'tab-diary') {
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
    showToast('✅ 待办已添加');
    if (state.todos.length === 1 && state.isFirstLaunch) {
        setTimeout(() => {
            if (document.getElementById('guideOverlay').classList.contains('open'))
                nextGuide();
        }, 500);
    }
}

let todoDragSrc = null;

// 长按状态管理（使用 ID 作为键）
const longPressState = new Map();

// 事件委托：长按 + 拖拽（桌面端使用 HTML5 draggable，移动端使用自定义 touch 拖拽）
function setupTodoListDelegation() {
    const list = document.getElementById('todoList');
    if (!list) return;

    // 移除旧的监听器以避免重复
    if (list._longPressListener) {
        list.removeEventListener('pointerdown', list._longPressListener);
        list.removeEventListener('pointerup', list._longPressUpListener);
        list.removeEventListener('pointercancel', list._longPressCancelListener);
    }

    // ----- 长按逻辑 (Pointer Events) 增加移动检测 -----
    const pointerDownHandler = (e) => {
        // 只处理左键 / 触摸
        if (e.button !== undefined && e.button !== 0) return;

        const item = e.target.closest('.todo-item');
        if (!item) return;
        // 排除拖拽手柄、删除按钮、星星（星星用点击处理）
        if (e.target.closest('.todo-drag-handle') || e.target.closest('.todo-delete') || e.target
            .closest('.todo-star-check')) {
            return;
        }
        const id = item.dataset.id;
        if (!id) return;

        // 检查冷却状态
        if (longPressState.has(id)) {
            const st = longPressState.get(id);
            if (st.cooldown) return;
            if (st.timer) {
                clearTimeout(st.timer);
                st.timer = null;
            }
        }

        // 记录起始位置
        const startX = e.clientX;
        const startY = e.clientY;
        let moved = false;

        // 设置状态
        const st = longPressState.get(id) || { cooldown: false, done: false, timer: null };
        if (st.cooldown) return;

        // 添加活跃类
        item.classList.add('long-press-active');

        // 移动检测
        const moveHandler = (ev) => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            if (Math.sqrt(dx * dx + dy * dy) > 10) {
                moved = true;
                if (st.timer) {
                    clearTimeout(st.timer);
                    st.timer = null;
                    item.classList.remove('long-press-active');
                }
                document.removeEventListener('pointermove', moveHandler);
            }
        };
        document.addEventListener('pointermove', moveHandler);

        // 设置计时器 (600ms)
        st.timer = setTimeout(() => {
            document.removeEventListener('pointermove', moveHandler);
            if (moved) {
                item.classList.remove('long-press-active');
                return;
            }
            // 执行长按操作
            triggerLoveEffect(item, id);
            item.classList.remove('long-press-active');
            item.classList.add('long-press-done');
            st.done = true;
            st.timer = null;

            // 500ms 后移除完成类并进入冷却
            setTimeout(() => {
                item.classList.remove('long-press-done');
                st.done = false;
                st.cooldown = true;
                setTimeout(() => {
                    st.cooldown = false;
                }, 500);
            }, 500);
        }, 600);

        longPressState.set(id, st);

        // 取消事件 (pointerup / pointercancel)
        const cancelHandler = (ev) => {
            document.removeEventListener('pointermove', moveHandler);
            const currentSt = longPressState.get(id);
            if (currentSt && currentSt.timer) {
                clearTimeout(currentSt.timer);
                currentSt.timer = null;
                item.classList.remove('long-press-active');
            }
            document.removeEventListener('pointerup', cancelHandler);
            document.removeEventListener('pointercancel', cancelHandler);
        };
        document.addEventListener('pointerup', cancelHandler);
        document.addEventListener('pointercancel', cancelHandler);
    };

    list.addEventListener('pointerdown', pointerDownHandler);
    list._longPressListener = pointerDownHandler;

    // ----- 保留原有的拖拽逻辑 (桌面 HTML5 draggable + 移动端 touch) -----
    // 桌面端 draggable 事件已在 renderTodos 中绑定，此处不再重复
    // 移动端 touch 事件也在 renderTodos 中绑定
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
        // 从未完成变为完成 → 触发爱心动效 + 震动
        spawnHeartParticles(element);
        playGentleSound('longPress');
        try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) { }
        state.stats.todoCount++;
        addEnergy(1);
        showToast('❤️ 完成 +1');
        checkUnlock('first_todo', true);
        checkUnlock('todo_3', state.stats.todoCount >= 3);
        checkUnlock('todo_5', state.stats.todoCount >= 5);
        checkUnlock('todo_10', state.stats.todoCount >= 10);
        checkUnlock('todo_20', state.stats.todoCount >= 20);
        checkUnlock('todo_50', state.stats.todoCount >= 50);
        checkUnlock('todo_100', state.stats.todoCount >= 100);
        checkAllRounder();
        checkGenAchievements();
    } else {
        // 从完成变为未完成
        showToast('↩️ 已取消完成');
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
                    const moved = state.todos.splice(todoDragSrc, 1)[0];
                    state.todos.splice(targetIdx, 0, moved);
                    saveState();
                    renderTodos();
                    showToast('📌 已重新排序');
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

function triggerLoveEffect(element, todoId) {
    playGentleSound('longPress');
    const todo = state.todos.find(t => t.id === todoId);
    spawnHeartParticles(element);
    if (todo && !todo.done) {
        todo.done = true;
        state.stats.todoCount++;
        addEnergy(1);
        showToast('❤️ 长按完成 +1');
        checkUnlock('first_todo', true);
        saveState();
        renderTodos();
        renderAchievements();
    }
}

function spawnHeartParticles(element) {
    const container = document.getElementById('particleContainer');
    const rect = element.getBoundingClientRect();
    const hearts = ['❤️', '💜', '✨', '🌸', '💗', '🌟'];
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.textContent = hearts[i % hearts.length];
        p.style.cssText = `
            position: fixed;
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + Math.random() * rect.height}px;
            font-size: ${16 + Math.random() * 22}px;
            pointer-events: none;
            z-index: 999;
            transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            opacity: 1;
            transform: scale(1);
        `;
        container.appendChild(p);
        const dx = (Math.random() - 0.5) * 220;
        const dy = -Math.random() * 200 - 60;
        requestAnimationFrame(() => {
            p.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
            p.style.opacity = '0';
        });
        setTimeout(() => p.remove(), 1400);
    }
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

function toggleTodo(idx) {
    const todo = state.todos[idx];
    if (!todo) return;
    todo.done = !todo.done;
    if (todo.done) {
        state.stats.todoCount++;
        addEnergy(1);
        showToast('✅ 待办完成 +1');
        checkUnlock('first_todo', true);
        checkUnlock('todo_3', state.stats.todoCount >= 3);
        checkUnlock('todo_5', state.stats.todoCount >= 5);
        checkUnlock('todo_10', state.stats.todoCount >= 10);
        checkUnlock('todo_20', state.stats.todoCount >= 20);
        checkUnlock('todo_50', state.stats.todoCount >= 50);
        checkUnlock('todo_100', state.stats.todoCount >= 100);
        checkAllRounder();
        checkGenAchievements();
    }
    saveState();
    renderTodos();
    renderAchievements();
}

function deleteTodo(idx) {
    state.todos.splice(idx, 1);
    saveState();
    renderTodos();
    showToast('🗑️ 已删除');
}
