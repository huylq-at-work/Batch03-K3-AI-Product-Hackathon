import { useState } from 'react';
import { agents, exportEvidence, newId, transcripts } from '../store/db';
import { useAuth } from '../store/auth';
import { readTraces } from '../llm';
import type { SubAgent } from '../types';

/** Tạo + quản lý sub-agent khảo sát của riêng mình. */
export function Dashboard({ onOpen }: { onOpen: (a: SubAgent) => void }) {
  const { user, signOut } = useAuth();
  const [mine, setMine] = useState<SubAgent[]>(() => agents.mine(user!.id));
  const [form, setForm] = useState({
    name: '',
    topic: '',
    personaIn: 'Học viên khoá AI Thực Chiến chưa có domain nghề',
    visibility: 'private' as SubAgent['visibility'],
    maxTurns: 5,
  });

  function refresh() {
    setMine(agents.mine(user!.id));
  }

  function create() {
    if (!form.name.trim() || !form.topic.trim()) return;
    agents.save({
      id: newId('a'),
      ownerId: user!.id,
      name: form.name.trim(),
      topic: form.topic.trim(),
      personaIn: form.personaIn.trim(),
      visibility: form.visibility,
      maxTurns: form.maxTurns,
      createdAt: Date.now(),
    });
    setForm({ ...form, name: '', topic: '' });
    refresh();
  }

  function download(name: string, content: string) {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  const realCalls = readTraces().filter((t) => t.isReal).length;

  return (
    <div className="wrap">
      <header className="bar">
        <div>
          <b>Đào Gốc</b> <span className="muted">— khảo sát 5-why thích ứng</span>
        </div>
        <div className="row">
          <span className="muted small">
            {user!.username} · {realCalls} lời gọi AI thật
          </span>
          <button onClick={signOut}>Đăng xuất</button>
        </div>
      </header>

      <section className="card">
        <h2>Tạo agent khảo sát</h2>
        <p className="muted small">
          Mỗi thành viên tạo agent riêng cho phần mình phụ trách. Đặt <b>public</b> để chia sẻ
          link cho người ngoài nhóm trả lời mà không cần đăng nhập — đây là cách thu ≥20 người
          cho chuẩn A.
        </p>
        <label>
          Tên agent
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="VD: Khảo sát chi phí tìm đề tài"
          />
        </label>
        <label>
          Chủ đề khảo sát
          <textarea
            rows={2}
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder="VD: khó khăn khi xác định painpoint cho dự án cuối khoá"
          />
        </label>
        <label>
          Đối tượng dự kiến (persona-in)
          <input
            value={form.personaIn}
            onChange={(e) => setForm({ ...form, personaIn: e.target.value })}
          />
        </label>
        <div className="row">
          <label className="inline">
            Số tầng tối đa
            <input
              type="number"
              min={3}
              max={8}
              value={form.maxTurns}
              onChange={(e) => setForm({ ...form, maxTurns: Number(e.target.value) })}
            />
          </label>
          <label className="inline">
            Hiển thị
            <select
              value={form.visibility}
              onChange={(e) =>
                setForm({ ...form, visibility: e.target.value as SubAgent['visibility'] })
              }
            >
              <option value="private">private — chỉ mình tôi</option>
              <option value="public">public — ai có link cũng trả lời được</option>
            </select>
          </label>
        </div>
        {form.visibility === 'public' && (
          <div className="notice warn">
            Public nghĩa là bất kỳ ai có link đều trả lời được, không cần đăng nhập. Đừng đưa
            nội dung cần bảo mật vào chủ đề khảo sát.
          </div>
        )}
        <button className="primary" onClick={create}>
          Tạo agent
        </button>
      </section>

      <section className="card">
        <h2>Agent của tôi ({mine.length})</h2>
        {mine.length === 0 && <p className="muted">Chưa có agent nào.</p>}
        {mine.map((a) => {
          const ts = transcripts.byAgent(a.id);
          const done = ts.filter((t) => t.finishedAt).length;
          const rooted = ts.filter((t) => t.chain.some((n) => n.can_thiep_duoc)).length;
          const link = `${location.origin}${location.pathname}#/s/${a.id}`;
          return (
            <div key={a.id} className="agentRow">
              <div>
                <b>{a.name}</b>{' '}
                <span className={a.visibility === 'public' ? 'tag ok' : 'tag'}>
                  {a.visibility}
                </span>
                <div className="muted small">{a.topic}</div>
                <div className="muted small">
                  {ts.length} phiên · {done} hoàn thành · {rooted} tới gốc
                </div>
                {a.visibility === 'public' && (
                  <div className="row">
                    <input readOnly value={link} onClick={(e) => e.currentTarget.select()} />
                    <button onClick={() => void navigator.clipboard.writeText(link)}>Copy</button>
                  </div>
                )}
              </div>
              <div className="col">
                <button className="primary" onClick={() => onOpen(a)}>
                  Chạy thử
                </button>
                <button
                  disabled={ts.length === 0}
                  onClick={() => download(`evidence-${a.name}.md`, exportEvidence(a.id))}
                >
                  Xuất evidence
                </button>
                <button
                  onClick={() => {
                    agents.save({
                      ...a,
                      visibility: a.visibility === 'public' ? 'private' : 'public',
                    });
                    refresh();
                  }}
                >
                  {a.visibility === 'public' ? 'Đặt private' : 'Đặt public'}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="card">
        <h2>Trace</h2>
        <p className="muted small">
          Mọi lời gọi AI được ghi vào localStorage. Xuất ra để đặt trong{' '}
          <code>codebase/traces/</code> — R5 đòi log/trace trong repo.
        </p>
        <button
          onClick={() =>
            download('traces.json', JSON.stringify(readTraces(), null, 2))
          }
        >
          Xuất traces.json ({readTraces().length})
        </button>
      </section>
    </div>
  );
}
