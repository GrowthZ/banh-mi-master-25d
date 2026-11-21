---
name: banh-mi-25d-game
description: Quy chuẩn kiến trúc, thư viện 2.5D/3D hiện đại, quản lý state và UI feedback cho game Bánh Mì Master 2.5D trên Antigravity.
---

# BÁNH MÌ MASTER 2.5D — AGENT SKILL SPECIFICATION

## 1. Tech Stack & Thư viện 2.5D/3D ưu tiên
- **Framework nền:** React 19 + TypeScript (strict mode) + Vite + Tailwind CSS.
- **Đồ họa 2.5D / 3D ưu tiên:**
  1. Sử dụng **Three.js** (phiên bản mới nhất tương thích) kết hợp **@react-three/fiber** và **@react-three/drei** cho sân khấu quầy bánh mì 2.5D/3D diorama (góc nhìn isometric / tilted diorama có depth, ánh sáng, đổ bóng mềm và chuyển động lớp nhân).
  2. Nếu dự án cần hiệu ứng 2D/2.5D sprite/stage linh hoạt hoặc fallback khi thiết bị không hỗ trợ WebGL mượt: hỗ trợ chuyển đổi/fallback sang **PixiJS** (v8+) hoặc **HTML5 Canvas / 2.5D layered diorama** mà không làm gãy logic game.
  3. **Bắt buộc tách biệt render & state:** Toàn bộ state gameplay (độ giòn bánh, lớp nhân đã thêm, timer khách, điểm số, combo, giai đoạn `IDLE` | `PLAYING` | `SUMMARY`) nằm ở React/state store sạch, không nhồi business logic vào bên trong vòng lặp render của Three.js/Canvas.

## 2. Kiến trúc Module bắt buộc
Tổ chức code gọn, rõ trách nhiệm, tránh dồn vào một file lớn:
- `src/data/menuOrders.ts`: Kiểu dữ liệu nguyên liệu, công thức các loại bánh mì (*Bánh mì Pate*, *Bánh mì Trứng Chả*, *Bánh mì Heo Quay*, *Bánh mì Thập Cẩm*) và hàm chấm điểm thuần túy `evaluateBanhMiOrder`.
- `src/components/AssemblyBoard25D.tsx`: Sân khấu 2.5D/3D tương tác (nướng/làm giòn vỏ bánh, xếp từng lớp nhân theo chiều dọc/chiều sâu, nút *Làm lại ổ bánh*, nút *Giao bánh*).
- `src/components/CustomerOrderHUD.tsx`: Thông tin đơn hàng của khách, thanh kiên nhẫn/thời gian chờ, điểm số, `combo` và phản hồi kết quả từng lượt.
- `src/components/GameStageController.tsx`: Điều phối vòng đời game (`IDLE` -> `PLAYING` -> `SUMMARY`), đếm giờ ca bán, chuyển lượt khách và tổng kết.
- `src/App.tsx`: Layout tổng thể, kết nối các module và xử lý lỗi boundary an toàn.

## 3. Chuẩn UX & Phản hồi tức thì
- **Màu sắc & thẩm mỹ:** Bảng màu ấm áp mang không khí tiệm bánh mì Việt Nam (nền kem/gỗ ấm, vỏ bánh vàng giòn, nhân heo quay/pate/chả/rau ngò/dưa leo tương phản rõ ràng, nút hành động dễ bấm).
- **Phản hồi trực quan:** Mỗi thao tác (thêm nguyên liệu, đạt độ giòn chuẩn, quá lửa, giao đúng/sai món, tăng/mất combo) phải có phản hồi tức thì qua trạng thái trực quan và thông báo ngắn gọn.
- **Chống kẹt vòng lặp:** Dọn dẹp sạch mọi `interval`, `requestAnimationFrame` và WebGL resource khi unmount hoặc chuyển trạng thái `IDLE` / `SUMMARY`.

## 4. Quy tắc làm việc của Agent
- Đọc kỹ `SPEC.md` và các file hiện có trước khi sửa code.
- Khi cài package 3D/2.5D, kiểm tra tương thích phiên bản React/TypeScript để tránh xung đột peer dependencies.
- Giữ code sạch, có kiểu dữ liệu rõ ràng, ưu tiên chạy được ngay và ổn định hơn là làm hiệu ứng quá nặng gây giật lag.