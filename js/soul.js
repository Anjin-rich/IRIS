/* ===== 心灵卡牌交互 =====
   - 3D 环绕轨道动画 (灵感 Tab)
   - 三个 Sub-Tab 切换 (灵感/聆听/心流)
   - 抽牌交互 (灵感) - 36张神谕牌随机抽取
*/

(function () {
    // 7张卡牌的彩虹色图标 (低饱和度)
    var ICONS = [
        { c: 'rgba(220,120,120,0.7)', d: 'M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z' },
        { c: 'rgba(225,165,95,0.7)', d: 'M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z' },
        { c: 'rgba(225,210,100,0.7)', d: 'M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z' },
        { c: 'rgba(105,190,135,0.7)', d: 'M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z' },
        { c: 'rgba(105,150,220,0.7)', d: 'M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z' },
        { c: 'rgba(135,115,195,0.7)', d: 'M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z' },
        { c: 'rgba(185,115,205,0.7)', d: 'M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z' }
    ];

    var DEFAULTS = { count: 7, tilt: 0, radius: 110, perspective: 450, speed: 24 };

    // ===== 36张神谕牌数据 =====
    var ORACLE_CARDS = [
        // 破晓 DAWN
        { id: 1, theme: 'dawn', num: 'Ⅰ', name_zh: '· 初光 ·', name_en: 'FIRST LIGHT', meaning: '最难的从来不是走，\n而是迈出第一步前的那一秒。', action: '做一件拖了三天的小事', icon: '<circle cx="20" cy="22" r="8" stroke="#e89866" stroke-width="1.5"/><path d="M20 8 L20 12 M8 22 L12 22 M28 22 L32 22 M11 13 L14 16 M26 13 L23 16" stroke="#e89866" stroke-width="1.5" stroke-linecap="round"/>' },
        { id: 2, theme: 'dawn', num: 'Ⅱ', name_zh: '· 启程 ·', name_en: 'DEPARTURE', meaning: '你不必等风停，\n带着风走就是了。', action: '列一件"等条件成熟"的事，今天就起个头', icon: '<path d="M20 28 L20 12 M14 18 L20 12 L26 18" stroke="#e89866" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="30" r="2" fill="#e89866"/>' },
        { id: 3, theme: 'dawn', num: 'Ⅲ', name_zh: '· 破壳 ·', name_en: 'HATCHING', meaning: '你正在长成更大的自己，\n旧的壳自然会裂开。', action: '写下一件你"已经不一样"的事', icon: '<path d="M20 10 Q24 10, 24 14 Q28 14, 28 18 Q28 22, 24 22 L16 22 Q12 22, 12 18 Q12 14, 16 14 Q16 10, 20 10 Z" stroke="#e89866" stroke-width="1.5"/><path d="M20 22 L20 30" stroke="#e89866" stroke-width="1.5"/>' },
        { id: 4, theme: 'dawn', num: 'Ⅳ', name_zh: '· 唤醒 ·', name_en: 'AWAKENING', meaning: '你心里有一盏灯，\n只是忘了点亮它。', action: '回忆一件让你眼睛发亮的事', icon: '<path d="M8 30 Q14 22, 20 22 Q26 22, 32 30" stroke="#e89866" stroke-width="1.5"/><circle cx="20" cy="16" r="4" fill="rgba(232,152,102,0.3)" stroke="#e89866" stroke-width="1.5"/>' },
        { id: 5, theme: 'dawn', num: 'Ⅴ', name_zh: '· 攀登 ·', name_en: 'ASCENT', meaning: '山不会因为你喘气就变矮，\n但你每一步都在变高。', action: '为一项长期目标做 10 分钟', icon: '<path d="M12 24 L20 12 L28 24" stroke="#e89866" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 24 L28 24" stroke="#e89866" stroke-width="1.5"/><circle cx="20" cy="18" r="1.5" fill="#e89866"/>' },
        { id: 6, theme: 'dawn', num: 'Ⅵ', name_zh: '· 前路 ·', name_en: 'PATH AHEAD', meaning: '路是走出来的，\n不是看清的。', action: '走一条没走过的回家路', icon: '<path d="M8 20 L32 20 M22 10 L32 20 L22 30" stroke="#e89866" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' },
        { id: 7, theme: 'dawn', num: 'Ⅶ', name_zh: '· 仰望 ·', name_en: 'LOOK UP', meaning: '你低着头太久，\n该看看天了。', action: '出门抬头看一次云', icon: '<path d="M10 20 Q10 10, 20 10 Q30 10, 30 20" stroke="#e89866" stroke-width="1.5"/><path d="M14 20 L20 14 L26 20" stroke="#e89866" stroke-width="1.5" stroke-linecap="round"/>' },
        { id: 8, theme: 'dawn', num: 'Ⅷ', name_zh: '· 跃迁 ·', name_en: 'LEAP', meaning: '有些变化不是渐进的，\n是一瞬间的决定。', action: '做一个想了很久的小决定', icon: '<path d="M14 14 L26 26 M26 14 L14 26" stroke="#e89866" stroke-width="1.5" stroke-linecap="round"/><circle cx="20" cy="20" r="10" stroke="#e89866" stroke-width="1" stroke-dasharray="2 3"/>' },
        { id: 9, theme: 'dawn', num: 'Ⅸ', name_zh: '· 初心 ·', name_en: 'BEGINNER', meaning: '你曾经为什么开始？\n那个答案还在。', action: '翻出一件"最初的物品"看看', icon: '<path d="M20 8 L23 16 L31 16 L25 21 L27 29 L20 24 L13 29 L15 21 L9 16 L17 16 Z" stroke="#e89866" stroke-width="1.5" stroke-linejoin="round"/>' },
        // 盛光 LIGHT
        { id: 10, theme: 'light', num: 'Ⅹ', name_zh: '· 盛光 ·', name_en: 'FULL LIGHT', meaning: '此刻你是亮的，\n别藏起来。', action: '分享一件你擅长的小事', icon: '<circle cx="20" cy="20" r="6" fill="rgba(232,201,106,0.4)" stroke="#c9a83a" stroke-width="1.5"/><path d="M20 6 L20 10 M20 30 L20 34 M6 20 L10 20 M30 20 L34 20 M10 10 L13 13 M27 27 L30 30 M30 10 L27 13 M10 30 L13 27" stroke="#c9a83a" stroke-width="1.5" stroke-linecap="round"/>' },
        { id: 11, theme: 'light', num: 'Ⅺ', name_zh: '· 聚焦 ·', name_en: 'FOCUS', meaning: '把所有光收成一束，\n才能点燃什么。', action: '25 分钟只做一件事', icon: '<circle cx="20" cy="20" r="12" stroke="#c9a83a" stroke-width="1.5"/><circle cx="20" cy="20" r="4" fill="#c9a83a"/>' },
        { id: 12, theme: 'light', num: 'Ⅻ', name_zh: '· 锚点 ·', name_en: 'ANCHOR', meaning: '世界在晃，\n你需要一个不动的东西。', action: '写下今天不会变的三件事', icon: '<path d="M20 8 L32 20 L20 32 L8 20 Z" stroke="#c9a83a" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 20 L26 20 M20 14 L20 26" stroke="#c9a83a" stroke-width="1.5"/>' },
        { id: 13, theme: 'light', num: 'ⅩⅢ', name_zh: '· 落定 ·', name_en: 'SETTLED', meaning: '悬着的事，\n今天可以放下了。', action: '完成一件悬而未决的事', icon: '<path d="M8 20 L16 28 L32 12" stroke="#c9a83a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
        { id: 14, theme: 'light', num: 'ⅩⅣ', name_zh: '· 建造 ·', name_en: 'BUILD', meaning: '一砖一瓦不浪漫，\n但墙是一砖一瓦砌起来的。', action: '为一个目标添一块"砖"', icon: '<path d="M10 30 L10 14 L20 8 L30 14 L30 30" stroke="#c9a83a" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 30 L16 22 L24 22 L24 30" stroke="#c9a83a" stroke-width="1.5"/>' },
        { id: 15, theme: 'light', num: 'ⅩⅤ', name_zh: '· 清朗 ·', name_en: 'CLARITY', meaning: '雾散了，\n你看得比昨天远。', action: '写下一个突然想明白的事', icon: '<path d="M20 6 L20 34 M6 20 L34 20" stroke="#c9a83a" stroke-width="1.5"/><circle cx="20" cy="20" r="10" stroke="#c9a83a" stroke-width="1" stroke-dasharray="3 2"/>' },
        { id: 16, theme: 'light', num: 'ⅩⅥ', name_zh: '· 显化 ·', name_en: 'MANIFEST', meaning: '你想了很久的东西，\n正在路上。', action: '为想要的事做一件准备', icon: '<circle cx="20" cy="20" r="12" stroke="#c9a83a" stroke-width="1.5"/><path d="M20 8 A12 12 0 0 1 32 20 L20 20 Z" fill="rgba(232,201,106,0.4)"/>' },
        { id: 17, theme: 'light', num: 'ⅩⅦ', name_zh: '· 绽放 ·', name_en: 'BLOOM', meaning: '你准备很久了，\n现在可以开了。', action: '发布/展示一件你的作品', icon: '<path d="M20 6 L24 16 L34 16 L26 22 L29 32 L20 26 L11 32 L14 22 L6 16 L16 16 Z" stroke="#c9a83a" stroke-width="1.5" stroke-linejoin="round" fill="rgba(232,201,106,0.2)"/>' },
        { id: 18, theme: 'light', num: 'ⅩⅧ', name_zh: '· 硕果 ·', name_en: 'HARVEST', meaning: '你忘了自己种过什么，\n今天会收到答案。', action: '感谢一件过去的努力', icon: '<path d="M8 32 L8 24 M16 32 L16 18 M24 32 L24 12 M32 32 L32 20" stroke="#c9a83a" stroke-width="2" stroke-linecap="round"/>' },
        // 暮影 DUSK
        { id: 19, theme: 'dusk', num: 'ⅩⅨ', name_zh: '· 落羽 ·', name_en: 'FALLING', meaning: '有些东西正在离开，\n让它走。', action: '清理一件不再需要的物品', icon: '<path d="M8 28 Q14 20, 20 20 Q26 20, 32 28" stroke="#9c6e9a" stroke-width="1.5"/><path d="M14 24 L12 32 M20 22 L20 32 M26 24 L28 32" stroke="#9c6e9a" stroke-width="1.5" stroke-linecap="round"/>' },
        { id: 20, theme: 'dusk', num: 'ⅩⅩ', name_zh: '· 沉淀 ·', name_en: 'SETTLE', meaning: '搅动的水需要时间变清，\n你也一样。', action: '安静坐 5 分钟，什么都不做', icon: '<path d="M20 8 Q28 8, 28 16 Q28 24, 20 28 Q12 24, 12 16 Q12 8, 20 8 Z" stroke="#9c6e9a" stroke-width="1.5"/><path d="M20 28 L20 34" stroke="#9c6e9a" stroke-width="1.5"/>' },
        { id: 21, theme: 'dusk', num: 'ⅩⅪ', name_zh: '· 释放 ·', name_en: 'RELEASE', meaning: '你攥得太紧，\n手心才会疼。', action: '写下一件想放下的事，撕掉', icon: '<path d="M20 6 L20 22 M14 12 L20 6 L26 12" stroke="#9c6e9a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 30 L30 30" stroke="#9c6e9a" stroke-width="1.5"/><path d="M12 30 Q12 24, 20 24 Q28 24, 28 30" stroke="#9c6e9a" stroke-width="1.5"/>' },
        { id: 22, theme: 'dusk', num: 'ⅩⅫ', name_zh: '· 流转 ·', name_en: 'FLOW', meaning: '没有什么是停着的，\n包括你以为的停滞。', action: '观察一件正在变化的事', icon: '<path d="M10 14 L20 24 L30 14" stroke="#9c6e9a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 24 L20 34 L30 24" stroke="#9c6e9a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' },
        { id: 23, theme: 'dusk', num: 'ⅩⅩⅢ', name_zh: '· 蜕变 ·', name_en: 'SHED', meaning: '旧的自己不走，\n新的进不来。', action: '改掉一个小习惯一天', icon: '<circle cx="20" cy="20" r="6" fill="rgba(156,110,154,0.3)" stroke="#9c6e9a" stroke-width="1.5"/><path d="M14 14 L26 26 M26 14 L14 26" stroke="#9c6e9a" stroke-width="1" stroke-dasharray="2 2"/>' },
        { id: 24, theme: 'dusk', num: 'ⅩⅩⅣ', name_zh: '· 归途 ·', name_en: 'RETURN', meaning: '走远了才懂，\n回来也是前进。', action: '联系一个"老地方"的人', icon: '<path d="M12 20 L20 28 L28 20" stroke="#9c6e9a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12 L20 20 L28 12" stroke="#9c6e9a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' },
        { id: 25, theme: 'dusk', num: 'ⅩⅩⅤ', name_zh: '· 留白 ·', name_en: 'PAUSE', meaning: '不是每件事都要填满，\n空着也是一种完成。', action: '取消一件今天不必做的事', icon: '<path d="M8 12 L32 12 M8 20 L32 20 M8 28 L20 28" stroke="#9c6e9a" stroke-width="1.5" stroke-linecap="round"/><circle cx="28" cy="28" r="3" fill="rgba(156,110,154,0.3)" stroke="#9c6e9a" stroke-width="1.5"/>' },
        { id: 26, theme: 'dusk', num: 'ⅩⅩⅥ', name_zh: '· 柔光 ·', name_en: 'SOFT GLOW', meaning: '你不必时刻耀眼，\n微光也是光。', action: '允许自己今天"差不多就行"', icon: '<path d="M20 10 L28 18 L20 26 L12 18 Z" stroke="#9c6e9a" stroke-width="1.5" stroke-linejoin="round"/><path d="M20 26 L20 32" stroke="#9c6e9a" stroke-width="1.5"/>' },
        { id: 27, theme: 'dusk', num: 'ⅩⅩⅦ', name_zh: '· 退潮 ·', name_en: 'EBB', meaning: '能量有涨有落，\n退潮时不必硬撑。', action: '今天比平时早睡半小时', icon: '<path d="M6 20 Q12 14, 20 14 Q28 14, 34 20" stroke="#9c6e9a" stroke-width="1.5"/><path d="M6 26 Q12 20, 20 20 Q28 20, 34 26" stroke="#9c6e9a" stroke-width="1.5"/>' },
        // 深眠 NIGHT
        { id: 28, theme: 'night', num: 'ⅩⅩⅧ', name_zh: '· 月相 ·', name_en: 'MOON', meaning: '有些答案不在白天，\n等月亮升起再说。', action: '睡前记录一个念头', icon: '<path d="M24 8 Q14 12, 14 22 Q14 30, 22 32 Q14 30, 12 22 Q12 12, 24 8 Z" stroke="#6a5a9a" stroke-width="1.5" stroke-linejoin="round"/><circle cx="28" cy="14" r="1.5" fill="#6a5a9a"/><circle cx="30" cy="20" r="1" fill="#6a5a9a"/>' },
        { id: 29, theme: 'night', num: 'ⅩⅩⅨ', name_zh: '· 入梦 ·', name_en: 'DREAM', meaning: '梦里出现的，\n是你白天不敢想的。', action: '醒来记下梦的一个画面', icon: '<path d="M20 6 L23 14 L31 14 L25 19 L27 27 L20 22 L13 27 L15 19 L9 14 L17 14 Z" stroke="#6a5a9a" stroke-width="1" stroke-linejoin="round"/><circle cx="20" cy="18" r="2" fill="#6a5a9a"/>' },
        { id: 30, theme: 'night', num: 'ⅩⅩⅩ', name_zh: '· 滋养 ·', name_en: 'NURTURE', meaning: '你给出去太多，\n该往回灌一点了。', action: '做一件只为自己的事', icon: '<path d="M8 20 Q8 12, 16 12 Q20 12, 20 16 Q20 12, 24 12 Q32 12, 32 20 Q32 28, 20 32 Q8 28, 8 20 Z" stroke="#6a5a9a" stroke-width="1.5" stroke-linejoin="round"/>' },
        { id: 31, theme: 'night', num: 'ⅩⅩⅪ', name_zh: '· 潜流 ·', name_en: 'UNDERCURRENT', meaning: '表面平静下面，\n有东西在动。', action: '写下"我其实有点…"的句子', icon: '<circle cx="20" cy="20" r="12" stroke="#6a5a9a" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="20" cy="20" r="4" fill="rgba(106,90,154,0.3)"/>' },
        { id: 32, theme: 'night', num: 'ⅩⅩⅫ', name_zh: '· 直觉 ·', name_en: 'INTUITION', meaning: '你早就知道答案，\n只是不敢信。', action: '跟着第一个念头做一个决定', icon: '<circle cx="20" cy="20" r="10" stroke="#6a5a9a" stroke-width="1.5"/><path d="M14 20 Q17 16, 20 20 Q23 24, 26 20" stroke="#6a5a9a" stroke-width="1.5" stroke-linecap="round"/>' },
        { id: 33, theme: 'night', num: 'ⅩⅩⅩⅢ', name_zh: '· 独白 ·', name_en: 'SOLILOQUY', meaning: '你需要一次没有观众的说话，\n哪怕只是对自己。', action: '写一段不给任何人看的话', icon: '<rect x="10" y="10" width="20" height="20" rx="2" stroke="#6a5a9a" stroke-width="1.5"/><path d="M14 16 L26 16 M14 20 L26 20 M14 24 L22 24" stroke="#6a5a9a" stroke-width="1.5" stroke-linecap="round"/>' },
        { id: 34, theme: 'night', num: 'ⅩⅩⅩⅣ', name_zh: '· 深潜 ·', name_en: 'DIVE DEEP', meaning: '浅处看不到的，\n沉下去才有。', action: '追问自己三次"为什么"', icon: '<path d="M20 6 L20 30 M14 12 L20 6 L26 12" stroke="#6a5a9a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 34 L30 34" stroke="#6a5a9a" stroke-width="1.5"/>' },
        { id: 35, theme: 'night', num: 'ⅩⅩⅩⅤ', name_zh: '· 守夜 ·', name_en: 'VIGIL', meaning: '有些事需要你醒着等，\n不是睡着忘。', action: '陪一个不舒服的感受待一会儿', icon: '<path d="M12 20 Q12 12, 20 12 Q28 12, 28 20 Q28 28, 20 28" stroke="#6a5a9a" stroke-width="1.5"/><circle cx="20" cy="20" r="3" fill="#6a5a9a"/>' },
        { id: 36, theme: 'night', num: 'ⅩⅩⅩⅥ', name_zh: '· 闭环 ·', name_en: 'CLOSURE', meaning: '一圈走完了，\n明天是新的圆心。', action: '为今天画一个句号', icon: '<circle cx="20" cy="20" r="14" stroke="#6a5a9a" stroke-width="1.5"/><circle cx="20" cy="20" r="8" stroke="#6a5a9a" stroke-width="1" stroke-dasharray="2 3"/><circle cx="20" cy="20" r="2" fill="#6a5a9a"/>' }
    ];

    // 主题色映射
    var THEME_COLORS = {
        dawn: { bg: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,248,242,0.9) 30%, rgba(245,184,138,0.15) 70%, rgba(232,152,102,0.2) 100%)', text: '#8a6a5a' },
        light: { bg: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,253,245,0.9) 30%, rgba(245,217,142,0.15) 70%, rgba(232,201,106,0.2) 100%)', text: '#6b5a2e' },
        dusk: { bg: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(253,248,252,0.9) 30%, rgba(200,144,176,0.15) 70%, rgba(156,110,154,0.2) 100%)', text: '#7a5a7a' },
        night: { bg: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,245,255,0.9) 30%, rgba(106,90,154,0.15) 70%, rgba(74,61,108,0.2) 100%)', text: '#5a4a7a' }
    };

    // 初始化 3D 轨道动画
    function initOrbit() {
        document.querySelectorAll('[data-orbit]').forEach(function (stage) {
            if (stage.dataset.inited === '1') return;
            stage.dataset.inited = '1';

            var p = (stage.getAttribute('data-orbit') || '').split(',').map(Number);
            var count = p[0] || DEFAULTS.count;
            var tilt = p[1] != null ? p[1] : DEFAULTS.tilt;
            var radius = p[2] || DEFAULTS.radius;
            var persp = p[3] || DEFAULTS.perspective;
            var speed = p[4] || DEFAULTS.speed;

            stage.style.perspective = persp + 'px';
            stage.style.overflow = 'visible';

            var ring = stage.querySelector('.orbit-ring');
            if (!ring) return;

            ring.innerHTML = '';

            var cards = [];
            var step = 360 / count;
            var baseAngle = 0;
            var lastTime = null;
            var rafId = null;
            var stageVisible = true;

            for (var i = 0; i < count; i++) {
                var el = document.createElement('div');
                el.className = 'orbit-card';
                var ic = ICONS[i % ICONS.length];
                el.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="' + ic.c + '" stroke-width="1.5"><path d="' + ic.d + '"/></svg>';
                ring.appendChild(el);
                cards.push(el);
            }

            function layout() {
                ring.style.transform = 'rotateX(' + tilt + 'deg)';
                cards.forEach(function (el, i) {
                    var angle = baseAngle + i * step;
                    el.style.transform = 'rotateY(' + angle + 'deg) translateZ(' + radius + 'px)';
                    var depth = (Math.cos(angle * Math.PI / 180) + 1) / 2;
                    el.style.opacity = String(0.35 + depth * 0.65);
                });
            }

            function tick(t) {
                if (!stageVisible) {
                    rafId = null;
                    return;
                }
                if (lastTime === null) lastTime = t;
                var dt = (t - lastTime) / 1000;
                lastTime = t;
                baseAngle += speed * dt;
                layout();
                rafId = requestAnimationFrame(tick);
            }

            if ('IntersectionObserver' in window) {
                var io = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        stageVisible = entry.isIntersecting;
                        if (stageVisible && !rafId) {
                            lastTime = null;
                            rafId = requestAnimationFrame(tick);
                        }
                    });
                }, { threshold: 0.01 });
                io.observe(stage);
            }

            rafId = requestAnimationFrame(tick);
        });
    }

    // Sub-Tab 切换 (灵感/聆听/心流)
    function initSubTabs() {
        var soulTabs = document.querySelectorAll('.soul-tab');
        soulTabs.forEach(function (tab) {
            if (tab.dataset.inited === '1') return;
            tab.dataset.inited = '1';
            tab.addEventListener('click', function () {
                var target = tab.dataset.soulTab;
                if (!target) return;

                var parent = tab.closest('.soul-tabs');
                if (parent) {
                    parent.querySelectorAll('.soul-tab').forEach(function (t) {
                        t.classList.remove('active');
                    });
                }
                tab.classList.add('active');

                var container = tab.closest('.soul-container');
                if (container) {
                    container.querySelectorAll('.soul-card').forEach(function (card) {
                        card.classList.remove('active');
                    });
                    var targetCard = container.querySelector('.soul-card.' + target);
                    if (targetCard) {
                        targetCard.classList.add('active');
                    }
                }
            });
        });
    }

    // 聆听 / 心流 内部 item active 切换
    function initItemPickers() {
        document.querySelectorAll('.listen-item').forEach(function (item) {
            if (item.dataset.inited === '1') return;
            item.dataset.inited = '1';
            item.addEventListener('click', function () {
                var parent = item.closest('.listen-grid');
                if (!parent) return;
                parent.querySelectorAll('.listen-item').forEach(function (i) {
                    i.classList.remove('active');
                });
                item.classList.add('active');
            });
        });

        document.querySelectorAll('.breathe-mode').forEach(function (mode) {
            if (mode.dataset.inited === '1') return;
            mode.dataset.inited = '1';
            mode.addEventListener('click', function () {
                var parent = mode.closest('.breathe-mode-grid');
                if (!parent) return;
                parent.querySelectorAll('.breathe-mode').forEach(function (m) {
                    m.classList.remove('active');
                });
                mode.classList.add('active');
            });
        });
    }

    // 心流计时器状态
    var breatheTimerState = {
        interval: null,
        isRunning: false,
        isPaused: false,
        isCountdown: false,
        remainingSeconds: 0,
        elapsedSeconds: 0,
        durationMinutes: 0,
        totalFlowMinutes: 0,
        modes: {
            '平静': { cycle: 16 },
            '放松': { cycle: 19 },
            '专注': { cycle: 16 },
            '能量': { cycle: 8 }
        },
        currentMode: '平静'
    };

    function formatTime(seconds) {
        var hours = Math.floor(seconds / 3600);
        var mins = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;
        return (hours < 10 ? '0' : '') + hours + ':' + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    function updateTimerDisplay() {
        var timerEl = document.getElementById('breatheTimer');
        if (timerEl) {
            if (breatheTimerState.isCountdown) {
                timerEl.textContent = formatTime(breatheTimerState.remainingSeconds);
            } else {
                timerEl.textContent = formatTime(breatheTimerState.elapsedSeconds);
            }
        }
    }

    function updateSettingsDisplay() {
        var totalEl = document.getElementById('totalMinutes');
        if (totalEl) {
            var totalHours = Math.floor(breatheTimerState.totalFlowMinutes / 60);
            var totalMins = breatheTimerState.totalFlowMinutes % 60;
            totalEl.textContent = '心流时间累计 ' + totalHours + 'h ' + totalMins + 'm';
        }
    }

    function loadTotalMinutes() {
        var saved = localStorage.getItem('iris_total_flow_minutes');
        if (saved) {
            breatheTimerState.totalFlowMinutes = parseInt(saved, 10);
        }
        updateSettingsDisplay();
    }

    function saveTotalMinutes() {
        localStorage.setItem('iris_total_flow_minutes', breatheTimerState.totalFlowMinutes.toString());
    }

    function updateBreatheCycle() {
        var ring = document.querySelector('.breathe-ring');
        if (!ring) return;
        
        var mode = breatheTimerState.modes[breatheTimerState.currentMode];
        if (mode) {
            ring.style.animationDuration = mode.cycle + 's';
        }
    }

    function updateButtonStates() {
        var startBtn = document.getElementById('breatheStartBtn');
        var pauseBtn = document.getElementById('breathePauseBtn');

        if (!startBtn || !pauseBtn) return;

        if (!breatheTimerState.isRunning && !breatheTimerState.isPaused) {
            startBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i> 开始';
            startBtn.style.display = '';
            pauseBtn.style.display = 'none';
        } else if (breatheTimerState.isRunning) {
            startBtn.innerHTML = '<i class="fa-solid fa-circle-stop"></i> 结束';
            startBtn.style.display = '';
            pauseBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i> 暂停';
            pauseBtn.style.display = '';
        } else if (breatheTimerState.isPaused) {
            startBtn.innerHTML = '<i class="fa-solid fa-circle-stop"></i> 结束';
            startBtn.style.display = '';
            pauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i> 继续';
            pauseBtn.style.display = '';
        }
    }

    function startBreatheTimer() {
        if (breatheTimerState.isRunning) return;

        if (breatheTimerState.isPaused) {
            breatheTimerState.isPaused = false;
            breatheTimerState.isRunning = true;
            updateButtonStates();
            startInterval();
            return;
        }

        breatheTimerState.isRunning = true;

        if (breatheTimerState.durationMinutes > 0) {
            breatheTimerState.isCountdown = true;
            breatheTimerState.remainingSeconds = breatheTimerState.durationMinutes * 60;
        } else {
            breatheTimerState.isCountdown = false;
            breatheTimerState.elapsedSeconds = 0;
        }

        updateTimerDisplay();
        updateButtonStates();
        startInterval();
    }

    function startInterval() {
        breatheTimerState.interval = setInterval(function () {
            if (breatheTimerState.isCountdown) {
                if (breatheTimerState.remainingSeconds > 0) {
                    breatheTimerState.remainingSeconds--;
                    updateTimerDisplay();
                } else {
                    finishBreatheTimer();
                }
            } else {
                breatheTimerState.elapsedSeconds++;
                updateTimerDisplay();
            }
        }, 1000);
    }

    function pauseBreatheTimer() {
        if (!breatheTimerState.isRunning) return;
        
        breatheTimerState.isRunning = false;
        breatheTimerState.isPaused = true;
        clearInterval(breatheTimerState.interval);
        updateButtonStates();
    }

    function finishBreatheTimer() {
        var completedMinutes;
        var isCountdownDone = breatheTimerState.isCountdown && breatheTimerState.remainingSeconds <= 0;

        if (breatheTimerState.isCountdown) {
            var actualUsedSeconds = (breatheTimerState.durationMinutes * 60) - breatheTimerState.remainingSeconds;
            completedMinutes = Math.floor(actualUsedSeconds / 60);
        } else {
            completedMinutes = Math.floor(breatheTimerState.elapsedSeconds / 60);
        }

        breatheTimerState.totalFlowMinutes += completedMinutes;
        saveTotalMinutes();
        updateSettingsDisplay();

        // 能量奖励：每5分钟1点能量，至少1点
        var energyGain = 0;
        if (completedMinutes > 0) {
            energyGain = Math.max(1, Math.floor(completedMinutes / 5));
            addEnergy(energyGain);
        }

        clearInterval(breatheTimerState.interval);
        breatheTimerState.isRunning = false;
        breatheTimerState.isPaused = false;
        breatheTimerState.remainingSeconds = 0;
        breatheTimerState.elapsedSeconds = 0;
        breatheTimerState.isCountdown = false;

        updateTimerDisplay();
        updateButtonStates();

        // 震动提醒：倒计时自然完成用长震动，手动结束用短震动
        try {
            if (navigator.vibrate) {
                navigator.vibrate(isCountdownDone ? [200, 100, 200, 100, 200] : [80, 40, 80]);
            }
        } catch (e) { }

        // 音效
        playGentleSound('longPress');

        // Toast 提示
        var msg = '心流结束，累计 ' + completedMinutes + ' 分钟';
        if (energyGain > 0) msg += '，+' + energyGain + ' 能量';
        showToast(msg);
    }

    function stopBreatheTimer() {
        clearInterval(breatheTimerState.interval);
        breatheTimerState.isRunning = false;
        breatheTimerState.isPaused = false;
        breatheTimerState.remainingSeconds = 0;
        breatheTimerState.elapsedSeconds = 0;
        breatheTimerState.isCountdown = false;
        updateTimerDisplay();
        updateButtonStates();
    }

    function clearPresetSelection() {
        document.querySelectorAll('.duration-preset-btn').forEach(function (btn) {
            btn.classList.remove('active');
        });
        breatheTimerState.durationMinutes = 0;
    }

    function initBreatheTimer() {
        loadTotalMinutes();
        updateBreatheCycle();
        updateButtonStates();

        document.querySelectorAll('.breathe-mode').forEach(function (mode) {
            mode.addEventListener('click', function () {
                if (breatheTimerState.isRunning || breatheTimerState.isPaused) return;
                document.querySelectorAll('.breathe-mode').forEach(function (m) {
                    m.classList.remove('active');
                });
                mode.classList.add('active');
                var modeName = mode.querySelector('.breathe-mode-name').textContent;
                breatheTimerState.currentMode = modeName;
                updateBreatheCycle();
            });
        });

        document.getElementById('preset25').addEventListener('click', function () {
            if (breatheTimerState.isRunning || breatheTimerState.isPaused) return;
            var wasActive = this.classList.contains('active');
            clearPresetSelection();
            if (!wasActive) {
                this.classList.add('active');
                breatheTimerState.durationMinutes = 25;
            }
        });

        document.getElementById('preset45').addEventListener('click', function () {
            if (breatheTimerState.isRunning || breatheTimerState.isPaused) return;
            var wasActive = this.classList.contains('active');
            clearPresetSelection();
            if (!wasActive) {
                this.classList.add('active');
                breatheTimerState.durationMinutes = 45;
            }
        });

        document.getElementById('presetCustom').addEventListener('click', function () {
            if (breatheTimerState.isRunning || breatheTimerState.isPaused) return;
            clearPresetSelection();
            this.classList.add('active');
            var customInput = document.getElementById('customInput');
            if (customInput) {
                customInput.style.display = 'flex';
            }
        });

        document.getElementById('customConfirm').addEventListener('click', function () {
            if (breatheTimerState.isRunning || breatheTimerState.isPaused) return;
            var input = document.getElementById('customDuration');
            var val = parseInt(input.value, 10);
            if (val && val >= 1 && val <= 180) {
                breatheTimerState.durationMinutes = val;
                var customInput = document.getElementById('customInput');
                if (customInput) {
                    customInput.style.display = 'none';
                }
            } else {
                alert('请输入1-180之间的数字');
            }
        });

        document.getElementById('breatheStartBtn').addEventListener('click', function () {
            if (breatheTimerState.isRunning || breatheTimerState.isPaused) {
                finishBreatheTimer();
            } else {
                startBreatheTimer();
            }
        });

        document.getElementById('breathePauseBtn').addEventListener('click', function () {
            if (breatheTimerState.isPaused) {
                startBreatheTimer();
            } else {
                pauseBreatheTimer();
            }
        });

        updateTimerDisplay();
    }

    // 随机抽取一张神谕牌
    function drawOracleCard() {
        var seed = Date.now() % ORACLE_CARDS.length;
        return ORACLE_CARDS[seed];
    }

    // 抽牌按钮 (灵感) - 随机抽取神谕牌
    function initDrawButtons() {
        document.querySelectorAll('.inspire-draw-btn').forEach(function (btn) {
            if (btn.dataset.inited === '1') return;
            btn.dataset.inited = '1';
            btn.addEventListener('click', function () {
                var card = btn.closest('.soul-card.inspire');
                if (!card) return;
                var beforeFace = card.querySelector('.inspire-before');
                var afterFace = card.querySelector('.inspire-after');
                if (!beforeFace || !afterFace) return;

                var oracleCard = drawOracleCard();

                document.getElementById('inspireCardNum').textContent = oracleCard.num;
                document.getElementById('inspireCardIcon').innerHTML = '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' + oracleCard.icon + '</svg>';
                document.getElementById('inspireCardName').textContent = oracleCard.name_zh;
                document.getElementById('inspireCardSub').textContent = oracleCard.name_en;
                document.getElementById('inspireCardMeaning').innerHTML = oracleCard.meaning.replace(/\n/g, '<br>');
                document.getElementById('inspireCardAction').textContent = oracleCard.action;

                var face = document.getElementById('inspireCardFace');
                if (face && THEME_COLORS[oracleCard.theme]) {
                    face.style.background = THEME_COLORS[oracleCard.theme].bg;
                    face.style.color = THEME_COLORS[oracleCard.theme].text;
                }

                beforeFace.style.display = 'none';
                afterFace.style.display = 'flex';
            });
        });
    }

    // 暴露初始化函数
    window.initSoulCards = function () {
        initOrbit();
        initSubTabs();
        initItemPickers();
        initDrawButtons();
        initBreatheTimer();
    };

    // DOM Ready 后自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initSoulCards);
    } else {
        window.initSoulCards();
    }
})();