import { createAnthropicProvider } from './anthropic';
import { createGeminiProvider } from './gemini';
import { createOpenAiProvider } from './openai';
import { createMockProvider } from './mock';
import type { LlmProvider } from './provider';
import { bien } from '../env';

export * from './provider';

export const PROVIDERS = ['mock', 'anthropic', 'openai', 'gemini'] as const;
export type ProviderName = (typeof PROVIDERS)[number];

/** Model mặc định mỗi provider. OpenAI/Gemini lấy từ Lab04 của nhóm. */
export const DEFAULT_MODEL: Record<ProviderName, string> = {
  mock: '(rule-based)',
  anthropic: 'claude-opus-5',
  openai: 'gpt-4o', // Lab04 chốt gpt-4o-mini — đổi nếu cần so metric với Lab04
  gemini: 'gemini-3.5-flash', // Lab04: providers/gemini_provider.py:76
};

/**
 * Chọn provider theo biến môi trường. Không có key → Mock, để flow bấm hết được
 * ngay từ CP2 mà không chặn ai.
 *
 * KHÔNG hardcode key vào đây. Đặt trong `.env.local` (đã .gitignore).
 */
export function resolveProvider(name?: string): LlmProvider {
  // ⚠️ PHẢI qua `bien()`, đừng đọc thẳng import.meta.env.
  //
  // `.env.example` ship các dòng để trống (`VITE_OPENAI_BASE_URL=`), nên giá trị
  // là chuỗi RỖNG chứ không phải undefined. Bản trước viết
  //     import.meta.env.VITE_OPENAI_BASE_URL ?? undefined
  // và `??` KHÔNG bắt chuỗi rỗng → baseUrl = '' → default parameter
  // 'https://api.openai.com/v1' không bao giờ áp dụng → fetch('/chat/completions')
  // gọi vào chính Vite dev server → 404 với body rỗng.
  //
  // Lỗi này không lộ ra ở eval/runner.ts vì nó dùng `|| undefined`. Chạy được ở
  // Node mà chết ở browser đúng là dấu hiệu của loại bug này.
  //
  // `bien()` coi chuỗi rỗng là "không có", nên default parameter hoạt động lại.
  const which = (name ?? bien('LLM_PROVIDER') ?? 'mock').toLowerCase();

  if (which === 'anthropic') {
    const key = bien('ANTHROPIC_API_KEY');
    if (!key) return createMockProvider();
    return createAnthropicProvider(key, bien('ANTHROPIC_MODEL') ?? DEFAULT_MODEL.anthropic);
  }

  if (which === 'openai') {
    const key = bien('OPENAI_API_KEY');
    if (!key) return createMockProvider();
    return createOpenAiProvider(
      key,
      bien('OPENAI_MODEL') ?? DEFAULT_MODEL.openai,
      bien('OPENAI_BASE_URL'),
    );
  }

  if (which === 'gemini') {
    const key = bien('GEMINI_API_KEY');
    if (!key) return createMockProvider();
    return createGeminiProvider(key, bien('GEMINI_MODEL') ?? DEFAULT_MODEL.gemini);
  }

  return createMockProvider();
}
