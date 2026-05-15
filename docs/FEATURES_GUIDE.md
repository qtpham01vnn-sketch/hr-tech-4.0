# 🛠️ HR-Tech 4.0: Features Guide

Tài liệu này chi tiết cách vận hành của các tính năng "vũ khí" trong ứng dụng.

## 1. Phễu tương tác (Interactive Funnel)
*   **Ý nghĩa:** Trực quan hóa hành trình của ứng viên từ lúc nộp hồ sơ đến khi được chọn.
*   **Cách hoạt động:** 
    - Phễu gồm 4 tầng: Tổng hồ sơ -> Sàng lọc AI -> Top Ranking -> Shortlist.
    - Mỗi tầng là một bộ lọc logic. Khi người dùng click vào tầng nào, bảng danh sách ứng viên bên dưới sẽ chỉ hiển thị những hồ sơ thuộc nhóm đó.
*   **Công nghệ:** Sự kiện `onclick` gọi hàm `filterCandidates(layer)` trong `app.js` để thao tác ẩn/hiện hàng trong bảng với hiệu ứng `opacity` mượt mà.

## 2. AI Candidate Oracle (Right Sidebar)
*   **Ý nghĩa:** Cung cấp trợ lý ảo chuyên trách để giải đáp về dữ liệu ứng viên.
*   **Tính năng:** 
    - Hiển thị các phân tích mẫu về "Culture Fit" và "Technical Skills".
    - Tự động thay đổi nội dung theo ngôn ngữ được chọn.
    - Có thể thu gọn (Close) để mở rộng không gian và mở lại qua nút FAB (Floating Action Button) hình ngôi sao ở góc màn hình.
*   **Giao diện:** Thiết kế dạng Chat bubble chuyên nghiệp, hỗ trợ cuộn (scroll) độc lập với trang chính.

## 3. Magic Dropzone (AI CV Parsing)
*   **Ý nghĩa:** Xóa bỏ rào cản nhập liệu thủ công.
*   **Cách hoạt động:**
    - Người dùng kéo thả file hoặc click vào vùng Dropzone ở Header.
    - Một hiệu ứng Overlay xuất hiện thông báo "AI IS PARSING DATA..." để mô phỏng quá trình xử lý CV thực tế.
    - Sau khi hoàn tất, hệ thống gửi một Toast notification xác nhận số lượng hồ sơ đã được nạp thành công.

## 4. Hệ thống AI Profiler & Skill Gaps
*   **AI Summary:** Biểu đồ cột mini hiển thị mật độ kỹ năng của ứng viên.
*   **Skill Gaps:** Liệt kê các công nghệ mà ứng viên còn thiếu dựa trên mô tả công việc (Ví dụ: "Thiếu Kubernetes", "Cần bổ sung System Design").
*   **Matching Score:** Điểm số % độ phù hợp được tính toán dựa trên tổng hòa các yếu tố năng lực.

## 5. Team Online & Collaboration Presence
*   **Ý nghĩa:** Mô phỏng môi trường làm việc cộng tác của các tập đoàn lớn.
*   **Cách hoạt động:**
    - Hiển thị avatar các thành viên đang trực tuyến.
    - Hệ thống tự động thay đổi dòng trạng thái (Status) mô phỏng: *"Minh Tú đang cập nhật hồ sơ..."* hoặc *"Linh Chi đang chat với AI..."*.
