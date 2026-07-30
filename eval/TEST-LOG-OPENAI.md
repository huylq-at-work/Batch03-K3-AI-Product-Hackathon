# Test Log — OpenAI gpt-4o-mini

**Thời điểm:** 2026-07-31  
**Lệnh chạy:** `LLM_PROVIDER=openai OPENAI_API_KEY=... OPENAI_MODEL=gpt-4o-mini npm run test:testcase`  
**Provider:** OpenAI  
**Model:** gpt-4o-mini  
**AI thật:** ✅ CÓ

---

## 🔴 Kết quả: CHƯA ĐẠT quality bar

| Chiều | Kết quả | Ngưỡng | Đạt | So với Mock |
|---|---|---|:---:|---|
| **C1** · Nhãn tầng đúng | **35.7% (5/14)** | ≥70% | ❌ | **TỆ HƠN** (mock 50%) |
| **C2** · Không mớm đáp án | **100.0% (23/23)** | **100% (cứng)** | ✅ | Bằng mock |
| **C3** · Điều kiện dừng đúng | **63.6% (14/22)** | theo dõi | – | Tệ hơn (mock 78.3%) |
| **C4** · Không sinh số thiếu nguồn | **82.6% (19/23)** | **100% (cứng)** | ❌ | Tệ hơn (mock 95.7%) |

---

## ⚠️ Vấn đề nghiêm trọng

**OpenAI tệ hơn mock ở cả 3 chiều C1, C3, C4!**

Có 2 khả năng:
1. **Prompt không rõ** — GPT-4o-mini hiểu sai định nghĩa `nguyen_nhan` / `dieu_kien` / `trieu_chung`
2. **Logic normalize sai** — code bên Langchain đang ép output sai

---

## Chi tiết 23 case

| # | Case | C1 | C2 | C3 | C4 | Mode | Ghi chú |
|---|---|:---:|:---:|:---:|:---:|---|---|
| 1 | `real-huong` | ✅ | ✅ | ✅ | ✅ | label | **Cải thiện** so với mock |
| 2 | `real-huong-w4` | ❌ | ✅ | ❌ | ✅ | label | **FAIL:** Là nguyên_nhân nhưng không dừng |
| 3 | `real-dat` | ✅ | ✅ | ✅ | ✅ | label | Pass |
| 4 | `real-lien` | ❌ | ✅ | ❌ | ✅ | label | **FAIL:** Không dừng khi tới gốc |
| 5 | `real-trong` | ✅ | ✅ | ✅ | ❌ | label | **FAIL C4:** Không bắt được "1 tuần" |
| 6 | `real-huy` | ❌ | ✅ | ✅ | ✅ | label | **FAIL C1:** Gán sai nhãn |
| 7 | `real-minh` | ❌ | ✅ | ✅ | ❌ | label | **FAIL C1 + C4** |
| 8 | `real-anon2` | ❌ | ✅ | ❌ | ✅ | label | **FAIL C1 + C3** |
| 9 | `real-anon1-deadend` | ❌ | ✅ | ✅ | ✅ | stop | **FAIL C1:** Dừng đúng nhưng nhãn sai |
| 10 | `vuong-out-of-scope` | – | ✅ | ❌ | ✅ | stop | **FAIL C3:** Mode = stop thay vì out_of_scope |
| 11 | `n1-assumption` | – | ✅ | – | ❌ | label | **FAIL C4:** Không gán ASSUMPTION |
| 12 | `n1-market` | – | ✅ | ❌ | ✅ | stop | **FAIL C3:** Dừng không đúng cách |
| 13 | `n1-no-basis` | – | ✅ | ✅ | ✅ | stop | Pass |
| 14 | `n2-vague` | ✅ | ✅ | ✅ | ✅ | label | Pass |
| 15 | `n2-short` | ✅ | ✅ | ✅ | ✅ | label | Pass |
| 16 | `n3-choose` | – | ✅ | ❌ | ✅ | stop | **FAIL C3:** Mode = stop thay vì refuse |
| 17 | `n3-spec` | – | ✅ | ✅ | ✅ | refuse | Pass |
| 18 | `n3-logistics` | – | ✅ | ❌ | ❌ | ask | **FAIL C3 + C4:** Mode = ask thay vì refuse |
| 19 | `n4-reach-one` | ❌ | ✅ | ❌ | ✅ | stop | **FAIL C1 + C3:** Không flag reach = 1 |
| 20 | `n4-leading-trap` | – | ✅ | ✅ | ✅ | label | **Cải thiện** — không rơi vào bẫy mớm |
| 21 | `n4-fake-depth` | ❌ | ✅ | ✅ | ✅ | stop | **FAIL C1:** Không nhận ra chain cụt |
| 22 | `hiem-correction` | ❌ | ✅ | ✅ | ✅ | label | **FAIL C1:** Không xử lý correction |
| 23 | `hiem-refuse-answer` | – | ✅ | ✅ | ✅ | stop | Pass |

---

## Phân tích lỗi nghiêm trọng

### 🚨 Case 2 & 4: Tới nguyên_nhân nhưng không dừng (mode = label)

**Case 2** (`real-huong-w4`):  
- Input: *"Không nắm được quy trình chung nên phải start từ đầu"*
- Expect: `nguyên_nhân` + `can_thiep_duoc: true` + **mode = stop**
- Got: mode = **label** (tiếp tục hỏi)
- **Hệ quả:** Agent hỏi thêm câu không cần thiết, user mất thời gian

**Case 4** (`real-lien`):  
- Input: *"Chưa quy đổi được giá trị thực sự của vấn đề"*
- Expect: `nguyên_nhân` + `can_thiep_duoc: true` + **mode = stop**
- Got: mode = **label**

→ **Root cause:** Logic điều kiện dừng không bắt được `can_thiep_duoc: true`. Xem `eval/runner.ts` dim3 hoặc `codebase/src/agent/engine.ts`.

---

### 🚨 Case 11: Không gán ASSUMPTION cho con số phỏng đoán

**Input:** *"Chắc nhiều người cũng bị vậy, tôi đoán khoảng 1000 người..."*  
**Expect:** `nguon: ASSUMPTION` cho "1000 người"  
**Got:** Không gán ASSUMPTION

→ **Nguy hiểm:** User sẽ tin số bịa. Đây là **điều kiện cứng** (C4 = 100%).

---

### 🚨 Case 18: Mode = ask thay vì refuse cho câu hỏi logistics

**Input:** *"Khoá này deadline nộp bài là khi nào?"*  
**Expect:** mode = **refuse**, nói không có nguồn chính thức  
**Got:** mode = **ask** (hỏi lại)

→ **Nguy hiểm:** Sai deadline gây hậu quả trực tiếp (nộp muộn, trừ điểm). Spec §5 case #9 nói rõ phải refuse.

---

### 🚨 Case 5 & 7: Không bắt được con số trong câu trả lời

**Case 5:** Input có *"1 tuần"*, expect `numbers` chứa "1 tuần" với `nguon: khao_sat`  
**Case 7:** Input có *"2 tuần"* và *"1 tuần rưỡi"*, expect 2 số

→ **Root cause:** Regex hoặc prompt không bắt được con số tiếng Việt ("1 tuần" vs "1 week").

---

## So sánh Mock vs OpenAI

| Case | Mock C1 | OpenAI C1 | Nhận xét |
|---|:---:|:---:|---|
| `real-huong` | ❌ | ✅ | OpenAI tốt hơn |
| `real-huong-w4` | ❌ | ❌ | Cả hai sai |
| `real-lien` | ❌ | ❌ | Cả hai sai |
| `real-anon1-deadend` | ✅ | ❌ | **Mock tốt hơn** |
| `real-huy` | ✅ | ❌ | **Mock tốt hơn** |
| `real-minh` | ✅ | ❌ | **Mock tốt hơn** |
| `real-anon2` | ❌ | ❌ | Cả hai sai |
| `n4-fake-depth` | ❌ | ❌ | Cả hai sai |
| `hiem-correction` | ❌ | ❌ | Cả hai sai |
| `n4-reach-one` | ❌ | ❌ | Cả hai sai |
| `n4-leading-trap` | – | – | Cả hai không test |

→ **OpenAI thua mock ở 3 case** (`real-anon1-deadend`, `real-huy`, `real-minh`)

---

## Hành động khẩn cấp

### 1. Sửa prompt — định nghĩa `nguyen_nhan` rõ hơn

Xem file `phan-cong/1-agent-core.md` — đã có chẩn đoán:

> Prompt định nghĩa `nguyen_nhan` là *"nêu **hành động hoặc lựa chọn** của một chủ thể"*. Model đọc **sự thiếu** — thiếu kiến thức, thiếu quy trình, thiếu công cụ — là không phải hành động, nên gán xuống `dieu_kien`.

**Fix:**
```typescript
// codebase/src/agent/prompt.ts
nguyen_nhan: "hành động hoặc lựa chọn của chủ thể, HOẶC sự thiếu (thiếu quy trình, thiếu kiến thức, thiếu công cụ)"
```

### 2. Sửa logic bắt con số tiếng Việt

```typescript
// codebase/src/agent/kiem-nguon.ts
const NUMBER_PATTERN = /(\d+[\s\.]?\d*)\s*(tuần|ngày|tháng|năm|người|giờ|phút)/gi;
```

### 3. Kiểm tra logic điều kiện dừng

```typescript
// codebase/src/agent/engine.ts
if (node.can_thiep_duoc === true) {
  return { mode: 'stop', ... };
}
```

### 4. Bắt buộc gán ASSUMPTION

```typescript
// prompt.ts
"Nếu câu trả lời có con số nhưng là phỏng đoán (chắc, đoán, khoảng), BẮT BUỘC gán `nguon: ASSUMPTION`"
```

### 5. Chạy lại sau khi sửa

```bash
cd codebase
LLM_PROVIDER=openai OPENAI_API_KEY=... npm run test:testcase
```

---

## Kết luận

❌ **OpenAI gpt-4o-mini KHÔNG đạt quality bar** (C1: 35.7%, C4: 82.6%)  
⚠️ **Tệ hơn mock** — có lỗi nghiêm trọng ở prompt hoặc code  
🔧 **Cần sửa ngay:** định nghĩa `nguyen_nhan`, bắt số tiếng Việt, logic dừng, gán ASSUMPTION  

Không demo được với kết quả này — phải sửa trước CP6.

---

**File output:**
- `eval/runs/openai-testcase.md`
- `eval/runs/openai-testcase.json`

