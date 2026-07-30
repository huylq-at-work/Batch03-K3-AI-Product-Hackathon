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

/** Stage ★ — output ràng buộc theo TURN_SCHEMA. `normalize` vẫn ép bất biến của spec. */
export async function lcComplete(
  model: BaseChatModel,
  system: string,
  user: string,
): Promise<TurnResult> {
  const structured = model.withStructuredOutput(TURN_SCHEMA as Record<string, unknown>, {
    name: 'turn',
  });
  const res = await structured.invoke([new SystemMessage(system), new HumanMessage(user)]);
  return normalize(res);
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

  // bindTools nhận cả dạng {name, description, schema}; LangChain lo format cho SDK.
  const bound = tools.length
    ? model.bindTools!(
        tools.map((t) => ({ name: t.name, description: t.description, schema: t.input_schema })),
        force ? { tool_choice: force } : {},
      )
    : model;

  const lcMsgs = sangLc(system, messages);

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
}
