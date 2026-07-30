// Kiểu dữ liệu dùng chung — bám đúng spec.md §4 (state) và §5 (4 lớp chỗ khó).

/** Nhãn tầng why. Điều kiện dừng của agent dựa vào `kind` + `can_thiep_duoc`. */
export type NodeKind = 'nguyen_nhan' | 'dieu_kien' | 'trieu_chung' | 'khong_ap_dung';

/** Nguồn của một con số. ASSUMPTION không được tính vào verdict (spec.md §5 lớp ①). */
export type Source = 'khao_sat' | 'mining' | 'ASSUMPTION';

export interface WhyNode {
  level: number;
  /** Lời người trả lời, nguyên văn. */
  claim: string;
  kind: NodeKind;
  /** false => chain chưa tới gốc, agent không được cho qua. */
  can_thiep_duoc: boolean;
  /** 1 dòng lý do cho nhãn — nguyên tắc G11. */
  reason: string;
}

export interface NumberFound {
  text: string;
  nguon: Source;
}

/** 4 ô của tiêu chí 1: ai — đang làm gì — vướng đâu — hậu quả gì. */
export interface PainFields {
  ai: string;
  dang_lam_gi: string;
  vuong_dau: string;
  hau_qua_gi: string;
}

/** Output của stage ★ — mọi field bắt buộc, "" / [] nghĩa là không có. */
export type TurnMode = 'ask' | 'label' | 'stop' | 'refuse' | 'out_of_scope';

export interface TurnResult {
  mode: TurnMode;
  /** mode=ask: đúng MỘT câu hỏi. Rỗng ở mode khác. */
  next_question: string;
  /** mode=label|stop: nhãn cho tầng vừa nhận. */
  node: WhyNode | null;
  /** Số phát hiện trong câu trả lời, kèm nguồn. */
  numbers: NumberFound[];
  /** mode=stop|refuse|out_of_scope: giải thích cho người dùng. */
  message: string;
  /** true khi agent không suy ra được tầng tiếp — lớp ①, KHÔNG bịa. */
  chain_incomplete: boolean;
}

export interface PainCase {
  id: string;
  ownerId: string;
  createdAt: number;
  profile: {
    vai: string;
    moi_truong: string;
    co_domain_san: boolean;
    data_access: 'none' | 'slow' | 'instant';
  };
  pain: PainFields;
  why_chain: WhyNode[];
  numbers: NumberFound[];
  verdict: {
    du_can_cu: boolean;
    thieu: string[];
  } | null;
  dropped_reason: string;
}

/** Sub-agent: mỗi thành viên tự tạo một agent khảo sát riêng cho phần của mình. */
export interface SubAgent {
  id: string;
  ownerId: string;
  name: string;
  /** Chủ đề khảo sát — chèn vào prompt stage ★. */
  topic: string;
  /** Ai sẽ được hỏi (persona-in, spec.md §4 stage 0). */
  personaIn: string;
  visibility: 'private' | 'public';
  createdAt: number;
  maxTurns: number;
}

export interface Transcript {
  id: string;
  agentId: string;
  /** Người trả lời tự khai — KHÔNG phải account. Ẩn danh được. */
  respondent: string;
  turns: { q: string; a: string; result: TurnResult }[];
  chain: WhyNode[];
  numbers: NumberFound[];
  finishedAt: number | null;
  createdAt: number;
}

export interface User {
  id: string;
  username: string;
}
