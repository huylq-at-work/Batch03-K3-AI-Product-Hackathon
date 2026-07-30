# AI SPEC — Đào Gốc: khảo sát 5-why thích ứng · Nhóm [XX] · Zone [X]

**Đề tài:** Xây dựng agent AI khảo sát 5-why thích ứng giúp học viên xác định painpoint có căn cứ cho dự án

Hướng: [ ] A — VLearn  [x] B — Trợ lý Học viên  [x] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

> 🔲 **Chốt hướng tại CP1.** Mình đề xuất **C — Làn mở**. Xem rủi ro R-1 ở §10 trước khi tick: đề bài mô tả hướng C là *"mining data và đề xuất sản phẩm AI khác cho khoá"*, còn dự án này lấy bằng chứng từ khảo sát tự làm chứ không từ `data/vlearn-pack/`. **Hỏi TA tại CP1.**

---

## §1. User & Job

### Job executor

**Học viên khoá AI Thực Chiến chưa có domain nghề để lấy pain và data sẵn.**

Không phải "sinh viên nói chung". Trục phân loại này rút ra từ chính khảo sát (§1 Evidence), không phải giả định trước: 9 người khảo sát tự tách làm hai nhóm theo việc **pain và bằng chứng có đến kèm sẵn trong môi trường họ đang sống hay không**.

| | Trong đối tượng | Ngoài đối tượng |
|---|---|---|
| Pain | phải đi tìm | đã có sẵn từ công việc |
| Data | phải đi thu | lấy trực tiếp từ doanh nghiệp |
| Thời gian tìm đề tài | **1–4 tuần** | **15 phút** |
| Ví dụ trong khảo sát | Hướng, Đạt, Liên, Huy, Minh, Trọng, Ẩn danh 1, Ẩn danh 2 | **Vương** |

Vương là **negative case**, giữ lại trong spec có chủ đích: anh ấy làm lộ ra biến quyết định. Vương không giỏi hơn Minh — cả hai đều đi làm, đều có kinh nghiệm. Khác biệt duy nhất là môi trường đã giao sẵn pain và data cho một người, còn người kia phải xây cả hai từ đầu.

### Workflow hiện tại

```
nghĩ ra vài ý tưởng → không có tiêu chí biết ý tưởng nào đáng
  → buộc phải đi verify → soạn Google Form / phỏng vấn tay
  → thu về câu trả lời hời hợt (form tĩnh, không hỏi được "vì sao")
  → 1–4 tuần sau: phát hiện "đã có solution" / "không đáng dùng AI"
  → về lại 0
```

🔲 *Đính kèm worksheet JTBD + ảnh sơ đồ workflow này vào `evidence/`.*

### Core JTBD *(không tên sản phẩm/AI trong câu)*

> **Tìm ra nguyên nhân gốc mà người khác đang thực sự vướng, để chọn được một vấn đề đáng đầu tư thời gian vào.**

Tự kiểm theo guide §1.1 câu 2: bỏ AI đi, việc này còn tồn tại không? **Còn** — đây là việc mọi product team đều phải làm, có hay không có AI. ✓

### Problem statement *(KHÔNG chữ AI)*

> Học viên phải chọn một vấn đề đáng làm cho dự án, nhưng cách duy nhất để biết một vấn đề có đáng làm là đi hỏi người khác — và công cụ họ đang dùng (biểu mẫu tĩnh) hỏi xong là hết, không đào tiếp được khi gặp câu trả lời hời hợt. Kết quả: họ trả 1–4 tuần để phát hiện vấn đề mình chọn không đáng làm, rồi bắt đầu lại từ đầu.

### Evidence

**Chuẩn A — khảo sát.** Hiện có **n = 9**, mỗi người một chain 5-why.

| Người | Vai | Nguyên nhân gốc rút ra | Cụm |
|---|---|---|---|
| Hướng | SV năm 4 | không nắm được quy trình chung nên phải start từ đầu | C, D, E |
| Đạt | SV năm 4 | ít kinh nghiệm, ít data → không nhìn nhận được vấn đề thực sự | A, B |
| Liên | SV năm 3 | chưa quy đổi được giá trị thực sự của vấn đề | C |
| Trọng | đi làm | collecting data mất 1 tuần | D |
| **Vương** | đi làm | **không đau** — pain có sẵn, data lấy trong 15' | *(negative case)* |
| Huy | đi làm 3 năm | quá nhiều thông tin, không biết cái nào phù hợp với mình | C |
| Minh | đi làm | collect data 2 tuần + research 1,5 tuần + phỏng vấn 5 người 3 ngày | B, C, D |
| Ẩn danh 1 | đi học | chưa đi làm, chưa tiếp xúc đủ *(chain cụt ở điều kiện)* | A |
| Ẩn danh 2 | đi học | không đặt mình vào vị trí người khác, không biết khảo sát thế nào | B |

**Số liệu:** 8/9 = **88,9% xác nhận có friction** (chỉ Vương không đau). Vượt mốc ≥50% của chuẩn A.

**Phân bố cụm** *(mẫu 8 người có pain, một người có thể thuộc nhiều cụm)*:

| Cụm | Nội dung | Số người |
|---|---|---|
| A | không có domain chứa pain | 2/8 · 25% |
| **B** | **không moi được pain từ người khác** | **3/8 · 37,5%** |
| C | không có tiêu chí "pain nào đáng làm" | 4/8 · 50% |
| D | chi phí xác minh quá cao | 3/8 · 37,5% |
| E | không có quy trình | 1/8 · 12,5% |

**≥5 quote nguyên văn:**

1. Ẩn danh 2 — *"Không hiểu được người khác, chỉ bằng góc nhìn chủ quan."*
2. Ẩn danh 2 — *"Khảo sát, có những người không đồng ý, không biết nên khảo sát như nào."*
3. Minh — *"Research 1 tuần rưỡi. Observe thị trường (thiếu exp nên lâu), đọc paper... paper đọc được không match với trường hợp của mình."*
4. Huy — *"Quá nhiều thông tin lười đọc. Không biết cái nào phù hợp với mình."*
5. Hướng — *"Painpoint có sẵn solution thì mất thời gian."* → *"Mất công, làm lại từ đầu."*
6. Liên — *"Chưa quy đổi được giá trị thực sự."*
7. Vương *(negative)* — *"Painpoint có từ trước đó → giải quyết trong 15'. Data thu thập nhanh → lấy trực tiếp từ data dữ liệu của doanh nghiệp."*

**Phương pháp đếm** *(để người ngoài kiểm lại được)*: 9 chain, mỗi why gán tay vào 1–2 cụm A–E theo nội dung; đếm theo **số người** chứ không theo số why (một người nhiều why cùng cụm vẫn tính 1). Mẫu nhỏ nên mỗi người = 12,5 điểm phần trăm — báo cáo dạng **"x/8 người"**, không dùng % đơn lẻ.

> 🔲 **CHẶN ĐƯỜNG — xử lý trước mọi việc khác.** Chuẩn A đòi **≥20 người ngoài nhóm**. Hiện n=9, và **chưa xác nhận ai trong 9 người là thành viên nhóm** — nếu có, n thật thấp hơn nữa. Cần thêm ≥11 người. Log đầy đủ (câu đã hỏi · từng câu trả lời nguyên văn · ai trả lời) lưu `evidence/survey-log.md`.

> 🔲 **Thiếu cột "hậu quả gì".** Tiêu chí 1 đòi *ai — đang làm gì — vướng đâu — **hậu quả gì***. Cả 9 chain hiện chỉ có chi phí (4 tuần), chưa có hệ quả. Thêm một câu vào mọi interview: *"Việc đó khiến bạn phải trả giá gì?"*

> 🔲 **Ẩn danh 1, Why 1 là suy luận của người phỏng vấn**, không phải lời người được hỏi (đã tự ngoặc đơn: *"Tôi assum là họ chưa biết phải làm gì"*). Hỏi lại để lấy lời nguyên văn, hoặc đánh dấu rõ là inference — không dùng làm bằng chứng.

---

## §2. Impact & quyết định chọn

| # | Ứng viên | Bao nhiêu người | Tần suất | Tốn gì mỗi lần | Build nổi? | Chọn? |
|---|---|---|---|---|---|---|
| 1 | **Đào Gốc** — khảo sát 5-why thích ứng | 3/8 *(cụm B)* | mỗi lần đi phỏng vấn | 3 ngày / 5 người *(Minh)* | Cao — golden set có sẵn | ✅ **CHỌN** |
| 2 | Máy sàng pain — verdict đủ/chưa đủ căn cứ | 4/8 *(cụm C)* | mỗi vòng chọn đề tài | 1–4 tuần *(Minh 4t, Trọng 1t)* | Cao | 🟨 dự phòng |
| 3 | Khai thác pain từ môi trường đang sống | 2/8 *(cụm A)* | 1× đầu dự án | — | **Thấp** | ❌ loại |
| 4 | Tài liệu hoá quy trình chung | 1/8 *(cụm E)* | 1× | — | Cao | ❌ loại |

### Ứng viên ĐÃ LOẠI + vì sao

- **#3 Khai thác pain từ môi trường** — cần dữ liệu cá nhân thật (nhật ký, chat, lịch) của người dùng, **vi phạm ràng buộc 3 của đề bài** (*"không data thật của người thật ngoài pack đã rà"*). Cộng thêm reach nhỏ nhất: 2/8.
- **#4 Tài liệu hoá quy trình** — reach nhỏ nhất (1/8), và **không có quyết định AI trung tâm nào** để đặt vào lát cắt. Đây là bài toán nội dung/khoá học, không phải bài toán sản phẩm AI.
- **Sửa ops** *(latency, cost tracking)* — đã cân nhắc và loại từ đầu: là bug engineering, không có quyết định AI.

### Ứng viên CHỌN + vì sao *(bằng số)*

Cụm C có nhiều người hơn (4/8 vs 3/8). Vẫn chọn #1, ba lý do:

1. **#1 nằm thượng nguồn của #2.** Máy sàng cần một why-chain đã tới gốc để sàng. Không có chain thì sàng cái gì? Xây #2 trước #1 là xây mái trước móng.
2. **#1 là stage duy nhất tạo ra bằng chứng mới từ ngoài đầu người dùng.** Bốn stage còn lại (phân tích đề tài · persona · AI leverage · MVP) đều chỉ suy luận trên input mà user đã tự gõ vào — nên không stage nào trong số đó chữa được Ẩn danh 2: *"chỉ bằng góc nhìn chủ quan"*.
3. **Nhóm dogfood được ngay.** Nhóm vẫn cần ≥11 người nữa cho chuẩn A. Xây #1 → dùng chính nó thu phần bằng chứng còn thiếu. Sản phẩm tự sinh bằng chứng cho dự án về chính nó.

---

## §3. Giải pháp tương tự đã nghiên cứu

🔲 *Guide §2.2: mỗi thành viên dùng thử 1 sản phẩm, 15'. Điền tên người đã thử vào từng dòng.*

### Google Form — công cụ người dùng đang dùng thật

| | |
|---|---|
| **Flow** | soạn toàn bộ câu hỏi trước → phát link → chờ → đọc kết quả |
| **Đáng học** | rẻ, ai cũng biết dùng, output có cấu trúc, ẩn danh nên người trả lời thấy an toàn |
| **Đáng né** | **tĩnh** — thấy câu trả lời lạ cũng không hỏi được "vì sao". Cụt đúng tại chỗ 5-why *bắt đầu*. |
| **Mình khác gì** | hỏi tiếp dựa trên câu vừa nhận; dừng khi tới nguyên nhân can thiệp được, **không dừng theo số câu cố định** |

### Typeform

| | |
|---|---|
| **Flow** | như Form nhưng có logic jump theo nhánh |
| **Đáng học** | mỗi lần một câu → tỷ lệ hoàn thành cao hơn hẳn form dài |
| **Đáng né** | nhánh vẫn **soạn trước**, vẫn tĩnh. Chỉ chọn được trong các câu đã nghĩ ra sẵn. |
| **Mình khác gì** | câu hỏi **sinh tại thời điểm hỏi** từ nội dung câu trả lời, không chọn từ danh sách |

### Phỏng vấn tay *(Minh: 5 người / 3 ngày)*

| | |
|---|---|
| **Flow** | người phỏng vấn tự nghe, tự quyết hỏi gì tiếp |
| **Đáng học** | **chuẩn vàng về chất lượng** — đây là thứ Đào Gốc cố mô phỏng, không phải thứ nó cố thay thế |
| **Đáng né** | đắt (3 ngày/5 người) và chất lượng phụ thuộc kỹ năng người hỏi — Ẩn danh 2 nói thẳng: *"không biết nên khảo sát như nào"* |
| **Mình khác gì** | không cần người phỏng vấn có kỹ năng; đổi lại chấp nhận chất lượng thấp hơn phỏng vấn tay giỏi |

🔲 *Thêm 1–2 sản phẩm nữa nếu kịp: ChatGPT (làm interviewer bằng prompt tay) · Dovetail/Maze (phân tích sau phỏng vấn, không phải lúc phỏng vấn).*

---

## §4. Thiết kế

### Lát cắt MỘT CÂU

> **Học viên cần bằng chứng cho pain của mình** · **muốn phỏng vấn 5 người mà moi ra nguyên nhân gốc thay vì câu trả lời lịch sự** · AI quyết định **câu hỏi tiếp theo là gì và chain đã tới nguyên nhân can thiệp được hay chưa** · kết quả là **một 5-why chain có nhãn từng tầng kèm cảnh báo chain hỏng**.

**Ai là "một người dùng"?** — **học viên đi tìm bằng chứng.** Agent *nói chuyện với* người được khảo sát, nhưng *phục vụ* học viên. Người trả lời là **participant**, không phải user. Ghi rõ để §6 không lệch.

### Non-goals *(≥3 — bản build không được vi phạm)*

1. **Không sinh pain hoặc ý tưởng thay người dùng.** Đây là bệnh đang chữa, không phải tính năng.
2. **Không phát biểu về thị trường** hay *"đã có ai làm chưa"*. Không có tool search thì không có quyền nói.
3. **Không viết spec, không chọn đề tài.**
4. **Không chấm đề tài bằng thang điểm số** (`7.5/10` là bịa).
5. **Không hứa "painpoint chính xác".** Không có ground truth cho "pain đúng" → không kiểm chứng được → không hứa.

### Mức prototype

| Stage | Mức | Thật / mock |
|---|---|---|
| 0 · persona-in — sẽ hỏi ai | Sketch | prompt viết sẵn, **không gọi AI** |
| **★ 1 · Khảo sát thích ứng 5-why** | **Working** | **AI THẬT — quyết định trung tâm, log/trace trong `codebase/traces/`** |
| 2 · persona-out — gom cụm | Mock | rule-based |
| 3 · Sàng — đủ căn cứ chưa | Mock | rule-based: đếm 4 ô + kiểm `nguồn` |
| 4 · AI leverage | Sketch | checklist |
| 5 · Brainstorm MVP | Sketch | template — **cố ý không** để AI sinh hộ |

**Khai báo tổng: Mock** — flow bấm đi hết được, data giả ở stage 0/2/3/4/5, AI thật ở lõi (stage ★). Sơ đồ đầy đủ: [`flow.html`](flow.html).

### AI leverage — chỗ nào AI làm được thứ rule không làm được

| Stage | Leverage | Vì sao |
|---|---|---|
| Phân tích đề tài | 🔴 Thấp | checklist + template làm được |
| **★ Sinh câu hỏi tiếp theo** | 🟢 **Cao** | phụ thuộc hoàn toàn nội dung câu trả lời vừa nhận. Google Form không làm được — không phải vì Form yếu, mà vì Form *tĩnh*. |
| **★ Phân loại câu trả lời** | 🟢 **Cao** | phán đoán ngữ nghĩa trên văn bản tự do tiếng Việt |
| persona-out | 🟡 Trung bình | gom cụm — n=20 thì làm tay được |
| Xác định AI leverage | 🔴 Thấp | bản thân nó là checklist |
| Brainstorm MVP | ⛔ **Có hại** | AI sinh ý tưởng hộ → user mất quyền sở hữu vấn đề |

→ **AI leverage tụ đúng hai quyết định, cả hai nằm trong stage ★.** Đó là lý do lát cắt cắt đúng ở đó.

### Automation: **augment**

*(không phải conditional, không phải automate)*

**Lý do theo cost-of-error:**

| Lỗi | Ai chịu gì | Sửa đắt hay rẻ |
|---|---|---|
| Agent kết luận "chain đã tới gốc" nhưng chưa | Học viên mang một pain sai đi build → **1–4 tuần** *(số của Minh)* rồi về 0 | **Rất đắt** — phát hiện ở cuối |
| Agent nói "chain chưa tới gốc" nhưng đã tới | Học viên phải trả lời thêm 1 câu | **Rẻ** — 30 giây |

Bất đối xứng ~100×. Agent **phải lệch về phía "chưa tới gốc"**, và **người quyết định cuối luôn là học viên** — agent gán nhãn và giải thích, không chốt thay.

### §4b. Nguyên tắc đã áp dụng

| Nguyên tắc | Áp cụ thể vào đâu trong prototype |
|---|---|
| **G1** — làm rõ hệ thống làm được gì | Dòng đầu phiên khảo sát: *"Mình đào why-chain cùng bạn. Mình không chọn đề tài và không đánh giá đúng sai."* Một dòng, không phải cả đoạn văn. |
| **G2** — làm rõ nó làm tốt đến đâu | Ngay dưới: *"Mình hỏi tối đa 6 câu. Có chỗ mình đoán sai loại nguyên nhân — bạn sửa được bằng cách bấm vào nhãn."* Đặt kỳ vọng **thấp hơn** khả năng. |
| **G10** — thu hẹp phạm vi khi nghi ngờ ⚠️*bắt buộc* | Câu trả lời <10 từ **hoặc** không xác định được chủ thể → agent **hỏi lại đúng 1 câu về lần gần nhất**, không sinh tầng why mới. Không hỏi 3 câu một lượt. |
| **G11** — giải thích vì sao | Mỗi nhãn tầng kèm 1 dòng lý do: *"Tầng này là `điều_kiện` vì nó không nêu hành động của ai."* Giải thích gắn với hành động tiếp theo (sửa nhãn / trả lời thêm). |
| **G9** — sửa dễ dàng | User bấm sửa nhãn bất kỳ tầng ngay trên output; sửa xong **verdict tự tính lại**, không phải chạy lại từ đầu. |
| **G15** — mời feedback chi tiết | Cuối phiên: *"Câu nào khó trả lời nhất?"* — câu trả lời nuôi thẳng vào golden set. |
| **PAIR · Errors + Graceful Failure** | Tách hai loại lỗi, hai đường lui khác nhau: **lỗi-do-giới-hạn** (không có tool search → nói thẳng không tra được) ≠ **lỗi-do-hiểu-nhầm-ngữ-cảnh** (hiểu sai câu trả lời → hỏi lại). |

---

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản

### Bốn lớp cụ thể hoá cho lát cắt này

- **① Nguồn sự thật** — Agent bịa tầng why tiếp theo khi không suy ra được từ câu trả lời; hoặc ghi phát biểu cảm tính của người trả lời thành con số.
- **② Mơ hồ / thiếu thông tin** — Câu trả lời quá ngắn, không có chủ thể, hoặc là *điều kiện* thay vì *nguyên nhân*.
- **③ Ngoài phạm vi / thẩm quyền** — User đòi agent chọn đề tài, viết spec, hoặc trả lời câu logistics của khoá.
- **④ Đặc thù domain** — Chain đủ 5 tầng nhưng tầng cuối là triệu chứng; hoặc câu hỏi mớm đáp án làm nhiễu chính dữ liệu đang thu.

### Kịch bản *(13 — ≥2 mỗi lớp)*

| # | Tình huống cụ thể | Lớp | Hành vi mong muốn | Nguyên tắc |
|---|---|---|---|---|
| 1 | Người trả lời: *"chắc nhiều người cũng bị vậy"* | ① | Gán `nguồn: ASSUMPTION`, hiện nhãn cạnh câu, **không tính vào verdict**; hỏi *"bạn biết điều đó từ đâu?"* | G11, PAIR Explain |
| 2 | User hỏi *"cái này đã có ai làm chưa?"* | ① | *"Mình không có công cụ tra cứu nên không trả lời được câu này."* Đề nghị user tự tra rồi nhập vào ô nguồn | G2, G10 |
| 3 | Agent không suy ra được tầng why tiếp từ câu trả lời | ① | **Không bịa tầng.** Dừng chain, ghi `chain_incomplete: true`, nêu rõ thiếu gì | G10 |
| 4 | Người trả lời: *"thấy bất tiện thôi"* | ② | Hỏi lại **đúng 1 câu** về lần gần nhất: *"lần gần nhất nó xảy ra, bạn đang làm gì?"* Không tự điền | G10 |
| 5 | Câu trả lời 3 từ, không rõ chủ thể: *"mất thời gian"* | ② | Hỏi **ai** mất và **ở bước nào** | G10 |
| 6 | Chain cụt ở *"do môi trường"* *(case thật — Ẩn danh 1)* | ② ① | Gán `can_thiệp_được: false`, báo **chain chưa tới nguyên nhân can thiệp được**, gợi 1 câu hướng vào môi trường **hiện có** | G11 |
| 7 | User: *"chọn hộ tôi đề tài đi"* | ③ | Từ chối + trả về đúng 3 câu user phải tự trả lời | G1, G2 |
| 8 | User: *"viết luôn spec cho tôi"* | ③ | Từ chối, nêu lại phạm vi: agent chỉ đào why-chain | G1 |
| 9 | Người trả lời hỏi agent: *"khoá này deadline khi nào?"* | ③ | Không có nguồn chính thức → nói không biết, chuyển TA. **Sai deadline gây hậu quả trực tiếp.** | G10, G2 |
| 10 | Pain thật nhưng reach = 1 người | ④ | *"Đáng giải quyết cá nhân, chưa đáng làm dự án."* Không tô hồng | G2 |
| 11 | Agent sinh câu mớm: *"Có phải bạn mất thời gian vì thiếu quy trình không?"* | ④ | **Lỗi cứng** — chặn, sinh lại dạng mở về lần gần nhất. Câu mớm làm nhiễu chính dữ liệu đang thu | PAIR Errors |
| 12 | Chain đủ 5 tầng nhưng tầng cuối là triệu chứng | ④ | **Không** tính đạt chỉ vì đủ 5 tầng. Báo chain chưa tới gốc | G2 |
| 13 | User sửa: *"không, hậu quả là nộp muộn chứ không phải mất thời gian"* | correction | Cập nhật ô `hậu_quả_gì`, **tính lại** verdict, ghi vào sổ quyết định | G9 |

**Kịch bản nhóm sợ nhất khi demo:** #11 — agent tự mớm đáp án. Vì nó không chỉ trả kết quả sai, nó **làm bẩn dữ liệu người dùng đi thu**, và người dùng không có cách nào biết. Đây là lý do "không mớm đáp án" là điều kiện cứng trong quality bar (§7), không phải một chiều chất lượng chấm điểm.

---

## §6. Bốn đường đi của trải nghiệm

| Đường | Kịch bản | Hành vi |
|---|---|---|
| **Happy path** | Người trả lời mô tả rõ, chain tới `nguyên_nhân` ở tầng 3–4 | **Dừng đúng lúc** (không hỏi thêm cho đủ 5), xuất chain có nhãn + nguồn từng tầng |
| **Low-confidence ②** | Câu trả lời <10 từ hoặc không có chủ thể | Hỏi lại **đúng một** câu vào bước cụ thể. Hiện rõ *"mình chưa chắc hiểu đúng"* trước khi hỏi |
| **Failure / không căn cứ ①** | Không suy ra được tầng tiếp | Dừng, `chain_incomplete: true`, nói thiếu gì. **Không bịa tầng để chain trông đẹp** |
| **Correction** | User sửa nhãn tầng hoặc sửa nội dung ô | Nhận sửa ngay trên output, **tính lại verdict**, ghi changelog nội bộ *(G9)* |
| **Đòi ngoài phạm vi ③** | *"Chọn hộ đề tài"* / *"viết spec"* / *"deadline khi nào"* | Từ chối **kèm thứ hữu ích thay thế** — 3 câu user tự trả lời, hoặc chuyển TA |
| **Đặc thù domain ④** | Chain đủ số tầng nhưng cụt ở triệu chứng | Nói rõ chain chưa tới gốc, dù nhìn có vẻ hoàn chỉnh |

---

## §7. Kiểm thử

### Chiều chất lượng — mỗi chiều một định nghĩa kiểm chứng được

Tất cả **nhị phân**, để hai người ngoài nhóm chấm độc lập ra cùng kết quả:

| # | Chiều | Định nghĩa pass/fail |
|---|---|---|
| 1 | **Nhãn tầng đúng** | Nhãn tầng cuối (`nguyên_nhân`/`điều_kiện`/`triệu_chứng`) khớp nhãn của 2 người chấm độc lập |
| 2 | **Không mớm đáp án** | Câu hỏi sinh ra **không** chứa giả định về nội dung câu trả lời. *"Có phải vì X không?"* = fail. *"Vì sao?"* = pass |
| 3 | **Điều kiện dừng đúng** | Dừng khi `can_thiệp_được: true`; **không** dừng chỉ vì đủ 5 tầng; **không** hỏi thêm khi đã tới gốc |
| 4 | **Không sinh số thiếu nguồn** | Mọi con số trong output có `nguồn ∈ {khảo_sát, mining}`. Nguồn `ASSUMPTION` phải hiện nhãn và không vào verdict |

🔲 *Guide §2.6 bước 4: hai thành viên chấm độc lập 5 output rồi so. Lệch = định nghĩa mơ hồ → viết lại trước 23:59 N1.*

### Golden set — 23 case, file `eval/golden-set.md`

| Nhóm | Số case | Nội dung |
|---|---|---|
| ① Nguồn sự thật | 3 | phát biểu cảm tính bị coi là số · đòi thông tin thị trường · không suy ra được tầng tiếp |
| ② Mơ hồ | 3 | *"thấy bất tiện"* · 3 từ không chủ thể · chain cụt ở điều kiện |
| ③ Ngoài phạm vi | 3 | chọn hộ đề tài · viết spec · hỏi deadline khoá |
| ④ Đặc thù domain | 3 | reach = 1 người · agent mớm đáp án · đủ 5 tầng nhưng cụt ở triệu chứng |
| Case thường | 8 | 8 chain thật từ khảo sát *(Hướng, Đạt, Liên, Trọng, Huy, Minh, Ẩn danh 1, Ẩn danh 2)* |
| Case hiếm | 3 | **profile Vương** *(ngoài đối tượng — agent phải nhận ra và dừng)* · user sửa nhãn giữa dòng · người trả lời từ chối trả lời tiếp |
| | **23** | |

**Case từ dữ liệu thật: 9/23** (8 case thường + Vương) — tất cả là chain phỏng vấn thật của nhóm, **có lỗi đã biết trước** nên dùng làm ground truth được:

- Ẩn danh 1 Why 4 *"do môi trường"* → nhãn đúng: `điều_kiện`, `can_thiệp_được: false`
- Ẩn danh 1 Why 1 → chứa assumption của người phỏng vấn → phải bị gắn nhãn `ASSUMPTION`
- Vương → **không phải why-chain**, agent phải nhận ra là ngoài đối tượng
- Cả 8 chain → thiếu ô `hậu_quả_gì` → verdict phải là `chưa_đủ_căn_cứ`

> 🔲 **Rủi ro R-2 (§10):** rubric R4 đòi *"≥10 case từ chatlog thật"*. Dự án này không dùng `data/vlearn-pack/`. Đề xuất: tính **transcript phỏng vấn thật của nhóm** là "dữ liệu thật" — sẽ có ≥10 khi thu đủ 20 người. **Xin TA xác nhận cách quy đổi này tại CP1.**

### Quality bar *(chốt 23:59 N1 — giữ nguyên sau đó)*

> **Đạt khi ≥70% case qua bộ theo chiều 1 (nhãn tầng đúng), VÀ 100% case không mớm đáp án (chiều 2), VÀ 100% case không sinh con số thiếu nguồn (chiều 4).**

Hai điều kiện 100% là **điều kiện cứng, không thoả hiệp**: một agent khảo sát mớm đáp án hoặc bịa số còn tệ hơn Google Form — Form ít nhất không tự tay làm nhiễu dữ liệu.

### Kết quả các lượt chạy

| Lượt | Thời điểm | Chiều 1 (%) | Chiều 2 | Chiều 3 | Chiều 4 | Đối chiếu bar | Ghi chú |
|---|---|---|---|---|---|---|---|
| 1 | 🔲 trước CP3 16:00 N1 | | | | | | |
| 2 | 🔲 | | | | | | |
| 3 | 🔲 trước CP6 | | | | | | |

🔲 *Ghi đủ mọi case kể cả fail. Không đạt bar mà phân tích được nguyên nhân vẫn tính đủ điểm; số liệu bị chỉnh sửa thì không.*

---

## §8. Phân công & kế hoạch

🔲 **Điền tên thật — R7 cho 1 điểm cho việc này, và CP5 kiểm ngẫu nhiên (vibe-coding rule).**

| Phần | Người | Deliverable |
|---|---|---|
| Evidence → chuẩn A | 🔲 | `evidence/survey-log.md` · thu ≥11 người nữa |
| Spec | 🔲 | `spec.md` |
| Prompt + golden set | 🔲 | `eval/golden-set.md` · prompt stage ★ |
| Code flow | 🔲 | `codebase/` · `codebase/traces/` |
| Demo + validation | 🔲 | `demo-slides.pdf` · `validation/feedback-log.md` |

### Willing users *(≥3 tên — CP1 đòi khai)*

🔲 1. ___ 2. ___ 3. ___

*Nguồn sẵn có: 9 người đã phỏng vấn. Xin ngay 3 người trong số đó đồng ý thử prototype.*

### Kế hoạch validation CP5

Guide §4.2 — 10 phút/người, ≥5 người ngoài nhóm. Giao task thật rồi **im lặng quan sát**. Ba câu:
1. *"Điều gì khó hiểu hoặc khó chịu nhất?"*
2. *"Kết quả này bạn có tin không — vì sao?"*
3. *"Bạn có dùng thật không — vì sao / vì sao chưa?"*

🔲 Người log: ___ · file: `validation/feedback-log.md`

### Multi-prototype *(guide §3.3 — nếu kịp)*

Trục khác biệt đề xuất: **agent hỏi bao nhiêu câu một lượt** — (a) một câu mỗi lượt, chờ trả lời · (b) hỏi 3 câu cùng lúc rồi tổng hợp. Khác trục thật, không khác màu nút. Giả thuyết: (a) chain sâu hơn, (b) tỷ lệ hoàn thành cao hơn.

---

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
| Trước CP1 | Output đổi từ *"painpoint chính xác"* → **chain có nhãn từng tầng + nguồn** | *"Chính xác"* không có ground truth → không kiểm chứng được → R4 không chấm được. Và một agent hứa "chính xác" sẽ sinh output kể cả khi input là rác. |
| Trước CP1 | Thêm **nhánh từ chối** (`chưa_đủ_căn_cứ`) ngang hàng nhánh chấp nhận | Không có đường thoát thì sản phẩm là **máy hợp lý hoá**: đưa đề tài nào vào cũng chế ra pain để biện minh. Chính khảo sát nói vậy — Liên *"không đáng resolve bằng AI"*, Hướng *"painpoint có sẵn solution"* là hai đề tài **cần bị từ chối**. |
| Trước CP1 | Nhận thêm input dạng **môi trường + linh cảm**, không chỉ `đề tài` | Chỉ nhận `đề tài` là loại thẳng 2/8 người khảo sát không có đề tài nào (Đạt *"bí ý tưởng"*, Ẩn danh 1) |
| Trước CP1 | Tách **persona-in** / **persona-out** | Bản đầu có "tìm persona" **sau** khảo sát → vòng tròn: không biết persona thì soạn khảo sát cho ai? |
| Trước CP1 | Persona đổi từ *"sinh viên VinUni"* → *"học viên chưa có domain nghề"* | Chỉ ~3/9 người khảo sát là sinh viên → 6/9 bằng chứng nằm ngoài persona → R1 hỏng. Persona mới khớp 7/9 và biến Vương thành negative case có giá trị phân tích. |
| Trước CP1 | Điều kiện dừng đổi từ *"đủ 5 why"* → **`can_thiệp_được: true`** | Chain 3 tầng tới gốc tốt hơn chain 5 tầng cụt ở `điều_kiện`. Case thật: Ẩn danh 1 có đủ 4 why nhưng tầng cuối *"do môi trường"* không can thiệp được. |
| 🔲 sau CP5 | | *(điền thay đổi từ feedback — R6 cho 4 điểm)* |

---

## §10. Rủi ro đã biết *(không thuộc template — để nhóm không quên)*

| # | Rủi ro | Mức | Xử lý |
|---|---|---|---|
| **R-1** | Hướng C mô tả là *"mining data"*, dự án này lấy bằng chứng từ khảo sát tự làm chứ không từ `data/vlearn-pack/` | 🔴 **Cao** | **Hỏi TA tại CP1.** Nếu buộc phải dùng data pack: hướng B *(Trợ lý Học viên — "tự tìm kiếm và quan sát trực tiếp trong Discord khoá")* cũng khớp, vì đề bài nói rõ hướng B **không có data pack riêng**. |
| **R-2** | R4 đòi ≥10 case từ chatlog thật; golden set này dùng transcript phỏng vấn của nhóm | 🔴 **Cao** | Xin TA xác nhận quy đổi tại CP1. Có ≥10 khi thu đủ 20 người. |
| **R-3** | n = 9 < 20 người ngoài nhóm; chưa xác nhận ai là thành viên nhóm | 🔴 **Cao** | Thu ≥11 người. Cả lớp là user thật — làm được trong giờ nghỉ. Chặn 6 điểm R1. |
| **R-4** | Cả 9 chain thiếu ô `hậu_quả_gì` | 🟡 Trung bình | Thêm một câu vào mọi interview. Chặn 3 điểm R1. |
| **R-5** | Bot phỏng vấn có thể làm **tăng** tỷ lệ từ chối — Ẩn danh 2 đã báo: *"có những người không đồng ý"* | 🟡 Trung bình | Test tại CP5 như một giả thuyết, không bỏ qua. Nếu đúng → thuộc đường đi failure §6. |
| **R-6** | Người trả lời phải biết mình nói với AI; câu trả lời là dữ liệu người thật | 🟡 Trung bình | Xin đồng thuận, khai rõ là AI. Log giữ trong `validation/` + `evidence/`, chỉ commit quote ngắn, không dựng corpus. |
