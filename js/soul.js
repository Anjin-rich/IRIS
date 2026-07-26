/* ===== 心灵卡牌交互 =====
   - 3D 环绕轨道动画 (灵感 Tab)
   - 三个 Sub-Tab 切换 (灵感/聆听/心流)
   - 抽牌交互 (灵感)
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

    var DEFAULTS = { count: 7, tilt: 0, radius: 56, perspective: 320, speed: 32 };

    // 初始化 3D 轨道动画
    function initOrbit() {
        document.querySelectorAll('[data-orbit]').forEach(function (stage) {
            // 防止重复初始化
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

            // 清空旧节点 (如有)
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
                el.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="' + ic.c + '" stroke-width="1.5"><path d="' + ic.d + '"/></svg>';
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

            // 当 stage 不可见时暂停动画 (省 CPU)
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

            // 启动
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

                // 切换 tab active
                var parent = tab.closest('.soul-tabs');
                if (parent) {
                    parent.querySelectorAll('.soul-tab').forEach(function (t) {
                        t.classList.remove('active');
                    });
                }
                tab.classList.add('active');

                // 切换 card 显示
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

    // 抽牌按钮 (灵感) - 切换到抽牌后状态
    function initDrawButtons() {
        document.querySelectorAll('.inspire-draw-btn').forEach(function (btn) {
            if (btn.dataset.inited === '1') return;
            btn.dataset.inited = '1';
            btn.addEventListener('click', function () {
                var card = btn.closest('.soul-card.inspire');
                if (!card) return;
                var beforeFace = card.querySelector('.inspire-before');
                var afterFace = card.querySelector('.inspire-after');
                if (beforeFace && afterFace) {
                    beforeFace.style.display = 'none';
                    afterFace.style.display = 'flex';
                }
            });
        });

        // 跳过/重新抽牌
        document.querySelectorAll('.btn-skip').forEach(function (btn) {
            if (btn.dataset.inited === '1') return;
            btn.dataset.inited = '1';
            btn.addEventListener('click', function () {
                var card = btn.closest('.soul-card.inspire');
                if (!card) return;
                var beforeFace = card.querySelector('.inspire-before');
                var afterFace = card.querySelector('.inspire-after');
                if (beforeFace && afterFace) {
                    afterFace.style.display = 'none';
                    beforeFace.style.display = 'flex';
                }
            });
        });
    }

    // 暴露初始化函数
    window.initSoulCards = function () {
        initOrbit();
        initSubTabs();
        initItemPickers();
        initDrawButtons();
    };

    // DOM Ready 后自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initSoulCards);
    } else {
        window.initSoulCards();
    }
})();
