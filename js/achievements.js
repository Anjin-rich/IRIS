// ============================================================
//  成就系统 (与之前相同)
// ============================================================
function buildAchievementLibrary() {
    const lib = [];
    const core = [
        { id: 'first_todo', icon: 'fa-feather', title: '万事开头难', desc: '完成第一个待办！', cheer: '棒！' },
        {
            id: 'sport_once', icon: 'fa-person-running', title: '脂肪的微弱抵抗', desc: '完成一次运动相关任务',
            cheer: '超燃！'
        },
        { id: 'read_once', icon: 'fa-book-open', title: '灵魂瞬间洗涤', desc: '完成一次阅读任务', cheer: '优雅！' },
        { id: 'study_once', icon: 'fa-pencil', title: '脑细胞动了', desc: '完成一次学习任务', cheer: '牛气！' },
        { id: 'todo_3', icon: 'fa-award', title: '三连击小能手', desc: '完成3个待办', cheer: '给力！' },
        { id: 'todo_5', icon: 'fa-award', title: '五谷丰登', desc: '完成5个待办', cheer: '无敌！' },
        { id: 'todo_10', icon: 'fa-trophy', title: '十全大美小能手', desc: '完成10个待办', cheer: '顶流！' },
        { id: 'todo_20', icon: 'fa-trophy', title: '二十不惑', desc: '完成20个待办', cheer: '王者！' },
        { id: 'todo_50', icon: 'fa-crown', title: '五十度强', desc: '完成50个待办', cheer: '传奇！' },
        { id: 'todo_100', icon: 'fa-crown', title: '百战成神', desc: '完成100个待办', cheer: '封神！' },
        { id: 'study_5', icon: 'fa-graduation-cap', title: '知识捕手', desc: '学习5次', cheer: '厉害！' },
        { id: 'study_10', icon: 'fa-graduation-cap', title: '学霸初长成', desc: '学习10次', cheer: '优秀！' },
        { id: 'study_20', icon: 'fa-graduation-cap', title: '学术新星', desc: '学习20次', cheer: '大师！' },
        { id: 'study_50', icon: 'fa-graduation-cap', title: '终身学习者', desc: '学习50次', cheer: '超凡！' },
        { id: 'work_5', icon: 'fa-briefcase', title: '搬砖进阶', desc: '工作5次', cheer: '稳健！' },
        { id: 'work_10', icon: 'fa-briefcase', title: '职场新贵', desc: '工作10次', cheer: '耀眼！' },
        { id: 'work_20', icon: 'fa-briefcase', title: '骨干精英', desc: '工作20次', cheer: '核心！' },
        { id: 'work_50', icon: 'fa-briefcase', title: '业界标杆', desc: '工作50次', cheer: '传奇！' },
        { id: 'sport_5', icon: 'fa-heart-pulse', title: '运动觉醒', desc: '运动5次', cheer: '活力！' },
        { id: 'sport_10', icon: 'fa-heart-pulse', title: '体能进阶', desc: '运动10次', cheer: '强壮！' },
        { id: 'sport_20', icon: 'fa-heart-pulse', title: '运动达人', desc: '运动20次', cheer: '燃爆！' },
        { id: 'read_5', icon: 'fa-book', title: '书虫初现', desc: '读书5次', cheer: '文艺！' },
        { id: 'read_10', icon: 'fa-book', title: '阅读进阶', desc: '读书10次', cheer: '深度！' },
        { id: 'read_20', icon: 'fa-book', title: '思想者', desc: '读书20次', cheer: '睿智！' },
        { id: 'diary_3', icon: 'fa-pen-fancy', title: '日记初体验', desc: '写3篇日记', cheer: '细腻！' },
        { id: 'diary_5', icon: 'fa-pen-fancy', title: '回忆捕手', desc: '写5篇日记', cheer: '真好！' },
        { id: 'diary_10', icon: 'fa-pen-fancy', title: '生活记录家', desc: '写10篇日记', cheer: '深刻！' },
        { id: 'diary_20', icon: 'fa-pen-fancy', title: '灵魂写手', desc: '写20篇日记', cheer: '绝妙！' },
        { id: 'afk_1m', icon: 'fa-wind', title: '一分钟的留白', desc: '静心1分钟', cheer: '宁静！' },
        { id: 'afk_3m', icon: 'fa-wind', title: '三分钟的定力', desc: '静心3分钟', cheer: '从容！' },
        { id: 'afk_5m', icon: 'fa-hourglass-half', title: '五分钟的沉淀', desc: '静心5分钟', cheer: '超凡！' },
        { id: 'afk_10m', icon: 'fa-hourglass-half', title: '十分钟的修行', desc: '静心10分钟', cheer: '神迹！' },
        { id: 'afk_30m', icon: 'fa-moon', title: '半小时的入定', desc: '静心30分钟', cheer: '至高！' },
        { id: 'afk_60m', icon: 'fa-moon', title: '一小时的禅境', desc: '静心60分钟', cheer: '开悟！' },
        { id: 'book_1', icon: 'fa-book-open', title: '藏书家起步', desc: '记录第一本书摘', cheer: '收藏！' },
        { id: 'book_3', icon: 'fa-book-open', title: '书架初具规模', desc: '记录3本书摘', cheer: '充实！' },
        { id: 'book_5', icon: 'fa-book-open', title: '书房小成', desc: '记录5本书摘', cheer: '渊博！' },
        { id: 'book_10', icon: 'fa-books', title: '藏书家', desc: '记录10本书摘', cheer: '丰厚！' },
        { id: 'book_20', icon: 'fa-books', title: '大藏书家', desc: '记录20本书摘', cheer: '浩瀚！' },
        {
            id: 'all_rounder', icon: 'fa-face-laugh-beam', title: '生活体验家', desc: '解锁4个不同维度的成就',
            cheer: '巅峰！'
        },
        {
            id: 'multi_category', icon: 'fa-layer-group', title: '多面手', desc: '在3个不同类目中都完成过任务',
            cheer: '全能！'
        },
        {
            id: 'perfect_day', icon: 'fa-sun', title: '完美一日', desc: '在同一天内完成学习、工作、运动、读书各一次',
            cheer: '圆满！'
        },
        { id: 'pet_1', icon: 'fa-paw', title: '桌宠初遇', desc: '领养第一只桌宠', cheer: '可爱！' },
        { id: 'routine_1', icon: 'fa-link', title: '仪式大师', desc: '完成一条成长仪式', cheer: '优雅！' },
    ];
    core.forEach(c => lib.push(c));
    const categories = [
        { key: 'study', label: '学习', icon: 'fa-graduation-cap', statKey: 'studyCount' },
        { key: 'work', label: '工作', icon: 'fa-briefcase', statKey: 'workCount' },
        { key: 'sport', label: '运动', icon: 'fa-heart-pulse', statKey: 'sportCount' },
        { key: 'read', label: '读书', icon: 'fa-book', statKey: 'readCount' },
        { key: 'todo', label: '挑战', icon: 'fa-list-check', statKey: 'todoCount' },
        { key: 'diary', label: '日记', icon: 'fa-pen-fancy', statKey: 'diaryCount' },
        { key: 'afk', label: '静心', icon: 'fa-wind', statKey: 'afkCount' },
        { key: 'book', label: '藏书', icon: 'fa-books', statKey: 'bookCount' },
    ];
    const milestones = [1, 3, 5, 10, 20, 50, 100];
    const cheerMap = { 1: '起步！', 3: '进阶！', 5: '不错！', 10: '优秀！', 20: '厉害！', 50: '卓越！', 100: '传奇！' };
    categories.forEach(cat => {
        milestones.forEach(m => {
            if (lib.some(l => l.id === `${cat.key}_${m}`)) return;
            if (cat.key === 'afk' && m > 60) return;
            if (cat.key === 'book' && m > 20) return;
            if (cat.key === 'diary' && m > 20) return;
            if (cat.key === 'todo' && m > 100) return;
            if (cat.key === 'study' && m > 50) return;
            if (cat.key === 'work' && m > 50) return;
            if (cat.key === 'sport' && m > 20) return;
            if (cat.key === 'read' && m > 20) return;
            let title = '',
                desc = '';
            if (cat.key === 'afk') {
                title = `${m}分钟静心`;
                desc = `累计静心${m}分钟`;
            } else if (cat.key === 'book') {
                title = `藏书${m}册`;
                desc = `记录${m}本书摘`;
            } else if (cat.key === 'diary') {
                title = `日记${m}篇`;
                desc = `写下${m}篇日记`;
            } else if (cat.key === 'todo') {
                title = `挑战${m}次`;
                desc = `完成${m}个待办`;
            } else {
                title = `${cat.label}${m}次`;
                desc = `${cat.label}打卡${m}次`;
            }
            lib.push({
                id: `${cat.key}_${m}`, icon: cat.icon, title, desc, cheer: cheerMap[m] ||
                    '太棒了！'
            });
        });
    });
    let idx = lib.length + 1;
    while (lib.length < 100) {
        lib.push({
            id: `gen_${idx}`, icon: 'fa-star', title: `成就 #${idx}`, desc: '继续前行，你正在创造属于自己的传奇。',
            cheer: '加油！'
        });
        idx++;
    }
    return lib;
}
const achievementLibrary = buildAchievementLibrary();

function renderAchievements() {
    const container = document.getElementById('steamAchieveList');
    let unlockedCount = 0;
    const html = achievementLibrary.map(ach => {
        const isUnlocked = !!state.unlockedAchievements[ach.id];
        if (isUnlocked) unlockedCount++;
        const timeStr = state.unlockedAchievements[ach.id] || '';
        return `
            <div class="steam-row ${isUnlocked ? 'unlocked' : ''}">
                <div class="steam-icon-frame"><i class="fa-solid ${ach.icon}"></i></div>
                <div class="steam-info">
                    <div class="steam-title-line">
                        <span class="steam-title">${escapeHtml(ach.title)}</span>
                        ${isUnlocked ? `<span class="steam-cheer">${ach.cheer}</span>` : ''}
                    </div>
                    <div class="steam-desc">${escapeHtml(ach.desc)}</div>
                    ${isUnlocked ? `<span class="steam-time-stamp"><i class="fa-regular fa-clock"></i> ${timeStr}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
    container.innerHTML = html;
    const total = achievementLibrary.length;
    const pct = Math.round((unlockedCount / total) * 100);
    document.getElementById('achieveProgress').style.width = pct + '%';
    document.getElementById('achieveCount').textContent = `${unlockedCount}/${total} (${pct}%)`;
}

function spawnAchieveConfetti() {
    const container = document.getElementById('particleContainer');
    const colors = ['#9c8eb9', '#e8b84b', '#d4a830', '#e6dccf', '#FFD93D', '#c5a9e0'];
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        const isConfetti = Math.random() > 0.4;
        p.className = 'particle' + (isConfetti ? ' confetti' : '');
        const x = 10 + Math.random() * 80;
        const y = 20 + Math.random() * 60;
        p.style.left = x + '%';
        p.style.top = y + '%';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.width = (4 + Math.random() * 8) + 'px';
        p.style.height = p.style.width;
        p.style.animationDuration = (1.2 + Math.random() * 1.2) + 's';
        p.style.animationDelay = (Math.random() * 0.4) + 's';
        p.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(p);
        setTimeout(() => p.remove(), 2500);
    }
}

let achievePopupQueue = [];
let achievePopupShowing = false;

function playAchieveSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            const t = ctx.currentTime + i * 0.12;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            osc.start(t);
            osc.stop(t + 0.35);
        });
    } catch (e) { }
}

function showAchievePopup(ach) {
    achievePopupQueue.push(ach);
    if (!achievePopupShowing) processAchieveQueue();
}

function processAchieveQueue() {
    if (achievePopupQueue.length === 0) { achievePopupShowing = false; return; }
    achievePopupShowing = true;
    const ach = achievePopupQueue.shift();
    const iconMap = {
        'fa-feather': '🪶',
        'fa-person-running': '🏃',
        'fa-book-open': '📖',
        'fa-pencil': '✏️',
        'fa-award': '🏅',
        'fa-trophy': '🏆',
        'fa-crown': '👑',
        'fa-graduation-cap': '🎓',
        'fa-briefcase': '💼',
        'fa-heart-pulse': '❤️',
        'fa-book': '📚',
        'fa-pen-fancy': '🖊️',
        'fa-wind': '🌬️',
        'fa-hourglass-half': '⏳',
        'fa-moon': '🌙',
        'fa-books': '📚',
        'fa-face-laugh-beam': '😄',
        'fa-layer-group': '🗂️',
        'fa-sun': '☀️',
        'fa-paw': '🐾',
        'fa-star': '⭐',
        'fa-link': '🔗'
    };
    const emoji = iconMap[ach.icon] || '🏆';
    document.getElementById('achievePopupIcon').textContent = emoji;
    document.getElementById('achievePopupTitle').textContent = ach.title;
    document.getElementById('achievePopupDesc').textContent = ach.desc;
    const overlay = document.getElementById('achievePopupOverlay');
    overlay.classList.add('show');
    spawnAchieveConfetti();
    if (state.settings && state.settings.sound !== false) playAchieveSound();
    triggerVibrate();
}

function closeAchievePopup() {
    const overlay = document.getElementById('achievePopupOverlay');
    overlay.classList.remove('show');
    setTimeout(() => {
        if (achievePopupQueue.length > 0) processAchieveQueue();
        else achievePopupShowing = false;
    }, 400);
}

function checkUnlock(id, condition) {
    if (condition && !state.unlockedAchievements[id]) {
        state.unlockedAchievements[id] = new Date().toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit', hour: '2-digit', minute: '2-digit'
        });
        addEnergy(20);
        saveState();
        const ach = achievementLibrary.find(a => a.id === id);
        if (ach) {
            setTimeout(() => showAchievePopup(ach), 300);
        }
        if (achievementLibrary.every(a => !!state.unlockedAchievements[a.id])) {
            setTimeout(() => showToast('🎉 恭喜你解锁了所有成就！你是真正的传奇！'), 2000);
        }
    }
}

function checkAllRounder() {
    const keys = Object.keys(state.unlockedAchievements);
    const count = keys.filter(k => k !== 'all_rounder' && k !== 'multi_category' && k !== 'perfect_day' &&
        k !== 'renaissance' && !k.startsWith('gen_')).length;
    if (count >= 4) checkUnlock('all_rounder', true);
    if (count >= 6) checkUnlock('renaissance', true);
}

function checkGenAchievements() {
    const unlockedKeys = Object.keys(state.unlockedAchievements);
    const totalUnlocked = unlockedKeys.length;
    for (let i = 66; i <= 100; i++) {
        const id = `gen_${i}`;
        const threshold = 30 + (i - 66);
        if (!state.unlockedAchievements[id] && totalUnlocked >= threshold) checkUnlock(id, true);
    }
    if (totalUnlocked >= 99) checkUnlock('gen_100', true);
}
