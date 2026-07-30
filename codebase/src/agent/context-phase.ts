// Pha 1 — CHUẨN BỊ NGỮ CẢNH: vòng lặp tool để agent biết sinh viên đang xét đề nào.
//
// Chạy MỘT LẦN ở đầu phiên, KHÔNG chạy mỗi lượt hội thoại. Hai lý do (chi tiết
// trong tools.ts): giữ nguyên giá trị của golden set, và tra catalog 1 lần ≈ 2K
// token thay vì 12K.
//
// Vòng lặp tool là mô hình Lab04 đã dùng (`agent.py`): decide → execute → feed
// result back → lặp tới khi model không gọi tool nữa. Bốn chỗ dễ sai, đều xử lý
// tường minh ở dưới:
//   1. PHẢI append cả `response.content` vào history, không chỉ text — mất
//      tool_use block là API trả 400 ở lượt sau.
//   2. Mọi `tool_use` phải có đúng một `tool_result` khớp `tool_use_id`.
//   3. Tất cả tool_result của một lượt đi trong MỘT user message.
//   4. Phải có trần vòng lặp. Model có thể gọi tool mãi.

import Anthropic from '@anthropic-ai/sdk';
import { CATALOG_TOOLS, CONTEXT_SYSTEM_PROMPT, deTaiToolsDisabled, runTool } from './tools';

const MAX_VONG = 6;

export interface ContextResult {
  /** Tóm tắt 2 câu của agent — đưa vào prompt pha 2 làm ngữ cảnh. */
  summary: string;
  /** Mã đề tài chốt được, '' nếu sinh viên chưa chọn. */
  ma_de_tai: string;
  /** Log từng lời gọi tool — để trace và để UI hiện "đang tra catalog…". */
  calls: { name: string; input: unknown; result: unknown }[];
  vong: number;
  /** true nếu chạm trần vòng lặp — ngữ cảnh có thể chưa xong. */
  het_vong: boolean;
  /** true nếu pha 1 bị tắt bằng VITE_DISABLE_DE_TAI_TOOLS. */
  da_tat: boolean;
}

/**
 * `messages` cho phép gọi nhiều lượt: lần đầu truyền lời sinh viên, các lần sau
 * truyền cả history để họ trả lời tiếp câu agent hỏi.
 */
export async function runContextPhase(
  client: Anthropic,
  model: string,
  messages: Anthropic.MessageParam[],
): Promise<ContextResult> {
  // Tầng 2 — cờ tắt: return NGAY, không gọi API. Bỏ pha 1 là bỏ luôn 1–3 request.
  if (deTaiToolsDisabled()) {
    return { summary: '', ma_de_tai: '', calls: [], vong: 0, het_vong: false, da_tat: true };
  }

  const history: Anthropic.MessageParam[] = [...messages];
  const calls: ContextResult['calls'] = [];
  let vong = 0;

  while (vong < MAX_VONG) {
    vong += 1;

    const res = await client.messages.create({
      model,
      max_tokens: 2048,
      system: CONTEXT_SYSTEM_PROMPT,
      // effort low: pha này là tra cứu, không phải suy luận sâu.
      output_config: { effort: 'low' },
      tools: CATALOG_TOOLS as unknown as Anthropic.Tool[],
      messages: history,
    });

    if (res.stop_reason === 'refusal') {
      throw new Error(`Model từ chối (${res.stop_details?.category ?? '?'}).`);
    }

    // (1) append CẢ content — giữ tool_use block, nếu không lượt sau API trả 400.
    history.push({ role: 'assistant', content: res.content });

    const toolUses = res.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );

    if (toolUses.length === 0) {
      // Model không gọi tool nữa → đây là tóm tắt ngữ cảnh.
      const summary = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();
      return { summary, ma_de_tai: rutMaDeTai(calls), calls, vong, het_vong: false, da_tat: false };
    }

    // (2)(3) chạy song song, gom TẤT CẢ tool_result vào MỘT user message.
    const results = await Promise.all(
      toolUses.map(async (tu) => {
        const input = (tu.input ?? {}) as Record<string, unknown>;
        let result: unknown;
        try {
          result = await runTool(tu.name, input);
        } catch (err) {
          // Tool lỗi vẫn phải trả tool_result — thiếu một cái là API 400.
          result = { error: 'tool_loi', message: err instanceof Error ? err.message : String(err) };
        }
        calls.push({ name: tu.name, input, result });
        return {
          type: 'tool_result' as const,
          tool_use_id: tu.id,
          content: JSON.stringify(result),
          is_error: typeof result === 'object' && result !== null && 'error' in result,
        };
      }),
    );

    history.push({ role: 'user', content: results });
  }

  // (4) chạm trần: trả về những gì có, đánh dấu chưa xong. Không throw — pha 2
  // vẫn chạy được mà không cần ngữ cảnh đề tài.
  return {
    summary: '',
    ma_de_tai: rutMaDeTai(calls),
    calls,
    vong,
    het_vong: true,
    da_tat: false,
  };
}

/**
 * Mã đề tài lấy từ **kết quả tool**, không parse từ text của model — text có thể
 * nhắc mã mà tool chưa xác nhận, và đó đúng là chỗ lớp ① sinh ra.
 */
function rutMaDeTai(calls: ContextResult['calls']): string {
  for (let i = calls.length - 1; i >= 0; i -= 1) {
    const c = calls[i];
    if (c.name !== 'xem_de_tai') continue;
    const r = c.result as { found?: { ma?: string } };
    if (r?.found?.ma) return r.found.ma;
  }
  return '';
}
