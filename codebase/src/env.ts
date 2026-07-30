// Đọc biến môi trường ở CẢ HAI môi trường: browser (Vite) và Node (eval runner).
//
// Vì sao cần: `codebase/src/agent/*` được import từ hai phía —
//   - browser qua Vite, nơi có `import.meta.env` (Vite nhúng các biến VITE_*)
//   - Node qua `eval/runner.ts`, nơi `import.meta.env` là **undefined**
// Viết thẳng `import.meta.env.VITE_X` thì runner nổ ngay lúc import module, vì
// `tools.ts` gọi hàm này ở top level (để tính CATALOG_TOOLS).
//
// Node side dùng tên KHÔNG có tiền tố VITE_ (xem .env.example) nên tra cả hai tên.

/** Vite định nghĩa `import.meta.env` là object thật, nên tra key động vẫn được. */
const VITE_ENV = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ??
  undefined) as Record<string, string | undefined> | undefined;

/**
 * Tra `VITE_<ten>` trước (browser), rồi `<ten>` (Node). Trả `undefined` nếu không có.
 *
 * @param ten tên biến KHÔNG kèm tiền tố, ví dụ `DE_TAI_KEY`.
 */
export function bien(ten: string): string | undefined {
  const v = VITE_ENV?.[`VITE_${ten}`];
  if (v !== undefined && v !== '') return v;

  // `globalThis.process` thay vì `process` trực tiếp: trong browser không có
  // `process`, tham chiếu thẳng sẽ ném ReferenceError.
  const p = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const n = p?.env?.[`VITE_${ten}`] ?? p?.env?.[ten];
  return n !== undefined && n !== '' ? n : undefined;
}

/** Cờ bật/tắt: chỉ đúng chuỗi "true" (không phân biệt hoa thường) mới là bật. */
export function co(ten: string): boolean {
  return String(bien(ten) ?? '').toLowerCase() === 'true';
}
