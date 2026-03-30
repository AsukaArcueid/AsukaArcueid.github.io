// db.js - 数据索引表

// === 全局配置 ===
const CONFIG = {
    // 状态栏
    statusBarFontSize: '0.75rem',
    statusBarLocation: '31.2397° N, 121.4998° E',  // 东方明珠塔

    // 弹幕系统
    barrageSpawnRate: 800,            // 每次生成间隔 (ms)
    barrageOpacity: 0.2,               // 弹幕透明度 0-1
    barrageFontSizeRange: { min: 0.9, max: 1.5 },   // rem
    barrageSpeedRange: { min: 10, max: 13 },           // 动画时长 (秒)
};

// 弹幕文案库
const BARRAGE_DB = [
    'Hello World',
    '欢迎来到我的主页',
    'AsukaArcueid',
    '木叶飞舞之处，火亦生生不息',
    '⼈的梦想，是不会终结的',
    'A.T.Field就是任何人都拥有的心之壁',
    'System Ready',
    '我们所经历的每个平凡的日常，也许就是连续发生的奇迹',
    "今天的风儿甚是喧嚣",
    '奇迹是发生以后才会显现出其价值所在的东西',
    '莱纳，你坐啊',
    '自己来选择，不会后悔的道路',
    '这个世界是如此的残酷，却又如此的美丽',
    '愿望终究是从生命中诞生的',
    '如果我不曾见过太阳',
    '愿你的旅程充满诅咒和祝福',
    '那不是很有趣吗？那不到百分之一的時光，改变了你',
    '拼命累积起来的东西，绝对不会背叛自己',
    '努力的家伙都是战士',
    '将不可能化为可能，才算是一级魔法使',
    '人生不是为了度过而是为了体验',
    '即使面临困难，也请相信自己的力量',
    '错的不是我，而是这个世界',
    '人类，是追寻幸福的存在',
    '我，毁灭了世界，又……重建了世界',
    '你不是一个人，我们是共犯',
    '海贼王，我当定了！',
    '背后的伤是剑士的耻辱',
    '拼上剑与心，完成战斗的人生，这就是我找到的答案',
    '创造时代的并不是“刀”，而是使用刀的“人”',
    '你知道刀是需要刀鞘的吗?',
    '奇迹不是免费的，如果你祈求了希望，也会散播出同等的绝望',
    '跟我签订契约，成为魔法少女吧！'
];

// === 项目数据 ===
const PROJECT_DB = [
    { 
        id: 1, 
        title: "Amadeus", 
        date: "2026-03-29",
        intro: "命运石之门中的人工智能Amadeus", 
        summary: "利用对Qwen3-4B进行sft、RL以及agent框架实现一个Amadeus的效果",
        path: "posts/Amadeus.md"
    },
    { 
        id: 2, 
        title: "Blog Agent", 
        date: "2026-02-15",
        intro: "根据idea自动写博客的agent项目", 
        summary: "基于openhands sdk等完成的自动化博客撰写系统",
        path: "posts/blog-agent.md"
    }
];

// 资源数据 (新增)
const RESOURCE_DB = [
    { 
        id: 1, 
        category: "机器学习", 
        title: "CS229", 
        intro: "吴恩达的机器学习课程", 
        detail: "十分不错的机器学习课程，很适合作为第一门ML/DL课程。可以体会到数学和直觉共同作用的美感。课程视频可在B站找到，GitHub上有配套作业。" 
    },
    { 
        id: 2, 
        category: "深度学习", 
        title: "动手学深度学习", 
        intro: "李沐等人编著的一本深度学习入门书籍", 
        detail: "这本书介绍了许多基础的模型，适合作为深度学习入门书籍。本书有线上版在https://zh.d2l.ai/index.html" 
    },
    { 
        id: 3, 
        category: "深度学习", 
        title: "台大李宏毅《深度学习》课程", 
        intro: "李宏毅的深度学习课程", 
        detail: "这门课程以通俗易懂的语言介绍了深度学习中的一些概念，我做为查缺补漏使用。B站上有课程视频https://www.bilibili.com/video/BV1m3411p7wD?p=1&vd_source=7adf6814fd3724fd9ef9cd3ef1b2ee58" 
    },
    { 
        id: 4, 
        category: "Agent", 
        title: "Hello-Agents", 
        intro: "Datawhale的一个Agent教学项目", 
        detail: "夯中夯。介绍了Agent相关的很多内容，同时有详细的代码实现。带你手搓基本的Agent框架。项目文件在https://github.com/datawhalechina/hello-agents" 
    },
    {
        id: 5, 
        category: "Agent", 
        title: "OpenHands SDK", 
        intro: "OpenHands SDK的官方文档", 
        detail: "OpenHands SDK提供了tool、mcp、skill、subagent等多种功能的封装，可以用它简单地实现功能完善的Agent。官方文档在https://docs.openhands.dev/sdk" 
    }
];

function getProjectById(id) {
    return PROJECT_DB.find(p => p.id == id);
}