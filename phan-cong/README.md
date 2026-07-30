# Phân công — 4 người

## 🔴 Đọc trước: commit không phải là điều được chấm

Code hiện tại đã commit dưới một tên (`55d6dbe`). **Việc chia lại commit cho có tên
mỗi người không giúp gì cho điểm** — luật vibe-coding của khoá nói rõ:

> *"dùng AI để build thoải mái, nhưng **không giải thích được phần có tên mình thì
> phần đó 0 điểm** (kiểm tra tại CP5)"*

CP5 chọn **một thành viên ngẫu nhiên** và hỏi "phần này hoạt động thế nào". Người đó
trả lời được thì cả phần đó có điểm; không thì 0. Nên cách chia dưới đây không chia
theo số dòng code, mà chia theo **vùng hiểu được**: mỗi người một khối rubric, một
việc còn dở thật để làm, và một danh sách "phải giải thích được gì".

Làm task trong file của mình → commit chính công việc đó. Đấy là commit thật, và
đúng phần bạn hiểu.

## Bảng phân công

| # | Vùng | Khối rubric | File | Việc còn dở |
|---|---|---|---|---|
| [1](1-agent-core.md) | Agent core (stage ★) | **R2 15đ + R3 11đ** | `codebase/src/agent/` | 🔴 Sửa bug định nghĩa `nguyen_nhan` → chiều 1 đang 57,1% |
| [2](2-eval-provider.md) | Eval & provider | **R4 15đ** | `codebase/src/llm/`, `eval/` | 🔴 Chạy anthropic + gemini, dựng bảng so 4 model |
| [3](3-ui-demo.md) | UI & demo | **R5 8đ** | `codebase/src/components/`, `App.tsx` | 🔴 4 đường đi phải thấy được trên UI + dry run |
| [4](4-evidence-validation.md) | Evidence & validation | **R1 15đ + R6 8đ** | `codebase/src/store/`, `evidence/`, `validation/` | 🔴 Thu ≥11 người · thêm ô `hậu_quả_gì` |

Tổng: 15+11+15+8+15+8 = **72/75 điểm**. 3 điểm còn lại là R7 (cấu trúc repo + README
phân công có tên) — cả nhóm cùng chịu, xem mục cuối.

## Chọn phần nào

Phần **1** khó giải thích nhất (nó là quyết định AI trung tâm) — người viết spec cùng
Claude nên giữ. Phần **4** không cần code nhưng là phần **chặn đường cả nhóm**: n=9
mà chuẩn A đòi ≥20, không có nó thì 15 điểm R1 mất trắng bất kể code đẹp cỡ nào.

Đừng ai chọn phần mình không định đọc code. Thà đổi phần bây giờ hơn là im lặng ở CP5.

## Luật chung

**Không sửa file ngoài vùng của mình** mà không nói trong Discord. Bốn vùng cố ý
không chồng nhau; chồng lên là ra conflict và mất dấu ai hiểu phần nào.

**Trước khi commit:**

```bash
cd codebase
npm run typecheck     # phải sạch
npm run build         # phải xong
```

**Chạy eval sau khi sửa bất cứ thứ gì trong `agent/` hoặc `llm/`:**

```bash
cd codebase
$env:LLM_PROVIDER="mock"; npm run eval <nhãn-lượt>
```

Sửa chỗ này vỡ chỗ kia là chuyện thường của prompt — chạy **trọn bộ**, không chạy
lẻ vài case.

**Không commit:** `.env.local`, `node_modules/`, `dist/`, và **không commit trace của
phiên khảo sát thật** (chứa nguyên văn lời người thật — xem README gốc mục Bảo mật).

**Quality bar đã chốt** trong `spec.md` §7 lúc 23:59 N1. Kết quả đo thấp thì ghi
trung thực + phân tích nguyên nhân — rubric R4 nói rõ *"chưa đạt mà phân tích được
nguyên nhân vẫn tính đủ điểm; số liệu bị chỉnh sửa sẽ không được tính"*. **Đừng ai
sửa bar.**

## Hai thứ chặn đường cả nhóm — không ai làm thì cả 4 phần đều mất điểm

1. **Hỏi TA tại CP1** (ai gặp TA trước thì hỏi):
   - Đề tài này lấy bằng chứng từ khảo sát tự làm, không từ `data/vlearn-pack/`.
     Có khớp **hướng C** không, hay phải khai **hướng B**? (Đề bài nói hướng B
     *"không có data pack riêng"* nên có thể khớp hơn.)
   - R4 đòi *"≥10 case từ chatlog thật"*. Golden set của nhóm dùng transcript
     phỏng vấn thật của nhóm. **Quy đổi được không?** — 4 điểm phụ thuộc câu này.
   - Fork đang public và chứa nguyên `data/vlearn-pack/`. Nếu đây là repo nộp bài
     thì có vi phạm mục Bảo mật không?

2. **n = 9, chuẩn A đòi ≥20 người NGOÀI NHÓM.** Xác nhận trong 9 người đã phỏng vấn
   có ai là thành viên nhóm — nếu có thì n thật còn thấp hơn. Đây là việc của phần 4
   nhưng cả nhóm nên đi thu, mỗi người 3 người là xong.

## R7 — 3 điểm cả nhóm cùng chịu

- [ ] `README.md` gốc: thêm thành viên (mã HV + tên) + phân công có tên từng phần
- [ ] Cấu trúc repo đủ: `spec.md` ✅ · `codebase/` ✅ · `eval/` ✅ · `demo-slides.pdf` ❌
      · `validation/` (rỗng) · `reflection/` (có template) · `evidence/` ❌
- [ ] `reflection/` — **mỗi người 1 file**, chấm riêng, không ai làm hộ được
