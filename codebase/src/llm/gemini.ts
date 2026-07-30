import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { lcComplete, lcToolChat } from './langchain-common';
import type { LlmProvider } from './provider';

/**
 * Google AI Studio (Gemini) qua LangChain (`ChatGoogleGenerativeAI`).
 *
 * ⚠️ HAI CẢNH BÁO
 * 1. Cùng vấn đề key-trong-bundle. Chỉ chạy local.
 * 2. `02-guide.md` §3.4: free tier CÓ THỂ dùng dữ liệu để train. Câu trả lời khảo
 *    sát là lời người thật → hoặc nói rõ trước với người trả lời, hoặc dùng
 *    Anthropic cho khảo sát thật và để Gemini cho golden set (data tự sinh).
 *
 * Trước đây phải dán schema vào prompt vì Gemini dùng dialect schema khác; giờ
 * LangChain lo `withStructuredOutput`/`bindTools` cho Gemini, dùng chung
 * langchain-common như hai provider kia.
 *
 * Model mặc định `gemini-3.5-flash` (Lab04 `gemini_provider.py:76`).
 */
export function createGeminiProvider(apiKey: string, model: string): LlmProvider {
  const chat = new ChatGoogleGenerativeAI({ apiKey, model, maxOutputTokens: 2048 });

  return {
    label: `Gemini ${model}`,
    isReal: true,
    complete: (system, user) => lcComplete(chat, system, user),
    toolChat: (a) => lcToolChat(chat, a),
  };
}
