# SPEC.md — BÁNH MÌ MASTER 2.5D (DEVFEST PROTOTYPE)

## 1. Mục tiêu sản phẩm
Xây dựng prototype game mô phỏng làm bánh mì Việt Nam theo phong cách 2.5D chạy mượt trên trình duyệt web (desktop & màn hình ngang/rộng), có tối thiểu 4 món đặc trưng (Bánh mì Pate, Bánh mì Trứng Chả, Bánh mì Heo Quay, Bánh mì Thập Cẩm), cơ chế tính điểm/combo và vòng chơi hoàn chỉnh từ màn hình bắt đầu đến tổng kết ca bán.

## 2. Công nghệ khuyến nghị
- React + TypeScript + Tailwind CSS.
- Đồ họa 2.5D: ưu tiên giải pháp nhẹ, ổn định trên trình duyệt (Three.js / React Three Fiber hoặc HTML5 Canvas / CSS 2.5D layered diorama với bóng đổ và chiều sâu rõ ràng), đảm bảo không lỗi dependency khi chạy local/dev server.

## 3. Thực đơn & Logic chế biến
Các món tối thiểu cần hỗ trợ:
1. **Bánh mì Pate**: Vỏ bánh giòn + Pate + Dưa leo + Đồ chua + Ngò + Sốt/Nước tương.
2. **Bánh mì Trứng Chả**: Vỏ bánh giòn + Trứng chiên + Chả lụa + Pate/Bơ + Đồ chua + Ngò.
3. **Bánh mì Heo Quay**: Vỏ bánh giòn + Heo quay giòn bì + Dưa leo + Đồ chua + Ngò + Nước sốt.
4. **Bánh mì Thập Cẩm**: Vỏ bánh giòn + Pate + Trứng chiên + Chả lụa + Heo quay + Dưa leo + Đồ chua + Ngò.

Luồng thao tác của người chơi:
- Xem order hiện tại của khách (tên món, danh sách thành phần yêu cầu, thời gian chờ).
- Chọn/nướng vỏ bánh (có thanh trạng thái: Chưa giòn -> Đạt chuẩn -> Quá lửa).
- Click/chọn từng nguyên liệu trên quầy để thêm vào ổ bánh đang làm (hiển thị trực quan các lớp nguyên liệu chồng lên nhau và danh sách đã thêm).
- Nhấn **Giao bánh** để chấm điểm:
  - Đúng đủ thành phần + đúng độ giòn: cộng điểm cơ bản + thưởng tốc độ + tăng `combo`.
  - Thiếu/sai nguyên liệu hoặc cháy khét: báo lỗi cụ thể (ví dụ: *"Thiếu Heo quay"*, *"Bánh hơi cháy"*, *"Thừa ớt"*), reset `combo` và trừ điểm nhẹ.
- Có nút **Làm lại ổ bánh** để người chơi sửa sai nhanh mà không mất thời gian.

## 4. UI/UX & Phản hồi trực quan
- Bố cục rõ ràng, tập trung vào quầy làm bánh 2.5D ở trung tâm, khu vực Order & Điểm/Combo ở trên cùng, khay nguyên liệu phân nhóm rõ ràng ở phía dưới.
- Mọi thao tác đều có phản hồi ngay lập tức (highlight nguyên liệu, badge trạng thái món, hiệu ứng điểm cộng/cảnh báo).
- Có màn hình Start rõ ràng, màn hình Playing mượt mà, và màn hình End/Summary hiển thị tổng điểm, số bánh hoàn thành, combo cao nhất và nút **Chơi lại**.

## 5. Tiêu chí hoàn thành MVP
- Chạy được bằng lệnh dev chuẩn không lỗi runtime.
- Chơi trọn vẹn 1 ca (ví dụ 60–90 giây) với nhiều lượt khách nối tiếp nhau.
- Đầy đủ 4 loại bánh mì trên và cơ chế chấm điểm + combo hoạt động chính xác.