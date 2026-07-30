import { ChatOpenAI } from '@langchain/openai';
import { lcComplete, lcToolChat } from './langchain-common';
import type { LlmProvider } from './provider';

/**
 * OpenAI qua LangChain (`ChatOpenAI`).
 *
 * Model ID lấy từ Lab04 — nhóm chốt `gpt-4o-mini` "để metric before/after so sánh
 * được". Muốn so số với Lab04 thì đặt gpt-4o-mini, đừng để gpt-4o.
 * `baseUrl` đổi được để dùng OpenRouter như Lab04.
 *
 * complete/toolChat dùng chung ở langchain-common. Riêng `webSearch` GIỮ raw fetch
 * tới Responses API — LangChain ChatOpenAI mặc định là Chat Completions, còn
 * server tool `web_search` nằm ở Responses API; giữ đường cũ cho chắc và đúng.
 *
 * ⚠️ Key nhúng bundle (dangerouslyAllowBrowser). Chỉ chạy local.
 */
export function createOpenAiProvider(
  apiKey: string,
  model: string,
  baseUrl = 'https://api.openai.com/v1',
): LlmProvider {
  const chat = new ChatOpenAI({
    apiKey,
    model,
    temperature: 0,
    maxTokens: 2048,
    configuration: { baseURL: baseUrl, dangerouslyAllowBrowser: true },
  });

  return {
    label: `OpenAI ${model}`,
    isReal: true,
    complete: (system, user) => lcComplete(chat, system, user),
    toolChat: (a) => lcToolChat(chat, a),
    webSearch: (cauHoi) => openAiWebSearch(apiKey, model, baseUrl, cauHoi),
  };
}

/**
 * Web search THẬT qua Responses API (`POST /v1/responses`) với server tool
 * `web_search`. Chạy bằng đúng key OpenAI đang có, không cần key thứ hai.
 *
 * ⚠️ `gpt-4o-mini` có thể không hỗ trợ `web_search`. API từ chối thì trả `{error}`
 * để agent nói rõ là không tra được, KHÔNG bịa.
 */
async function openAiWebSearch(
  apiKey: string,
  model: string,
  baseUrl: string,
  cauHoi: string,
): Promise<{ ket_qua: string; nguon: string[] } | { error: string; message: string }> {
  const res = await fetch(`${baseUrl}/responses`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      tools: [{ type: 'web_search' }],
      tool_choice: 'auto',
      input:
        `Tra web để trả lời: ${cauHoi}\n\n` +
        'Trả lời ngắn (tối đa 5 câu). Chỉ nêu điều có trong nguồn tìm được. ' +
        'Không có nguồn cho phần nào thì nói rõ là không tìm thấy.',
    }),
  });

  if (!res.ok) {
    const body = (await res.text()).slice(0, 200);
    return {
      error: 'web_search_that_bai',
      message:
        `Không tra web được (${res.status}: ${body}). Có thể model "${model}" không hỗ trợ ` +
        'web_search — thử VITE_OPENAI_MODEL=gpt-4o. NÓI RÕ với người dùng là chưa tra được.',
    };
  }

  const data = (await res.json()) as {
    output_text?: string;
    output?: { content?: { text?: string; annotations?: { url?: string }[] }[] }[];
  };

  const text =
    data.output_text ??
    (data.output ?? [])
      .flatMap((o) => o.content ?? [])
      .map((c) => c.text ?? '')
      .join('\n')
      .trim();

  const nguon = [
    ...new Set(
      (data.output ?? [])
        .flatMap((o) => o.content ?? [])
        .flatMap((c) => c.annotations ?? [])
        .map((a) => a.url)
        .filter((u): u is string => !!u),
    ),
  ];

  if (!text) return { error: 'web_search_rong', message: 'Tra web không ra kết quả nào.' };
  return { ket_qua: text, nguon };
}
