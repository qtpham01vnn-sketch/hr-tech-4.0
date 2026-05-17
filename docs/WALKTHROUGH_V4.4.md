# Hướng dẫn Vận hành & Tối ưu hóa - HR-Tech AI Recruitment Cockpit (v4.4)

Tài liệu này ghi nhận toàn bộ thành quả phát triển, cấu trúc vận hành, và các giải pháp tối ưu hóa hiệu năng đỉnh cao đã được triển khai trong phiên bản **HR-Tech v4.4**.

---

## 🚀 Các Tính Năng Đột Phá Đã Hoàn Thành

### 1. Ngăn kéo Phân tích Chi tiết Ứng viên (Candidate Analysis Drawer - Phase 2)
* **Luồng Trải nghiệm**: Click vào nút "Analyze" hoặc bất kỳ dòng ứng viên nào sẽ kích hoạt ngăn kéo kính mờ (Drawer) trượt mượt mà từ bên phải màn hình.
* **Đánh giá Đa tầng (Multi-layer Screening)**:
  * **Tầng 2 (Pre-Interview Assessments)**: Điểm IQ/Cognitive (`121/150`) và kết quả kiểm tra lập trình (`81/100`) được tính toán động dựa trên các biến năng lực ứng viên.
  * **Tầng 3 (AI Video Sentiment Analytics - Xu hướng 2026)**: Mô phỏng trình phát video phỏng vấn AI, tự động chấm điểm Thần thái (Charisma: `83%`), Mạch lạc (Clarity: `84%`), và Độ ổn định giọng nói (Tone Stability: `85%`) với trạng thái cảm xúc cực kỳ chân thực.
  * **Độ tương thích Văn hóa (Culture Fit)**: Thanh đo năng lực chuyên môn và giá trị cốt lõi doanh nghiệp (Trung thực - Kỷ luật - Sáng tạo).
* **Đồng bộ cơ sở dữ liệu Supabase**: Tích hợp các nút check Shortlist đồng bộ trực tiếp lên bảng `hr_candidates` của Supabase trong nháy mắt.

### 2. Bộ nạp CV kéo thả AI & Mẫu kiểm thử thông minh (AI Resume Ingestion - Phase 3)
* **Vùng kéo thả thông minh (Drag-and-Drop Dropzone)**: Nhận dạng file kéo thả trực quan ở đầu trang hoặc click mở trình chọn file cục bộ.
* **Phân tích chuỗi tự động (String Extraction Ingestion)**: Khi kéo thả file, hệ thống tự động trích xuất tên ứng viên từ tên file (ví dụ: `CV_Nguyen_Hoang_Linh.pdf` sẽ bóc tách và viết hoa thành ứng viên `Nguyễn Hoàng Linh`), tự động gán vị trí và tạo email tương ứng!
* **Quy trình quét Radar AI**: Modal mờ bao gồm các bước phân tích tuần tự và vòng quét radar xanh ngọc lục bảo cực kỳ sinh động.
* **Thẻ Kết quả & Bàn giao hành động (Action Handoff)**: Thẻ thành công hiển thị điểm tương thích `%` cùng nút "Phân tích sâu" tự động đóng modal và kích hoạt trượt Drawer ứng viên mới lập tức.

### 3. Tích hợp Đường ống AI Oracle (Unified AI Oracle Pipeline)
* Nút **"Hỏi AI Oracle"** tự động đóng Drawer chi tiết, mở thanh AI chat bên phải, tự động viết sẵn prompt phân tích chuyên sâu về ứng viên đó và kích hoạt Gemini AI trả lời thời gian thực.

---

## ⚡ Các Chiến Lược Tối Ưu Hiệu Năng & Khắc Phục Lỗi (Phẫu thuật Lag & Click)

Trong quá trình phát triển, chúng tôi đã tiến hành một đợt **Performance Audit** chuyên sâu để giải quyết triệt để tình trạng giật lag và đơ nút bấm:

### 1. Giải quyết Xung đột Cuộn (Scroll Viewport Conflict)
* **Vấn đề**: Thẻ `<main>` bị ép cứng `height: 100vh; overflow-y: auto;` làm vô hiệu hóa bộ gia tốc cuộn phần cứng của GPU hệ điều hành, gây ra hiện tượng giật cục trên Safari/Chrome.
* **Khắc phục**: Gỡ bỏ giới hạn cuộn của thẻ `<main>`, cho phép trang cuộn tự nhiên theo cửa sổ Window giúp kích hoạt ngay cơ chế cuộn phần cứng mượt mà 60fps.

### 2. Tối ưu hóa Layout Reflow (`transition-all`)
* **Vấn đề**: Gán class `transition-all duration-500` lên `<main>` khiến mỗi khi cuộn trang hay tương tác nhỏ, trình duyệt phải tính toán lại chuyển động của toàn bộ các thuộc tính DOM.
* **Khắc phục**: Giới hạn cụ thể thành `transition-[padding] duration-300` để trình duyệt chỉ tập trung dịch chuyển padding khi đóng/mở sidebar.

### 3. Triệt tiêu Chi phí Xử lý Mờ (Sticky Header Blur Repaints)
* **Vấn đề**: Hiệu ứng kính mờ `backdrop-blur-md` trên thanh tiêu đề `sticky top-0` ép GPU liên tục tính toán độ mờ của mọi hàng ứng viên trượt bên dưới nó khi cuộn.
* **Khắc phục**: Chuyển đổi sang nền tối màu phẳng vững chắc `bg-[#0a0f0d]/95` sắc nét chuẩn Google AI Studio, đưa chi phí dựng hình mờ cuộn về 0.

### 4. Khắc phục Lỗi Chặn Click Drawer & Đơ Nút Đóng (X)
* **Vấn đề**: Sử dụng tĩnh quy tắc `transform: translate3d(0, 0, 0);` trong CSS để tối ưu hóa GPU vô tình ghi đè và làm mất tác dụng của các class ẩn `translate-x-full` của Tailwind. Điều này khiến cả Drawer và Chatbot đều bị mở cố định, đè lên phần màn hình bên phải và chặn toàn bộ lượt click chuột.
* **Khắc phục**: Lược bỏ quy tắc transform tĩnh trong CSS, chỉ duy trì thuộc tính định vị GPU `will-change: transform;` và `backface-visibility: hidden;`. Khôi phục hoàn hảo tính năng đóng/mở động nhạy bén của Drawer và AI Chatbot.

---

## 🗂️ Trạng thái Tệp Tin Hệ thống
* **Giao diện chính**: [index.html](file:///Users/macos/PhuongNam-Dev-2026/MenuGo/hr-tech-4.0/index.html)
* **Logic JavaScript**: [app.js](file:///Users/macos/PhuongNam-Dev-2026/MenuGo/hr-tech-4.0/app.js)
* **Từ điển song ngữ**: [translations.js](file:///Users/macos/PhuongNam-Dev-2026/MenuGo/hr-tech-4.0/translations.js)
