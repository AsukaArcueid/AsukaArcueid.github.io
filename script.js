// --- 全局状态 ---
let clockInterval = null;
let barrageInterval = null;
let lastBulletTop = -100; // 上一个弹幕的顶部位置（百分比）
let barrageIndex = 0;     // 弹幕文案轮询下标

// --- 状态栏时钟 ---
function updateClock() {
    const now = new Date();
    const el = document.getElementById('clock');
    if (el) {
        el.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }
}
function startClock() {
    if (clockInterval) return;
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}
function stopClock() {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }
}

// --- 弹幕系统 ---
function createBullet() {
    const container = document.getElementById('barrage-container');
    if (!container) return;

    const text = BARRAGE_DB[barrageIndex % BARRAGE_DB.length];
    barrageIndex++;
    const bullet = document.createElement('div');
    bullet.className = 'barrage-bullet';
    bullet.textContent = text;

    const fontSizeRem =
        CONFIG.barrageFontSizeRange.min +
        Math.random() * (CONFIG.barrageFontSizeRange.max - CONFIG.barrageFontSizeRange.min);
    const durationSec =
        CONFIG.barrageSpeedRange.min +
        Math.random() * (CONFIG.barrageSpeedRange.max - CONFIG.barrageSpeedRange.min);
    const topPercent = 10 + Math.random() * 80;

    // 高度差太小则跳过本次生成
    if (Math.abs(topPercent - lastBulletTop) < 15) return;
    lastBulletTop = topPercent;

    bullet.style.fontSize = `${fontSizeRem}rem`;
    bullet.style.top = `${topPercent}%`;
    bullet.style.opacity = CONFIG.barrageOpacity;
    bullet.style.animationDuration = `${durationSec}s`;

    container.appendChild(bullet);
    bullet.addEventListener('animationend', () => bullet.remove());
}
function startBarrage() {
    if (barrageInterval) return;
    // 清除页面隐藏期间残留的弹幕（动画暂停，animationend 未触发）
    const container = document.getElementById('barrage-container');
    if (container) container.innerHTML = '';
    createBullet();
    barrageInterval = setInterval(createBullet, CONFIG.barrageSpawnRate);
}
function stopBarrage() {
    if (barrageInterval) {
        clearInterval(barrageInterval);
        barrageInterval = null;
    }
}

// --- 路由系统：无闪烁切换 ---
function initRouting() {
    const hash = window.location.hash;
    const screens = {
        home:     document.getElementById('home-screen'),
        projects: document.getElementById('projects-screen'),
        resources:document.getElementById('resources-screen'),
        about:    document.getElementById('about-screen'),
    };

    // 1. 先清除所有屏幕的激活类
    Object.values(screens).forEach(s => s?.classList.remove('active-screen'));

    // 2. 匹配路由
    if (hash === '#projects') {
        screens.projects.classList.add('active-screen');
        renderProjects();
        document.title = "AsukaArcueid | Projects";
        stopClock();
        stopBarrage();
        document.getElementById('status-bar').style.display = 'none';
    }
    else if (hash === '#resources') {
        screens.resources.classList.add('active-screen');
        renderFilterBar();
        filterResources('All');
        document.title = "AsukaArcueid | Resources";
        stopClock();
        stopBarrage();
        document.getElementById('status-bar').style.display = 'none';
    }
    else if (hash === '#about') {
        screens.about.classList.add('active-screen');
        document.title = "AsukaArcueid | About";
        stopClock();
        stopBarrage();
        document.getElementById('status-bar').style.display = 'none';
        renderOrbitSatellites();
    }
    else {
        screens.home.classList.add('active-screen');
        document.title = "AsukaArcueid";
        startClock();
        startBarrage();
        document.getElementById('status-bar').style.display = 'flex';
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

// 页面可见性变化时暂停/恢复弹幕，防止切回来后积攒的定时器一起爆发
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopBarrage();
    } else if (window.location.hash === '' || window.location.hash === '#' || !window.location.hash) {
        // 仅在主页可见时，等待1秒后再重启弹幕
        setTimeout(startBarrage, 300);
    }
});

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
function renderOrbitSatellites() {
    const container = document.getElementById('orbitContainer');
    if (!container) return;

    // 清除旧卫星
    container.querySelectorAll('.satellite-group').forEach(s => s.remove());

    const total = HEADING_DB.length;
    if (total === 0) return;

    // --- 全局配置 ---
    const globalDuration = 30; // 统一角速度：30秒转一圈
    const angleStep = 360 / total; // 全局平分角度：所有卫星间距一致

    const innerCount = total <= 3 ? total : Math.floor(total * 0.4);
    const orbitConfigs = [
        { count: innerCount, radius: 188, className: 'orbit-ring-1' },
        { count: total - innerCount, radius: 248, className: 'orbit-ring-2' }
    ];

    let globalIndex = 0; // 使用全局索引来计算角度

    orbitConfigs.forEach((config) => {
        const { count, className } = config;
        
        for (let i = 0; i < count; i++) {
            const heading = HEADING_DB[globalIndex];
            if (!heading) break;

            // 核心修改：基于全局索引计算角度，确保所有卫星平分 360 度
            const currentAngle = globalIndex * angleStep;

            // 计算动画延迟（实现相同的角速度）
            const startDelay = (currentAngle / 360) * globalDuration;

            const group = document.createElement('div');
            group.className = 'satellite-group';
            group.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                animation: orbit-${className} ${globalDuration}s linear infinite;
                animation-delay: -${startDelay}s;
            `;

            const sat = document.createElement('div');
            sat.className = 'satellite';
            sat.style.cssText = `
                background: rgba(225, 242, 255, 0.4); 
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                box-shadow: 0 4px 15px rgba(255, 255, 255, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.6);
            `;

            const label = document.createElement('div');
            label.className = 'satellite-label';
            label.textContent = heading;
            label.style.color = '#74c0fc'; 
            label.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.8)';

            sat.appendChild(label);
            group.appendChild(sat);
            container.appendChild(group);

            globalIndex++; // 递增全局索引
        }
    });
}