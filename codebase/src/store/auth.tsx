import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { session, users } from './db';
import type { User } from '../types';

/**
 * ⚠️ ĐÂY KHÔNG PHẢI BẢO MẬT THẬT — ĐỌC TRƯỚC KHI DÙNG.
 *
 * Auth này chạy hoàn toàn client-side trên localStorage:
 *   - "mật khẩu" lưu ở dạng plaintext trong localStorage của browser
 *   - không có server, nên không có gì để xác minh — ai sửa localStorage là đăng
 *     nhập được thành bất kỳ ai
 *   - không có session token, không hết hạn, không chống brute-force
 *
 * Nó tồn tại để phân tách "agent của tôi" với "agent của người khác" trong bản
 * demo, KHÔNG để bảo vệ dữ liệu.
 *
 * => Đừng dùng mật khẩu thật ở đây. Đừng deploy. Đừng đưa dữ liệu cần bảo mật
 *    vào. Muốn có auth thật thì cần backend + password hashing (argon2/bcrypt)
 *    + session token — nằm ngoài phạm vi hackathon (spec.md §4 non-goals).
 */

interface AuthValue {
  user: User | null;
  signIn(username: string, secret: string): { ok: true } | { ok: false; error: string };
  signUp(username: string, secret: string): { ok: true } | { ok: false; error: string };
  signOut(): void;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const id = session.get();
    if (!id) return null;
    const found = users.all().find((u) => u.id === id);
    return found ? { id: found.id, username: found.username } : null;
  });

  const value = useMemo<AuthValue>(
    () => ({
      user,
      signIn(username, secret) {
        const found = users.byName(username);
        if (!found || found.secret !== secret) {
          return { ok: false, error: 'Tên hoặc mật khẩu không đúng.' };
        }
        session.set(found.id);
        setUser({ id: found.id, username: found.username });
        return { ok: true };
      },
      signUp(username, secret) {
        if (username.trim().length < 2) return { ok: false, error: 'Tên cần ≥2 ký tự.' };
        if (secret.length < 4) return { ok: false, error: 'Mật khẩu cần ≥4 ký tự.' };
        if (users.byName(username)) return { ok: false, error: 'Tên này đã có người dùng.' };
        const u = users.create(username.trim(), secret);
        session.set(u.id);
        setUser({ id: u.id, username: u.username });
        return { ok: true };
      },
      signOut() {
        session.set(null);
        setUser(null);
      },
    }),
    [user],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth phải nằm trong <AuthProvider>');
  return v;
}
