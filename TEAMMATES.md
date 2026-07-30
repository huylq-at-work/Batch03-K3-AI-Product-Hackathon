# DANH SÁCH THÀNH VIÊN NHÓM

> Mini Hackathon AI — Batch 03 (Khoá 3) · Đại học VinUni
> Đề tài: **Xây dựng agent AI khảo sát 5-why thích ứng giúp học viên xác định painpoint có căn cứ cho dự án**
> Lát cắt build: **Đào Gốc** — khảo sát 5-why thích ứng
> Repo: `Batch03-K3-AI-Product-Hackathon` · Spec: [`spec.md`](spec.md) · Flow: [`flow.html`](flow.html)

## 1. Thành viên

| STT | Họ và tên | Mã sinh viên |
| :-: | :-- | :-- |
| 1 | Nguyễn Chí Hướng | 2A202601203 |
| 2 | Nguyễn Tiến Đạt | 2A202601387 |
| 3 | Phạm Thị Liên | 2A202601795 |
| 4 | Lê Quang Huy | 2A202601821 |

## 2. Phân công vai trò

Khác Lab 04 (chia theo file code), hackathon này chia theo **khối rubric**. Lý do: rubric
chấm trên artifact và *"mỗi con điểm trỏ về một file"*, nên chia theo khối điểm thì mỗi
người biết chính xác mình chịu trách nhiệm cho con điểm nào.

**Toàn bộ phần code do Lê Quang Huy thực hiện.** Ba thành viên còn lại phụ trách các khối
không phải code — và đó là **phần lớn hơn của rubric**: R1 (15đ) + R6 (8đ) + demo cộng lại
nhiều điểm hơn R5 (8đ) của prototype.

| Thành viên | Vai trò | Khối rubric | Artifact sở hữu | Hướng dẫn |
| :-- | :-- | :-- | :-- | :-- |
| **Lê Quang Huy** | Dev & Spec — toàn bộ prototype | R2 15đ · R3 11đ · R4 15đ · R5 8đ = **49đ** | `codebase/**`, `eval/**`, `spec.md` §4–§7, `flow.html` | [P1](phan-cong/1-agent-core.md) · [P2](phan-cong/2-eval-provider.md) · [P3](phan-cong/3-ui-demo.md) |
| **Nguyễn Chí Hướng** | Evidence Lead — bằng chứng & impact | R1 **15đ** | `evidence/survey-log.md`, `spec.md` §1–§2 | [P4](phan-cong/4-evidence-validation.md) |
| **Nguyễn Tiến Đạt** | Validation Lead — vòng test với user | R6 **8đ** | `validation/feedback-log.md`, `spec.md` §9 Changelog | [P4](phan-cong/4-evidence-validation.md) |
| **Phạm Thị Liên** | Demo Lead — slide & dry run | vòng demo + R7 | `demo-slides.pdf`, `README.md` §thành viên | [P3](phan-cong/3-ui-demo.md) §slide |

### Việc cụ thể từng người

**Lê Quang Huy — Dev & Spec**
- Sửa bug định nghĩa `nguyen_nhan` trong `codebase/src/agent/prompt.ts` — chiều 1 đang
  57,1%, bar ≥70%. Chẩn đoán sẵn trong [`phan-cong/1-agent-core.md`](phan-cong/1-agent-core.md).
- Chạy golden set trên `anthropic` + `gemini`, dựng bảng so 4 model vào `spec.md` §7.
- Sửa 1 expect sai trong `eval/golden-set.json` (case `hiem-correction`), ghi vào §9.
- Giữ `npm run typecheck` và `npm run build` sạch.

**Nguyễn Chí Hướng — Evidence Lead** *(khối điểm lớn nhất, và chặn đường cả nhóm)*
- 🔴 **Thu thêm ≥15 người ngoài nhóm.** Xem cảnh báo ở mục 5 — con số này lớn hơn mình
  tưởng ban đầu.
- 🔴 Thêm ô **`hậu_quả_gì`** cho mọi chain — cả 9 chain hiện tại đều thiếu. Một câu:
  *"Việc đó khiến bạn phải trả giá gì?"*
- Hỏi về **lần gần nhất**, không hỏi ý kiến. *"Lần gần nhất bạn tìm đề tài, mất bao lâu?"*
  chứ không phải *"bạn có cần công cụ X không?"* — ai cũng trả lời có, dữ liệu vô dụng.
- Log nguyên văn: câu đã hỏi · từng câu trả lời · ai trả lời. Không có log thì **không
  được tính là bằng chứng**.
- Cập nhật bảng impact `spec.md` §2 sau khi có n mới. **Giữ ứng viên đã loại** — 3 điểm.

**Nguyễn Tiến Đạt — Validation Lead**
- Tổ chức vòng test CP5: **≥5 người ngoài nhóm**, trong đó ≥2 là willing user khai từ CP1.
- Mỗi phiên 10 phút: giao task thật → **im lặng quan sát** → hỏi đúng 3 câu:
  *"Điều gì khó hiểu nhất?"* · *"Bạn có tin kết quả này không — vì sao?"* ·
  *"Bạn có dùng thật không — vì sao / vì sao chưa?"*
- Log: `người thử (tên/vai) | task | quan sát | quote nguyên văn | mức nghiêm trọng`.
- **≥1 thay đổi từ feedback** ghi vào `spec.md` §9 — đây là 4/8 điểm R6.
- Nếu mọi phản hồi đều là lời khen thì phiên test **chưa đạt** — giao task khó hơn.

**Phạm Thị Liên — Demo Lead**
- Slide 6 trang theo `02-guide.md` §5.1. Luật: **không có bằng chứng thì không có slide** —
  mỗi slide ≥1 con số / quote có nguồn / kết quả đo.
- Slide 3 phải có **1 case chuẩn + 1 case lỗi live**. Dùng case `real-anon1-deadend`:
  nhập *"Do môi trường, chưa có cơ hội tiếp xúc hoặc đi làm"* → agent phải gán `dieu_kien`
  và báo chain chưa tới gốc. Đây là chain hỏng trong khảo sát của **chính nhóm** — tự soi
  lỗi mình, live. Đó là điểm mạnh nhất của bài demo.
- Slide 4 ghi **thẳng** kết quả đo dù chưa đạt bar, kèm phân tích nguyên nhân. Rubric R4
  nói rõ chưa đạt mà phân tích được vẫn tính đủ điểm; giấu số thì không được tính.
- Dry run **có bấm giờ** trước CP5. 5 phút ngắn hơn bạn nghĩ.
- Điền thành viên + phân công vào `README.md` gốc (R7 1đ).

## 3. Vẫn phải giải thích được phần của mình

Luật vibe-coding của khoá:

> *"dùng AI để build thoải mái, nhưng **không giải thích được phần có tên mình thì phần đó
> 0 điểm** (kiểm tra tại CP5)"*

CP5 chọn **một thành viên ngẫu nhiên** và hỏi về **phần có tên người đó**. Chia như trên là
hợp lệ: Huy bị hỏi về code, Hướng bị hỏi về evidence, Đạt về validation, Liên về demo.

Nhưng nghĩa là:
- **Huy** phải giải thích được toàn bộ `codebase/` và `eval/` — 49 điểm nằm ở đó.
- **Hướng / Đạt / Liên** phải giải thích được phương pháp của mình: vì sao hỏi "lần gần
  nhất" chứ không hỏi ý kiến · vì sao log nguyên văn mới tính là bằng chứng · vì sao
  không giấu số liệu chưa đạt.

Không ai cần đọc code người khác. Nhưng ai cũng cần hiểu **vì sao** phần mình làm thế.

**`reflection/` — mỗi người 1 file, chấm riêng, không ai làm hộ được.**

## 4. Quy trình Git

Repo nhỏ và 4 người sở hữu 4 vùng artifact không chồng nhau, nên **commit thẳng vào `main`**,
không cần branch/PR như Lab 04.

```bash
git pull --rebase origin main     # LUÔN pull trước khi làm
# ... sửa file thuộc phần mình ...
git add <file của mình>
git commit -m "mo ta ngan"
git push origin main
```

**Chỉ `git add` file thuộc phần mình.** Đừng `git add .` — dễ kéo theo thay đổi của người
khác hoặc file không nên commit.

Nếu push bị `! [rejected]`: có người push trước bạn. `git pull --rebase origin main` rồi
push lại. **Đừng dùng `push --force`** — nó xoá commit của người khác.

Chỉ Huy chạy được `npm run typecheck` / `build` / `eval`, nên trước khi Huy push code thì
kiểm cả hai; ba người còn lại chỉ sửa `.md` nên không cần.

## 5. 🔴 Hai thứ chặn đường cả nhóm

### 5.1 — n người ngoài nhóm thấp hơn tưởng: khoảng **5**, không phải 9

Chuẩn A đòi **≥20 người NGOÀI NHÓM**. Khảo sát hiện có 9 người, nhưng đối chiếu với mục 1:

| Người trong khảo sát | Vai khai trong khảo sát | Trong nhóm? |
|---|---|---|
| Hướng | SV năm 4 | ❌ **thành viên nhóm** |
| Đạt | SV năm 4 | ❌ **thành viên nhóm** |
| Liên | SV năm 3 | ❌ **thành viên nhóm** |
| Huy | đi làm 3 năm | ❌ **thành viên nhóm** (cần xác nhận) |
| Trọng · Vương · Minh · Ẩn danh 1 · Ẩn danh 2 | | ✅ ngoài nhóm |

→ **n ngoài nhóm ≈ 5.** Trừ Vương (negative case, không đau) thì còn **4 người ngoài nhóm
xác nhận có friction**, không phải 8.

**Cần thu thêm ~15 người, không phải 11.** Con số "8/9 = 88,9%" trong `spec.md` §1 phải
tính lại theo n ngoài nhóm.

Bốn chain của thành viên nhóm **vẫn giữ trong spec** — dùng làm bối cảnh và làm golden set
(dữ liệu thật, có lỗi đã biết trước), chỉ **không tính vào n của chuẩn A**. Ghi rõ chỗ nào
là trong nhóm, chỗ nào ngoài — che đi thì mất cả 6 điểm evidence.

### 5.2 — Ba câu phải hỏi TA tại CP1

1. Đề tài lấy bằng chứng từ khảo sát tự làm, **không** từ `data/vlearn-pack/`. Khớp
   **hướng C** không, hay khai **hướng B**? (Đề bài nói hướng B *"không có data pack riêng
   — nhóm tự tìm kiếm và quan sát trực tiếp"*, có thể khớp hơn.)
2. R4 đòi *"≥10 case từ chatlog thật"*. Golden set dùng transcript phỏng vấn thật của nhóm.
   **Quy đổi được không?** — 4 điểm phụ thuộc câu này.
3. Fork đang **public** và chứa nguyên `data/vlearn-pack/`. Nếu đây là repo nộp bài thì có
   vi phạm mục Bảo mật của README gốc không?

## 6. Không commit

`.env`, `.env.local`, API key dưới mọi dạng, `node_modules/`, `dist/`, và **trace của phiên
khảo sát thật** (chứa nguyên văn lời người thật — README gốc mục Bảo mật cấm đưa vào repo
công khai). Kiểm `git status` trước mỗi lần commit.
