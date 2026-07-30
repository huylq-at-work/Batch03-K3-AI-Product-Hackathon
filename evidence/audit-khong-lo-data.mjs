/**
 * Chứng minh data đề tài KHÔNG lộ trong những gì sắp commit.
 *
 *     node evidence/audit-khong-lo-data.mjs
 *
 * CHẠY TRƯỚC MỖI `git commit`. Exit code 1 nếu có vấn đề.
 *
 * Vì sao không tin `.gitignore` là đủ: .gitignore chỉ nói file NÀO bị chặn, nó
 * không biết NỘI DUNG. Ba cách data vẫn lộ dù .gitignore đúng:
 *   - plaintext bị paste vào một file khác (tài liệu, comment, test fixture)
 *   - plaintext từng commit rồi bị xoá → vẫn nằm trong history vĩnh viễn
 *   - output build (mọi thư mục `dist...`) chứa CẢ passphrase LẪN ciphertext, vì
 *     Vite nhúng mọi biến VITE_* vào bundle dạng chuỗi thô
 *
 * Nên audit này đọc NỘI DUNG THẬT của từng file sắp commit, và quét cả history.
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, createDecipheriv } from 'node:crypto';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const git = (c) => execSync(`git -C "${REPO}" ${c}`, { encoding: 'utf8' });

let fail = 0;

/**
 * Passphrase từ .env.local. Chỉ dùng để giải mã và để tự quét chính nó —
 * KHÔNG BAO GIỜ in ra, chỉ in độ dài.
 */
const envPath = join(REPO, 'codebase/.env.local');
const pass = existsSync(envPath)
  ? ((readFileSync(envPath, 'utf8').split('\n').find((l) => l.startsWith('VITE_DE_TAI_KEY=')) ?? '')
      .slice('VITE_DE_TAI_KEY='.length)
      .trim())
  : '';

const encPath = join(REPO, 'codebase/src/data/de-tai.enc.json');

/**
 * Canary = chuỗi chỉ tồn tại trong catalog PLAINTEXT.
 *
 * ⚠️ TUYỆT ĐỐI KHÔNG hardcode canary vào file này. Bản đầu mình để 5 chuỗi
 * plaintext (3 tên đề + 2 câu mở đầu mô tả) — và chính audit bắt được: commit
 * script kiểm-tra-lộ-data lại là hành động làm lộ data. Một file kiểm tra bí mật
 * không được phép chứa bí mật.
 *
 * Nên canary sinh tại chỗ từ `de-tai.enc.json` đã giải mã. Ba lợi ích:
 *   - repo không chứa chuỗi plaintext nào
 *   - quét được TOÀN BỘ 360 tên + 360 mô tả, không phải 5 mẫu
 *   - đổi file xlsx thì canary tự đổi theo, không phải sửa tay
 */
function layCanary() {
  if (pass.length < 32 || !existsSync(encPath)) return null;
  try {
    const enc = JSON.parse(readFileSync(encPath, 'utf8'));
    const key = createHash('sha256').update(pass, 'utf8').digest();
    const buf = Buffer.from(enc.data, 'base64');
    const d = createDecipheriv('aes-256-gcm', key, Buffer.from(enc.iv, 'base64'));
    // authTag ở 16 byte CUỐI — layout để Web Crypto đọc được.
    d.setAuthTag(buf.subarray(buf.length - 16));
    const list = JSON.parse(
      Buffer.concat([d.update(buf.subarray(0, buf.length - 16)), d.final()]).toString('utf8'),
    );

    // Tên đề tài: dùng nguyên văn. Mô tả: lấy 60 ký tự đầu đã gộp khoảng trắng —
    // đủ đặc trưng để không khớp ngẫu nhiên, ngắn đủ để không tốn bộ nhớ.
    const ten = list.map((x) => x.ten).filter((s) => s && s.length >= 12);
    const moTa = list
      .map((x) => (x.mo_ta ?? '').replace(/\s+/g, ' ').trim().slice(0, 60))
      .filter((s) => s.length >= 40);
    return { list, chuoi: [...new Set([...ten, ...moTa])] };
  } catch {
    return null;
  }
}

const cat = layCanary();

/** File sắp commit = mọi file `git add .` sẽ nhận (đã trừ .gitignore). `-n` = dry-run. */
console.log('=== A. File sẽ được commit ===');
const staged = git('add -An .')
  .split('\n')
  .map((l) => l.match(/^add '(.+)'$/)?.[1])
  .filter(Boolean);
if (staged.length === 0) console.log('  (không có thay đổi nào)');
staged.forEach((f) => console.log(`  ${f}`));

/** Đọc text an toàn — bỏ qua file nhị phân / không đọc được. */
const readText = (rel) => {
  const p = join(REPO, rel);
  if (!existsSync(p)) return null;
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return null;
  }
};

console.log('\n=== B. Quét canary trong từng file sẽ commit ===');
if (!cat) {
  console.log('  ✗ Không giải mã được catalog nên KHÔNG kiểm được nội dung.');
  console.log('    Cần codebase/.env.local có VITE_DE_TAI_KEY đúng. Coi như FAIL:');
  console.log('    "không kiểm được" khác "đã kiểm và sạch".');
  fail += 1;
} else {
  console.log(`  Canary: ${cat.chuoi.length} chuỗi sinh từ ${cat.list.length} đề tài đã giải mã.`);
  let hitB = 0;
  for (const rel of staged) {
    const txt = readText(rel);
    if (txt === null) continue;
    const hits = cat.chuoi.filter((c) => txt.includes(c));
    if (hits.length) {
      // In SỐ LƯỢNG, không in chuỗi khớp — in ra là lộ thêm một lần nữa.
      console.log(`  ✗ LỘ  ${rel}  →  khớp ${hits.length} chuỗi catalog`);
      hitB += 1;
    }
  }
  fail += hitB;
  if (!hitB) console.log('  ✓ Không file nào chứa tên/mô tả đề tài ở dạng đọc được.');
}

/**
 * Passphrase là canary MẠNH NHẤT: lộ nó = lộ toàn bộ 360 đề tài, vì ciphertext
 * đã công khai trên GitHub và KDF không salt (brute-force offline vô hạn lần).
 */
console.log('\n=== B2. Quét PASSPHRASE trong từng file sẽ commit ===');
if (pass.length < 32) {
  console.log('  ⚠ Bỏ qua — codebase/.env.local chưa có passphrase ≥32 ký tự.');
  console.log('    (không tính là FAIL: máy chưa cấu hình thì cũng không có gì để lộ)');
} else {
  let hitP = 0;
  for (const rel of staged) {
    const txt = readText(rel);
    if (txt !== null && txt.includes(pass)) {
      console.log(`  ✗ LỘ PASSPHRASE  ${rel}`);
      hitP += 1;
    }
  }
  fail += hitP;
  if (!hitP) console.log(`  ✓ Không file nào chứa passphrase (<${pass.length} ký tự>).`);

  const hist = git(`log -S"${pass}" --all --pretty=format:%h`).trim();
  console.log(
    hist ? `  ✗ passphrase từng có trong commit: ${hist}` : '  ✓ Chưa từng vào bất kỳ commit.',
  );
  if (hist) fail += 1;
}

console.log('\n=== C. Git history (mọi branch, mọi commit) ===');
for (const f of ['de-tai.json', 'de-tai-index.json', 'de-tai-full.json', '.env.local',
                 'Danh_sach_de_tai.xlsx']) {
  const out = git(`log --all --pretty=format:%h -- "**/${f}"`).trim();
  const ok = !out;
  console.log(`  ${ok ? '✓' : '✗ CÓ TRONG HISTORY:'} ${f}${ok ? ' — chưa từng commit' : ' ' + out}`);
  if (!ok) fail += 1;
}

/**
 * `git log -S<str> --all` tìm mọi commit từng THÊM hoặc XOÁ chuỗi đó, ở bất kỳ
 * file nào — bắt cả trường hợp plaintext lọt vào một file tên khác rồi bị xoá.
 * Tầng C chỉ kiểm theo TÊN file; tầng này kiểm theo NỘI DUNG.
 */
console.log('\n=== D. Canary trong toàn bộ history (pickaxe -S) ===');
if (!cat) {
  console.log('  ✗ Không có canary để quét (xem tầng B).');
} else {
  // Chỉ lấy MẪU, không quét cả 360: mỗi chuỗi là một lần gọi `git log` trên toàn
  // bộ history. 360 lần ≈ vài phút và không tăng độ phủ đáng kể — plaintext lọt
  // vào history thì lọt cả file, không lọt lẻ 1 dòng. Mẫu rải đều theo chỉ số để
  // kết quả tái lập được (không random).
  const buoc = Math.max(1, Math.floor(cat.list.length / 5));
  const mau = [0, buoc, buoc * 2, buoc * 3, cat.list.length - 1]
    .map((i) => cat.list[i]?.ten)
    .filter((s) => s && s.length >= 12);

  let hitD = 0;
  for (const c of mau) {
    // -S nhận chuỗi con; escape " để không vỡ command line.
    const out = git(`log -S"${c.replace(/"/g, '\\"')}" --all --pretty=format:%h`).trim();
    if (out) {
      console.log(`  ✗ một tên đề tài từng có trong commit: ${out.split('\n').join(' ')}`);
      hitD += 1;
    }
  }
  fail += hitD;
  if (!hitD) {
    console.log(`  ✓ ${mau.length} tên đề tài mẫu chưa từng xuất hiện trong bất kỳ commit.`);
  }
}

console.log('\n=== E. File .enc có thật là ciphertext? ===');
if (!existsSync(encPath)) {
  console.log('  ⚠ Chưa có de-tai.enc.json — chạy evidence/encrypt-de-tai.mjs.');
} else {
  const enc = JSON.parse(readFileSync(encPath, 'utf8'));
  console.log(`  alg=${enc.alg} kdf=${enc.kdf}`);
  console.log(`  iv   ${enc.iv.length} ký tự base64 (12 byte)`);
  console.log(`  data ${enc.data.length.toLocaleString('vi-VN')} ký tự base64`);
  const printable = /^[A-Za-z0-9+/=]+$/.test(enc.data);
  console.log(`  ${printable ? '✓' : '✗'} data thuần base64, không lẫn text đọc được`);
  if (!printable) fail += 1;
}

/**
 * Output build chứa CẢ passphrase LẪN ciphertext. `dist/` chặn từ đầu, nhưng một
 * lần chạy `vite build --outDir dist-test` đã tạo thư mục KHÔNG bị chặn — suýt lọt.
 * Nên chặn theo mẫu, và kiểm lại ở đây.
 */
console.log('\n=== F. Mọi thư mục build đều bị chặn? ===');
for (const dir of ['dist', 'dist-test', 'dist2', 'build']) {
  let ignored = true;
  try {
    git(`check-ignore -q codebase/${dir}/index.html`);
  } catch {
    ignored = false;
  }
  console.log(`  ${ignored ? '✓' : '✗ KHÔNG BỊ CHẶN:'} codebase/${dir}/`);
  if (!ignored) fail += 1;
}

/**
 * Tầng B chỉ quét file SẮP commit. Nhưng "lộ ra ngoài" là tính trên TOÀN BỘ repo
 * đã public, kể cả file commit từ lâu và file thừa hưởng từ upstream. Nên quét lại
 * mọi file đang được git theo dõi.
 *
 * `data/vlearn-pack/` là data pack ban tổ chức cấp, đã có trong repo gốc
 * VinUni-AI20k từ trước. Xoá khỏi fork này KHÔNG làm nó biến mất khỏi repo gốc —
 * nên nó được tính là "đã public từ upstream", không phải lỗi của nhóm. Vẫn báo
 * số lượng để biết mà không im lặng.
 *
 * Vì sao phải phân loại thay vì FAIL hết: một audit FAIL vĩnh viễn vì chuyện
 * không sửa được thì mọi người sẽ bỏ qua nó — tệ hơn là không có audit.
 */
const UPSTREAM = ['data/vlearn-pack/'];

console.log('\n=== G. Toàn bộ file git đang theo dõi ===');
if (!cat) {
  console.log('  ✗ Không có canary để quét (xem tầng B).');
} else {
  const tracked = git('ls-files').split('\n').map((s) => s.trim()).filter(Boolean);
  let loNhom = 0;
  const loUpstream = [];

  for (const rel of tracked) {
    const txt = readText(rel);
    if (txt === null) continue;
    const n = cat.chuoi.filter((c) => txt.includes(c)).length;
    if (!n) continue;
    if (UPSTREAM.some((p) => rel.replace(/\\/g, '/').startsWith(p))) {
      loUpstream.push([rel, n]);
    } else {
      console.log(`  ✗ LỘ (do nhóm)  ${rel} → khớp ${n} chuỗi`);
      loNhom += 1;
    }
  }
  fail += loNhom;

  console.log(`  Đã quét ${tracked.length} file.`);
  if (!loNhom) console.log('  ✓ Không file nào do nhóm tạo chứa data đề tài đọc được.');
  for (const [rel, n] of loUpstream) {
    console.log(`  ⚠ upstream  ${rel} → khớp ${n}/${cat.list.length} đề tài`);
  }
  if (loUpstream.length) {
    console.log('    (data pack ban tổ chức cấp, public trong repo gốc từ trước — sinh viên');
    console.log('     paste nguyên mô tả đề tài vào chatlog. Không tính FAIL: xoá khỏi fork');
    console.log('     không xoá được khỏi repo gốc.)');
  }
}

console.log(`\n${fail === 0 ? '✓✓ PASS — data đề tài không lộ' : `✗✗ FAIL — ${fail} vấn đề`}`);
process.exit(fail === 0 ? 0 : 1);
