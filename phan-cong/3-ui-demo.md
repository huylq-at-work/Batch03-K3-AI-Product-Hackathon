# Phần 3 — UI & demo

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
