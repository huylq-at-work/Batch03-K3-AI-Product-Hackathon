import { agents, exportEvidence, transcripts } from '../store/db';
import { readTraces } from '../llm';
import type { SubAgent } from '../types';

/** Tải một file text từ browser. Không có backend nên đây là cách duy nhất lấy file ra. */
function taiVe(name: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Sidebar kiểu ChatGPT: cuộc tư vấn ở trên, các khảo sát đã tạo ở dưới.
 *
 * Khảo sát nằm ở sidebar chứ không phải một trang dashboard riêng, vì chúng là sản
 * phẩm của cuộc hội thoại — người dùng cần thấy chúng mọc ra ngay bên cạnh chỗ họ
 * vừa nói chuyện, không phải bấm đi đâu khác mới thấy.
 */
export function Sidebar({
  username,
  danhSach,
  dangMo,
  onNewChat,
  onOpen,
  onSignOut,
  onChanged,
}: {
  username: string;
  danhSach: SubAgent[];
  dangMo: string | null;
  onNewChat: () => void;
  onOpen: (a: SubAgent) => void;
  onSignOut: () => void;
  onChanged: () => void;
}) {
  return (
    <aside className="sidebar">
      <button className="newchat" onClick={onNewChat}>
        + Cuộc tư vấn mới
      </button>

      <div className="sidesection">
        <h3>Khảo sát đã tạo ({danhSach.length})</h3>
        {danhSach.length === 0 && (
          <p className="muted small">
            Chưa có. Cố vấn sẽ tự dựng một cái sau khi đào ra painpoint của bạn.
          </p>
        )}
        {danhSach.map((a) => {
          const n = transcripts.byAgent(a.id).length;
          return (
            <div className={`sideitem ${dangMo === a.id ? 'active' : ''}`} key={a.id}>
              <button className="sideitemMain" onClick={() => onOpen(a)}>
                <span className="sideitemName">{a.name}</span>
                <span className="muted small">
                  {n} phiên · {a.visibility}
                </span>
              </button>
              <div className="sideitemActions">
                <button
                  title="Copy link chia sẻ"
                  onClick={() => {
                    void navigator.clipboard.writeText(`${location.origin}/#/s/${a.id}`);
                  }}
                >
                  link
                </button>
                <button
                  title="Xuất evidence .md (R1)"
                  disabled={n === 0}
                  onClick={() => taiVe(`evidence-${a.name}.md`, exportEvidence(a.id))}
                >
                  ⭳
                </button>
                <button
                  title={a.visibility === 'public' ? 'Đặt private' : 'Đặt public'}
                  onClick={() => {
                    agents.save({
                      ...a,
                      visibility: a.visibility === 'public' ? 'private' : 'public',
                    });
                    onChanged();
                  }}
                >
                  {a.visibility === 'public' ? '🔓' : '🔒'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* R5 đòi log/trace trong repo. Không có backend nên phải xuất tay ra
          codebase/traces/. Hiện số lời gọi AI THẬT để phân biệt với mock. */}
      <div className="sidesection">
        <h3>Trace</h3>
        <button
          className="newchat"
          disabled={readTraces().length === 0}
          onClick={() => taiVe('traces.json', JSON.stringify(readTraces(), null, 2))}
        >
          ⭳ traces.json ({readTraces().filter((t) => t.isReal).length} thật /{' '}
          {readTraces().length})
        </button>
      </div>

      <div className="sidefoot">
        <span className="muted small">{username}</span>
        <button onClick={onSignOut}>Đăng xuất</button>
      </div>
    </aside>
  );
}
