import type { SubAgent, Transcript, User } from '../types';

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
