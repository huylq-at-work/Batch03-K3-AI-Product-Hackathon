import Anthropic from '@anthropic-ai/sdk';
import { TURN_SCHEMA } from '../agent/schema';
import type { ToolDef, ToolLoopMsg } from '../agent/tool-loop';
import { extractJson, normalize, type LlmProvider } from './provider';
import type { TurnResult } from '../types';

/**
 * ⚠️ CẢNH BÁO BẢO MẬT — đọc trước khi deploy.
 *
 * `dangerouslyAllowBrowser: true` cho SDK chạy trong browser. Nghĩa là API key
 * bị nhúng vào bundle JS và AI AI MỞ DEVTOOLS CŨNG ĐỌC ĐƯỢC.
 *
 * Chấp nhận được: chạy local (`npm run dev`) trong thời gian hackathon.
 * KHÔNG chấp nhận được: deploy lên Vercel/Netlify/GitHub Pages.
 * Muốn deploy thì phải có backend proxy giữ key server-side.
 *
 * Đề bài không yêu cầu deploy (`01-de-bai.md` ràng buộc 1), nên bản này
 * cố tình chỉ chạy local.
 */
export function createAnthropicProvider(apiKey: string, model: string): LlmProvider {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  return {
    label: `Anthropic ${model}`,
    isReal: true,
    toolChat: ({ system, tools, messages, force }) =>
      anthropicToolChat(client, model, system, tools, messages, force),
    async complete(system: string, user: string): Promise<TurnResult> {
      const response = await client.messages.create({
        model,
        max_tokens: 4096,
        system,
        // Thinking bật mặc định trên Opus 5 và max_tokens tính cả thinking.
        // effort "low" giữ độ trễ hội thoại ở mức chấp nhận được mà không
        // phải tắt thinking (tắt thinking trên Opus 5 có failure mode riêng).
        output_config: {
          effort: 'low',
          format: { type: 'json_schema', schema: TURN_SCHEMA as never },
        },
        messages: [{ role: 'user', content: user }],
      });

      if (response.stop_reason === 'refusal') {
        throw new Error(
          `Model từ chối (${response.stop_details?.category ?? 'không rõ'}). ` +
            'Nếu gặp thường xuyên, xem lại nội dung khảo sát.',
        );
      }
      if (response.stop_reason === 'max_tokens') {
        throw new Error('Output bị cắt ở max_tokens — tăng max_tokens hoặc hạ effort.');
      }

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('');

      return normalize(extractJson(text));
    },
  };
}

/**
 * Một lượt gọi model có tool, theo Messages API.
 *
 * Dịch `ToolLoopMsg` trung lập sang định dạng Anthropic. Ba chỗ khác OpenAI:
 *   1. Lời xin gọi tool là content BLOCK `tool_use` trong message assistant,
 *      không phải field `tool_calls` riêng.
 *   2. Tất cả `tool_result` đi trong MỘT message `user` — ngược với OpenAI (mỗi
 *      kết quả một message `role: 'tool'`).
 *   3. `input` là object thật, không phải string JSON.
 */
async function anthropicToolChat(
  client: Anthropic,
  model: string,
  system: string,
  tools: ToolDef[],
  messages: ToolLoopMsg[],
  force?: string,
): Promise<{ text: string; calls: { id: string; name: string; input: Record<string, unknown> }[] }> {
  const an: Anthropic.MessageParam[] = [];

  for (const m of messages) {
    if (m.role === 'user' || m.role === 'assistant') {
      an.push({ role: m.role, content: m.text });
    } else if (m.role === 'tool_calls') {
      an.push({
        role: 'assistant',
        content: m.calls.map((c) => ({
          type: 'tool_use' as const, // (1)
          id: c.id,
          name: c.name,
          input: c.input, // (3)
        })),
      });
    } else {
      an.push({
        role: 'user', // (2) gom hết vào một message
        content: m.results.map((r) => ({
          type: 'tool_result' as const,
          tool_use_id: r.id,
          content: r.content,
        })),
      });
    }
  }

  const res = await client.messages.create({
    model,
    max_tokens: 2048,
    system,
    // effort low: cố vấn tra cứu + dẫn hội thoại, không phải suy luận sâu.
    output_config: { effort: 'low' },
    ...(tools.length
      ? {
          tools: tools as unknown as Anthropic.Tool[],
          // Ép gọi tool khi vòng lặp yêu cầu — xem ToolChatFn.force.
          ...(force ? { tool_choice: { type: 'tool' as const, name: force } } : {}),
        }
      : {}),
    messages: an,
  });

  if (res.stop_reason === 'refusal') {
    throw new Error(`Model từ chối (${res.stop_details?.category ?? 'không rõ'}).`);
  }

  return {
    text: res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim(),
    calls: res.content
      .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      .map((b) => ({ id: b.id, name: b.name, input: (b.input ?? {}) as Record<string, unknown> })),
  };
}
