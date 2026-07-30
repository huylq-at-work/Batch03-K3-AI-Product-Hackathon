> **File này là phần 3/4 của nhóm — UI & demo.**
> Bản tự chứa để đọc rời. Bản gốc + 3 phần còn lại: https://github.com/huylq-at-work/Batch03-K3-AI-Product-Hackathon/tree/main/phan-cong

# Nhóm [XX] · Đào Gốc — Phần 3: UI & demo

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
| 2 | Eval & provider | R4 15đ | `_______` |
| 3 👈 | UI & demo | R5 8đ + demo | `_______` |
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

**Khối rubric:** R5 (prototype chạy được) **8đ** + là người dựng phần **demo 5 phút**

R5 chỉ 8 điểm nhưng bạn là người quyết định bài demo trông thế nào — và điểm vòng
demo tính riêng theo thể lệ. Ba ô tick của R5: chạy end-to-end không can thiệp tay
· ≥1 lời gọi AI thật ở quyết định trung tâm · mức prototype khai báo khớp thực tế.

## File bạn sở hữu

```
codebase/src/App.tsx                      ← router hash + login
codebase/src/main.tsx
codebase/src/styles.css
codebase/src/components/Chat.tsx          ← bề mặt duy nhất chạm AI thật
codebase/src/components/ChainView.tsx     ← chain có nhãn, sửa được
codebase/src/components/Dashboard.tsx     ← tạo/quản lý sub-agent
flow.html                                 ← sơ đồ (đã xong, đừng sửa nếu không cần)
demo-slides.pdf                           ← CHƯA CÓ, việc của bạn
```

## Phải giải thích được ở CP5

1. **Lời gọi AI thật nằm ở dòng nào?**
   → `Chat.tsx` gọi `runTurn()` → `provider.complete()`. Chỉ một chỗ. Mọi thứ khác
   là mock, và `spec.md` §4 khai rõ từng phần.

2. **4 đường đi trải nghiệm hiện ở đâu trên UI?** (đây là 3 điểm của R3, phải chỉ được)
   → happy: chain đủ nhãn + badge "đã tới nguyên nhân can thiệp được" ·
   low-confidence: agent hỏi lại đúng 1 câu · failure: badge "chưa tới nguyên nhân
   can thiệp được" + `chain_incomplete` · correction: dropdown sửa nhãn trong `ChainView`.

3. **Nguyên tắc G9 (sửa dễ dàng) áp vào đâu?**
   → dropdown nhãn trong `ChainView.tsx`. Sửa nhãn thì `can_thiep_duoc` **tính lại**
   theo nhãn mới, không phải chạy lại từ đầu.

4. **Nguyên tắc G1/G2 áp vào đâu?**
   → khung `.notice` ở màn hình bắt đầu phiên: nói rõ đang nói với AI, hỏi tối đa mấy
   câu, và **đặt kỳ vọng thấp hơn khả năng** ("mình có thể đoán sai loại nguyên nhân").

5. **Vì sao vi phạm luật cứng hiện lên UI thay vì bị bỏ qua?**
   → `Chat.tsx` render `violations` từ `runTurn()`. Nếu agent mớm đáp án, người dùng
   thấy ngay. Ẩn đi thì làm bẩn dữ liệu mà không ai biết.

## 🔴 Việc còn dở #1 — dựng slide 6 trang

`02-guide.md` §5.1, luật *"không có bằng chứng thì không có slide"* — mỗi slide phải
có ≥1 con số / quote có nguồn / kết quả đo.

| # | Slide | Thời lượng | Lấy số ở đâu |
|---|---|---|---|
| 1 | User & Job | 45" | `spec.md` §1 — 8/9 xác nhận, Vương 15' vs Minh 4 tuần |
| 2 | Vì sao chọn tính năng này | 45" | `spec.md` §2 bảng impact + **ứng viên đã loại** |
| 3 | Giải pháp & demo live | 2' | 1 case chuẩn + **1 case chỗ khó** |
| 4 | Kết quả đo | 45" | `eval/runs/` — % vs quality bar đã chốt |
| 5 | User thật nói gì | 45" | `validation/` — ≥2 quote có tên (phần 4 lo) |
| 6 | Nếu có thêm 1 tuần | 30" | 2–3 việc trỏ về failure chưa xử |

**Slide 4 đang là điểm mạnh chứ không phải điểm yếu:** bar chưa đạt, nhưng nhóm có
bảng so 4 model trên cùng bộ case + chẩn đoán nguyên nhân. Rubric nói rõ chưa đạt mà
phân tích được vẫn tính đủ điểm. **Đừng giấu.**

## 🔴 Việc còn dở #2 — case lỗi live

CP6 đòi demo có case lỗi được xử lý. Dùng `real-anon1-deadend`, nhập tay vào chat:

> *"Do môi trường, chưa có cơ hội tiếp xúc hoặc đi làm"*

Agent phải gán `dieu_kien`, `can_thiep_duoc: false`, và báo chain chưa tới gốc.
**Đây là chain hỏng trong khảo sát của chính nhóm** — tự soi lỗi mình, live. Đó là
điểm mạnh nhất của bài demo này, đặt nó ở slide 3.

## 🔴 Việc còn dở #3 — dry run có bấm giờ

CP5 đòi dry run xong. 5 phút là ngắn hơn bạn nghĩ. Mỗi thành viên phải nói ≥1 phần.

## 🟡 Việc còn dở #4 — link public chưa dùng được thật

`App.tsx` route `#/s/<agentId>` chỉ hoạt động **trên cùng browser** vì dữ liệu ở
localStorage. Màn hình lỗi đã nói rõ thay vì fail âm thầm.

Nếu nhóm định dùng link này để thu 20 người thì **chưa được**. Ba đường:
(a) tất cả trả lời trên một máy, (b) dựng backend — ngoài phạm vi 1,5 ngày,
(c) Google Form thu song song, Đào Gốc dùng cho 5 phiên demo + validation.

Chọn đường nào cũng phải ghi vào `spec.md` §4 (mức prototype) — **khai sai mức là
mất 2 điểm R5**.

## Cách verify

```bash
cd codebase
npm install        # lần đầu
npm run dev        # mở http://localhost:5173
npm run build      # phải xong trước khi commit
```

Chạy được không cần API key (provider mặc định là mock). Có key thì đặt trong
`.env.local`.

## Đừng làm

- Đừng dựng UI đẹp trước khi flow thông (`02-guide.md` §3.1).
- Đừng bỏ khung cảnh báo ở login/chat. Nó là G1/G2 và là chỗ nói với người dùng rằng
  auth này không phải bảo mật thật.
- Đừng deploy. API key nằm trong bundle — xem `codebase/README.md` §Bảo mật.

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
