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
import { co } from '../env';

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
  // Qua `co()` chứ không đọc thẳng import.meta.env: hàm này chạy ở TOP LEVEL
  // (dòng CATALOG_TOOLS) nên trong Node — nơi import.meta.env là undefined —
  // eval/runner.ts nổ ngay lúc import module. Xem src/env.ts.
  return co('DISABLE_DE_TAI_TOOLS');
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
 * Tool để cố vấn TỰ TẠO sub-agent khảo sát.
 *
 * Đây là chỗ "tự động tạo sub-agent": người dùng không phải điền form nào. Cố vấn
 * đào 5-why với họ trước, và chỉ khi đã biết cần hỏi ai về cái gì thì mới tạo —
 * nên `chu_de`/`persona_in` là kết luận của cuộc tư vấn, không phải input người
 * dùng đoán từ đầu.
 *
 * ⚠️ Tool này GHI dữ liệu (khác 3 tool catalog chỉ đọc). Nên nó không được tự chạy
 * ngầm: `runTool` trả về bản nháp kèm `can_xac_nhan: true`, và UI phải để người
 * dùng bấm xác nhận. Agent tạo hàng loạt khảo sát rác là lỗi rất khó dọn khi mọi
 * thứ nằm trong localStorage.
 */
export const TAO_KHAO_SAT_TOOL = {
  name: 'tao_khao_sat',
  description:
    'Tạo một chatbot khảo sát 5-why để người dùng gửi cho người khác trả lời. ' +
    'CHỈ gọi khi đã đào 5-why với chính người dùng và xác định được: hỏi AI về vấn đề gì, ' +
    'và hỏi NHÓM NGƯỜI NÀO. Đừng gọi ở lượt đầu — lúc đó chưa biết hỏi gì. ' +
    'Tool trả về bản nháp; người dùng sẽ bấm xác nhận rồi mới có link.',
  input_schema: {
    type: 'object',
    properties: {
      ten: { type: 'string', description: 'Tên ngắn của khảo sát, hiện trên sidebar.' },
      chu_de: {
        type: 'string',
        description:
          'Vấn đề cần đào, viết theo góc nhìn NGƯỜI TRẢ LỜI. ' +
          'Không nhắc kết luận của người dùng — nhắc là mớm đáp án.',
      },
      persona_in: {
        type: 'string',
        description: 'Nhóm người sẽ trả lời, cụ thể. VD: "SV VinUni K3/K4 đang chọn đề tài".',
      },
      so_tang: { type: 'integer', description: 'Số tầng why tối đa, 3–7. Mặc định 5.' },
      cong_khai: {
        type: 'boolean',
        description: 'true = ai có link cũng trả lời được (cần cho người ngoài nhóm). Mặc định true.',
      },
    },
    required: ['ten', 'chu_de', 'persona_in'],
    additionalProperties: false,
  },
} as const;

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

    // Tool GHI: không tự lưu ở đây. Trả bản nháp, UI cho người dùng xác nhận.
    // Xem chú thích ở TAO_KHAO_SAT_TOOL.
    case 'tao_khao_sat': {
      const ten = typeof input.ten === 'string' ? input.ten.trim() : '';
      const chu_de = typeof input.chu_de === 'string' ? input.chu_de.trim() : '';
      const persona_in = typeof input.persona_in === 'string' ? input.persona_in.trim() : '';
      if (!ten || !chu_de || !persona_in) {
        return {
          error: 'thieu_thong_tin',
          message: 'Cần đủ ten, chu_de, persona_in. Hỏi người dùng cho rõ trước khi tạo.',
        };
      }
      return {
        can_xac_nhan: true,
        nhap: {
          ten,
          chu_de,
          persona_in,
          so_tang: Math.min(Math.max(typeof input.so_tang === 'number' ? input.so_tang : 5, 3), 7),
          cong_khai: input.cong_khai !== false,
        },
        message:
          'Đã dựng bản nháp khảo sát. Nói cho người dùng biết bạn định hỏi ai về cái gì, ' +
          'và bảo họ bấm "Tạo khảo sát" để lấy link. CHƯA có link ở bước này — đừng bịa link.',
      };
    }

    default:
      return { error: 'tool_khong_ton_tai', name };
  }
}

/** Tool của cố vấn: 3 tool catalog (nếu không bị tắt) + tool tạo khảo sát. */
export const ADVISOR_TOOLS = [...CATALOG_TOOLS, TAO_KHAO_SAT_TOOL];

/**
 * Prompt CỐ VẤN — agent chính, cái người dùng nói chuyện khi mở app.
 *
 * Việc của nó là **tư vấn và dẫn người dùng tìm painpoint của chính họ**. Tạo
 * khảo sát chỉ là bước cuối, khi đã biết cần hỏi ai về cái gì.
 *
 * Khác prompt của sub-agent (`prompt.ts`) ở một điểm cốt lõi: sub-agent PHẢI hỏi
 * đúng một câu mỗi lượt và không được giải thích gì (nó đang lấy bằng chứng từ
 * người lạ). Cố vấn thì được phép giải thích, được phép nói người dùng đang nhầm
 * — vì người dùng là người cần học cách đào, không phải đối tượng bị đo.
 */
export const ADVISOR_SYSTEM_PROMPT = `Bạn là cố vấn giúp sinh viên VinUni khoá 3/khoá 4 tìm ra **painpoint thật** của đề tài capstone mà họ đang làm.

Vấn đề bạn tồn tại để giải quyết: sinh viên hay nhận nhầm **triệu chứng** ("khó chọn đề", "mất thời gian") là painpoint, rồi xây sản phẩm cho triệu chứng đó. Việc của bạn là đào xuống tới nguyên nhân **can thiệp được**.

# Bốn bước, theo thứ tự

**1. Đề tài nào.** Hỏi họ đang xét đề tài capstone nào.
- Có mã đề (EDU-01, AIP-02…) → gọi \`xem_de_tai\` ngay.
- Nói chủ đề chung chung → \`tim_de_tai\`, rồi để họ chọn mã.
- Chưa biết bắt đầu từ đâu → \`liet_ke_khoi\`.
- Chưa chọn được đề nào cũng không sao, vẫn đào được. **Đừng ép họ chọn.**

**2. Đào 5-why với CHÍNH HỌ.** Mỗi lượt hỏi một câu "vì sao". Với mỗi câu trả lời, nói thẳng nó là:
- **triệu chứng** — biểu hiện bề mặt, chưa nói vì sao
- **điều kiện** — hoàn cảnh không đổi được (deadline trường đặt, số lượng đề)
- **nguyên nhân** — một hành động, lựa chọn, hoặc một cái ĐANG THIẾU mà nếu bù vào thì vấn đề hết. **Chỉ loại này mới can thiệp được.**

Phép thử: *"làm gì để việc này không còn đúng nữa?"* Trả lời được cụ thể → nguyên nhân. Không → đào tiếp.

**3. Chốt painpoint.** Khi tới nguyên nhân can thiệp được, phát biểu lại painpoint trong một câu, và nói rõ nó khác gì với câu họ nói ban đầu.

**4. Tạo khảo sát để lấy bằng chứng.** Painpoint mới chỉ là của một người. Giải thích cho họ: cần hỏi thêm người khác mới biết đây là vấn đề chung hay chỉ riêng họ. Rồi gọi \`tao_khao_sat\` với:
- \`chu_de\`: viết theo góc nhìn NGƯỜI TRẢ LỜI, **không nhắc kết luận của người dùng** — nhắc là mớm đáp án cho người trả lời.
- \`persona_in\`: nhóm người cụ thể cần hỏi.

Tool trả bản nháp, **chưa có link**. Nói họ bấm "Tạo khảo sát". Đừng bịa link.

# Luật cứng
- **Chỉ nói về đề tài mà tool đã trả về.** Không có trong kết quả tool thì nói thẳng là không tra được. Tuyệt đối không mô tả đề tài từ suy đoán.
- \`bi_cat\` > 0 nghĩa là còn kết quả bạn CHƯA thấy. Bảo họ thu hẹp, đừng kết luận trên phần đã thấy.
- **Không phát biểu về thị trường, đối thủ, hay "đã có ai làm chưa"** — bạn không có tool tra cứu những thứ đó.
- **Không bịa số.** Người dùng nói số thì trích nguyên văn của họ. Bạn tự nghĩ ra số thì nói rõ đó là phỏng đoán.
- **Đừng gọi \`tao_khao_sat\` ở lượt đầu.** Lúc đó chưa biết hỏi gì, tạo ra là khảo sát rác.
- Một câu hỏi mỗi lượt ở bước 2. Đừng hỏi dồn.
- Không khen ("câu hỏi hay!"). Không nhắc lại lời họ rồi mới trả lời.

# Giọng
Ngắn. Thẳng. Nói được là họ đang nhầm thì nói. Người dùng cần đào đúng, không cần được đồng ý.`;
