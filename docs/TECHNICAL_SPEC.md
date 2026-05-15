# ⚙️ HR-Tech 4.0: Technical Spec (V2 - Unified Edition)

Tài liệu dành cho lập trình viên để nắm bắt cấu trúc kỹ thuật của ứng dụng sau đợt cập nhật ổn định hóa.

## 1. Kiến trúc Hợp nhất (Consolidated Architecture)
*   **Trạng thái:** Toàn bộ mã nguồn JavaScript và bộ từ điển (Translations) đã được nhúng trực tiếp vào file `index.html`.
*   **Lý do:** Loại bỏ lỗi tải file lẻ, tránh xung đột bộ nhớ đệm (cache) và đảm bảo ứng dụng hoạt động ngay lập tức trên mọi môi trường (Vercel, Local, iMac).

## 2. Hệ thống Song ngữ (Bilingual Engine)
*   **Cơ chế:** Sử dụng thuộc tính `data-i18n` cho văn bản và `data-i18n-placeholder` cho ô nhập liệu.
*   **Xử lý:** Hàm `updateLanguage()` truy vấn bộ từ điển `translations` và cập nhật DOM động.
*   **Khởi tạo:** Mặc định là Tiếng Anh (`en`), có thể chuyển đổi linh hoạt qua nút "Lang Toggle".

## 3. Giải pháp Responsive & Tương tác
*   **Cơ chế Toggle:** Sử dụng hệ thống class trên thẻ `body` (`sidebar-open`, `chat-open`) kết hợp với CSS Transition.
*   **Xử lý Va chạm:** 
    *   Trên Desktop: Bảng AI Chat sẽ đẩy nội dung chính (`main`) sang trái bằng cách điều chỉnh `padding-right: 380px`.
    *   Trên Mobile: Các Sidebar hoạt động dưới dạng Overlay (lớp phủ) có hiệu ứng làm mờ nền (backdrop-filter).
*   **Nút Ngôi sao thông minh:** Tự động dịch chuyển vị trí khi bảng AI mở trên Desktop để tránh bị che khuất.

## 4. Hệ thống thông báo (Toast System)
*   Sử dụng hàm `showToast(message)` để tạo thông báo động.
*   Giao diện Toast được thiết kế chuẩn Emerald Mystery với hiệu ứng Glow và Animation mượt mà.

---

# 🎨 HR-Tech 4.0: Design System

Quy chuẩn thẩm mỹ tạo nên sự khác biệt cho ứng dụng.

## 1. Bảng màu (Color Palette)
*   **Primary Background:** `#0a0f0d` (Deep Charcoal - Đen than chì).
*   **Secondary Background:** `#141a17` (Dark Emerald Base).
*   **Brand Color:** `#4edea3` (Emerald Green - Xanh ngọc lục bảo).
*   **Text Primary:** `#ffffff` (White).
*   **Text Secondary:** `#94a3b8` (Muted Blue/Gray).

## 2. Hiệu ứng (Effects)
*   **Emerald Glow:** Các nút quan trọng có hiệu ứng phát sáng nhẹ.
*   **Backdrop Filter:** Sử dụng để làm mờ hậu cảnh khi mở Menu trên điện thoại, tạo chiều sâu cho giao diện.
*   **Z-Index Management:** 
    *   Sidebars: `z-index: 60/70`.
    *   Floating Buttons: `z-index: 100` (Ưu tiên cao nhất).
    *   Overlay: `z-index: 55`.
