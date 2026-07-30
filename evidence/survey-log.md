# Log khảo sát 5-why — Đào Gốc

**Người phụ trách:** Nguyễn Chí Hướng — 2A202601203  
**Mục đích:** lưu câu hỏi và câu trả lời nguyên văn để người chấm có thể lần ngược từ số liệu trong `spec.md` §1–§2.  
**Nguyên tắc:** nối thêm theo từng đợt, không ghi đè người cũ; không tự suy ra vai, câu hỏi hoặc hậu quả không có trong nguồn.

## Tổng quan và chống đếm trùng

| Nguồn | Số chain trong nguồn | Chain trùng với mẫu cũ | Người mới được cộng |
|---|---:|---:|---:|
| Mẫu ban đầu của nhóm | 9 | — | 9 |
| `Phỏng vấn.txt` — Hướng thu đợt 1 | 5 | 2 (`Ẩn danh 1`, `Ẩn danh 2`) | 3 (`Ẩn danh 3`, `Ẩn danh 4`, `KS-03`) |
| `Phỏng vấn thêm nữa.txt` — Hướng thu đợt 2 | 5 | 0 | 5 (`KS-05` đến `KS-09`) |
| **Tổng người duy nhất** | | | **17** |

Trong 17 người duy nhất có 4 thành viên nhóm và **13 người ngoài nhóm**. Hai chain trùng ở đợt 1 được giữ ở phần raw để kiểm tra nguồn nhưng chỉ tính một lần trong `spec.md`.

## Đợt 1 — nguồn `Phỏng vấn.txt`

**Câu hỏi được ghi trong nguồn:**  
> Tại sao bạn lại gặp khó khăn trong việc nghĩ ra pain point, hay điều gì theo 5 Why?

### Người 1 → `Ẩn danh 3`

**Vai:** chưa ghi nhận  
**Ngoài nhóm:** có  
**Hậu quả:** chưa hỏi

1. Bản thân chưa gặp khó khăn gì.
2. Lĩnh vực không nằm trong đó.
3. Hướng nghiên cứu khác hướng trải nghiệm.
4. Ngoại giao chưa đủ rộng.
5. Hướng nội.
6. Nếu có cộng đồng cũng không chủ động.

**Ghi chú phân tích:** câu đầu phủ nhận friction nhưng các why sau lại nêu rào cản; giữ là negative/ambiguous case, không ép vào cụm pain.

### Người 2 → `Ẩn danh 4`

**Vai:** chưa ghi nhận  
**Ngoài nhóm:** có  
**Hậu quả:** chưa hỏi

1. Đề bài mở (nhiều pain point). Tìm vấn đề khó, không muốn tạo vấn đề chủ quan.
2. Muốn đề bài phải thực tế, giải quyết được vấn đề.
3. Chưa chủ động phỏng vấn, trao đổi bằng GPT nhưng chỉ là chủ quan.
4. Người ta trả lời khó hiểu (không hiểu ý).

**Cụm:** B — không moi được pain từ người khác; C — không có tiêu chí pain nào đáng làm.

### Người 3 → `KS-03` *(ẩn danh)*

**Vai:** 25 tuổi · Dev  
**Ngoài nhóm:** có  
**Hậu quả:** chưa hỏi

1. Khó tiếp cận với người gặp vấn đề.
2. Không có nhiều mối quan hệ.

**Cụm:** B — không moi được pain từ người khác.

### Người 4 → `Ẩn danh 1` *(đã có trong mẫu ban đầu, không cộng lại)*

**Vai:** đi học  
**Ngoài nhóm:** có  
**Hậu quả:** chưa hỏi

1. Chưa gặp nhiều khó khăn.
2. Chưa đủ trải nghiệm.
3. Chưa đi làm, chưa tiếp xúc nhiều.
4. Do môi trường (chưa có cơ hội gặp những người muốn phỏng vấn).

**Cụm:** A — không có domain chứa pain. Chain dừng ở `điều_kiện`, chưa tới nguyên nhân can thiệp được.

### Người 5 → `Ẩn danh 2` *(đã có trong mẫu ban đầu, không cộng lại)*

**Vai:** đi học  
**Ngoài nhóm:** có  
**Hậu quả:** chưa hỏi

1. Không hiểu được người khác, chỉ bằng góc nhìn chủ quan.
2. Không thể đặt mình vào người khác.
3. Có những người không đồng ý khảo sát; có nhiều nguồn nhưng không biết uy tín và chất lượng ra sao.

**Cụm:** B — không moi được pain từ người khác.

---

## Đợt 2 — nguồn `Phỏng vấn thêm nữa.txt`

Nguồn mới chỉ ghi chuỗi câu trả lời, **không ghi lại câu hỏi từng lượt, vai người trả lời hoặc hậu quả**. Các trường này được đánh dấu thiếu để hỏi lại; không tự khôi phục bằng suy luận.

### Người 1 → `KS-05` *(ẩn danh)*

**Vai:** chưa ghi nhận  
**Ngoài nhóm:** có  
**Câu hỏi từng lượt:** chưa ghi trong nguồn  
**Hậu quả:** chưa hỏi

1. Vì mỗi người làm việc với lính vực riêng.
2. Cần gặp nhiều người.
3. Tốn thời gian.

**Cụm:** B — không moi được pain từ người khác; D — chi phí xác minh cao.

### Người 2 → `KS-06` *(ẩn danh)*

**Vai:** chưa ghi nhận  
**Ngoài nhóm:** có  
**Câu hỏi từng lượt:** chưa ghi trong nguồn  
**Hậu quả:** chưa hỏi

1. Chưa hiểu rõ đề tài.
2. Chưa thể đặt mình vào vị trí actor và không tin tưởng lắm vào thông tin trên mạng.

**Cụm:** B — không moi được pain từ người khác; C — không có tiêu chí pain nào đáng làm.

### Người 3 → `KS-07` *(ẩn danh)*

**Vai:** chưa ghi nhận  
**Ngoài nhóm:** có  
**Câu hỏi từng lượt:** chưa ghi trong nguồn  
**Hậu quả:** chưa hỏi

1. Không biết bắt đầu tìm từ đâu.
2. Vì chưa có quy trình để quan sát và ghi nhận vấn đề.
3. Vì trước đây chỉ làm theo đề bài có sẵn.
4. Vì ít tham gia các dự án thực tế.
5. Vì chưa có nhiều kinh nghiệm thực hành.

**Cụm:** A — không có domain chứa pain; E — không có quy trình.

### Người 4 → `KS-08` *(ẩn danh)*

**Vai:** chưa ghi nhận  
**Ngoài nhóm:** có  
**Câu hỏi từng lượt:** chưa ghi trong nguồn  
**Hậu quả:** chưa hỏi

1. Khó tìm pain point vì mọi thứ đều có vẻ bình thường.
2. Vì đã quen với các bất tiện hằng ngày.
3. Vì thường tìm cách thích nghi thay vì phân tích.
4. Vì chưa hình thành thói quen quan sát vấn đề.

**Cụm:** E — không có quy trình/thói quen quan sát.

### Người 5 → `KS-09` *(ẩn danh)*

**Vai:** chưa ghi nhận  
**Ngoài nhóm:** có  
**Câu hỏi từng lượt:** chưa ghi trong nguồn  
**Hậu quả:** chưa hỏi

1. Khó tìm pain point vì chỉ nghĩ trong phạm vi bản thân.
2. Vì ít tiếp xúc với nhóm người khác.
3. Vì lịch sinh hoạt lặp lại.
4. Vì ít tham gia hoạt động cộng đồng.
5. Vì môi trường giao tiếp khá hạn chế.

**Cụm:** A — không có domain chứa pain; B — không moi được pain từ người khác.

---

## Việc cần hỏi bổ sung

- Thu thêm **7 người ngoài nhóm** để đạt chuẩn A là 20 người ngoài nhóm.
- Hỏi lại vai của `Ẩn danh 3–4` và `KS-05–KS-09`.
- Bổ sung câu hỏi từng lượt cho đợt 2 nếu người phỏng vấn còn bản ghi gốc.
- Hỏi tất cả người tham gia: **“Việc đó khiến bạn phải trả giá gì?”**
- Ghi rõ đồng thuận sử dụng dữ liệu và tiếp tục giữ tên ẩn danh khi đưa vào repo.
