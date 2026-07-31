# Log chạy test — Fathom

**Thời điểm chạy:** 2026-07-30  
**Provider:** Mock (rule-based, KHÔNG phải AI thật)  
**Lượt:** testcase  
**Số case:** 23

---

## Kết quả tổng hợp

### Đối chiếu quality bar: **CHƯA ĐẠT**

| Chiều | Kết quả | Ngưỡng | Đạt |
|---|---|---|:---:|
| **C1** · nhãn tầng đúng | **50.0% (7/14)** | ≥70% | ❌ |
| **C2** · không mớm đáp án | **100.0% (23/23)** | **100% (cứng)** | ✅ |
| **C3** · điều kiện dừng đúng | **78.3% (18/23)** | theo dõi | – |
| **C4** · không sinh số thiếu nguồn | **95.7% (22/23)** | **100% (cứng)** | ❌ |

**Lý do chưa đạt:**
- C1: 50% < 70% (thiếu 20%)
- C4: 1 case fail ở `n4-reach-one` (case 19)

---

## Phân tích chi tiết case fail

### Chiều 1 (nhãn tầng đúng) — 7 case fail:

| # | Case | Input | Expect | Lý do fail |
|---|---|---|---|---|
| 1 | `real-huong` | "Do dự, chưa tìm thấy đề tài nào đủ wow" | `triệu_chứng` | Mock gán sai nhãn |
| 2 | `real-huong-w4` | "Không nắm được quy trình chung..." | `nguyên_nhân` + stop | Mock gán sai nhãn |
| 4 | `real-lien` | "Chưa quy đổi được giá trị thực sự..." | `nguyên_nhân` + stop | Mock gán sai nhãn |
| 8 | `real-anon2` | (case của Ẩn danh 2) | | Mock gán sai nhãn |
| 19 | `n4-reach-one` | Chain có reach = 1 người | Phải flag "đáng giải quyết cá nhân" | Mock không flag |
| 21 | `n4-fake-depth` | Đủ 5 tầng nhưng cụt ở triệu chứng | `triệu_chứng` + stop | Mock gán sai nhãn |
| 22 | `hiem-correction` | User sửa hậu quả giữa dòng | Phải nhận sửa và tính lại | Mock không xử lý correction |

### Chiều 3 (điều kiện dừng đúng) — 5 case fail:

| # | Case | Lý do fail |
|---|---|---|
| 1 | `real-huong` | Là triệu chứng, phải hỏi tiếp, nhưng mock dừng (mode = stop) |
| 8 | `real-anon2` | (chi tiết không rõ từ output) |
| 9 | `real-anon1-deadend` | Chain cụt ở "do môi trường", mock không khai `chain_incomplete` |
| 12 | `n1-market` | Hỏi thông tin thị trường, mock không dừng đúng cách |
| 20 | `n4-leading-trap` | Câu mỏng dễ dụ mớm, mock xử lý không đúng điều kiện dừng |

### Chiều 4 (không sinh số thiếu nguồn) — 1 case fail:

| # | Case | Lý do fail |
|---|---|---|
| 19 | `n4-reach-one` | Chain reach = 1, mock không flag "đáng cá nhân, chưa đáng dự án" |

---

## Nhận xét

### Mock provider (rule-based):

**Ưu điểm:**
- ✅ C2 (không mớm đáp án): 100% — logic cứng, không có nguy cơ tự sinh giả định
- ✅ Chạy nhanh, không cần API key, dễ test cấu trúc

**Hạn chế:**
- ❌ C1 (nhãn tầng): 50% — rule-based không hiểu ngữ cảnh, gán nhãn theo keyword
- ❌ C4: miss 1 case cần phán đoán ngữ nghĩa (reach = 1)
- ❌ C3: 5 case fail — điều kiện dừng phức tạp, mock không xử lý hết edge case

### Khuyến nghị:

**Để đạt quality bar (≥70% C1, 100% C2, 100% C4), cần:**

1. **Chạy với AI thật** (OpenAI/Anthropic/Gemini) — C1 cần hiểu ngữ nghĩa
2. **Sửa prompt** cho các pattern fail:
   - `nguyen_nhan` vs `dieu_kien`: thêm ví dụ về "sự thiếu" (thiếu quy trình, thiếu cách quy đổi)
   - Reach = 1: thêm check và flag rõ ràng
   - Chain cụt ở `dieu_kien`: bắt buộc khai `chain_incomplete`

3. **Giữ mock cho CI** — test cấu trúc nhanh, nhưng đừng tin con số từ mock

---

## File output

- Markdown: `eval/runs/mock-testcase.md`
- JSON chi tiết: `eval/runs/mock-testcase.json`

---

## Next steps

```powershell
# Chạy với AI thật (cần API key):
cd codebase

# OpenAI
$env:LLM_PROVIDER="openai"
$env:OPENAI_API_KEY="sk-..."
npm run test:testcase

# hoặc Gemini
$env:LLM_PROVIDER="gemini"
$env:GEMINI_API_KEY="..."
npm run test:testcase

# hoặc Anthropic
$env:LLM_PROVIDER="anthropic"
$env:ANTHROPIC_API_KEY="..."
npm run test:testcase
```

Sau khi chạy với AI thật, so sánh 3 provider và chọn model tốt nhất cho demo.

