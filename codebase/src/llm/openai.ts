import { TURN_SCHEMA } from '../agent/schema';
import { extractJson, normalize, type LlmProvider } from './provider';
import type { ToolDef, ToolLoopMsg } from '../agent/tool-loop';
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

    toolChat: ({ system, tools, messages }) =>
      openAiToolChat(apiKey, model, baseUrl, system, tools, messages),

    timWeb: (cauHoi) => openAiWebSearch(apiKey, model, baseUrl, cauHoi),
  };
}

/**
 * Web search THẬT qua Responses API (`POST /v1/responses`) với server tool
 * `web_search`. OpenAI chạy tìm kiếm phía họ rồi trả kèm citation.
 *
 * Vì sao đường này chứ không gọi Google/Brave: chạy bằng **đúng key OpenAI đang
 * có**, không cần key thứ hai, và không phải tự parse HTML kết quả tìm kiếm.
 *
 * ⚠️ `gpt-4o-mini` có thể không hỗ trợ `web_search`. Nếu API từ chối thì trả
 * `{error}` để agent **nói rõ là không tra được**, KHÔNG âm thầm bịa — nghiên cứu
 * bịa còn tệ hơn không nghiên cứu.
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
    // Kèm body: 4o-mini từ chối web_search bằng thông báo khác hẳn 404 route sai,
    // và không có nó thì không phân biệt được hai chuyện.
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

  // Responses API có `output_text` tiện dụng; nếu thiếu thì gom từ output[].content[].
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

/**
 * Một lượt gọi model có tool, theo function calling của OpenAI.
 *
 * Dịch `ToolLoopMsg` trung lập sang định dạng OpenAI. Ba chỗ khác Anthropic, đều
 * dễ sai:
 *   1. Lời xin gọi tool là `assistant.tool_calls`, KHÔNG phải content block.
 *   2. Mỗi kết quả là MỘT message riêng `role: 'tool'` — không gom vào một user
 *      message như Anthropic. Gom lại là API báo lỗi.
 *   3. `arguments` là STRING JSON, không phải object. Phải tự parse/stringify.
 */
async function openAiToolChat(
  apiKey: string,
  model: string,
  baseUrl: string,
  system: string,
  tools: ToolDef[],
  messages: ToolLoopMsg[],
): Promise<{ text: string; calls: { id: string; name: string; input: Record<string, unknown> }[] }> {
  type OaMsg = Record<string, unknown>;
  const oa: OaMsg[] = [{ role: 'system', content: system }];

  for (const m of messages) {
    if (m.role === 'user' || m.role === 'assistant') {
      oa.push({ role: m.role, content: m.text });
    } else if (m.role === 'tool_calls') {
      oa.push({
        role: 'assistant',
        content: null,
        tool_calls: m.calls.map((c) => ({
          id: c.id,
          type: 'function',
          function: { name: c.name, arguments: JSON.stringify(c.input) }, // (3)
        })),
      });
    } else {
      // (2) mỗi kết quả một message riêng
      for (const r of m.results) {
        oa.push({ role: 'tool', tool_call_id: r.id, content: r.content });
      }
    }
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 2048,
      messages: oa,
      // Không ép `tool_choice: required` — cố vấn phải được quyền TRẢ LỜI THẲNG
      // khi không cần tra gì. Ép gọi tool là buộc nó tra catalog cả những lượt
      // chỉ đang hỏi lại cho rõ.
      ...(tools.length
        ? {
            tools: tools.map((t) => ({
              type: 'function',
              function: { name: t.name, description: t.description, parameters: t.input_schema },
            })),
          }
        : {}),
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 400)}`);

  const data = (await res.json()) as {
    choices?: {
      message?: {
        content?: string | null;
        refusal?: string | null;
        tool_calls?: { id: string; function?: { name?: string; arguments?: string } }[];
      };
    }[];
  };
  const msg = data.choices?.[0]?.message;
  if (msg?.refusal) throw new Error(`OpenAI từ chối: ${msg.refusal}`);

  const calls = (msg?.tool_calls ?? []).map((c) => {
    let input: Record<string, unknown> = {};
    try {
      // (3) arguments là string; model đôi khi trả '' cho tool không tham số.
      input = c.function?.arguments ? JSON.parse(c.function.arguments) : {};
    } catch {
      input = {};
    }
    return { id: c.id, name: c.function?.name ?? '', input };
  });

  return { text: msg?.content ?? '', calls };
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
