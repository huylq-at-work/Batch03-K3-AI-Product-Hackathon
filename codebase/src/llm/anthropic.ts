import Anthropic from '@anthropic-ai/sdk';
import { TURN_SCHEMA } from '../agent/schema';
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
