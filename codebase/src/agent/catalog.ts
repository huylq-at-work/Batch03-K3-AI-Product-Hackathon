// Tra cứu catalog 360 đề tài capstone — thiết kế dạng TOOL, không nhồi vào context.
//
// ─── Vì sao tool chứ không nhồi cả catalog ──────────────────────────────────
//   - chi phí: 525.568 ký tự tiếng Việt ≈ 195K token/lượt. Không dùng được.
//   - CHẤT LƯỢNG (quan trọng hơn): nhồi 360 mô tả dày thì model đọc lướt cả 360.
//     Tool cho nó đọc ĐÚNG 1 đề tài đầy đủ. Precision cao hơn hẳn.
//
// Mỗi hàm có ghi chi phí token ước tính. Giữ tinh thần đó khi sửa: **hàm trả về
// gì** mới là thiết kế, không phải hàm làm được gì.
//
// ─── Vì sao TOÀN BỘ data mã hoá, không tách index plaintext ─────────────────
// Bản đầu mình tách `de-tai-index.json` (mã + khối + tên) để plaintext cho tiện
// filter. Sai: **360 tên đề tài chính là data đề tài**. Repo public chỉ chứa
// ciphertext, và mọi tool đều cần passphrase.

export interface DeTai {
  ma: string;
  khoi: string;
  ten: string;
  mo_ta: string;
  tech: string;
  dau_ra: string;
  max_team: string;
}

export type LoadError = 'thieu_key' | 'giai_ma_that_bai' | 'khong_co_file';

export const LOAD_ERROR_MSG: Record<LoadError, string> = {
  thieu_key:
    'Chưa có VITE_DE_TAI_KEY trong .env.local nên không giải mã được catalog đề tài. ' +
    'Không tra cứu được đề tài nào.',
  giai_ma_that_bai:
    'Giải mã catalog thất bại — sai passphrase hoặc file mã hoá đã bị sửa. ' +
    'KHÔNG được dùng dữ liệu này.',
  khong_co_file:
    'Chưa có src/data/de-tai.enc.json. Chạy: ' +
    'python evidence/xlsx-to-json.py <xlsx> rồi DE_TAI_KEY=<pass> node evidence/encrypt-de-tai.mjs',
};

/**
 * Catalog nằm mã hoá trong `de-tai.enc.json` (AES-256-GCM, key = SHA-256(passphrase)).
 * Passphrase ở `VITE_DE_TAI_KEY` trong `.env.local` (gitignore).
 *
 * Không giải mã được → mọi hàm tra cứu trả `{ error }` và agent phải nói rõ là
 * không tra được. **Tuyệt đối không bịa đề tài** — lớp chỗ khó ① (nguồn sự thật).
 *
 * ⚠️ Mã hoá này bảo vệ file **trên GitHub**, không bảo vệ app đã deploy: Vite
 * nhúng `VITE_*` vào bundle nên passphrase đi kèm bundle. Chỉ chạy local.
 */
let CACHE: DeTai[] | null = null;
let loadError: LoadError | null = null;
let inflight: Promise<DeTai[] | null> | null = null;

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function decryptCatalog(): Promise<DeTai[] | null> {
  const pass = import.meta.env.VITE_DE_TAI_KEY;
  if (!pass) {
    loadError = 'thieu_key';
    return null;
  }

  let enc: { iv: string; data: string };
  try {
    const mod = await import('../data/de-tai.enc.json');
    enc = (mod.default ?? mod) as typeof enc;
  } catch {
    loadError = 'khong_co_file';
    return null;
  }

  try {
    // key = SHA-256(passphrase) — phải khớp evidence/encrypt-de-tai.mjs
    const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pass));
    const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    // Bên mã hoá đã nối authTag sau ciphertext, đúng layout Web Crypto mong đợi.
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64ToBytes(enc.iv) },
      key,
      b64ToBytes(enc.data),
    );
    return JSON.parse(new TextDecoder().decode(plain)) as DeTai[];
  } catch {
    // GCM fail = sai passphrase HOẶC file bị sửa. Không phân biệt được, và không
    // nên phân biệt — cả hai đều nghĩa là "không tin được dữ liệu này".
    loadError = 'giai_ma_that_bai';
    return null;
  }
}

/** Giải mã 1 lần, cache lại. `inflight` chống giải mã song song khi nhiều tool gọi cùng lúc. */
async function load(): Promise<DeTai[] | null> {
  if (CACHE) return CACHE;
  if (loadError) return null;
  if (!inflight) {
    inflight = decryptCatalog().then((r) => {
      CACHE = r;
      inflight = null;
      return r;
    });
  }
  return inflight;
}

export function catalogLoadError(): LoadError | null {
  return loadError;
}

/** Cho UI biết catalog dùng được hay không, trước khi bắt đầu phiên. */
export async function catalogReady(): Promise<{ ok: true; tong: number } | { ok: false; message: string }> {
  const d = await load();
  if (!d) return { ok: false, message: LOAD_ERROR_MSG[loadError ?? 'khong_co_file'] };
  return { ok: true, tong: d.length };
}

type ToolError = { error: LoadError; message: string };

/** ~200 token. Danh sách khối + số đề mỗi khối. */
export async function lietKeKhoi(): Promise<
  { tong_de_tai: number; khoi: { khoi: string; so_de: number }[] } | ToolError
> {
  const d = await load();
  if (!d) return { error: loadError!, message: LOAD_ERROR_MSG[loadError!] };

  const m = new Map<string, number>();
  for (const x of d) m.set(x.khoi, (m.get(x.khoi) ?? 0) + 1);
  return {
    tong_de_tai: d.length,
    khoi: [...m.entries()]
      .map(([khoi, so_de]) => ({ khoi, so_de }))
      .sort((a, b) => b.so_de - a.so_de || a.khoi.localeCompare(b.khoi, 'vi')),
  };
}

/**
 * ~30 token/kết quả. Trả **mã + khối + tên**, KHÔNG trả mô tả — đây là bước lọc,
 * không phải bước đọc. Trả mô tả cho 10 kết quả = ~7K token và model lại đọc lướt.
 */
export async function timDeTai(opts: {
  tu_khoa?: string;
  khoi?: string;
  gioi_han?: number;
}): Promise<
  | { tong_khop: number; ket_qua: { ma: string; khoi: string; ten: string }[]; bi_cat: number }
  | ToolError
> {
  const d = await load();
  if (!d) return { error: loadError!, message: LOAD_ERROR_MSG[loadError!] };

  const kw = (opts.tu_khoa ?? '').trim().toLowerCase();
  const kh = (opts.khoi ?? '').trim().toLowerCase();
  const limit = Math.min(Math.max(opts.gioi_han ?? 10, 1), 25);

  const khop = d.filter((x) => {
    if (kh && !x.khoi.toLowerCase().includes(kh)) return false;
    if (!kw) return true;
    // Khớp TẤT CẢ từ khoá, không phải một-trong-các-từ: filter hẹp thì ít rác hơn,
    // và với 360 dòng thì hẹp tốt hơn rộng.
    return kw
      .split(/\s+/)
      .every((t) => x.ten.toLowerCase().includes(t) || x.ma.toLowerCase().includes(t));
  });

  return {
    tong_khop: khop.length,
    ket_qua: khop.slice(0, limit).map(({ ma, khoi, ten }) => ({ ma, khoi, ten })),
    // Nói rõ đã cắt bao nhiêu. Im lặng truncate làm model tưởng đã thấy hết.
    bi_cat: Math.max(0, khop.length - limit),
  };
}

/** ~700 token. Một đề tài đầy đủ. */
export async function xemDeTai(
  ma: string,
): Promise<
  | { found: DeTai }
  | { error: LoadError | 'khong_co_ma'; message: string; ma_gan_giong: string[] }
> {
  const d = await load();
  if (!d) return { error: loadError!, message: LOAD_ERROR_MSG[loadError!], ma_gan_giong: [] };

  const norm = ma.trim().toUpperCase();
  const hit = d.find((x) => x.ma.toUpperCase() === norm);
  if (hit) return { found: hit };

  // Gợi ý mã gần giống — sinh viên hay gõ "EDU1" thay vì "EDU-01".
  const stripped = norm.replace(/[^A-Z0-9]/g, '');
  const gan = d
    .filter((x) => x.ma.replace(/[^A-Z0-9]/g, '').startsWith(stripped.slice(0, 3)))
    .slice(0, 5)
    .map((x) => x.ma);

  return {
    error: 'khong_co_ma',
    message: `Không có mã "${ma}" trong catalog ${d.length} đề tài.`,
    ma_gan_giong: gan,
  };
}
