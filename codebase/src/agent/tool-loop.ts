// Vòng lặp tool KHÔNG phụ thuộc SDK nào.
//
// Bản trước (`context-phase.ts`) khai kiểu thẳng bằng `Anthropic.MessageParam[]`
// nên chỉ Anthropic chạy được. Hệ quả thực tế: có key OpenAI mà cố vấn không dùng
// được tool nào — tức là tính năng chính không chạy. Nên tách ra:
//
//   - `ToolLoopMsg`  : định dạng hội thoại TRUNG LẬP (không theo SDK nào)
//   - `ToolChatFn`   : mỗi provider tự dịch sang định dạng của mình và gọi 1 lượt
//   - `runToolLoop()`: vòng lặp decide → execute → feed back, dùng chung
//
// Provider chỉ cần cài `ToolChatFn`. Lịch sử hội thoại do vòng lặp giữ ở dạng
// trung lập và dịch lại mỗi lượt, nên provider không phải giữ state — đây là chỗ
// bản Anthropic cũ dễ sai nhất (mất tool_use block là API 400 ở lượt sau).

import { runTool } from './tools';

/** Một lượt trong hội thoại, ở dạng trung lập. */
export type ToolLoopMsg =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string }
  /** Assistant xin gọi tool. `id` do provider sinh, phải khớp với tool_results. */
  | { role: 'tool_calls'; calls: { id: string; name: string; input: Record<string, unknown> }[] }
  /** Kết quả trả về cho từng `id` ở trên. Thiếu một cái là API báo lỗi. */
  | { role: 'tool_results'; results: { id: string; name: string; content: string }[] };

export interface ToolDef {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

/** Một lượt gọi model: trả text, hoặc yêu cầu gọi tool, hoặc cả hai. */
export type ToolChatFn = (args: {
  system: string;
  tools: ToolDef[];
  messages: ToolLoopMsg[];
}) => Promise<{
  text: string;
  calls: { id: string; name: string; input: Record<string, unknown> }[];
}>;

export interface ToolLoopResult {
  /** Text cuối cùng của model, sau khi nó thôi gọi tool. */
  text: string;
  /** Log từng lời gọi — để trace, và để UI hiện "đang tra catalog…". */
  calls: { name: string; input: Record<string, unknown>; result: unknown }[];
  /** Hội thoại đầy đủ (kể cả tool_calls/tool_results) để gọi tiếp lượt sau. */
  messages: ToolLoopMsg[];
  vong: number;
  /** true nếu chạm trần vòng lặp — câu trả lời có thể chưa xong. */
  het_vong: boolean;
}

/** Trần vòng lặp. Model có thể gọi tool mãi; không có trần là treo và cháy token. */
const MAX_VONG = 6;

export async function runToolLoop(args: {
  chat: ToolChatFn;
  system: string;
  tools: ToolDef[];
  messages: ToolLoopMsg[];
  /** Cho phép ghi đè trần, ví dụ lượt hội thoại dài cần nhiều tool hơn. */
  maxVong?: number;
}): Promise<ToolLoopResult> {
  const { chat, system, tools } = args;
  const max = args.maxVong ?? MAX_VONG;
  const messages: ToolLoopMsg[] = [...args.messages];
  const calls: ToolLoopResult['calls'] = [];
  let vong = 0;

  while (vong < max) {
    vong += 1;

    const res = await chat({ system, tools, messages });

    if (res.calls.length === 0) {
      // Model thôi gọi tool → đây là câu trả lời.
      messages.push({ role: 'assistant', text: res.text });
      return { text: res.text, calls, messages, vong, het_vong: false };
    }

    // Giữ nguyên lời xin gọi tool trong history. Bỏ nó đi thì lượt sau provider
    // không dựng lại được cặp call/result và API sẽ báo lỗi.
    if (res.text.trim()) messages.push({ role: 'assistant', text: res.text });
    messages.push({ role: 'tool_calls', calls: res.calls });

    // Chạy song song, nhưng gom TẤT CẢ kết quả vào MỘT lượt tool_results.
    const results = await Promise.all(
      res.calls.map(async (c) => {
        let result: unknown;
        try {
          result = await runTool(c.name, c.input);
        } catch (err) {
          // Tool lỗi vẫn PHẢI có tool_result. Thiếu một cái là vỡ cả lượt sau.
          result = { error: 'tool_loi', message: err instanceof Error ? err.message : String(err) };
        }
        calls.push({ name: c.name, input: c.input, result });
        return { id: c.id, name: c.name, content: JSON.stringify(result) };
      }),
    );

    messages.push({ role: 'tool_results', results });
  }

  // Chạm trần: trả về những gì có. Không throw — hội thoại vẫn tiếp được.
  return { text: '', calls, messages, vong, het_vong: true };
}

/**
 * Lấy giá trị từ KẾT QUẢ TOOL, không parse từ text của model.
 *
 * Text có thể nhắc một mã đề tài mà tool chưa từng xác nhận — đó đúng là chỗ lớp ①
 * (bịa nguồn sự thật) sinh ra. Chỉ tin cái tool trả về.
 */
export function ketQuaTool<T>(
  calls: ToolLoopResult['calls'],
  tenTool: string,
  lay: (result: unknown) => T | undefined,
): T | undefined {
  for (let i = calls.length - 1; i >= 0; i -= 1) {
    if (calls[i].name !== tenTool) continue;
    const v = lay(calls[i].result);
    if (v !== undefined) return v;
  }
  return undefined;
}
