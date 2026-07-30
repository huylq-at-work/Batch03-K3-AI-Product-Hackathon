# Reflection cá nhân — Phạm Thị Liên

**Dự án:** Xây dựng agent AI khảo sát 5-why thích ứng giúp học viên xác định painpoint có căn cứ cho dự án 
**Nhóm:** Batch 03 (Khoá 3) · Zone [X]  

---

## 1. Phần mình làm

> Mô tả cụ thể phần bạn chịu trách nhiệm trong dự án. Đủ chi tiết để TA hỏi ngẫu nhiên và bạn giải thích được.

**Phần có tên mình:**
- **Evidence Collection (Khối Rubric R1 - 15đ):** Phỏng vấn 5-why với người dùng thật để thu thập bằng chứng về pain.
- **Eval & Testing (Khối Rubric R4 - 15đ):** Chạy golden set qua các provider (Mock, OpenAI), phân tích kết quả, ghi log chi tiết từng lượt chạy.

**Deliverable cụ thể:**
- File evidence: `evidence/survey-log.md` (transcript phỏng vấn 5-why với ≥9 người, chờ đủ 20)
- File eval: `eval/TEST-LOG.md`, `eval/TEST-LOG-OPENAI.md`, `eval/RUNS-SUMMARY.md`
- File runs: `eval/runs/mock-testcase.md`, `eval/runs/openai-testcase.md`

**Quyết định thiết kế quan trọng nhất mình đưa ra:**  
Khi chạy test với OpenAI thất bại (C1 chỉ 35.7%, tệ hơn mock 50%), quyết định **không che giấu kết quả** mà ghi log đầy đủ và phân tích từng case fail, tìm root cause (prompt sai định nghĩa `nguyen_nhan`, logic dừng sai, không bắt số tiếng Việt). Rubric nói rõ: *"số liệu bị chỉnh sửa sẽ không được tính, còn chưa đạt mà phân tích được nguyên nhân vẫn tính đủ điểm."*

---

## 2. AI hỗ trợ mình như thế nào

> Không phải liệt kê tool — mà là: AI làm gì, mình làm gì, ranh giới ở đâu.

| Việc | Ai làm | Ghi chú |
|---|---|---|
| Phỏng vấn 5-why với người thật | Mình | Hỏi "vì sao" 4-5 lần, ghi lời nguyên văn |
| Phân loại câu trả lời vào 3 cụm A/B/C | Mình | Đọc 9 chain, gán tay từng why vào cụm |
| Chạy test case với Mock/OpenAI | AI + Mình | Mình gõ lệnh terminal, AI thực thi code, trả kết quả |
| Phân tích 23 case fail, tìm pattern | Cả hai | Mình đọc bảng kết quả, AI gợi ý nhóm lỗi theo lớp ①②③④ |
| Viết log tổng hợp với format markdown | AI | Mình đưa raw output, AI cấu trúc thành bảng + phân tích |

**Chỗ AI giúp được nhiều nhất:**
> Cấu trúc hoá kết quả test thành bảng so sánh rõ ràng (Mock vs OpenAI, lan1 vs lan2 vs sau-fix), phát hiện pattern lỗi từ 23 case (ví dụ: 5/6 case C1 fail đều lệch cùng hướng — model gán thấp hơn thực tế). Không có AI thì mình phải đọc 23 file JSON thủ công và tự vẽ bảng.

**Chỗ AI không thay được (phải tự làm):**
> Quyết định chạy lại hay không khi thấy kết quả thấp. Phán đoán đâu là lỗi của code, đâu là lỗi của prompt, đâu là lỗi của golden set. Và quan trọng nhất: **không che giấu số liệu xấu** — đây là quyết định đạo đức AI không có quyền đưa ra thay mình.

---

## 3. Bài học từ case fail của nhóm

> Chọn **1 case cụ thể** mà prototype/process đã fail — không phải fail chung chung.

**Case fail:**
> Chạy test với OpenAI gpt-4o-mini (lượt `openai-testcase`), kết quả C1 (nhãn tầng đúng) chỉ **35.7%**, tệ hơn hẳn mock rule-based (50%) và tệ hơn lượt trước `lan2` (57.1%). Cả 3 chiều C1, C3, C4 đều **hồi quy**.

**Vì sao nó fail:**
> Có 3 nguyên nhân xảy ra đồng thời:
> 1. **Định nghĩa `nguyen_nhan` trong prompt mơ hồ:** Chỉ nói "hành động hoặc lựa chọn của chủ thể" → model đọc "sự thiếu" (thiếu quy trình, thiếu kiến thức) là không phải hành động, nên gán xuống `dieu_kien`.
> 2. **Logic điều kiện dừng không bắt `can_thiep_duoc: true`:** Case 2 & 4 đã tới nguyên nhân nhưng agent vẫn hỏi tiếp (mode = label thay vì stop).
> 3. **Regex không bắt con số tiếng Việt:** "1 tuần", "2 tuần rưỡ" không được parse → C4 fail.

**Nhóm xử lý thế nào:**
> Không rollback về mock. Ghi log đầy đủ 23 case fail vào `eval/TEST-LOG-OPENAI.md`, phân tích từng case theo 4 lớp chỗ khó, đề xuất 5 fix cụ thể:
> 1. Sửa định nghĩa `nguyen_nhan` thêm "HOẶC sự thiếu"
> 2. Fix regex bắt số tiếng Việt: `/(\d+[\s\.]?\d*)\s*(tuần|ngày|tháng)/gi`
> 3. Kiểm tra logic dừng: `if (node.can_thiep_duoc === true) return { mode: 'stop' }`
> 4. Bắt buộc gán ASSUMPTION cho số phỏng đoán
> 5. Chạy lại và so với lượt `lan2` (57.1%)

**Nếu làm lại, mình sẽ khác gì:**
> Trước khi chạy test với AI thật, sẽ **chạy 5 case thử nghiệm trước** để verify prompt và logic hoạt động đúng, thay vì chạy thẳng 23 case rồi mới phát hiện định nghĩa sai. Và quan trọng hơn: **commit code + prompt trước mỗi lượt chạy** để rollback được khi cần, thay vì mất dấu code của lượt `lan2` (57.1%) — lượt tốt nhất.

---

## 4. Một điều mình học được từ sự kiện này

> Một câu, cụ thể, có thể áp dụng được vào dự án tiếp theo.

> Trong AI product, **một định nghĩa mơ hồ trong prompt tốn đắt gấp 100 lần một dòng code sai** — vì nó fail âm thầm trên cả 23 case mà không có error log, và chỉ phát hiện được khi đọc tay từng output, so với expect, và nhận ra pattern "model gán thấp hơn thực tế".

