/**
 * Mã hoá mô tả 360 đề tài để commit được vào repo public.
 *
 *   # sinh passphrase mạnh (chạy 1 lần, lưu vào .env.local, KHÔNG commit)
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
 *
 *   # mã hoá
 *   DE_TAI_KEY=<passphrase> node evidence/encrypt-de-tai.mjs
 *
 * Đọc  : codebase/src/data/de-tai.json      (plaintext, gitignore)
 * Ghi  : codebase/src/data/de-tai.enc.json  (ciphertext, COMMIT ĐƯỢC)
 *
 * ─── Thuật toán ───────────────────────────────────────────────────────────
 *   key        = SHA-256(passphrase)          → 32 byte
 *   ciphertext = AES-256-GCM(plaintext, key, iv ngẫu nhiên 12 byte)
 *   data       = base64( ciphertext || authTag )
 *
 * authTag được nối vào SAU ciphertext vì Web Crypto API trong browser mong đợi
 * đúng layout đó khi decrypt. Node thì trả tag riêng — chỗ này là lỗi kinh điển
 * khi ghép Node ↔ Web Crypto, nên nối ở đây một lần cho xong.
 *
 * ─── Mô hình bảo vệ: nó bảo vệ cái gì, KHÔNG bảo vệ cái gì ────────────────
 *
 * ✅ BẢO VỆ: file trên GitHub. Ai xem repo public chỉ thấy base64, không đọc
 *    được mô tả đề tài.
 *
 * ❌ KHÔNG BẢO VỆ khi app được deploy. Vite nhúng mọi biến VITE_* vào bundle JS,
 *    nên passphrase đi kèm bundle → ai mở DevTools cũng giải mã được. Đây là
 *    CÙNG MỘT vấn đề với API key (xem codebase/README.md §Bảo mật).
 *    → Chỉ chạy local. Không deploy.
 *
 * ⚠️ SHA-256(passphrase) là KDF yếu: không salt, không iteration. Passphrase yếu
 *    ("123456") thì brute-force ra trong vài giây. Bắt buộc dùng passphrase ngẫu
 *    nhiên ≥32 byte như lệnh ở đầu file. Muốn chắc hơn thì đổi sang PBKDF2 với
 *    ≥600k iteration — nhưng khi đó phải sửa cả phía giải mã trong catalog.ts.
 */

import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(REPO, 'codebase/src/data/de-tai.json');
const OUT = resolve(REPO, 'codebase/src/data/de-tai.enc.json');

const pass = process.env.DE_TAI_KEY;
if (!pass) {
  console.error('Thiếu DE_TAI_KEY. Sinh passphrase mới:');
  console.error('  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64url\'))"');
  process.exit(1);
}
if (pass.length < 32) {
  console.error(`DE_TAI_KEY chỉ ${pass.length} ký tự — quá ngắn cho KDF không salt.`);
  console.error('Cần ≥32 ký tự ngẫu nhiên. Xem lệnh sinh passphrase ở đầu file này.');
  process.exit(1);
}

const plaintext = readFileSync(SRC, 'utf8');
const key = createHash('sha256').update(pass, 'utf8').digest();
const iv = randomBytes(12);

const cipher = createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
const payload = Buffer.concat([ct, cipher.getAuthTag()]); // ct || tag — cho Web Crypto

writeFileSync(
  OUT,
  JSON.stringify(
    {
      v: 1,
      alg: 'AES-256-GCM',
      kdf: 'SHA-256(passphrase)',
      note: 'Giai ma bang codebase/src/agent/catalog.ts. Passphrase o VITE_DE_TAI_KEY trong .env.local.',
      iv: iv.toString('base64'),
      data: payload.toString('base64'),
    },
    null,
    2,
  ),
  'utf8',
);

const kb = (p) => `${(statSync(p).size / 1024).toFixed(0)} KB`;
console.log(`plaintext  ${kb(SRC)}  ${SRC.replace(REPO + '\\', '')}`);
console.log(`ciphertext ${kb(OUT)}  ${OUT.replace(REPO + '\\', '')}`);
console.log('\nCommit file .enc.json. KHÔNG commit de-tai.json và KHÔNG commit passphrase.');
