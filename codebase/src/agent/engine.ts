import { buildUserPrompt, SYSTEM_PROMPT, type TurnInput } from './prompt';
import { pushTrace, type LlmProvider } from '../llm';
import type { TurnResult } from '../types';

/** Câu hỏi mớm đáp án — điều kiện cứng trong quality bar (spec.md §7 chiều 2). */
const LEADING = [
  /\bcó phải\b[\s\S]*\bkhông\b/i,
  /\bđúng không\b/i,
  /\bphải không\b/i,
  /\bcó\b[\s\S]*\bkhông\?/i, // câu hỏi yes/no đóng
  /\bbạn (đồng ý|thấy đúng)\b/i,
];

export function isLeadingQuestion(q: string): boolean {
  return LEADING.some((re) => re.test(q));
}

/**
 * Chạy MỘT lượt của stage ★.
 *
 * Lỗi cứng (mớm đáp án) bị chặn ở đây, không phải bị bỏ qua — nếu để lọt,
 * agent sẽ làm nhiễu chính dữ liệu người dùng đang đi thu (spec.md §5 #11).
 */
export async function runTurn(
  provider: LlmProvider,
  input: TurnInput,
): Promise<{ result: TurnResult; violations: string[] }> {
  const user = buildUserPrompt(input);
  const started = Date.now();
  let raw = '';
  let result: TurnResult | null = null;

  try {
    result = await provider.complete(SYSTEM_PROMPT, user);
    raw = JSON.stringify(result);
  } catch (err) {
    pushTrace({
      at: started,
      provider: provider.label,
      isReal: provider.isReal,
      system: SYSTEM_PROMPT,
      user,
      raw,
      parsed: null,
      error: err instanceof Error ? err.message : String(err),
      ms: Date.now() - started,
    });
    throw err;
  }

  pushTrace({
    at: started,
    provider: provider.label,
    isReal: provider.isReal,
    system: SYSTEM_PROMPT,
    user,
    raw,
    parsed: result,
    error: '',
    ms: Date.now() - started,
  });

  const violations: string[] = [];

  if (result.mode === 'ask' || result.mode === 'label') {
    if (!result.next_question.trim()) {
      violations.push('mode cần câu hỏi nhưng next_question rỗng');
    } else if (isLeadingQuestion(result.next_question)) {
      violations.push(`câu hỏi mớm đáp án: "${result.next_question}"`);
    }
    // Đếm câu hỏi — luật cứng "đúng MỘT câu".
    const questionMarks = (result.next_question.match(/\?/g) ?? []).length;
    if (questionMarks > 1) violations.push('nhiều hơn một câu hỏi trong một lượt');
  }

  if (result.node && result.node.can_thiep_duoc && result.node.kind !== 'nguyen_nhan') {
    violations.push('can_thiep_duoc = true nhưng kind != nguyen_nhan');
  }

  // Điều kiện dừng: tới gốc thì phải stop, không được hỏi thêm cho đủ tầng.
  if (result.node?.can_thiep_duoc && result.mode !== 'stop') {
    violations.push('đã tới nguyên nhân can thiệp được nhưng không dừng');
  }

  return { result, violations };
}
