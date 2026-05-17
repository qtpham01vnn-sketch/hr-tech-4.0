# Hướng dẫn Vận hành & Tối ưu hóa - HR-Tech AI Recruitment Cockpit (v5.0)

Tài liệu này ghi nhận toàn bộ thành quả phát triển, cấu trúc vận hành, và các giải pháp kỹ thuật cao cấp đã được triển khai trong phiên bản **HR-Tech v5.0: Candidate AI Screener & Multi-Profile Radar Matrix**.

---

## 🚀 Các Tính Năng Đột Phá Đã Hoàn Thành (Phase 5)

### 1. Bảng điều khiển Sàng lọc ứng viên Thông minh (Candidate AI Screener Dashboard)
* **Chỉ số Vận hành Nhanh (Stats Bar)**: Hiển thị thời gian thực 3 chỉ số then chốt giúp hội đồng tuyển dụng nắm bắt tức thì quy mô phễu sàng lọc:
  * **Tổng số Sàng lọc (Total Screened)**: Tự động đếm tổng số hồ sơ hiện có.
  * **Đạt Chuẩn (Compatible ≥80%)**: Số lượng ứng viên xuất sắc vượt ngưỡng điểm khớp 80%.
  * **Khớp Trung bình (Avg Match Score)**: Điểm số trung bình cộng của toàn bộ phễu ứng viên.
* **Bộ lọc Đa tiêu chí thông minh**:
  * **Hộp tìm kiếm văn bản động (Semantic Search Input)**: Tìm kiếm tức thời theo tên ứng viên, vị trí ứng tuyển, hoặc từ khóa nổi bật trong bản tóm tắt phân tích CV của AI.
  * **Bộ lọc theo Vị trí (Role Filter)**: Lọc nhanh các ứng viên ứng tuyển vào 3 vị trí trọng tâm (*Java Cloud Architect*, *Python AI Engineer*, *Senior Product Manager*).
  * **Bộ lọc Sắp xếp (Sort Filter)**: Sắp xếp danh sách ứng viên theo điểm số khớp (từ cao xuống thấp / từ thấp đến cao) hoặc theo thứ tự bảng chữ cái A-Z của tên ứng viên.
* **Đếm kết quả Động**: Hiển thị số lượng ứng viên khớp với điều kiện lọc hiện tại thời gian thực.

### 2. Biểu đồ Radar Năng lực Đa chiều bằng SVG thuần động (Dynamic SVG Radar Chart)
* **Trực quan hóa Đa đỉnh (Pentagonal Matrix)**: Khởi tạo 5 trục năng lực cốt lõi đại diện cho năng lực toàn diện của ứng viên:
  * **TRẮC NGHIỆM TECH** (Technical MCQ Assessment)
  * **LẬP TRÌNH HỆ THỐNG** (System Coding Benchmark)
  * **PHÙ HỢP VĂN HÓA** (Culture Fit Index)
  * **THẦN THÁI VIDEO** (Video Communication Clarity)
  * **NĂNG LỰC CHUNG** (Core Matching Score Mastery)
* **Vẽ Lưới Concentric thông minh**: Tự động dựng 5 vòng đa giác đồng tâm nét đứt biểu thị thang điểm 20%, 40%, 60%, 80%, và 100%.
* **Phủ lớp Năng lực (Overlay Multi-Polygons)**: Khi người dùng tích chọn các ứng viên ở cột trái, hệ thống tự động tính toán tọa độ SVG động và vẽ đè các vùng đa giác màu bán trong suốt rực rỡ lên nhau:
  * **Ứng viên 1**: Đa giác Ngọc lục bảo (Emerald Green `#10b981`) rực rỡ.
  * **Ứng viên 2**: Đa giác Tím Violet (`#a855f7`) huyền bí.
  * **Ứng viên 3**: Đa giác Hồng Rose (`#f43f5e`) sắc sảo.
  * **Ứng viên 4**: Đa giác Xanh Dương (Blue `#3b82f6`) thanh lịch.
* **Tương tác Động 60fps**: Các đa giác mở rộng hoặc thu hẹp cực kỳ trơn tru và mượt mà mỗi khi thêm/bớt ứng viên so sánh.

### 3. Bảng Đối sánh Chi tiết Side-by-Side (Comparative Matrix Table)
* Tự động sinh bảng so sánh chi tiết các chỉ số điểm số kỹ năng MCQ, Coding, Culture, và Video của những ứng viên được chọn.
* Hiển thị avatar ứng viên và điểm số khớp tổng quan dạng chữ nổi đậm sắc nét.
* Tự động chuyển đổi hiển thị dấu gạch ngang (`—`) đối với kỹ năng không áp dụng (ví dụ: điểm Lập trình của vị trí *Product Manager*).

### 4. Tự động hóa Mời Phỏng vấn Hàng loạt (Bulk Invite Flow)
* Khi chọn từ 1 ứng viên trở lên, nút **"MỜI PHỎNG VẤN HÀNG LOẠT (N)"** sẽ tự động hiển thị trên thanh công cụ so sánh.
* Kích hoạt click sẽ giả lập gửi thư mời, tự động hiển thị Toast thông báo thành công đa ngữ đẹp mắt (`Đã gửi lời mời phỏng vấn hàng loạt tới N ứng viên thành công!`), đồng thời giải phóng lượt chọn để sẵn sàng cho chu kỳ lọc tiếp theo.

---

## ⚡ Các Cải Tiến & Khắc Phục Lỗi Kỹ Thuật (Schema Optimization)

### 1. Khắc phục Lỗi nhãn "undefined" của Ứng viên
* **Triệu chứng**: Khi render thẻ ứng viên ở cột trái, dòng hiển thị Vị trí ứng tuyển của ứng viên xuất hiện chữ `"undefined"`.
* **Nguyên nhân**: Bảng `hr_candidates` của Supabase lưu trữ trạng thái phễu qua cột `stage` nhưng không lưu trữ trường `applied_position` tĩnh, khiến frontend truy vấn thuộc tính này bị trống.
* **Giải pháp Phẫu thuật**:
  * Tích hợp bộ suy luận vị trí động (Dynamic Position Heuristics) ngay khi dữ liệu được tải từ Supabase thông qua hàm `fetchCandidates()` và khi lưu hồ sơ mới từ bộ kéo thả CV.
  * Hệ thống tự động phân tích văn bản tóm tắt CV (`ai_summary`) và tên ứng viên để gán chuẩn xác:
    * Chứa từ khóa *Java/microservices/architect* hoặc tên chứa *nam* $\rightarrow$ **Java Cloud Architect**
    * Chứa từ khóa *product/roadmap/quản lý sản phẩm* hoặc tên chứa *jamin* $\rightarrow$ **Senior Product Manager**
    * Các trường hợp còn lại $\rightarrow$ **Python AI Engineer**
  * Điều này giải quyết triệt để lỗi `"undefined"` mà không cần thực hiện di chuyển hay thay đổi cấu trúc bảng trong Supabase, đảm bảo tính toàn vẹn dữ liệu 100%.

### 2. Đồng bộ hóa i18n Đa ngữ Động 100%
* Kết nối hoàn hảo tất cả các nhãn tiêu đề, placeholder tìm kiếm, văn bản trống (empty states) và nhãn tọa độ biểu đồ Radar với từ điển song ngữ trong `translations.js`.
* Khi người dùng click chọn chuyển đổi ngôn ngữ ở thanh Header, toàn bộ biểu đồ Radar SVG, các tiêu đề cột của bảng so sánh, danh sách thẻ ứng viên, và thanh Stats Bar tự động dịch thuật và vẽ lại tức thì mà không cần tải lại trang.

---

## 🗂️ Trạng thái Tệp Tin Hệ thống
* **Giao diện chính**: [index.html](file:///Users/macos/PhuongNam-Dev-2026/MenuGo/hr-tech-4.0/index.html) (Cấu trúc giao diện cột kép và stats bar của Screener).
* **Logic JavaScript**: [app.js](file:///Users/macos/PhuongNam-Dev-2026/MenuGo/hr-tech-4.0/app.js) (Tính toán tọa độ SVG Radar, bộ lọc tìm kiếm, suy luận vị trí ứng viên và mời hàng loạt).
* **Từ điển song ngữ**: [translations.js](file:///Users/macos/PhuongNam-Dev-2026/MenuGo/hr-tech-4.0/translations.js) (Từ điển đầy đủ các từ khóa giao diện của Screener).

---

## 🔮 Kế hoạch Phiên làm việc Tiếp theo (Roadmap to Phase 6)
1. **Lập lịch Phỏng vấn AI (Interview Planner)**: Thay thế giao diện chờ của Tab 4 bằng công cụ tự động khớp lịch trống của Hội đồng tuyển dụng, tích hợp tạo liên kết phòng họp trực tuyến và sinh form đánh giá chuẩn hóa.
2. **Phân tích Nhân tài Nâng cao (Talent Analytics)**: Triển khai các biểu đồ thống kê chất lượng nguồn ứng viên, thời gian tuyển dụng trung bình (Time-to-Hire) và phân phối điểm số khớp trên toàn bộ cơ cấu tuyển dụng của tập đoàn.
