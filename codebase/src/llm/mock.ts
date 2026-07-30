import { normalize, type LlmProvider } from './provider';
import type { TurnResult } from '../types';

// Từ khoá phân loại — cố tình để lộ ra rằng rule-based KHÔNG đủ.
// Đây vừa là fallback để flow bấm hết được khi chưa có API key (CP2),
// vừa là **baseline** mà lời gọi AI thật phải thắng trong bảng eval.
const DIEU_KIEN = /do (môi trường|hoàn cảnh)|chưa đi làm|còn là sinh viên|tại tôi (còn|chưa)|vì (còn|chưa) (trẻ|mới)/i;
const TRIEU_CHUNG = /mất (nhiều )?(thời gian|công)|bí ý tưởng|thấy bất tiện|khó quá|không biết|lười|chậm/i;
const NGUYEN_NHAN = /vì (tôi|mình|họ|nhóm) (phải|đã|không|chưa)|do (tôi|mình|nhóm) (phải|không|chưa)|nên (tôi|mình) phải/i;
const OUT_OF_SCOPE = /(có sẵn|sẵn có).*(công việc|doanh nghiệp)|lấy (luôn|trực tiếp) từ.*(dữ liệu|data)|giải quyết trong \d+ ?(phút|')/i;
const OUT_OF_BOUNDS = /chọn hộ|chọn giúp|viết (luôn )?spec|cho tôi \d+ ý tưởng|deadline|nộp bài ở đâu|link nộp/i;
const NUMBER = /(\d+(?:[.,]\d+)?)\s*(tuần|ngày|giờ|phút|tháng|người|lần|%)/gi;
const ASSUMPTION = /chắc (là )?|có lẽ|nghĩ là|đoán|khoảng chừng|nhiều người cũng/i;

export function createMockProvider(): LlmProvider {
  return {
    label: 'Mock (rule-based, KHÔNG phải AI)',
    isReal: false,
    async complete(_system: string, user: string): Promise<TurnResult> {
      await new Promise((r) => setTimeout(r, 250)); // giả latency để UI thật hơn

      const answerMatch = user.match(/Họ trả lời: "([\s\S]*?)"\n/);
      const answer = answerMatch?.[1]?.trim() ?? '';
      const levelMatch = user.match(/node\.level = (\d+)/);
      const level = Number(levelMatch?.[1] ?? 1);

      if (!answer) {
        return normalize({
          mode: 'ask',
          next_question:
            'Lần gần nhất bạn gặp vướng ở việc này là khi nào, và lúc đó bạn đang làm gì?',
          node: null,
          numbers: [],
          message: '',
          chain_incomplete: false,
        });
      }

      const numbers: { text: string; nguon: string }[] = [];
      for (const m of answer.matchAll(NUMBER)) {
        numbers.push({
          text: m[0],
          nguon: ASSUMPTION.test(answer) ? 'ASSUMPTION' : 'khao_sat',
        });
      }

      if (OUT_OF_BOUNDS.test(answer)) {
        return normalize({
          mode: 'refuse',
          next_question: '',
          node: null,
          numbers,
          message:
            'Mình không chọn đề tài, không viết spec, và không có nguồn chính thức cho ' +
            'câu hỏi về lịch/deadline — chỗ đó bạn hỏi TA nhé. Mình chỉ đào why-chain cùng bạn.',
          chain_incomplete: false,
        });
      }

      if (OUT_OF_SCOPE.test(answer)) {
        return normalize({
          mode: 'out_of_scope',
          next_question: '',
          node: null,
          numbers,
          message:
            'Nghe như vấn đề và dữ liệu đã có sẵn trong công việc của bạn — bạn không phải ' +
            'đối tượng khảo sát này. Cảm ơn bạn, mình dừng ở đây.',
          chain_incomplete: false,
        });
      }

      const kind = DIEU_KIEN.test(answer)
        ? 'dieu_kien'
        : NGUYEN_NHAN.test(answer)
          ? 'nguyen_nhan'
          : TRIEU_CHUNG.test(answer)
            ? 'trieu_chung'
            : 'khong_ap_dung';

      const node = {
        level,
        claim: answer,
        kind,
        can_thiep_duoc: kind === 'nguyen_nhan',
        reason:
          kind === 'dieu_kien'
            ? 'Nêu hoàn cảnh, không nêu hành động của ai — không can thiệp được.'
            : kind === 'trieu_chung'
              ? 'Là biểu hiện bề mặt, chưa nói vì sao.'
              : kind === 'nguyen_nhan'
                ? 'Nêu một việc chủ thể phải làm — can thiệp được.'
                : '(rule-based không phân loại được — đây là giới hạn của mock)',
      };

      if (kind === 'nguyen_nhan') {
        return normalize({
          mode: 'stop',
          next_question: '',
          node,
          numbers,
          message: 'Chain đã tới nguyên nhân can thiệp được. Dừng ở đây.',
          chain_incomplete: false,
        });
      }

      if (kind === 'khong_ap_dung' || level >= 6) {
        return normalize({
          mode: 'stop',
          next_question: '',
          node,
          numbers,
          message:
            kind === 'dieu_kien'
              ? 'Chain dừng ở một điều kiện, chưa tới nguyên nhân can thiệp được.'
              : 'Không suy ra được tầng tiếp từ câu trả lời này.',
          chain_incomplete: true,
        });
      }

      return normalize({
        mode: 'label',
        next_question: 'Vì sao lại như vậy?',
        node,
        numbers,
        message: '',
        chain_incomplete: false,
      });
    },
  };
}
