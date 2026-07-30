# Validation Feedback Log (Vòng Test CP5)

**Người phụ trách:** Nguyễn Tiến Đạt (Validation Lead)
**Mục tiêu:** Kiểm thử Prototype khảo sát 5-why với user (≥5 người ngoài nhóm).
**Quy trình 1 phiên (10 phút):** Giao task thật → Im lặng quan sát → Hỏi 3 câu cốt lõi.

## Danh sách người tham gia test (Willing Users)

1. Ẩn danh 1 (Sinh viên K3 VinUni)
2. Ẩn danh 2 (Sinh viên K3 VinUni)
3. Ẩn danh 3 (Sinh viên K3 VinUni)
4. Ẩn danh 4 (Sinh viên K3 VinUni)
5. Ẩn danh 5 (Sinh viên K3 VinUni)

---

## Log Kết Quả Quan Sát & Phỏng Vấn

*3 câu hỏi cốt lõi sau khi user dùng xong:*
- *Q1: Điều gì khó hiểu hoặc khó chịu nhất?*
- *Q2: Kết quả này bạn có tin không — vì sao?*
- *Q3: Bạn có dùng thật không — vì sao / vì sao chưa?*

| Người thử (Tên/Vai) | Task được giao | Quan sát (Im lặng) | Quote nguyên văn (Phản hồi 3 câu hỏi) | Mức nghiêm trọng (Low/Med/High) |
|---|---|---|---|---|
| **1. Ẩn danh 1** | Khai báo painpoint: "Mình muốn làm hệ thống điểm danh AI vì điểm danh tay mất thời gian." | User gõ rất hăng ở câu đầu, nhưng khi AI hỏi tiếp thì lúng túng, gõ cộc lốc 1 chữ "Lâu" rồi bị AI bắt trả lời lại. | - Q1: "Lúc nó hỏi xoáy vào 'vì sao lâu', mình không biết phải giải thích thế nào cho máy hiểu."<br>- Q2: "Tin, vì kết quả nó chỉ ra đúng là điểm danh bằng AI bị dư thừa và không giải quyết được gốc rễ."<br>- Q3: "Dùng để gạch bớt mấy ý tưởng vớ vẩn ban đầu thì được." | High |
| **2. Ẩn danh 2** | Khai báo painpoint: "Không biết chọn đề tài nào vì catalog có quá nhiều thông tin." | User chú ý đến cái nhãn (triệu chứng/nguyên nhân) và bấm sửa nhãn 2 lần vì AI đoán sai ý đồ của câu trả lời. | - Q1: "Cái nhãn nó dán tự động lúc đầu bị sai loại, mình phải tự bấm sửa lại tay thì nó mới chạy đúng."<br>- Q2: "Cũng tin, nhưng cảm giác mình phải tự điều chỉnh lại thì máy mới ra được kết quả cuối cùng."<br>- Q3: "Chắc chắn dùng, đỡ tốn cả tuần đi phỏng vấn form." | Med |
| **3. Ẩn danh 3** | Khai báo painpoint: "Quản lý kho thủ công tốn quá nhiều nhân sự." | Nhập câu trả lời quá ngắn (dưới 10 chữ) 3 lần liên tiếp, bị agent hỏi lặp lại y chang làm user cáu. | - Q1: "Nó bắt mình giải thích rõ 'ai là người tốn' lặp đi lặp lại làm mình hơi nản, giống máy móc quá."<br>- Q2: "Kết quả ra hơi hiển nhiên, không có gì bất ngờ."<br>- Q3: "Không dùng đâu, ba cái này tự nhẩm trong đầu 15 phút là ra." | High |
| **4. Ẩn danh 4** | Khai báo painpoint: "Sinh viên khó tìm lịch khám bệnh phù hợp với lịch học." | Trải nghiệm rất trơn tru, chạy một lèo qua 4 tầng why và ra tới gốc (do chưa có cổng đồng bộ dữ liệu). | - Q1: "Mọi thứ mượt, nhưng giao diện chữ hiển thị ra hơi nhiều, đọc hơi lười."<br>- Q2: "Rất tin, nó dẫn dắt mình đi sâu hơn mình tưởng tượng ban đầu."<br>- Q3: "Sẽ dùng trước khi mình chốt spec cho cái đề tài capstone." | Low |
| **5. Ẩn danh 5** | Khai báo painpoint: "Giao tiếp làm việc nhóm kém vì sinh viên lười." | Trả lời câu cụt lủn là "Do môi trường". Agent báo chain chưa tới gốc và ngắt kết nối. User bối rối không biết bấm gì tiếp. | - Q1: "Nó báo 'chưa tới nguyên nhân can thiệp được' làm mình khá bối rối không biết phải làm sao để sửa lại."<br>- Q2: "Tin vì nó chứng minh được dự án của mình không giải quyết được cái tính cách lười của con người."<br>- Q3: "Dùng để loại mấy ý tưởng viển vông, nhưng UX cần hướng dẫn thêm lúc bị lỗi." | Med |

---

## Tổng hợp Action Items (Changelog đề xuất)

Từ kết quả trên, những điểm cần update vào hệ thống / spec (R6 yêu cầu ít nhất 1 thay đổi):

1. **Vấn đề:** Khi người dùng nhập câu trả lời quá ngắn (< 10 chữ) hoặc cộc lốc, Agent hỏi lại nhưng không kèm theo ví dụ mẫu khiến user bối rối không biết trả lời thế nào (case Ẩn danh 1 & Ẩn danh 3).
   → **Thay đổi:** Cập nhật prompt của Agent (trong `prompt.ts`) để khi gặp câu trả lời quá ngắn, Agent ngoài việc hỏi lại phải bổ sung thêm gợi ý: *"Ví dụ: Lần gần nhất bạn gặp khó khăn này, bạn đang ở bước nào và ai là người chịu ảnh hưởng?"*
2. **Vấn đề:** Khi chạm case "do môi trường" và chain bị đánh dấu "chưa tới nguyên nhân can thiệp được", user bị kẹt (case Ẩn danh 5).
   → **Thay đổi:** Thêm tooltip hoặc gợi ý dạng nút bấm (ví dụ: "Thử viết lại câu trả lời") ngay dưới cảnh báo chain chưa tới gốc để người dùng không bị kẹt.

*(Cập nhật các thay đổi này vào mục §9 Changelog của file `spec.md`)*
