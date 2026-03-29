// --- 核心逻辑：防闪烁路由 ---
function initRouting() {
    const home = document.getElementById('home-screen');
    const projects = document.getElementById('projects-screen');
    
    // 小技巧：暂时关闭 CSS 动画，防止切换时出现“渐变闪烁”
    if (home) home.style.transition = 'none';
    if (projects) projects.style.transition = 'none';

    // 根据网址是否有 #projects 决定显示哪一页
    if (window.location.hash === '#projects') {
        if (home) home.classList.add('hidden');
        if (projects) projects.classList.remove('hidden');
        renderProjects();
        // 关键点：进入项目页时的标题
        document.title = "AsukaArcueid | Projects";
    } else {
        if (home) home.classList.remove('hidden');
        if (projects) projects.classList.add('hidden');
        // 关键点：主页封面时的标题
        document.title = "AsukaArcueid";
    }

    // 强制浏览器重绘，然后恢复动画
    if (home) {
        void home.offsetWidth;
        home.style.transition = '';
    }
    if (projects) {
        projects.style.transition = '';
    }
}

// 脚本加载后立即执行一次路由检查
initRouting();
// 监听浏览器前进/后退/hash变化
window.addEventListener('hashchange', initRouting);


// --- 原有逻辑完美保留 ---

// 页面切换
function showProjects() {
    // 改写 Hash 会自动触发 initRouting，从而改变标题
    window.location.hash = 'projects'; 
}

function backToHome() {
    // 清除 Hash 标记
    history.replaceState(null, null, ' '); 
    // 手动触发更新回主页状态
    initRouting(); 
}

// 动态渲染：使用来自 db.js 的数据 (保持不变)
function renderProjects() {
    const grid = document.getElementById('projectGrid');
    if(!grid) return;
    
    grid.innerHTML = PROJECT_DB.map(p => `
        <div class="project-card" onclick="navigateToDetail(${p.id})">
            <h3>${p.title}</h3>
            <p>${p.intro}</p>
            <div class="project-content-preview">
                <strong>技术细节：</strong><br>
                ${p.summary}
            </div>
        </div>
    `).join('');
}

// 跳转逻辑 (保持不变)
function navigateToDetail(id) {
    window.location.href = `detail.html?id=${id}`;
}