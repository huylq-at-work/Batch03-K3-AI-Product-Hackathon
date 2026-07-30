// Sinh bí danh ẩn danh kiểu Google Docs ("Sóc hài hước", "Chuột chù thông minh").
//
// Không có kho tên tiếng Việt sẵn nên tự dựng: [con vật] + [tính từ]. Người trả
// lời khảo sát thường muốn ẩn danh nhưng vẫn có một cái tên dễ nhớ để phân biệt —
// bí danh vui làm việc đó, và giảm ngại khi bắt đầu.

const CON_VAT = [
  'Sóc', 'Chuột chù', 'Cáo', 'Mèo', 'Gấu trúc', 'Cú mèo', 'Rái cá', 'Nhím', 'Hươu',
  'Thỏ', 'Chồn', 'Sư tử', 'Hổ', 'Gấu', 'Cá heo', 'Chim sẻ', 'Đại bàng', 'Tắc kè',
  'Rùa', 'Hải ly', 'Lửng', 'Báo', 'Khỉ', 'Vẹt', 'Cú', 'Dơi', 'Ong', 'Kiến',
];

const TINH_TU = [
  'hài hước', 'thông minh', 'lanh lợi', 'tò mò', 'điềm tĩnh', 'dũng cảm', 'chăm chỉ',
  'tinh nghịch', 'vui tính', 'láu cá', 'hiền lành', 'nhanh nhẹn', 'đủng đỉnh',
  'mộng mơ', 'quả cảm', 'cần mẫn', 'hào phóng', 'lịch lãm', 'duyên dáng', 'gan lì',
  'khéo léo', 'trầm tính', 'liến thoắng', 'điệu đà',
];

const chon = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Một bí danh ngẫu nhiên. Ví dụ: "Sóc hài hước". */
export function sinhBiDanh(): string {
  return `${chon(CON_VAT)} ${chon(TINH_TU)}`;
}
