import { TURN_SCHEMA } from '../agent/schema';
import { extractJson, normalize, type LlmProvider } from './provider';
import type { TurnResult } from '../types';

/**
 * Google AI Studio (Gemini) — `02-guide.md` §3.4 gợi ý provider này vì free tier
 * ~1.500 req/ngày.
 *
 * ⚠️ HAI CẢNH BÁO
 *
 * 1. Cùng vấn đề key-trong-bundle như provider Anthropic. Chỉ chạy local.
 *
 * 2. §3.4 nói rõ: "free tier có thể dùng dữ liệu để train → chỉ đưa data giả/
 *    data pack". Câu trả lời khảo sát là **lời của người thật**. Nếu dùng free
 *    tier để chạy khảo sát thật, bạn đang đưa dữ liệu người thật vào một endpoint
 *    có thể dùng nó để huấn luyện. Hai đường xử lý:
 *      (a) Nói rõ với người trả lời trước khi họ bắt đầu, hoặc
 *      (b) Dùng provider Anthropic (không train trên API traffic) cho khảo sát
 *          thật, và để Gemini free tier cho việc chạy golden set (data tự sinh).
 *
 * Model ID mặc định `gemini-3.5-flash` — lấy từ Lab04 của bạn
 * (`starter_v0/providers/gemini_provider.py` dòng 76), tức là ID đã chạy thật.
 * Chatlog VLearn trong data pack cho thấy production của khoá dùng
 * `gemini-3-flash` và `gemini-3.1-flash-lite` — cả ba đều là lựa chọn hợp lý;
 * kiểm tại https://aistudio.google.com nếu gặp lỗi 404 model.
 */
export function createGeminiProvider(apiKey: string, model: string): LlmProvider {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  return {
    label: `Gemini ${model}`,
    isReal: true,
    async complete(system: string, user: string): Promise<TurnResult> {
      // Gemini dùng dialect schema khác (OpenAPI subset, type chữ HOA) và không
      // nhận trực tiếp JSON Schema của Anthropic. Thay vì map hai dialect —
      // dễ lệch âm thầm — mình dán schema vào prompt và chỉ bật responseMimeType.
      const schemaHint =
        'Trả về DUY NHẤT một object JSON khớp schema sau, không kèm chữ nào khác:\n' +
        JSON.stringify(TURN_SCHEMA, null, 2);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `${system}\n\n${schemaHint}` }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 2048 },
        }),
      });

      if (!res.ok) {
        throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
      }

      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
      if (!text) throw new Error('Gemini trả về rỗng.');

      return normalize(extractJson(text));
    },
  };
}
