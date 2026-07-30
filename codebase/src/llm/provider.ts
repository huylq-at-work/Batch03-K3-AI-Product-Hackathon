import type { TurnResult } from '../types';

import type Anthropic from '@anthropic-ai/sdk';
import type { ContextResult } from '../agent/context-phase';

export interface LlmProvider {
  /** Tên hiện trên UI + ghi vào trace. */
  readonly label: string;
  /** true nếu là lời gọi AI THẬT (R5 đòi khai rõ phần nào mock). */
  readonly isReal: boolean;
  /** Stage ★ — quyết định AI trung tâm. Không có tool, output ràng buộc schema. */
  complete(system: string, user: string): Promise<TurnResult>;
  /**
   * Pha 1 — vòng lặp tool tra catalog đề tài. `undefined` = provider không hỗ trợ
   * tool; app khi đó bỏ qua pha này và vào thẳng phỏng vấn.
   */
  contextPhase?(messages: Anthropic.MessageParam[]): Promise<ContextResult>;
}

/** Bản ghi mỗi lời gọi AI — R5: "log/trace trong repo". */
export interface Trace {
  at: number;
  provider: string;
  isReal: boolean;
  system: string;
  user: string;
  raw: string;
  parsed: TurnResult | null;
  error: string;
  ms: number;
}

const TRACE_KEY = 'daogoc.traces';

export function pushTrace(t: Trace): void {
  const all = readTraces();
  all.push(t);
  // giữ 200 trace gần nhất để không tràn localStorage
  localStorage.setItem(TRACE_KEY, JSON.stringify(all.slice(-200)));
}

export function readTraces(): Trace[] {
  try {
    return JSON.parse(localStorage.getItem(TRACE_KEY) ?? '[]') as Trace[];
  } catch {
    return [];
  }
}

export function clearTraces(): void {
  localStorage.removeItem(TRACE_KEY);
}

/**
 * Chuẩn hoá output của model về TurnResult.
 * Model có thể trả field thiếu hoặc sai kiểu — normalize ở một chỗ để
 * engine và eval runner không phải phòng thủ riêng.
 */
export function normalize(obj: unknown): TurnResult {
  const o = (obj ?? {}) as Record<string, unknown>;
  const rawNode = o.node as Record<string, unknown> | null | undefined;

  const kind = String(rawNode?.kind ?? 'khong_ap_dung');
  const validKinds = ['nguyen_nhan', 'dieu_kien', 'trieu_chung', 'khong_ap_dung'];

  return {
    mode: (['ask', 'label', 'stop', 'refuse', 'out_of_scope'] as const).includes(
      o.mode as never,
    )
      ? (o.mode as TurnResult['mode'])
      : 'ask',
    next_question: String(o.next_question ?? ''),
    node: rawNode
      ? {
          level: Number(rawNode.level ?? 1),
          claim: String(rawNode.claim ?? ''),
          kind: (validKinds.includes(kind) ? kind : 'khong_ap_dung') as never,
          // Bất biến của spec: can_thiep_duoc chỉ true khi kind = nguyen_nhan.
          // Ép ở đây để một model lỏng tay không phá được điều kiện dừng.
          can_thiep_duoc: kind === 'nguyen_nhan' && rawNode.can_thiep_duoc === true,
          reason: String(rawNode.reason ?? ''),
        }
      : null,
    numbers: Array.isArray(o.numbers)
      ? (o.numbers as Record<string, unknown>[]).map((n) => ({
          text: String(n?.text ?? ''),
          nguon: (['khao_sat', 'mining', 'ASSUMPTION'].includes(String(n?.nguon))
            ? String(n?.nguon)
            : 'ASSUMPTION') as never,
        }))
      : [],
    message: String(o.message ?? ''),
    chain_incomplete: o.chain_incomplete === true,
  };
}

/** Rút JSON ra khỏi text có thể bọc ```json fence. */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : trimmed;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error(`Không tìm thấy JSON trong output: ${text.slice(0, 200)}`);
  return JSON.parse(body.slice(start, end + 1));
}
