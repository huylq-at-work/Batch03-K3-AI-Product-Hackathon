"""
Phương pháp đếm cho evidence chuẩn B — mining `Danh_sach_de_tai.xlsx`.

Chuẩn B của đề bài đòi: số đếm được + ≥5 ví dụ nguyên văn + **phương pháp đếm
kiểm lại được**. File này LÀ phương pháp đếm: ai chạy lại cũng ra cùng số.

    pip install openpyxl
    python evidence/mine-de-tai.py <đường-dẫn-tới-Danh_sach_de_tai.xlsx>

Không commit file .xlsx vào repo — nó là tài liệu ban tổ chức cấp, và repo này
public. Truyền đường dẫn local vào.
"""

from __future__ import annotations

import collections
import re
import statistics
import sys

import openpyxl

# Tốc độ đọc tham chiếu. Tiếng Việt có dấu ~5.5 ký tự/từ (đã tính khoảng trắng);
# 200 từ/phút là mức đọc-hiểu tài liệu kỹ thuật, không phải đọc lướt.
CHARS_PER_WORD = 5.5
WORDS_PER_MIN = 200

SHEET = "Danh Sach De Tai"
COL_DESC = "Mô Tả Bài Toán"
COL_NAME = "Tên Đề Tài"
COL_BLOCK = "Khối"
COL_CODE = "Mã Đề"
COL_TECH = "Tech stack gợi ý"
COL_TEAM = "Max team / đề tài"

# Đếm "có nêu số liệu định lượng": một con số ĐI KÈM đơn vị đo được.
# Cố ý KHÔNG khớp số trần (như "2 vai trò") vì đó là yêu cầu đầu ra, không phải
# bằng chứng về độ lớn của vấn đề.
RE_QUANT = re.compile(
    r"\d+\s*(%|sinh viên|SV|giờ|phút|ngày|tuần|tháng|nghìn|triệu|tỷ|người|lượt|đơn|ca)",
    re.I,
)
RE_GOAL = re.compile(r"Mục tiêu|Yêu cầu", re.I)


def load(path: str) -> tuple[dict[str, int], list[tuple]]:
    ws = openpyxl.load_workbook(path, data_only=True)[SHEET]
    rows = list(ws.iter_rows(values_only=True))
    header = {name: i for i, name in enumerate(rows[0])}
    data = [r for r in rows[1:] if r[0] is not None]
    return header, data


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(f"Dùng: python {sys.argv[0]} <đường-dẫn-Danh_sach_de_tai.xlsx>")
    sys.stdout.reconfigure(encoding="utf-8")

    header, data = load(sys.argv[1])
    cell = lambda r, k: str(r[header[k]] or "")  # noqa: E731
    n = len(data)

    print(f"# Mining Danh_sach_de_tai.xlsx — {n} đề tài\n")

    # --- 1. quy mô lựa chọn ---
    blocks = collections.Counter(cell(r, COL_BLOCK) for r in data)
    print(f"## 1. Quy mô lựa chọn\n")
    print(f"- Tổng đề tài: **{n}**")
    print(f"- Số khối: **{len(blocks)}**")
    teams = collections.Counter(cell(r, COL_TEAM) for r in data)
    slots = sum(int(float(v)) * c for v, c in teams.items() if v.replace(".", "", 1).isdigit())
    print(f"- Max team/đề tài: {dict(teams)} → **{slots} slot** cho toàn khoá\n")

    # --- 2. tải đọc ---
    read_cols = [COL_NAME, COL_DESC, COL_TECH, list(header)[6]]
    per = [sum(len(cell(r, c)) for c in read_cols) for r in data]
    total = sum(per)
    desc_total = sum(len(cell(r, COL_DESC)) for r in data)
    hours = lambda chars: chars / CHARS_PER_WORD / WORDS_PER_MIN / 60  # noqa: E731

    print("## 2. Tải đọc — chi phí để chọn 1 trong 360\n")
    print(f"- Mỗi đề tài: median **{statistics.median(per):,.0f} ký tự** "
          f"(min {min(per):,} · max {max(per):,})")
    print(f"- Toàn bộ 4 cột nội dung: **{total:,} ký tự** ≈ {total/CHARS_PER_WORD:,.0f} từ "
          f"≈ **{hours(total):.1f} giờ** đọc liên tục ({WORDS_PER_MIN} từ/phút)")
    print(f"- Chỉ riêng cột `{COL_DESC}`: {desc_total:,} ký tự ≈ **{hours(desc_total):.1f} giờ**\n")

    # --- 3. chất lượng mô tả ---
    quant = [r for r in data if RE_QUANT.search(cell(r, COL_DESC))]
    goal = [r for r in data if RE_GOAL.search(cell(r, COL_DESC))]
    print("## 3. Chất lượng mô tả — có đủ để so sánh không?\n")
    print(f"- Có nêu **số liệu định lượng**: **{len(quant)}/{n} = {100*len(quant)/n:.1f}%**")
    print(f"- Có nêu mục tiêu/yêu cầu rõ: {len(goal)}/{n} = {100*len(goal)/n:.1f}%")
    print(f"- Có mục 'Thực trạng': "
          f"{sum(1 for r in data if 'Thực trạng' in cell(r, COL_DESC))}/{n}\n")
    print(f"> {100-100*len(quant)/n:.1f}% đề tài **không có con số nào** về độ lớn vấn đề. "
          f"Không có gì để quy đổi thành impact, nên không so sánh được đề nào đáng làm hơn.\n")

    # --- 4. độ khó phân biệt ---
    prefixes = collections.Counter(" ".join(cell(r, COL_NAME).split()[:3]).lower() for r in data)
    ai_agent = sum(c for k, c in prefixes.items() if k.startswith("ai agent"))
    print("## 4. Độ khó phân biệt giữa các đề\n")
    print(f"- Tên duy nhất: {len({cell(r, COL_NAME) for r in data})}/{n} (không trùng hẳn)")
    print(f"- Tên bắt đầu bằng `AI Agent` + động từ: **{ai_agent}/{n} = {100*ai_agent/n:.1f}%**")
    for k, c in prefixes.most_common(6):
        if c > 1:
            print(f"  - {c}× `{k}…`")
    print()

    # --- 5. ví dụ ---
    #
    # Chuẩn B đòi "≥5 ví dụ nguyên văn". Nhưng repo này public và catalog đề tài
    # không được lộ, nên bản in ra đây ĐÃ REDACT: chỉ mã đề + số đo, không tên,
    # không nội dung mô tả.
    #
    # Bản nguyên văn cho TA xem: chạy với --day-du, output ghi vào
    # `evidence/mining-vi-du.local.md` (đã gitignore, không đẩy lên git).
    full = "--day-du" in sys.argv
    samples = [data[0], data[1], data[120], data[121], data[300]]

    print("## 5. Năm ví dụ\n")
    if not full:
        print("> **Đã redact.** Catalog đề tài không được đẩy lên repo public, nên phần này")
        print("> chỉ nêu mã đề + số đo. Bản nguyên văn: `python evidence/mine-de-tai.py <xlsx>")
        print("> --day-du > evidence/mining-vi-du.local.md` (gitignore) — TA xem trực tiếp trên máy.\n")
        print("| Mã đề | Khối | Dài tên | Dài mô tả | Có số liệu? | Có mục tiêu? |")
        print("|---|---|---|---|:---:|:---:|")
        for r in samples:
            d = cell(r, COL_DESC)
            print(
                f"| `{cell(r, COL_CODE)}` | {cell(r, COL_BLOCK)} "
                f"| {len(cell(r, COL_NAME))} ký tự | {len(d):,} ký tự "
                f"| {'có' if RE_QUANT.search(d) else '**không**'} "
                f"| {'có' if RE_GOAL.search(d) else '**không**'} |"
            )
        print()
    else:
        print("> ⚠️ BẢN NGUYÊN VĂN — file này đã gitignore, KHÔNG commit.\n")
        for r in samples:
            desc = re.sub(r"\s+", " ", cell(r, COL_DESC))
            print(f"**[{cell(r, COL_CODE)}]** {cell(r, COL_BLOCK)}")
            print(f"- Tên: {cell(r, COL_NAME)}")
            print(f"- Mô tả ({len(cell(r, COL_DESC)):,} ký tự): {desc[:260]}…\n")


if __name__ == "__main__":
    main()
