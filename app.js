// App State
const state = {
    currentLang: localStorage.getItem('talentOS_lang') || 'en',
    isChatOpen: window.innerWidth > 1024,
    isSidebarOpen: false
};

// Localization Engine
function updateLanguage() {
    const lang = state.currentLang;
    const dictionary = translations[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dictionary[key]) el.textContent = dictionary[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dictionary[key]) el.placeholder = dictionary[key];
    });

    const langToggleBtn = document.getElementById('currentLang');
    if (langToggleBtn) langToggleBtn.textContent = lang.toUpperCase();

    localStorage.setItem('talentOS_lang', lang);
    document.documentElement.lang = lang;
}

// 🎯 Funnel Filter Logic
function filterCandidates(layer) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        row.style.opacity = '0';
        setTimeout(() => {
            if (layer === 'total') {
                row.style.display = 'table-row';
                row.style.opacity = '1';
            } else if (layer === 'shortlist') {
                const index = Array.from(rows).indexOf(row);
                row.style.display = index < 2 ? 'table-row' : 'none';
                row.style.opacity = index < 2 ? '1' : '0';
            } else {
                row.style.display = 'table-row';
                row.style.opacity = '1';
            }
        }, 300);
    });
    showToast(state.currentLang === 'en' ? `Filtered: ${layer.toUpperCase()}` : `Đã lọc: ${layer.toUpperCase()}`);
}

// 📱 Mobile Sidebar Toggle
function toggleSidebar() {
    state.isSidebarOpen = !state.isSidebarOpen;
    const sidebar = document.getElementById('sidebarLeft');
    if (sidebar) {
        sidebar.style.transform = state.isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)';
    }
}

// 🤖 AI Sidebar Logic
function toggleChat() {
    state.isChatOpen = !state.isChatOpen;
    const sidebar = document.getElementById('aiChatSidebar');
    const main = document.querySelector('main');
    const openBtn = document.getElementById('openChat');
    
    if (!sidebar) return;

    if (window.innerWidth > 1024) {
        // Desktop behavior
        if (state.isChatOpen) {
            sidebar.style.transform = 'translateX(0)';
            main.style.paddingRight = '380px';
            if (openBtn) {
                openBtn.style.transform = 'translateY(100px)';
                openBtn.style.opacity = '0';
            }
        } else {
            sidebar.style.transform = 'translateX(100%)';
            main.style.paddingRight = '0';
            if (openBtn) {
                openBtn.style.transform = 'translateY(0)';
                openBtn.style.opacity = '1';
            }
        }
    } else {
        // Mobile behavior: Overlay
        sidebar.style.transform = state.isChatOpen ? 'translateX(0)' : 'translateX(100%)';
        if (openBtn) openBtn.style.display = 'none';
    }
}

// ☁️ Magic Dropzone Logic
function initDropzone() {
    const dz = document.getElementById('dropzone');
    if (!dz) return;
    dz.addEventListener('click', () => {
        showToast(state.currentLang === 'en' ? "AI Parsing CV..." : "AI đang bóc tách CV...");
    });
}

// 🍞 Toast Notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-emerald-950 px-6 py-3 rounded-full font-black text-[10px] uppercase emerald-glow z-[100] animate-fade-in flex items-center gap-3';
    toast.innerHTML = `<span class="material-symbols-outlined text-sm">notifications</span> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 👥 Presence Simulation
function simulateCollaboration() {
    const presenceContainer = document.querySelector('[data-i18n="reviewingProfile"]');
    if (!presenceContainer) return;
    setInterval(() => {
        const users = ["Hoàng Lê", "Minh Tú", "Linh Chi"];
        const user = users[Math.floor(Math.random() * users.length)];
        const baseText = translations[state.currentLang].reviewingProfile;
        presenceContainer.textContent = `${user} ${baseText}`;
    }, 10000);
}

// Initialize
function init() {
    // Initial state based on screen size
    if (window.innerWidth <= 1024) {
        state.isChatOpen = false;
        const sidebar = document.getElementById('aiChatSidebar');
        if (sidebar) sidebar.style.transform = 'translateX(100%)';
    }

    updateLanguage();
    initDropzone();
    simulateCollaboration();

    document.getElementById('langToggle')?.addEventListener('click', () => {
        state.currentLang = state.currentLang === 'en' ? 'vi' : 'en';
        updateLanguage();
    });

    document.getElementById('closeChat')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleChat();
    });
    
    document.getElementById('openChat')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleChat();
    });
}

document.addEventListener('DOMContentLoaded', init);
window.toggleSidebar = toggleSidebar;
window.toggleChat = toggleChat;
window.filterCandidates = filterCandidates;
