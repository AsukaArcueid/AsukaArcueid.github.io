// --- 路由系统：无闪烁切换 ---
function initRouting() {
    const hash = window.location.hash;
    const screens = {
        home: document.getElementById('home-screen'),
        projects: document.getElementById('projects-screen'),
        resources: document.getElementById('resources-screen')
    };

    // 1. 先清除所有屏幕的激活类
    Object.values(screens).forEach(s => s?.classList.remove('active-screen'));

    // 2. 匹配路由
    if (hash === '#projects') {
        screens.projects.classList.add('active-screen');
        renderProjects();
        document.title = "AsukaArcueid | Projects";
    } 
    else if (hash === '#resources') {
        screens.resources.classList.add('active-screen');
        renderFilterBar(); // 仅在进入资源页时生成按钮
        filterResources('All');
        document.title = "AsukaArcueid | Resources";
    } 
    else {
        screens.home.classList.add('active-screen');
        document.title = "AsukaArcueid";
    }
}

// 统一导航接口
function navigate(target) {
    if (target === '') {
        // 使用 replaceState 干净地回主页，不留一闪而过的历史记录
        history.replaceState(null, null, window.location.pathname);
        initRouting();
    } else {
        window.location.hash = target;
    }
}

window.addEventListener('hashchange', initRouting);
document.addEventListener('DOMContentLoaded', initRouting);

// --- 渲染项目 (含悬停预览) ---
function renderProjects() {
    const grid = document.getElementById('projectGrid');
    if(!grid) return;
    grid.innerHTML = PROJECT_DB.map(p => `
        <div class="project-card" onclick="location.href='detail.html?id=${p.id}'">
            <h3>${p.title}</h3>
            <p>${p.intro}</p>
            <div class="project-content-preview">
                <strong>技术细节：</strong><br>
                ${p.summary}
            </div>
        </div>
    `).join('');
}

// --- 资源逻辑 (动态分类) ---
function renderFilterBar() {
    const bar = document.getElementById('filterBar');
    if (!bar || bar.children.length > 0) return; // 避免重复创建按钮
    
    // 自动从 DB 提取所有分类并去重
    const categories = ['All', ...new Set(RESOURCE_DB.map(r => r.category))];
    bar.innerHTML = categories.map(cat => `
        <button class="filter-item" data-cat="${cat}" onclick="filterResources('${cat}')">
            ${cat === 'All' ? '全部' : cat}
        </button>
    `).join('');
}

function filterResources(category) {
    // 切换按钮高亮
    document.querySelectorAll('.filter-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-cat') === category);
    });
    
    const grid = document.getElementById('resourceGrid');
    const filtered = category === 'All' ? RESOURCE_DB : RESOURCE_DB.filter(r => r.category === category);
    
    grid.innerHTML = filtered.map(r => `
        <div class="project-card" onclick="openModal(${r.id})">
            <h3>${r.title}</h3>
            <p>${r.intro}</p>
        </div>
    `).join('');
}

// --- 弹窗控制 ---
function openModal(id) {
    const item = RESOURCE_DB.find(r => r.id === id);
    if (!item) return;
    document.getElementById('modal-title').innerText = item.title;
    document.getElementById('modal-body').innerText = item.detail;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}