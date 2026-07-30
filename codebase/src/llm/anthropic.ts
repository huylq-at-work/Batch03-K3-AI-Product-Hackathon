import { ChatAnthropic } from '@langchain/anthropic';
import { lcComplete, lcToolChat } from './langchain-common';
import type { LlmProvider } from './provider';

/**
 * ⚠️ CẢNH BÁO BẢO MẬT — đọc trước khi deploy.
 *
 * `dangerouslyAllowBrowser: true` cho SDK chạy trong browser. Nghĩa là API key bị
 * nhúng vào bundle JS và AI MỞ DEVTOOLS CŨNG ĐỌC ĐƯỢC. Chấp nhận được khi chạy
 * local; KHÔNG deploy. Đề bài không yêu cầu deploy.
 *
 * Provider giờ dựng trên LangChain (`ChatAnthropic`). Hành vi complete/toolChat
 * nằm chung ở langchain-common — provider chỉ tạo đúng model.
 */
export function createAnthropicProvider(apiKey: string, model: string): LlmProvider {
  const chat = new ChatAnthropic({
    apiKey,
    model,
    maxTokens: 4096,
    // effort/thinking để mặc định; LangChain gọi Messages API bên dưới.
    clientOptions: { dangerouslyAllowBrowser: true },
  });

  return {
    label: `Anthropic ${model}`,
    isReal: true,
    complete: (system, user, onToken) => lcComplete(chat, system, user, onToken),
    toolChat: (a) => lcToolChat(chat, a),
  };
}
