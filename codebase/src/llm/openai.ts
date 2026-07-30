import { TURN_SCHEMA } from '../agent/schema';
import { extractJson, normalize, type LlmProvider } from './provider';
import type { TurnResult } from '../types';

/**
 * OpenAI Chat Completions.
 *
 * Model ID lấy từ Lab04 (`starter_v0/providers/openai_provider.py`), nơi nhóm đã
 * chốt `gpt-4o-mini` từ v0 đến v3 "để metric before/after so sánh được"
 * (artifacts/REPORT.md). Ở đây mặc định `gpt-4o` theo yêu cầu, nhưng:
 *
 *   ⚠️ Nếu bạn muốn so sánh số với Lab04, PHẢI đổi về `gpt-4o-mini` —
 *      đổi model là đổi baseline, con số không còn so được.
 *
 * `base_url` cấu hình được để dùng OpenRouter như Lab04 đã làm
 * (openrouter_provider.py: base_url=https://openrouter.ai/api/v1,
 *  model=openai/gpt-4o-mini).
 *
 * ⚠️ Cùng vấn đề key-trong-bundle như hai provider kia. Chỉ chạy local.
 */
export function createOpenAiProvider(
  apiKey: string,
  model: string,
  baseUrl = 'https://api.openai.com/v1',
): LlmProvider {
  return {
    label: `OpenAI ${model}`,
    isReal: true,
    async complete(system: string, user: string): Promise<TurnResult> {
      // 4o hỗ trợ structured outputs thật (json_schema + strict), khác Gemini —
      // nên ở đây ép schema ở tầng API chứ không dán vào prompt.
      // Schema của mình đã thoả điều kiện strict: mọi object có
      // additionalProperties:false và mọi key nằm trong `required`.
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          max_tokens: 2048,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: { name: 'turn_result', strict: true, schema: TURN_SCHEMA },
          },
        }),
      });

      if (!res.ok) {
        const body = (await res.text()).slice(0, 400);
        // Strict mode kén schema; nếu 400 thì thử lại ở chế độ json_object.
        if (res.status === 400 && /json_schema|schema/i.test(body)) {
          return retryAsJsonObject(apiKey, model, baseUrl, system, user);
        }
        throw new Error(`OpenAI ${res.status}: ${body}`);
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string; refusal?: string | null } }[];
      };
      const msg = data.choices?.[0]?.message;
      if (msg?.refusal) throw new Error(`OpenAI từ chối: ${msg.refusal}`);
      if (!msg?.content) throw new Error('OpenAI trả về rỗng.');

      return normalize(extractJson(msg.content));
    },
  };
}

/** Fallback khi strict json_schema bị từ chối — dán schema vào prompt. */
async function retryAsJsonObject(
  apiKey: string,
  model: string,
  baseUrl: string,
  system: string,
  user: string,
): Promise<TurnResult> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content:
            `${system}\n\nTrả về DUY NHẤT một object JSON khớp schema sau:\n` +
            JSON.stringify(TURN_SCHEMA),
        },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 400)}`);

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI trả về rỗng (fallback json_object).');
  return normalize(extractJson(text));
}
