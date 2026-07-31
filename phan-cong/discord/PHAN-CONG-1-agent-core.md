> **File này là phần 1/4 của nhóm — Agent core (stage ★).**
> Bản tự chứa để đọc rời. Bản gốc + 3 phần còn lại: https://github.com/huylq-at-work/Batch03-K3-AI-Product-Hackathon/tree/main/phan-cong

# Nhóm [XX] · Fathom — Phần 1: Agent core (stage ★)

**Đề tài:** Xây dựng agent AI khảo sát 5-why thích ứng giúp học viên xác định painpoint
có căn cứ cho dự án. **Lát cắt build:** Fathom — khảo sát 5-why thích ứng.

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
| 1 👈 | Agent core (stage ★) | R2 15đ + R3 11đ = 26đ | `_______` |
| 2 | Eval & provider | R4 15đ | `_______` |
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

**Khối rubric:** R2 (lát cắt & thiết kế) **15đ** + R3 (chỗ khó & kịch bản) **11đ** = **26đ**

Đây là phần khó giải thích nhất và cũng là phần đáng điểm nhất. Nó là **quyết định AI
trung tâm** của cả lát cắt — mọi thứ khác trong repo là scaffold quanh nó.

## File bạn sở hữu

```
codebase/src/agent/prompt.ts    ← system prompt + build user prompt
codebase/src/agent/schema.ts    ← JSON Schema cho structured output
codebase/src/agent/engine.ts    ← runTurn + chặn lỗi cứng
spec.md §4, §4b, §5, §6         ← phần spec tương ứng
```

## Phải giải thích được ở CP5

1. **Hai quyết định AI là gì?**
   → (a) câu hỏi tiếp theo là gì, (b) tầng vừa nhận thuộc loại nào.
   Vì sao đây là chỗ AI có leverage mà rule không có? → vì câu hỏi phụ thuộc hoàn
   toàn nội dung câu trả lời trước. Google Form không làm được **không phải vì Form
   yếu, mà vì Form tĩnh**.

2. **Điều kiện dừng là gì và vì sao không phải "đủ 5 why"?**
   → dừng khi `can_thiep_duoc: true`. Chain 3 tầng tới gốc tốt hơn chain 5 tầng cụt
   ở `dieu_kien`. Case thật: Ẩn danh 1 có đủ 4 why nhưng tầng cuối *"do môi trường"*
   không can thiệp được.

3. **Ba nhãn khác nhau thế nào?** `nguyen_nhan` / `dieu_kien` / `trieu_chung` —
   phải nêu được ví dụ cho từng cái từ khảo sát thật của nhóm.

4. **Vì sao "mớm đáp án" là lỗi CỨNG chứ không phải chiều chấm điểm?**
   → vì nó không chỉ trả kết quả sai, nó **làm bẩn chính dữ liệu nhóm đang đi thu**,
   và người dùng không có cách nào biết. Đây là kịch bản #11 trong `spec.md` §5,
   câu trả lời cho *"kịch bản nào nhóm sợ nhất khi demo"*.

5. **`normalize()` trong `llm/provider.ts` ép gì?** (đọc dù file đó thuộc phần 2)
   → `can_thiep_duoc` chỉ true khi `kind === 'nguyen_nhan'`. Cố ý **không tin model**:
   một model lỏng tay không phá được điều kiện dừng.

6. **`augment` chứ không `automate` — vì sao?** Bảng cost-of-error trong `spec.md` §4:
   nói sai "đã tới gốc" tốn 1–4 tuần của người dùng; nói sai "chưa tới gốc" tốn 30
   giây. Bất đối xứng ~100× nên agent phải lệch về phía thận trọng.

## 🔴 Việc còn dở #1 — bug định nghĩa `nguyen_nhan`

Lượt chạy `eval/runs/openai-gpt4omini-lan2.md`: **chiều 1 chỉ 57,1% (8/14)**, bar ≥70%.

Chẩn đoán đã có. **5/6 case fail đều lệch cùng một hướng** — model gán thấp hơn thực tế:

| Case | Câu trả lời | Cần | Model trả | Lý do model tự nêu |
|---|---|---|---|---|
| `real-huong-w4` | "Không nắm được quy trình chung nên start từ đầu" | `nguyen_nhan` | `dieu_kien` | "hoàn cảnh không ai hành động được lên nó" |
| `real-lien` | "Chưa quy đổi được giá trị thực sự" | `nguyen_nhan` | `trieu_chung` | "biểu hiện bề mặt" |
| `real-anon2` | "không biết nên khảo sát như nào" | `nguyen_nhan` | `trieu_chung` | "chưa nêu rõ nguyên nhân" |
| `n4-reach-one` | "vì tôi dùng một cái máy cũ đời 2015" | `nguyen_nhan` | `dieu_kien` | "hoàn cảnh không ai hành động được" |

**Nguyên nhân:** prompt định nghĩa `nguyen_nhan` là *"nêu **hành động hoặc lựa chọn**
của một chủ thể"*. Model đọc **sự thiếu** — thiếu kiến thức, thiếu quy trình, thiếu
công cụ — là không phải hành động, nên gán xuống `dieu_kien`.

Nhưng "không nắm được quy trình" **can thiệp được** (viết quy trình ra là xong).
Đó mới là điều quan trọng, không phải nó có phải một động từ hay không.

**Hướng sửa** (bạn tự quyết cách diễn đạt):
- Bổ sung vào `prompt.ts`: một **sự thiếu** (thiếu kiến thức / kỹ năng / công cụ /
  quy trình) **là** `nguyen_nhan` nếu có thể bù được.
- Đổi câu hỏi kiểm tra từ *"đây có phải hành động không?"* sang
  *"có thể làm gì để việc này không còn đúng nữa?"* — trả lời được thì `nguyen_nhan`.
- Thêm 2 ví dụ ngay trong prompt, lấy từ bảng trên.

**⚠️ Một case là lỗi của MÌNH, không phải của model:** `hiem-correction` —
*"hậu quả không phải mất thời gian mà là nộp muộn nên bị trừ điểm"* mô tả **hậu quả**,
không phải nguyên nhân. Mình đặt expect = `nguyen_nhan` là sai. Sửa golden set
(phối hợp với phần 2), đừng sửa prompt cho khớp một expect sai.

## 🔴 Việc còn dở #2 — chiều 3 đang 72,7%

Model dừng sớm: `mode = stop` khi chưa tới gốc mà **không khai** `chain_incomplete`.
Prompt đã nói phải khai; model vẫn bỏ. Xem `eval/runs/openai-gpt4omini-lan2.json`,
lọc `dims.c3 === false`.

## Cách verify

```bash
cd codebase
npm run typecheck
$env:LLM_PROVIDER="mock"; npm run eval sau-sua-prompt
```

Chạy **trọn 23 case**, không chạy lẻ. Sửa prompt vỡ chỗ khác là chuyện thường.
Kết quả ghi vào `spec.md` §7 bảng "Kết quả các lượt chạy" — **kể cả khi vẫn chưa đạt bar**.

## Đừng làm

- Đừng sửa quality bar cho khớp kết quả. Bar chốt 23:59 N1.
- Đừng thêm feature mới sau CP4 (`02-guide.md` §3.1).
- Đừng bỏ `isLeadingQuestion()` vì nó chặn nhiều — nếu nó chặn sai thì sửa regex và
  ghi lý do, đừng tắt kiểm tra.

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
