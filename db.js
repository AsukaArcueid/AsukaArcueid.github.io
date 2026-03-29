// db.js - 项目索引表
const PROJECT_DB = [
    { 
        id: 1, 
        title: "Amadeus", 
        date: "2026-03-29",
        intro: "命运石之门中的人工智能Amadeus", 
        summary: "利用对Qwen3-4B进行sft、RL以及agent框架实现一个Amadeus的效果",
        path: "posts/Amadeus.md" // Markdown 文件的相对路径
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

function getProjectById(id) {
    return PROJECT_DB.find(p => p.id == id);
}