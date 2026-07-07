# Iris v4.2 开发日志

> 活文档：记录每一次修改的决策、原因和结果  
> 最后更新：2026-07-07

---

## 项目结构

```
D:\中转\IRIS\
├── index.html          # 主入口，所有页面结构
├── css/                # 11 个样式模块
│   ├── variables.css   # 颜色、间距、字体变量
│   ├── base.css        # 全局重置、布局、导航
│   ├── todo.css        # 待办清单 + 长按动画
│   ├── energy.css      # 能量卡片 + 长按星星动画
│   ├── routine.css     # 成长仪式
│   ├── achieve.css     # 成就墙
│   ├── diary.css       # 日记 + 时间轴
│   ├── sidebar.css     # 侧边抽屉
│   ├── modals.css      # 弹窗
│   ├── shop.css        # 商店
│   └── responsive.css  # 媒体查询（4档适配）
├── js/                 # 17 个功能模块
│   ├── state.js        # 全局状态 + 存储
│   ├── utils.js        # 工具函数
│   ├── sidebar.js      # 侧边栏控制
│   ├── lock.js         # 锁屏
│   ├── todo.js         # 待办核心逻辑
│   ├── routines.js     # 成长仪式
│   ├── energy.js       # 能量系统
│   ├── achievements.js # 成就墙
│   ├── diary.js        # 日记系统
│   ├── afk.js          # 离开模式
│   ├── audio.js        # 音频管理
│   ├── shop.js         # 商店系统
│   ├── pet.js          # 小狗系统
│   ├── gallery.js      # 时光画廊
│   ├── backup.js       # 数据备份
│   ├── guide.js        # 新手引导
│   └── init.js         # 初始化入口
└── assets/             # 音频、图片资源
```

---

## 修改历史

### Phase 1: 模块化拆分（从单文件到多文件）

**背景**：原始项目是一个巨大的单体 HTML 文件（index1.html），所有 CSS 和 JS 都内联在 `<style>` 和 `<script>` 标签中。

**决策**：拆分为 11 个 CSS 文件 + 17 个 JS 文件，使用 `<link>` 和 `<script defer>` 引用。

**原因**：
- 代码可维护性：每个模块独立，修改一个功能不影响其他
- 调试方便：浏览器开发者工具能精确定位到具体文件
- 协作友好：多人可以同时修改不同模块

**关键处理**：
- 去重：`toggleFold`、`triggerVibrate`、`getTodayDateKey`、`toggleGroup` 等函数在多个文件中重复定义，合并为单一定义
- 加载顺序：`defer` 保证 DOM 解析完成后再执行 JS，无需 `DOMContentLoaded`

---

### Phase 2: Bug 修复（5 个）

#### Bug 1: 能量卡片移动端换行问题
**问题**：在手机上，能量按钮（高能/低能/休息）会换行，破坏布局。

**原因**：CSS 中使用了 `flex-wrap: wrap`，在窄屏上按钮会换到第二行。

**修复**：改为 `flex-wrap: nowrap`，并设置 `overflow: hidden` 防止溢出。

**文件**：`css/energy.css:42`

---

#### Bug 2: 待办长按触发文字选择
**问题**：长按待办项完成时，会触发系统文字选择菜单（移动端）。

**原因**：没有禁用默认的长按行为。

**修复**：
```css
* {
    user-select: none;
    -webkit-touch-callout: none;
    touch-action: manipulation;
}
input, textarea {
    user-select: auto;
}
```

**文件**：`css/base.css:50-60`

---

#### Bug 3: iPad + 按钮溢出
**问题**：iPad 上新增待办的 + 按钮被截断。

**原因**：固定宽度在中等屏幕上不够。

**修复**：改为 `flex-shrink: 0` 防止收缩，`min-width: 44px` 确保最小点击区域。

**文件**：`css/todo.css:20`

---

#### Bug 4: 存储警告误报
**问题**：即使还有空间，也会弹出"存储接近上限"警告。

**原因**：`saveState()` 中的 `try-catch` 没有正确捕获 `QuotaExceededError`，导致每次保存都触发警告。

**修复**：
```javascript
try {
    localStorage.setItem('irisState', JSON.stringify(state));
} catch (e) {
    if (e.name === 'QuotaExceededError') {
        showStorageWarning();
    }
}
```

**文件**：`js/state.js:47`

---

#### Bug 5: iPad 日记输入框溢出
**问题**：iPad 上日记输入框宽度超出屏幕。

**原因**：固定宽度 `width: 100%` 没有考虑 padding。

**修复**：改为 `box-sizing: border-box`，确保 padding 包含在宽度内。

**文件**：`css/diary.css:30`

---

### Phase 3: 屏幕适配（4 档）

**决策**：使用 4 个断点适配不同设备：

| 断点 | 设备 | 特殊处理 |
|------|------|----------|
| `< 480px` | 手机 | 基础字号 16px，紧凑布局 |
| `768-1024px` | iPad | 手机框样式（边框+圆角），非全屏 |
| `≥ 1200px` | 桌面 | 放大字号 18px，更宽松间距 |
| `≥ 1600px` | 超宽屏 | 最大字号 20px，最大内容宽度 |

**关键决策**：iPad 保持手机框样式（`border-radius: 20px; border: 8px solid #1a1a2e`），而非全屏展开。

**原因**：保持移动端体验的一致性，避免布局突变。

**文件**：`css/responsive.css`

---

### Phase 4: UI 优化（6 项）

#### 1. 星星复选框放大
**决策**：将 `★` 从 `1.2rem` 放大到 `1.6rem`（约 32px），更易于点击。

**文件**：`css/todo.css:60`

---

#### 2. 成长仪式按钮高度
**决策**：固定高度 `44px`，符合 Apple HIG 最小点击区域标准。

**文件**：`css/routine.css:55`

---

#### 3. 能量卡片文字动画
**决策**：
- 文字从模糊到清晰渐显（`energyTextReveal` 动画）
- 右上角星星闪烁装饰（`starTwinkle` 动画）

**文件**：`css/energy.css:180-215`

---

#### 4. 能量规则字体放大
**决策**：规则文本从 `0.75rem` 放大到 `0.85rem`，提高可读性。

**文件**：`css/energy.css:100`

---

#### 5. 全局 touch-action
**决策**：所有元素设置 `touch-action: manipulation`，禁用双击缩放和非必要手势。

**文件**：`css/base.css:58`

---

#### 6. 💜 替代月亮图标
**决策**：时光画廊触发按钮从 `🌙` 改为 `💜`，更符合"爱"的主题。

**文件**：`index.html:103`

---

### Phase 5: 本轮修改（5 项）

#### 1. 💜 爱心按钮样式修复
**问题**：紫色爱心按钮（💜）在标题栏中看起来不协调。

**决策**：
- 移除按钮背景色（`background: transparent`）
- 增大字号到 `1.4rem`
- 移除 `color` 属性（emoji 不受文字颜色影响）

**文件**：`css/base.css:174-192`

---

#### 2. 能量卡片长按动画重新设计
**需求**：长按时，星星逐个亮起（✧ → ✧✧ → ✧✧✧ → ✧✧✧✧ → ✦），文案从边缘向中心消散。

**决策**：
- 添加 5 个星星元素到 HTML（`<div class="energy-stars-progress">`）
- CSS transition-delay 实现逐个亮起（每颗间隔 120ms）
- 文案使用 `textDissolve` 动画：`blur(0) → blur(8px)` + `letter-spacing: 0 → 8px`
- 长按完成后添加 `long-press-done` 类触发最终淡出

**文件**：
- `css/energy.css:140-215`（新动画）
- `index.html:68-76`（星星 HTML）

---

#### 3. 能量卡片文案排版
**需求**：强制两行显示，尽量从逗号处断句。

**决策**：使用 CSS `-webkit-line-clamp: 2` 限制为两行，配合 `word-break: break-word` 自动断句。

**文件**：`css/energy.css:200-210`

---

#### 4. 删除日记成功生成器
**问题**：日记页有一个"✨ 生成"按钮，调用不存在的 `generateAffirmDiary()` 函数。

**决策**：移除整个 `affirm-area` 包括 HTML 和 CSS。

**文件**：
- `index.html:165-169`（删除 HTML）
- `css/diary.css:213-254`（删除 CSS）

---

#### 5. 创建 PLAN.md 活文档
**决策**：创建开发日志，记录所有修改的决策、原因和结果，方便后续维护。

**文件**：`PLAN.md`（本文件）

---

## 待办事项

- [ ] 考虑添加深色模式切换
- [ ] 优化移动端手势操作
- [ ] 添加数据导出功能
- [ ] 性能优化：虚拟滚动（长列表）

---

## 设计原则

1. **移动端优先**：所有设计从小屏幕开始，逐步扩展
2. **触控友好**：最小点击区域 44px，避免精密操作
3. **视觉反馈**：所有交互都有即时反馈（动画、震动）
4. **性能优先**：使用 CSS 动画而非 JS，减少重绘
5. **零内联**：所有 CSS/JS 外部化，便于维护

---

*本文档随项目持续更新*
