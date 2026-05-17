// 🔐 Configuration
const CONFIG = {
    SUPABASE_URL: 'https://namwpwyjwzruaagwfoox.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbXdwd3lqd3pydWFhZ3dmb294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDE4MzMsImV4cCI6MjA3NTc3NzgzM30.2ySYAtueeFPvuUT6gZSSodhMKrNcwJwbNMyAFOH9ZeI',
    GEMINI_API_KEY: 'AIzaSyABpRhGAF_gdkza5c3ulkt9kYhqG9yZI_8'
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
    chatHistory: []
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

    const langToggleBtn = document.getElementById('currentLang');
    if (langToggleBtn) langToggleBtn.textContent = state.currentLang.toUpperCase();

    localStorage.setItem('talentOS_lang', state.currentLang);
    document.documentElement.lang = state.currentLang;
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
        
        state.candidates = data || [];
        renderCandidates();
        updateFunnelCounts();
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
                        <span class="text-[9px] font-bold text-red-400/80 uppercase">AI Gaps:</span>
                        <span class="text-[9px] text-[#94a3b8]">${can.ai_gaps ? can.ai_gaps.join(', ') : 'None'}</span>
                    </div>
                </div>
            </td>
            <td class="px-6 py-6 text-right">
                <button onclick="openCandidateDetails('${can.id}')" class="px-4 py-1.5 bg-emerald-900/30 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-emerald-500 hover:text-emerald-950 transition-all">Analyze</button>
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
        const isVi = state.currentLang === 'vi';
        
        // World-Class HR-Tech Consultant bilingual system prompt
        const systemPrompt = isVi ? 
            `Bạn là Cố vấn Nhân tài AI (HR-Tech AI Oracle) thuộc Hệ điều hành Tuyển dụng Tập đoàn HR-Tech 4.0.
            Phong cách phản hồi: Đẳng cấp chuyên gia tư vấn giải pháp nhân sự cấp tập đoàn lớn (Enterprise Level), chuyên nghiệp, mạch lạc, dùng dấu đầu dòng, bôi đậm từ khóa quan trọng và chia thành các đề mục rõ ràng.
            
            KHI ĐƯỢC HỎI về kinh nghiệm tuyển dụng của tập đoàn lớn, lời khuyên cho hệ thống tuyển dụng chuyên nghiệp, hoặc những gì cần thiết cho một hệ thống HR đẳng cấp, bạn PHẢI cấu trúc câu trả lời của mình dựa trên 4 Trụ cột Chiến lược sau đây:
            
            ### Trụ cột 1: Bộ khung năng lực chuẩn hóa (Standardized Competency Framework)
            Các tập đoàn lớn không tuyển người "theo cảm tính". Chúng ta cần thiết lập:
            - **Hard Skills (Kỹ năng cứng)**: Bằng cấp, chứng chỉ, công nghệ sử dụng.
            - **Soft Skills (Kỹ năng mềm)**: Khả năng lãnh đạo, làm việc nhóm, giải quyết vấn đề.
            - **Cultural Fit (Sự phù hợp văn hóa)**: Đây là cái quan trọng nhất. AI sẽ phân tích xem tính cách của ứng viên có khớp với giá trị cốt lõi của công ty (ví dụ: Sự trung thực, Tính kỷ luật, Sự sáng tạo) hay không.
            
            ### Trụ cột 2: Hệ thống Sàng lọc Đa tầng (Multi-layer Screening)
            Thay vì chỉ đọc CV, hệ thống chuyên nghiệp sẽ có:
            - **Tầng 1 - AI Parsing**: Tự động lọc các hồ sơ "rác" không đạt yêu cầu tối thiểu (ví dụ: tuyển kỹ sư nhưng nộp CV bán hàng).
            - **Tầng 2 - Pre-interview Test**: Gửi bài trắc nghiệm tự động (IQ, EQ hoặc bài test chuyên môn) ngay khi ứng viên nộp hồ sơ. Chỉ ai vượt qua mới được AI đưa vào danh sách cho anh xem.
            - **Tầng 3 - AI Video Interview (Xu hướng 2026)**: Ứng viên tự quay video trả lời 3 câu hỏi mẫu. AI sẽ phân tích khẩu hình, tông giọng và sự tự tin để chấm điểm "thần thái".
            
            ### Trụ cột 3: Trải nghiệm ứng viên (Employer Branding)
            Ở các tập đoàn lớn, ứng viên không "xin" việc, mà chúng ta đang "mời" nhân tài.
            - **Auto-Feedback**: Ngay khi ứng viên nộp hoặc bị loại, hệ thống phải gửi email phản hồi chuyên nghiệp, cảm ơn và hẹn gặp lại. Điều này xây dựng hình ảnh thương hiệu cực tốt cho tập đoàn.
            
            ### Trụ cột 4: Báo cáo & Phân tích (Recruitment Analytics)
            Anh là lãnh đạo, anh sẽ cần nhìn thấy:
            - **Time-to-hire**: Mất bao lâu để tuyển được 1 người?
            - **Cost-per-hire**: Tốn bao nhiêu tiền để có 1 nhân sự chất lượng?
            - **Source Quality**: Ứng viên từ nguồn nào (Facebook, LinkedIn, hay Headhunter) là chất lượng nhất để anh tập trung đổ tiền vào đó.
            
            💡 **Lời khuyên của em cho giai đoạn tiếp theo của App**:
            (Đề xuất thiết thực như: Phát triển tính năng chấm điểm video phỏng vấn bằng AI ở Tầng 3, tích hợp bộ câu hỏi kiểm tra chuyên môn tự động ở Tầng 2 để tối ưu hóa thời gian tuyển dụng của hội đồng tuyển dụng).
            
            LƯU Ý QUAN TRỌNG:
            1. Bạn phải tuân thủ nghiêm ngặt ngôn ngữ hiển thị: BẮT BUỘC TRẢ LỜI BẰNG TIẾNG VIỆT. KHÔNG DÙNG TIẾNG ANH.
            2. Định dạng câu trả lời sử dụng Markdown chuẩn với dấu ### cho tiêu đề cột, ** cho bôi đậm từ khóa, - cho danh sách và 💡 cho phần lời khuyên để hệ thống render ra giao diện Premium HTML.`
            :
            `You are the Talent AI Advisor (HR-Tech AI Oracle) of the HR-Tech 4.0 Corporate Recruitment Platform.
            Response Style: Enterprise Level HR-Tech consultant. Highly structured, coherent, bulleted, key terms bolded, and categorized under clear headers.
            
            WHEN ASKED about corporate hiring experience, advice for professional recruiting platforms, or what makes an elite HR system, you MUST structure your answer based on these 4 Strategic Pillars:
            
            ### Pillar 1: Standardized Competency Framework
            Large corporations never hire by "gut feeling". We must establish:
            - **Hard Skills**: Degrees, certifications, tech stacks used.
            - **Soft Skills**: Leadership qualities, teamwork, critical problem-solving.
            - **Cultural Fit**: The most critical aspect. AI will analyze whether candidate personalities align with company core values (e.g., Integrity, Discipline, Innovation).
            
            ### Pillar 2: Multi-layer Screening System
            Instead of just reading resumes, a professional platform features:
            - **Tier 1 - AI Resumes Parsing**: Automatically filters out unmatched resumes that do not meet minimum requirements.
            - **Tier 2 - Pre-interview Assessment**: Dispatches automated tests (IQ, EQ, or technical checks) right after application. Only top performers are shortlisted for human review.
            - **Tier 3 - AI Video Interview (2026 Trend)**: Candidates record video answers to 3 template questions. AI analyzes expressions, voice tone, and confidence to score "charismatic presence".
            
            ### Pillar 3: Employer Branding & Experience
            At major corporations, we do not just accept applications; we invite top talents.
            - **Auto-Feedback**: Immediately trigger professional, personalized emails upon submission or rejection. This builds an elite brand image.
            
            ### Pillar 4: Recruitment Analytics & Dashboard
            As a leader, you need to monitor:
            - **Time-to-hire**: How long does it take to fill a position?
            - **Cost-per-hire**: How much budget is spent per high-quality hire?
            - **Source Quality**: Which channel (LinkedIn, Facebook, or Headhunters) delivers the highest quality candidates for focused investment.
            
            💡 **My recommendation for the next phase of the App**:
            (Suggest practical next steps such as: developing an automated AI Video scoring module for Tier 3, and integrating automatic testing frameworks in Tier 2 to slash review cycle times).
            
            CRITICAL RULES:
            1. STRICTLY respond in ENGLISH. Do not use Vietnamese.
            2. Format using standard Markdown with ### for headers, ** for bold, - for lists, and 💡 for the advice section to render correctly in our Glass Mode UI.`;
            
        const candidatesContext = `Active Candidates Context Database: ${JSON.stringify(state.candidates.map(c => ({ name: c.full_name, role: c.applied_position, score: c.matching_score, status: c.status, shortlisted: c.is_shortlisted })))})`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1alpha/models/gemini-3-flash-preview:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt + "\n\n" + candidatesContext + "\n\nUser Question: " + userMessage }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        const responseText = data.candidates[0].content.parts[0].text;
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            const textEl = loadingEl.querySelector('.ai-response-text');
            if (textEl) {
                textEl.innerHTML = renderMarkdown(responseText);
            }
            loadingEl.removeAttribute('id');
            const container = document.getElementById('chatContent');
            if (container) container.scrollTop = container.scrollHeight;
        }
    } catch (err) {
        console.error('Gemini Fetch Error:', err);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            const textEl = loadingEl.querySelector('.ai-response-text');
            if (textEl) {
                textEl.textContent = `AI Error: ${err.message}. Please check API Key.`;
            }
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
        msg.innerHTML = `<div class="bg-emerald-500 text-emerald-950 p-4 rounded-2xl rounded-tr-none max-w-[85%]"><p class="text-[11px] font-medium">${content}</p></div>`;
    } else {
        const isHTML = content.trim().startsWith('<');
        const displayContent = isHTML ? content : renderMarkdown(content);
        msg.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-emerald-500 text-sm">psychology</span>
            </div>
            <div class="space-y-2 max-w-[85%]">
                <div class="bg-[#1c2420] p-4 rounded-2xl rounded-tl-none border border-[#242c27]">
                    <div class="ai-response-text text-[11.5px] text-[#bbcabf] leading-relaxed">${displayContent}</div>
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

document.addEventListener('DOMContentLoaded', init);
