# AI SPEC — Đào Gốc: khảo sát 5-why thích ứng · Nhóm [D305-A1] · Zone [X]

**Đề tài:** Xây dựng agent AI khảo sát 5-why thích ứng giúp học viên xác định painpoint có căn cứ cho dự án

Hướng: [ ] A — VLearn  [] B — Trợ lý Học viên  [x] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

> 🔲 **Chốt hướng tại CP1.** Mình đề xuất **C — Làn mở**. Xem rủi ro R-1 ở §10 trước khi tick: đề bài mô tả hướng C là *"mining data và đề xuất sản phẩm AI khác cho khoá"*, còn dự án này lấy bằng chứng từ khảo sát tự làm chứ không từ `data/vlearn-pack/`. **Hỏi TA tại CP1.**

---

## §1. User & Job

### Job executor

**Sinh viên VinUni khoá 3 & khoá 4 đang phải chọn một trong 360 đề tài capstone và tìm painpoint thật bên trong đề tài đó.**

Không phải "sinh viên nói chung". Ba thứ làm vai này cụ thể và **đếm được**:

1. **Dân số có biên rõ** — K3 + K4, và họ đều nhận cùng một file `Danh_sach_de_tai.xlsx`.
2. **Artifact gây pain tồn tại và đo được** — 360 đề tài, 21 khối, **8,0 giờ đọc** nếu đọc hết; chỉ **4,7%** đề tài nêu số liệu định lượng (chi tiết: Evidence chuẩn B bên dưới). Không phải "sinh viên thấy bất tiện".
3. **Job có mốc bắt đầu và kết thúc** — bắt đầu khi nhận file, kết thúc khi chốt được một `Mã Đề` **và** nói được pain thật bên trong nó là gì.

> **Hai loại "đề tài" trong repo này — đừng lẫn.** `Danh_sach_de_tai.xlsx` là catalog **capstone**: 78,1% đề đòi deploy online, 63,9% đòi đăng nhập, 79,2% đòi ≥2 vai trò, max 2 team/đề. Còn `01-de-bai.md` của mini-hackathon nói rõ *"không yêu cầu deploy"*. **Đào Gốc là deliverable hackathon; người dùng của nó là sinh viên đang chọn đề capstone.** Persona ở trên nói về loại thứ hai.

Trục phân loại trong/ngoài đối tượng rút ra từ khảo sát (Evidence chuẩn A), không phải giả định trước: 17 người tự tách làm hai nhóm theo việc **pain và bằng chứng có đến kèm sẵn trong môi trường họ đang sống hay không**.

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

Đề bài cho **"(A) khảo sát ≥20 người ngoài nhóm và/hoặc (B) mining data"**. Nhóm dùng **cả hai**, theo đúng guide §1.3: *"B chứng minh pain tồn tại, A chứng minh user muốn nó được giải"*. **B là trụ chính** vì nó đã đủ chuẩn; A đang thiếu người và dùng làm phần bổ trợ.

**Người phụ trách Evidence & Impact:** **Nguyễn Chí Hướng — 2A202601203**. Phạm vi phụ trách: thu và rà log phỏng vấn, tách người trong/ngoài nhóm, giữ negative case, gom cụm nguyên nhân và cập nhật bảng impact tại §2. Hướng trực tiếp ghi 10 chuỗi trong hai đợt phỏng vấn. Đợt 1 có 2 chain trùng với `Ẩn danh 1–2` nên chỉ cộng 3 người; đợt 2 bổ sung 5 người mới dưới mã `KS-05–KS-09` (KS = khảo sát, tách khỏi mã ẩn danh của validation). Log nối tiếp, chống đếm trùng: [`evidence/survey-log.md`](evidence/survey-log.md).

---

#### Chuẩn B — mining `Danh_sach_de_tai.xlsx` *(trụ chính)*

Artifact gây pain: catalog 360 đề tài capstone mà mọi sinh viên K3/K4 đều nhận.
Phương pháp đếm kiểm lại được: [`evidence/mine-de-tai.py`](evidence/mine-de-tai.py) — chạy lại ra cùng số.
Output đầy đủ: [`evidence/mining-de-tai.md`](evidence/mining-de-tai.md).

| Số đếm được | Giá trị |
|---|---|
| Tổng đề tài · số khối | **360** · 21 |
| Chữ phải đọc để chọn (4 cột nội dung) | **525.568 ký tự ≈ 95.558 từ ≈ 8,0 giờ** đọc liên tục @200 từ/phút |
| Chỉ riêng cột *Mô Tả Bài Toán* | 254.767 ký tự ≈ **3,9 giờ** |
| Mỗi đề tài | median **1.424 ký tự** (min 1.000 · max 2.387) |
| Đề tài **có nêu số liệu định lượng** | **17/360 = 4,7%** |
| Đề tài có nêu mục tiêu/yêu cầu rõ | 69/360 = 19,2% |
| Tên bắt đầu `AI Agent` + động từ (khó phân biệt) | **135/360 = 37,5%** |
| Max team | **2** cho mọi đề → 720 slot toàn khoá |

**Bốn con số này khớp thẳng vào bốn chain của chuẩn A** — đây là chỗ B và A gặp nhau:

| Người nói (chuẩn A) | Số chứng minh (chuẩn B) |
|---|---|
| Huy: *"Quá nhiều thông tin lười đọc. Không biết cái nào phù hợp với mình."* | 8,0 giờ đọc · 360 lựa chọn · 135 tên na ná nhau |
| Liên: *"Chưa quy đổi được giá trị thực sự."* | **95,3% đề tài không có con số nào** về độ lớn vấn đề → không có gì để quy đổi |
| Hướng: *"Chưa tìm thấy đề tài nào đủ wow."* | 80,8% mô tả không nêu mục tiêu rõ |
| Đạt: *"Bí ý tưởng."* | Không phải bí — 360 lựa chọn mà không lọc được |

**≥5 ví dụ nguyên văn:** xem `evidence/mining-de-tai.md` §5 (EDU-01, EDU-02, AIP-01, AIP-02, VSOC-01).

---

#### Chuẩn A — khảo sát *(bổ trợ)*

**n = 17 người duy nhất, trong đó 13 người NGOÀI NHÓM.** Bốn người là thành viên nhóm (xem [`TEAMMATES.md`](TEAMMATES.md)) — ghi rõ ở đây thay vì gộp vào một tỷ lệ đẹp. Cách nối hai đợt và chống đếm trùng được ghi trong [`evidence/survey-log.md`](evidence/survey-log.md).

| Người | Vai | Nguyên nhân gốc rút ra | Cụm | Ngoài nhóm? |
|---|---|---|---|---|
| Hướng | SV năm 4 | không nắm được quy trình chung nên phải start từ đầu | C, D, E | ❌ thành viên nhóm |
| Đạt | SV năm 4 | ít kinh nghiệm, ít data → không nhìn nhận được vấn đề thực sự | A, B | ❌ thành viên nhóm |
| Liên | SV năm 3 | chưa quy đổi được giá trị thực sự của vấn đề | C | ❌ thành viên nhóm |
| Huy | đi làm 3 năm | quá nhiều thông tin, không biết cái nào phù hợp với mình | C | ❌ thành viên nhóm |
| Trọng | đi làm | collecting data mất 1 tuần | D | ✅ |
| **Vương** | đi làm | **không đau** — pain có sẵn, data lấy trong 15' | *(negative)* | ✅ |
| Minh | đi làm | collect data 2 tuần + research 1,5 tuần + phỏng vấn 5 người 3 ngày | B, C, D | ✅ |
| Ẩn danh 1 | đi học | chưa đi làm, chưa tiếp xúc đủ *(chain cụt ở điều kiện)* | A | ✅ |
| Ẩn danh 2 | đi học | không đặt mình vào vị trí người khác, không biết khảo sát thế nào | B | ✅ |
| Ẩn danh 3 *(PV Hướng — Người 1)* | chưa ghi vai | trả lời “chưa gặp khó khăn”; các why sau nói lĩnh vực không phù hợp, mạng lưới hẹp và hướng nội | *(negative/không nhất quán — không ép vào cụm)* | ✅ |
| Ẩn danh 4 *(PV Hướng — Người 2)* | chưa ghi vai | đề bài quá mở; chưa chủ động phỏng vấn, dùng GPT nhưng kết quả vẫn chủ quan | B, C | ✅ |
| `KS-03` *(ẩn danh · PV Hướng — Người 3)* | 25 tuổi · Dev | khó tiếp cận đúng người đang có vấn đề vì không có nhiều mối quan hệ | B | ✅ |
| `KS-05` *(ẩn danh · PV Hướng đợt 2 — Người 1)* | chưa ghi vai | mỗi người làm lĩnh vực riêng nên phải gặp nhiều người, tốn thời gian | B, D | ✅ |
| `KS-06` *(ẩn danh · PV Hướng đợt 2 — Người 2)* | chưa ghi vai | chưa hiểu rõ đề tài; chưa đặt mình vào actor và chưa tin thông tin trên mạng | B, C | ✅ |
| `KS-07` *(ẩn danh · PV Hướng đợt 2 — Người 3)* | chưa ghi vai | chưa có quy trình quan sát; ít dự án thực tế và kinh nghiệm thực hành | A, E | ✅ |
| `KS-08` *(ẩn danh · PV Hướng đợt 2 — Người 4)* | chưa ghi vai | quen với bất tiện, thích nghi thay vì phân tích, chưa có thói quen quan sát | E | ✅ |
| `KS-09` *(ẩn danh · PV Hướng đợt 2 — Người 5)* | chưa ghi vai | chỉ nghĩ trong phạm vi bản thân, ít tiếp xúc cộng đồng, môi trường giao tiếp hạn chế | A, B | ✅ |

**Số liệu trung thực:** **11/13 người ngoài nhóm** xác nhận có friction. Vương là negative case rõ; Ẩn danh 3 được tính bảo thủ là chưa xác nhận vì câu mở đầu là *“Bản thân chưa gặp khó khăn gì”*, dù các why sau nêu rào cản. Tính cả trong nhóm thì **15/17 người** có friction. Báo cáo bằng phân số để người chấm thấy cỡ mẫu.

Bốn chain của thành viên nhóm **vẫn giữ** vì chúng là dữ liệu thật và có lỗi đã biết trước (dùng làm golden set §7) — chỉ **không tính vào n của chuẩn A**.

> 🔲 **Chuẩn A chưa đủ 20 người ngoài nhóm: hiện 13, còn thiếu 7.** Việc này KHÔNG còn chặn tiêu chí 2 vì chuẩn B đã đủ, nhưng thu thêm vẫn làm mạnh §2 (bảng impact) và cần cho R6. Xem [`evidence/survey-log.md`](evidence/survey-log.md).

**Phân bố cụm** *(mẫu 15 người có pain, một người có thể thuộc nhiều cụm)*:

| Cụm | Nội dung | Số người |
|---|---|---|
| A | không có domain chứa pain | 4/15 |
| **B** | **không moi được pain từ người khác** | **8/15** |
| C | không có tiêu chí "pain nào đáng làm" | 6/15 |
| D | chi phí xác minh quá cao | 4/15 |
| E | không có quy trình/thói quen quan sát | 3/15 |

**≥5 quote nguyên văn:**

1. Ẩn danh 2 — *"Không hiểu được người khác, chỉ bằng góc nhìn chủ quan."*
2. Ẩn danh 2 — *"Khảo sát, có những người không đồng ý, không biết nên khảo sát như nào."*
3. Minh — *"Research 1 tuần rưỡi. Observe thị trường (thiếu exp nên lâu), đọc paper... paper đọc được không match với trường hợp của mình."*
4. Huy — *"Quá nhiều thông tin lười đọc. Không biết cái nào phù hợp với mình."*
5. Hướng — *"Painpoint có sẵn solution thì mất thời gian."* → *"Mất công, làm lại từ đầu."*
6. Liên — *"Chưa quy đổi được giá trị thực sự."*
7. Vương *(negative)* — *"Painpoint có từ trước đó → giải quyết trong 15'. Data thu thập nhanh → lấy trực tiếp từ data dữ liệu của doanh nghiệp."*
8. Ẩn danh 4 — *"Chưa chủ động phỏng vấn, trao đổi bằng GPT nhưng chỉ là chủ quan."*
9. `KS-03` — *"Khó tiếp cận với người gặp vấn đề."* → *"Không có nhiều mối quan hệ."*
10. Ẩn danh 3 *(negative/không nhất quán)* — *"Bản thân chưa gặp khó khăn gì."*
11. `KS-05` — *"Cần gặp nhiều người."* → *"Tốn thời gian."*
12. `KS-06` — *"Chưa thể đặt mình vào vị trí actor và không tin tưởng lắm vào thông tin trên mạng."*
13. `KS-07` — *"Chưa có quy trình để quan sát và ghi nhận vấn đề."*
14. `KS-08` — *"Thường tìm cách thích nghi thay vì phân tích."*
15. `KS-09` — *"Khó tìm pain point vì chỉ nghĩ trong phạm vi bản thân."*

**Phương pháp đếm** *(để người ngoài kiểm lại được)*: bắt đầu từ 9 chain của nhóm; đối chiếu đợt 1 của Hướng và gộp 2 chain trùng; nối thêm nguyên vẹn 5 chain đợt 2 → **17 người duy nhất**. Mỗi why được gán tay vào 1–2 cụm A–E; đếm theo **số người** chứ không theo số why. Bảng cụm chỉ tính 15 người xác nhận có pain; Vương và Ẩn danh 3 được giữ làm negative/ambiguous case, không ép vào cụm để làm đẹp số. Raw log và phần còn thiếu: [`evidence/survey-log.md`](evidence/survey-log.md).

> ✅ **Đã tạo log nối tiếp:** [`evidence/survey-log.md`](evidence/survey-log.md), không đè chain cũ. **Còn thiếu:** thu thêm ≥7 người ngoài nhóm; hỏi lại vai của `Ẩn danh 3–4` và `KS-05–KS-09`; bổ sung câu hỏi từng lượt của đợt 2 và đồng thuận sử dụng dữ liệu. Không suy ra các trường còn thiếu từ ngữ cảnh.

> 🔲 **Thiếu cột "hậu quả gì".** Tiêu chí 1 đòi *ai — đang làm gì — vướng đâu — **hậu quả gì***. Cả 17 chain chưa ghi được hậu quả đầy đủ; “tốn thời gian” mới là chi phí, chưa phải hệ quả. Hỏi lại: *"Việc đó khiến bạn phải trả giá gì?"*

> 🔲 **Ẩn danh 1, Why 1 là suy luận của người phỏng vấn**, không phải lời người được hỏi (đã tự ngoặc đơn: *"Tôi assum là họ chưa biết phải làm gì"*). Hỏi lại để lấy lời nguyên văn, hoặc đánh dấu rõ là inference — không dùng làm bằng chứng.

---

## §2. Impact & quyết định chọn

| # | Ứng viên | Bao nhiêu người | Tần suất | Tốn gì mỗi lần | Build nổi? | Chọn? |
|---|---|---|---|---|---|---|
| 1 | **Đào Gốc** — khảo sát 5-why thích ứng | 8/15 *(cụm B)* | mỗi lần đi phỏng vấn | 3 ngày / 5 người *(Minh)* | Cao — golden set có sẵn | ✅ **CHỌN** |
| 2 | Máy sàng pain — verdict đủ/chưa đủ căn cứ | 6/15 *(cụm C)* | mỗi vòng chọn đề tài | 1–4 tuần *(Minh 4t, Trọng 1t)* | Cao | 🟨 dự phòng |
| 3 | Khai thác pain từ môi trường đang sống | 4/15 *(cụm A)* | 1× đầu dự án | — | **Thấp** | ❌ loại |
| 4 | Tài liệu hoá quy trình/thói quen quan sát | 3/15 *(cụm E)* | 1× đầu dự án | — | Cao | ❌ loại |

### Ứng viên ĐÃ LOẠI + vì sao

- **#3 Khai thác pain từ môi trường** — cần dữ liệu cá nhân thật (nhật ký, chat, lịch) của người dùng, **vi phạm ràng buộc 3 của đề bài** (*"không data thật của người thật ngoài pack đã rà"*). Reach 4/15 vẫn thấp hơn #1.
- **#4 Tài liệu hoá quy trình/thói quen quan sát** — reach 3/15, và **không có quyết định AI trung tâm nào** để đặt vào lát cắt. Đây là bài toán nội dung/khoá học, không phải bài toán sản phẩm AI.
- **Sửa ops** *(latency, cost tracking)* — đã cân nhắc và loại từ đầu: là bug engineering, không có quyết định AI.

### Ứng viên CHỌN + vì sao *(bằng số)*

Cụm B hiện có reach cao nhất (8/15, so với C là 6/15). Nhóm chọn #1 vì:

1. **#1 nằm thượng nguồn của #2.** Máy sàng cần một why-chain đã tới gốc để sàng. Không có chain thì sàng cái gì? Xây #2 trước #1 là xây mái trước móng.
2. **#1 là stage duy nhất tạo ra bằng chứng mới từ ngoài đầu người dùng.** Bốn stage còn lại (phân tích đề tài · persona · AI leverage · MVP) đều chỉ suy luận trên input mà user đã tự gõ vào — nên không stage nào trong số đó chữa được Ẩn danh 2: *"chỉ bằng góc nhìn chủ quan"*.
3. **Nhóm dogfood được ngay.** Nhóm vẫn cần ≥7 người ngoài nhóm nữa cho chuẩn A. Xây #1 → dùng chính nó thu phần bằng chứng còn thiếu. Sản phẩm tự sinh bằng chứng cho dự án về chính nó.

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

### Golden set — 23 case

**Artifact:** dữ liệu máy đọc tại [`eval/golden-set.json`](eval/golden-set.json) · mô tả từng đầu vào/kết quả bắt buộc tại [`eval/Testcase/README.md`](eval/Testcase/README.md) · runner tại [`eval/Testcase/run.ts`](eval/Testcase/run.ts).

**Nguyễn Chí Hướng** đã chuẩn hoá bộ thử thành 23 testcase đọc được cho người chấm và chạy được bằng lệnh:

```powershell
cd codebase
npm run test:testcase
```

Runner tự chặn nếu tổng số case dưới 20, một trong bốn nhóm rủi ro có dưới 2 case hoặc ID bị trùng. Bộ hiện tại có đủ **4 kiểu**, mỗi kiểu **3 case** trong JSON: thiếu nguồn sự thật · mơ hồ/thiếu ngữ cảnh · ngoài phạm vi · lỗi đặc thù domain có hậu quả.

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
| 1 | 30/07 · mock baseline | 50,0% (7/14) | 100% (23/23) | 77,3% (17/22) | 95,7% (22/23) | ❌ Chưa đạt | [`mock-baseline.md`](eval/runs/mock-baseline.md) |
| 2 | 30/07 · OpenAI gpt-4o-mini lần 2 | 57,1% (8/14) | 100% (23/23) | 72,7% (16/22) | 100% (23/23) | ❌ Chưa đạt | [`openai-gpt4omini-lan2.md`](eval/runs/openai-gpt4omini-lan2.md) |
| 3 | 30/07 · Hướng chạy `test:testcase` | 50,0% (7/14) | 100% (23/23) | 78,3% (18/23) | 95,7% (22/23) | ❌ Chưa đạt | [`mock-testcase.md`](eval/runs/mock-testcase.md) · cấu trúc 23 case/4 kiểu đạt |

**Kết luận trung thực:** cả ba lượt đều ghi đủ case fail. Mock chạy từ wrapper của Hướng chứng minh luồng test hoạt động nhưng chưa đạt quality bar: sai nhiều nhất ở nhãn tầng (7/14 đúng) và còn 1 case nguồn fail; kết quả này được giữ nguyên để làm baseline, không sửa bar hoặc giấu case.

---

## §8. Phân công & kế hoạch

✅ **Đã điền tên thật và deliverable — CP5 có thể kiểm ngẫu nhiên theo vibe-coding rule.**

| Phần | Người | Deliverable |
|---|---|---|
| Evidence & Impact → chuẩn A + §2 | **Nguyễn Chí Hướng — 2A202601203** | `evidence/survey-log.md` · 17 người duy nhất/13 ngoài nhóm · thu ≥7 người ngoài nhóm nữa · cập nhật bảng impact |
| Bộ testcase chạy được | **Nguyễn Chí Hướng — 2A202601203** | `eval/Testcase/README.md` · `eval/Testcase/run.ts` · `npm run test:testcase` · `eval/runs/mock-testcase.*` |
| Spec | **Lê Quang Huy — 2A202601821** | `spec.md` |
| Prompt + golden set JSON | **Lê Quang Huy — 2A202601821** | `eval/golden-set.json` · `eval/runner.ts` · prompt stage ★ |
| Code flow | **Lê Quang Huy — 2A202601821** | `codebase/` · `codebase/traces/` |
| Demo | **Phạm Thị Liên — 2A202601795** | `demo-slides.pdf` · dry run |
| Validation | **Nguyễn Tiến Đạt — 2A202601387** | `validation/feedback-log.md` · `spec.md` §9 |

### Willing users *(≥3 tên — CP1 đòi khai)*

✅ 1. Ẩn danh 1 (SV K3) 2. Ẩn danh 2 (SV K3) 3. Ẩn danh 3 (SV K3)

*Nguồn sẵn có: 17 người duy nhất đã phỏng vấn; 3 willing users ngoài nhóm đã đồng ý thử prototype.*

### Kế hoạch validation CP5

Guide §4.2 — 10 phút/người, ≥5 người ngoài nhóm. Giao task thật rồi **im lặng quan sát**. Ba câu:
1. *"Điều gì khó hiểu hoặc khó chịu nhất?"*
2. *"Kết quả này bạn có tin không — vì sao?"*
3. *"Bạn có dùng thật không — vì sao / vì sao chưa?"*

✅ Người log: **Nguyễn Tiến Đạt** · file: `validation/feedback-log.md`

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
| ✅ sau CP5 | Prompt: Thêm ví dụ gợi ý khi câu trả lời < 10 chữ | Ẩn danh 1 & 3 bối rối không biết trả lời sao cho máy hiểu khi bị hỏi vặn lại. Thêm gợi ý giúp UX trơn tru hơn. |
| ✅ sau CP5 | UX: Thêm nút "Thử viết lại" khi chạm case chưa tới gốc | Ẩn danh 5 bị kẹt và không biết thao tác gì tiếp theo khi agent báo chain chưa thể can thiệp được. |

---

## §10. Rủi ro đã biết *(không thuộc template — để nhóm không quên)*

| # | Rủi ro | Mức | Xử lý |
|---|---|---|---|
| **R-1** | Hướng C mô tả là *"mining data"*, dự án này lấy bằng chứng từ khảo sát tự làm chứ không từ `data/vlearn-pack/` | 🔴 **Cao** | **Hỏi TA tại CP1.** Nếu buộc phải dùng data pack: hướng B *(Trợ lý Học viên — "tự tìm kiếm và quan sát trực tiếp trong Discord khoá")* cũng khớp, vì đề bài nói rõ hướng B **không có data pack riêng**. |
| **R-2** | R4 đòi ≥10 case từ chatlog thật; golden set này dùng transcript phỏng vấn của nhóm | 🔴 **Cao** | Xin TA xác nhận quy đổi tại CP1. Có ≥10 khi thu đủ 20 người. |
| **R-3** | n = 17 tổng nhưng chỉ 13 người ngoài nhóm; chuẩn A cần ≥20 | 🟡 Trung bình | Hướng thu thêm ≥7 người ngoài nhóm; log nối tiếp đã có tại `evidence/survey-log.md`. Chuẩn B đã đủ nên đây là bằng chứng bổ trợ, không còn chặn toàn bộ R1. |
| **R-4** | Cả 17 chain thiếu ô `hậu_quả_gì` đầy đủ | 🟡 Trung bình | Thêm câu “Việc đó khiến bạn phải trả giá gì?” vào mọi interview. Chặn 3 điểm R1. |
| **R-5** | Bot phỏng vấn có thể làm **tăng** tỷ lệ từ chối — Ẩn danh 2 đã báo: *"có những người không đồng ý"* | 🟡 Trung bình | Test tại CP5 như một giả thuyết, không bỏ qua. Nếu đúng → thuộc đường đi failure §6. |
| **R-6** | Người trả lời phải biết mình nói với AI; câu trả lời là dữ liệu người thật | 🟡 Trung bình | Xin đồng thuận, khai rõ là AI. Log giữ trong `validation/` + `evidence/`, chỉ commit quote ngắn, không dựng corpus. |
