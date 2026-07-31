> **File này là phần 4/4 của nhóm — Evidence & validation.**
> Bản tự chứa để đọc rời. Bản gốc + 3 phần còn lại: https://github.com/huylq-at-work/Batch03-K3-AI-Product-Hackathon/tree/main/phan-cong

# Nhóm [XX] · Fathom — Phần 4: Evidence & validation

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
| 1 | Agent core (stage ★) | R2 15đ + R3 11đ = 26đ | `_______` |
| 2 | Eval & provider | R4 15đ | `_______` |
| 3 | UI & demo | R5 8đ + demo | `_______` |
| 4 👈 | Evidence & validation | R1 15đ + R6 8đ = 23đ | `_______` |

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

**Khối rubric:** R1 (bằng chứng & impact) **15đ** + R6 (validation với user) **8đ** = **23đ**

Phần này ít code nhất và **quan trọng nhất**. R1 là khối 15 điểm lớn nhất của rubric,
và hiện tại nhóm **đang không đạt điều kiện tối thiểu của nó**: chuẩn A đòi ≥20 người
ngoài nhóm, nhóm có 9. Không ai làm phần này thì 23 điểm mất trắng bất kể code đẹp cỡ nào.

Đây cũng là phần duy nhất **không mua lại được bằng nỗ lực về sau** — đến CP5 mới đi
thu người là quá muộn.

## File bạn sở hữu

```
codebase/src/store/db.ts        ← localStorage + exportEvidence()
codebase/src/store/auth.tsx     ← auth demo
evidence/                       ← CHƯA CÓ, việc của bạn
validation/                     ← đang rỗng
spec.md §1, §2, §8              ← phần spec tương ứng
```

## Phải giải thích được ở CP5

1. **`exportEvidence()` xuất ra gì và vì sao cần?**
   → R1 đòi *"log đủ câu hỏi + từng câu trả lời nguyên văn + ai trả lời"*. Không có
   log thì **không được tính là bằng chứng**. Hàm này xuất Markdown: từng cặp Q/A,
   chain có nhãn, số liệu kèm nguồn.

2. **Vì sao `nguon` có giá trị `ASSUMPTION`?**
   → phân biệt "họ tự trải qua" với "họ phỏng đoán". Số có nhãn `ASSUMPTION`
   **không được tính vào verdict**. Đây là lớp chỗ khó ① trong `spec.md` §5.
   Case thật: Ẩn danh 1 Why 1 là suy luận của người phỏng vấn, không phải lời họ.

3. **Auth này bảo mật đến đâu?** → **không.** Mật khẩu plaintext trong localStorage,
   không server xác minh, ai sửa localStorage là đăng nhập thành bất kỳ ai. Nó chỉ
   tách agent giữa các thành viên trong bản demo. Cảnh báo này hiện ngay trên màn hình
   login **có chủ đích** — để không ai nhập mật khẩu thật.

4. **Vương là gì trong khảo sát?** → **negative case**, giữ lại có chủ đích. Anh ấy
   làm lộ ra biến quyết định: pain và data có đến kèm sẵn trong môi trường hay không.
   15 phút vs 4 tuần của Minh, mà cả hai đều đi làm.

## 🔴 Việc còn dở #1 — thu thêm ≥11 người *(chặn 6 điểm R1)*

Trước hết: **xác nhận trong 9 người đã phỏng vấn có ai là thành viên nhóm.** Nếu có
thì n thật thấp hơn 9 và cần thu nhiều hơn 11.

Cả lớp là user thật, giờ nghỉ là đủ. Chia 4 người mỗi người 3 là xong.

Hỏi về **lần gần nhất**, không hỏi ý kiến (`02-guide.md` §1.3): *"lần gần nhất bạn
tìm đề tài cho một dự án, từ lúc bắt đầu đến lúc chốt mất bao lâu?"* — chứ không phải
*"bạn có cần công cụ X không?"*, vì hầu như ai cũng trả lời có và dữ liệu không dùng được.

**Log nguyên văn:** câu đã hỏi · từng câu trả lời · ai trả lời. Lưu `evidence/survey-log.md`.

## 🔴 Việc còn dở #2 — thêm ô `hậu_quả_gì` *(chặn 3 điểm R1)*

Tiêu chí 1 của đề bài: *"ai — đang làm gì — vướng đâu — **hậu quả gì**"*.
**Cả 9 chain hiện tại đều thiếu ô cuối.** Có chi phí (4 tuần) nhưng không có hệ quả.

Thêm một câu vào mọi interview, kể cả 9 người đã hỏi: **"Việc đó khiến bạn phải trả
giá gì?"** — nộp muộn? chọn đề tài tệ hơn? bỏ dự án? điểm thấp?

## 🔴 Việc còn dở #3 — sửa Ẩn danh 1 Why 1

Chain đó ghi: *"Chưa gặp khó khăn (Tôi assum là họ chưa biết phải làm gì)"* — phần
trong ngoặc là **suy luận của người phỏng vấn**, không phải lời người được hỏi.
R1 đòi lời **nguyên văn**. Hỏi lại người đó, hoặc đánh dấu rõ là inference và **không
dùng làm bằng chứng**.

## 🔴 Việc còn dở #4 — vòng validation CP5 *(8 điểm R6)*

≥5 người ngoài nhóm thử prototype, trong đó ≥2 là willing user đã khai từ CP1.
9 người đã phỏng vấn là nguồn sẵn — xin 3 người đồng ý thử, khai tên vào `spec.md` §8.

Một phiên 10 phút (`02-guide.md` §4.2): giao task thật → **im lặng quan sát**, không
thuyết minh → hỏi đúng 3 câu:
1. *"Điều gì khó hiểu hoặc khó chịu nhất?"*
2. *"Kết quả này bạn có tin không — vì sao?"*
3. *"Bạn có dùng thật không — vì sao / vì sao chưa?"*

Log vào `validation/feedback-log.md`: `người thử (tên/vai — willing user?) | task |
quan sát | quote nguyên văn | mức nghiêm trọng`.

**Nếu mọi phản hồi đều là lời khen thì phiên test chưa đạt** — giao task khó hơn hoặc
đổi người thử.

Sau đó: **≥1 thay đổi từ feedback** ghi vào `spec.md` §9 Changelog, hoặc giữ nguyên
kèm lý do có căn cứ. Đây là 4 trong 8 điểm R6.

## 🟡 Việc còn dở #5 — bảng impact cần số thật

`spec.md` §2 hiện dùng "x/8 người". Sau khi có n≥20 thì cập nhật lại. Giữ nguyên
**ứng viên đã loại + lý do** — đó là 3 điểm mà nhiều nhóm bỏ mất.

## Bảo mật — phần này chạm dữ liệu người thật nhiều nhất

- Xin đồng thuận trước khi thu. Nói rõ họ đang nói với **AI**.
- Ẩn danh được: người trả lời để trống tên là thành `(ẩn danh)`.
- **Không commit trace phiên thật.** Log để trong `evidence/` và `validation/`, chỉ
  trích quote ngắn — README gốc mục Bảo mật.
- Nếu chạy qua **Gemini free tier**: `02-guide.md` §3.4 nói free tier có thể dùng dữ
  liệu để huấn luyện. Câu trả lời khảo sát là lời người thật → nói trước với họ,
  hoặc dùng provider khác cho khảo sát thật.

## Đừng làm

- Đừng gộp "n = 9" thành "88,9%" mà không kèm `n`. Mẫu nhỏ thì mỗi người là 11 điểm
  phần trăm. Ghi **"8/9 người"** trung thực và khó bắt lỗi hơn.
- Đừng bỏ Vương khỏi khảo sát vì "anh ấy không đau". Anh ấy là negative case và là
  chi tiết phân tích mạnh nhất của §1.

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
