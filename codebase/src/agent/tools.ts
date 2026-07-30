// Tool definitions cho pha CHUẨN BỊ NGỮ CẢNH.
//
// ⚠️ THIẾT KẾ QUAN TRỌNG — đọc trước khi thêm tool:
//
// Tool KHÔNG chạy trong lượt hội thoại của stage ★. Chúng chạy MỘT LẦN ở đầu
// phiên, để agent biết sinh viên đang nói về đề tài nào. Hai lý do:
//
//  1. **Giữ nguyên giá trị của golden set.** 23 case trong `eval/golden-set.json`
//     test stage ★ ở dạng cô lập: (chain, câu hỏi, câu trả lời) → nhãn + câu tiếp.
//     Nếu nhét tool vào stage ★ thì bộ eval không còn phủ đường chạy thật, và
//     15 điểm R4 mất ý nghĩa.
//  2. **Chi phí.** Tra catalog 1 lần/phiên ≈ 2K token. Tra mỗi lượt × 6 lượt = 12K.
//
// Pha 1 (tool)  : agent hỏi sinh viên đang xem đề nào → tra catalog → chốt ngữ cảnh
// Pha 2 (stage ★): hội thoại 5-why, KHÔNG tool, output ràng buộc theo TURN_SCHEMA

import { lietKeKhoi, timDeTai, xemDeTai } from './catalog';

// Catalog mã hoá nên không đếm được mà chưa có key. Hai số này là dữ kiện công khai
// (xem evidence/mining-de-tai.md) và chỉ dùng để viết description cho tool.
const TONG_DE_TAI = 360;
const TONG_KHOI = 21;

/**
 * Tắt hoàn toàn nhóm tool chọn đề tài: `VITE_DISABLE_DE_TAI_TOOLS=true`.
 *
 * Khi tắt, phỏng vấn 5-why vẫn chạy bình thường — chỉ không có bước chọn đề tài.
 * Ba trường hợp dùng:
 *   - phỏng vấn người **không** phải sinh viên K3/K4 (họ không có catalog đề tài)
 *   - chạy golden set / demo mà không muốn phụ thuộc passphrase
 *   - cắt chi phí: bỏ pha 1 là bỏ luôn 1–3 lời gọi API mỗi phiên
 *
 * Chặn ở 3 tầng, không chỉ ẩn tool: `CATALOG_TOOLS` rỗng (model không thấy tool) ·
 * `runContextPhase` return sớm (không gọi API) · `runTool` từ chối (nếu vẫn lọt).
 * Ẩn tool một tầng thì một prompt injection hoặc một history cũ vẫn gọi được.
 */
export function deTaiToolsDisabled(): boolean {
  return String(import.meta.env.VITE_DISABLE_DE_TAI_TOOLS ?? '').toLowerCase() === 'true';
}

const ALL_CATALOG_TOOLS = [
  {
    name: 'liet_ke_khoi',
    description:
      `Liệt kê ${TONG_KHOI} khối đề tài trong catalog capstone (${TONG_DE_TAI} đề tài) kèm số đề mỗi khối. ` +
      'Gọi khi sinh viên chưa biết bắt đầu từ đâu, hoặc nói một lĩnh vực chung chung ' +
      '("em muốn làm gì về y tế"). Rẻ (~200 token). Không trả mô tả đề tài.',
    input_schema: { type: 'object', properties: {}, required: [], additionalProperties: false },
  },
  {
    name: 'tim_de_tai',
    description:
      'Tìm đề tài theo từ khoá và/hoặc khối. Trả về MÃ + KHỐI + TÊN, **không** trả mô tả — ' +
      'đây là bước lọc, không phải bước đọc. Gọi khi sinh viên nói một chủ đề nhưng chưa có mã đề. ' +
      'Kết quả bị cắt thì field `bi_cat` cho biết còn bao nhiêu; nếu `bi_cat` > 0 thì hỏi sinh viên ' +
      'thu hẹp thêm chứ đừng kết luận trên phần đã thấy.',
    input_schema: {
      type: 'object',
      properties: {
        tu_khoa: {
          type: 'string',
          description: 'Từ khoá khớp trong tên đề tài. Nhiều từ = phải khớp TẤT CẢ.',
        },
        khoi: { type: 'string', description: 'Lọc theo tên khối (khớp một phần).' },
        gioi_han: { type: 'integer', description: 'Số kết quả tối đa, 1–25. Mặc định 10.' },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: 'xem_de_tai',
    description:
      'Xem đầy đủ MỘT đề tài theo mã (ví dụ EDU-01, AIP-02, VSOC-01): tên, mô tả bài toán, ' +
      'tech stack gợi ý, yêu cầu đầu ra, max team. Tốn ~700 token nên chỉ gọi cho đề tài sinh viên ' +
      'thực sự đang xét, đừng gọi hàng loạt. ' +
      'Nếu trả về error thì NÓI RÕ là không tra được — TUYỆT ĐỐI không tự mô tả đề tài từ suy đoán.',
    input_schema: {
      type: 'object',
      properties: { ma: { type: 'string', description: 'Mã đề tài, ví dụ "EDU-01".' } },
      required: ['ma'],
      additionalProperties: false,
    },
  },
] as const;

/** Tầng 1 — model không thấy tool nào khi cờ tắt bật. */
export const CATALOG_TOOLS: typeof ALL_CATALOG_TOOLS | [] = deTaiToolsDisabled()
  ? []
  : ALL_CATALOG_TOOLS;

export type ToolName = (typeof ALL_CATALOG_TOOLS)[number]['name'];

/**
 * Thực thi tool. Trả về object sẽ được JSON.stringify vào tool_result.
 *
 * Không throw: lỗi trả về dạng `{ error }` để model đọc được và nói lại với người
 * dùng, thay vì làm vỡ cả lượt.
 */
export async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  // Tầng 3 — từ chối thực thi kể cả khi lời gọi lọt qua (history cũ, prompt injection).
  if (deTaiToolsDisabled()) {
    return {
      error: 'tool_da_tat',
      message:
        'Nhóm tool chọn đề tài đã bị tắt bằng VITE_DISABLE_DE_TAI_TOOLS=true. ' +
        'Nói với người dùng là hiện không tra được đề tài, và tiếp tục phỏng vấn 5-why bình thường.',
    };
  }

  switch (name) {
    // Trả nguyên kết quả, KHÔNG bọc thêm. Bản trước là
    //   return { tong_de_tai: TONG_DE_TAI, khoi: lietKeKhoi() };
    // và sai hai lần trong một dòng:
    //   1. thiếu `await` — `khoi` là Promise, JSON.stringify ra `{}`, nên model
    //      KHÔNG BAO GIỜ nhận được danh sách khối, kể cả khi mọi thứ bình thường.
    //   2. `TONG_DE_TAI` hằng số ghi đè số thật và **nuốt luôn `{error}`** — giải mã
    //      thất bại mà tool vẫn báo "360 đề tài", đúng đường lớp ① bịa đặt.
    // `lietKeKhoi()` đã tự trả `{tong_de_tai, khoi}` hoặc `{error, message}`.
    case 'liet_ke_khoi':
      return lietKeKhoi();

    case 'tim_de_tai':
      return timDeTai({
        tu_khoa: typeof input.tu_khoa === 'string' ? input.tu_khoa : undefined,
        khoi: typeof input.khoi === 'string' ? input.khoi : undefined,
        gioi_han: typeof input.gioi_han === 'number' ? input.gioi_han : undefined,
      });

    case 'xem_de_tai': {
      if (typeof input.ma !== 'string' || !input.ma.trim()) {
        return { error: 'thieu_ma', message: 'Cần truyền mã đề tài.' };
      }
      return xemDeTai(input.ma);
    }

    default:
      return { error: 'tool_khong_ton_tai', name };
  }
}

/** Prompt cho pha 1. Ngắn có chủ đích — pha này chỉ để chốt ngữ cảnh, không phỏng vấn. */
export const CONTEXT_SYSTEM_PROMPT = `Bạn đang giúp một sinh viên VinUni khoá 3/khoá 4 xác định họ đang xét đề tài capstone nào, trước khi bắt đầu phỏng vấn 5-why.

Bạn có 3 tool để tra catalog ${TONG_DE_TAI} đề tài. Dùng chúng — **đừng đoán**.

# Luật
- Sinh viên đưa mã đề (EDU-01, AIP-02…) → gọi \`xem_de_tai\` ngay.
- Sinh viên nói chủ đề nhưng chưa có mã → \`tim_de_tai\`, rồi hỏi họ chọn mã nào.
- Sinh viên chưa biết bắt đầu từ đâu → \`liet_ke_khoi\`.
- **Chỉ nói về đề tài mà tool đã trả về.** Không có trong kết quả tool thì nói không tra được. Không mô tả đề tài từ suy đoán, không phát biểu về thị trường hay việc "đã có ai làm chưa".
- \`bi_cat\` > 0 nghĩa là còn kết quả bạn CHƯA thấy. Hỏi sinh viên thu hẹp, đừng kết luận.
- Sinh viên chưa chọn được đề nào cũng không sao — phỏng vấn 5-why vẫn chạy được mà không cần đề tài. Đừng ép họ chọn.

# Xong việc
Khi đã chốt được (a) một mã đề tài, hoặc (b) sinh viên nói rõ chưa chọn được — dừng gọi tool và tóm tắt trong **2 câu**: đề tài nào (hoặc chưa có), và một câu về vấn đề mà mô tả đề tài nêu. Đó là ngữ cảnh cho pha phỏng vấn.

Ngắn gọn. Không khen. Không dạy.`;
