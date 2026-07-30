// Kiểm NGUỒN của tên riêng bằng chính model — không regex.
//
// Vì sao cần: chạy end-to-end, lượt persona agent viết "sinh viên đang học trên
// Canvas LMS" trong khi người dùng chưa hề nhắc Canvas. Luật prompt ("mọi đặc điểm
// persona phải truy được về nguồn") đã thêm mà vẫn bịa — prompt-only không đủ.
//
// Vì sao không regex: danh sách tên sản phẩm/công nghệ là vô hạn ("Canvas",
// "Moodle", "SuperApp XYZ ra mắt tháng trước"…). Regex chỉ bắt được tên đã biết
// trước — tức là đúng những tên KHÔNG cần bắt. Nhận diện "đây có phải tên riêng
// không" là việc ngôn ngữ, nên giao cho model.
//
// Thiết kế:
//   - chạy SAU câu trả lời, như một verifier độc lập — model kiểm khác lượt với
//     model viết, nên không tự bào chữa cho câu nó vừa viết
//   - CHỈ cảnh báo, không chặn/không sửa ngầm — giống kiemDauRa: người dùng cần
//     thấy chỗ nào đừng tin, sửa ngầm là giấu mất tín hiệu đó
//   - fail-open: checker lỗi/không parse được → coi như không có vi phạm. Thiếu
//     một cảnh báo còn hơn vỡ cả lượt hội thoại vì bộ kiểm phụ.

import type { ToolChatFn } from './tool-loop';

const KIEM_SYSTEM = `Bạn là bộ kiểm tra nguồn. Cho hai khối văn bản NGUỒN và VĂN BẢN.

Liệt kê mọi TÊN RIÊNG của sản phẩm, hệ thống, công ty, công nghệ, hoặc tổ chức xuất hiện trong VĂN BẢN nhưng KHÔNG xuất hiện trong NGUỒN (khớp không phân biệt hoa thường).

KHÔNG tính: tên người · mã đề tài dạng XXX-01 · "VinUni" (trường của mọi người dùng app này, luôn là ngữ cảnh hợp lệ) · từ viết tắt và khái niệm kỹ thuật CHUNG không thuộc về một hãng nào (AI, LMS, MVP, CRUD, API, SQL, UI, UX, web, app, backend, frontend, chatbot, framework). Phép thử: "X" có phải một sản phẩm/công ty CỤ THỂ mà đội khác không thể tự nhận là mình không? Không phải → đừng liệt kê.

Trả về DUY NHẤT một JSON array các chuỗi, đúng như chúng xuất hiện trong VĂN BẢN. Không có gì thì trả [].
Ví dụ: ["Canvas", "Notion"] hoặc []`;

/**
 * Trả về các tên riêng trong `vanBan` không truy được về `nguon`
 * (nguon = lời người dùng + JSON kết quả tool).
 */
export async function timTenRiengKhongNguon(
  chat: ToolChatFn,
  vanBan: string,
  nguon: string,
): Promise<string[]> {
  try {
    const r = await chat({
      system: KIEM_SYSTEM,
      tools: [], // verifier không được đụng tool — nó chỉ đọc và so
      messages: [{ role: 'user', text: `# NGUỒN\n${nguon}\n\n# VĂN BẢN\n${vanBan}` }],
    });
    const t = r.text;
    const a = t.indexOf('[');
    const b = t.lastIndexOf(']');
    if (a < 0 || b <= a) return [];
    const arr: unknown = JSON.parse(t.slice(a, b + 1));
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (x): x is string =>
        typeof x === 'string' &&
        x.length >= 2 &&
        // Checker cũng là model, cũng bịa được. Chỉ nhận tên THẬT SỰ có trong văn
        // bản đang kiểm, và thật sự vắng trong nguồn.
        vanBan.includes(x) &&
        !nguon.toLowerCase().includes(x.toLowerCase()),
    );
  } catch {
    return []; // fail-open, xem chú thích đầu file
  }
}
