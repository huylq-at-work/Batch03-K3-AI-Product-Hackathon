/**
 * Chạy trọn golden set và in bảng kết quả 4 chiều — spec.md §7.
 *
 *   npm run eval                    # provider Anthropic (cần ANTHROPIC_API_KEY)
 *   LLM_PROVIDER=mock npm run eval  # baseline rule-based, không cần key
 *
 * Bảng in ra dán thẳng vào spec.md §7 "Kết quả các lượt chạy".
 * In ĐỦ MỌI CASE kể cả fail — rubric R4: số liệu bị che giấu không được tính.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// eval/ là sibling của codebase/, nên đường dẫn tới src là ../codebase/src.
import { SYSTEM_PROMPT, buildUserPrompt } from '../codebase/src/agent/prompt';
import { isLeadingQuestion } from '../codebase/src/agent/engine';
import { createMockProvider } from '../codebase/src/llm/mock';
import { createAnthropicProvider } from '../codebase/src/llm/anthropic';
import { createOpenAiProvider } from '../codebase/src/llm/openai';
import { createGeminiProvider } from '../codebase/src/llm/gemini';
import type { LlmProvider } from '../codebase/src/llm/provider';
import type { SubAgent, TurnResult, WhyNode } from '../codebase/src/types';

const HERE = dirname(fileURLToPath(import.meta.url));

interface Expect {
  kind?: string;
  can_thiep_duoc?: boolean;
  mode_in?: string[];
  chain_incomplete?: boolean;
  numbers_min?: number;
  no_assumption?: boolean;
  assumption_required?: boolean;
  no_fabricated_market?: boolean;
  no_fabricated_node?: boolean;
  must_redirect_human?: boolean;
  must_flag_reach?: boolean;
  no_leading?: boolean;
}

interface Case {
  id: string;
  group: string;
  source?: string;
  note?: string;
  chain?: WhyNode[];
  answer: string;
  expect: Expect;
}

const AGENT: SubAgent = {
  id: 'eval',
  ownerId: 'eval',
  name: 'eval',
  topic: 'khó khăn khi xác định painpoint cho dự án',
  personaIn: 'Học viên khoá AI Thực Chiến chưa có domain nghề',
  visibility: 'private',
  createdAt: 0,
  maxTurns: 5,
  expiresAt: Number.MAX_SAFE_INTEGER, // eval không quan tâm hết hạn
};

/* ---- 4 chiều chất lượng, tất cả nhị phân (spec.md §7) ---- */

/** Chiều 1 — nhãn tầng đúng. Trả null nếu case không kiểm chiều này. */
function dim1(c: Case, r: TurnResult): boolean | null {
  if (c.expect.kind === undefined && c.expect.can_thiep_duoc === undefined) return null;
  if (!r.node) return false;
  if (c.expect.kind !== undefined && r.node.kind !== c.expect.kind) return false;
  if (c.expect.can_thiep_duoc !== undefined && r.node.can_thiep_duoc !== c.expect.can_thiep_duoc) {
    return false;
  }
  return true;
}

/** Chiều 2 — không mớm đáp án. Điều kiện cứng, mọi case đều tính. */
function dim2(r: TurnResult): boolean {
  if (!r.next_question.trim()) return true;
  if (isLeadingQuestion(r.next_question)) return false;
  return (r.next_question.match(/\?/g) ?? []).length <= 1;
}

/**
 * Chiều 3 — điều kiện dừng đúng.
 *
 * Hai bất biến, cả hai đều bắt buộc:
 *   (a) tới nguyên nhân can thiệp được  => PHẢI stop
 *   (b) stop mà CHƯA tới gốc            => PHẢI khai chain_incomplete
 *
 * (b) là lỗ mình bỏ sót ở lượt chạy đầu: model dừng sớm, không khai
 * chain_incomplete, mà vẫn được tính đạt. Đó đúng là kiểu "dừng cho xong"
 * mà điều kiện dừng của spec tồn tại để chặn.
 */
function dim3(c: Case, r: TurnResult): boolean | null {
  const checksMode = c.expect.mode_in !== undefined;
  const checksIncomplete = c.expect.chain_incomplete !== undefined;
  const reachedRoot = r.node?.can_thiep_duoc === true;
  const stoppedShort = r.mode === 'stop' && !reachedRoot && !r.chain_incomplete;

  if (!checksMode && !checksIncomplete && !reachedRoot && r.mode !== 'stop') return null;

  if (checksMode && !c.expect.mode_in!.includes(r.mode)) return false;
  if (checksIncomplete && r.chain_incomplete !== c.expect.chain_incomplete) return false;
  if (reachedRoot && r.mode !== 'stop') return false; // (a)
  if (stoppedShort) return false; // (b)
  return true;
}

/** Chiều 4 — không sinh số thiếu nguồn, không bịa nội dung. Điều kiện cứng. */
const MARKET_WORDS =
  /(typeform|google form|notion|miro|dovetail|maze|airtable|thị trường|market size|đối thủ|competitor)/i;

function dim4(c: Case, r: TurnResult): boolean {
  // Mọi con số phải xuất hiện nguyên văn (theo chữ số) trong câu trả lời.
  const answerDigits = c.answer.replace(/\D/g, '');
  for (const n of r.numbers) {
    const d = n.text.replace(/\D/g, '');
    if (d && !answerDigits.includes(d)) return false;
  }
  if (c.expect.numbers_min !== undefined && r.numbers.length < c.expect.numbers_min) return false;
  if (c.expect.no_assumption && r.numbers.some((n) => n.nguon === 'ASSUMPTION')) return false;
  if (c.expect.assumption_required && !r.numbers.some((n) => n.nguon === 'ASSUMPTION')) return false;

  const spoken = `${r.next_question} ${r.message} ${r.node?.reason ?? ''}`;

  if (c.expect.no_fabricated_market && MARKET_WORDS.test(spoken)) return false;
  // Rác vào thì không được ra một tầng "đã tới gốc".
  if (c.expect.no_fabricated_node && r.node?.can_thiep_duoc) return false;
  if (c.expect.must_redirect_human && !/(\bTA\b|trợ giảng|ban tổ chức|giảng viên)/i.test(spoken)) {
    return false;
  }
  if (c.expect.must_flag_reach && !/(cá nhân|một người|riêng bạn|chưa đáng)/i.test(r.message)) {
    return false;
  }
  return true;
}

/* ---- provider (Node, đọc process.env — KHÔNG dùng tiền tố VITE_) ---- */

function requireKey(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu biến môi trường ${name}`);
  return v;
}

function pickProvider(which: string): LlmProvider {
  switch (which) {
    case 'mock':
      return createMockProvider();
    case 'anthropic':
      return createAnthropicProvider(
        requireKey('ANTHROPIC_API_KEY'),
        process.env.ANTHROPIC_MODEL ?? 'claude-opus-5',
      );
    case 'openai':
      return createOpenAiProvider(
        requireKey('OPENAI_API_KEY'),
        process.env.OPENAI_MODEL ?? 'gpt-4o',
        process.env.OPENAI_BASE_URL || undefined,
      );
    case 'gemini':
      return createGeminiProvider(
        requireKey('GEMINI_API_KEY'),
        process.env.GEMINI_MODEL ?? 'gemini-3.5-flash',
      );
    default:
      throw new Error(`Provider không rõ: ${which} (mock|anthropic|openai|gemini)`);
  }
}

async function main(): Promise<void> {
  const which = (process.env.LLM_PROVIDER ?? 'anthropic').toLowerCase();
  const label = process.argv[2] ?? 'run';
  const { cases } = JSON.parse(
    readFileSync(resolve(HERE, 'golden-set.json'), 'utf8'),
  ) as { cases: Case[] };

  console.log(`Provider: ${which} · ${cases.length} case\n`);

  const rows: string[] = [
    '| # | case | nhóm | C1 nhãn | C2 mớm | C3 dừng | C4 nguồn | mode | ghi chú |',
    '|---|---|---|:---:|:---:|:---:|:---:|---|---|',
  ];
  const tally: Record<'d1' | 'd2' | 'd3' | 'd4', [number, number]> = {
    d1: [0, 0],
    d2: [0, 0],
    d3: [0, 0],
    d4: [0, 0],
  };

  const mark = (v: boolean | null, slot: [number, number]): string => {
    if (v === null) return '–';
    slot[1] += 1;
    if (v) slot[0] += 1;
    return v ? '✓' : '✗';
  };

  const provider = pickProvider(which);
  console.log(`Model: ${provider.label}\n`);

  const raw: {
    id: string;
    dims: { c1: boolean | null; c2: boolean; c3: boolean | null; c4: boolean };
    expect: Expect;
    got: TurnResult | { error: string };
  }[] = [];

  for (let i = 0; i < cases.length; i += 1) {
    const c = cases[i];
    const user = buildUserPrompt({
      agent: AGENT,
      chain: c.chain ?? [],
      lastQuestion: 'Vì sao lại như vậy?',
      lastAnswer: c.answer,
    });

    let r: TurnResult | null = null;
    let err = '';
    try {
      r = await provider.complete(SYSTEM_PROMPT, user);
    } catch (e) {
      err = e instanceof Error ? e.message : String(e);
    }

    if (!r) {
      // Lỗi tính là fail ở cả 4 chiều — không được im lặng bỏ qua.
      rows.push(`| ${i + 1} | \`${c.id}\` | ${c.group} | ✗ | ✗ | ✗ | ✗ | LỖI | ${err} |`);
      for (const k of ['d1', 'd2', 'd3', 'd4'] as const) tally[k][1] += 1;
      raw.push({
        id: c.id,
        dims: { c1: false, c2: false, c3: false, c4: false },
        expect: c.expect,
        got: { error: err },
      });
      console.log(`${i + 1}/${cases.length} ${c.id} → LỖI: ${err}`);
      continue;
    }

    const d = { c1: dim1(c, r), c2: dim2(r), c3: dim3(c, r), c4: dim4(c, r) };
    raw.push({ id: c.id, dims: d, expect: c.expect, got: r });

    rows.push(
      `| ${i + 1} | \`${c.id}\` | ${c.group} ` +
        `| ${mark(d.c1, tally.d1)} | ${mark(d.c2, tally.d2)} ` +
        `| ${mark(d.c3, tally.d3)} | ${mark(d.c4, tally.d4)} ` +
        `| ${r.mode} | ${(c.note ?? '').slice(0, 70)} |`,
    );
    console.log(`${i + 1}/${cases.length} ${c.id} → ${r.mode}`);
  }

  const rate = (s: [number, number]) => (s[1] === 0 ? 0 : (100 * s[0]) / s[1]);
  const show = (s: [number, number]) =>
    s[1] === 0 ? '—' : `${rate(s).toFixed(1)}% (${s[0]}/${s[1]})`;

  const hard2 = tally.d2[0] === tally.d2[1];
  const hard4 = tally.d4[0] === tally.d4[1];
  const pass = rate(tally.d1) >= 70 && hard2 && hard4;

  const out = [
    `# Kết quả golden set — \`${provider.label}\` — lượt \`${label}\``,
    '',
    `Provider: \`${which}\` · số case: ${cases.length} · AI thật: ${provider.isReal ? 'có' : 'KHÔNG (rule-based)'}`,
    '',
    ...rows,
    '',
    '## Tổng',
    '',
    '| Chiều | Kết quả | Ngưỡng | Đạt |',
    '|---|---|---|:---:|',
    `| 1 · nhãn tầng đúng | ${show(tally.d1)} | ≥70% | ${rate(tally.d1) >= 70 ? '✓' : '✗'} |`,
    `| 2 · không mớm đáp án | ${show(tally.d2)} | **100% (cứng)** | ${hard2 ? '✓' : '✗'} |`,
    `| 3 · điều kiện dừng đúng | ${show(tally.d3)} | theo dõi | – |`,
    `| 4 · không sinh số thiếu nguồn | ${show(tally.d4)} | **100% (cứng)** | ${hard4 ? '✓' : '✗'} |`,
    '',
    `## Đối chiếu quality bar: **${pass ? 'ĐẠT' : 'CHƯA ĐẠT'}**`,
    '',
    pass
      ? 'Cả ba điều kiện của quality bar đều thoả.'
      : 'Chưa đạt. Phân tích nguyên nhân từng case ✗ ở bảng trên rồi sửa **prompt** — ' +
        'KHÔNG sửa quality bar (đã chốt 23:59 N1; rubric R4 nói rõ số liệu bị chỉnh sửa ' +
        'sẽ không được tính, còn chưa đạt mà phân tích được nguyên nhân vẫn tính đủ điểm).',
    '',
  ].join('\n');

  mkdirSync(resolve(HERE, 'runs'), { recursive: true });
  const file = resolve(HERE, 'runs', `${which}-${label}.md`);
  writeFileSync(file, out, 'utf8');
  // Dump raw để chẩn đoán được từng case fail — guide §2.6 bước 1:
  // "bắt đầu từ output thật", không phải từ tiêu chí trừu tượng.
  const rawFile = resolve(HERE, 'runs', `${which}-${label}.json`);
  writeFileSync(rawFile, JSON.stringify(raw, null, 2), 'utf8');
  console.log(`\n${out}\n→ ${file}\n→ ${rawFile}`);
}

void main();
