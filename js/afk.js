// ============================================================
//  专注 (沉淀) (已修复计时器问题)
// ============================================================
let afkTargetSeconds = 0;
let isAfkEnding = false;

function setAfkPreset(minutes, btn) {
    document.querySelectorAll('.afk-preset-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const customInput = document.getElementById('afkCustomMinutes');
    if (minutes === 'custom') {
        customInput.style.display = 'inline-block';
        customInput.focus();
        state.afkPresetMinutes = parseInt(customInput.value) || 30;
    } else {
        customInput.style.display = 'none';
        state.afkPresetMinutes = minutes;
    }
    if (state.afkPresetMinutes && !isNaN(state.afkPresetMinutes)) {
        const totalSecs = state.afkPresetMinutes * 60;
        document.getElementById('afkTimer').textContent = formatAfkTimerHMS(totalSecs);
    }
}

document.getElementById('afkCustomMinutes')?.addEventListener('change', function () {
    const val = parseInt(this.value);
    if (val > 0) {
        state.afkPresetMinutes = val;
        const totalSecs = val * 60;
        document.getElementById('afkTimer').textContent = formatAfkTimerHMS(totalSecs);
    }
});

function formatAfkTimerHMS(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startAfk() {
    if (state.currentAfk && !state.currentAfk.isPaused) { showToast('⏳ 静心正在进行中'); return; }
    if (state.currentAfk && state.currentAfk.isPaused) {
        const now = Date.now();
        state.currentAfk.isPaused = false;
        state.currentAfk.totalPaused += (now - state.currentAfk.pausedAt);
        state.currentAfk.pausedAt = null;
        saveState();
        startAfkTimer();
        updateAfkUI();
        showToast('▶️ 静心继续');
        return;
    }
    const preset = state.afkPresetMinutes || 25;
    afkTargetSeconds = preset * 60;
    state.currentAfk = { startTime: Date.now(), pausedAt: null, totalPaused: 0, isPaused: false };
    state.afkTimerSeconds = 0;
    saveState();
    startAfkTimer();
    updateAfkUI();
    showToast(`🧘 开始静心 ${preset} 分钟`);
}

function pauseAfk() {
    if (!state.currentAfk || state.currentAfk.isPaused) return;
    state.currentAfk.isPaused = true;
    state.currentAfk.pausedAt = Date.now();
    clearInterval(afkInterval);
    afkInterval = null;
    saveState();
    updateAfkUI();
    showToast('⏸️ 静心已暂停');
}

function endAfk() {
    if (!state.currentAfk || isAfkEnding) return;
    isAfkEnding = true;

    const now = Date.now();
    let totalMs = now - state.currentAfk.startTime - (state.currentAfk.totalPaused || 0);
    if (state.currentAfk.isPaused && state.currentAfk.pausedAt) totalMs -= (now - state.currentAfk
        .pausedAt);
    const seconds = Math.floor(totalMs / 1000);
    if (seconds < 1) {
        showToast('⏳ 至少静心1秒才能记录');
        isAfkEnding = false; return;
    }

    const reached = seconds >= afkTargetSeconds && afkTargetSeconds > 0;

    if (reached) {
        try {
            if (navigator.vibrate) navigator.vibrate(200);
        } catch (e) { }
        alert('🧘 静心时间到！你已完成预定时间。');

        const session = {
            duration: seconds, date: new Date().toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit', hour: '2-digit', minute: '2-digit'
            }), timestamp: new Date()
                .toISOString()
        };
        state.afkSessions.unshift(session);
        state.stats.afkCount += seconds;
        state.totalMeditationSecs = (state.totalMeditationSecs || 0) + seconds;
        const totalSecs = state.afkSessions.reduce((sum, s) => sum + s.duration, 0);
        checkUnlock('afk_1m', totalSecs >= 60);
        checkUnlock('afk_3m', totalSecs >= 180);
        checkUnlock('afk_5m', totalSecs >= 300);
        checkUnlock('afk_10m', totalSecs >= 600);
        checkUnlock('afk_30m', totalSecs >= 1800);
        checkUnlock('afk_60m', totalSecs >= 3600);
        checkAllRounder();

        clearInterval(afkInterval);
        afkInterval = null;
        state.currentAfk = null;
        state.afkTimerSeconds = 0;
        document.getElementById('afkTimer').textContent = '00:00:00';
        document.getElementById('meditationCircle').classList.remove('breathing');
        saveState();
        renderAchievements();
        updateAfkUI();
        showToast(`✅ 静心结束，沉淀了 ${formatDuration(seconds)}`);
    } else {
        const hours = Math.floor(seconds / 3600);
        if (hours > 0) {
            const expBonus = hours * 5;
            addEnergy(expBonus);
            showToast(`🧘 静心${hours}小时，获得 ${expBonus} 能量`);
        }
        const session = {
            duration: seconds, date: new Date().toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit', hour: '2-digit', minute: '2-digit'
            }), timestamp: new Date()
                .toISOString()
        };
        state.afkSessions.unshift(session);
        state.stats.afkCount += seconds;
        state.totalMeditationSecs = (state.totalMeditationSecs || 0) + seconds;
        const totalSecs = state.afkSessions.reduce((sum, s) => sum + s.duration, 0);
        checkUnlock('afk_1m', totalSecs >= 60);
        checkUnlock('afk_3m', totalSecs >= 180);
        checkUnlock('afk_5m', totalSecs >= 300);
        checkUnlock('afk_10m', totalSecs >= 600);
        checkUnlock('afk_30m', totalSecs >= 1800);
        checkUnlock('afk_60m', totalSecs >= 3600);
        checkAllRounder();

        clearInterval(afkInterval);
        afkInterval = null;
        state.currentAfk = null;
        state.afkTimerSeconds = 0;
        document.getElementById('afkTimer').textContent = '00:00:00';
        document.getElementById('meditationCircle').classList.remove('breathing');
        saveState();
        renderAchievements();
        updateAfkUI();
        showToast(`✅ 静心结束，沉淀了 ${formatDuration(seconds)}`);
    }
    isAfkEnding = false;
}

function startAfkTimer() {
    if (afkInterval) clearInterval(afkInterval);
    afkInterval = setInterval(() => {
        if (!state.currentAfk || state.currentAfk.isPaused) return;
        const now = Date.now();
        let ms = now - state.currentAfk.startTime - (state.currentAfk.totalPaused || 0);
        if (state.currentAfk.isPaused && state.currentAfk.pausedAt) ms -= (now - state.currentAfk
            .pausedAt);
        const secs = Math.floor(ms / 1000);
        state.afkTimerSeconds = secs;
        document.getElementById('afkTimer').textContent = formatAfkTimerHMS(secs);
        document.getElementById('meditationCircle').classList.add('breathing');
        if (afkTargetSeconds > 0 && secs >= afkTargetSeconds) {
            endAfk();
        }
    }, 200);
}

function formatDuration(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0'); return `${m}:${s}`;
}

function updateTotalMeditationDisplay() {
    const total = state.totalMeditationSecs || 0;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const el = document.getElementById('totalMeditationDisplay');
    if (el) el.textContent = `⏱累计沉淀 ${h}h ${m}m`;
}

function updateAfkUI() {
    const startBtn = document.getElementById('afkStartBtn'),
        pauseBtn = document.getElementById('afkPauseBtn'),
        endBtn = document.getElementById('afkEndBtn');
    if (state.currentAfk) {
        if (state.currentAfk.isPaused) {
            startBtn.innerHTML = '<i class="fa-regular fa-circle-play"></i> 继续';
            startBtn.className = 'btn-primary';
            pauseBtn.disabled = true;
            pauseBtn.innerHTML = '<i class="fa-regular fa-circle-pause"></i> 暂停';
        } else {
            startBtn.innerHTML = '<i class="fa-regular fa-circle-play"></i> 进行中…';
            startBtn.className = 'btn-primary active';
            pauseBtn.disabled = false;
            pauseBtn.innerHTML = '<i class="fa-regular fa-circle-pause"></i> 暂停';
        }
        endBtn.disabled = false;
    } else {
        startBtn.innerHTML = '<i class="fa-regular fa-circle-play"></i> 开始静心';
        startBtn.className = 'btn-primary';
        pauseBtn.disabled = true;
        pauseBtn.innerHTML = '<i class="fa-regular fa-circle-pause"></i> 暂停';
        endBtn.disabled = true;
        document.getElementById('meditationCircle').classList.remove('breathing');
    }
    updateTotalMeditationDisplay();
}
