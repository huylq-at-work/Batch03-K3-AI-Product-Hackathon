import { createAnthropicProvider } from './anthropic';
import { createGeminiProvider } from './gemini';
import { createOpenAiProvider } from './openai';
import { createMockProvider } from './mock';
import type { LlmProvider } from './provider';

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
  const which = (name ?? import.meta.env.VITE_LLM_PROVIDER ?? 'mock').toLowerCase();

  if (which === 'anthropic') {
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!key) return createMockProvider();
    return createAnthropicProvider(
      key,
      import.meta.env.VITE_ANTHROPIC_MODEL ?? DEFAULT_MODEL.anthropic,
    );
  }

  if (which === 'openai') {
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    if (!key) return createMockProvider();
    return createOpenAiProvider(
      key,
      import.meta.env.VITE_OPENAI_MODEL ?? DEFAULT_MODEL.openai,
      import.meta.env.VITE_OPENAI_BASE_URL ?? undefined,
    );
  }

  if (which === 'gemini') {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return createMockProvider();
    return createGeminiProvider(key, import.meta.env.VITE_GEMINI_MODEL ?? DEFAULT_MODEL.gemini);
  }

  return createMockProvider();
}
