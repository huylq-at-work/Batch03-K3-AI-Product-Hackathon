# Phần 2 — Eval & provider

**Người phụ trách:** `___________`
**Khối rubric:** R4 (kiểm thử) **15đ**

Phần này là khối 15 điểm gọn nhất trong rubric: 4 điểm golden set, 4 điểm định nghĩa
chiều chất lượng kiểm chứng được, 3 điểm quality bar bằng số, 4 điểm bảng kết quả.
Hai phần ba đã xong; phần còn lại là chạy và ghi trung thực.

## File bạn sở hữu

```
codebase/src/llm/provider.ts    ← interface + trace + normalize
codebase/src/llm/anthropic.ts   ← Anthropic SDK
codebase/src/llm/openai.ts      ← OpenAI Chat Completions
codebase/src/llm/gemini.ts      ← Google AI Studio
codebase/src/llm/mock.ts        ← baseline rule-based
codebase/src/llm/index.ts       ← chọn provider theo env
eval/golden-set.json            ← 23 case
eval/runner.ts                  ← chấm 4 chiều
eval/runs/                      ← kết quả từng lượt
spec.md §7                      ← phần spec tương ứng
```

## Phải giải thích được ở CP5

1. **4 chiều chất lượng là gì, và vì sao cả 4 đều nhị phân?**
   → nhãn tầng đúng · không mớm đáp án · điều kiện dừng đúng · không sinh số thiếu
   nguồn. Nhị phân vì R4 đòi *"người ngoài nhóm chấm ra cùng kết quả"*. "Câu hỏi hay
   không" là chủ quan nên **cố ý không đưa vào bar**.

2. **Quality bar là gì và vì sao có hai điều kiện 100%?**
   → ≥70% chiều 1, **và** 100% chiều 2, **và** 100% chiều 4. Hai cái sau cứng vì một
   agent khảo sát mớm đáp án hoặc bịa số **còn tệ hơn Google Form** — Form ít nhất
   không tự tay làm nhiễu dữ liệu.

3. **Vì sao có provider `mock` rule-based?**
   → nó là **baseline**. Nếu mock cũng pass thì R5 sẽ hỏi "vậy cần AI làm gì?".
   Con số hiện tại: mock 50,0% vs gpt-4o-mini 57,1% ở chiều 1 — **AI mới hơn baseline
   1 case**. Đó là phát hiện, không phải sự cố; nó nói prompt cần sửa (phần 1 đang làm).

4. **`normalize()` ép gì và vì sao?**
   → `can_thiep_duoc` chỉ true khi `kind === 'nguyen_nhan'`. Cố ý không tin model:
   điều kiện dừng của sản phẩm không được phụ thuộc vào việc model có nhất quán hay không.

5. **Ba provider khác nhau ở chỗ nào về structured output?**
   → Anthropic: `output_config.format` json_schema · OpenAI: `response_format`
   json_schema strict, có fallback json_object nếu 400 · Gemini: dialect schema khác
   (OpenAPI subset, type chữ HOA) nên **dán schema vào prompt** thay vì map hai dialect
   — map dễ lệch âm thầm.

6. **Model ID lấy từ đâu?** → Lab04 của nhóm: `providers/openai_provider.py` dùng
   `gpt-4o-mini`, `gemini_provider.py` dùng `gemini-3.5-flash`. Đây là ID đã chạy thật.

## 🔴 Việc còn dở #1 — bảng so 4 model

Đã có:

| Lượt | Provider | C1 nhãn | C2 mớm | C3 dừng | C4 nguồn | Bar |
|---|---|---|---|---|---|---|
| `mock-baseline` | mock (rule-based) | 50,0% | 100% | 77,3% | 95,7% | ✗ |
| `openai-gpt4omini-lan2` | gpt-4o-mini | 57,1% | 100% | 72,7% | 100% | ✗ |

Còn thiếu **anthropic** và **gemini**. Chạy:

```bash
cd codebase
$env:LLM_PROVIDER="gemini";    $env:GEMINI_API_KEY="..."    ; npm run eval gemini-lan1
$env:LLM_PROVIDER="anthropic"; $env:ANTHROPIC_API_KEY="..." ; npm run eval claude-lan1
```

Key OpenAI có trong `D:\VinUni\Lab04\Day04-2A202601821-LeQuangHuy\starter_v0\.env`.
**Đừng commit key.** Đặt vào `codebase/.env.local` (đã gitignore) hoặc set env tạm.

Xong thì dựng bảng 4 dòng, đưa vào `spec.md` §7. Bảng này trả lời được câu giám khảo
hay hỏi: *"sao chọn model này?"* — và trả lời **bằng số trên cùng một bộ case**.

## 🔴 Việc còn dở #2 — sửa 1 expect sai trong golden set

`hiem-correction`: câu trả lời *"hậu quả không phải mất thời gian mà là nộp muộn nên
bị trừ điểm"* mô tả **hậu quả**, không phải nguyên nhân. Expect hiện là `nguyen_nhan`
— **sai**. Đổi sang `trieu_chung`, hoặc bỏ `kind` khỏi expect và chỉ kiểm mode.

Ghi thay đổi này vào `spec.md` §9 Changelog kèm lý do. Đây là điều rubric muốn thấy:
sửa **định nghĩa** khi định nghĩa sai, và ghi lại — chứ không sửa số cho đẹp.

## 🟡 Việc còn dở #3 — chiều 3 chưa bắt hết

`dim3()` đã sửa để bắt 2 bất biến: tới gốc phải dừng, và dừng sớm phải khai
`chain_incomplete`. Đọc lại xem còn lỗ nào không — ví dụ `mode = ask` nhưng
`next_question` rỗng.

## 🟡 Việc còn dở #4 — trace vào repo

R5 đòi *"log/trace trong repo"*. Trace phiên thật chứa nguyên văn lời người thật nên
`traces/` đang gitignore. Cách xử lý: commit trace của **lượt chạy golden set**
(dữ liệu tự sinh, an toàn) bằng `git add -f`. `eval/runs/*.json` đã có raw output
từng case — đấy có thể đủ; xác nhận với TA.

## Đừng làm

- **Đừng sửa quality bar.** Chốt 23:59 N1. Chưa đạt mà phân tích được nguyên nhân
  vẫn tính đủ điểm; số liệu bị chỉnh sửa thì không.
- Đừng xoá case fail khỏi golden set. Bảng phải có **đủ mọi case kể cả chưa đạt**.
- Đừng commit `.env.local` hay bất cứ file nào có key.
