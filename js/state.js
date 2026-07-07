// ============================================================
//  STATE
// ============================================================
let state = JSON.parse(localStorage.getItem('IrisState')) || {
    todos: [],
    routines: [],
    diaries: [],
    afkSessions: [],
    currentAfk: null,
    unlockedAchievements: {},
    stats: {
        todoCount: 0,
        studyCount: 0,
        workCount: 0,
        sportCount: 0,
        readCount: 0,
        diaryCount: 0,
        afkCount: 0,
        bookCount: 0,
        achievementExp: 0,
        signinExp: 0
    },
    books: [],
    afkTimerSeconds: 0,
    theme: 'light',
    selectedMood: null,
    userName: '旅者',
    userId: 'LQ-0001',
    avatar: null,
    lockPassword: '',
    pet: null,
    ownedPets: [],
    ownedDecorations: [],
    equippedDecoration: null,
    isFirstLaunch: true,
    customMoods: [],
    customMoodsDate: null,
    petData: [],
    totalMeditationSecs: 0,
    settings: { sound: true },
    energyMode: null,
    energyHistory: {},
    energyStreak: 0,
    lastEnergyDate: null,
    hiddenTodoIds: [],
    energySpends: [],
    shopItems: [],
    afkPresetMinutes: 25,
    editingBookId: null,
    meditationRecords: [],
    energySwitchCount: 0,
    energySwitchDate: null,
    routineFoldState: {},
    energySelectionCount: 0,
    energySelectionDate: null
};

const DEFAULT_SHOP_ITEMS = [
    {
        id: 'pet_cat', type: 'pet', emoji: '🐱', name: '小猫咪', price: 30, requiredAchievement: null,
        unlocked: false
    },
    {
        id: 'pet_dog', type: 'pet', emoji: '🐶', name: '小狗狗', price: 40, requiredAchievement: null,
        unlocked: false
    },
    {
        id: 'pet_rabbit', type: 'pet', emoji: '🐰', name: '小兔', price: 50, requiredAchievement: 'diary_5',
        unlocked: false
    },
    {
        id: 'pet_fox', type: 'pet', emoji: '🦊', name: '小狐狸', price: 60, requiredAchievement: 'study_5',
        unlocked: false
    },
    {
        id: 'pet_panda', type: 'pet', emoji: '🐼', name: '熊猫', price: 80, requiredAchievement: 'todo_10',
        unlocked: false
    },
    {
        id: 'deco_crown', type: 'decoration', emoji: '👑', name: '皇冠', price: 50, requiredAchievement: null,
        unlocked: false
    },
    {
        id: 'deco_hat', type: 'decoration', emoji: '🎩', name: '礼帽', price: 30, requiredAchievement: null,
        unlocked: false
    },
    {
        id: 'deco_glasses', type: 'decoration', emoji: '🕶️', name: '墨镜', price: 40,
        requiredAchievement: 'sport_5', unlocked: false
    },
    {
        id: 'deco_scarf', type: 'decoration', emoji: '🧣', name: '围巾', price: 35, requiredAchievement: null,
        unlocked: false
    },
    {
        id: 'deco_flower', type: 'decoration', emoji: '🌺', name: '花环', price: 45,
        requiredAchievement: 'diary_10', unlocked: false
    },
    {
        id: 'deco_diamond', type: 'decoration', emoji: '💎', name: '钻石', price: 100,
        requiredAchievement: 'all_rounder', unlocked: false
    },
];

if (!state.shopItems || state.shopItems.length === 0) {
    state.shopItems = DEFAULT_SHOP_ITEMS;
} else {
    DEFAULT_SHOP_ITEMS.forEach(item => {
        if (!state.shopItems.find(i => i.id === item.id)) {
            state.shopItems.push(item);
        }
    });
}

['todoCount', 'studyCount', 'workCount', 'sportCount', 'readCount', 'diaryCount', 'afkCount', 'bookCount',
    'achievementExp', 'signinExp'
].forEach(k => {
    if (state.stats[k] === undefined) state.stats[k] = 0;
});
if (!state.ownedPets) state.ownedPets = [];
if (!state.customMoods) state.customMoods = [];
if (!state.ownedDecorations) state.ownedDecorations = [];
if (!state.dailyTodoExp) state.dailyTodoExp = {};
if (!state.settings) state.settings = { sound: true };
if (!state.totalMeditationSecs) state.totalMeditationSecs = 0;
if (!state.energyHistory) state.energyHistory = {};
if (!state.hiddenTodoIds) state.hiddenTodoIds = [];
if (!state.energySpends) state.energySpends = [];
if (!state.meditationRecords) state.meditationRecords = [];
if (state.energySwitchCount === undefined) state.energySwitchCount = 0;
if (!state.energySwitchDate) state.energySwitchDate = null;
if (!state.customMoodsDate) state.customMoodsDate = null;
if (!state.routineFoldState) state.routineFoldState = {};
if (state.energySelectionCount === undefined) state.energySelectionCount = 0;
if (!state.energySelectionDate) state.energySelectionDate = null;

const defaultPetData = [
    { emoji: '🐱', name: '小猫', rarity: 'common', requiredExp: 0, requiredAchievements: [] },
    { emoji: '🐶', name: '小狗', rarity: 'common', requiredExp: 0, requiredAchievements: [] },
    { emoji: '🐰', name: '兔子', rarity: 'common', requiredExp: 10, requiredAchievements: [] },
    { emoji: '🐻', name: '小熊', rarity: 'common', requiredExp: 20, requiredAchievements: [] },
    { emoji: '🐼', name: '熊猫', rarity: 'rare', requiredExp: 50, requiredAchievements: ['todo_10'] },
    { emoji: '🦊', name: '狐狸', rarity: 'rare', requiredExp: 60, requiredAchievements: ['diary_5'] },
    { emoji: '🐨', name: '考拉', rarity: 'rare', requiredExp: 70, requiredAchievements: ['study_5'] },
    {
        emoji: '🐯', name: '老虎', rarity: 'epic', requiredExp: 150, requiredAchievements: ['todo_20',
            'study_10'
        ]
    },
    {
        emoji: '🦁', name: '狮子', rarity: 'epic', requiredExp: 200, requiredAchievements: ['work_10',
            'sport_10'
        ]
    },
    { emoji: '🐷', name: '小猪', rarity: 'common', requiredExp: 25, requiredAchievements: [] },
    { emoji: '🐵', name: '猴子', rarity: 'rare', requiredExp: 80, requiredAchievements: ['read_5'] },
    { emoji: '🐔', name: '小鸡', rarity: 'common', requiredExp: 5, requiredAchievements: [] },
    { emoji: '🐧', name: '企鹅', rarity: 'rare', requiredExp: 90, requiredAchievements: ['afk_5m'] },
    { emoji: '🐦', name: '小鸟', rarity: 'common', requiredExp: 8, requiredAchievements: [] },
    { emoji: '🐤', name: '小鸭', rarity: 'common', requiredExp: 12, requiredAchievements: [] },
    { emoji: '🐣', name: '小鸡仔', rarity: 'common', requiredExp: 3, requiredAchievements: [] },
    {
        emoji: '🐺', name: '狼', rarity: 'epic', requiredExp: 180, requiredAchievements: ['todo_30',
            'work_20'
        ]
    },
    { emoji: '🐴', name: '马', rarity: 'rare', requiredExp: 100, requiredAchievements: ['sport_10'] },
    {
        emoji: '🦄', name: '独角兽', rarity: 'legendary', requiredExp: 500, requiredAchievements: [
            'all_rounder', 'diary_10'
        ]
    },
    { emoji: '🐝', name: '蜜蜂', rarity: 'common', requiredExp: 6, requiredAchievements: [] },
    { emoji: '🐞', name: '瓢虫', rarity: 'common', requiredExp: 4, requiredAchievements: [] },
    { emoji: '🐙', name: '章鱼', rarity: 'rare', requiredExp: 110, requiredAchievements: ['study_10'] },
    { emoji: '🦋', name: '蝴蝶', rarity: 'common', requiredExp: 18, requiredAchievements: [] },
    { emoji: '🐢', name: '乌龟', rarity: 'common', requiredExp: 30, requiredAchievements: [] },
    {
        emoji: '🐳', name: '鲸鱼', rarity: 'epic', requiredExp: 250, requiredAchievements: ['afk_10m',
            'diary_20'
        ]
    },
    { emoji: '🐬', name: '海豚', rarity: 'rare', requiredExp: 120, requiredAchievements: ['work_10'] },
    { emoji: '🐟', name: '鱼', rarity: 'common', requiredExp: 2, requiredAchievements: [] },
    { emoji: '🐠', name: '热带鱼', rarity: 'common', requiredExp: 8, requiredAchievements: [] },
    {
        emoji: '🦈', name: '鲨鱼', rarity: 'epic', requiredExp: 220, requiredAchievements: ['sport_20',
            'todo_50'
        ]
    },
    { emoji: '🐚', name: '贝壳', rarity: 'common', requiredExp: 1, requiredAchievements: [] },
    { emoji: '🐌', name: '蜗牛', rarity: 'common', requiredExp: 4, requiredAchievements: [] },
    { emoji: '🐜', name: '蚂蚁', rarity: 'common', requiredExp: 2, requiredAchievements: [] }
];
if (!state.petData || state.petData.length === 0) {
    state.petData = defaultPetData;
} else {
    state.petData = state.petData.filter(p => !['🐮', '🐛', '🐡'].includes(p.emoji));
    if (state.petData.length === 0) state.petData = defaultPetData;
}

if (state.isFirstLaunch === undefined) state.isFirstLaunch = true;
if (state.afkPresetMinutes === undefined) state.afkPresetMinutes = 25;

const baseMoods = ['☺️', '😥', '🙄', '😋', '🤕', '😎', '😭', '🤤', '🥰', '🥺', '🤤'];

function getMoodEmojis() {
    return [...baseMoods, ...state.customMoods];
}

let afkInterval = null;
let editDiaryId = null;
let readerTimerInterval = null;
let readerSeconds = 0;
let readerIsTiming = false;
let currentReaderBookId = null;
let diaryCalendarYear = new Date().getFullYear();
let diaryCalendarMonth = new Date().getMonth();

const WARM_PROMPTS = [
    '今天有没有哪一刻，让你觉得世界很温柔？',
    '今天你对自己最满意的一个小决定是什么？',
    '今天有没有听到一首让你特别喜欢的歌？',
    '今天有没有突然觉得自己其实很厉害？',
    '今天有什么特别想吐槽的人或事情吗？',
    '今天在网上刷到什么有意思的观点啦？',
    '今天有没有被别人不经意的一句话暖到？',
    '今天有没有做什么事，让你觉得「这才是我」？',
    '今天有没有一个瞬间，让你想对过去的自己说声谢谢？',
    '如果今天是一首歌，它的副歌会是什么？',
];
