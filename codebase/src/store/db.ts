import { HAN_LINK_MS, type SubAgent, type Transcript, type User } from '../types';

// localStorage thay backend. Đủ cho prototype hackathon; ghi rõ là mock trong
// spec.md §4 (mức prototype).
const K = {
  users: 'daogoc.users',
  session: 'daogoc.session',
  agents: 'daogoc.agents',
  transcripts: 'daogoc.transcripts',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/* ---------- users (auth demo — xem store/auth.tsx) ---------- */

interface StoredUser extends User {
  /** ⚠️ Không phải hash thật. Xem cảnh báo trong auth.tsx. */
  secret: string;
}

export const users = {
  all: () => read<StoredUser[]>(K.users, []),
  byName: (username: string) =>
    users.all().find((u) => u.username.toLowerCase() === username.toLowerCase()) ?? null,
  create(username: string, secret: string): StoredUser {
    const u: StoredUser = { id: newId('u'), username, secret };
    write(K.users, [...users.all(), u]);
    return u;
  },
};

export const session = {
  get: () => read<string | null>(K.session, null),
  set: (userId: string | null) => write(K.session, userId),
};

/* ---------- sub-agents ---------- */

export const agents = {
  all: () => read<SubAgent[]>(K.agents, []),
  byId: (id: string) => agents.all().find((a) => a.id === id) ?? null,
  mine: (ownerId: string) => agents.all().filter((a) => a.ownerId === ownerId),
  /** Agent public — ai có link cũng trả lời được, không cần đăng nhập. */
  publicOnes: () => agents.all().filter((a) => a.visibility === 'public'),
  save(a: SubAgent): void {
    const rest = agents.all().filter((x) => x.id !== a.id);
    write(K.agents, [...rest, a]);
  },
  remove(id: string): void {
    write(K.agents, agents.all().filter((a) => a.id !== id));
  },
  /**
   * Mốc hết hạn, chịu được agent CŨ tạo trước khi có field này (localStorage giữ
   * bản cũ không có expiresAt) — suy ra createdAt + 1 chu kỳ.
   */
  hetHan(a: SubAgent): number {
    return a.expiresAt ?? a.createdAt + HAN_LINK_MS;
  },
  /** Link còn sống không (dựa mốc hết hạn). now truyền vào để test được. */
  conHan(a: SubAgent, now: number): boolean {
    return agents.hetHan(a) > now;
  },
  /**
   * Gia hạn link thêm một chu kỳ kể từ `now`. Trả về agent đã cập nhật, hoặc null
   * nếu không có agent. "Cấp link mới" = giữ cùng id, đặt lại mốc hết hạn — id
   * không đổi nên link cũ vẫn dùng được, chỉ là hạn được đẩy ra.
   */
  giaHan(id: string, now: number): SubAgent | null {
    const a = agents.byId(id);
    if (!a) return null;
    const moi = { ...a, expiresAt: now + HAN_LINK_MS };
    agents.save(moi);
    return moi;
  },
};

/* ---------- transcripts ---------- */

export const transcripts = {
  all: () => read<Transcript[]>(K.transcripts, []),
  byAgent: (agentId: string) => transcripts.all().filter((t) => t.agentId === agentId),
  save(t: Transcript): void {
    const rest = transcripts.all().filter((x) => x.id !== t.id);
    write(K.transcripts, [...rest, t]);
  },
};

/** Xuất evidence log cho `evidence/` — R1 đòi "log đủ câu hỏi + từng câu trả lời". */
export function exportEvidence(agentId: string): string {
  const a = agents.byId(agentId);
  const ts = transcripts.byAgent(agentId);
  const lines: string[] = [
    `# Evidence log — ${a?.name ?? agentId}`,
    '',
    `Chủ đề: ${a?.topic ?? '?'}`,
    `Đối tượng: ${a?.personaIn ?? '?'}`,
    `Số phiên: ${ts.length} · hoàn thành: ${ts.filter((t) => t.finishedAt).length}`,
    '',
  ];
  for (const t of ts) {
    lines.push(`## ${t.respondent || '(ẩn danh)'} — ${new Date(t.createdAt).toISOString()}`);
    t.turns.forEach((turn, i) => {
      lines.push(`- **Q${i + 1}:** ${turn.q}`);
      lines.push(`  **A${i + 1}:** ${turn.a}`);
    });
    lines.push('', '**Chain:**');
    t.chain.forEach((n) =>
      lines.push(
        `- Why ${n.level}: "${n.claim}" → \`${n.kind}\` · can_thiep_duoc=${n.can_thiep_duoc} · ${n.reason}`,
      ),
    );
    if (t.numbers.length) {
      lines.push('', '**Số liệu:**');
      t.numbers.forEach((n) => lines.push(`- ${n.text} (nguồn: \`${n.nguon}\`)`));
    }
    lines.push('');
  }
  return lines.join('\n');
}

/**
 * "Database" của toàn bộ câu trả lời khảo sát, dạng .txt phẳng.
 *
 * Đề bài muốn "file khảo sát lưu vào database (1 file txt)". App chạy browser-only
 * (người dùng chọn) nên không ghi được file server; localStorage LÀ database, và
 * hàm này kết xuất nó ra một file .txt tải về được. Gọi mỗi khi có phiên mới để
 * giữ bản sao ngoài localStorage — localStorage có thể bị xoá khi dọn cache.
 */
export function exportTxtDatabase(): string {
  const out: string[] = [
    'DAO GOC — DATABASE KHAO SAT',
    `Ket xuat luc: ${new Date(now()).toISOString()}`,
    `Tong so khao sat: ${agents.all().length} · tong so phien: ${transcripts.all().length}`,
    '='.repeat(60),
    '',
  ];
  for (const a of agents.all()) {
    const ts = transcripts.byAgent(a.id);
    out.push(
      `[${a.id}] ${a.name}`,
      `  chu de : ${a.topic}`,
      `  hoi ai : ${a.personaIn}`,
      `  het han: ${new Date(agents.hetHan(a)).toISOString()} (${agents.conHan(a, now()) ? 'con song' : 'DA CHET'})`,
      `  so phien: ${ts.length}`,
      '',
    );
    for (const t of ts) {
      out.push(`  --- phien: ${t.respondent || '(an danh)'} @ ${new Date(t.createdAt).toISOString()}`);
      t.turns.forEach((turn, i) => {
        out.push(`    Q${i + 1}: ${turn.q}`);
        out.push(`    A${i + 1}: ${turn.a}`);
      });
      out.push('');
    }
    out.push('-'.repeat(60), '');
  }
  return out.join('\n');
}

/** now() tách riêng để test đặt được thời gian cố định. */
function now(): number {
  return Date.now();
}
