# Reflection cá nhân — Nguyễn Tiến Đạt
**Dự án:** Xây dựng agent AI khảo sát 5-why thích ứng giúp học viên xác định painpoint có căn cứ cho dự án
**Nhóm:** Batch 03 (Khoá 3) · Zone [Điền Zone của bạn]
**Ngày nộp:** 30/07/2026
---
## 1. Phần mình làm
> Mô tả cụ thể phần bạn chịu trách nhiệm trong dự án. Đủ chi tiết để TA hỏi ngẫu nhiên và bạn giải thích được.
**Phần có tên mình:**
- **Validation Lead (Khối Rubric R6 - 8đ):** Chịu trách nhiệm chính trong vòng test với user (người dùng thật ngoài nhóm) tại CP5.
- Trực tiếp tìm kiếm người thử nghiệm (bao gồm cả việc chủ động đi trao đổi, quét QR các nhóm khác để mời họ tham gia test chéo nhằm đảm bảo đủ số lượng ≥5 người ngoài nhóm).
- Điều phối các phiên test (10 phút/phiên): Giao task thật, **im lặng quan sát** cách user tương tác và hỏi đúng 3 câu cốt lõi (*"Điều gì khó hiểu nhất?"*, *"Bạn có tin kết quả này không — vì sao?"*, *"Bạn có dùng thật không — vì sao / vì sao chưa?"*).
- Ghi log (**nguyên văn**) quá trình thử nghiệm của user, đánh giá mức độ nghiêm trọng và đề xuất thay đổi để cập nhật dự án.
**Deliverable cụ thể:**
- File: `validation/feedback-log.md` và `spec.md` (phần §9 Changelog).
- Quyết định thiết kế/quy trình quan trọng nhất mình đưa ra: 
  1. Chấp nhận việc loại bỏ các test case nhận toàn "lời khen" (vì bị xem là chưa đạt) và ép user vào các task khó hơn để lôi ra được painpoint thật sự của hệ thống. 
  2. Quyết định **chỉ quan sát im lặng** (để thấy user bối rối ở đâu thay vì hướng dẫn họ vượt qua lỗi) và **chỉ log quote nguyên văn** (để đảm bảo bằng chứng khách quan, không bị bóp méo bởi suy diễn chủ quan của người phỏng vấn).
---
## 2. AI hỗ trợ mình như thế nào
> Không phải liệt kê tool — mà là: AI làm gì, mình làm gì, ranh giới ở đâu.
| Việc | Ai làm | Ghi chú |
|---|---|---|
| Lên cấu trúc, format file log đánh giá | AI | Định dạng lại bảng `feedback-log.md` sao cho chuẩn chỉ |
| Tìm người phỏng vấn, đi quét QR nhóm khác | Mình | Đòi hỏi giao tiếp người - người để đạt đủ số lượng (n) |
| Quan sát, ghi chép hành vi và hỏi user | Mình | Ghi lại sự ngập ngừng, luống cuống của user |
| Trích xuất thay đổi (changelog) từ feedback | Cả hai | Mình đưa thô (raw notes), AI tổng hợp thành action cụ thể đưa vào `spec.md` §9 |
**Chỗ AI giúp được nhiều nhất:**
> Tổng hợp, cấu trúc hoá lại những ghi chép thô và quote nguyên văn của mình thành các action item rõ ràng, logic để đưa vào phần Changelog một cách chuyên nghiệp.
**Chỗ AI không thay được (phải tự làm):**
> Giao tiếp với con người (đi kiếm người test), và sự nhạy bén khi quan sát user (nhìn ra được họ đang bối rối ở đâu dù họ không nói ra). Nhận diện được thái độ nể nang qua những lời khen vô thưởng vô phạt.
---
## 3. Bài học từ case fail của nhóm
> Chọn **1 case cụ thể** mà prototype/process đã fail — không phải fail chung chung.
**Case fail:**
> Trong những phiên test đầu tiên, người dùng thực hiện task quá trơn tru và feedback trả về toàn bộ là "lời khen", không có ý kiến chê trách nào.
**Vì sao nó fail:**
> Thứ nhất, do giao task chưa đủ độ khó, chưa chạm tới các corner case (ví dụ case deadend). Thứ hai, do tâm lý người dùng thử (nhất là khi test chéo nể nang nhau) thường ngại chê thẳng mặt. Theo luật nhóm, toàn lời khen nghĩa là phiên test **chưa đạt**.
**Nhóm xử lý thế nào:**
> Hủy kết quả của phiên test "toàn khen" đó, thiết kế lại task giao cho user sao cho hóc búa hơn, bắt buộc người dùng phải đi vào các luồng khó. Mình cũng phải dặn trước user là hãy "đóng vai người dùng khó tính nhất có thể".
**Nếu làm lại, mình sẽ khác gì:**
> Ngay từ đầu sẽ chuẩn bị sẵn một danh sách các task mồi có độ khó cao hoặc cố tình bẫy lỗi để ép người dùng phải va vấp. Việc setup kỳ vọng ("tôi cần bạn chê") sẽ được đưa lên hàng đầu trước khi bấm giờ test.
---
## 4. Một điều mình học được từ sự kiện này
> Một câu, cụ thể, có thể áp dụng được vào dự án tiếp theo.
> Trong User Testing, một feedback toàn lời khen thường là một bài test thất bại; giá trị thực sự nằm ở những phút im lặng bối rối và những lời phàn nàn nguyên văn của người dùng.