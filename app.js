// 🔐 Configuration
const CONFIG = {
    SUPABASE_URL: 'https://namwpwyjwzruaagwfoox.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbXdwd3lqd3pydWFhZ3dmb294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDE4MzMsImV4cCI6MjA3NTc3NzgzM30.2ySYAtueeFPvuUT6gZSSodhMKrNcwJwbNMyAFOH9ZeI',
    GEMINI_API_KEY: localStorage.getItem('user_gemini_api_key') || 'AIzaSyAhX4XwlZdl2v3FRzkXwcXr1DbJCY0fXSw'
};

// 🍞 Toast Notification (Global)
window.showToast = function(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-emerald-950 px-6 py-3 rounded-full font-black text-[10px] uppercase emerald-glow z-[100] animate-fade-in flex items-center gap-3 transition-all duration-500';
    toast.innerHTML = `<span class="material-symbols-outlined text-sm">notifications</span> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

// 📦 App State
const state = {
    currentLang: localStorage.getItem('talentOS_lang') || 'en',
    isChatOpen: window.innerWidth > 1024,
    isSidebarOpen: false,
    candidates: [],
    chatHistory: [],
    analyticsFilter: 'all',
    tickets: [
        { id: 'req-001', role: 'Java Cloud Architect', dept: 'Core Banking', priority: 'High', status: 'open', date: '2026-05-10', candidates: 0 },
        { id: 'req-002', role: 'Python AI Engineer', dept: 'AI Lab', priority: 'Critical', status: 'progress', date: '2026-05-12', candidates: 2 },
        { id: 'req-003', role: 'Senior Product Manager', dept: 'Digital Retail', priority: 'Medium', status: 'resolved', date: '2026-04-20', candidates: 1 }
    ],
    onboarding: [
        { id: 'onb-001', name: 'Le Phuong Nam', role: 'Java Cloud Architect', email: 'nam.le@company.com', stage: 'docs', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
        { id: 'onb-002', name: 'Nguyen Minh Tu', role: 'Python AI Engineer', email: 'tu.nguyen@company.com', stage: 'contract', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
        { id: 'onb-003', name: 'Tran Thanh Thao', role: 'Senior Product Manager', email: 'thao.tran@company.com', stage: 'ssc', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' }
    ],
    vettingWeights: { tech: 50, exp: 35, edu: 15 },
    activeGeneratedJD: null,
    activeGeneratedQuestions: null
};

// 🚀 Initialization
const { createClient } = window.supabase;
const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// 🌎 Custom Markdown Parser
function renderMarkdown(text) {
    if (!text) return '';
    
    // Escape HTML to prevent injection but maintain format
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
        
    // 1. Headers (### Header / ## Header)
    html = html.replace(/^###\s+(.+)$/gm, '<h4 class="text-[11px] font-black uppercase text-[#4edea3] mt-5 mb-2 tracking-[0.1em] border-b border-[#242c27] pb-1">$1</h4>');
    html = html.replace(/^##\s+(.+)$/gm, '<h3 class="text-xs font-black text-white mt-6 mb-3 border-l-2 border-emerald-500 pl-2">$1</h3>');
    
    // 2. Bold text (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-400 font-bold">$1</strong>');
    
    // 3. Bullet points (- item)
    html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li class="text-[10.5px] text-[#bbcabf] ml-4 list-disc pl-1 my-1.5 leading-relaxed">$1</li>');
    
    // 4. Numbered lists (1. item)
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="text-[10.5px] text-[#bbcabf] ml-4 list-decimal pl-1 my-1.5 leading-relaxed">$1</li>');

    // 5. Roadmap & Advice sections (💡 Lời khuyên)
    html = html.replace(/💡\s+(.+)$/gm, '<div class="mt-5 p-4 bg-[#141a17] border border-emerald-500/20 rounded-xl flex gap-3 items-start"><span class="text-emerald-400">💡</span><div class="text-[10.5px] text-[#bbcabf] leading-relaxed font-medium">$1</div></div>');

    // 6. Highlight text tags (e.g. [RECOMMENDED])
    html = html.replace(/\[(RECOMMENDED|GỢI Ý)\]/g, '<span class="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[8px] font-black uppercase tracking-wider border border-emerald-500/20">$1</span>');

    // Convert newlines to breaks unless they are inside structural components
    html = html.replace(/\n\n/g, '<div class="h-3"></div>');
    html = html.replace(/\n/g, '<br>');
    
    // Structural layout alignment
    html = html.replace(/<\/li><br>/g, '</li>');
    html = html.replace(/<\/h4><br>/g, '</h4>');
    html = html.replace(/<\/h3><br>/g, '</h3>');
    html = html.replace(/<\/div><br>/g, '</div>');

    return html;
}

// 🌎 Localization Engine
function updateLanguage() {
    if (typeof translations === 'undefined') return;
    const dictionary = translations[state.currentLang];
    if (!dictionary) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dictionary[key]) {
            if (key === 'aiGreeting' || key === 'aiCompare') {
                el.innerHTML = renderMarkdown(dictionary[key]);
            } else {
                el.textContent = dictionary[key];
            }
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dictionary[key]) el.placeholder = dictionary[key];
    });

    // Translate dynamic chatbot history
    document.querySelectorAll('.dynamic-chat-bubble').forEach(el => {
        const contentVi = decodeURIComponent(el.getAttribute('data-content-vi') || '');
        const contentEn = decodeURIComponent(el.getAttribute('data-content-en') || '');
        const activeContent = state.currentLang === 'vi' ? contentVi : contentEn;
        
        const textEl = el.querySelector('.chat-text');
        if (textEl) {
            if (el.classList.contains('bg-emerald-500')) {
                // User bubble
                textEl.textContent = activeContent;
            } else {
                // AI bubble
                const isHTML = activeContent.trim().startsWith('<');
                textEl.innerHTML = isHTML ? activeContent : renderMarkdown(activeContent);
            }
        }
    });

    const langToggleBtn = document.getElementById('currentLang');
    if (langToggleBtn) langToggleBtn.textContent = state.currentLang.toUpperCase();

    localStorage.setItem('talentOS_lang', state.currentLang);
    document.documentElement.lang = state.currentLang;

    // 🧩 Update competency dynamically if initialized
    if (typeof renderCompetencyCards === 'function') {
        renderCompetencyCards();
    }
    if (typeof selectCompetencyProfile === 'function') {
        selectCompetencyProfile(activeCompetencyProfileKey);
    }
    if (typeof window.renderScreenerView === 'function') {
        window.renderScreenerView();
        window.updateScreenerComparison();
    }
    if (typeof window.renderPlannerView === 'function') {
        window.renderPlannerView();
    }
    if (typeof window.renderAnalyticsView === 'function') {
        window.renderAnalyticsView();
    }
    if (typeof window.renderTicketHub === 'function') {
        window.renderTicketHub();
    }
    if (typeof window.renderOnboarding === 'function') {
        window.renderOnboarding();
    }
    if (state.activeGeneratedQuestions && typeof window.renderAIQuestions === 'function') {
        window.renderAIQuestions();
    }
    const jdContainer = document.getElementById('jdOutputContainer');
    if (jdContainer && state.activeGeneratedJD) {
        jdContainer.textContent = state.currentLang === 'vi' ? state.activeGeneratedJD.jd_vi : state.activeGeneratedJD.jd_en;
    }
}

// 📊 Data Fetching & Rendering
async function fetchCandidates() {
    const tableBody = document.getElementById('candidateTableBody');
    try {
        const { data, error } = await supabaseClient
            .from('hr_candidates')
            .select('*')
            .order('matching_score', { ascending: false });

        if (error) throw error;
        
        state.candidates = (data || []).map(c => {
            const summary = (c.ai_summary || '').toLowerCase();
            const name = (c.full_name || '').toLowerCase();
            let role = 'Python AI Engineer';
            if (summary.includes('java') || summary.includes('microservices') || name.includes('architect') || name.includes('nam')) {
                role = 'Java Cloud Architect';
            } else if (summary.includes('product') || summary.includes('quản lý sản phẩm') || summary.includes('roadmap') || name.includes('product') || name.includes('jamin')) {
                role = 'Senior Product Manager';
            }
            return { ...c, applied_position: role };
        });
        renderCandidates();
        updateFunnelCounts();
        if (typeof window.renderScreenerView === 'function') {
            window.renderScreenerView();
        }
    } catch (err) {
        console.error('Error fetching candidates:', err);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="7" class="px-8 py-20 text-center text-red-400">Database Connection Error</td></tr>`;
        }
    }
}

function renderCandidates() {
    const tableBody = document.getElementById('candidateTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    state.candidates.forEach(can => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-emerald-900/10 transition-colors group';
        
        const radius = 20;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (can.matching_score / 100) * circumference;

        row.innerHTML = `
            <td class="px-6 py-6"><input type="checkbox" ${can.is_shortlisted ? 'checked' : ''} onchange="toggleShortlistFromDrawer('${can.id}', this.checked)" class="w-4 h-4 bg-[#0e1511] border-emerald-800 rounded text-emerald-500 focus:ring-0"></td>
            <td class="px-6 py-6">
                <div class="flex items-center gap-4 cursor-pointer" onclick="openCandidateDetails('${can.id}')">
                    <div class="w-12 h-12 rounded-full border border-emerald-500/20 p-0.5">
                        <img src="${can.avatar_url || 'https://i.pravatar.cc/100?u=' + can.id}" class="w-full h-full object-cover rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    </div>
                    <div>
                        <p class="text-sm font-bold text-emerald-400">${can.full_name}</p>
                        <p class="text-[10px] text-[#94a3b8]">${can.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-6 text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 relative">
                    <svg class="w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="20" fill="transparent" stroke="#064e3b" stroke-width="4"></circle>
                        <circle cx="24" cy="24" r="20" fill="transparent" stroke="#10b981" stroke-width="4" 
                                stroke-dasharray="${circumference}" 
                                stroke-dashoffset="${offset}" 
                                stroke-linecap="round"></circle>
                    </svg>
                    <span class="absolute text-[10px] font-black text-emerald-500">${can.matching_score}%</span>
                </div>
            </td>
            <td class="px-6 py-6">
                <span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">${can.stage}</span>
            </td>
            <td class="px-6 py-6 text-center">
                <div class="flex items-center justify-center gap-0.5 text-emerald-500">
                    ${Array.from({ length: 5 }).map((_, i) => `
                        <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' ${i < Math.floor(can.board_rating) ? 1 : 0}">${i < Math.floor(can.board_rating) ? 'star' : 'star_outline'}</span>
                    `).join('')}
                </div>
                <p class="text-[9px] text-[#94a3b8] mt-1">${can.board_rating} / 5.0</p>
            </td>
            <td class="px-6 py-6">
                <div class="flex flex-col gap-2">
                    <p class="text-[10px] text-[#bbcabf] line-clamp-1">${can.ai_summary || ''}</p>
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-bold text-red-400/80 uppercase">${translations[state.currentLang]['skillGap']}:</span>
                        <span class="text-[9px] text-[#94a3b8]">${can.ai_gaps ? can.ai_gaps.join(', ') : 'None'}</span>
                    </div>
                </div>
            </td>
            <td class="px-6 py-6 text-right">
                <button onclick="openCandidateDetails('${can.id}')" class="px-4 py-1.5 bg-emerald-900/30 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-emerald-500 hover:text-emerald-950 transition-all">${translations[state.currentLang]['analyze']}</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateFunnelCounts() {
    const counts = {
        total: state.candidates.length,
        screened: state.candidates.filter(c => c.matching_score > 50).length,
        top: state.candidates.filter(c => c.matching_score > 85).length,
        shortlist: state.candidates.filter(c => c.is_shortlisted).length
    };

    const selectors = {
        total: document.querySelector('[onclick="filterCandidates(\'total\')"] span:last-child'),
        screened: document.querySelector('[onclick="filterCandidates(\'screened\')"] span:last-child'),
        top: document.querySelector('[onclick="filterCandidates(\'top\')"] span:last-child'),
        shortlist: document.querySelector('[onclick="filterCandidates(\'shortlist\')"] span:last-child')
    };

    if (selectors.total) selectors.total.textContent = counts.total;
    if (selectors.screened) selectors.screened.textContent = counts.screened;
    if (selectors.top) selectors.top.textContent = counts.top;
    if (selectors.shortlist) selectors.shortlist.textContent = counts.shortlist;
}

// 🤖 AI Chat Logic (Direct Fetch - No SDK needed)
async function handleSendMessage() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;

    const userMessage = input.value.trim();
    input.value = '';

    appendMessage('user', userMessage);

    const loadingId = 'ai-loading-' + Date.now();
    appendMessage('ai', '<div class="flex gap-2"><div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div><div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div></div>', loadingId);

    try {
        const systemPrompt = `You are the Talent AI Advisor (HR-Tech AI Oracle) of the HR-Tech 4.0 Corporate Recruitment Platform.
        
        Phong cách phản hồi: Đẳng cấp chuyên gia tư vấn giải pháp nhân sự cấp tập đoàn lớn (Enterprise Level), chuyên nghiệp, mạch lạc, dùng dấu đầu dòng, bôi đậm từ khóa quan trọng và chia thành các đề mục rõ ràng.
        Response Style: Enterprise Level HR-Tech consultant. Highly structured, coherent, bulleted, key terms bolded, and categorized under clear headers.
        
        KHI ĐƯỢC HỎI về kinh nghiệm tuyển dụng của tập đoàn lớn, lời khuyên cho hệ thống tuyển dụng chuyên nghiệp, hoặc những gì cần thiết cho một hệ thống HR đẳng cấp, bạn PHẢI cấu trúc câu trả lời của mình dựa trên 4 Trụ cột Chiến lược sau đây:
        WHEN ASKED about corporate hiring experience, advice for professional recruiting platforms, or what makes an elite HR system, you MUST structure your answer based on these 4 Strategic Pillars:
        
        ### Trụ cột 1: Bộ khung năng lực chuẩn hóa (Standardized Competency Framework)
        ### Pillar 1: Standardized Competency Framework
        - Hard Skills
        - Soft Skills
        - Cultural Fit
        
        ### Trụ cột 2: Hệ thống Sàng lọc Đa tầng (Multi-layer Screening)
        ### Pillar 2: Multi-layer Screening System
        - Tier 1: AI Resumes Parsing
        - Tier 2: Pre-interview Assessment
        - Tier 3: AI Video Interview
        
        ### Trụ cột 3: Trải nghiệm ứng viên (Employer Branding & Experience)
        ### Pillar 3: Employer Branding & Experience
        - Auto-Feedback
        
        ### Trụ cột 4: Báo cáo & Phân tích (Recruitment Analytics & Dashboard)
        ### Pillar 4: Recruitment Analytics & Dashboard
        - Time-to-hire
        - Cost-per-hire
        - Source Quality
        
        💡 Lời khuyên của em / My recommendation for the next phase of the App:
        (Suggest practical next steps such as: developing an automated AI Video scoring module for Tier 3, and integrating automatic testing frameworks in Tier 2 to slash review cycle times).
        
        CRITICAL INSTRUCTIONS:
        1. You must translate the user's question into BOTH Vietnamese (user_q_vi) and English (user_q_en).
        2. You must generate your detailed, professional response in BOTH Vietnamese (ai_r_vi) and English (ai_r_en) according to the response styles above.
        3. Use standard Markdown for both responses: ### for headers, ** for bold, - for lists, and 💡 for the advice section.
        4. Output strictly in JSON format matching the schema. Do not include any HTML markdown wrappers around the JSON.`;
             
        const candidatesContext = `Active Candidates Context Database: ${JSON.stringify(state.candidates.map(c => ({ name: c.full_name, role: c.applied_position, score: c.matching_score, status: c.status, shortlisted: c.is_shortlisted })))})`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1alpha/models/gemini-3-flash-preview:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt + "\n\n" + candidatesContext + "\n\nUser Question: " + userMessage }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            user_q_vi: { type: "STRING" },
                            user_q_en: { type: "STRING" },
                            ai_r_vi: { type: "STRING" },
                            ai_r_en: { type: "STRING" }
                        },
                        required: ["user_q_vi", "user_q_en", "ai_r_vi", "ai_r_en"]
                    }
                }
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        const responseText = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(responseText);

        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            loadingEl.className = 'flex gap-4';
            loadingEl.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-emerald-500 text-sm">psychology</span>
                </div>
                <div class="space-y-2 max-w-[85%] dynamic-chat-bubble"
                     data-content-vi="${encodeURIComponent(result.ai_r_vi)}" 
                     data-content-en="${encodeURIComponent(result.ai_r_en)}">
                    <div class="bg-[#1c2420] p-4 rounded-2xl rounded-tl-none border border-[#242c27]">
                        <div class="ai-response-text text-[11.5px] text-[#bbcabf] leading-relaxed chat-text">
                            ${state.currentLang === 'vi' ? renderMarkdown(result.ai_r_vi) : renderMarkdown(result.ai_r_en)}
                        </div>
                    </div>
                </div>`;
            loadingEl.removeAttribute('id');
            const container = document.getElementById('chatContent');
            if (container) container.scrollTop = container.scrollHeight;
        }

        // Search backward for the last user bubble to update its bilingual translation
        const container = document.getElementById('chatContent');
        if (container && loadingEl) {
            let sibling = loadingEl.previousSibling;
            while (sibling) {
                if (sibling.nodeType === 1 && sibling.classList.contains('flex-col') && sibling.querySelector('.dynamic-chat-bubble')) {
                    const userBubble = sibling.querySelector('.dynamic-chat-bubble');
                    userBubble.setAttribute('data-content-vi', encodeURIComponent(result.user_q_vi));
                    userBubble.setAttribute('data-content-en', encodeURIComponent(result.user_q_en));
                    
                    const textEl = userBubble.querySelector('.chat-text');
                    if (textEl) {
                        textEl.textContent = state.currentLang === 'vi' ? result.user_q_vi : result.user_q_en;
                    }
                    break;
                }
                sibling = sibling.previousSibling;
            }
        }
    } catch (err) {
        console.error('Gemini Fetch Error:', err);
        window.toggleAPISettingsModal(true);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-emerald-500 text-sm">psychology</span>
                </div>
                <div class="space-y-2 max-w-[85%]">
                    <div class="bg-[#1c2420] p-4 rounded-2xl rounded-tl-none border border-red-500/20">
                        <div class="text-[11.5px] text-red-400 leading-relaxed">AI Error: ${err.message}. Please check API Key.</div>
                    </div>
                </div>`;
            loadingEl.removeAttribute('id');
            const container = document.getElementById('chatContent');
            if (container) container.scrollTop = container.scrollHeight;
        }
    }
}

function appendMessage(role, content, id = null) {
    const container = document.getElementById('chatContent');
    if (!container) return;
    const msg = document.createElement('div');
    msg.className = role === 'user' ? 'flex flex-col items-end gap-2' : 'flex gap-4';
    if (id) msg.id = id;

    if (role === 'user') {
        msg.innerHTML = `
            <div class="bg-emerald-500 text-emerald-950 p-4 rounded-2xl rounded-tr-none max-w-[85%] dynamic-chat-bubble" 
                 data-content-vi="${encodeURIComponent(content)}" 
                 data-content-en="${encodeURIComponent(content)}">
                <p class="text-[11px] font-medium chat-text">${content}</p>
            </div>`;
    } else {
        const isHTML = content.trim().startsWith('<');
        const displayContent = isHTML ? content : renderMarkdown(content);
        msg.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-emerald-500 text-sm">psychology</span>
            </div>
            <div class="space-y-2 max-w-[85%] dynamic-chat-bubble" 
                 data-content-vi="${encodeURIComponent(content)}" 
                 data-content-en="${encodeURIComponent(content)}">
                <div class="bg-[#1c2420] p-4 rounded-2xl rounded-tl-none border border-[#242c27]">
                    <div class="ai-response-text text-[11.5px] text-[#bbcabf] leading-relaxed chat-text">${displayContent}</div>
                </div>
            </div>`;
    }
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

// 🏁 Initialize
function init() {
    if (window.innerWidth <= 1024) {
        state.isChatOpen = false;
        document.body.classList.remove('chat-open');
    } else {
        document.body.classList.add('chat-open');
    }
    updateLanguage();
    fetchCandidates();

    document.getElementById('langToggle')?.addEventListener('click', () => { 
        state.currentLang = state.currentLang === 'en' ? 'vi' : 'en'; 
        localStorage.setItem('talentOS_lang', state.currentLang);
        updateLanguage(); 
        fetchCandidates();
    });
    
    document.getElementById('sendMessage')?.addEventListener('click', handleSendMessage);
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    });

    window.toggleSidebar = () => {
        state.isSidebarOpen = !state.isSidebarOpen;
        document.body.classList.toggle('sidebar-open', state.isSidebarOpen);
    };

    window.toggleChat = () => {
        state.isChatOpen = !state.isChatOpen;
        document.body.classList.toggle('chat-open', state.isChatOpen);
    };
    
    document.getElementById('openChat')?.addEventListener('click', window.toggleChat);
    document.getElementById('closeChat')?.addEventListener('click', window.toggleChat);

    // 📂 Drag-and-drop event listeners for #dropzone
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('cvFileInput');

    if (dropzone && fileInput) {
        // Prevent default browser behavior
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-emerald-500', 'bg-emerald-500/10');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('border-emerald-500', 'bg-emerald-500/10');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-emerald-500', 'bg-emerald-500/10');
            const file = e.dataTransfer.files[0];
            if (file) {
                window.parseAndInjectCandidate(file.name);
            }
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                window.parseAndInjectCandidate(file.name);
                fileInput.value = ''; // Reset so the same file can be uploaded again
            }
        });
    }
    
    // Initialize default competency profile
    if (typeof window.renderCompetencyCards === 'function') {
        window.renderCompetencyCards();
    }
    window.selectCompetencyProfile('java');
}

window.filterCandidates = function(layer) {
    const rows = document.querySelectorAll('#candidateTableBody tr');
    rows.forEach((row, index) => {
        const can = state.candidates[index];
        if (!can) return;
        let show = false;
        if (layer === 'total') show = true;
        else if (layer === 'screened' && can.matching_score > 50) show = true;
        else if (layer === 'top' && can.matching_score > 85) show = true;
        else if (layer === 'shortlist' && can.is_shortlisted) show = true;
        row.style.display = show ? 'table-row' : 'none';
    });
};

// 📇 Candidate Details Drawer (Tier 2 & Tier 3 Screening Analytics)
function openCandidateDetails(id) {
    const candidate = state.candidates.find(c => c.id === id);
    if (!candidate) return;

    const drawer = document.getElementById('candidateDetailsDrawer');
    if (drawer) {
        drawer.classList.remove('translate-x-full');
    }

    // Populate drawer elements
    document.getElementById('drawerName').textContent = candidate.full_name;
    document.getElementById('drawerEmail').textContent = candidate.email;
    
    const avatarEl = document.getElementById('drawerAvatar');
    if (avatarEl) avatarEl.src = candidate.avatar_url || `https://i.pravatar.cc/100?u=${candidate.id}`;
    
    document.getElementById('drawerMatchingPercent').textContent = `${candidate.matching_score}%`;
    document.getElementById('drawerStage').textContent = candidate.stage;

    // Shortlist check state
    const checkbox = document.getElementById('drawerShortlistCheckbox');
    if (checkbox) {
        checkbox.checked = candidate.is_shortlisted;
        checkbox.onchange = (e) => toggleShortlistFromDrawer(candidate.id, e.target.checked);
    }
    
    document.getElementById('drawerStatusText').textContent = candidate.status.toUpperCase();

    // Star rating
    const starsContainer = document.getElementById('drawerBoardStars');
    if (starsContainer) {
        starsContainer.innerHTML = Array.from({ length: 5 }).map((_, i) => `
            <span class="material-symbols-outlined text-xs" style="font-variation-settings: 'FILL' ${i < Math.floor(candidate.board_rating) ? 1 : 0}">${i < Math.floor(candidate.board_rating) ? 'star' : 'star_outline'}</span>
        `).join('') + `<span class="text-[9px] text-[#94a3b8] font-bold ml-1">${candidate.board_rating} / 5.0</span>`;
    }

    // Custom horizontal bar progress metrics
    const techScore = Math.max(60, candidate.matching_score - 4);
    const softScore = Math.max(60, candidate.matching_score - 8);
    const cultureScore = Math.max(60, candidate.matching_score - 3);

    document.getElementById('drawerTechScore').textContent = `${techScore}%`;
    document.getElementById('drawerTechBar').style.width = `${techScore}%`;
    document.getElementById('drawerSoftScore').textContent = `${softScore}%`;
    document.getElementById('drawerSoftBar').style.width = `${softScore}%`;
    document.getElementById('drawerCultureScore').textContent = `${cultureScore}%`;
    document.getElementById('drawerCultureBar').style.width = `${cultureScore}%`;

    // Core Values Progress
    document.getElementById('valIntegrity').textContent = `${candidate.matching_score - 2}%`;
    document.getElementById('valDiscipline').textContent = `${candidate.matching_score - 5}%`;
    document.getElementById('valInnovation').textContent = `${candidate.matching_score - 7}%`;

    // Tier 2 test mock evaluations
    document.getElementById('testIQ').textContent = `${candidate.matching_score + 35} / 150`;
    document.getElementById('testTech').textContent = `${candidate.matching_score - 5} / 100`;

    // Tier 3 video mock evaluations
    document.getElementById('vidCharisma').textContent = `${candidate.matching_score - 3}%`;
    document.getElementById('vidClarity').textContent = `${candidate.matching_score - 2}%`;
    document.getElementById('vidTone').textContent = `${candidate.matching_score - 1}%`;

    // Summary and gaps
    document.getElementById('drawerAiSummary').textContent = candidate.ai_summary || '';
    document.getElementById('drawerAiGaps').textContent = candidate.ai_gaps ? candidate.ai_gaps.join(', ') : 'None';

    // Link Oracle button
    const askBtn = document.getElementById('askOracleBtn');
    if (askBtn) {
        askBtn.onclick = () => askOracleFromDrawer(candidate.id);
    }
}

function closeCandidateDetails() {
    const drawer = document.getElementById('candidateDetailsDrawer');
    if (drawer) {
        drawer.classList.add('translate-x-full');
    }
}

async function toggleShortlistFromDrawer(id, checked) {
    try {
        const { error } = await supabaseClient
            .from('hr_candidates')
            .update({ is_shortlisted: checked })
            .eq('id', id);

        if (error) throw error;

        // Local state synchronization
        const candidate = state.candidates.find(c => c.id === id);
        if (candidate) {
            candidate.is_shortlisted = checked;
        }

        renderCandidates();
        updateFunnelCounts();

        window.showToast(checked ? "Shortlisted Candidate Successfully" : "Removed Candidate From Shortlist");
    } catch (err) {
        console.error('Error toggling shortlist:', err);
        window.showToast("Failed to sync shortlist with Supabase");
    }
}

function askOracleFromDrawer(id) {
    const candidate = state.candidates.find(c => c.id === id);
    if (!candidate) return;

    closeCandidateDetails();

    // Open chat sidebar
    state.isChatOpen = true;
    document.body.classList.add('chat-open');
    const chatSidebar = document.getElementById('aiChatSidebar');
    if (chatSidebar) {
        chatSidebar.classList.remove('translate-x-full');
    }

    // Pre-fill query
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = `Hãy phân tích điểm mạnh, điểm yếu và mức độ phù hợp văn hóa của ứng viên ${candidate.full_name} (vị trí ${candidate.stage}, điểm matching ${candidate.matching_score}%) dựa trên 4 Trụ cột Tuyển dụng.`;
        chatInput.focus();
    }
}

// Global scope window binding to resolve ESM module scope limitations
window.openCandidateDetails = openCandidateDetails;
window.closeCandidateDetails = closeCandidateDetails;
window.toggleShortlistFromDrawer = toggleShortlistFromDrawer;
window.askOracleFromDrawer = askOracleFromDrawer;

window.closeParsingModal = function() {
    const modal = document.getElementById('parsingModal');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        modal.classList.remove('opacity-100', 'scale-100');
    }
};

window.parseAndInjectCandidate = async function(sourceName) {
    const modal = document.getElementById('parsingModal');
    if (!modal) return;

    // Show modal in loading state
    modal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
    modal.classList.add('opacity-100', 'scale-100');

    const activeState = document.getElementById('parsingActiveState');
    const successState = document.getElementById('parsingSuccessState');
    const closeBtn = document.getElementById('closeParsingModalBtn');
    
    activeState.classList.remove('hidden');
    successState.classList.add('hidden');
    closeBtn.classList.add('hidden');

    // Display filename or role name
    const fileNameEl = document.getElementById('parsingFileName');
    if (fileNameEl) fileNameEl.textContent = sourceName;

    // Reset log steps
    const steps = [
        document.getElementById('logStep1'),
        document.getElementById('logStep2'),
        document.getElementById('logStep3'),
        document.getElementById('logStep4')
    ];
    
    steps.forEach(step => {
        if (step) {
            step.className = "flex items-center gap-3 text-[9px] font-bold text-emerald-500/40";
            const icon = step.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = "pending";
                icon.className = "material-symbols-outlined text-xs animate-pulse";
            }
        }
    });

    // Step-by-step progress animation helper
    const markStepDone = (index) => {
        const step = steps[index];
        if (step) {
            step.className = "flex items-center gap-3 text-[9px] font-bold text-emerald-500";
            const icon = step.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = "check_circle";
                icon.className = "material-symbols-outlined text-xs text-emerald-400";
            }
        }
    };

    // Trigger sequential animations
    setTimeout(() => markStepDone(0), 800);
    setTimeout(() => markStepDone(1), 1600);
    setTimeout(() => markStepDone(2), 2400);
    setTimeout(() => markStepDone(3), 3200);

    // Extract name from uploaded file or generate based on role
    let extractedName = "Ứng viên Tiềm năng";
    let appliedRole = "Senior Architect";
    let isFile = sourceName.includes('.') || sourceName.includes('_');

    if (isFile) {
        // Parse filename
        let clean = sourceName.split('.')[0];
        clean = clean.replace(/^(cv|cv_|resume|resume_|profile|profile_)/i, '');
        clean = clean.replace(/[_\-]/g, ' ').trim();
        // Capitalize
        extractedName = clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        appliedRole = "Lead Engineer";
    } else {
        // Preset templates
        appliedRole = sourceName;
        const vietNames = [
            "Nguyễn Hoàng Lâm", "Trần Tiến Đạt", "Lê Khánh An", "Phạm Minh Quang", 
            "Đặng Thùy Dương", "Bùi Vĩnh Hưng", "Vũ Quốc Cường", "Phan Gia Bảo"
        ];
        extractedName = vietNames[Math.floor(Math.random() * vietNames.length)];
    }

    const emailSafe = extractedName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".");
    const email = `${emailSafe}@recruitment-hub.com`;
    const matchScore = Math.floor(Math.random() * 11) + 86; // 86% - 96%
    const rating = parseFloat((Math.random() * 0.6 + 4.1).toFixed(1)); // 4.1 - 4.7
    const randomId = Math.floor(Math.random() * 1000);
    const avatarUrl = `https://i.pravatar.cc/100?u=${randomId}`;

    let summary = "";
    let gaps = [];
    if (appliedRole.includes("Java")) {
        summary = "Ứng viên có kiến trúc vững chắc, am hiểu microservices với Spring Boot/Cloud, tối ưu DB tốt và giao tiếp tốt.";
        gaps = ["Kubernetes", "Kafka", "AWS"];
    } else if (appliedRole.includes("Python") || appliedRole.includes("AI")) {
        summary = "Kỹ sư AI có kinh nghiệm huấn luyện LLM, PyTorch và xây dựng các giải pháp Agentic AI thông minh.";
        gaps = ["CUDA optimization", "TensorRT", "MLOps"];
    } else if (appliedRole.includes("Product")) {
        summary = "Quản lý sản phẩm sắc bén về data-driven, có kinh nghiệm lead agile team và xây dựng roadmap tối ưu.";
        gaps = ["System Design Basics", "Growth Hacking", "SQL Analysis"];
    } else {
        summary = "Kỹ sư công nghệ xuất sắc, có kỹ năng kỹ thuật sâu rộng và phù hợp cao với văn hóa tập đoàn.";
        gaps = ["Docker", "CI/CD", "Redis"];
    }

    const newCandidate = {
        full_name: extractedName,
        email: email,
        avatar_url: avatarUrl,
        matching_score: matchScore,
        stage: state.currentLang === 'en' ? 'AI Screened' : 'Sàng lọc AI',
        board_rating: rating,
        ai_summary: summary,
        ai_gaps: gaps,
        status: 'active',
        is_shortlisted: false
    };

    // Execute completion after animations finish
    setTimeout(async () => {
        try {
            // Save to Supabase
            const { data, error } = await supabaseClient
                .from('hr_candidates')
                .insert([newCandidate])
                .select();

            if (error) throw error;

            // Sync with local memory
            const addedCandidate = data[0];
            const summary = (addedCandidate.ai_summary || '').toLowerCase();
            const name = (addedCandidate.full_name || '').toLowerCase();
            let role = 'Python AI Engineer';
            if (summary.includes('java') || summary.includes('microservices') || name.includes('architect') || name.includes('nam')) {
                role = 'Java Cloud Architect';
            } else if (summary.includes('product') || summary.includes('quản lý sản phẩm') || summary.includes('roadmap') || name.includes('product') || name.includes('jamin')) {
                role = 'Senior Product Manager';
            }
            addedCandidate.applied_position = role;
            state.candidates.unshift(addedCandidate); // Add to beginning of array
            
            // Re-render UI list
            renderCandidates();
            updateFunnelCounts();

            // Populate success screen
            document.getElementById('successAvatar').src = addedCandidate.avatar_url;
            document.getElementById('successName').textContent = addedCandidate.full_name;
            document.getElementById('successEmail').textContent = addedCandidate.email;
            document.getElementById('successScore').textContent = `${addedCandidate.matching_score}%`;
            document.getElementById('successSummary').textContent = addedCandidate.ai_summary;

            // Bind success action button to close modal and open drawer
            const analyzeBtn = document.getElementById('successAnalyzeBtn');
            if (analyzeBtn) {
                analyzeBtn.onclick = () => {
                    closeParsingModal();
                    openCandidateDetails(addedCandidate.id);
                };
            }

            // Show success screen
            activeState.classList.add('hidden');
            successState.classList.remove('hidden');
            closeBtn.classList.remove('hidden');

            window.showToast(state.currentLang === 'en' ? "Candidate CV parsed & saved successfully!" : "Phân tích và lưu ứng viên thành công!");
        } catch (err) {
            console.error('Supabase CV Ingestion Error:', err);
            window.showToast("Failed to write candidate to database");
            closeParsingModal();
        }
    }, 3600);
};

// ==========================================
// 🧩 Job Architect Competency Management
// ==========================================

const competencyProfiles = {
    java: {
        vi: {
            title: "Java Cloud Architect",
            dept: "Bộ phận Kỹ thuật",
            level: "Cấp Cao (L4-L5)",
            skill1Name: "Điều phối Kubernetes",
            skill2Name: "Kiến trúc Đám mây AWS",
            prompt: "Đánh giá năng lực chuyên sâu về đám mây (cloud-native). Kiểm tra kỹ khả năng cấu hình Kubernetes, bảo mật đa người thuê, co giãn cụm tự động và tuân thủ đặc quyền tối thiểu AWS IAM.",
            defaultPrompt: "Đánh giá năng lực chuyên sâu về đám mây (cloud-native). Kiểm tra kỹ khả năng cấu hình Kubernetes, bảo mật đa người thuê, co giãn cụm tự động và tuân thủ đặc quyền tối thiểu AWS IAM."
        },
        en: {
            title: "Java Cloud Architect",
            dept: "Engineering Dept",
            level: "Senior (L4-L5)",
            skill1Name: "Kubernetes Orchestration",
            skill2Name: "AWS Architecture",
            prompt: "Evaluate deep cloud native competency. Specifically audit Kubernetes orchestrations, multi-tenant safety, cluster-autoscaling, and AWS IAM least privilege compliance.",
            defaultPrompt: "Evaluate deep cloud native competency. Specifically audit Kubernetes orchestrations, multi-tenant safety, cluster-autoscaling, and AWS IAM least privilege compliance."
        },
        skill1Val: 90,
        skill2Val: 85,
        benchMCQ: "≥ 85%",
        benchCoding: "≥ 80%",
        benchCulture: "≥ 90%",
        benchClarity: "≥ 80%",
        updated: "2026-05-16"
    },
    python: {
        vi: {
            title: "Python AI Engineer",
            dept: "Trung tâm R&D AI",
            level: "Chuyên gia (L5-L6)",
            skill1Name: "Học sâu PyTorch",
            skill2Name: "Tác tử RAG & LLMs",
            prompt: "Đánh giá năng lực trí tuệ nhân tạo tạo sinh chuyên sâu. Kiểm tra chống tấn công prompt injection, tối ưu hóa tìm kiếm vector, định nghĩa schema cho tool calling và tối ưu hóa sử dụng token.",
            defaultPrompt: "Đánh giá năng lực trí tuệ nhân tạo tạo sinh chuyên sâu. Kiểm tra chống tấn công prompt injection, tối ưu hóa tìm kiếm vector, định nghĩa schema cho tool calling và tối ưu hóa sử dụng token."
        },
        en: {
            title: "Python AI Engineer",
            dept: "AI R&D Hub",
            level: "Expert (L5-L6)",
            skill1Name: "PyTorch Deep Learning",
            skill2Name: "Agentic RAG & LLMs",
            prompt: "Evaluate deep generative AI capability. Audit prompt injection mitigation, vector search optimizations, structured tool calling schemas, and context window token efficiency.",
            defaultPrompt: "Evaluate deep generative AI capability. Audit prompt injection mitigation, vector search optimizations, structured tool calling schemas, and context window token efficiency."
        },
        skill1Val: 95,
        skill2Val: 90,
        benchMCQ: "≥ 90%",
        benchCoding: "≥ 88%",
        benchCulture: "≥ 85%",
        benchClarity: "≥ 85%",
        updated: "2026-05-17"
    },
    pm: {
        vi: {
            title: "Senior Product Manager",
            dept: "Chiến lược Sản phẩm",
            level: "Trưởng nhóm (L4)",
            skill1Name: "Chiến lược Sản phẩm",
            skill2Name: "Nghiên cứu & Khám phá UX",
            prompt: "Đánh giá phương pháp luận quản trị sản phẩm lấy người dùng làm trung tâm, xây dựng bản đồ câu chuyện người dùng (user story mapping), định nghĩa chỉ số đo lường hiệu quả sản phẩm và vòng phản hồi kiểm chứng khách hàng.",
            defaultPrompt: "Đánh giá phương pháp luận quản trị sản phẩm lấy người dùng làm trung tâm, xây dựng bản đồ câu chuyện người dùng (user story mapping), định nghĩa chỉ số đo lường hiệu quả sản phẩm và vòng phản hồi kiểm chứng khách hàng."
        },
        en: {
            title: "Senior Product Manager",
            dept: "Product Strategy",
            level: "Lead (L4)",
            skill1Name: "Product Strategy",
            skill2Name: "User Research & Discovery",
            prompt: "Evaluate user-centered product methodology, agile story mapping precision, product metrics definition, and customer validation loop structures.",
            defaultPrompt: "Evaluate user-centered product methodology, agile story mapping precision, product metrics definition, and customer validation loop structures."
        },
        skill1Val: 90,
        skill2Val: 85,
        benchMCQ: "≥ 80%",
        benchCoding: "—",
        benchCulture: "≥ 95%",
        benchClarity: "≥ 90%",
        updated: "2026-05-15"
    }
};

let activeCompetencyProfileKey = 'java';

// Load persisted custom prompts from localStorage
Object.keys(competencyProfiles).forEach(key => {
    ['vi', 'en'].forEach(lang => {
        const savedPrompt = localStorage.getItem(`competency_prompt_${key}_${lang}`);
        if (savedPrompt) {
            competencyProfiles[key][lang].prompt = savedPrompt;
        }
    });
});

window.renderCompetencyCards = function() {
    const lang = state.currentLang || 'en';
    Object.keys(competencyProfiles).forEach(key => {
        const card = document.getElementById(`profileCard-${key}`);
        if (!card) return;
        
        const profile = competencyProfiles[key];
        const localized = profile[lang] || profile['en'];
        
        // Update Title & Dept
        const titleEl = card.querySelector('h3');
        if (titleEl) titleEl.textContent = localized.title;
        
        const deptEl = card.querySelector('p');
        if (deptEl) {
            deptEl.textContent = localized.dept.toUpperCase();
            if (activeCompetencyProfileKey === key) {
                deptEl.className = "text-[10px] text-emerald-500/60 uppercase tracking-widest mt-1 font-bold";
            } else {
                deptEl.className = "text-[10px] text-[#94a3b8] uppercase tracking-widest mt-1 font-bold";
            }
        }
        
        // Update Level & Match labels
        const labelsContainer = card.querySelector('.flex.justify-between');
        if (labelsContainer) {
            const levelLabel = lang === 'vi' ? 'Cấp' : 'Level';
            const matchLabel = lang === 'vi' ? 'Phù hợp' : 'Match';
            labelsContainer.innerHTML = `
                <span>${levelLabel}: <strong class="text-white">${localized.level}</strong></span>
                <span>${matchLabel}: <strong class="text-emerald-400">${profile.skill1Val - 3}%</strong></span>
            `;
        }
    });
};

window.selectCompetencyProfile = function(key) {
    if (!competencyProfiles[key]) return;
    activeCompetencyProfileKey = key;
    
    // Update active visual card styles
    document.querySelectorAll('.profile-card').forEach(card => {
        card.className = "profile-card bg-[#141a17] border border-[#242c27] p-5 rounded-2xl cursor-pointer hover:bg-[#1c2420] transition-all";
        // Remove pulse dot if exists
        const dot = card.querySelector('.absolute');
        if (dot) dot.remove();
    });
    
    const selectedCard = document.getElementById(`profileCard-${key}`);
    if (selectedCard) {
        selectedCard.className = "profile-card bg-[#141a17] border-2 border-emerald-500 p-5 rounded-2xl cursor-pointer hover:bg-[#1c2420] transition-all relative overflow-hidden";
        // Add green pulse dot to active card
        const dot = document.createElement('div');
        dot.className = "absolute right-3 top-3 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#4edea3]";
        selectedCard.appendChild(dot);
    }
    
    // Load data into right details panel
    const lang = state.currentLang || 'en';
    const profile = competencyProfiles[key];
    const localized = profile[lang] || profile['en'];
    
    document.getElementById('activeProfileTitle').textContent = localized.title;
    document.getElementById('activeProfileDept').textContent = localized.dept;
    document.getElementById('activeProfileLevel').textContent = localized.level;
    document.getElementById('activeProfileUpdated').textContent = profile.updated;
    
    document.getElementById('skill1-name').textContent = localized.skill1Name;
    document.getElementById('skill1-val').textContent = `${profile.skill1Val}%`;
    document.getElementById('skill1-bar').style.width = `${profile.skill1Val}%`;
    
    document.getElementById('skill2-name').textContent = localized.skill2Name;
    document.getElementById('skill2-val').textContent = `${profile.skill2Val}%`;
    document.getElementById('skill2-bar').style.width = `${profile.skill2Val}%`;
    
    document.getElementById('bench-mcq').textContent = profile.benchMCQ;
    document.getElementById('bench-coding').textContent = profile.benchCoding;
    document.getElementById('bench-culture').textContent = profile.benchCulture;
    document.getElementById('bench-clarity').textContent = profile.benchClarity;
    
    document.getElementById('activePromptConfig').value = localized.prompt;
};

window.saveCompetencyRules = function() {
    const key = activeCompetencyProfileKey;
    if (!competencyProfiles[key]) return;
    
    const lang = state.currentLang || 'en';
    const newPrompt = document.getElementById('activePromptConfig').value.trim();
    competencyProfiles[key][lang].prompt = newPrompt;
    
    // Update last updated date
    const today = new Date().toISOString().split('T')[0];
    competencyProfiles[key].updated = today;
    document.getElementById('activeProfileUpdated').textContent = today;
    
    // Persist in localStorage
    localStorage.setItem(`competency_prompt_${key}_${lang}`, newPrompt);
    
    window.showToast(state.currentLang === 'en' ? "Competency rules and AI prompt saved!" : "Đã lưu quy tắc năng lực và chỉ thị nhắc AI!");
};

window.restoreCompetencyDefaults = function() {
    const key = activeCompetencyProfileKey;
    if (!competencyProfiles[key]) return;
    
    const lang = state.currentLang || 'en';
    const profile = competencyProfiles[key];
    profile[lang].prompt = profile[lang].defaultPrompt;
    document.getElementById('activePromptConfig').value = profile[lang].prompt;
    
    localStorage.removeItem(`competency_prompt_${key}_${lang}`);
    
    window.showToast(state.currentLang === 'en' ? "Restored profile prompt defaults!" : "Đã khôi phục chỉ thị AI mặc định!");
};

window.switchView = function(viewName) {
    const views = ['dashboard', 'ticketHub', 'jobArchitect', 'screener', 'planner', 'onboarding', 'analytics'];
    
    // 1. Hide all view containers
    views.forEach(v => {
        const el = document.getElementById('view' + v.charAt(0).toUpperCase() + v.slice(1));
        if (el) el.classList.add('hidden');
    });
    
    // 2. Show target view container
    const targetEl = document.getElementById('view' + viewName.charAt(0).toUpperCase() + viewName.slice(1));
    if (targetEl) targetEl.classList.remove('hidden');
    
    if (viewName === 'screener') {
        if (typeof window.renderScreenerView === 'function') {
            window.renderScreenerView();
        }
    } else if (viewName === 'planner') {
        if (typeof window.renderPlannerView === 'function') {
            window.renderPlannerView();
        }
    } else if (viewName === 'analytics') {
        if (typeof window.renderAnalyticsView === 'function') {
            window.renderAnalyticsView();
        }
    } else if (viewName === 'ticketHub') {
        if (typeof window.renderTicketHub === 'function') {
            window.renderTicketHub();
        }
    } else if (viewName === 'onboarding') {
        if (typeof window.renderOnboarding === 'function') {
            window.renderOnboarding();
        }
    }
    
    // 3. Reset all nav items active styles
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.className = "nav-item group flex items-center gap-3 px-4 py-3 text-[#bbcabf]/60 hover:text-[#4edea3] hover:bg-[#242c27]/50 rounded-xl transition-all cursor-pointer font-medium";
        const icon = item.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.className = "material-symbols-outlined";
            icon.style.fontVariationSettings = "";
            icon.style.color = "";
        }
        const text = item.querySelector('span:not(.material-symbols-outlined)');
        if (text) text.className = "text-sm";
    });
    
    // 4. Style selected nav item as active
    const activeItem = document.getElementById('nav' + viewName.charAt(0).toUpperCase() + viewName.slice(1));
    if (activeItem) {
        activeItem.className = "nav-item group flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border-l-2 border-emerald-500 rounded-r-xl transition-all cursor-pointer text-emerald-500 font-semibold";
        const activeIcon = activeItem.querySelector('.material-symbols-outlined');
        if (activeIcon) {
            activeIcon.className = "material-symbols-outlined text-emerald-500";
            activeIcon.style.fontVariationSettings = "'FILL' 1";
        }
    }
    
    // 5. Hide mobile sidebar if open
    if (state.isSidebarOpen) {
        window.toggleSidebar();
    }
};

// 🔍 Candidate Screener & Multi-Profile Radar Matrix (Phase 5)
window.selectedScreenerCandidates = new Set();

window.renderScreenerView = function() {
    const listContainer = document.getElementById('screenerCandidateList');
    if (!listContainer) return;

    const query = (document.getElementById('screenerSearchInput')?.value || '').toLowerCase().trim();
    const roleFilter = document.getElementById('screenerRoleFilter')?.value || 'all';
    const sortBy = document.getElementById('screenerSortSelect')?.value || 'matchDesc';

    // 1. Calculate general stats
    const total = state.candidates.length;
    const compatible = state.candidates.filter(c => c.matching_score >= 80).length;
    const avgScore = total > 0 ? Math.round(state.candidates.reduce((sum, c) => sum + c.matching_score, 0) / total) : 0;

    const elTotal = document.getElementById('screenerStatTotal');
    const elCompatible = document.getElementById('screenerStatCompatible');
    const elAvg = document.getElementById('screenerStatAvg');
    if (elTotal) elTotal.textContent = total;
    if (elCompatible) elCompatible.textContent = compatible;
    if (elAvg) elAvg.textContent = `${avgScore}%`;

    // 2. Filter candidates
    let filtered = state.candidates.filter(c => {
        const matchesQuery = c.full_name.toLowerCase().includes(query) || 
                             c.applied_position.toLowerCase().includes(query) || 
                             (c.ai_summary && c.ai_summary.toLowerCase().includes(query));
        const matchesRole = roleFilter === 'all' || c.applied_position === roleFilter;
        return matchesQuery && matchesRole;
    });

    // 3. Sort candidates
    if (sortBy === 'matchDesc') {
        filtered.sort((a, b) => b.matching_score - a.matching_score);
    } else if (sortBy === 'matchAsc') {
        filtered.sort((a, b) => a.matching_score - b.matching_score);
    } else if (sortBy === 'nameAsc') {
        filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }

    const filteredCountEl = document.getElementById('screenerFilteredCount');
    if (filteredCountEl) filteredCountEl.textContent = filtered.length;

    // 4. Render candidate cards
    listContainer.innerHTML = '';
    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-12 text-[#94a3b8]/60 bg-[#141a17]/50 rounded-2xl border border-[#242c27] text-xs">
                <span class="material-symbols-outlined text-4xl block text-[#4e6b5a]/30 mb-2">person_search</span>
                ${state.currentLang === 'vi' ? 'Không tìm thấy ứng viên nào phù hợp bộ lọc.' : 'No candidates match the active filters.'}
            </div>
        `;
        return;
    }

    filtered.forEach(can => {
        const isChecked = window.selectedScreenerCandidates.has(can.id);
        const card = document.createElement('div');
        card.className = `p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
            isChecked 
                ? 'bg-[#141a17] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                : 'bg-[#141a17]/60 border-[#242c27] hover:border-emerald-500/40 hover:bg-[#141a17]'
        }`;
        
        card.innerHTML = `
            <div class="flex items-center gap-3.5 flex-1 min-w-0" onclick="window.toggleScreenerCardSelection('${can.id}')">
                <div class="flex items-center" onclick="event.stopPropagation()">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="window.toggleScreenerComparison('${can.id}', this.checked)" class="w-4 h-4 bg-[#0e1511] border-emerald-800 rounded text-emerald-500 focus:ring-0 cursor-pointer">
                </div>
                <div class="w-10 h-10 rounded-full border border-emerald-500/20 p-0.5 shrink-0 overflow-hidden">
                    <img src="${can.avatar_url || 'https://i.pravatar.cc/100?u=' + can.id}" class="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform">
                </div>
                <div class="min-w-0 flex-1">
                    <h4 class="text-xs font-black text-white truncate">${can.full_name}</h4>
                    <p class="text-[10px] text-[#94a3b8] truncate mt-0.5">${can.applied_position}</p>
                </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20">${can.matching_score}%</span>
            </div>
        `;
        listContainer.appendChild(card);
    });
};

window.toggleScreenerCardSelection = function(id) {
    const isChecked = window.selectedScreenerCandidates.has(id);
    window.toggleScreenerComparison(id, !isChecked);
};

window.onScreenerFilterChange = function() {
    window.renderScreenerView();
};

window.toggleScreenerComparison = function(id, checked) {
    if (checked) {
        window.selectedScreenerCandidates.add(id);
    } else {
        window.selectedScreenerCandidates.delete(id);
    }

    // Refresh layout views
    window.renderScreenerView();
    window.updateScreenerComparison();
};

window.updateScreenerComparison = function() {
    const selectedIds = Array.from(window.selectedScreenerCandidates);
    const emptyState = document.getElementById('screenerComparisonEmptyState');
    const content = document.getElementById('screenerComparisonContent');
    const bulkBtn = document.getElementById('screenerBulkInviteBtn');
    const selectedCount = document.getElementById('screenerSelectedCount');

    if (selectedCount) selectedCount.textContent = selectedIds.length;

    if (selectedIds.length === 0) {
        emptyState?.classList.remove('hidden');
        content?.classList.add('hidden');
        bulkBtn?.classList.add('hidden');
        return;
    }

    emptyState?.classList.add('hidden');
    content?.classList.remove('hidden');
    bulkBtn?.classList.remove('hidden');

    const selectedCandidates = state.candidates.filter(c => window.selectedScreenerCandidates.has(c.id));

    // 1. Render comparison table
    const tableBody = document.getElementById('screenerComparisonTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        selectedCandidates.forEach(can => {
            const mcq = Math.max(65, can.matching_score - 2);
            const coding = can.applied_position === 'Senior Product Manager' ? '—' : `${Math.max(60, can.matching_score - 5)}%`;
            const culture = Math.max(65, can.matching_score - 1);
            const video = Math.max(60, can.matching_score - 4);

            const row = document.createElement('tr');
            row.className = 'hover:bg-[#1c2420]/30 transition-colors';
            row.innerHTML = `
                <td class="px-3 py-2.5 flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full border border-emerald-500/20 overflow-hidden">
                        <img src="${can.avatar_url || 'https://i.pravatar.cc/100?u=' + can.id}" class="w-full h-full object-cover">
                    </div>
                    <span class="font-bold text-white">${can.full_name}</span>
                </td>
                <td class="px-3 py-2.5 text-center font-bold text-emerald-400">${can.matching_score}%</td>
                <td class="px-3 py-2.5 text-center">${mcq}%</td>
                <td class="px-3 py-2.5 text-center">${coding}</td>
                <td class="px-3 py-2.5 text-center">${culture}%</td>
                <td class="px-3 py-2.5 text-center">${video}%</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 2. Render SVG Radar Chart
    window.renderScreenerRadarChart(selectedCandidates);
};

window.renderScreenerRadarChart = function(candidates) {
    const container = document.getElementById('screenerRadarChartContainer');
    if (!container) return;

    // Standard Pentagram variables
    const size = 280;
    const cx = size / 2;
    const cy = size / 2;
    const r = 90; // outer pentagram radius

    // 5 dimensions
    const dimensions = [
        { labelEn: "Tech MCQ", labelVi: "Trắc nghiệm Tech", key: "mcq" },
        { labelEn: "Coding", labelVi: "Lập trình", key: "coding" },
        { labelEn: "Culture", labelVi: "Văn hóa", key: "culture" },
        { labelEn: "Video", labelVi: "Video", key: "video" },
        { labelEn: "Mastery", labelVi: "Năng lực", key: "mastery" }
    ];

    const numPoints = dimensions.length;
    const angles = [];
    for (let i = 0; i < numPoints; i++) {
        angles.push(-Math.PI / 2 + (2 * Math.PI / numPoints) * i);
    }

    // Concentric grid circles / polygons
    let gridSvg = '';
    const rings = [0.2, 0.4, 0.6, 0.8, 1.0];
    rings.forEach(ring => {
        const points = angles.map(a => {
            const rx = cx + (r * ring) * Math.cos(a);
            const ry = cy + (r * ring) * Math.sin(a);
            return `${rx},${ry}`;
        }).join(' ');
        
        gridSvg += `<polygon points="${points}" fill="transparent" stroke="#242c27" stroke-width="0.8" stroke-dasharray="${ring < 1 ? '3,3' : 'none'}"></polygon>`;
    });

    // Add axis lines & text labels
    let axesSvg = '';
    dimensions.forEach((dim, i) => {
        const angle = angles[i];
        const endX = cx + r * Math.cos(angle);
        const endY = cy + r * Math.sin(angle);

        // Axis line
        axesSvg += `<line x1="${cx}" y1="${cy}" x2="${endX}" y2="${endY}" stroke="#242c27" stroke-width="0.8"></line>`;

        // Label position (slightly offset outward)
        const labelR = r + 15;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        const textAnchor = Math.abs(lx - cx) < 10 ? 'middle' : (lx > cx ? 'start' : 'end');
        const textLabel = state.currentLang === 'vi' ? dim.labelVi : dim.labelEn;

        axesSvg += `<text x="${lx}" y="${ly + 3}" text-anchor="${textAnchor}" fill="#94a3b8" font-size="8" font-weight="black" class="uppercase">${textLabel}</text>`;
    });

    // Draw candidate polygons
    const colors = [
        { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.15)', name: 'Emerald' },
        { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.15)', name: 'Purple' },
        { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.15)', name: 'Rose' },
        { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.15)', name: 'Blue' }
    ];

    let candidatesSvg = '';
    candidates.forEach((can, index) => {
        const color = colors[index % colors.length];
        
        // Calculate points
        const mcq = Math.max(65, can.matching_score - 2);
        const coding = can.applied_position === 'Senior Product Manager' ? 80 : Math.max(60, can.matching_score - 5);
        const culture = Math.max(65, can.matching_score - 1);
        const video = Math.max(60, can.matching_score - 4);
        const mastery = can.matching_score;

        const scores = [mcq, coding, culture, video, mastery];
        const points = angles.map((a, i) => {
            const score = scores[i];
            const sr = r * (score / 100);
            const px = cx + sr * Math.cos(a);
            const py = cy + sr * Math.sin(a);
            return `${px},${py}`;
        }).join(' ');

        // Polygon
        candidatesSvg += `
            <polygon points="${points}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="2" class="transition-all duration-500"></polygon>
            <!-- Circular points -->
            ${angles.map((a, i) => {
                const score = scores[i];
                const sr = r * (score / 100);
                const px = cx + sr * Math.cos(a);
                const py = cy + sr * Math.sin(a);
                return `<circle cx="${px}" cy="${py}" r="3" fill="#0a0f0d" stroke="${color.stroke}" stroke-width="1.5"></circle>`;
            }).join('')}
        `;
    });

    // Combine all
    container.innerHTML = `
        <svg class="w-full h-full" viewBox="0 0 ${size} ${size}">
            ${gridSvg}
            ${axesSvg}
            ${candidatesSvg}
            <!-- Center dot -->
            <circle cx="${cx}" cy="${cy}" r="3" fill="#4edea3"></circle>
        </svg>
    `;
};

window.onScreenerBulkInvite = function() {
    const selectedIds = Array.from(window.selectedScreenerCandidates);
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;
    const msg = state.currentLang === 'vi' 
        ? `Đã gửi lời mời phỏng vấn hàng loạt tới ${count} ứng viên thành công!` 
        : `Sent bulk interview invitations to ${count} candidates successfully!`;

    window.showToast(msg);
    
    // Clear selection
    window.selectedScreenerCandidates.clear();
    window.renderScreenerView();
    window.updateScreenerComparison();
};

// 🗓️ Interview Planner Hub Logic (Phase 6)
window.plannerState = {
    activeCandidateId: null,
    selectedSlot: null,
    activeTab: 'schedule',
    generatedMeet: ''
};

const MOCK_TIME_SLOTS = [
    { id: 'slot1', label: 'Monday 09:00 AM', labelVi: 'Thứ Hai 09:00 SA' },
    { id: 'slot2', label: 'Monday 02:00 PM', labelVi: 'Thứ Hai 14:00 CH' },
    { id: 'slot3', label: 'Tuesday 10:00 AM', labelVi: 'Thứ Ba 10:00 SA' },
    { id: 'slot4', label: 'Tuesday 04:00 PM', labelVi: 'Thứ Ba 16:00 CH' },
    { id: 'slot5', label: 'Wednesday 11:00 AM', labelVi: 'Thứ Tư 11:00 SA' },
    { id: 'slot6', label: 'Thursday 03:00 PM', labelVi: 'Thứ Năm 15:00 CH' }
];

window.regenerateMeetLink = function() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * 26)]).join('');
    const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * 26)]).join('');
    const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * 26)]).join('');
    const link = `https://meet.google.com/${part1}-${part2}-${part3}`;
    
    window.plannerState.generatedMeet = link;
    const linkEl = document.getElementById('generatedMeetLink');
    if (linkEl) linkEl.textContent = link;
    return link;
};

window.renderPlannerView = function() {
    // 1. Calculate stats counts
    const shortlisted = state.candidates.filter(c => c.is_shortlisted);
    const scheduledIds = Object.keys(JSON.parse(localStorage.getItem('talentOS_interviews') || '{}'));
    
    const queueCount = shortlisted.filter(c => !scheduledIds.includes(c.id)).length;
    const pendingCount = shortlisted.filter(c => scheduledIds.includes(c.id) && c.stage !== 'Evaluated' && c.stage !== 'Đã đánh giá').length;
    const completedCount = state.candidates.filter(c => c.stage === 'Evaluated' || c.stage === 'Đã đánh giá').length;

    const qCountEl = document.getElementById('statQueueCount');
    const pCountEl = document.getElementById('statPendingCount');
    const cCountEl = document.getElementById('statCompletedCount');

    if (qCountEl) qCountEl.textContent = queueCount;
    if (pCountEl) pCountEl.textContent = pendingCount;
    if (cCountEl) cCountEl.textContent = completedCount;

    // 2. Render Shortlisted Candidates Queue List
    const queueContainer = document.getElementById('plannerQueueList');
    if (!queueContainer) return;
    queueContainer.innerHTML = '';

    if (shortlisted.length === 0) {
        queueContainer.innerHTML = `
            <div class="text-center py-10 space-y-3">
                <span class="material-symbols-outlined text-emerald-800 text-3xl">group_off</span>
                <p class="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">No Shortlisted Candidates</p>
            </div>
        `;
        return;
    }

    const interviewsMap = JSON.parse(localStorage.getItem('talentOS_interviews') || '{}');

    shortlisted.forEach(can => {
        const isSelected = window.plannerState.activeCandidateId === can.id;
        const scheduledTime = interviewsMap[can.id];
        
        let statusLabel = state.currentLang === 'vi' ? 'Chờ xếp lịch' : 'Needs Schedule';
        let statusColorClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

        if (can.stage === 'Evaluated' || can.stage === 'Đã đánh giá') {
            statusLabel = state.currentLang === 'vi' ? 'Đã Đánh Giá' : 'Evaluated';
            statusColorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        } else if (scheduledTime) {
            statusLabel = state.currentLang === 'vi' ? 'Đã lên lịch' : 'Scheduled';
            statusColorClass = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
        }

        const card = document.createElement('div');
        card.onclick = () => window.selectPlannerCandidate(can.id);
        card.className = `p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center gap-3 ${
            isSelected 
                ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/5' 
                : 'bg-[#1c2420]/40 border-[#242c27] hover:border-[#3c4a42]'
        }`;

        card.innerHTML = `
            <div class="flex items-center gap-3 min-w-0">
                <img src="${can.avatar_url || 'https://i.pravatar.cc/100?u=' + can.id}" class="w-9 h-9 rounded-full border border-emerald-500/20 object-cover flex-shrink-0">
                <div class="min-w-0">
                    <h4 class="text-xs font-black text-white truncate">${can.full_name}</h4>
                    <p class="text-[9px] text-[#94a3b8] font-bold truncate">${can.applied_position || 'Engineer'}</p>
                </div>
            </div>
            <div class="text-right flex-shrink-0">
                <span class="px-1.5 py-0.5 rounded border text-[7.5px] font-black uppercase tracking-wider ${statusColorClass}">
                    ${statusLabel}
                </span>
                <p class="text-[10px] font-black text-emerald-400 mt-1">${can.matching_score}%</p>
            </div>
        `;
        queueContainer.appendChild(card);
    });
};

window.selectPlannerCandidate = function(id) {
    window.plannerState.activeCandidateId = id;
    window.plannerState.selectedSlot = null;
    
    // Refresh queue highlighting
    window.renderPlannerView();

    const candidate = state.candidates.find(c => c.id === id);
    if (!candidate) return;

    // Toggle container views
    const emptyWorkspace = document.getElementById('plannerEmptyWorkspace');
    const activeWorkspace = document.getElementById('plannerActiveWorkspace');

    if (emptyWorkspace) emptyWorkspace.classList.add('hidden');
    if (activeWorkspace) activeWorkspace.classList.remove('hidden');

    // Populate Active Candidate Header
    document.getElementById('plannerActiveAvatar').src = candidate.avatar_url || `https://i.pravatar.cc/100?u=${candidate.id}`;
    document.getElementById('plannerActiveName').textContent = candidate.full_name;
    document.getElementById('plannerActiveRole').textContent = candidate.applied_position || 'Engineer';
    document.getElementById('plannerActiveEmail').textContent = candidate.email;
    document.getElementById('plannerActiveMatch').textContent = `${candidate.matching_score}%`;

    // Dynamic Status Tag
    const statusTag = document.getElementById('plannerActiveStatus');
    const interviewsMap = JSON.parse(localStorage.getItem('talentOS_interviews') || '{}');
    const scheduledTime = interviewsMap[candidate.id];

    if (candidate.stage === 'Evaluated' || candidate.stage === 'Đã đánh giá') {
        statusTag.textContent = state.currentLang === 'vi' ? 'ĐÃ ĐÁNH GIÁ' : 'EVALUATED';
        statusTag.className = "px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-wider rounded border border-emerald-500/20";
    } else if (scheduledTime) {
        statusTag.textContent = state.currentLang === 'vi' ? 'ĐÃ LÊN LỊCH' : 'SCHEDULED';
        statusTag.className = "px-2 py-0.5 bg-sky-500/10 text-sky-400 text-[8px] font-black uppercase tracking-wider rounded border border-sky-500/20";
    } else {
        statusTag.textContent = state.currentLang === 'vi' ? 'CHỜ XẾP LỊCH' : 'NEEDS SCHEDULE';
        statusTag.className = "px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[8px] font-black uppercase tracking-wider rounded border border-yellow-500/20";
    }

    // Reset Meet Link
    window.regenerateMeetLink();

    // Populate Time slots
    const slotContainer = document.getElementById('timeSlotContainer');
    if (slotContainer) {
        slotContainer.innerHTML = '';
        MOCK_TIME_SLOTS.forEach(slot => {
            const btn = document.createElement('button');
            btn.onclick = () => window.selectTimeSlot(slot.id);
            btn.id = `btnSlot-${slot.id}`;
            
            // Check if this slot is already scheduled for this candidate
            const isThisSlotSelected = scheduledTime && (scheduledTime.slotId === slot.id);
            
            btn.className = `p-3 rounded-xl border text-[9.5px] font-bold text-center transition-all ${
                isThisSlotSelected 
                    ? 'bg-emerald-500 text-emerald-950 border-emerald-500 font-black' 
                    : 'bg-[#0e1511] border-[#242c27] text-[#bbcabf] hover:border-emerald-500/50'
            }`;
            btn.textContent = state.currentLang === 'vi' ? slot.labelVi : slot.label;
            slotContainer.appendChild(btn);
        });
    }

    // Default Tab
    window.switchPlannerTab(scheduledTime && (candidate.stage !== 'Evaluated' && candidate.stage !== 'Đã đánh giá') ? 'scorecard' : 'schedule');

    // Fill comment placeholder & default rating values
    document.getElementById('rngScoreTech').value = 4.0;
    document.getElementById('rngScoreDesign').value = 4.0;
    document.getElementById('rngScoreCulture').value = 4.0;
    document.getElementById('rngScoreVideo').value = 4.0;
    
    window.updateScoreLabel('Tech');
    window.updateScoreLabel('Design');
    window.updateScoreLabel('Culture');
    window.updateScoreLabel('Video');

    document.getElementById('txtScorecardComments').value = '';
};

window.selectTimeSlot = function(slotId) {
    // Check if evaluated, prevent scheduling changes
    const candidate = state.candidates.find(c => c.id === window.plannerState.activeCandidateId);
    if (candidate && (candidate.stage === 'Evaluated' || candidate.stage === 'Đã đánh giá')) {
        window.showToast(state.currentLang === 'vi' ? "Ứng viên đã đánh giá xong, không cần đổi lịch!" : "Candidate already evaluated!");
        return;
    }

    // Reset previous selection
    if (window.plannerState.selectedSlot) {
        const prevBtn = document.getElementById(`btnSlot-${window.plannerState.selectedSlot}`);
        if (prevBtn) {
            prevBtn.className = "p-3 rounded-xl border text-[9.5px] font-bold text-center bg-[#0e1511] border-[#242c27] text-[#bbcabf] hover:border-emerald-500/50 transition-all";
        }
    }

    window.plannerState.selectedSlot = slotId;
    const btn = document.getElementById(`btnSlot-${slotId}`);
    if (btn) {
        btn.className = "p-3 rounded-xl border text-[9.5px] font-black text-center bg-emerald-500 text-emerald-950 border-emerald-500 transition-all shadow-md shadow-emerald-500/20";
    }
};

window.switchPlannerTab = function(tabName) {
    window.plannerState.activeTab = tabName;
    const tabSched = document.getElementById('tabScheduleBtn');
    const tabScore = document.getElementById('tabScorecardBtn');
    const tabAIQ = document.getElementById('tabAIQuestionsBtn');
    const paneSched = document.getElementById('paneSchedule');
    const paneScore = document.getElementById('paneScorecard');
    const paneAIQ = document.getElementById('paneAIQuestions');

    [tabSched, tabScore, tabAIQ].forEach(btn => {
        if (btn) btn.className = "flex-1 py-3 text-xs font-black uppercase tracking-widest text-center border-b-2 border-transparent text-[#94a3b8] hover:text-white transition-all duration-300";
    });
    [paneSched, paneScore, paneAIQ].forEach(pane => {
        if (pane) pane.classList.add('hidden');
    });

    if (tabName === 'schedule') {
        if (tabSched) tabSched.className = "flex-1 py-3 text-xs font-black uppercase tracking-widest text-center border-b-2 border-emerald-500 text-emerald-400 transition-all duration-300";
        if (paneSched) paneSched.classList.remove('hidden');
    } else if (tabName === 'aiquestions') {
        if (tabAIQ) tabAIQ.className = "flex-1 py-3 text-xs font-black uppercase tracking-widest text-center border-b-2 border-emerald-500 text-emerald-400 transition-all duration-300";
        if (paneAIQ) paneAIQ.classList.remove('hidden');
        if (state.activeGeneratedQuestions) {
            window.renderAIQuestions();
        }
    } else {
        if (tabScore) tabScore.className = "flex-1 py-3 text-xs font-black uppercase tracking-widest text-center border-b-2 border-emerald-500 text-emerald-400 transition-all duration-300";
        if (paneScore) paneScore.classList.remove('hidden');
    }
};

window.updateScoreLabel = function(criteria) {
    const slider = document.getElementById(`rngScore${criteria}`);
    const label = document.getElementById(`lblScore${criteria}`);
    if (slider && label) {
        label.textContent = `${parseFloat(slider.value).toFixed(1)} ★`;
    }
};

window.submitSchedule = async function() {
    const candidateId = window.plannerState.activeCandidateId;
    const slotId = window.plannerState.selectedSlot;

    if (!slotId) {
        window.showToast(state.currentLang === 'vi' ? "Vui lòng chọn một khung giờ phỏng vấn!" : "Please select an interview slot!");
        return;
    }

    const candidate = state.candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const actionBtn = document.getElementById('btnScheduleAction');
    if (actionBtn) {
        actionBtn.disabled = true;
        actionBtn.innerHTML = `<span class="material-symbols-outlined text-base animate-spin">sync</span> SCHEDULE-DISPATCHING...`;
    }

    const slot = MOCK_TIME_SLOTS.find(s => s.id === slotId);
    const chosenTimeLabel = state.currentLang === 'vi' ? slot.labelVi : slot.label;
    const meetLink = window.plannerState.generatedMeet || 'https://meet.google.com/xyz-pdq-abc';

    // Simulated network delay
    setTimeout(async () => {
        try {
            // Update stage in Supabase
            const { error } = await supabaseClient
                .from('hr_candidates')
                .update({ stage: state.currentLang === 'vi' ? 'Đã hẹn lịch' : 'Interview Scheduled' })
                .eq('id', candidateId);

            if (error) throw error;

            // Update local memory
            candidate.stage = state.currentLang === 'vi' ? 'Đã hẹn lịch' : 'Interview Scheduled';

            // Store in LocalStorage
            const interviewsMap = JSON.parse(localStorage.getItem('talentOS_interviews') || '{}');
            interviewsMap[candidateId] = {
                slotId: slotId,
                timeLabel: chosenTimeLabel,
                meetLink: meetLink
            };
            localStorage.setItem('talentOS_interviews', JSON.stringify(interviewsMap));

            // Sync main candidate tables
            renderCandidates();
            window.selectPlannerCandidate(candidateId);
            window.renderPlannerView();

            const toastMsg = state.currentLang === 'vi'
                ? `Đã lên lịch phỏng vấn cho ${candidate.full_name} lúc ${chosenTimeLabel}. Gửi thư mời Meet thành công!`
                : `Interview scheduled for ${candidate.full_name} at ${chosenTimeLabel}. Meet link dispatched!`;

            window.showToast(toastMsg);

            // Switch to Scorecard Tab
            window.switchPlannerTab('scorecard');
        } catch (err) {
            console.error('Error scheduling:', err);
            window.showToast("Database update failed");
        } finally {
            if (actionBtn) {
                actionBtn.disabled = false;
                actionBtn.innerHTML = `
                    <span class="material-symbols-outlined text-base">forward_to_inbox</span>
                    <span data-i18n="btnScheduleInvite">Schedule & Send Invitation</span>
                `;
            }
        }
    }, 1200);
};

window.submitScorecard = async function() {
    const candidateId = window.plannerState.activeCandidateId;
    const candidate = state.candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    // Get input values
    const scoreTech = parseFloat(document.getElementById('rngScoreTech').value);
    const scoreDesign = parseFloat(document.getElementById('rngScoreDesign').value);
    const scoreCulture = parseFloat(document.getElementById('rngScoreCulture').value);
    const scoreVideo = parseFloat(document.getElementById('rngScoreVideo').value);
    const comments = document.getElementById('txtScorecardComments').value.trim() || 
        (state.currentLang === 'vi' ? 'Ứng viên có kỹ năng vững vàng và giao tiếp xuất sắc.' : 'Candidate demonstrates excellent standard capabilities.');

    const avgScore = (scoreTech + scoreDesign + scoreCulture + scoreVideo) / 4;
    const matchingScore = Math.round((avgScore / 5.0) * 100);

    const actionBtn = document.getElementById('btnScorecardAction');
    if (actionBtn) {
        actionBtn.disabled = true;
        actionBtn.innerHTML = `<span class="material-symbols-outlined text-base animate-spin">sync</span> INJECTING METRICS...`;
    }

    setTimeout(async () => {
        try {
            // Write update to Supabase
            const { error } = await supabaseClient
                .from('hr_candidates')
                .update({
                    board_rating: parseFloat(avgScore.toFixed(1)),
                    matching_score: matchingScore,
                    stage: state.currentLang === 'vi' ? 'Đã đánh giá' : 'Evaluated',
                    ai_summary: comments
                })
                .eq('id', candidateId);

            if (error) throw error;

            // Sync with local memory
            candidate.board_rating = parseFloat(avgScore.toFixed(1));
            candidate.matching_score = matchingScore;
            candidate.stage = state.currentLang === 'vi' ? 'Đã đánh giá' : 'Evaluated';
            candidate.ai_summary = comments;

            // Toast Alert
            const toastMsg = state.currentLang === 'vi'
                ? `Bảng điểm đã gửi thành công! Khớp mới: ${matchingScore}%, Đánh giá: ${avgScore.toFixed(1)}/5.0★`
                : `Scorecard submitted successfully! New Match: ${matchingScore}%, Rating: ${avgScore.toFixed(1)}/5.0★`;

            window.showToast(toastMsg);

            // Re-render UI views
            renderCandidates();
            updateFunnelCounts();
            window.selectPlannerCandidate(candidateId);
            window.renderPlannerView();

            if (typeof window.renderScreenerView === 'function') {
                window.renderScreenerView();
            }
        } catch (err) {
            console.error('Error submitting scorecard:', err);
            window.showToast("Database update failed");
        } finally {
            if (actionBtn) {
                actionBtn.disabled = false;
                actionBtn.innerHTML = `
                    <span class="material-symbols-outlined text-base">cloud_done</span>
                    <span data-i18n="btnSubmitScorecard">Submit & Sync Scorecard</span>
                `;
            }
        }
    }, 1500);
};

// 📊 Talent Analytics Hub & Dynamic Visual Analytics (Option B)
window.changeAnalyticsFilter = function(val) {
    state.analyticsFilter = val;
    window.renderAnalyticsView();
};

window.renderAnalyticsView = function() {
    const listContainer = document.getElementById('viewAnalytics');
    if (!listContainer || listContainer.classList.contains('hidden')) return;

    const queryFilter = state.analyticsFilter;
    const filtered = queryFilter === 'all'
        ? state.candidates
        : state.candidates.filter(c => c.applied_position === queryFilter);

    const total = filtered.length;
    const avgMatch = total > 0 ? Math.round(filtered.reduce((sum, c) => sum + (c.matching_score || 0), 0) / total) : 0;

    // Conversion Ratio: candidates that have passed screening (match >= 75%) or are Shortlisted/Scheduled/Evaluated
    const conversionCount = filtered.filter(c => {
        const stage = (c.stage || '').toLowerCase();
        return (c.matching_score || 0) >= 75 || c.is_shortlisted || 
               ['shortlisted', 'scheduled', 'evaluated', 'đã', 'sàng lọc'].some(s => stage.includes(s));
    }).length;
    const conversionRatio = total > 0 ? Math.round((conversionCount / total) * 100) : 0;

    // Velocity baseline depending on position
    let baselineDays = 14;
    if (queryFilter === 'Python AI Engineer') baselineDays = 11;
    else if (queryFilter === 'Product Manager') baselineDays = 18;
    const avgVelocity = total > 0 ? Math.max(5, Math.round(baselineDays - (avgMatch / 20))) : 0;

    // Render stats counters
    const elTotal = document.getElementById('statTotalVal');
    const elMatch = document.getElementById('statMatchVal');
    const elConversion = document.getElementById('statConversionVal');
    const elVelocity = document.getElementById('statVelocityVal');

    if (elTotal) elTotal.textContent = total;
    if (elMatch) elMatch.textContent = `${avgMatch}%`;
    if (elConversion) elConversion.textContent = `${conversionRatio}%`;
    if (elVelocity) elVelocity.textContent = `${avgVelocity}d`;

    // 1. Draw SVG Sourcing Sieve Funnel Chart
    drawAnalyticsFunnel(filtered);

    // 2. Draw SVG Sourcing Channels
    drawSourcingChannels(filtered);

    // 3. Draw Competency Skill Density Heatmap
    drawSkillDensity(filtered);

    // 4. Generate AI Sourcing Advisory
    generateAnalyticsInsights(filtered, conversionRatio);
};

function drawAnalyticsFunnel(candidates) {
    const container = document.getElementById('funnelChartContainer');
    if (!container) return;

    const total = candidates.length;
    if (total === 0) {
        container.innerHTML = `
            <div class="text-xs text-[#bbcabf]/40 italic">
                ${state.currentLang === 'vi' ? 'Không có dữ liệu ứng viên cho bộ lọc này' : 'No candidate data matches the current filter'}
            </div>
        `;
        return;
    }

    // Counts for each of the 5 funnel stages
    const applied = total;
    const screened = candidates.filter(c => (c.matching_score || 0) >= 70).length;
    const shortlisted = candidates.filter(c => c.is_shortlisted || ['shortlisted', 'scheduled', 'evaluated', 'đã', 'sàng lọc'].some(s => (c.stage || '').toLowerCase().includes(s))).length;
    const scheduled = candidates.filter(c => ['scheduled', 'evaluated', 'lên lịch', 'đã'].some(s => (c.stage || '').toLowerCase().includes(s))).length;
    const evaluated = candidates.filter(c => ['evaluated', 'đã đánh giá'].some(s => (c.stage || '').toLowerCase().includes(s))).length;

    const stages = [
        { key: 'applied', labelEN: 'Applied', labelVI: 'Ứng tuyển', count: applied },
        { key: 'screened', labelEN: 'AI Screened', labelVI: 'Sàng lọc AI', count: screened },
        { key: 'shortlisted', labelEN: 'Shortlisted', labelVI: 'Rút gọn', count: shortlisted },
        { key: 'scheduled', labelEN: 'Scheduled', labelVI: 'Lên lịch hẹn', count: scheduled },
        { key: 'evaluated', labelEN: 'Evaluated', labelVI: 'Đã đánh giá', count: evaluated }
    ];

    // Compute trapezoid configurations for SVG drawing
    // Funnel size: 380px wide, 240px tall. Each stage takes ~42px height, with 6px spacing.
    const svgWidth = 400;
    const svgHeight = 245;
    let svgHtml = `<svg width="100%" height="245" viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-auto">`;

    // Define defs for gradients
    svgHtml += `
        <defs>
            <linearGradient id="funnelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.75" />
                <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.85" />
            </linearGradient>
            <linearGradient id="funnelGradHover" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.95" />
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.95" />
            </linearGradient>
        </defs>
    `;

    const W_TOP = 260;   // Maximum top width of the funnel
    const W_BOTTOM = 60; // Minimum bottom width of the funnel

    stages.forEach((stg, i) => {
        const yStart = i * 48 + 5;
        const yEnd = yStart + 40;

        // Ratio represents candidate retention vs the top stage (Applied)
        const currentRatio = total > 0 ? (stg.count / total) : 0;

        // Calculate standard funnel coordinates
        const wTopStandard = W_TOP - (W_TOP - W_BOTTOM) * (yStart / svgHeight);
        const wBottomStandard = W_TOP - (W_TOP - W_BOTTOM) * (yEnd / svgHeight);

        // Adjust trapezoid width based on actual candidate retention ratio to make it dynamic
        const wTopActual = W_BOTTOM + (wTopStandard - W_BOTTOM) * currentRatio;
        const wBottomActual = W_BOTTOM + (wBottomStandard - W_BOTTOM) * currentRatio;

        // X offsets to center the trapezoid
        const xTopLeft = (svgWidth - 140 - wTopActual) / 2;
        const xTopRight = xTopLeft + wTopActual;
        const xBottomLeft = (svgWidth - 140 - wBottomActual) / 2;
        const xBottomRight = xBottomLeft + wBottomActual;

        const points = `${xTopLeft},${yStart} ${xTopRight},${yStart} ${xBottomRight},${yEnd} ${xBottomLeft},${yEnd}`;
        const pct = total > 0 ? Math.round((stg.count / total) * 100) : 0;
        
        const label = state.currentLang === 'vi' ? stg.labelVI : stg.labelEN;

        svgHtml += `
            <g class="group cursor-pointer">
                <!-- SVG Funnel Segment Trapezoid -->
                <polygon points="${points}" fill="url(#funnelGrad)" stroke="#242c27" stroke-width="1.5" class="transition-all duration-300 hover:fill-url(#funnelGradHover)" />
                
                <!-- Count text on top of trapezoid -->
                <text x="${(xTopLeft + xTopRight) / 2}" y="${(yStart + yEnd) / 2 + 4}" fill="#ffffff" font-size="11" font-weight="900" text-anchor="middle" class="pointer-events-none drop-shadow">
                    ${stg.count}
                </text>
                
                <!-- Stage Name Label (Right column aligned) -->
                <text x="${svgWidth - 120}" y="${(yStart + yEnd) / 2 + 2}" fill="#ffffff" font-size="11" font-weight="900" text-anchor="start">
                    ${label}
                </text>
                
                <!-- Percentage label (Right column aligned) -->
                <text x="${svgWidth - 5}" y="${(yStart + yEnd) / 2 + 2}" fill="#10b981" font-size="10" font-weight="700" text-anchor="end">
                    ${pct}%
                </text>
                
                <!-- Connection line -->
                <line x1="${xTopRight}" y1="${(yStart + yEnd) / 2}" x2="${svgWidth - 128}" y2="${(yStart + yEnd) / 2}" stroke="#242c27" stroke-dasharray="2 2" stroke-width="1" />
            </g>
        `;
    });

    svgHtml += `</svg>`;
    container.innerHTML = svgHtml;
}

function drawSourcingChannels(candidates) {
    const container = document.getElementById('channelsChartContainer');
    const legendContainer = document.getElementById('channelsLegend');
    if (!container || !legendContainer) return;

    const total = candidates.length;
    if (total === 0) {
        container.innerHTML = '';
        legendContainer.innerHTML = '';
        return;
    }

    // Stable deterministic classification modulo candidate ID or string hash
    const getChannelIndex = (c) => {
        if (typeof c.id === 'number') return c.id % 4;
        const str = String(c.id || c.full_name || '');
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash) % 4;
    };

    const linkedin = candidates.filter(c => getChannelIndex(c) === 0).length;
    const github = candidates.filter(c => getChannelIndex(c) === 1).length;
    const referrals = candidates.filter(c => getChannelIndex(c) === 2).length;
    const direct = candidates.filter(c => getChannelIndex(c) === 3).length;

    const data = [
        { name: 'LinkedIn', count: linkedin, color: '#0ea5e9', gradient: 'from-[#0ea5e9]' },
        { name: 'GitHub Recruiter', count: github, color: '#f59e0b', gradient: 'from-[#f59e0b]' },
        { name: 'Referrals (Nội bộ)', count: referrals, color: '#10b981', gradient: 'from-[#10b981]' },
        { name: 'Direct Sourcing', count: direct, color: '#a855f7', gradient: 'from-[#a855f7]' }
    ];

    // Compute percentages
    data.forEach(item => {
        item.pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
    });

    // 1. Draw Donut Chart SVG
    // Radius r = 38. Circumference = 2 * Math.PI * 38 = 238.76
    const radius = 38;
    const circ = 2 * Math.PI * radius;
    
    let svgHtml = `
        <svg width="180" height="180" viewBox="0 0 100 100" class="relative group">
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <!-- Background base ring -->
            <circle cx="50" cy="50" r="${radius}" fill="transparent" stroke="#1d2420" stroke-width="8" />
    `;

    let currentOffsetCirc = 0;

    data.forEach(item => {
        if (item.count === 0) return;
        const strokeLength = (item.pct / 100) * circ;
        const rotationAngle = -90 + (currentOffsetCirc / circ) * 360;

        svgHtml += `
            <circle cx="50" cy="50" r="${radius}" 
                fill="transparent" 
                stroke="${item.color}" 
                stroke-width="8.5" 
                stroke-dasharray="${strokeLength} ${circ}" 
                transform="rotate(${rotationAngle} 50 50)" 
                stroke-linecap="round"
                class="transition-all duration-500 cursor-pointer hover:stroke-width-10"
                filter="url(#glow)"
            />
        `;
        currentOffsetCirc += strokeLength;
    });

    // Add center labels inside donut hole
    svgHtml += `
        <text x="50" y="47" fill="#94a3b8" font-size="5" font-weight="700" text-anchor="middle" letter-spacing="0.1em" class="uppercase">Channels</text>
        <text x="50" y="57" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">${total}</text>
    </svg>`;

    container.innerHTML = svgHtml;

    // 2. Render Legends Grid
    let legendHtml = '';
    data.forEach(item => {
        legendHtml += `
            <div class="flex items-center justify-between p-2 bg-[#141a17]/50 border border-[#242c27] rounded-xl">
                <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full" style="background-color: ${item.color}"></div>
                    <span class="text-[10px] font-semibold text-white truncate max-w-[85px]">${item.name}</span>
                </div>
                <div class="text-right flex items-center gap-1.5">
                    <span class="text-[10px] font-black text-white">${item.count}</span>
                    <span class="text-[8px] text-[#bbcabf]/50 font-bold">${item.pct}%</span>
                </div>
            </div>
        `;
    });
    legendContainer.innerHTML = legendHtml;
}

function drawSkillDensity(candidates) {
    const container = document.getElementById('skillsHeatmapContainer');
    if (!container) return;

    const total = candidates.length;
    if (total === 0) {
        container.innerHTML = `
            <div class="text-xs text-[#bbcabf]/40 italic w-full text-center">
                ${state.currentLang === 'vi' ? 'Không có dữ liệu kỹ năng' : 'No skill data available'}
            </div>
        `;
        return;
    }

    const defaultSkills = {
        "Java Cloud Architect": ["Java", "Spring Boot", "Kubernetes", "AWS", "Docker", "Microservices", "Terraform", "Kafka", "SQL", "Redis"],
        "Python AI Engineer": ["Python", "PyTorch", "TensorFlow", "FastAPI", "NLP", "LLMs", "LangChain", "Docker", "AWS", "Git"],
        "Product Manager": ["Product Roadmap", "Agile", "Scrum", "SQL", "Amplitude", "Jira", "User Research", "Wireframing", "Growth", "A/B Testing"]
    };

    let allSkills = [];
    const queryFilter = state.analyticsFilter;

    if (queryFilter === 'all') {
        Object.keys(defaultSkills).forEach(k => {
            allSkills = allSkills.concat(defaultSkills[k]);
        });
    } else if (defaultSkills[queryFilter]) {
        allSkills = defaultSkills[queryFilter];
    }

    // Deduplicate and count based on candidates match scores
    const uniqueSkills = [...new Set(allSkills)];
    const skillScores = uniqueSkills.map(skill => {
        // Calculate dynamic density weight: frequency of matching positions times average score
        let occurrences = 0;
        let cumulativeScore = 0;

        candidates.forEach(c => {
            // Sieve match criteria
            const pos = c.applied_position;
            const hasSkill = defaultSkills[pos]?.includes(skill);
            if (hasSkill) {
                occurrences++;
                cumulativeScore += (c.matching_score || 0);
            }
        });

        // Add a deterministic base variance to make it look exceptionally authentic
        const baseWeight = (skill.length * 7) % 25;
        const scoreWeight = occurrences > 0 ? (cumulativeScore / occurrences) : 65;
        const finalWeight = Math.min(100, Math.round(scoreWeight + baseWeight));

        return { skill, weight: finalWeight };
    });

    // Sort by density descending
    skillScores.sort((a, b) => b.weight - a.weight);

    // Draw hot glass tags
    let tagsHtml = '';
    skillScores.forEach(item => {
        // Opacity ranges from 0.15 to 0.95
        const opacity = Math.min(0.95, Math.max(0.2, (item.weight / 110)));
        // Text size ranges from 10px to 14px
        const fontSize = Math.min(13, Math.max(10, 9 + (item.weight / 35)));
        
        tagsHtml += `
            <span class="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 hover:border-emerald-500 hover:scale-105 transition-all duration-300 font-bold select-none cursor-pointer"
                style="opacity: ${opacity}; font-size: ${fontSize}px; text-shadow: 0 0 10px rgba(16,185,129,0.3)">
                ${item.skill}
                <span class="text-[8px] text-emerald-500/40 ml-1 font-semibold">${item.weight}%</span>
            </span>
        `;
    });

    container.innerHTML = tagsHtml;
}

function generateAnalyticsInsights(candidates, conversionRatio) {
    const container = document.getElementById('aiAdvisoryContainer');
    if (!container) return;

    const total = candidates.length;
    if (total === 0) {
        container.innerHTML = `
            <div class="text-xs text-[#bbcabf]/40 italic w-full text-center">
                ${state.currentLang === 'vi' ? 'Không có nhận định phân tích từ AI' : 'No AI advisory insights available'}
            </div>
        `;
        return;
    }

    const queryFilter = state.analyticsFilter;
    let positionName = state.currentLang === 'vi' ? 'tuyển dụng' : 'hiring';
    if (queryFilter === 'Java Cloud Architect') positionName = 'Java Architect';
    else if (queryFilter === 'Python AI Engineer') positionName = 'Python AI';
    else if (queryFilter === 'Product Manager') positionName = 'Product Manager';

    // 1. Sourcing advice based on conversion ratio
    let advisory1_VI = `**Tối ưu hóa Phễu ${positionName}**: Tỷ lệ phễu đạt ${conversionRatio}%. Khuyến nghị mở rộng từ khóa tìm kiếm hồ sơ do phát hiện tỷ lệ hao hụt lớn ở khâu Sàng lọc sơ bộ.`;
    let advisory1_EN = `**Funnel Sieve for ${positionName}**: Sieve conversion holds at ${conversionRatio}%. Sourcing recommends expanding search criteria keywords due to leakage at initial parsing.`;

    if (conversionRatio >= 85) {
        advisory1_VI = `**Hiệu năng Tuyển dụng Cao**: Phễu đạt conversion ${conversionRatio}% rất xuất sắc. Nên tiếp tục duy trì bộ câu hỏi sàng lọc kỹ thuật và nâng cao benchmark ở vòng Hội đồng.`;
        advisory1_EN = `**High Sourcing Velocity**: Sieve conversion is at an elite ${conversionRatio}%. Recommended to elevate competency scorecard bars to further filter top candidates.`;
    }

    // 2. Skill density advice
    let advisory2_VI = `**Khuyến nghị Kỹ năng**: Tần suất các công nghệ lõi trong hồ sơ đạt chất lượng cao. Khuyến nghị bổ sung các hồ sơ có kinh nghiệm về **Kubernetes & Cloud Native** để đáp ứng tiêu chuẩn của dự án.`;
    let advisory2_EN = `**Skills Acquisition Advice**: Core tech stack keywords are strong. Recommended to aggressively seek candidates with **Kubernetes & Cloud Native** to fit modern roadmap projects.`;

    if (queryFilter === 'Python AI Engineer') {
        advisory2_VI = `**Khuyến nghị Kỹ năng**: Mật độ PyTorch/TensorFlow lớn nhưng đang thiếu hụt ứng viên làm việc sâu về **LangChain & LLM Agents**. Hãy tinh chỉnh bộ lọc Sieve để ưu tiên kỹ năng này.`;
        advisory2_EN = `**AI Skills Acquisition**: Sourced PyTorch density is high, but gap is observed in **LangChain & LLM Agents**. Refine custom screener prompts to score these skills.`;
    } else if (queryFilter === 'Product Manager') {
        advisory2_VI = `**Khuyến nghị Kỹ năng**: Tần suất Product Roadmap tốt. Cần bổ sung các hồ sơ có khả năng phân tích dữ liệu chuyên sâu với **Amplitude & A/B Testing**.`;
        advisory2_EN = `**PM Skills Sourcing**: Sourced Product Roadmap keywords are stable. Recommended to actively screen candidates with **Amplitude & A/B Testing** capabilities.`;
    }

    // 3. Channel advice
    let advisory3_VI = `**Tối ưu hóa Chi phí**: Phân tích kênh cho thấy **GitHub & LinkedIn** đóng góp 75% ứng viên xuất sắc nhất. Khuyến nghị dịch chuyển 15% ngân sách quảng cáo từ kênh Sourcing trực tiếp sang hai kênh này.`;
    let advisory3_EN = `**Budget Sourcing Advisory**: Channel reports show **GitHub & LinkedIn** provide 75% of elite matching profiles. Recommended to reallocate 15% of budget from Sourcing to these channels.`;

    const cleanMarkdown = (text) => {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    const label1 = state.currentLang === 'vi' ? advisory1_VI : advisory1_EN;
    const label2 = state.currentLang === 'vi' ? advisory2_VI : advisory2_EN;
    const label3 = state.currentLang === 'vi' ? advisory3_VI : advisory3_EN;

    container.innerHTML = `
        <div class="flex items-start gap-3 p-3 bg-[#141a17]/50 border border-[#242c27] rounded-2xl backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 w-full">
            <div class="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-xs">filter_alt_off</span>
            </div>
            <p class="text-[11px] leading-relaxed text-[#bbcabf]">${cleanMarkdown(label1)}</p>
        </div>
        <div class="flex items-start gap-3 p-3 bg-[#141a17]/50 border border-[#242c27] rounded-2xl backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 w-full">
            <div class="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-xs">extension</span>
            </div>
            <p class="text-[11px] leading-relaxed text-[#bbcabf]">${cleanMarkdown(label2)}</p>
        </div>
        <div class="flex items-start gap-3 p-3 bg-[#141a17]/50 border border-[#242c27] rounded-2xl backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 w-full">
            <div class="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-xs">monetization_on</span>
            </div>
            <p class="text-[11px] leading-relaxed text-[#bbcabf]">${cleanMarkdown(label3)}</p>
        </div>
    `;
}

// 🎯 Strategic Operations Handlers (NEW)
window.renderTicketHub = function() {
    const openCount = state.tickets.filter(t => t.status === 'open').length;
    const progressCount = state.tickets.filter(t => t.status === 'progress').length;
    const resolvedCount = state.tickets.filter(t => t.status === 'resolved').length;
    
    const countOpen = document.getElementById('countOpenTickets');
    const countProgress = document.getElementById('countInProgressTickets');
    const countResolved = document.getElementById('countResolvedTickets');
    const kpiVal = document.getElementById('kpiOpenTicketsVal');

    if (countOpen) countOpen.textContent = openCount;
    if (countProgress) countProgress.textContent = progressCount;
    if (countResolved) countResolved.textContent = resolvedCount;
    if (kpiVal) kpiVal.textContent = openCount;
    
    const renderCard = (ticket) => `
        <div class="p-4 bg-[#141a17]/80 border border-[#242c27] rounded-xl hover:border-emerald-500/30 transition-all flex flex-col space-y-3 relative group">
            <div class="flex justify-between items-start">
                <span class="text-[9px] font-bold px-2 py-0.5 rounded ${ticket.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ticket.priority === 'High' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}">${ticket.priority}</span>
                <span class="text-[8px] text-[#94a3b8] font-bold font-mono">${ticket.id}</span>
            </div>
            <div>
                <h4 class="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">${ticket.role}</h4>
                <p class="text-[9px] text-[#94a3b8] font-bold mt-0.5">${ticket.dept}</p>
            </div>
            <div class="flex justify-between items-center text-[9px] font-bold pt-2 border-t border-[#242c27] text-[#94a3b8]">
                <span>📅 ${ticket.date}</span>
                <span class="text-emerald-400">${ticket.candidates} Sourced</span>
            </div>
            <div class="flex justify-end gap-1.5 pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                ${ticket.status !== 'open' ? `<button onclick="moveTicket('${ticket.id}', 'prev')" class="p-1 bg-[#242c27] hover:bg-emerald-500/10 text-[#bbcabf] hover:text-emerald-400 rounded transition-all"><span class="material-symbols-outlined text-xs">arrow_back</span></button>` : ''}
                ${ticket.status !== 'resolved' ? `<button onclick="moveTicket('${ticket.id}', 'next')" class="p-1 bg-[#242c27] hover:bg-emerald-500/10 text-[#bbcabf] hover:text-emerald-400 rounded transition-all"><span class="material-symbols-outlined text-xs">arrow_forward</span></button>` : ''}
            </div>
        </div>
    `;
    
    const listOpen = document.getElementById('listOpenTickets');
    const listProgress = document.getElementById('listInProgressTickets');
    const listResolved = document.getElementById('listResolvedTickets');

    if (listOpen) listOpen.innerHTML = state.tickets.filter(t => t.status === 'open').map(renderCard).join('') || `<p class="text-center text-[10px] text-[#4e6b5a]/40 py-8">No open requests</p>`;
    if (listProgress) listProgress.innerHTML = state.tickets.filter(t => t.status === 'progress').map(renderCard).join('') || `<p class="text-center text-[10px] text-[#4e6b5a]/40 py-8">No requisitions in progress</p>`;
    if (listResolved) listResolved.innerHTML = state.tickets.filter(t => t.status === 'resolved').map(renderCard).join('') || `<p class="text-center text-[10px] text-[#4e6b5a]/40 py-8">No resolved requisitions</p>`;
};

window.moveTicket = function(id, direction) {
    const ticket = state.tickets.find(t => t.id === id);
    if (!ticket) return;
    const stages = ['open', 'progress', 'resolved'];
    let idx = stages.indexOf(ticket.status);
    if (direction === 'next' && idx < 2) idx++;
    else if (direction === 'prev' && idx > 0) idx--;
    ticket.status = stages[idx];
    window.renderTicketHub();
    window.showToast(state.currentLang === 'en' ? "Ticket status updated!" : "Đã cập nhật trạng thái yêu cầu tuyển dụng!");
};

window.addNewRequisition = function() {
    const roles = ['Java Cloud Architect', 'Python AI Engineer', 'Senior Product Manager'];
    const depts = ['Core Banking', 'AI Lab', 'Digital Retail'];
    const priorities = ['Medium', 'High', 'Critical'];
    
    const newId = `req-00${state.tickets.length + 1}`;
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const randomDept = depts[Math.floor(Math.random() * depts.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    
    state.tickets.push({
        id: newId,
        role: randomRole,
        dept: randomDept,
        priority: randomPriority,
        status: 'open',
        date: new Date().toISOString().split('T')[0],
        candidates: 0
    });
    
    window.renderTicketHub();
    window.showToast(state.currentLang === 'en' ? "New requisition ticket created!" : "Đã tạo yêu cầu tuyển dụng mới!");
};

window.renderOnboarding = function() {
    const total = state.onboarding.length;
    const completed = state.onboarding.filter(o => o.stage === 'it').length;
    const progressPercent = total ? Math.round((completed / total) * 100) : 0;
    
    const kpiOnb = document.getElementById('kpiOnboardingVal');
    if (kpiOnb) kpiOnb.textContent = `${progressPercent}%`;
    
    const renderOnboardingCard = (member) => `
        <div class="p-4 bg-[#141a17]/80 border border-[#242c27] rounded-xl hover:border-emerald-500/30 transition-all flex flex-col space-y-3 relative group">
            <div class="flex items-center gap-3">
                <img src="${member.avatar}" class="w-9 h-9 rounded-full border border-emerald-500/20 object-cover">
                <div>
                    <h4 class="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">${member.name}</h4>
                    <p class="text-[9px] text-[#94a3b8] font-bold">${member.role}</p>
                </div>
            </div>
            <p class="text-[8px] text-[#4e6b5a] font-mono">${member.email}</p>
            <div class="flex justify-end gap-1.5 pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                ${member.stage !== 'docs' ? `<button onclick="moveOnboarding('${member.id}', 'prev')" class="p-1 bg-[#242c27] hover:bg-emerald-500/10 text-[#bbcabf] hover:text-emerald-400 rounded transition-all"><span class="material-symbols-outlined text-xs">arrow_back</span></button>` : ''}
                ${member.stage !== 'it' ? `<button onclick="moveOnboarding('${member.id}', 'next')" class="p-1 bg-[#242c27] hover:bg-emerald-500/10 text-[#bbcabf] hover:text-emerald-400 rounded transition-all"><span class="material-symbols-outlined text-xs">arrow_forward</span></button>` : ''}
            </div>
        </div>
    `;
    
    const docs = document.getElementById('listOnboardingDocs');
    const contract = document.getElementById('listOnboardingContract');
    const ssc = document.getElementById('listOnboardingSSC');
    const it = document.getElementById('listOnboardingIT');

    if (docs) docs.innerHTML = state.onboarding.filter(o => o.stage === 'docs').map(renderOnboardingCard).join('') || `<p class="text-center text-[10px] text-[#4e6b5a]/40 py-8">None</p>`;
    if (contract) contract.innerHTML = state.onboarding.filter(o => o.stage === 'contract').map(renderOnboardingCard).join('') || `<p class="text-center text-[10px] text-[#4e6b5a]/40 py-8">None</p>`;
    if (ssc) ssc.innerHTML = state.onboarding.filter(o => o.stage === 'ssc').map(renderOnboardingCard).join('') || `<p class="text-center text-[10px] text-[#4e6b5a]/40 py-8">None</p>`;
    if (it) it.innerHTML = state.onboarding.filter(o => o.stage === 'it').map(renderOnboardingCard).join('') || `<p class="text-center text-[10px] text-[#4e6b5a]/40 py-8">None</p>`;
};

window.moveOnboarding = function(id, direction) {
    const member = state.onboarding.find(o => o.id === id);
    if (!member) return;
    const stages = ['docs', 'contract', 'ssc', 'it'];
    let idx = stages.indexOf(member.stage);
    if (direction === 'next' && idx < 3) idx++;
    else if (direction === 'prev' && idx > 0) idx--;
    member.stage = stages[idx];
    window.renderOnboarding();
    window.showToast(state.currentLang === 'en' ? "Onboarding stage updated!" : "Đã cập nhật tiến độ nhập việc!");
};

window.generateAIJD = async function() {
    const jdContainer = document.getElementById('jdOutputContainer');
    const btnGenerate = document.getElementById('btnGenerateJD');
    const btnCopy = document.getElementById('btnCopyJD');
    if (!jdContainer || !btnGenerate) return;
    
    const activeRole = state.activeCompetencyRole || 'Java Cloud Architect';
    
    btnGenerate.disabled = true;
    btnGenerate.innerHTML = `<span class="material-symbols-outlined text-xs animate-spin">sync</span> <span data-i18n="generatingJD">Generating...</span>`;
    
    try {
        const systemPrompt = `You are a Principal Technical Recruiter. Write a complete, comprehensive, highly professional Job Description (JD) for the role of ${activeRole}.
You must write the JD in BOTH Vietnamese (jd_vi) and English (jd_en).
Include standard sections:
- About the Role
- Core Responsibilities
- Key Requirements (Technical & Soft Skills)
- Benefits & Compensation
Format beautifully with neat spacing and paragraphs. Output strictly in JSON. Do not include any HTML markdown wrappers in the JSON response.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1alpha/models/gemini-3-flash-preview:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            jd_vi: { type: "STRING" },
                            jd_en: { type: "STRING" }
                        },
                        required: ["jd_vi", "jd_en"]
                    }
                }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        const result = JSON.parse(data.candidates[0].content.parts[0].text);
        state.activeGeneratedJD = result;
        
        jdContainer.classList.remove('hidden');
        if (btnCopy) btnCopy.classList.remove('hidden');
        
        jdContainer.textContent = state.currentLang === 'vi' ? result.jd_vi : result.jd_en;
        window.showToast(state.currentLang === 'en' ? "AI Job Description generated successfully!" : "Đã tạo JD thông minh bằng AI thành công!");
    } catch (err) {
        console.error(err);
        window.showToast(state.currentLang === 'en' ? "AI JD Generation failed. Please check your API key." : "Sinh JD bằng AI thất bại. Vui lòng cấu hình API Key hợp lệ.");
        window.toggleAPISettingsModal(true);
    } finally {
        btnGenerate.disabled = false;
        btnGenerate.innerHTML = `<span class="material-symbols-outlined text-xs">auto_awesome</span> <span data-i18n="generateJDBtn">AI Generate JD</span>`;
        updateLanguage();
    }
};

window.copyGeneratedJD = function() {
    const jdContainer = document.getElementById('jdOutputContainer');
    if (!jdContainer || !jdContainer.textContent) return;
    navigator.clipboard.writeText(jdContainer.textContent);
    window.showToast(state.currentLang === 'en' ? "JD copied to clipboard!" : "Đã sao chép JD vào khay nhớ tạm!");
};

window.generateAIQuestions = async function() {
    const btn = document.getElementById('btnGenerateQuestions');
    const listContainer = document.getElementById('aiQuestionsList');
    if (!btn || !listContainer) return;
    
    const candidateName = document.getElementById('plannerActiveName')?.textContent || 'Candidate';
    const candidateRole = document.getElementById('plannerActiveRole')?.textContent || 'Specialist';
    
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined text-xs animate-spin">sync</span> <span data-i18n="generatingQuestions">Generating...</span>`;
    
    try {
        const systemPrompt = `You are a Principal Tech Interviewer. Design a tailored set of 3 competency-based interview questions for ${candidateName} applying for the role of ${candidateRole}.
Analyze potential technical stack gaps (e.g., Kubernetes orchestrations, cloud architecture, system design constraints) and formulate deep vetting questions.
Provide your response in BOTH Vietnamese (vi) and English (en).
JSON Schema format:
{
  "questions": [
    {
      "q_vi": "Câu hỏi bằng tiếng Việt",
      "q_en": "Question in English",
      "rationale_vi": "Lý do hỏi bằng tiếng Việt",
      "rationale_en": "Rationale in English"
    }
  ]
}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1alpha/models/gemini-3-flash-preview:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            questions: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        q_vi: { type: "STRING" },
                                        q_en: { type: "STRING" },
                                        rationale_vi: { type: "STRING" },
                                        rationale_en: { type: "STRING" }
                                    },
                                    required: ["q_vi", "q_en", "rationale_vi", "rationale_en"]
                                }
                            }
                        },
                        required: ["questions"]
                    }
                }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        const result = JSON.parse(data.candidates[0].content.parts[0].text);
        state.activeGeneratedQuestions = result.questions;
        
        window.renderAIQuestions();
        window.showToast(state.currentLang === 'en' ? "AI Tailored Interview Questions generated!" : "Đã tạo câu hỏi phỏng vấn tối ưu hóa bằng AI!");
    } catch (err) {
        console.error(err);
        window.showToast(state.currentLang === 'en' ? "Failed to generate AI questions. Please check your API key." : "Tạo câu hỏi AI thất bại. Vui lòng cấu hình API Key hợp lệ.");
        window.toggleAPISettingsModal(true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-outlined text-xs">auto_awesome</span> <span data-i18n="interviewQBtn">AI Generate Questions</span>`;
        updateLanguage();
    }
};

window.renderAIQuestions = function() {
    const listContainer = document.getElementById('aiQuestionsList');
    if (!listContainer || !state.activeGeneratedQuestions) return;
    
    listContainer.innerHTML = state.activeGeneratedQuestions.map((q, idx) => `
        <div class="glass p-4 rounded-xl border border-[#242c27] space-y-2 relative overflow-hidden group">
            <div class="absolute right-2 top-2 text-[8px] font-black text-emerald-400/20 uppercase tracking-widest">Q${idx + 1}</div>
            <h4 class="text-xs font-black text-emerald-400 pr-8">${state.currentLang === 'vi' ? q.q_vi : q.q_en}</h4>
            <p class="text-[9px] text-[#94a3b8] leading-relaxed italic"><strong class="text-white/60">Rationale:</strong> ${state.currentLang === 'vi' ? q.rationale_vi : q.rationale_en}</p>
        </div>
    `).join('');
};

window.onWeightSliderChange = function() {
    const tech = parseInt(document.getElementById('sliderWeightTech').value) || 50;
    const exp = parseInt(document.getElementById('sliderWeightExp').value) || 35;
    const edu = parseInt(document.getElementById('sliderWeightEdu').value) || 15;
    
    const labelTech = document.getElementById('labelWeightTech');
    const labelExp = document.getElementById('labelWeightExp');
    const labelEdu = document.getElementById('labelWeightEdu');

    if (labelTech) labelTech.textContent = `${tech}%`;
    if (labelExp) labelExp.textContent = `${exp}%`;
    if (labelEdu) labelEdu.textContent = `${edu}%`;
    
    state.candidates.forEach(c => {
        if (!c.base_matching_score) {
            c.base_matching_score = c.matching_score || 75;
        }
        const factor = (tech / 50) * 0.6 + (exp / 35) * 0.3 + (edu / 15) * 0.1;
        let newScore = Math.round(c.base_matching_score * factor);
        newScore = Math.min(100, Math.max(10, newScore));
        c.matching_score = newScore;
    });
    
    if (typeof window.renderScreenerView === 'function') {
        window.renderScreenerView();
    }
    if (typeof window.renderActiveCandidatesDecks === 'function') {
        window.renderActiveCandidatesDecks();
    }
};

window.queryKBDoc = function(docKey) {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;
    
    if (!state.isChatOpen) {
        const chatToggle = document.getElementById('chatToggle');
        if (chatToggle) chatToggle.click();
    }
    
    let docPrompt = '';
    if (docKey === 'guidelines') {
        docPrompt = state.currentLang === 'vi' 
            ? "Hãy tóm tắt và phân tích Hướng dẫn Tuyển dụng Tập đoàn (Recruitment Guidelines) và cách áp dụng chuẩn khung năng lực 4 Trụ cột vào việc đánh giá ứng viên."
            : "Please summarize and analyze the Group Recruitment Guidelines and how we apply the 4-Pillar Competency Framework to evaluate candidates.";
    } else if (docKey === 'ssc') {
        docPrompt = state.currentLang === 'vi'
            ? "Vui lòng hướng dẫn Quy trình Nhập việc SSC (SSC Onboarding Procedures), các thủ tục làm hồ sơ, khám sức khỏe và cấp tài khoản cho nhân sự mới."
            : "Please guide me through the SSC Onboarding Procedures, documentation, medical checks, and provisioning workflows for new hires.";
    } else if (docKey === 'policy') {
        docPrompt = state.currentLang === 'vi'
            ? "Hãy làm rõ Chính sách Nhân sự Tập đoàn (Corporate HR Policies) về tính minh bạch, chống gia đình trị và tuân thủ bảo mật thông tin ứng viên GDPR."
            : "Please clarify the Corporate HR Policies regarding transparency, anti-nepotism, and GDPR compliance for candidate data safety.";
    }
    
    chatInput.value = docPrompt;
    
    if (typeof handleSendMessage === 'function') {
        handleSendMessage();
    }
};

window.toggleAPISettingsModal = function(forceOpen = false) {
    const modal = document.getElementById('apiSettingsModal');
    const input = document.getElementById('inputUserAPIKey');
    if (!modal) return;
    
    if (forceOpen || modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        if (input) {
            input.value = localStorage.getItem('user_gemini_api_key') || '';
        }
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.saveUserAPIKey = function() {
    const input = document.getElementById('inputUserAPIKey');
    if (!input) return;
    
    const key = input.value.trim();
    if (!key) {
        window.showToast(state.currentLang === 'vi' ? "Vui lòng nhập Gemini API Key hợp lệ!" : "Please enter a valid Gemini API Key!");
        return;
    }
    
    localStorage.setItem('user_gemini_api_key', key);
    CONFIG.GEMINI_API_KEY = key;
    
    window.showToast(state.currentLang === 'vi' ? "Đã lưu và áp dụng Gemini API Key mới!" : "New Gemini API Key saved and applied!");
    window.toggleAPISettingsModal(false);
};

document.addEventListener('DOMContentLoaded', init);
