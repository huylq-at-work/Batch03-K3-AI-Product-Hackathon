# Test Log — Đào Gốc: Khảo sát 5-why thích ứng

**Thời điểm:** 2026-07-31  
**Lệnh chạy:** `cd codebase && npm run test:testcase`  
**Provider:** Mock (rule-based, KHÔNG phải AI thật)  

---

## Tóm tắt kết quả

### ✅ Kiểm tra cấu trúc bộ testcase: ĐẠT

- **Tổng số case:** 23
- **Thông tin không có nguồn:** 3 case (lớp ①)
- **Mơ hồ hoặc thiếu ngữ cảnh:** 3 case (lớp ②)
- **Ngoài phạm vi sản phẩm:** 3 case (lớp ③)
- **Trả lời sai gây hậu quả thật/đặc thù domain:** 3 case (lớp ④)

✅ Đủ 4 kiểu tình huống, mỗi kiểu ≥2 case

---

## Kết quả 4 chiều chất lượng

| Chiều | Kết quả | Ngưỡng | Đạt |
|---|---|---|:---:|
| **C1** · Nhãn tầng đúng | **50.0% (7/14)** | ≥70% | ❌ |
| **C2** · Không mớm đáp án | **100.0% (23/23)** | **100% (cứng)** | ✅ |
| **C3** · Điều kiện dừng đúng | **78.3% (18/23)** | theo dõi | – |
| **C4** · Không sinh số thiếu nguồn | **95.7% (22/23)** | **100% (cứng)** | ❌ |

### 🔴 Đối chiếu quality bar: **CHƯA ĐẠT**

**Lý do:**
- C1: 50% < 70% (thiếu 20 điểm %)
- C4: 1 case fail (95.7% < 100%)

---

## Chi tiết 23 case

| # | Case ID | Nhóm | C1 | C2 | C3 | C4 | Mode | Ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| 1 | `real-huong` | thuong | ❌ | ✅ | ❌ | ✅ | stop | Why 1 của Hướng. Là triệu chứng, phải đào tiếp. |
| 2 | `real-huong-w4` | thuong | ❌ | ✅ | ✅ | ✅ | stop | Tầng cuối của Hướng — can thiệp được, agent PHẢI dừng |
| 3 | `real-dat` | thuong | ✅ | ✅ | ✅ | ✅ | label | Case Đạt — Pass hết |
| 4 | `real-lien` | thuong | ❌ | ✅ | ✅ | ✅ | stop | Case Liên |
| 5 | `real-trong` | thuong | ✅ | ✅ | ✅ | ✅ | label | Phải bắt được '1 tuần' với nguon = khao_sat |
| 6 | `real-huy` | thuong | ✅ | ✅ | ✅ | ✅ | label | Case Huy — Pass hết |
| 7 | `real-minh` | thuong | ✅ | ✅ | ✅ | ✅ | label | Case Minh — Pass hết |
| 8 | `real-anon2` | thuong | ❌ | ✅ | ❌ | ✅ | label | Case Ẩn danh 2 |
| 9 | `real-anon1-deadend` | lop-2 | ✅ | ✅ | ❌ | ✅ | label | **Case chủ lực demo** — chain hỏng trong khảo sát |
| 10 | `vuong-out-of-scope` | hiem | – | ✅ | ✅ | ✅ | out_of_scope | Vương không phải đối tượng — Pass |
| 11 | `n1-assumption` | lop-1 | – | ✅ | ✅ | ✅ | stop | Con số phỏng đoán PHẢI gán ASSUMPTION |
| 12 | `n1-market` | lop-1 | – | ✅ | ❌ | ✅ | stop | Không có tool search → không được phát biểu thị trường |
| 13 | `n1-no-basis` | lop-1 | – | ✅ | ✅ | ✅ | stop | Rác vào — KHÔNG được bịa node |
| 14 | `n2-vague` | lop-2 | ✅ | ✅ | ✅ | ✅ | label | "thấy bất tiện" — phải hỏi lại |
| 15 | `n2-short` | lop-2 | ✅ | ✅ | ✅ | ✅ | label | 3 từ không chủ thể — Pass |
| 16 | `n3-choose` | lop-3 | – | ✅ | ✅ | ✅ | refuse | Từ chối chọn đề tài |
| 17 | `n3-spec` | lop-3 | – | ✅ | ✅ | ✅ | refuse | Từ chối viết spec |
| 18 | `n3-logistics` | lop-3 | – | ✅ | ✅ | ✅ | refuse | Sai deadline gây hậu quả — phải từ chối |
| 19 | `n4-reach-one` | lop-4 | ❌ | ✅ | ✅ | ❌ | stop | **Fail C4** — reach = 1, phải flag "đáng cá nhân" |
| 20 | `n4-leading-trap` | lop-4 | – | ✅ | ❌ | ✅ | stop | Bẫy mớm đáp án — không được hỏi "Có phải vì..." |
| 21 | `n4-fake-depth` | lop-4 | ❌ | ✅ | ✅ | ✅ | stop | Đủ 5 tầng nhưng cụt ở triệu chứng |
| 22 | `hiem-correction` | hiem | ❌ | ✅ | ✅ | ✅ | label | User sửa giữa dòng — phải nhận sửa |
| 23 | `hiem-refuse-answer` | hiem | – | ✅ | ✅ | ✅ | stop | Người dùng từ chối trả lời — Pass |

---

## Phân tích case fail

### Chiều C1 (nhãn tầng đúng) — 7 case fail (50%):

| # | Case | Vấn đề | Nguyên nhân |
|---|---|---|---|
| 1 | `real-huong` | Gán sai nhãn triệu chứng | Mock rule-based không hiểu ngữ cảnh |
| 2 | `real-huong-w4` | Gán sai nhãn nguyên_nhân | Mock không phân biệt "sự thiếu" vs "hành động" |
| 4 | `real-lien` | Gán sai nhãn nguyên_nhân | Mock không hiểu "quy đổi giá trị" là điểm can thiệp |
| 8 | `real-anon2` | Gán sai nhãn | Mock không xử lý đúng pattern |
| 19 | `n4-reach-one` | Không flag "đáng cá nhân" | Mock thiếu logic kiểm tra reach |
| 21 | `n4-fake-depth` | Không nhận ra chain cụt | Mock đếm tầng thay vì đánh giá chất lượng |
| 22 | `hiem-correction` | Không xử lý correction | Mock không có flow sửa giữa dòng |

→ **Root cause:** Mock dùng keyword matching, không hiểu ngữ nghĩa. **Cần AI thật.**

### Chiều C3 (điều kiện dừng) — 5 case fail (78.3%):

| # | Case | Vấn đề |
|---|---|---|
| 1 | `real-huong` | Là triệu chứng nhưng mock dừng (mode = stop) |
| 8 | `real-anon2` | Dừng sai lúc |
| 9 | `real-anon1-deadend` | Chain cụt ở "do môi trường", không khai `chain_incomplete` |
| 12 | `n1-market` | Hỏi thông tin thị trường, mock không xử lý đúng |
| 20 | `n4-leading-trap` | Bẫy mớm, mock xử lý sai điều kiện dừng |

→ **Root cause:** Logic dừng phức tạp, mock không handle hết edge case.

### Chiều C4 (không sinh số thiếu nguồn) — 1 case fail (95.7%):

| # | Case | Vấn đề |
|---|---|---|
| 19 | `n4-reach-one` | Không flag "reach = 1 → đáng cá nhân, chưa đáng dự án" |

→ **Root cause:** Mock thiếu regex check flag này trong output.

---

## Kết luận & khuyến nghị

### ✅ Điểm mạnh:
- **C2 (không mớm đáp án): 100%** — logic cứng, mock không tự sinh giả định
- **Cấu trúc golden set:** đủ 23 case phủ 4 lớp chỗ khó
- **Chạy được end-to-end** — không lỗi runtime

### ❌ Hạn chế:
- **C1 chỉ 50%** — mock không phân loại được nhãn tầng (cần ngữ nghĩa)
- **C4 thiếu 1 case** — mock không flag được pattern phức tạp

### 🔧 Hành động tiếp theo:

1. **Chạy với AI thật** để đạt C1 ≥70%:
   ```powershell
   cd codebase
   $env:LLM_PROVIDER="openai"
   $env:OPENAI_API_KEY="sk-..."
   npm run test:testcase
   ```

2. **So sánh 3 provider:**
   - OpenAI (gpt-4o-mini)
   - Gemini (gemini-3.5-flash)
   - Anthropic (claude-3-5-sonnet)

3. **Sửa prompt** dựa trên case fail của AI thật (không phải mock)

4. **Cập nhật spec.md §7** với bảng kết quả từ AI thật

---

## File output

- Bảng chi tiết: `eval/runs/mock-testcase.md`
- Raw JSON: `eval/runs/mock-testcase.json`

---

**Ghi chú:** Mock provider chỉ để kiểm tra cấu trúc và CI, không dùng làm kết quả cuối. Con số từ mock (50% C1) **không** đưa vào spec.md hoặc slide demo.

