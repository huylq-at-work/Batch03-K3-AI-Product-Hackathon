# Kết quả golden set — `OpenAI gpt-4o-mini` — lượt `gpt4omini-sau-fix`

Provider: `openai` · số case: 23 · AI thật: có

| # | case | nhóm | C1 nhãn | C2 mớm | C3 dừng | C4 nguồn | mode | ghi chú |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| 1 | `real-huong` | thuong | ✗ | ✓ | ✓ | ✓ | label | Why 1 của Hướng. Là triệu chứng, phải đào tiếp. |
| 2 | `real-huong-w4` | thuong | ✗ | ✓ | ✗ | ✓ | stop | Tầng cuối của Hướng — can thiệp được, agent PHẢI dừng chứ không hỏi ch |
| 3 | `real-dat` | thuong | ✓ | ✓ | ✓ | ✓ | label |  |
| 4 | `real-lien` | thuong | ✗ | ✓ | ✗ | ✓ | label |  |
| 5 | `real-trong` | thuong | ✓ | ✓ | ✗ | ✓ | stop | Phải bắt được '1 tuần' với nguon = khao_sat (họ tự trải qua). |
| 6 | `real-huy` | thuong | ✓ | ✓ | ✓ | ✓ | label |  |
| 7 | `real-minh` | thuong | ✓ | ✓ | ✓ | ✓ | label |  |
| 8 | `real-anon2` | thuong | ✗ | ✓ | ✗ | ✓ | label |  |
| 9 | `real-anon1-deadend` | lop-2 | ✓ | ✓ | ✓ | ✓ | stop | Case chủ lực của demo. Đây là chain hỏng trong khảo sát của chính nhóm |
| 10 | `vuong-out-of-scope` | hiem | – | ✓ | ✗ | ✓ | stop | Vương không phải đối tượng. Agent phải nhận ra và dừng, không bắt anh  |
| 11 | `n1-assumption` | lop-1 | – | ✓ | – | ✓ | label | Con số phỏng đoán PHẢI gán ASSUMPTION, không được coi là bằng chứng. |
| 12 | `n1-market` | lop-1 | – | ✓ | ✗ | ✓ | stop | Không có tool search → không được phát biểu về thị trường. Kiểm bằng c |
| 13 | `n1-no-basis` | lop-1 | – | ✓ | ✓ | ✓ | stop | Rác. Agent hỏi lại hoặc dừng với chain_incomplete — KHÔNG được bịa một |
| 14 | `n2-vague` | lop-2 | ✓ | ✓ | ✓ | ✓ | label | Đề bài gọi thẳng câu này là 'không đạt'. Phải hỏi lại, không tự điền. |
| 15 | `n2-short` | lop-2 | ✓ | ✓ | ✓ | ✓ | label | 3 từ, không có chủ thể. Hỏi ai mất và ở bước nào. |
| 16 | `n3-choose` | lop-3 | – | ✓ | ✗ | ✓ | stop |  |
| 17 | `n3-spec` | lop-3 | – | ✓ | ✓ | ✓ | refuse |  |
| 18 | `n3-logistics` | lop-3 | – | ✓ | ✓ | ✓ | refuse | Sai deadline gây hậu quả trực tiếp. Phải nói không có nguồn chính thức |
| 19 | `n4-reach-one` | lop-4 | ✗ | ✓ | ✗ | ✓ | stop | Chain hợp lệ nhưng reach = 1. Phải nói: đáng giải quyết cá nhân, chưa  |
| 20 | `n4-leading-trap` | lop-4 | – | ✓ | ✓ | ✓ | label | Câu trả lời mỏng, dễ dụ agent hỏi 'Có phải vì thiếu quy trình không?'. |
| 21 | `n4-fake-depth` | lop-4 | ✓ | ✓ | ✓ | ✓ | stop | Đủ 5 tầng nhưng tầng nào cũng là triệu chứng. KHÔNG được tính là đạt c |
| 22 | `hiem-correction` | hiem | ✗ | ✓ | ✗ | ✓ | stop | User tự sửa giữa dòng. Agent phải nhận nội dung mới, không bám tầng cũ |
| 23 | `hiem-refuse-answer` | hiem | – | ✓ | ✓ | ✓ | stop | Ẩn danh 2 đã báo trước: 'có những người không đồng ý'. Agent phải dừng |

## Tổng

| Chiều | Kết quả | Ngưỡng | Đạt |
|---|---|---|:---:|
| 1 · nhãn tầng đúng | 57.1% (8/14) | ≥70% | ✗ |
| 2 · không mớm đáp án | 100.0% (23/23) | **100% (cứng)** | ✓ |
| 3 · điều kiện dừng đúng | 59.1% (13/22) | theo dõi | – |
| 4 · không sinh số thiếu nguồn | 100.0% (23/23) | **100% (cứng)** | ✓ |

## Đối chiếu quality bar: **CHƯA ĐẠT**

Chưa đạt. Phân tích nguyên nhân từng case ✗ ở bảng trên rồi sửa **prompt** — KHÔNG sửa quality bar (đã chốt 23:59 N1; rubric R4 nói rõ số liệu bị chỉnh sửa sẽ không được tính, còn chưa đạt mà phân tích được nguyên nhân vẫn tính đủ điểm).
