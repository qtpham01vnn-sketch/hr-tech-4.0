# ⚙️ HR-Tech 4.0: Technical Spec

Tài liệu dành cho lập trình viên để nắm bắt cấu trúc kỹ thuật của ứng dụng.

## 1. Hệ thống Song ngữ (Bilingual Engine)
*   **Cơ chế:** Sử dụng thuộc tính `data-i18n` cho văn bản và `data-i18n-placeholder` cho ô nhập liệu.
*   **Xử lý:** Hàm `updateLanguage()` trong `app.js` sẽ truy vấn bộ từ điển trong `translations.js` và cập nhật DOM động.
*   **Lưu trữ:** Ngôn ngữ ưu tiên được lưu vào `localStorage` để giữ trạng thái sau khi tải lại trang.

## 2. Giải pháp Responsive (Mobile-First)
*   **Layout:** Sử dụng `lg:pl-64` và `lg:pr-[380px]` để tạo không gian cho 2 Sidebar trên PC. Trên màn hình < 1024px, các giá trị này trở về 0.
*   **Sidebar Left:** Ẩn bằng `transform: translateX(-100%)` và kích hoạt qua class `.sidebar-open`.
*   **Sidebar Right (AI):** Ẩn bằng `transform: translateX(100%)` và kích hoạt qua class `.chat-open`.
*   **Grid:** Chuyển đổi từ `grid-cols-12` (PC) sang `grid-cols-1` (Mobile) để các card xếp chồng lên nhau.
*   **Table:** Bao bọc bởi `overflow-x-auto` để cho phép vuốt ngang trên điện thoại.

## 3. Hệ thống thông báo (Toast System)
*   Sử dụng hàm `showToast(message)` để tạo ra các thông báo nổi ở giữa màn hình.
*   Tự động xóa khỏi DOM sau 3 giây để tránh rác giao diện.

---

# 🎨 HR-Tech 4.0: Design System

Quy chuẩn thẩm mỹ tạo nên sự khác biệt cho ứng dụng.

## 1. Bảng màu (Color Palette)
*   **Primary Background:** `#0a0f0d` (Deep Charcoal - Đen than chì).
*   **Secondary Background:** `#141a17` (Dark Emerald Base).
*   **Brand Color:** `#4edea3` (Emerald Green - Xanh ngọc lục bảo).
*   **Text Primary:** `#ffffff` (White).
*   **Text Secondary:** `#94a3b8` (Muted Blue/Gray).
*   **Accent Glow:** `shadow-emerald-500/20` (Hiệu ứng phát sáng xanh nhẹ).

## 2. Font chữ & Typography
*   **Font Family:** 'Inter', sans-serif (Font chữ hiện đại, chuyên dụng cho giao diện SaaS).
*   **Headings:** Sử dụng `font-black` và `tracking-tighter` để tạo cảm giác mạnh mẽ, chắc chắn.
*   **Micro-copy:** Sử dụng cỡ chữ 9px - 10px, `font-bold` và `uppercase` cho các nhãn (labels).

## 3. Hiệu ứng (Effects)
*   **Emerald Glow:** Các nút quan trọng có hiệu ứng phát sáng nhẹ (glow) để thu hút sự chú ý.
*   **Smooth Transitions:** Mọi hành động mở Sidebar, di chuột qua Card đều có `transition-all duration-300` hoặc `duration-500`.
*   **Custom Scrollbar:** Thanh cuộn được thiết kế mỏng, màu tối để không làm phá vỡ thẩm mỹ tổng thể.
