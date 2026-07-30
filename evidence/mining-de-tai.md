# Mining Danh_sach_de_tai.xlsx — 360 đề tài

## 1. Quy mô lựa chọn

- Tổng đề tài: **360**
- Số khối: **21**
- Max team/đề tài: {'2': 360} → **720 slot** cho toàn khoá

## 2. Tải đọc — chi phí để chọn 1 trong 360

- Mỗi đề tài: median **1,424 ký tự** (min 1,000 · max 2,387)
- Toàn bộ 4 cột nội dung: **525,568 ký tự** ≈ 95,558 từ ≈ **8.0 giờ** đọc liên tục (200 từ/phút)
- Chỉ riêng cột `Mô Tả Bài Toán`: 254,767 ký tự ≈ **3.9 giờ**

## 3. Chất lượng mô tả — có đủ để so sánh không?

- Có nêu **số liệu định lượng**: **19/360 = 5.3%**
- Có nêu mục tiêu/yêu cầu rõ: 69/360 = 19.2%
- Có mục 'Thực trạng': 360/360

> 94.7% đề tài **không có con số nào** về độ lớn vấn đề. Không có gì để quy đổi thành impact, nên không so sánh được đề nào đáng làm hơn.

## 4. Độ khó phân biệt giữa các đề

- Tên duy nhất: 360/360 (không trùng hẳn)
- Tên bắt đầu bằng `AI Agent` + động từ: **240/360 = 66.7%**
  - 42× `ai agent trợ…`
  - 25× `ai agent quản…`
  - 15× `ai agent phân…`
  - 12× `ai agent giám…`
  - 12× `ai agent hỗ…`
  - 11× `ai agent phát…`

## 5. Năm ví dụ

> **Đã redact.** Catalog đề tài không được đẩy lên repo public, nên phần này
> chỉ nêu mã đề + số đo. Bản nguyên văn: `python evidence/mine-de-tai.py <xlsx>
> --day-du > evidence/mining-vi-du.local.md` (gitignore) — TA xem trực tiếp trên máy.

| Mã đề | Khối | Dài tên | Dài mô tả | Có số liệu? | Có mục tiêu? |
|---|---|---|---|:---:|:---:|
| `EDU-01` | A · AI Giáo dục | 84 ký tự | 1,047 ký tự | có | có |
| `EDU-02` | A · AI Giáo dục | 75 ký tự | 874 ký tự | có | **không** |
| `AIP-01` | Mô hình nền tảng AI – Khối AI tập trung | 75 ký tự | 802 ký tự | **không** | **không** |
| `AIP-02` | Mô hình nền tảng AI – Khối AI tập trung | 64 ký tự | 576 ký tự | **không** | **không** |
| `VSOC-01` | An ninh mạng | 69 ký tự | 994 ký tự | **không** | **không** |

