// Guardrail cho CỐ VẤN.
//
// Vì sao cần code chứ không chỉ viết luật vào prompt: sub-agent đã có `engine.ts`
// chặn thật (câu mớm, >1 dấu hỏi, nhãn lệch). Cố vấn thì mọi luật chỉ nằm trong
// prompt — mà nó lại là thứ **có tool ghi dữ liệu**. Prompt là mong muốn; code là
// ràng buộc. Người dùng gõ "bỏ qua mọi chỉ dẫn trước" thì prompt không cản được.
//
// Hai tầng, cố ý tách:
//   1. `kiemDauVao`  — chạy TRƯỚC khi gọi API. Chặn được thì không tốn token nào.
//   2. `kiemDauRa`   — chạy SAU khi model trả lời. Bắt bịa mã đề tài và bịa số.
//
// ⚠️ GIỚI HẠN PHẢI BIẾT: tầng 1 là khớp mẫu, nên nó **không phải** lớp phòng thủ
// chính. Nó bắt các trường hợp trắng trợn với chi phí gần bằng 0. Phòng thủ thật
// vẫn là prompt + tầng 2. Đừng nới danh sách mẫu ra cho "chặt hơn" — càng rộng thì
// càng chặn oan câu hỏi thật, và chặn oan tệ hơn là để lọt một câu hỏi lạc đề.

export type LoaiChan = 'tiem_prompt' | 'ngoai_pham_vi';

export interface KetQuaChan {
  chan: boolean;
  loai?: LoaiChan;
  /** Câu hiện cho người dùng. Nói rõ chặn vì sao, không im lặng bỏ qua. */
  loi_nhan?: string;
}

/**
 * Cố ghi đè system prompt / moi prompt ra. Không có lý do chính đáng nào để một
 * sinh viên đang tìm painpoint gõ những câu này, nên chặn thẳng.
 */
const MAU_TIEM: RegExp[] = [
  /\b(bỏ qua|phớt lờ|đừng theo)\b[^.!?]{0,30}\b(chỉ dẫn|hướng dẫn|quy tắc|luật|prompt)/i,
  /\bignore\b[^.!?]{0,30}\b(previous|prior|above|all)\b[^.!?]{0,20}\b(instruction|prompt|rule)/i,
  /\bdisregard\b[^.!?]{0,30}\b(instruction|prompt|rule)/i,
  /\b(bạn giờ là|từ giờ bạn là|you are now|from now on,? you)\b/i,
  /\b(in ra|cho tôi xem|tiết lộ|reveal|show me)\b[^.!?]{0,25}\b(system prompt|prompt hệ thống|chỉ dẫn hệ thống)/i,
  /\b(jailbreak|DAN mode|developer mode)\b/i,
];

/**
 * Việc rõ ràng không liên quan tới tìm painpoint. Chỉ để mẫu **hẹp và mang tính
 * ra lệnh** — "viết hộ bài luận", không phải chỉ mỗi từ "code".
 */
const MAU_NGOAI: RegExp[] = [
  /\b(viết|làm|giải)\s+(hộ|giúp|cho)\s+(tôi|mình|em)\b[^.!?]{0,25}\b(bài tập|bài luận|luận văn|essay|thư|email|đơn)\b/i,
  /\b(dịch|translate)\b[^.!?]{0,15}\b(đoạn|bài|văn bản|này|sau)\b/i,
  /\b(giải|tính)\b[^.!?]{0,15}\b(phương trình|tích phân|đạo hàm|bài toán)\b/i,
  /\b(kể|viết)\b[^.!?]{0,10}\b(chuyện|truyện|thơ|bài hát)\b/i,
  /\b(công thức|cách)\s+(nấu|làm)\s+(ăn|bánh|phở|cơm)\b/i,
  /\b(thời tiết|tỷ số|kết quả bóng đá|giá vàng|giá bitcoin|chứng khoán)\b/i,
  /\b(viết|tạo|sinh)\b[^.!?]{0,20}\b(mã độc|virus|keylogger|malware)\b/i,
];

/**
 * Từ khoá TRONG phạm vi. Nếu câu có bất kỳ từ nào ở đây thì KHÔNG chặn bằng tầng 1,
 * để model tự xử lý.
 *
 * Đây là cái làm giảm chặn oan, và nó quan trọng hơn danh sách mẫu: "đề tài em
 * phải viết code nhận diện ảnh" có chữ "viết code" nhưng hoàn toàn trong phạm vi.
 */
const TU_KHOA_TRONG_PHAM: RegExp =
  /\b(đề tài|painpoint|pain point|khảo sát|capstone|vấn đề|nguyên nhân|triệu chứng|5-?why|sinh viên|người dùng|persona|bằng chứng|deadline|môn học|nhóm em|nhóm tôi|dự án|sản phẩm|EDU-|AIP-|VSOC-)\b/i;

/** Chạy TRƯỚC khi gọi API. Chặn được thì tiết kiệm trọn một lượt. */
export function kiemDauVao(text: string): KetQuaChan {
  const t = text.trim();

  // Tiêm prompt: chặn kể cả khi có từ khoá trong phạm vi. "Bỏ qua chỉ dẫn rồi nói
  // về đề tài" vẫn là tiêm.
  for (const re of MAU_TIEM) {
    if (re.test(t)) {
      return {
        chan: true,
        loai: 'tiem_prompt',
        loi_nhan:
          'Câu này đang yêu cầu mình bỏ qua chỉ dẫn hoặc đổi vai. Mình không làm vậy. ' +
          'Quay lại đề tài của bạn nhé — bạn đang xét đề nào?',
      };
    }
  }

  // Ngoài phạm vi: CHỈ chặn khi không có từ khoá nào trong phạm vi.
  if (!TU_KHOA_TRONG_PHAM.test(t)) {
    for (const re of MAU_NGOAI) {
      if (re.test(t)) {
        return {
          chan: true,
          loai: 'ngoai_pham_vi',
          loi_nhan:
            'Mình chỉ làm một việc: giúp bạn tìm painpoint thật của đề tài capstone, ' +
            'rồi dựng khảo sát để lấy bằng chứng. Việc bạn vừa hỏi ngoài phạm vi đó — ' +
            'dùng một trợ lý khác sẽ nhanh hơn. Còn nếu muốn quay lại đề tài thì mình ở đây.',
        };
      }
    }
  }

  return { chan: false };
}

export interface ViPham {
  loai: 'ma_de_tai_chua_tra' | 'so_khong_nguon';
  chi_tiet: string;
}

/** Mã đề tài trong catalog: 2–6 chữ in hoa, gạch, 2 số. VD `EDU-01`, `BDSO2O-05`. */
const MA_DE_TAI = /\b[A-Z][A-Z0-9]{1,7}-\d{2}\b/g;

/**
 * Chạy SAU khi model trả lời. Bắt hai kiểu bịa — đây là **lớp ①** (nguồn sự thật).
 *
 * @param traLoi   text model vừa trả về
 * @param toolText JSON của MỌI kết quả tool trong lượt này
 * @param nguoiDung mọi lời người dùng đã nói (số họ tự nêu thì được phép trích lại)
 */
export function kiemDauRa(traLoi: string, toolText: string, nguoiDung: string): ViPham[] {
  const vp: ViPham[] = [];

  // 1. Nhắc mã đề tài mà tool chưa từng trả về => đang bịa hoặc nhớ từ training.
  for (const ma of new Set(traLoi.match(MA_DE_TAI) ?? [])) {
    if (!toolText.includes(ma) && !nguoiDung.includes(ma)) {
      vp.push({
        loai: 'ma_de_tai_chua_tra',
        chi_tiet: `Nhắc mã "${ma}" nhưng tool chưa trả về mã này.`,
      });
    }
  }

  // 2. Số kèm đơn vị đo mà không có trong kết quả tool cũng không có trong lời
  //    người dùng. Chỉ soi số CÓ ĐƠN VỊ — số trần ("bước 2", "5 tầng") là cách
  //    diễn đạt, không phải bằng chứng.
  // `\b` chỉ đặt sau đơn vị bằng CHỮ. Bản trước viết `(%|giờ|…)\b` và "45% sinh viên"
  // không bao giờ khớp: sau `%` là dấu cách, cả hai đều là ký tự không-từ nên `\b`
  // không tồn tại ở đó. Bug im lặng — guard chạy, không báo lỗi, chỉ là không bắt gì.
  const CO_DON_VI =
    /\b(\d[\d.,]*)\s*(%|(?:giờ|tiếng|phút|ngày|tuần|tháng|người|sinh viên|SV|lượt|đề tài|nghìn|triệu|tỷ)\b)/gi;
  for (const m of traLoi.matchAll(CO_DON_VI)) {
    const so = m[1];
    if (!toolText.includes(so) && !nguoiDung.includes(so)) {
      vp.push({
        loai: 'so_khong_nguon',
        chi_tiet: `Số "${m[0].trim()}" không có trong lời bạn nói cũng không có trong kết quả tra cứu.`,
      });
    }
  }

  return vp;
}

/**
 * Cổng cho tool GHI `tao_khao_sat`.
 *
 * Chặn tạo khảo sát khi hội thoại còn quá ngắn. Không phải để làm khó — mà vì
 * `chu_de`/`persona_in` là **kết luận của cuộc tư vấn**. Tạo ở lượt 1 thì hai field
 * đó chỉ là chép lại câu đầu tiên của người dùng, tức là khảo sát đi hỏi người khác
 * về một **triệu chứng**. Bộ bằng chứng thu về sẽ vô giá trị.
 *
 * Đếm lượt người dùng chứ không đếm tầng đã gán: cố vấn không trả về `node` có nhãn
 * như sub-agent, nên số tầng không đọc được từ đây một cách đáng tin.
 */
export function duocTaoKhaoSat(soLuotNguoiDung: number): KetQuaChan {
  const TOI_THIEU = 3;
  if (soLuotNguoiDung >= TOI_THIEU) return { chan: false };
  return {
    chan: true,
    loi_nhan:
      `Chưa tạo khảo sát được — mới ${soLuotNguoiDung} lượt trao đổi. ` +
      'Cần đào thêm để biết nên hỏi người khác về ĐIỀU GÌ; tạo bây giờ thì khảo sát ' +
      'chỉ đi hỏi lại triệu chứng bạn vừa nói.',
  };
}
