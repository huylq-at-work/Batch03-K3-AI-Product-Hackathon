"""
Chuyển `Danh_sach_de_tai.xlsx` thành JSON plaintext để bước sau mã hoá.

    python evidence/xlsx-to-json.py <đường-dẫn-Danh_sach_de_tai.xlsx>
    DE_TAI_KEY=<pass> node evidence/encrypt-de-tai.mjs

Sinh ra: codebase/src/data/de-tai.json   ← PLAINTEXT, gitignore, KHÔNG commit

Toàn bộ trường — kể cả **tên đề tài** — đều đi vào file mã hoá. Trước đây mình
tách một file "index" plaintext (mã + khối + tên) cho tiện filter, nhưng 360 tên
đề tài chính là data đề tài, nên không tách nữa: repo chỉ chứa ciphertext.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import openpyxl

SHEET = "Danh Sach De Tai"
REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "codebase" / "src" / "data" / "de-tai.json"


def clean(v: object) -> str:
    return re.sub(r"[ \t]+", " ", str(v or "").strip())


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(f"Dùng: python {sys.argv[0]} <đường-dẫn-Danh_sach_de_tai.xlsx>")
    sys.stdout.reconfigure(encoding="utf-8")

    ws = openpyxl.load_workbook(sys.argv[1], data_only=True)[SHEET]
    rows = list(ws.iter_rows(values_only=True))
    h = {name: i for i, name in enumerate(rows[0])}
    col_out = list(h)[6]  # 'Yêu cầu đầu ra (Cơ bản + Nâng cao) - gợi'

    data = [
        {
            "ma": clean(r[h["Mã Đề"]]),
            "khoi": clean(r[h["Khối"]]),
            "ten": clean(r[h["Tên Đề Tài"]]),
            "mo_ta": clean(r[h["Mô Tả Bài Toán"]]),
            "tech": clean(r[h["Tech stack gợi ý"]]),
            "dau_ra": clean(r[h[col_out]]),
            "max_team": clean(r[h["Max team / đề tài"]]),
        }
        for r in rows[1:]
        if r[0] is not None
    ]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=0), encoding="utf-8")
    print(f"{OUT.relative_to(REPO)}  {OUT.stat().st_size / 1024:,.0f} KB  ({len(data)} đề tài)")
    print(f"\n{len({x['khoi'] for x in data})} khối")
    print("\n⚠️  File này là PLAINTEXT và đã gitignore. Bước tiếp:")
    print("    DE_TAI_KEY=<passphrase> node evidence/encrypt-de-tai.mjs")


if __name__ == "__main__":
    main()
