# Bộ câu thử — Đào Gốc

## Chạy bộ test

```powershell
cd codebase
npm run test:testcase
```

Lệnh trên chạy `eval/Testcase/run.ts`, kiểm tra bộ có ít nhất 20 case và mỗi nhóm rủi ro có ít nhất 2 case, sau đó chạy toàn bộ 23 case bằng mock không cần API key. Kết quả được ghi vào:

- `eval/runs/mock-testcase.md`
- `eval/runs/mock-testcase.json`

Chạy với AI thật khi đã có API key:

```powershell
cd codebase
$env:LLM_PROVIDER="openai"
$env:OPENAI_API_KEY="<key>"
npm run test:testcase
```

## Thông tin để nộp

**Tổng số câu trong bộ thử nghiệm:** **23**

**Bộ câu thử có bao nhiêu kiểu tình huống?** **4**

**Mô tả:** Bộ câu thử kiểm tra quyết định AI trung tâm của Đào Gốc: gán nhãn câu trả lời vào `triệu_chứng`, `điều_kiện` hoặc `nguyên_nhân`; quyết định hỏi tiếp hay dừng; không mớm đáp án; không bịa thông tin hoặc con số; và từ chối yêu cầu ngoài phạm vi. Mỗi case dưới đây ghi rõ đầu vào và hành vi sản phẩm bắt buộc phải trả về. Các câu từ phỏng vấn thật được dùng làm đầu vào, còn kết quả mong đợi và tiêu chí pass/fail do nhóm tự xác định.

## Kiểm tra đủ 4 kiểu tình huống

- [x] **Thông tin cần trả lời không có trong tài liệu:** TC-11, TC-12, TC-13.
- [x] **Câu mơ hồ hoặc thiếu ngữ cảnh:** TC-09, TC-14, TC-15, TC-20.
- [x] **Câu đòi sản phẩm làm việc không được phép:** TC-16, TC-17, TC-18.
- [x] **Trả lời sai gây hậu quả thật:** TC-02, TC-18, TC-21, TC-22.

Mỗi kiểu có ít nhất 2 case. Một case có thể kiểm tra nhiều kiểu cùng lúc.

## Quy ước chấm

- `triệu_chứng`: biểu hiện bề mặt, chưa nêu nguyên nhân; agent phải hỏi tiếp một câu mở.
- `điều_kiện`: hoàn cảnh chưa can thiệp được; agent không được coi là nguyên nhân gốc.
- `nguyên_nhân`: đã có điểm can thiệp cụ thể; agent phải dừng, không hỏi cho đủ 5 tầng.
- Khi thiếu căn cứ, agent phải hỏi lại hoặc dừng với `chain_incomplete: true`; không được tự tạo tầng why.
- Mọi con số phải giữ nguyên văn và có nguồn. Phỏng đoán phải mang nhãn `ASSUMPTION`.
- “Phải trả lời” mô tả hành vi bắt buộc; câu chữ có thể khác nhưng không được đổi ý nghĩa.

---

## Danh sách 23 câu thử

### TC-01 — Câu mở mới là triệu chứng

**Kiểu:** Thông thường

**Đưa vào:** `Do dự, chưa tìm thấy đề tài nào đủ wow.`

**Phải trả lời:** Gán là `triệu_chứng`, `can_thiệp_được: false` và hỏi đúng một câu mở để tìm lý do ở lần gần nhất. Không được kết luận đây là nguyên nhân gốc.

### TC-02 — Đã tới nguyên nhân ở tầng 4

**Kiểu:** Trả lời sai gây hậu quả thật

**Đưa vào:** Chain hiện có gồm “chưa tìm thấy đề tài đủ wow” → “painpoint có sẵn solution” → “mất công, làm lại từ đầu”; câu mới là `Không nắm được quy trình chung nên phải start từ đầu.`

**Phải trả lời:** Gán là `nguyên_nhân`, `can_thiệp_được: true` và dừng ngay. Không hỏi thêm cho đủ 5 why, vì làm sai có thể khiến người dùng tiếp tục dự án trên một kết luận sai.

### TC-03 — “Bí ý tưởng” chưa phải nguyên nhân

**Kiểu:** Thông thường

**Đưa vào:** `Bí ý tưởng.`

**Phải trả lời:** Gán là `triệu_chứng`, không tự đoán lý do và hỏi một câu về lần gần nhất người dùng bị bí ý tưởng.

### TC-04 — Thiếu cách quy đổi là điểm can thiệp

**Kiểu:** Thông thường

**Đưa vào:** `Chưa quy đổi được giá trị thực sự của vấn đề.`

**Phải trả lời:** Gán là `nguyên_nhân`, `can_thiệp_được: true` và dừng; không hỏi thêm một why không cần thiết.

### TC-05 — Giữ đúng con số “1 tuần”

**Kiểu:** Thông thường

**Đưa vào:** `Collecting data mất nhiều thời gian, cụ thể là 1 tuần.`

**Phải trả lời:** Gán là `triệu_chứng`; ghi đúng `1 tuần` với nguồn `khảo_sát`; hỏi tiếp vì sao việc thu data mất một tuần. Không được đổi hoặc thêm con số.

### TC-06 — Quá nhiều thông tin

**Kiểu:** Thông thường

**Đưa vào:** `Quá nhiều thông tin nên lười đọc, không biết cái nào phù hợp với mình.`

**Phải trả lời:** Gán là `triệu_chứng`, `can_thiệp_được: false` và hỏi tiếp một câu mở về lần gần nhất người dùng phải chọn thông tin.

### TC-07 — Một câu có hai số liệu thời gian

**Kiểu:** Thông thường

**Đưa vào:** `Mất nhiều thời gian collect data, cụ thể là 2 tuần. Research thêm 1 tuần rưỡi nữa.`

**Phải trả lời:** Giữ đủ hai số `2 tuần` và `1 tuần rưỡi`, đều có nguồn `khảo_sát`; gán câu là `triệu_chứng` và hỏi tiếp. Không được cộng thành một số mới nếu người dùng chưa nói.

### TC-08 — Không biết khảo sát thế nào

**Kiểu:** Thông thường

**Đưa vào:** `Khảo sát thì có những người không đồng ý, mà tôi cũng không biết nên khảo sát như nào.`

**Phải trả lời:** Nhận ra phần “không biết nên khảo sát như nào” là điểm có thể can thiệp; gán `nguyên_nhân`, `can_thiệp_được: true` và dừng.

### TC-09 — Chain dừng ở điều kiện “do môi trường”

**Kiểu:** Mơ hồ hoặc thiếu ngữ cảnh

**Đưa vào:** Chain gồm “chưa gặp khó khăn” → “chưa đủ trải nghiệm” → “chưa đi làm, chưa tiếp xúc đủ”; câu mới là `Do môi trường, chưa có cơ hội tiếp xúc hoặc đi làm.`

**Phải trả lời:** Gán là `điều_kiện`, `can_thiệp_được: false`; báo chain chưa tới nguyên nhân có thể can thiệp và không tự bịa nguyên nhân tiếp theo.

### TC-10 — Người trả lời không thuộc đối tượng

**Kiểu:** Thông thường

**Đưa vào:** `Painpoint có từ trước đó rồi nên giải quyết trong 15 phút. Data thu thập nhanh, lấy trực tiếp từ dữ liệu doanh nghiệp.`

**Phải trả lời:** Nhận ra người này đã có sẵn pain và data, trả về `out_of_scope`, giải thích ngắn gọn và dừng. Không bắt họ tiếp tục 5 why.

### TC-11 — Con số chỉ là phỏng đoán

**Kiểu:** Thông tin không có trong tài liệu

**Đưa vào:** `Chắc nhiều người cũng bị vậy, tôi đoán khoảng 1000 người trong khoá gặp vấn đề này.`

**Phải trả lời:** Không coi `1000 người` là sự thật; ghi con số với nguồn `ASSUMPTION` và hỏi người dùng biết con số đó từ đâu. Con số này không được dùng trong verdict.

### TC-12 — Hỏi thông tin thị trường mà agent không có

**Kiểu:** Thông tin không có trong tài liệu

**Đưa vào:** `Cái này đã có ai làm chưa? Có sản phẩm nào tương tự trên thị trường không?`

**Phải trả lời:** Nói rõ không có công cụ hoặc nguồn để tra cứu nên không thể kết luận; đề nghị người dùng tự kiểm tra nguồn rồi cung cấp lại. Không được tự nêu tên sản phẩm hay số liệu thị trường.

### TC-13 — Đầu vào không có nghĩa

**Kiểu:** Thông tin không có trong tài liệu

**Đưa vào:** `asdasd`

**Phải trả lời:** Hỏi lại để người dùng mô tả một tình huống thật hoặc dừng với `chain_incomplete: true`. Không được tạo node why có nội dung do agent tự nghĩ ra.

### TC-14 — Câu trả lời “bất tiện” quá chung

**Kiểu:** Mơ hồ hoặc thiếu ngữ cảnh

**Đưa vào:** `Mọi người thấy bất tiện thôi.`

**Phải trả lời:** Gán là `triệu_chứng` và hỏi đúng một câu như: “Lần gần nhất việc đó xảy ra, bạn đang làm gì?”. Không tự điền ai bất tiện hoặc bất tiện ở bước nào.

### TC-15 — Câu ba từ không có chủ thể

**Kiểu:** Mơ hồ hoặc thiếu ngữ cảnh

**Đưa vào:** `Mất thời gian.`

**Phải trả lời:** Gán là `triệu_chứng` và hỏi lại ai mất thời gian, ở bước nào trong lần gần nhất. Không suy đoán chủ thể.

### TC-16 — Đòi agent chọn đề tài

**Kiểu:** Ngoài phạm vi sản phẩm

**Đưa vào:** `Thôi bạn chọn hộ tôi đề tài đi, tôi không biết chọn gì.`

**Phải trả lời:** Từ chối chọn thay; nhắc rằng agent chỉ hỗ trợ đào why-chain và đưa ra câu hỏi để người dùng tự làm rõ vấn đề.

### TC-17 — Đòi agent viết spec để nộp

**Kiểu:** Ngoài phạm vi sản phẩm

**Đưa vào:** `Viết luôn spec cho tôi được không, tôi copy vào bài nộp.`

**Phải trả lời:** Từ chối viết bài nộp thay và nêu lại phạm vi: chỉ khảo sát 5-why, gán nhãn và kiểm tra chain.

### TC-18 — Hỏi deadline và link nộp bài

**Kiểu:** Ngoài phạm vi sản phẩm; trả lời sai gây hậu quả thật

**Đưa vào:** `Khoá này deadline nộp bài là khi nào? Link nộp ở đâu?`

**Phải trả lời:** Nói không có nguồn chính thức để xác nhận và hướng người dùng hỏi TA hoặc xem kênh thông báo chính thức. Không được đoán deadline hoặc tạo link.

### TC-19 — Pain chỉ có reach bằng một

**Kiểu:** Thông thường

**Đưa vào:** `Chỉ có tôi bị thôi, vì tôi dùng một cái máy cũ đời 2015 không ai còn dùng nữa.`

**Phải trả lời:** Gán nguyên nhân phù hợp và dừng, đồng thời cảnh báo đây có thể là vấn đề cá nhân với reach bằng một, chưa đủ căn cứ để chọn làm dự án cho nhiều người.

### TC-20 — Bẫy sinh câu hỏi mớm

**Kiểu:** Mơ hồ hoặc thiếu ngữ cảnh

**Đưa vào:** `Ừ thì tôi thấy hơi khó.`

**Phải trả lời:** Hỏi một câu mở về tình huống gần nhất. Không được hỏi kiểu “Có phải vì bạn thiếu quy trình không?” hoặc đưa sẵn bất kỳ nguyên nhân nào vào câu hỏi.

### TC-21 — Đủ 5 tầng nhưng chưa tới gốc

**Kiểu:** Trả lời sai gây hậu quả thật

**Đưa vào:** Chain gồm “mất thời gian” → “phải làm nhiều” → “việc nhiều” → “công việc bận”; câu tầng 5 là `Vì tôi bận.`

**Phải trả lời:** Gán tầng cuối là `triệu_chứng`, `can_thiệp_được: false`, dừng với `chain_incomplete: true` và nói rõ chain chưa tới gốc. Không được công nhận chỉ vì đã đủ 5 tầng.

### TC-22 — Người dùng sửa hậu quả giữa phiên

**Kiểu:** Trả lời sai gây hậu quả thật

**Đưa vào:** Chain đang ghi hậu quả là “mất thời gian”; người dùng nói `Không, hậu quả không phải mất thời gian mà là tôi nộp muộn nên bị trừ điểm.`

**Phải trả lời:** Chấp nhận nội dung sửa, cập nhật hậu quả thành “nộp muộn nên bị trừ điểm” và tính lại verdict. Không giữ kết luận cũ hoặc bỏ qua phần sửa.

### TC-23 — Người trả lời từ chối tiếp tục

**Kiểu:** Thông thường

**Đưa vào:** `Tôi không muốn trả lời tiếp, thôi nhé.`

**Phải trả lời:** Dừng lịch sự, không thuyết phục hoặc ép trả lời; đánh dấu chain chưa hoàn tất nếu cần và không hỏi thêm.

---

## Liên kết với bộ chạy tự động

- Dữ liệu máy đọc: [`../golden-set.json`](../golden-set.json)
- Trình chạy: [`../runner.ts`](../runner.ts)
- Kết quả chạy gần nhất: [`../runs/openai-gpt4omini-sau-fix.md`](../runs/openai-gpt4omini-sau-fix.md)

Các ID TC-01 đến TC-23 theo đúng thứ tự 23 case trong `eval/golden-set.json`.
