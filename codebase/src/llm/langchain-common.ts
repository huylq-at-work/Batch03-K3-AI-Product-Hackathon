// Lõi LangChain dùng chung cho MỌI provider.
//
// Đây là cái LangChain cho sẵn mà bản tự-gọi-API phải viết tay từng SDK:
//   - message THỐNG NHẤT (SystemMessage/HumanMessage/AIMessage/ToolMessage) —
//     không còn dịch tool_use-block (Anthropic) ↔ tool_calls-field (OpenAI) ở hai
//     hàm riêng như tool-loop cũ.
//   - `withStructuredOutput(schema)` — cấu trúc hoá output theo TURN_SCHEMA, thay
//     cho tự ghép json_schema + extractJson + retry.
//   - `bindTools(tools, {tool_choice})` — tool calling + ép gọi tool, thay cho tự
//     format tool cho từng SDK.
//   - `.stream()` — streaming token, gộp chunk bằng `.concat()`.
//
// Provider chỉ còn việc tạo đúng ChatModel (khoá + model + cờ browser); hành vi
// complete/toolChat dùng chung ở đây.

import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type BaseMessage,
} from '@langchain/core/messages';
import { TURN_SCHEMA } from '../agent/schema';
import { normalize } from './provider';
import type { ToolDef, ToolLoopMsg } from '../agent/tool-loop';
import type { TurnResult } from '../types';

/**
 * Stage ★ — output ràng buộc theo TURN_SCHEMA. `normalize` vẫn ép bất biến của spec.
 *
 * Có `onToken` → streaming: `withStructuredOutput().stream()` yield object đang lớn
 * dần; ta phát phần MỚI của `next_question` cho khảo sát chạy chữ. Không có onToken
 * → invoke một phát (đường eval/mock đi lối này).
 */
export async function lcComplete(
  model: BaseChatModel,
  system: string,
  user: string,
  onToken?: (mau: string) => void,
): Promise<TurnResult> {
  // method='jsonMode': response_format=json_object, KHÔNG dùng json_schema (DeepSeek
  // 400 "response_format type unavailable") và KHÔNG ép tool_choice (model thinking
  // như deepseek-v4-flash 400 "Thinking mode does not support this tool_choice").
  // json_object là mẫu số chung: OpenAI, DeepSeek (kể cả thinking) đều hỗ trợ. Schema
  // được truyền qua prompt + `normalize` ép bất biến, nên không cần json_schema.
  const structured = model.withStructuredOutput(TURN_SCHEMA as Record<string, unknown>, {
    name: 'turn',
    method: 'jsonMode',
  });
  // json_object BẮT BUỘC chữ "json" xuất hiện trong prompt (OpenAI & DeepSeek đều
  // 400 nếu thiếu). Thêm chỉ thị định dạng ở cuối system cho mọi provider.
  const systemJson =
    `${system}\n\n# Định dạng đầu ra\nTrả về DUY NHẤT một đối tượng JSON hợp lệ với đúng ` +
    'các trường: mode, next_question, node, numbers, message, chain_incomplete. Không kèm chữ nào ngoài JSON.';
  const msgs = [new SystemMessage(systemJson), new HumanMessage(user)];

  if (!onToken) return normalize(await structured.invoke(msgs));

  let last: unknown = {};
  let daPhat = ''; // phần next_question đã phát, để chỉ gửi mẩu MỚI
  const stream = await structured.stream(msgs);
  for await (const chunk of stream) {
    last = chunk;
    const nq = String((chunk as { next_question?: string })?.next_question ?? '');
    // Object lớn dần: nq mở rộng daPhat → phát phần thêm. Nếu đổi khác hẳn (hiếm),
    // cập nhật mốc mà không phát lại (tránh nhân đôi).
    if (nq.length > daPhat.length && nq.startsWith(daPhat)) {
      onToken(nq.slice(daPhat.length));
      daPhat = nq;
    } else if (nq && nq !== daPhat) {
      daPhat = nq;
    }
  }
  return normalize(last);
}

/** ToolLoopMsg (trung lập) → message LangChain. Một hàm cho mọi provider. */
function sangLc(system: string, messages: ToolLoopMsg[]): BaseMessage[] {
  const out: BaseMessage[] = [new SystemMessage(system)];
  for (const m of messages) {
    if (m.role === 'user') out.push(new HumanMessage(m.text));
    else if (m.role === 'assistant') out.push(new AIMessage(m.text));
    else if (m.role === 'tool_calls') {
      out.push(
        new AIMessage({
          content: '',
          tool_calls: m.calls.map((c) => ({ id: c.id, name: c.name, args: c.input })),
        }),
      );
    } else {
      // mỗi tool_result → một ToolMessage; LangChain tự xếp đúng cho từng SDK.
      for (const r of m.results) {
        out.push(new ToolMessage({ tool_call_id: r.id, content: r.content }));
      }
    }
  }
  return out;
}

/** Text của một message LangChain (content có thể là string hoặc mảng block). */
function layText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((b) => (typeof b === 'string' ? b : ((b as { text?: string })?.text ?? '')))
      .join('');
  }
  return '';
}

type Calls = { id: string; name: string; input: Record<string, unknown> }[];

function layCalls(msg: AIMessage | AIMessageChunk): Calls {
  return (msg.tool_calls ?? []).map((c) => ({
    id: c.id ?? '',
    name: c.name,
    input: (c.args ?? {}) as Record<string, unknown>,
  }));
}

/** Một lượt hội thoại CÓ TOOL. `force` = ép gọi tool; `onToken` = streaming. */
export async function lcToolChat(
  model: BaseChatModel,
  args: {
    system: string;
    tools: ToolDef[];
    messages: ToolLoopMsg[];
    force?: string;
    onToken?: (mau: string) => void;
  },
): Promise<{ text: string; calls: Calls }> {
  const { system, tools, messages, force, onToken } = args;
  const lcMsgs = sangLc(system, messages);

  // bindTools nhận cả dạng {name, description, schema}; LangChain lo format cho SDK.
  // `dungForce` = có ép tool_choice không. Model thinking (deepseek-v4-flash) trả 400
  // "Thinking mode does not support this tool_choice" khi ép → ta thử lại KHÔNG ép.
  const build = (dungForce: boolean) =>
    tools.length
      ? model.bindTools!(
          tools.map((t) => ({ name: t.name, description: t.description, schema: t.input_schema })),
          dungForce && force ? { tool_choice: force } : {},
        )
      : model;

  const chay = async (dungForce: boolean) => {
    const bound = build(dungForce);
    if (onToken) {
      const stream = await bound.stream(lcMsgs);
      let gom: AIMessageChunk | undefined;
      let text = '';
      for await (const chunk of stream) {
        gom = gom ? gom.concat(chunk) : chunk;
        const mau = layText(chunk.content);
        if (mau) {
          text += mau;
          onToken(mau);
        }
      }
      return { text, calls: gom ? layCalls(gom) : [] };
    }
    const res = (await bound.invoke(lcMsgs)) as AIMessage;
    return { text: layText(res.content), calls: layCalls(res) };
  };

  if (!force) return chay(false);
  try {
    return await chay(true);
  } catch (e) {
    // Model không nhận forced tool_choice (thinking model) → degrade: bỏ ép, để model
    // tự chọn tool. Chỉ nuốt đúng lỗi tool_choice; lỗi khác thì ném tiếp.
    const msg = e instanceof Error ? e.message : String(e);
    if (/tool_choice/i.test(msg)) return chay(false);
    throw e;
  }
}
