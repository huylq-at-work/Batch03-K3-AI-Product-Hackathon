> **File này là phần 2/4 của nhóm — Eval & provider.**
> Bản tự chứa để đọc rời. Bản gốc + 3 phần còn lại: https://github.com/huylq-at-work/Batch03-K3-AI-Product-Hackathon/tree/main/phan-cong

# Nhóm [XX] · Đào Gốc — Phần 2: Eval & provider

**Đề tài:** Xây dựng agent AI khảo sát 5-why thích ứng giúp học viên xác định painpoint
có căn cứ cho dự án. **Lát cắt build:** Đào Gốc — khảo sát 5-why thích ứng.

Đọc trước khi bắt đầu: [`spec.md`](https://github.com/huylq-at-work/Batch03-K3-AI-Product-Hackathon/blob/main/spec.md) ·
[`flow.html`](https://github.com/huylq-at-work/Batch03-K3-AI-Product-Hackathon/blob/main/flow.html) (mở bằng browser, sơ đồ flow)

## Lấy code về

```bash
git clone git@github.com:huylq-at-work/Batch03-K3-AI-Product-Hackathon.git
cd Batch03-K3-AI-Product-Hackathon/codebase
npm install
npm run dev          # http://localhost:5173 — chạy được KHÔNG cần API key
```

Chưa có Node? `winget install OpenJS.NodeJS.LTS` rồi mở terminal mới.

---

## 🔴 Vì sao chia thế này — đọc kỹ, nó khác với "chia cho có commit"

Code đã commit sẵn dưới một tên. **Chia lại commit cho có tên mỗi người không giúp gì
cho điểm.** Luật vibe-coding của khoá:

> *"dùng AI để build thoải mái, nhưng **không giải thích được phần có tên mình thì
> phần đó 0 điểm** (kiểm tra tại CP5)"*

CP5 chọn **một thành viên ngẫu nhiên** và hỏi *"phần này hoạt động thế nào"*. Trả lời
được thì phần đó có điểm; không thì 0.

Nên phần của bạn dưới đây có ba mục:
1. **File bạn sở hữu** — 4 vùng cố ý không chồng nhau
2. **Phải giải thích được ở CP5** — câu hỏi kèm câu trả lời, học phần này
3. **Việc còn dở** — làm việc đó rồi commit. Đấy là commit thật, đúng phần bạn hiểu.

Nếu bạn không định đọc code phần này thì **đổi phần ngay bây giờ**, đừng im lặng tới CP5.

## Bảng 4 phần

| # | Vùng | Rubric | Ai |
|---|---|---|---|
| 1 | Agent core (stage ★) | R2 15đ + R3 11đ = 26đ | `_______` |
| 2 👈 | Eval & provider | R4 15đ | `_______` |
| 3 | UI & demo | R5 8đ + demo | `_______` |
| 4 | Evidence & validation | R1 15đ + R6 8đ = 23đ | `_______` |

## Luật chung

**Không sửa file ngoài vùng của mình** mà không nói trong Discord. Bốn vùng cố ý không
chồng nhau; chồng lên là ra conflict và mất dấu ai hiểu phần nào.

**Trước mỗi commit:**

```bash
cd codebase
npm run typecheck    # phải sạch
npm run build        # phải xong
```

**Sửa bất cứ thứ gì trong `agent/` hoặc `llm/` → chạy lại TRỌN BỘ golden set:**

```bash
cd codebase
$env:LLM_PROVIDER="mock"; npm run eval <nhãn-lượt>     # PowerShell
LLM_PROVIDER=mock npm run eval <nhãn-lượt>             # bash
```

Sửa prompt chỗ này vỡ chỗ kia là chuyện thường. Chạy lẻ vài case không tính.

**Không commit:** `.env.local` · `node_modules/` · `dist/` · **trace của phiên khảo
sát thật** (chứa nguyên văn lời người thật — xem README gốc mục Bảo mật).

**Quality bar đã chốt** trong `spec.md` §7 lúc 23:59 N1. Đo thấp thì ghi trung thực +
phân tích nguyên nhân. Rubric R4 nói rõ: *"chưa đạt mà phân tích được nguyên nhân vẫn
tính đủ điểm; số liệu bị chỉnh sửa sẽ không được tính."* **Đừng ai sửa bar.**

---

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

---

## 🔴 Hai thứ chặn đường CẢ NHÓM

Không ai làm thì cả 4 phần đều mất điểm, bất kể code đẹp cỡ nào.

**1. Hỏi TA tại CP1** — ai gặp TA trước thì hỏi, rồi báo lại Discord:
- Đề tài lấy bằng chứng từ khảo sát tự làm, **không** từ `data/vlearn-pack/`. Có khớp
  **hướng C** không, hay phải khai **hướng B**? (Đề bài nói hướng B *"không có data pack
  riêng — nhóm tự tìm kiếm và quan sát trực tiếp"* nên có thể khớp hơn.)
- R4 đòi *"≥10 case từ chatlog thật"*. Golden set nhóm dùng transcript phỏng vấn thật
  của nhóm. **Quy đổi được không?** — 4 điểm phụ thuộc câu này.
- Fork đang **public** và chứa nguyên `data/vlearn-pack/`. Nếu đây là repo nộp bài thì
  có vi phạm mục Bảo mật không?

**2. n = 9, chuẩn A đòi ≥20 người NGOÀI NHÓM.**
Trước hết xác nhận trong 9 người đã phỏng vấn **có ai là thành viên nhóm** — nếu có thì
n thật còn thấp hơn. Chia 4 người mỗi người 3 là xong. Đây là việc của phần 4 nhưng cả
nhóm nên đi thu.

## Trạng thái hiện tại

| Có rồi | Chưa có |
|---|---|
`spec.md` §1–§10 · `flow.html` · `codebase/` (typecheck + build sạch) · `eval/` 23 case + 2 lượt chạy | `demo-slides.pdf` · `evidence/` · `validation/` (rỗng) · `reflection/` mỗi người 1 file |

**Kết quả đo mới nhất** (`eval/runs/`): quality bar **CHƯA ĐẠT** — chiều 1 đạt 57,1%
(bar ≥70%). Chẩn đoán nguyên nhân đã có sẵn trong phần 1. Đây là trạng thái bình thường
ở giai đoạn này, không phải sự cố.

## R7 — 3 điểm cả nhóm cùng chịu

- [ ] `README.md` gốc: thành viên (mã HV + tên) + phân công có tên từng phần
- [ ] `reflection/` — **mỗi người 1 file**, chấm riêng, không ai làm hộ được
