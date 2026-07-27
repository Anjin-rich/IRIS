# Iris v4.2 开发日志

> 活文档：记录每一次修改的决策、原因和结果
> 最后更新：2026-07-27

---

## 项目结构

```
D:\中转\IRIS\
├── index.html          # 主入口，所有页面结构
├── css/                # 12 个样式模块
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
│   ├── soul.css        # 心灵卡牌（灵感/聆听/心流三合一）
│   └── responsive.css  # 媒体查询（4档适配）
├── js/                 # 18 个功能模块
│   ├── state.js        # 全局状态 + 存储
│   ├── utils.js        # 工具函数
│   ├── sidebar.js      # 侧边栏控制
│   ├── lock.js         # 锁屏
│   ├── todo.js         # 待办核心逻辑
│   ├── routines.js     # 成长仪式
│   ├── energy.js       # 能量系统
│   ├── achievements.js # 成就墙
│   ├── diary.js        # 日记系统
│   ├── afk.js          # 离开模式（沉淀页已替换为心灵卡牌，函数保留但未被调用）
│   ├── audio.js        # 音频管理
│   ├── soul.js         # 心灵卡牌（3D 轨道 + sub-tab 切换 + 抽牌交互）
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

## 2026-07-27 修改：心流页重构 + 计时逻辑修复

**为什么这样改：**
> 用户提供了心流页布局图，要求按图调整布局（添加文案、调整元素位置），同时修复计时逻辑（倒计时模式下结束时应累计实际使用时间而非预设时长）。

### 1. 心流页布局调整
- 添加文案："在纷扰的世界里，让心率和时间一同慢下来"，位于圆环下方、模式按钮上方
- 累计时间移到标题右侧，与"心流 FLOW"标题平齐，格式改为"心流时间累计 Xh Ym"
- 计时器字体改为默认字体，默认显示"00:00:00"
- 圆环尺寸增大到 120px，三层圆环效果（外层 3px、中层 2px、内层 1.5px）
- 按钮拆分为【开始/结束】+【暂停】双按钮布局，支持点击开始后切换为结束+暂停

### 2. 计时逻辑修复
- **倒计时模式**：选择 25/45/自定义时间后，从设定时间倒数到 0，结束时累计实际使用时间（预设时长 - 剩余时间）
- **正向计时模式**：不选任何预设时间，直接点击开始，从 00:00:00 开始往上计，结束时累计实际计时时长
- 修复 bug：自定义时间确认后不生效（原代码最小值校验为 val >= 5，改为 val >= 1）
- 修复 bug：倒计时模式下提前结束时错误累计预设时长（改为累计实际使用时间）

### 3. 心流呼吸节拍
- 四种模式对应不同呼吸周期：平静 16s、放松 19s、专注 16s、能量 8s
- 切换模式时自动更新圆环动画周期

### 4. 数据持久化
- 累计心流时间使用 localStorage 存储，刷新页面不丢失

**涉及文件：**
- `index.html` — 心流区域 HTML 结构重构
- `css/soul.css` — 新增文案样式、按钮样式、圆环样式、累计时间样式
- `js/soul.js` — 重写计时器逻辑，支持正向计时/倒计时、双按钮交互、数据持久化

---

## 2026-07-27 修改：灵感页神谕牌整合 + 动效优化

**为什么这样改：**
> 用户要求灵感页动效卡牌组放大、抽牌后卡片放大适应屏幕、移除跳过/添加日记按钮，同时整合 36 张神谕牌文案数据。

### 1. 动效卡牌组放大
- 轨道容器高度从 180px → 280px
- 单张卡牌尺寸从 58×108px → 80×144px
- 轨道半径从 56 → 110，透视从 320px → 450px
- 卡牌之间留有明显缝隙，不再贴在一起

### 2. 抽牌后卡片放大
- 卡片尺寸从 140×230px → 240×432px（比例 1:1.8）
- 与动效卡牌组形状比例一致
- 移除【跳过】【添加日记】按钮

### 3. 36张神谕牌数据整合
- 四个主题：破晓（9张）、盛光（9张）、暮影（9张）、深眠（9张）
- 每张牌包含：序号、图标（SVG）、中文名、英文名、启示短句、今日行动
- 根据主题自动应用不同渐变背景色
- 引入 Cormorant Garamond 字体用于序号和英文名称

**涉及文件：**
- `index.html` — 灵感页卡片内容动态化
- `css/soul.css` — 卡牌样式、主题渐变、字体设置
- `js/soul.js` — 36 张神谕牌数据数组、抽牌逻辑、主题配色

---

## 2026-07-26 修改：沉淀页替换为心灵卡牌三合一模块

**为什么这样改：**
> 用户提供了 `实验田/心灵卡牌/心灵卡牌 - 副本.html` 原型稿，要求把原"沉淀页"直接顶替为心灵卡牌模块。心灵卡牌整合了原沉淀页的功能（白噪音 → 聆听 Tab，计时器 → 心流 Tab），新增了灵感抽牌功能，统一为柔和弥散渐变玻璃质感，与 Iris 主题对齐。

### 1. 新增 `css/soul.css`
- 从原型 HTML 中提取所有心灵卡牌相关样式（去掉 `body`、`*`、`.page-title`、`.phone-frame` 等全局/原型展示样式，避免污染主体）
- `.soul-card` 高度从原型的 `350px` 调整为 `460px`，适配主体应用更大的可视区域
- 字号 rem 值按主体 rem 基准适当放大（如 `.soul-tab` 由 `0.55rem` → `0.72rem`，`.card-quote` 由 `0.62rem` → `0.78rem`）
- 新增 `.soul-card.active` 切换类（display:flex），支持三个 sub-tab 互相切换
- 新增 `.inspire-before` / `.inspire-after` 灵感卡抽牌前后两态切换样式
- 配色与原型完全一致：
  - 灵感：粉紫弥散（#E8A6B3 #F7C9D3 #B5ABCC #B8D7EE）
  - 聆听：薄荷绿弥散（#6DF2DD #EAF8A0 #FCC8BA #F4F7DC）
  - 心流：雾蓝弥散（#8BEADD #5688C9 #8CCDE9 #EBFBFA）

### 2. 新增 `js/soul.js`
- `initOrbit()` — 7 张宝石形卡牌 3D 环绕旋转动画，基于原型脚本移植：
  - 使用 `transform-style: preserve-3d` + `backface-visibility: hidden`
  - 每张卡牌用 `rotateY(angle) translateZ(radius)` 定位
  - 7 张卡牌使用彩虹色（低饱和度）SVG 图标
  - 通过 `IntersectionObserver` 监测 stage 可见性，不可见时暂停 RAF 节省 CPU
- `initSubTabs()` — 三个 sub-tab（灵感/聆听/心流）切换逻辑，通过 `data-soul-tab` 属性定位
- `initItemPickers()` — 聆听声音网格 / 心流模式网格的 active 互斥切换
- `initDrawButtons()` — 灵感抽牌交互：点击"今日抽牌"切换到抽牌后状态；"跳过"返回抽牌前
- 暴露 `window.initSoulCards` 入口函数，DOM Ready 自动调用

### 3. 替换 `index.html` 沉淀页
- `#tab-afk` 整段（原累计沉淀时长 / 静心计时器 / 白噪音折叠面板）被心灵卡牌组件替换
- 心灵卡牌结构：`.soul-container` 包裹 `.soul-tabs` + 三个 `.soul-card`（inspire / listen / breathe）
- 灵感卡牌包含抽牌前后两态（`.inspire-before` / `.inspire-after`，默认显示抽牌前）
- 聆听卡牌包含 6 个声音项（海浪/雨声/森林/壁炉/鸟鸣/咖啡馆，均为 SVG 图标，不使用 emoji）
- 心流卡牌包含呼吸圆环动画 + 4 种模式（平静/放松/专注/能量）+ 3 项统计 + "开始心流"按钮（`margin-top:auto` 贴底）
- 引入 `css/soul.css` 和 `js/soul.js`

### 4. 导航栏图标更新
- 第二个导航按钮图标由 `fa-mug-saucer` 改为 `fa-star`（与原型"心灵"tab 一致）
- 导航顺序保持：清单 → 心灵 → 日记 → 成就

### 5. 兼容性处理
- `js/afk.js` 保留未删除（防止其它地方有调用），但其中 `getElementById('afkCustomMinutes')?.addEventListener` 使用了可选链，DOM 不存在时不会抛错
- 原沉淀页相关的 `startAfk` / `pauseAfk` / `endAfk` / `setAfkPreset` / `toggleSound` / `setSoundVolume` / `toggleFold` 等函数仍保留在 `afk.js` 中，但不再被任何 DOM 调用

**涉及文件：**
- 新增 `css/soul.css`
- 新增 `js/soul.js`
- 修改 `index.html` — head 引入 soul.css、沉淀页整段替换为心灵卡牌、导航 `fa-mug-saucer` → `fa-star`、底部引入 soul.js

---

## 2026-07-26 修改：UI 原型图复刻 + 日记功能优化

**为什么这样改：**
> 用户提供了 app 原型图，需要按原型图修改日记页心情选择器、日记/书架入口卡片、背景渐变、导航栏等多处 UI。同时修复了多个 bug：日记浏览弹窗过小、删除日记后不自动关闭、长按能量卡片重置功能失效等。

### 1. 日记页今日心情选择器重设计
- 将表情选择器从列表式改为卡片式设计，5个心情按钮 + 1个图片按钮共6个并排
- 按钮采用卡片样式，包含圆角、阴影、悬停上浮效果
- 选中色改为 `#969BE7`（与表情2一致），图标背景改为 `#f2f2f7`
- 删除编辑日记标题中的 `✏️` emoji

**涉及文件：**
- `css/diary.css` — `.mood-btn` / `.mood-icon` / `.mood-section-title` 样式
- `js/diary.js` — `renderMoodSelector()` / `selectMood()` 函数更新
- `index.html` — 添加心情标题 + 调整按钮结构

### 2. 日记浏览改为弹窗模式（取消全屏）
- 将日记浏览弹窗从全屏覆盖层改回弹窗模式，与"查看全部日记"弹窗大小一致
- 使用标准的 `.modal-overlay` 和 `.modal-box` 类

**涉及文件：**
- `index.html` — `diaryViewerModal` 结构调整

### 3. 删除日记后自动关闭窗口
- 在 `deleteDiary()` 函数末尾添加 `closeDiaryViewer()` 调用
- 删除后自动返回主页面，无需手动关闭

**涉及文件：**
- `js/diary.js` — `deleteDiary()` 函数

### 4. 查看全部日记按钮样式重设计
- 改为毛玻璃效果的实心背景按钮（`rgba(255,255,255,0.6)` + blur + 书本图标）
- 与当天日记卡片形成区分（当天卡片渐变背景，按钮毛玻璃）

**涉及文件：**
- `css/diary.css` — `.view-all-diary-btn` 样式

### 5. 日记和书架入口按原型图修改
- 日记卡片：在扇形卡牌组中间添加微笑表情 SVG
- 书架卡片：优化书本 SVG 图标，添加紫色三角形装饰

**涉及文件：**
- `index.html` — 日记/书架入口卡片 SVG 更新

### 6. 背景白紫色渐变优化
- 从纯色改为清透的白紫渐变：`linear-gradient(180deg, #ffffff 0%, #f8f4fa 25%, #f2e9f5 50%, #ebe0f0 75%, #e5d5eb 100%)`
- 降低 `.app-phone::after` 覆盖层透明度，让渐变更通透

**涉及文件：**
- `css/base.css` — `body` 渐变 + `.app-phone::after` 透明度

### 7. 底部导航栏优化
- 改为浮动设计：距底部 8px、左右各 16px 的悬浮状态
- 圆角 24px，毛玻璃效果（0.75透明度 + blur 16px）
- 移除导航按钮文字，只保留图标

**涉及文件：**
- `css/sidebar.css` — `.app-navbar` / `.nav-item` 样式
- `index.html` — 删除导航按钮 `<span>` 文字

### 8. 清单页去分界
- `.app-header` 背景改为 `transparent`，移除顶部与内容区的分界线
- `.energy-bar-compact` 背景改为 `transparent`，移除白底边框
- `.todo-tabs` 移除 `border-bottom` 分隔线
- 输入框和待办项改为毛玻璃效果（半透明白色 + blur）

**涉及文件：**
- `css/base.css` — `.app-header` 背景
- `css/energy.css` — `.energy-bar-compact` 背景和边框
- `css/todo.css` — `.todo-tabs` / `.todo-input-group input` / `.todo-item` 样式

### 9. 能量长按重置功能修复
- 在 `updateEnergyUI()` 函数末尾添加 `setupEnergyCardLongPress()` 调用
- 之前选择能量后长按事件未重新绑定，导致长按失效

**涉及文件：**
- `js/energy.js` — `updateEnergyUI()` 函数

---

## 2026-07-26 修改：锁屏密码设置功能优化

**为什么这样改：**
> 用户希望增强应用的隐私保护，为应用添加锁屏密码功能，支持4位数字密码设置和备用秘钥解锁。

### 1. 锁屏密码设置模块
- 新增 `showLockSetupModal()` 打开密码设置弹窗
- 新增 `closeLockSetup()` 关闭密码设置弹窗
- 新增 `initLockSetupInputs()` 初始化密码输入框（支持已有密码回显）
- 新增 `setupDigitInputs()` 统一处理4位数字输入框交互：
  - 只允许输入数字（`/[^0-9]/g` 过滤）
  - 输入完成后自动跳转下一个输入框
  - 支持退格键返回上一个输入框
  - 聚焦时自动选中内容
- 新增 `saveLockPassword()` 保存密码和备用秘钥：
  - 支持清除密码（密码和秘钥都为空时）
  - 校验密码必须为4位数字
  - 校验备用秘钥必须为4位数字（可选）

### 2. 锁屏解锁功能
- 新增 `showLockScreen()` 显示锁屏界面
- 新增 `lockInput()` 输入数字
- 新增 `lockDelete()` 删除最后一位
- 新增 `lockConfirm()` 验证密码
- 新增 `updatePinDisplay()` 更新密码点显示

### 3. 备用秘钥解锁
- 新增 `openRecoveryScreen()` 打开备用秘钥验证界面
- 新增 `closeRecoveryScreen()` 关闭备用秘钥验证界面
- 新增 `verifyRecoveryKey()` 验证备用秘钥（生日日期4位数字）

### 4. 状态管理
- `js/state.js` 新增 `lockRecoveryKey` 字段存储备用秘钥

**涉及文件：**
- `index.html` — 新增锁屏密码设置弹窗 + 锁屏界面 + 备用秘钥验证界面
- `js/lock.js` — 新增锁屏密码相关所有函数
- `js/state.js` — 新增 `lockRecoveryKey` 字段
- `css/modals.css` — 锁屏相关样式
- `css/responsive.css` — 锁屏响应式样式

---

## 2026-07-23 修改：回退深夜防护 + PWA 安装修复（跨浏览器兼容）

**为什么这样改：**
> 深夜防护效果不理想，用户反馈太丑，移除。PWA 安装在 Edge 浏览器提示「无法安装此应用」，需要修复 manifest 配置并增加跨浏览器安装指引。

### 1. 回退深夜防护
- 移除 `css/variables.css` 中所有 `.night-mode` 和 `.night-diary-tip` 样式
- 移除 `js/init.js` 中深夜检测逻辑
- 移除 `index.html` 中 `nightDiaryTip` div
- 移除 `js/utils.js` 中 `isNightTime()` 函数

### 2. PWA 安装修复
- `manifest.json` 补充 `scope`、`id`、`categories` 字段，图标路径统一加 `./` 前缀
- 侧边栏系统菜单新增「安装到桌面」按钮
- 新增 `showInstallModal()` 自动检测浏览器类型，给出对应安装指引：
  - Chrome/Edge：显示安装按钮 + `beforeinstallprompt` 一键安装
  - iOS Safari：显示「分享 → 添加到主屏幕」步骤
  - Android 其他浏览器：显示菜单安装指引
  - 其他：通用指引
- 新增 `triggerInstall()` 触发浏览器原生安装流程

**涉及文件：**
- `manifest.json` — 补充字段 + 修正路径
- `index.html` — 侧边栏新增安装按钮 + 安装弹窗 HTML
- `js/utils.js` — 新增 `showInstallModal()` + `triggerInstall()` + `beforeinstallprompt` 监听

---

## 2026-07-23 修改：PWA 安装支持

**为什么这样改：**
> 用户希望应用可以像原生 App 一样安装到手机主屏幕，支持离线使用。需要实现 PWA（渐进式 Web 应用）标准配置。

### 1. Web App Manifest
- 创建 `manifest.json`，配置应用名称、图标、背景色、主题色、显示模式
- 图标包含 8 种尺寸（72/96/128/144/152/192/384/512），全部为淡紫色占位色块
- 显示模式 `standalone`（无浏览器地址栏）

### 2. Service Worker
- 创建 `sw.js`，实现资源预缓存和离线访问
- 安装阶段缓存所有 JS/CSS/HTML/图标
- 请求策略：先查缓存，缓存没有再请求网络
- 激活时清理旧版本缓存

### 3. PWA Meta 标签
- `index.html` head 添加：`theme-color`、`apple-mobile-web-app-capable`、`apple-mobile-web-app-status-bar-style`、`apple-mobile-web-app-title`
- 添加 `<link rel="manifest">` 和 `<link rel="apple-touch-icon">`
- 底部添加 SW 注册脚本

**涉及文件：**
- `manifest.json` — 新增
- `sw.js` — 新增
- `icons/icon-*.png` — 新增（8 个尺寸的淡紫色占位图标）
- `index.html` — 新增 PWA meta 标签 + SW 注册脚本

---

**为什么这样改：**
> 深夜打开应用时用户看到待办/成就等数据容易引发焦虑，需要隐藏并给出温柔提示。手机端静心完成后因浏览器后台节流导致无弹窗无震动，需要改用更可靠的提醒方式。

### 1. 深夜防护（23:00-06:00 北京时间）
- 新增 `isNightTime()` 工具函数（`utils.js`），判断当前是否为深夜时段
- `init.js` 初始化时检测深夜，给 body 加 `.night-mode` class
- CSS 深夜模式效果：整体降低饱和度和亮度、能量栏半透明不可点击、用户徽章淡化、画廊入口淡化
- 日记页新增深夜提示文字：「🌙 现在是深夜，明天再看这条日记会更清晰」
- `index.html` 新增 `nightDiaryTip` div（默认隐藏，深夜时显示）

**涉及文件：**
- `js/utils.js` — 新增 `isNightTime()`
- `js/init.js` — 初始化时检测深夜 + 请求通知权限
- `css/variables.css` — 新增 `.night-mode` + `.night-diary-tip` 样式
- `index.html` — 日记页新增深夜提示 div

### 2. 静心手机端提醒修复
- `startAfkTimer()` 从 `setInterval` 改为 `setTimeout` 递归调用，解决浏览器后台标签页节流问题
- `pauseAfk()` 和 `recordAfkSession()` 中的 `clearInterval` 同步改为 `clearTimeout`
- 静心完成时增强提醒：
  - 震动：`navigator.vibrate([200,100,200,100,200])` 多次震动组合（比单次 200ms 更强感知）
  - 系统通知：使用 Notification API 发送通知（需用户授权）
  - 标题闪烁：document.title 在「🧘 静心完成！」和原标题间闪烁 3 次
- `init.js` 初始化时自动请求 Notification 权限

**涉及文件：**
- `js/afk.js` — 重写 `startAfkTimer()`（setTimeout 递归）+ 修改 `pauseAfk()` + 增强 `endAfk()` 完成提醒
- `js/init.js` — 请求 Notification 权限

---

**为什么这样改：**
> 编辑日记时只添加图片不写文字会因空内容校验而无法保存。手机端多选图片超限时无提示，用户不知道为什么保存不了。全部日记卡片太小气，需要加大并统一为毛玻璃质感。

### 1. 编辑日记空内容保存修复
- `saveEditDiary()` 校验从 `if (!text)` 改为 `if (!text && editDiaryImages.length === 0)`，允许只含图片的日记保存

**涉及文件：**
- `js/diary.js` — `saveEditDiary()`

### 2. 图片上传超限提示
- 新建和编辑日记的图片上传函数中，当用户选择的文件数超过剩余可添加数量时，显示 toast 提示
- 已达 3 张上限时直接拦截并提示

**涉及文件：**
- `js/diary.js` — `handleImageUpload()` + `handleEditDiaryImageUpload()`

### 3. 全部日记卡片 + 浏览卡片质感统一
- `.history-diary-card` 从 `var(--item-bg)` + 左边框改为毛玻璃质感（半透明白 + backdrop-filter blur + 白色高光边框 + 阴影）
- 全部日记弹窗内的卡片 padding 加大（14px→18px）、字号加大
- 日记浏览卡片（`.diary-viewer-card`）同步改为毛玻璃质感，min-height 加大（120px→180px）

**涉及文件：**
- `css/diary.css` — `.history-diary-card` + `#allDiariesBody .history-diary-card` + `.diary-viewer-card` 样式重写

---

**为什么这样改：**
> 日记提示框和保存按钮的视觉质感与「闪念待办」按钮不统一，需要改为玻璃质感。图片限制从 5 张改为 3 张以控制存储压力。表情列表少了一个 🤤，补回至 11 个基础表情 + 1 个添加按钮 = 12 个。

### 1. 日记提示框 + 保存按钮 UI 统一
- `.diary-prompt-box` 从 `var(--light-purple)` + 左边框改为玻璃质感（半透明紫 + backdrop-filter blur + 白色高光边框 + 阴影）
- `.btn-submit-diary` 从 `var(--main-purple)` 实色改为淡色玻璃质感（与 `.btn-add` 同风格）

**涉及文件：**
- `css/diary.css` — `.diary-prompt-box` + `.btn-submit-diary` 样式重写

### 2. 日记图片限制 5→3
- `handleImageUpload()` 和 `handleEditDiaryImageUpload()` 的 `remaining` 计算从 5 改为 3
- 上传标签显隐判断同步修改

**涉及文件：**
- `js/diary.js` — 两处 `remaining` 计算 + `renderPreviews()` 显隐判断

### 3. 表情列表补回 🤤
- `baseMoods` 数组中补回 `🤤`（之前在 07-22 修改中误删，因与 😴 语义重复，但用户要求保留）

**涉及文件：**
- `js/state.js` — `baseMoods` 数组

---

**为什么这样改：**
> 在「查看全部日记」中点击编辑按钮，编辑弹窗被全部日记弹窗遮挡，需要手动关闭才能编辑。用户希望先浏览日记再决定是否编辑，而非点击即进入编辑。同时删除按钮的 emoji 需要清理。

### 1. 全部日记弹窗编辑按钮交互修复
- 编辑按钮点击时先关闭全部日记弹窗，300ms 延迟后打开编辑弹窗
- 修复全部日记弹窗中图片未使用 IndexedDB 异步加载的问题

**涉及文件：**
- `js/diary.js` — `openAllDiaries()` 编辑按钮 onclick 改为 `closeAllDiaries();setTimeout(()=>openEditDiary(...),300)` + 新增图片懒加载

### 2. 日记浏览卡片模式（新增功能）
- 新增「日记浏览卡片」弹窗，用户点击全部日记中的条目时，先打开浏览卡片
- 浏览卡片包含：日期标题、心情 emoji、日记正文、图片（IndexedDB 异步加载）
- 左右箭头按钮切换前一篇/后一篇日记，底部显示当前页码（1/N）
- 底部有「编辑」按钮，点击关闭浏览卡片后打开编辑弹窗
- 点击弹窗外部关闭浏览卡片

**涉及文件：**
- `index.html` — 新增 `diaryViewerModal` 弹窗 HTML
- `js/diary.js` — 新增 `viewerDiaries`/`viewerIndex` 状态 + `openDiaryViewer()`/`closeDiaryViewer()`/`navigateDiary()`/`renderDiaryViewer()`/`openEditFromViewer()` 函数
- `css/diary.css` — 新增 `.diary-viewer-*` 样式（卡片、导航按钮、编辑按钮等）
- `js/init.js` — 新增 `diaryViewerModal` 点击外部关闭事件

### 3. 删除日记按钮去掉 emoji
- 编辑日记弹窗中的删除按钮从「🗑️ 删除日记」改为「删除日记」

**涉及文件：**
- `index.html` — 删除按钮文案

---

**为什么这样改：**
> 日记主页时间线显示了最近两天的日记（含昨天），用户希望只显示今天的日记。编辑日记后显示时间被覆盖为编辑时间，导致排序和显示混乱。所有日期判断需统一为北京时间（UTC+8）。

### 1. 全站日期统一为北京时间
- 新增 `getBeijingDateKey(date)` 工具函数（`utils.js`），将任意 Date 转换为北京时间日期 key（YYYY-MM-DD）
- 修改 `getTodayDateKey()` 使用北京时间，影响能量系统跨天重置、自定义表情重置等

**涉及文件：**
- `js/utils.js` — 新增 `getBeijingDateKey()`，修改 `getTodayDateKey()`

### 2. 日记主页时间线只显示今天
- `renderDiaries()` 从"最近2天"改为"今天"（北京时间 0:00 为分界）
- 提示文案从"最近两天没有日记"改为"今天还没有日记，去写一篇吧"
- 图片加载改为 IndexedDB 异步加载（与 openAllDiaries 一致）
- 日历组件、日期查看函数同步改为北京时间比较

**涉及文件：**
- `js/diary.js` — 重写 `renderDiaries()` + 修改 `renderCalendar()` + 修改 `viewDiaryByDate()`

### 3. 日记每日篇数限制改用北京时间
- `saveDiary()` 和 `updateDiaryRemain()` 的今日计数改用 `getBeijingDateKey()` 判断

**涉及文件：**
- `js/diary.js` — `saveDiary()` + `updateDiaryRemain()`

### 4. 日记编辑时间戳修复
- 编辑保存时不再覆盖 `entry.date`（原显示时间），改为新增 `entry.updatedAt` 字段记录编辑时间
- 解决编辑后日记在列表里显示时间变化但排序位置不变的混乱问题

**涉及文件：**
- `js/diary.js` — `saveEditDiary()` 不再修改 `entry.date`

---

## 2026-07-23 修改：Toast 大规模精简 + 能量 streak 删除

**为什么这样改：**
> 用户反馈提示过多过杂，大部分 toast 用户看不到变化（如"已取消完成""已重新排序"），造成视觉噪音。能量 streak 在卡片上制造焦虑感，与产品"温柔陪伴"定位冲突。决定除错误提示和重要系统反馈外，所有操作反馈 toast 全部删除。

### 1. Toast 提示系统清理
- **删除全部操作反馈 toast**（共 17 个）：
  - 能量：`已处于该能量模式`保留、`长按卡片可重置选择`删除、`✨ 免费选择（第N次）`删除
  - 待办：`✅ 待办已添加`删除、`❤️ 完成 +1`删除、`↩️ 已取消完成`删除、`📌 已重新排序`删除、`🗑️ 已删除`删除
  - 日记：`✅ 日记已更新`删除、`🗑️ 日记已删除`删除
  - 仪式：`✅ 仪式名称已更新`删除、`✅ 步骤完成！继续前行 ✦`删除、`✅ 步骤已添加`删除、`🗑️ 步骤已删除`删除、`🗑️ 已删除`删除、`🌱 仪式已创建`删除
  - 书架：`💾 已保存`删除、`🗑️ 已删除`删除
  - 静心：`⏸️ 静心已暂停`删除
- **保留的 toast**：错误提示（名称不能为空等）、重要状态反馈（静心进行中/时间到/继续、已重置、解锁成功等）、系统消息（反馈已发送、备份导入导出等）
- 新增 `showToastOnce(key, msg)` 工具函数（`utils.js`），用 `state.shownToasts` 数组追踪已引导的 toast（备用，当前未使用）
- `showToast()` 支持自定义时长参数

**涉及文件：**
- `js/state.js` — 新增 `shownToasts: []` 字段 + 兼容性初始化
- `js/utils.js` — 新增 `showToastOnce()` 函数，`showToast()` 支持自定义时长
- `js/energy.js` — 删除 2 个 toast
- `js/todo.js` — 删除 4 个 toast
- `js/routines.js` — 删除 6 个 toast
- `js/diary.js` — 删除 2 个 toast
- `js/audio.js` — 删除 2 个 toast
- `js/afk.js` — 删除 1 个 toast

### 2. 能量 streak 显示删除
- 从 `index.html` 移除 `energyStreakDisplay` div
- 从 `energy.js` 的 `selectEnergy()` 和 `updateEnergyUI()` 中移除 streak 更新逻辑
- 用户明确表示要删除此显示，减少焦虑感

**涉及文件：**
- `index.html` — 删除 `<div class="energy-streak-display">` 元素
- `js/energy.js` — 删除 `selectEnergy()` 中 streak 动画逻辑 + `updateEnergyUI()` 中 streak 更新

---

## 2026-07-22 修改：Bug 修复 + 代码清理（6项）

**为什么这样改：**
> 根据代码审查结果修复真实 bug，删除废弃功能，优化存储安全和移动端显示。

### 1. 删除待办长按完成功能
- 删除 `triggerLoveEffect()` 函数及 `longPressState` 状态管理
- `setupTodoListDelegation()` 清空为占位函数（拖拽事件已在 `renderTodos` 中绑定，无需额外委托）
- 同时删除无引用的 `toggleTodo()` 函数

**涉及文件：**
- `js/todo.js` — 删除 `triggerLoveEffect`、`toggleTodo`、`longPressState` 及 pointer events 长按逻辑（L60-L177, L367-L381, L448-L469）

### 2. AFK 静心完成弹窗改用 toast
- `alert()` → `showToast()`，保持产品内一致风格，避免破坏毛玻璃 UI 体验
- `endAfk()` 去重：`reached` 和 `!reached` 分支共享逻辑提取为 `recordAfkSession(seconds)` 独立函数
- 新增函数内对 DOM 元素访问增加空值保护（`if (timerEl)` / `if (circle)`）

**涉及文件：**
- `js/afk.js` — `endAfk` 重写 + 新增 `recordAfkSession`

### 3. saveState 加预检容量检测
- 保存前先 `JSON.stringify(state)` 估算大小，超过 4MB 主动弹出存储警告并 `return`，避免 `setItem` 中途失败导致数据丢失
- 保留原有 `QuotaExceededError` catch 作为兜底

**涉及文件：**
- `js/sidebar.js` — `saveState()` 加预检逻辑

### 4. 删除冗余 baseMoods
- `baseMoods` 中 `🤤` 与 `😴` 语义重复，保留 `😴`

**涉及文件：**
- `js/state.js` — `baseMoods` 去重

### 5. 修复手机端能量栏文字偏上不居中
- 移动端 `.energy-bar-compact` 增加 `min-height: 36px` + `justify-content: center`，限制高度使内容自然垂直居中
- 移动端 `.energy-bar-select` 增加 `height: 100%` + `min-height: 36px`，确保内部元素填满可用空间

**涉及文件：**
- `css/responsive.css` — `@media (max-width: 480px)` 段

### 6. 清理 saveState 注释
- 移除"即使存储失败也更新UI"过时注释（逻辑已改为失败时 return，UI 更新不再执行）

**涉及文件：**
- `js/sidebar.js`

---

## 2026-07-12 修改：> 加入背景图后发现 header/导航栏挡住了背景，且各组件质感不统一。沉淀室卡片、成长仪式卡片、日记按钮等需要统一为玻璃质感。成长仪式需要从紫色系改为奶油黄+金边风格。

### 1. 背景图调优
- `.app-phone::after` 覆盖层：去掉 `backdrop-filter: blur`，白色透明度 0.15（清透不模糊）
- `.app-header`：去掉 blur，背景 `rgba(255,255,255,0.45)`（半透明，背景可透出）
- `.app-navbar`：同步 header 风格，去掉 blur
- `background-position: center 18%`（花朵顶部对齐内容区）

**为什么这样改：**
> 加入背景图后发现 header/导航栏挡住了背景，且各组件质感不统一。沉淀室卡片、成长仪式卡片、日记按钮等需要统一为玻璃质感。成长仪式需要从紫色系改为奶油黄+金边风格。

### 1. 背景图调优
- `.app-phone::after` 覆盖层：去掉 `backdrop-filter: blur`，白色透明度 0.15（清透不模糊）
- `.app-header`：去掉 blur，背景 `rgba(255,255,255,0.45)`（半透明，背景可透出）
- `.app-navbar`：同步 header 风格，去掉 blur
- `background-position: center 18%`（花朵顶部对齐内容区）

### 2. 沉淀室卡片 → 玻璃质感
- `.meditation-center`：`rgba(242,238,250,0.35)` + `blur(12px)` + 白色高光边框

### 3. 成长仪式卡片 → 奶油黄玻璃 + 金边
- 背景：`rgba(250,247,240,0.55)`（奶油白微透）
- 边框：`1.5px solid #d4a830`（金色实线勾边）
- 毛玻璃：`backdrop-filter: blur(12px)`
- 高光：`inset 0 1px 0 rgba(255,255,255,0.8)`
- 创建按钮：同步奶油黄玻璃风格，hover 变深金 `rgba(212,168,48,0.45)`

### 4. 仪式输入框 → [输入框][+] 布局
- 和待办输入框统一：左侧输入框 + 右侧 [+] 按钮
- 输入框描边：金色（`rgba(212,168,48,0.35)`，聚焦 `rgba(212,168,48,0.6)`）
- [+] 按钮：金色玻璃（`rgba(218,175,52,0.45)` + 金色边框）
- 去掉 `padding-left: 34px`

### 5. 仪式奖励胶囊
- 去掉 ⚡ emoji，只保留 "+10 能量"

### 6. 「查看全部日记」按钮 → 玻璃质感
- 内联样式改为 `rgba(255,255,255,0.45)` + `blur(10px)` + 白色高光边框

### 7. 手机端今日能量位置
- `.energy-bar-compact` 加 `margin-top: 8px`（不贴着 header）

### 8. 空状态提示删除
- 待办"暂无待办，去添加一条吧" → 移除
- 仪式"还没有成长仪式，创建一条吧" → 移除

**涉及文件：**
- `css/base.css` — `::after` 去 blur、header/navbar 透明度调整、`background-position`
- `css/diary.css` — `.meditation-center` 玻璃质感 + 「查看全部日记」按钮
- `css/routine.css` — 卡片奶油黄玻璃 + 金边 + 创建按钮 + 输入框布局 + [+] 按钮金色 + 奖励胶囊去 ⚡
- `css/sidebar.css` — 导航栏去 blur
- `css/responsive.css` — 手机端能量栏 margin-top
- `css/todo.css` — [+] 按钮加深
- `js/routines.js` — 输入框顺序 [input][+] + 奖励胶囊去 ⚡
- `js/todo.js` — 空状态移除

---

**为什么这样改：**
> 选择能量后只有文案和按钮变色，缺乏沉浸感。新增全屏天气动画特效，让每个能量状态有独特的视觉氛围。同时加入鸢尾花背景图提升整体质感。

**背景图：**
- `assets/IRIS.jpg`（Procreate 导出 JPG，860px 宽 Retina）
- `.app-phone` 添加 `background-size: cover; background-position: center`

**天气特效设计：**

| 能量 | 天气 | 动画效果 |
|------|------|---------|
| 充沛 | 朝阳 | 左上角 45° 金黄色径向渐变光晕，4s 周期脉动闪动（scale 1→1.05，opacity 0.7→1） |
| 温和 | 多云 | 2 朵主云 + 1 朵小云，蓝灰色椭圆 + blur(8-12px)，12-18s 周期水平漂移 |
| 休息 | 夜雨 | 双层雨丝（疏+密），`repeating-linear-gradient` 生成细线，0.8s/1.1s 不同速度下落 |

**技术实现：**
- `.weather-effects` 容器：`position: absolute; inset: 0; z-index: 0; pointer-events: none`
- 效果层在所有组件之下，毛玻璃组件透出天气若隐若现
- 纯 CSS 动画（`@keyframes`），零 JS 开销
- 三套 class：`.weather-sunrise` / `.weather-cloudy` / `.weather-rain`
- 多云额外用 JS 插入 `.cloud-extra` 元素（CSS 伪元素只有 2 个不够用）

**JS 逻辑：**
- 新增 `updateWeatherEffect(mode)` 辅助函数
- `selectEnergy()` → 选中时显示对应天气
- `resetEnergySelection()` → 重置时清除天气
- `updateEnergyUI()` → 刷新页面时恢复天气
- `checkEnergySelectionReset()` → 跨天重置时清除天气
- `init.js` → 初始化时恢复/清除天气

**涉及文件：**
- `assets/IRIS.jpg` — 鸢尾花背景图（新增）
- `index.html` — `.app-phone` 内新增 `<div class="weather-effects">` 容器
- `css/base.css` — `.app-phone` 添加 `background-image` + `background-size`
- `css/energy.css` — 新增 `.weather-effects` 基础样式 + `.weather-sunrise` / `.weather-cloudy` / `.weather-rain` 三套动画 + `@keyframes`
- `js/energy.js` — 新增 `updateWeatherEffect()` 函数 + 在 `selectEnergy` / `resetEnergySelection` / `updateEnergyUI` / `checkEnergySelectionReset` 中调用
- `js/init.js` — 初始化时调用 `updateWeatherEffect()`

---

## 2026-07-12 修改：能量长按星星 — 布局修复 + 颜色跟随状态

**为什么这样改：**
> 长按能量卡片时星星不出来（被 `overflow: hidden` 裁掉），且星星颜色固定为紫色，不随能量状态变化。

**修复内容：**

### 1. 容器布局重构
- `.energy-bar-compact` 改为 `flex-direction: column`（纵向排列卡片+星星）
- 去掉 `overflow: hidden`（之前裁掉了 `.press-stars`）
- `.energy-bar-card` 的 `margin-bottom` 从 12px 收到 4px（卡片和星星间距收紧）

### 2. CSS 选择器精简
- 删除冗余的 `.pressing + .press-stars`（不匹配 DOM 结构）
- 只保留 `.energy-bar-card.pressing ~ .press-stars`（兄弟选择器，正确匹配）

### 3. 星星颜色跟随能量状态
| 能量 | filled 颜色 | 光晕 |
|------|------------|------|
| 充沛 | `#d4a017`（金色） | `rgba(212,160,23,0.5)` |
| 温和 | `#5a9bb5`（蓝色） | `rgba(90,155,181,0.5)` |
| 休息 | `#9a7cb8`（紫色） | `rgba(154,124,184,0.5)` |

通过 `.energy-bar-card.show.state-high/low/rest .press-star.filled` 父级状态选择器实现。

### 4. 手机端响应式
- `≤480px`：星星间距 16px（原 24px），字号 0.9rem（原 1.1rem）

**动画流程（不变）：**
1. 按下 → 星星容器出现（四颗空心 ✧）
2. 每 150ms 亮一颗：✧ → ✦（放大 1.2x + 状态色光晕）
3. 550ms 后第四颗亮起，触发重置
4. 星星依次缩小淡出（每颗间隔 60ms），然后复位

**涉及文件：**
- `css/energy.css` — `.energy-bar-compact` 改 column + 去 overflow；`.press-star.filled` 按状态分色；选择器精简
- `css/responsive.css` — `≤480px` 星星间距/字号缩小

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
