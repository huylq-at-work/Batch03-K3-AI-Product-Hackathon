import { useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './store/auth';
import { agents } from './store/db';
import { Advisor } from './components/Advisor';
import { Chat } from './components/Chat';
import { Sidebar } from './components/Sidebar';
import type { SubAgent } from './types';

/** Router tối giản trên hash: `#/s/<agentId>` = trang trả lời khảo sát public. */
function useHashRoute(): string {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const on = () => setHash(location.hash);
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return hash;
}

function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('up');
  const [username, setUsername] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="wrap narrow">
      <div className="card">
        <h1>Đào Gốc</h1>
        <p className="muted">Cố vấn tìm painpoint thật cho đề tài capstone của bạn.</p>

        <div className="notice warn">
          <b>Đăng nhập này không phải bảo mật thật.</b> Mọi thứ lưu trong localStorage của
          browser, mật khẩu để nguyên văn, không có server xác minh. Nó chỉ để tách agent của
          từng thành viên trong bản demo. <b>Đừng dùng mật khẩu thật.</b>
        </div>

        <div className="row">
          <button className={mode === 'up' ? 'primary' : ''} onClick={() => setMode('up')}>
            Tạo tài khoản
          </button>
          <button className={mode === 'in' ? 'primary' : ''} onClick={() => setMode('in')}>
            Đăng nhập
          </button>
        </div>

        <label>
          Tên
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Mật khẩu demo
          <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} />
        </label>
        {error && <div className="err">{error}</div>}
        <button
          className="primary"
          onClick={() => {
            const r = mode === 'up' ? signUp(username, secret) : signIn(username, secret);
            setError(r.ok ? '' : r.error);
          }}
        >
          {mode === 'up' ? 'Tạo và vào' : 'Vào'}
        </button>
      </div>
    </div>
  );
}

/** Trang người ngoài mở link khảo sát. Không cần đăng nhập. */
function PublicSurvey({ id }: { id: string }) {
  const a = agents.byId(id);

  if (!a) {
    return (
      <div className="wrap narrow">
        <div className="card">
          <h2>Không tìm thấy khảo sát</h2>
          <p className="muted">Link sai, hoặc khảo sát được tạo trên một máy/browser khác.</p>
          <p className="muted small">
            Bản prototype lưu dữ liệu trong localStorage của từng browser, nên link public chỉ
            hoạt động trên cùng máy. Chia sẻ thật cần backend — xem README.
          </p>
        </div>
      </div>
    );
  }
  if (a.visibility !== 'public') {
    return (
      <div className="wrap narrow">
        <div className="card">
          <h2>Khảo sát này đang ở chế độ private</h2>
          <p className="muted">Chủ khảo sát cần đặt public trước khi chia sẻ link.</p>
        </div>
      </div>
    );
  }
  // Link chết sau 1 ngày. Kiểm ở đây, không phải lúc tạo — người trả lời có thể mở
  // link đúng lúc nó vừa hết hạn.
  if (!agents.conHan(a, Date.now())) {
    return (
      <div className="wrap narrow">
        <div className="card">
          <h2>Link khảo sát đã hết hạn</h2>
          <p className="muted">
            Link chỉ sống 24 giờ kể từ khi tạo (hết hạn{' '}
            {new Date(agents.hetHan(a)).toLocaleString('vi-VN')}).
          </p>
          <p className="muted small">
            Nhờ chủ khảo sát gia hạn (nút <b>gia hạn</b> trong danh sách khảo sát) rồi gửi lại
            link — link giữ nguyên, chỉ hạn được đẩy ra.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="wrap">
      <Chat agent={a} />
    </div>
  );
}

function Shell() {
  const { user, signOut } = useAuth();
  const hash = useHashRoute();
  const [open, setOpen] = useState<SubAgent | null>(null);
  // agents nằm trong localStorage nên không tự re-render. Bump để đọc lại.
  const [tick, setTick] = useState(0);
  const lamMoi = useCallback(() => setTick((t) => t + 1), []);
  // Đổi để remount Advisor (bắt đầu cuộc tư vấn mới, xoá session cũ).
  const [phienMoi, setPhienMoi] = useState(0);

  const publicMatch = hash.match(/^#\/s\/(\w+)$/);
  if (publicMatch) return <PublicSurvey id={publicMatch[1]} />;

  if (!user) return <Login />;

  const danhSach = agents
    .mine(user.id)
    .sort((a, b) => b.createdAt - a.createdAt);
  void tick;

  return (
    <div className="shell">
      <Sidebar
        username={user.username}
        danhSach={danhSach}
        dangMo={open?.id ?? null}
        onNewChat={() => {
          // Xoá session cố vấn của user rồi remount để bắt đầu cuộc mới.
          localStorage.removeItem(`daogoc.advisor.${user.id}`);
          setOpen(null);
          setPhienMoi((n) => n + 1);
        }}
        onOpen={setOpen}
        onSignOut={signOut}
        onChanged={lamMoi}
      />
      <main className="main">
        {open ? (
          <>
            <header className="mainbar">
              <button onClick={() => setOpen(null)}>← Về cố vấn</button>
              <span className="muted small">
                Bạn đang xem khảo sát <b>{open.name}</b> như người được hỏi
              </span>
            </header>
            <Chat agent={open} />
          </>
        ) : (
          <Advisor
            key={phienMoi}
            ownerId={user.id}
            onCreated={() => lamMoi()}
            onOpen={setOpen}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
