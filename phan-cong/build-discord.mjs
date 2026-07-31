/**
 * Ghép 4 file phân công thành bản TỰ CHỨA để attach vào Discord.
 *
 *   node phan-cong/build-discord.mjs
 *
 * Mỗi file output = preamble dùng chung + nội dung phần đó + phần chặn đường.
 * Chạy lại sau khi sửa `N-*.md` để bản Discord không lệch bản trong repo.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, 'discord');
const REPO = 'https://github.com/huylq-at-work/Batch03-K3-AI-Product-Hackathon';

const PARTS = [
  { n: 1, slug: 'agent-core', file: '1-agent-core.md', ten: 'Agent core (stage ★)', diem: 'R2 15đ + R3 11đ = 26đ' },
  { n: 2, slug: 'eval-provider', file: '2-eval-provider.md', ten: 'Eval & provider', diem: 'R4 15đ' },
  { n: 3, slug: 'ui-demo', file: '3-ui-demo.md', ten: 'UI & demo', diem: 'R5 8đ + demo' },
  { n: 4, slug: 'evidence-validation', file: '4-evidence-validation.md', ten: 'Evidence & validation', diem: 'R1 15đ + R6 8đ = 23đ' },
];

const preamble = (p) => `> **File này là phần ${p.n}/4 của nhóm — ${p.ten}.**
> Bản tự chứa để đọc rời. Bản gốc + 3 phần còn lại: ${REPO}/tree/main/phan-cong

# Nhóm [XX] · Fathom — Phần ${p.n}: ${p.ten}

**Đề tài:** Xây dựng agent AI khảo sát 5-why thích ứng giúp học viên xác định painpoint
có căn cứ cho dự án. **Lát cắt build:** Fathom — khảo sát 5-why thích ứng.

Đọc trước khi bắt đầu: [\`spec.md\`](${REPO}/blob/main/spec.md) ·
[\`flow.html\`](${REPO}/blob/main/flow.html) (mở bằng browser, sơ đồ flow)

## Lấy code về

\`\`\`bash
git clone git@github.com:huylq-at-work/Batch03-K3-AI-Product-Hackathon.git
cd Batch03-K3-AI-Product-Hackathon/codebase
npm install
npm run dev          # http://localhost:5173 — chạy được KHÔNG cần API key
\`\`\`

Chưa có Node? \`winget install OpenJS.NodeJS.LTS\` rồi mở terminal mới.

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
${PARTS.map((x) => `| ${x.n}${x.n === p.n ? ' 👈' : ''} | ${x.ten} | ${x.diem} | \`_______\` |`).join('\n')}

## Luật chung

**Không sửa file ngoài vùng của mình** mà không nói trong Discord. Bốn vùng cố ý không
chồng nhau; chồng lên là ra conflict và mất dấu ai hiểu phần nào.

**Trước mỗi commit:**

\`\`\`bash
cd codebase
npm run typecheck    # phải sạch
npm run build        # phải xong
\`\`\`

**Sửa bất cứ thứ gì trong \`agent/\` hoặc \`llm/\` → chạy lại TRỌN BỘ golden set:**

\`\`\`bash
cd codebase
$env:LLM_PROVIDER="mock"; npm run eval <nhãn-lượt>     # PowerShell
LLM_PROVIDER=mock npm run eval <nhãn-lượt>             # bash
\`\`\`

Sửa prompt chỗ này vỡ chỗ kia là chuyện thường. Chạy lẻ vài case không tính.

**Không commit:** \`.env.local\` · \`node_modules/\` · \`dist/\` · **trace của phiên khảo
sát thật** (chứa nguyên văn lời người thật — xem README gốc mục Bảo mật).

**Quality bar đã chốt** trong \`spec.md\` §7 lúc 23:59 N1. Đo thấp thì ghi trung thực +
phân tích nguyên nhân. Rubric R4 nói rõ: *"chưa đạt mà phân tích được nguyên nhân vẫn
tính đủ điểm; số liệu bị chỉnh sửa sẽ không được tính."* **Đừng ai sửa bar.**

---
`;

const blockers = `
---

## 🔴 Hai thứ chặn đường CẢ NHÓM

Không ai làm thì cả 4 phần đều mất điểm, bất kể code đẹp cỡ nào.

**1. Hỏi TA tại CP1** — ai gặp TA trước thì hỏi, rồi báo lại Discord:
- Đề tài lấy bằng chứng từ khảo sát tự làm, **không** từ \`data/vlearn-pack/\`. Có khớp
  **hướng C** không, hay phải khai **hướng B**? (Đề bài nói hướng B *"không có data pack
  riêng — nhóm tự tìm kiếm và quan sát trực tiếp"* nên có thể khớp hơn.)
- R4 đòi *"≥10 case từ chatlog thật"*. Golden set nhóm dùng transcript phỏng vấn thật
  của nhóm. **Quy đổi được không?** — 4 điểm phụ thuộc câu này.
- Fork đang **public** và chứa nguyên \`data/vlearn-pack/\`. Nếu đây là repo nộp bài thì
  có vi phạm mục Bảo mật không?

**2. n = 9, chuẩn A đòi ≥20 người NGOÀI NHÓM.**
Trước hết xác nhận trong 9 người đã phỏng vấn **có ai là thành viên nhóm** — nếu có thì
n thật còn thấp hơn. Chia 4 người mỗi người 3 là xong. Đây là việc của phần 4 nhưng cả
nhóm nên đi thu.

## Trạng thái hiện tại

| Có rồi | Chưa có |
|---|---|
\`spec.md\` §1–§10 · \`flow.html\` · \`codebase/\` (typecheck + build sạch) · \`eval/\` 23 case + 2 lượt chạy | \`demo-slides.pdf\` · \`evidence/\` · \`validation/\` (rỗng) · \`reflection/\` mỗi người 1 file |

**Kết quả đo mới nhất** (\`eval/runs/\`): quality bar **CHƯA ĐẠT** — chiều 1 đạt 57,1%
(bar ≥70%). Chẩn đoán nguyên nhân đã có sẵn trong phần 1. Đây là trạng thái bình thường
ở giai đoạn này, không phải sự cố.

## R7 — 3 điểm cả nhóm cùng chịu

- [ ] \`README.md\` gốc: thành viên (mã HV + tên) + phân công có tên từng phần
- [ ] \`reflection/\` — **mỗi người 1 file**, chấm riêng, không ai làm hộ được
`;

mkdirSync(OUT, { recursive: true });

for (const p of PARTS) {
  // Bỏ 3 dòng header của file gốc (tiêu đề + người phụ trách + khối rubric)
  // vì preamble đã có, tránh lặp.
  const body = readFileSync(resolve(HERE, p.file), 'utf8')
    .split('\n')
    .slice(3)
    .join('\n')
    .replace(/^\s+/, '');

  const nguoi = '**Người phụ trách:** `___________`\n\n';
  const out = `${preamble(p)}\n${nguoi}${body}${blockers}`;
  const name = `PHAN-CONG-${p.n}-${p.slug}.md`;
  writeFileSync(resolve(OUT, name), out, 'utf8');
  console.log(`${name}  (${out.length.toLocaleString('vi-VN')} ký tự)`);
}

console.log(`\n→ ${OUT}`);
