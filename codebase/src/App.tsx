import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './store/auth';
import { agents } from './store/db';
import { Chat } from './components/Chat';
import { Dashboard } from './components/Dashboard';
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
        <p className="muted">Khảo sát 5-why thích ứng — hỏi tới nguyên nhân can thiệp được.</p>

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

function Shell() {
  const { user } = useAuth();
  const hash = useHashRoute();
  const [open, setOpen] = useState<SubAgent | null>(null);

  // Link public: trả lời được không cần đăng nhập.
  const publicMatch = hash.match(/^#\/s\/([\w]+)$/);
  if (publicMatch) {
    const a = agents.byId(publicMatch[1]);
    if (!a) {
      return (
        <div className="wrap narrow">
          <div className="card">
            <h2>Không tìm thấy khảo sát</h2>
            <p className="muted">Link sai, hoặc agent được tạo trên một máy/browser khác.</p>
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
            <p className="muted">Chủ agent cần đặt public trước khi chia sẻ link.</p>
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

  if (!user) return <Login />;

  if (open) {
    return (
      <div className="wrap">
        <header className="bar">
          <button onClick={() => setOpen(null)}>← Về dashboard</button>
          <span className="muted small">{open.name}</span>
        </header>
        <Chat agent={open} />
      </div>
    );
  }

  return <Dashboard onOpen={setOpen} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
