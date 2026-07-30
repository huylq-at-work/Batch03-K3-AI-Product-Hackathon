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
  onToken?: (mau: string) => void,
): Promise<{ result: TurnResult; violations: string[] }> {
  const user = buildUserPrompt(input);
  const started = Date.now();
  let raw = '';
  let result: TurnResult | null = null;

  try {
    result = await provider.complete(SYSTEM_PROMPT, user, onToken);

    // #3 — RETRY khi BỎ CUỘC SỚM: stop ở một tầng `trieu_chung` mà vẫn còn dư tầng.
    // trieu_chung theo định nghĩa là "chưa nói vì sao" → KHÔNG phải điểm dừng hợp lệ;
    // phải đào tiếp "vì sao [claim]?". gpt-4o-mini hay tự stop+chain_incomplete ở một
    // triệu chứng nông (vd trả lời "vì tôi chưa cancel subscription" → dừng, bỏ lỡ
    // painpoint thật ở tầng sau). Chỉ chặn khi CÒN tầng (level < maxTurns) và đúng là
    // triệu chứng — `dieu_kien` (ngõ cụt) hoặc đã đủ tầng vẫn được dừng bình thường.
    // Ép bằng code chứ không nhồi prompt (prompt dài phản tác dụng với model yếu).
    const nodeLevel = input.chain.length + 1;
    if (
      result.mode === 'stop' &&
      result.node &&
      result.node.kind === 'trieu_chung' &&
      !result.node.can_thiep_duoc &&
      nodeLevel < input.agent.maxTurns
    ) {
      result = await provider.complete(
        SYSTEM_PROMPT,
        `${user}\n\n[NHẮC] Bạn vừa gán tầng này là "trieu_chung" — biểu hiện bề mặt, ` +
          'CHƯA nói vì sao — mà lại dừng. SAI: triệu chứng không phải điểm dừng, và còn ' +
          'dư tầng để đào. BẮT BUỘC đào tiếp, KHÔNG stop, KHÔNG chain_incomplete. Trả về ' +
          'mode = "label", GIỮ nguyên node vừa gán, đặt next_question là MỘT câu hỏi đào tiếp ' +
          `bám lời họ ("${result.node.claim}") — hỏi "vì sao" nếu còn nguyên nhân sâu hơn, ` +
          'HOẶC hỏi tác động/mong muốn nếu đó đã là sự thật trung tính. Đừng hỏi "vì sao" một ' +
          'sự thật không có nguyên nhân.',
      );
    }

    // #1 — RETRY khi mode cần câu hỏi mà next_question rỗng. Đây là lỗi làm khảo
    // sát tắc giữa chừng (gpt-4o-mini qua structured output đôi khi để rỗng). Thử
    // lại MỘT lần với lời nhắc; không stream lần retry để khỏi nhân đôi chữ đã hiện.
    // Đặt SAU #3 để nếu #3 trả về ask/label mà quên câu hỏi thì vẫn được vá.
    if ((result.mode === 'ask' || result.mode === 'label') && !result.next_question.trim()) {
      result = await provider.complete(
        SYSTEM_PROMPT,
        `${user}\n\n[NHẮC] Lần trước bạn để next_question RỖNG. Với mode = ask hoặc label, ` +
          'BẮT BUỘC có đúng một câu hỏi mở trong next_question. Đặt câu hỏi ngay.',
      );
    }
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
