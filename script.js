// --- 路由逻辑 ---
function initRouting() {
    const home = document.getElementById('home-screen');
    const projects = document.getElementById('projects-screen');
    const resources = document.getElementById('resources-screen');
    const hash = window.location.hash;

    [home, projects, resources].forEach(s => s?.classList.add('hidden'));

    if (hash === '#projects') {
        projects.classList.remove('hidden');
        renderProjects();
        document.title = "AsukaArcueid | Projects";
    } else if (hash === '#resources') {
        resources.classList.remove('hidden');
        renderFilterBar(); // 先生成按钮
        filterResources('All'); // 再渲染卡片
        document.title = "AsukaArcueid | Resources";
    } else {
        home.classList.remove('hidden');
        document.title = "AsukaArcueid";
    }
}

window.addEventListener('hashchange', initRouting);
window.addEventListener('load', initRouting);

function showProjects() { window.location.hash = 'projects'; }
function showResources() { window.location.hash = 'resources'; }
function backToHome() {
    history.replaceState(null, null, ' ');
    initRouting();
}

// --- 项目渲染 ---
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

function navigateToDetail(id) {
    window.location.href = `detail.html?id=${id}`;
}

// --- 资源渲染与自动分类生成 ---

// 1. 动态生成分类按钮
function renderFilterBar() {
    const bar = document.getElementById('filterBar');
    if (!bar) return;

    // 获取所有唯一分类
    const categories = ['All', ...new Set(RESOURCE_DB.map(r => r.category))];
    
    bar.innerHTML = categories.map(cat => {
        const label = cat === 'All' ? '全部' : cat;
        return `<button class="filter-item" data-cat="${cat}" onclick="filterResources('${cat}')">${label}</button>`;
    }).join('');
}

// 2. 过滤并显示资源卡片
function filterResources(category) {
    // 更新按钮激活状态
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

// --- 弹窗逻辑 ---
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