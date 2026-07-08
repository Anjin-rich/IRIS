# Iris v4.2 开发日志

> 活文档：记录每一次修改的决策、原因和结果
> 最后更新：2026-07-09

---

## 项目结构

```
D:\中转\IRIS\
├── index.html          # 主入口，所有页面结构
├── css/                # 11 个样式模块
│   ├── variables.css   # 颜色、间距、字体变量
│   ├── base.css        # 全局重置、布局、导航
│   ├── todo.css        # 待办清单
│   ├── energy.css      # 能量卡片 + 长按交互
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

---

## 2026-07-09 修改：能量按钮始终带色（区分三个状态）

**为什么这样改：**
> 三个能量按钮（充沛/温和/休息）去掉了 emoji，如果默认都是白色背景，用户无法一眼区分。需要让每个按钮**始终有代表色**，未选中时浅色、选中时深色。

**设计：**
| 状态 | 未选中（浅色底） | 选中（实心底） |
|------|------------------|----------------|
| 充沛 | `rgba(245,217,142,0.25)` 黄底 + `#92783a` 文字 | `#f5d98e` + `#6b5a2e` |
| 温和 | `rgba(168,212,230,0.25)` 蓝底 + `#4a7a8c` 文字 | `#a8d4e6` + `#3a6073` |
| 休息 | `rgba(212,192,222,0.25)` 紫底 + `#7a6588` 文字 | `#d4c0de` + `#5c4e6c` |

**决策要点：**
1. 未选中态：低饱和度彩色底（0.25 透明度）+ 对比色文字
2. 选中态：纯色实心背景 + 深色文字（保持原有 active 样式）
3. HTML 按钮加 `high-default` / `low-default` / `rest-default` class
4. 选中时 JS 会加 `active-*` class，颜色覆盖默认浅色

**涉及文件：**
- `index.html` — 三个按钮加 default class（high-default / low-default / rest-default）
- `css/energy.css` — 新增 `.high-default` `.low-default` `.rest-default` 浅色背景；保留 `.active-*` 纯色

---

## 2026-07-08 修改：清单页去卡片化 + 能量卡片清透渐变 + 导航栏柔化

**为什么这样改：**
> 清单页所有组件被一个白色 `.card-ins` 大卡片包住，视觉臃肿且浪费空间。能量卡片太高占位置。导航栏生硬。

**决策要点：**

### 1. 清单页去卡片化
- 删除清单页的 `.card-ins` 包裹层，让能量栏、待办/仪式切换、输入框独立排列
- 书架页保留 `.card-ins`（输入区白底卡片）

### 2. 能量卡片清透渐变毛玻璃
- 背景：`linear-gradient(135deg, rgba(245,235,250,0.7), rgba(225,238,255,0.7))`，粉蓝紫渐变
- 毛玻璃：`backdrop-filter: blur(16px)`
- 边框：`1px solid rgba(255,255,255,0.8)`
- 阴影：`0 8px 24px rgba(156,142,185,0.06)`
- padding 缩减为 `14px 20px`，`min-height: 0`，去掉多余高度
- 文字：`0.9rem`，`font-weight: 400`，`#4a3f55`，保持两行排布

### 3. 导航栏柔化
- 高度 `68px` → `64px`
- 未选中色：`#9c8eb9`（灰紫），降低视觉侵略性
- 选中色：`#7c4dff`（亮紫），图标 `scale(1.05)` 微放大
- 过渡动画 `0.3s ease`，更灵动

**涉及文件：**
- `index.html` — 清单页删除 `.card-ins` 包裹
- `css/energy.css` — 能量卡片渐变毛玻璃 + 缩减 padding
- `css/sidebar.css` — 导航栏颜色/高度/动画

---

## 2026-07-08 修改：书架卡片 UI 重构 — 毛玻璃相册卡风格

**为什么这样改：**
> 用户要求将书架卡片从紧凑列表风格升级为「毛玻璃相册卡」极简设计，类似 iOS 桌面小组件/高级生活记录卡。参考图为粉蓝渐变背景上的白色毛玻璃卡片，封面像被镶嵌在玻璃框里的小照片。经过多轮迭代调整比例、排版、响应式布局。

**决策要点：**

### 1. 输入区白底卡片 + 书架网格分离
- 输入区（书名、作者、封面、按钮）单独包在 `.card-ins`（默认白底），和清单页风格一致
- 书架网格在 `.card-ins` 外部，卡片自带晕染背景
- "记录读书笔记"按钮移到封面上传同一行（`margin-left: auto`），去掉 emoji

### 2. 毛玻璃卡片（Glassmorphism）
- 卡片背景：`linear-gradient(160deg, rgba(243,235,248,0.85), rgba(230,238,250,0.85))`，粉蓝紫晕染直接在卡片上
- 毛玻璃：`backdrop-filter: blur(14px)`
- 高光边框：`1.5px solid rgba(255,255,255,0.85)`
- 阴影：`0 8px 32px rgba(156,142,185,0.12)`
- 大圆角：`20px`

### 3. 画框留白结构
- 封面 `aspect-ratio: 3/4`，圆角 `10px`，轻阴影
- 进度条完全隐藏（`display: none`）
- 删除下横线装饰

### 4. 文字排版
- 书名：`0.8rem`，`font-weight: 500`，`letter-spacing: 1.5px`，颜色 `#4a3f55`
- 作者：`0.65rem`，`font-weight: 400`，颜色 `#9a8daa`，`line-height: 1.2`
- 日期：`0.45rem`，格式 `YYYY / MM / DD`
- 作者为空时用 `.book-author-placeholder`（等高占位）保持日期位置不动
- 作者输入"无"或"未知"时存为空字符串，卡片不显示作者

### 5. 响应式网格布局
- 手机：`grid-template-columns: repeat(2, 1fr)`，`gap: 16px`
- 电脑（≥1200px）：`repeat(3, 1fr)`，`gap: 20px`
- 始终两列起步，大屏三列

### 6. 性能
- `backdrop-filter: blur(25px)` 强化毛玻璃模糊感
- 不嵌套毛玻璃元素

### 7. 最终精调（用户提供代码）
- 卡片背景 → `linear-gradient(135deg, rgba(245,235,250,0.85), rgba(225,238,255,0.85))`
- 模糊 → `blur(25px)`，阴影 → 复合双层（`0 4px 10px` + `0 20px 40px`）
- 圆角 → `24px`，边框 → `1.5px solid rgba(255,255,255,0.9)`
- 字重全部 `300`（细体），字号：书名 `0.8rem`，作者 `0.65rem`，日期 `0.45rem`
- 日期下移 `margin-top: 4px`

**涉及文件：**
- `index.html` — 输入区独立 `.card-ins` + 按钮移入封面行 + 作者占位符
- `css/diary.css` — `.book-card` 毛玻璃重写 + 文字排版 + `.book-author-placeholder` + 进度条隐藏
- `css/responsive.css` — ≥1200px 三列网格
- `js/audio.js` — `renderBooks()` 重写（进度条移除、日期格式化、作者空值处理、占位符）+ `addReadingRecord()` 作者"无/未知"判空

---

## 2026-07-08 修改：今日能量文案卡片填色不满 + 居左 bug

**为什么这样改：**
> 文案较短时，能量卡片底色不铺满整个宽度，文字居左显示。原因是 `.energy-bar-card` 缺少 `width: 100%`。

**决策要点：**
- 给 `.energy-bar-card` 加 `width: 100%`，底色铺满、文字居中

**涉及文件：**
- `css/energy.css` — `.energy-bar-card` 加 `width: 100%`

---

## 2026-07-08 修改：能量文案精准换行控制

**为什么这样改：**
> 长文案在逗号中间断句不自然，希望像诗歌一样在最合适的停顿处分行。采用用户提出的「方案二」：CSS `white-space: pre-line` + JS 文案库直接加 `\n`。

**决策要点：**
- CSS 加 `white-space: pre-line`，识别文本中的 `\n` 换行符
- 每条文案只保留 1 个 `\n`，最多两行
- 删除 `getRandomMessage` 里的零宽字符正则替换
- 清理了之前的 `word-break`/`line-break` 方案

**涉及文件：**
- `css/energy.css` — `white-space: pre-line` 替换之前的 `word-break`/`line-break`
- `js/energy.js` — 33 条文案全部加 `\n` + `getRandomMessage` 简化

---

## 2026-07-08 修改：日记排序胶囊按钮 UI 重构 + 排序逻辑修复

**为什么这样改：**
> 排序按钮从日记标签页移到了"全部日记"弹窗标题栏内，但存在三个问题：(1) 按钮文字带箭头不够简洁；(2) 样式是普通按钮而非胶囊切换形态；(3) 排序只反转了月份分组顺序，没有真正按创建时间精确排序。

**决策要点：**
- 胶囊按钮改为双块切换形态：选中一半淡紫背景+深紫文字，未选中一半白色+灰色文字
- 排序逻辑改为 `createdAt` ISO 字符串直接比较（精确到毫秒），先全局排序再按年月分组
- 正序时月份从最早开始排列，倒序时从最新开始
- 弹窗已打开时点击切换会实时重新渲染列表

**涉及文件：**
- `index.html` — 胶囊按钮 HTML 改为双块 `<div>` 结构
- `js/diary.js` — `toggleDiarySort()` 更新视觉状态 + `openAllDiaries()` 重写排序逻辑 + `updateSortBtnStyle()` 辅助函数

---

## 2026-07-08 修改：7 项体验优化（备份提示、书架删除、日记排序、能量卡片对齐、规则文案等）

**为什么这样改：**
> 用户体验细节优化：备份导入成功后无提示、书架"长按删除"误导用户、日记无法排序、能量卡片文字偏上、能量规则文案与实际不符。

**决策要点：**
- 备份 toast 移到 `location.reload()` 之前，用 `setTimeout` 延迟 500ms 刷新
- 书架删除：删掉"长按删除"提示，在书籍详情弹窗里加删除按钮（和日记一致）
- 日记排序：在"查看全部日记"旁加胶囊按钮，支持正序/倒序切换
- 能量卡片：`display: block` 改 `display: flex` + `align-items: center`，修复文字偏上
- 能量规则："每日首次免费"改为"每日前两次免费"（与代码逻辑一致）
- baseMoods 重复 🤤 改为 😴
- init.js 删除 `#energyFold` 死代码

**涉及文件：**
- `js/backup.js` — toast 顺序调整
- `js/audio.js` — 删除书架"长按删除"提示 + 新增 `deleteBook()` 函数
- `index.html` — 书架弹窗加删除按钮 + 日记排序胶囊按钮 + 能量规则文案
- `js/diary.js` — 新增 `diarySortDesc` 状态 + `toggleDiarySort()` + `openAllDiaries` 支持排序
- `css/energy.css` — 能量栏 `display: flex` + 按钮 `line-height` 对齐
- `js/state.js` — baseMoods 去重
- `js/init.js` — 删除 `#energyFold` 死代码

---

## 2026-07-08 修改：修复 `--transition` 变量未定义 + 删除 audio.js 重复函数

**为什么这样改：**
> 全站 27 处 `transition: var(--transition)` 引用了一个从未定义的 CSS 变量，导致所有按钮动画、侧边栏滑入、弹窗过渡全部失效。同时 audio.js 里有一份和 energy.js 完全相同的 `updateEnergyUI` 函数，后者覆盖前者，是隐患。

**决策要点：**
- 在 `:root` 加 `--transition: all 0.2s ease;`，一行修复全站动画
- 删除 `audio.js` 里重复的 `updateEnergyUI`，保留 `energy.js` 里的版本
- 日记日历缺失不是 bug，是用户故意去掉的，不处理

**涉及文件：**
- `css/variables.css` — `:root` 新增 `--transition` 变量
- `js/audio.js` — 删除重复的 `updateEnergyUI` 函数

---

## 2026-07-08 修改：长按能量卡片无反应，三端全部修复

**为什么这样改：**
> 今日能量卡片长按在手机/电脑/iPad 全部无反应。用户反复测试了 Pointer events、AbortController、setPointerCapture 等方案均失败，最后发现真正原因是 JS 模块化后的重复声明导致脚本链断裂。

**决策要点：**
- 放弃了 Pointer events + AbortController 方案，原因是它在部分移动端浏览器上行为不一致
- 改用 e.html 已验证成功的 mouse/touch 事件方案，原因是该方案在三端均测试通过
- 发现 `guideStep` 在 `guide.js` 和 `state.js` 里重复声明（`let`），导致整个 JS 链路静默断裂，`setupEnergyCardLongPress` 根本没执行
- 最终修复：删除 `state.js` 里重复的声明 + `diary.js` 加空值保护 + 能量卡片代码完全同步自 e.html
- 遗留教训：模块化后 `let`/`const` 重复声明会炸掉整个脚本链，以后先查控制台报错

**涉及文件：**
- `js/state.js` — 删除重复的 `guideStep` / `guideSteps` 声明
- `js/diary.js` — `renderCalendar` 加 `if (!grid || !monthYear) return` 空值保护
- `css/energy.css` — 完整替换为 e.html 验证通过的版本（`touch-action: manipulation` + `.pressing` + `.press-progress`）
- `js/energy.js` — 长按逻辑替换为 e.html 版本（mouse/touch 事件 + 进度条动画 + touchmove 位移取消）
- `index.html` — 能量卡片 HTML 同步（含 `press-progress` 元素）

---

## 2026-07-08 修改：删除日记成功生成器 + 创建 PLAN.md

**为什么这样改：**
> 日记页有一个"✨ 生成"按钮，调用不存在的 `generateAffirmDiary()` 函数，是死代码。同时需要一个活文档记录所有修改决策。

**决策要点：**
- 移除整个 `affirm-area`（HTML + CSS），因为功能未实现且按钮点击无反应
- 创建 PLAN.md 记录开发日志，方便后续维护和回溯决策原因

**涉及文件：**
- `index.html` — 删除日记页 affirm-area 区块
- `css/diary.css` — 删除 `.affirm-area` 相关样式
- `PLAN.md` — 新建开发日志文件

---

## 2026-07-08 修改：💜 爱心按钮样式修复

**为什么这样改：**
> 时光画廊触发按钮从 🌙 改为 💜 后，emoji 在紫色圆形背景里显示效果不协调。

**决策要点：**
- 移除按钮背景色（`background: transparent`），让 emoji 自身颜色直接呈现
- 增大字号到 `1.4rem`，让爱心更醒目
- 移除 `color` 属性，因为 emoji 不受文字颜色影响

**涉及文件：**
- `css/base.css` — `.gallery-header-btn` 样式调整

---

## 2026-07-07 修改：屏幕适配（4档响应式）

**为什么这样改：**
> 项目需要在手机、iPad、桌面、超宽屏上都能正常显示，iPad 保持手机框样式而非全屏展开。

**决策要点：**
- 4 个断点：`<480px`（手机）、`768-1024px`（iPad）、`≥1200px`（桌面）、`≥1600px`（超宽屏）
- iPad 保持手机框样式（`border-radius: 20px; border: 8px solid`），原因是保持移动端体验一致性
- 全局字号通过 `:root` font-size 在媒体查询中调整（16px → 17px → 18px → 20px）

**涉及文件：**
- `css/responsive.css` — 4 档媒体查询
- `css/base.css` — 全局字体变量

---

## 2026-07-07 修改：Bug 修复（5个）

**为什么这样改：**
> 模块化拆分后暴露出的 5 个 bug，包括布局、交互、存储等方面。

**决策要点：**
- Bug 1：能量卡片移动端换行 → `flex-wrap: nowrap`
- Bug 2：待办长按触发文字选择 → 全局 `user-select: none` + `-webkit-touch-callout: none`
- Bug 3：iPad + 按钮溢出 → `flex-shrink: 0` + `min-width: 44px`
- Bug 4：存储警告误报 → `saveState` 里 `try-catch` 正确捕获 `QuotaExceededError`
- Bug 5：iPad 日记输入框溢出 → `box-sizing: border-box`

**涉及文件：**
- `css/energy.css` — flex-wrap 修复
- `css/base.css` — 全局禁用文字选择
- `css/todo.css` — + 按钮 flex-shrink
- `js/state.js` — saveState 错误处理
- `css/diary.css` — 输入框 box-sizing

---

## 2026-07-07 修改：模块化拆分

**为什么这样改：**
> 原始项目是单体 HTML 文件（index1.html），所有 CSS 和 JS 内联，无法维护和调试。

**决策要点：**
- 拆分为 11 个 CSS 文件 + 17 个 JS 文件
- 使用 `<link>` 和 `<script defer>` 引用，`defer` 保证 DOM 解析完成后再执行 JS
- 去重：`toggleFold`、`triggerVibrate`、`getTodayDateKey`、`toggleGroup` 等函数合并为单一定义
- 放弃了内联方案，原因是模块化后可维护性和调试效率大幅提升

**涉及文件：**
- `index.html` — 新建，引用外部 CSS/JS
- `css/*.css` — 11 个样式模块
- `js/*.js` — 17 个功能模块

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
