# Reflection cá nhân — Lê Quang Huy

**Dự án:** Đào Gốc — khảo sát 5-why thích ứng giúp học viên tìm painpoint có căn cứ
**Mã sinh viên:** 2A202601821
**Nhóm:** Batch 03 (Khoá 3) · Zone [Điền Zone của bạn]
**Ngày nộp:** 30/07/2026

---

## 1. Phần mình làm

> Mô tả cụ thể phần bạn chịu trách nhiệm trong dự án. Đủ chi tiết để TA hỏi ngẫu nhiên và bạn giải thích được.

**Phần có tên mình — Agent Core & Provider (Khối 1 + phần LLM):**
- **Bộ máy phỏng vấn 5-why** (`src/agent/engine.ts`, `src/agent/prompt.ts`): quyết định câu hỏi tiếp theo, gán nhãn từng tầng (`nguyên_nhân`/`điều_kiện`/`triệu_chứng`), điều kiện dừng khi `can_thiệp_được`.
- **Cố vấn (advisor) + tool-loop** (`src/agent/tools.ts`, `src/components/Advisor.tsx`): luồng nhận đề tài → research web → tạo khảo sát → tổng hợp kết quả; kèm **guard chống bịa** mã đề tài/số liệu (`src/agent/guard.ts`).
- **Lớp provider trung lập** (`src/llm/*`): dựng trên LangChain để đổi provider (OpenAI-compatible / DeepSeek / Anthropic) mà không sửa logic agent; `normalize()` ép các bất biến của spec.
- **Khung eval** (`eval/runner.ts`): chạy golden set 23 case, in bảng 4 chiều.

**Deliverable cụ thể:**
- File: `codebase/src/agent/*`, `codebase/src/llm/*`, `eval/runner.ts`, và các mục Changelog §9 + §7 trong `spec.md`.
- Quyết định thiết kế quan trọng nhất mình đưa ra:
  1. **Ép hành vi bắt buộc bằng CODE, không bằng prompt.** Model yếu không tuân prompt ổn định, nên luật cứng (một câu hỏi, không bỏ cuộc sớm, không sinh số rỗng) được chặn ở `engine`/`normalize` chứ không chỉ viết vào prompt.
  2. **Agent tìm painpoint CHO người dùng bằng research + khảo sát**, không suy diễn painpoint khác từ một câu trả lời của họ. Người tạo khảo sát được tính là phản hồi #1.

---

## 2. AI hỗ trợ mình như thế nào

> Không phải liệt kê tool — mà là: AI làm gì, mình làm gì, ranh giới ở đâu.

| Việc | Ai làm | Ghi chú |
|---|---|---|
| Viết code implement (engine, provider, guard) | AI | Mình review, quyết định giữ/sửa từng thay đổi |
| Quyết định sản phẩm: đổi runtime sang DeepSeek, giữ luật "một câu", thiết kế luồng | Mình | AI cảnh báo đánh đổi, mình chốt |
| Chẩn đoán lỗi (lạc đề, crash JSON, DeepSeek 400) | Cả hai | AI dựng repro có kiểm soát để đo; mình đọc kết quả và chọn hướng |
| Chạy eval, so số trước/sau | AI | Mình đọc bảng, đối chiếu quality bar |

**Chỗ AI giúp được nhiều nhất:**
> Dựng **repro có kiểm soát** để biến "cảm giác" thành bằng chứng — ví dụ chạy cùng một prompt nhiều lần để chứng minh model không tất định, hay tái hiện đúng lượt hỏi lỗi để tìm thủ phạm thay vì đoán.

**Chỗ AI không thay được (phải tự làm):**
> Quyết định sản phẩm và nhận ra output "tốt" theo mắt người phỏng vấn thật. AI implement được mọi thứ, nhưng "hỏi 2 câu để nhiều context hay giữ 1 câu cho sạch dữ liệu", "đổi model hay chấp nhận giới hạn" — là mình chốt. Có lúc mình phải bác lại kết luận vội của AI và bắt nó chứng minh bằng thí nghiệm.

---

## 3. Bài học từ case fail của nhóm

> Chọn **1 case cụ thể** mà prototype/process đã fail — không phải fail chung chung.

**Case fail:**
> Chủ đề khảo sát là *"khó theo dõi phí tự động gia hạn"*. Một phiên thật: người trả lời nói bị charge → agent bám cái đuôi *"ít đăng nhập"* rồi hỏi tiếp *"vì sao ít đăng nhập → vì sao không dùng nữa"*, lết 5 câu sang chuyện **bỏ dùng sản phẩm (churn)** — lạc hẳn khỏi painpoint. Kết quả: 5 câu hỏi mà không thu được gì dùng được.

**Vì sao nó fail:**
> Bộ 5-why đuổi theo **lời cuối** của mỗi câu trả lời, không giữ **chủ đề** làm la bàn. Trên gpt-4o-mini, mình thử vá bằng prompt (thêm hẳn mục "giữ chủ đề") nhưng repro cho thấy **4/4 vẫn lạc** — đây là **trần phán đoán của model**, không sửa được bằng prompt.

**Nhóm xử lý thế nào:**
> Không nhồi thêm prompt (đã chứng minh phản tác dụng). Chuyển runtime sang **DeepSeek `deepseek-v4-flash`** — chạy lại đúng case đó thì nó **giữ được chủ đề**, tự nhận nguyên nhân can thiệp được và dừng đúng lúc, còn tự phát hiện khi câu trả lời đi vòng. Đồng thời vá các lỗi tương thích để DeepSeek chạy được (structured output + tool_choice).

**Nếu làm lại, mình sẽ khác gì:**
> Chọn model theo **việc khó nhất** (phán đoán giữ chủ đề, biết khi nào dừng) ngay từ đầu, thay vì chọn theo giá/parity rồi mới phát hiện trần. Và test chất lượng bằng **hội thoại nhiều lượt thật** sớm hơn, chứ không chỉ nhìn eval nhị phân từng lượt.

---

## 4. Một điều mình học được từ sự kiện này

> Một câu, cụ thể, có thể áp dụng được vào dự án tiếp theo.

> Với model yếu, prompt chỉ là **mong muốn** — hành vi nào bắt buộc phải chắc thì ép bằng **code**; còn những gì cần **phán đoán tinh** (không lạc đề, biết dừng) là **trần của chính model**, nên chọn model theo việc khó nhất chứ đừng theo giá.
