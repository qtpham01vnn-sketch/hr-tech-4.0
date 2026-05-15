// 📦 App State
const state = {
    currentLang: localStorage.getItem('talentOS_lang') || 'en',
    isChatOpen: window.innerWidth > 1024,
    isSidebarOpen: false
};

// 🌎 Localization Engine
function updateLanguage() {
    const lang = state.currentLang;
    if (typeof translations === 'undefined') {
        console.error("Translations not found!");
        return;
    }
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

// 🚀 Core Functions
window.toggleSidebar = function() {
    state.isSidebarOpen = !state.isSidebarOpen;
    document.body.classList.toggle('sidebar-open', state.isSidebarOpen);
};

window.toggleChat = function() {
    state.isChatOpen = !state.isChatOpen;
    document.body.classList.toggle('chat-open', state.isChatOpen);
    
    // Desktop layout adjustment
    if (window.innerWidth > 1024) {
        const main = document.querySelector('main');
        const openBtn = document.getElementById('openChat');
        if (main) main.style.paddingRight = state.isChatOpen ? '380px' : '0';
        if (openBtn) {
            openBtn.style.transform = state.isChatOpen ? 'translateY(100px)' : 'translateY(0)';
            openBtn.style.opacity = state.isChatOpen ? '0' : '1';
        }
    }
};

window.filterCandidates = function(layer) {
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
};

// 🍞 Toast
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

// 🏁 Initialize
function init() {
    // Sync initial body classes
    if (window.innerWidth <= 1024) {
        state.isChatOpen = false;
        document.body.classList.remove('chat-open');
    } else {
        document.body.classList.add('chat-open');
    }

    updateLanguage();

    // Bind all buttons by ID
    const bindings = [
        { id: 'langToggle', fn: () => { state.currentLang = state.currentLang === 'en' ? 'vi' : 'en'; updateLanguage(); } },
        { id: 'toggleSidebarMobile', fn: window.toggleSidebar },
        { id: 'closeSidebarMobile', fn: window.toggleSidebar },
        { id: 'openChatMobile', fn: window.toggleChat },
        { id: 'openChat', fn: window.toggleChat },
        { id: 'closeChat', fn: window.toggleChat }
    ];

    bindings.forEach(bind => {
        const el = document.getElementById(bind.id);
        if (el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                bind.fn();
            });
        }
    });

    // Other Init
    const dz = document.getElementById('dropzone');
    if (dz) dz.addEventListener('click', () => showToast(state.currentLang === 'en' ? "AI Parsing..." : "AI đang bóc tách..."));
    
    // Simulate Team Presence
    setInterval(() => {
        const presenceContainer = document.querySelector('[data-i18n="reviewingProfile"]');
        if (presenceContainer && typeof translations !== 'undefined') {
            const users = ["Hoàng Lê", "Minh Tú", "Linh Chi"];
            const user = users[Math.floor(Math.random() * users.length)];
            const baseText = translations[state.currentLang].reviewingProfile;
            presenceContainer.textContent = `${user} ${baseText}`;
        }
    }, 10000);
}

document.addEventListener('DOMContentLoaded', init);
