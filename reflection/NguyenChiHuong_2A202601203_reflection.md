# Reflection cá nhân — Nguyễn Chí Hướng

**Mã sinh viên:** 2A202601203  
**Dự án:** Xây dựng agent AI khảo sát 5-why thích ứng giúp học viên xác định painpoint có căn cứ cho dự án
**Nhóm:** [XX] · Zone [X]  
**Ngày nộp:** 31/07/2026  

---

## 1. Phần mình làm

**Phần có tên mình:**
- Evidence Lead — phụ trách khối R1 về bằng chứng người dùng và impact.
- Trực tiếp phỏng vấn và ghi lại câu trả lời theo chuỗi 5-why của 5 người trong file `Phỏng vấn.txt`.
- Cùng nhóm tổng hợp các nguyên nhân thành cụm, đối chiếu số người gặp vấn đề và xem xét các ứng viên giải pháp trong `spec.md` §1–§2.
- Rà lại chất lượng bằng chứng: phân biệt người trong và ngoài nhóm, giữ negative case, kiểm tra lời nguyên văn và phát hiện các chain còn thiếu câu hỏi về hậu quả.

**Deliverable cụ thể:**
- Log thô: `C:\Users\Dell\OneDrive\Desktop\Phỏng vấn.txt`.
- Artifact mình chịu trách nhiệm: `spec.md` §1–§2 và log khảo sát chuẩn hoá tại `evidence/survey-log.md`.
- Quyết định thiết kế quan trọng nhất mình đưa ra: không chỉ đếm số người nói “có khó khăn”, mà phải dựa vào hành vi ở lần gần nhất, lời trả lời nguyên văn và hậu quả thực tế. Khi so sánh các ứng viên, nhóm chọn **Đào Gốc** dù cụm “không moi được pain từ người khác” có 3/8 người, vì đây là vấn đề ở thượng nguồn, có thể build trong thời gian hackathon và tạo đầu vào cho bước sàng lọc pain sau đó.

---

## 2. AI hỗ trợ mình như thế nào

| Việc | Ai làm | Ghi chú |
|---|---|---|
| Phỏng vấn và ghi câu trả lời của 5 người | Mình | Mình trực tiếp hỏi, nghe và ghi lại nội dung; AI không thể thay thế nguồn bằng chứng người thật. |
| Chuẩn hoá ghi chú thành các chuỗi 5-why và gợi ý nhóm nguyên nhân | Cả hai | AI hỗ trợ sắp xếp câu chữ và gợi ý cụm; mình đối chiếu lại với câu trả lời gốc trước khi sử dụng. |
| Kiểm tra evidence theo rubric | Cả hai | AI giúp phát hiện mẫu còn thiếu người ngoài nhóm, thiếu trường “hậu quả gì” và có chain dừng ở điều kiện; mình xác nhận các điểm này trên dữ liệu phỏng vấn. |
| Chọn quote, giữ negative case và quyết định bằng chứng nào được tính | Mình | Đây là quyết định cần hiểu bối cảnh người trả lời, không giao hoàn toàn cho AI. |

**Chỗ AI giúp được nhiều nhất:**
> AI giúp mình biến ghi chú phỏng vấn còn rời rạc thành cấu trúc dễ kiểm tra, đồng thời chỉ ra các lỗ hổng so với rubric. Nhờ vậy mình thấy rõ rằng tỷ lệ phần trăm cao chưa đủ mạnh nếu mẫu có thành viên nhóm, thiếu log nguyên văn hoặc chưa ghi được hậu quả.

**Chỗ AI không thay được (phải tự làm):**
> AI không thể tạo ra bằng chứng người dùng thật. Mình vẫn phải trực tiếp tiếp cận người được hỏi, hỏi tiếp khi câu trả lời còn chung chung, ghi đúng lời họ nói, xin phép sử dụng dữ liệu và tự chịu trách nhiệm về việc một kết luận là lời người dùng hay chỉ là suy luận.

---

## 3. Bài học từ case fail của nhóm

**Case fail:**
> Ở một phiên phỏng vấn, chuỗi trả lời đi từ “chưa gặp nhiều khó khăn” đến “chưa đủ trải nghiệm”, “chưa đi làm, chưa tiếp xúc nhiều” và dừng ở “do môi trường, chưa có cơ hội gặp những người muốn phỏng vấn”. Chain này mới dừng ở một **điều kiện**, chưa tìm ra nguyên nhân có thể can thiệp và cũng chưa hỏi được hậu quả cụ thể.

**Vì sao nó fail:**
> Câu mở đầu “Tại sao bạn gặp khó khăn trong việc nghĩ ra painpoint?” quá chung và mặc định người trả lời đã có khó khăn. Khi họ trả lời ngắn, mình tiếp tục hỏi “tại sao” nhưng chưa neo vào một sự kiện gần nhất, nên câu trả lời ngày càng khái quát. Quy trình lúc đó cũng chưa có tiêu chí nhận biết chain đã tới gốc hay mới dừng ở hoàn cảnh.

**Nhóm xử lý thế nào:**
> Nhóm đưa chính dạng chain này thành case lỗi `real-anon1-deadend` trong golden set. Agent phải gán câu “do môi trường…” là `dieu_kien` và cảnh báo chain chưa tới gốc, thay vì tự bịa ra kết luận. Về quy trình evidence, nhóm thống nhất đổi sang hỏi về lần gần nhất người dùng tìm đề tài, ghi nguyên văn từng cặp hỏi–đáp và bổ sung câu “Việc đó khiến bạn phải trả giá gì?”.

**Nếu làm lại, mình sẽ khác gì:**
> Mình sẽ bắt đầu bằng một tình huống có thời gian cụ thể, ví dụ: “Lần gần nhất bạn tìm đề tài cho một dự án, từ lúc bắt đầu đến lúc chốt mất bao lâu?”. Sau mỗi câu trả lời, mình sẽ kiểm tra đó là sự kiện, nguyên nhân hay chỉ là điều kiện; nếu là điều kiện thì hỏi tiếp về việc người đó đã làm, điều gì cản trở và hậu quả họ thực sự chịu. Mình cũng sẽ tách rõ người ngoài nhóm ngay từ lúc lấy mẫu để không phải tính lại sau.

---

## 4. Một điều mình học được từ sự kiện này

> Evidence tốt không nằm ở một tỷ lệ phần trăm đẹp, mà ở việc người khác có thể lần ngược từ kết luận về đúng câu hỏi, lời trả lời nguyên văn và hậu quả thật của từng người dùng.
