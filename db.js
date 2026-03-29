// db.js - 数据索引表

// 项目数据
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