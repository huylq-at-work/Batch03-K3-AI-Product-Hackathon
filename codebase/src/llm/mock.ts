import { normalize, type LlmProvider } from './provider';
import type { TurnResult } from '../types';
import type { ToolChatFn, ToolLoopMsg } from '../agent/tool-loop';

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

let mockCallId = 0;

function goiTool(name: string, input: Record<string, unknown>) {
  mockCallId += 1;
  return {
    text: '',
    calls: [{ id: `mock-tool-${mockCallId}`, name, input }],
  };
}

function docJson(content: string): Record<string, unknown> {
  try {
    const value = JSON.parse(content) as unknown;
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function cacLoiNguoiDung(messages: ToolLoopMsg[]): string[] {
  return messages
    .filter(
      (m): m is { role: 'user'; text: string } =>
        m.role === 'user' && !m.text.startsWith('[hệ thống]'),
    )
    .map((m) => m.text.trim())
    .filter(Boolean);
}

function ketQuaGanNhat(messages: ToolLoopMsg[]) {
  const last = messages.at(-1);
  if (last?.role !== 'tool_results') return undefined;
  const result = last.results.at(-1);
  return result ? { name: result.name, value: docJson(result.content) } : undefined;
}

function timDeTaiDaDoc(messages: ToolLoopMsg[]): Record<string, unknown> | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m.role !== 'tool_results') continue;
    for (let j = m.results.length - 1; j >= 0; j -= 1) {
      const value = docJson(m.results[j].content);
      if (value.found && typeof value.found === 'object') {
        return value.found as Record<string, unknown>;
      }
    }
  }
  return undefined;
}

function rutGon(text: string, max = 90): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  return oneLine.length <= max ? oneLine : `${oneLine.slice(0, max - 1).trimEnd()}…`;
}

function nhapKhaoSat(messages: ToolLoopMsg[]): Record<string, unknown> {
  const users = cacLoiNguoiDung(messages);
  const found = timDeTaiDaDoc(messages);
  const first = users[0] ?? 'đề tài capstone';
  const latest = users.at(-1) ?? first;
  const ma = typeof found?.ma === 'string' ? found.ma : '';
  const tenDeTai = typeof found?.ten === 'string' ? found.ten : '';
  const mien = tenDeTai ? `${ma ? `${ma} — ` : ''}${tenDeTai}` : first;

  return {
    ten: rutGon(`Khảo sát ${ma || mien}`, 70),
    chu_de: `Trải nghiệm và khó khăn thực tế liên quan đến ${rutGon(mien, 140)}`,
    persona_in:
      users.length > 1
        ? rutGon(latest, 180)
        : `Người từng có trải nghiệm liên quan đến ${rutGon(mien, 130)}`,
    so_tang: 5,
    cong_khai: true,
  };
}

function coTool(
  tools: { name: string }[],
  name: string,
): boolean {
  return tools.some((tool) => tool.name === name);
}

/**
 * Tool loop rule-based cho màn Cố vấn.
 *
 * Mock vẫn không phải AI và không tự nghiên cứu web. Nó chỉ điều phối các tool
 * nội bộ theo một luồng cố định để bản demo không bị chặn khi chưa có API key:
 * nhận đề tài → hỏi nhóm người cần khảo sát → tạo bản khảo sát 5-why.
 */
const mockToolChat: ToolChatFn = async ({ tools, messages, force }) => {
  await new Promise((r) => setTimeout(r, 180));

  const available = tools as { name: string }[];
  const users = cacLoiNguoiDung(messages);
  const latestUser = users.at(-1) ?? '';
  const latestResult = ketQuaGanNhat(messages);

  if (latestResult?.name === 'tao_khao_sat') {
    return {
      text:
        'Mình đã dựng khảo sát 5-why ở chế độ mock. Bạn hãy trả lời thử trước, rồi gửi ' +
        'link cho những người từng gặp vấn đề tương tự để kiểm chứng painpoint.',
      calls: [],
    };
  }

  if (latestResult?.name === 'tong_hop_khao_sat') {
    if (latestResult.value.error) {
      return {
        text: String(latestResult.value.message ?? 'Chưa có phản hồi khảo sát để tổng hợp.'),
        calls: [],
      };
    }
    const count = Number(latestResult.value.so_phan_hoi ?? 0);
    const causes = Array.isArray(latestResult.value.nguyen_nhan)
      ? latestResult.value.nguyen_nhan.map(String).slice(0, 3)
      : [];
    return {
      text:
        `Đã đọc ${count} phản hồi. ` +
        (causes.length
          ? `Các nguyên nhân đang thấy: ${causes.join('; ')}.`
          : 'Chưa có nguyên nhân can thiệp được đủ rõ; cần thêm phản hồi.'),
      calls: [],
    };
  }

  if (latestResult?.name === 'web_search') {
    if (coTool(available, 'tao_khao_sat')) {
      return goiTool('tao_khao_sat', nhapKhaoSat(messages));
    }
    return {
      text:
        'Mock không thể tra web thật. Bạn vẫn có thể tiếp tục khảo sát, nhưng mọi giả ' +
        'thuyết ban đầu cần được xem là chưa có nguồn.',
      calls: [],
    };
  }

  if (latestResult?.name === 'xem_de_tai') {
    const found = latestResult.value.found as Record<string, unknown> | undefined;
    if (found) {
      return {
        text:
          `Đã nhận diện đề tài **${String(found.ma ?? '')} — ${String(found.ten ?? '')}**. ` +
          'Mock không tự research web. Nhóm người nào từng trực tiếp gặp vấn đề trong miền ' +
          'này mà bạn muốn mời trả lời khảo sát?',
        calls: [],
      };
    }
    return {
      text:
        `${String(latestResult.value.message ?? 'Không tra được catalog đề tài')} ` +
        'Bạn hãy mô tả ngắn miền vấn đề và nhóm người từng gặp vấn đề đó; mock vẫn có ' +
        'thể dựng khảo sát mà không cần catalog.',
      calls: [],
    };
  }

  if (latestResult?.name === 'tim_de_tai') {
    if (latestResult.value.error) {
      return {
        text:
          `${String(latestResult.value.message ?? 'Không tra được catalog đề tài')} ` +
          'Bạn hãy mô tả miền vấn đề và nhóm người cần khảo sát.',
        calls: [],
      };
    }
    const items = Array.isArray(latestResult.value.ket_qua)
      ? latestResult.value.ket_qua.slice(0, 5) as Record<string, unknown>[]
      : [];
    return {
      text: items.length
        ? `Các đề gần nhất: ${items
            .map((x) => `${String(x.ma)} — ${String(x.ten)}`)
            .join('; ')}. Bạn chọn một mã đề.`
        : 'Không thấy đề phù hợp. Hãy mô tả cụ thể hơn miền vấn đề bạn quan tâm.',
      calls: [],
    };
  }

  if (latestResult?.name === 'liet_ke_khoi') {
    if (latestResult.value.error) {
      return {
        text: String(latestResult.value.message ?? 'Không đọc được danh sách khối đề tài.'),
        calls: [],
      };
    }
    const groups = Array.isArray(latestResult.value.khoi)
      ? latestResult.value.khoi.slice(0, 8) as Record<string, unknown>[]
      : [];
    return {
      text: `Các khối có sẵn: ${groups.map((x) => String(x.khoi)).join('; ')}. Bạn quan tâm khối nào?`,
      calls: [],
    };
  }

  // Advisor có thể ép thứ tự tool ở đầu lượt. Mock tôn trọng lựa chọn đó để lịch
  // sử tool vẫn nhất quán với OpenAI/Anthropic.
  if (force && coTool(available, force)) {
    if (force === 'tao_khao_sat') return goiTool(force, nhapKhaoSat(messages));
    if (force === 'web_search') {
      return goiTool(force, {
        cau_hoi: `Các khó khăn thường gặp và giải pháp hiện có trong miền ${rutGon(users[0] ?? latestUser)}`,
      });
    }
    if (force === 'xem_de_tai') {
      const code = latestUser.match(/\b[A-Z]{2,10}[-–— ]?\d{1,3}\b/i)?.[0] ?? latestUser;
      return goiTool(force, { ma: code });
    }
    return goiTool(force, {});
  }

  if (/tổng hợp|kết quả|persona|mvp/i.test(latestUser) && coTool(available, 'tong_hop_khao_sat')) {
    return goiTool('tong_hop_khao_sat', {});
  }

  const code = latestUser.match(/\b[A-Z]{2,10}[-–— ]?\d{1,3}\b/i)?.[0];
  if (users.length === 1 && code && coTool(available, 'xem_de_tai')) {
    return goiTool('xem_de_tai', { ma: code.replace(/[–— ]/g, '-').toUpperCase() });
  }

  if (users.length >= 2 && coTool(available, 'tao_khao_sat')) {
    return goiTool('tao_khao_sat', nhapKhaoSat(messages));
  }

  return {
    text:
      'Ở chế độ mock mình không thể research web, nên chưa coi bất kỳ painpoint nào là ' +
      'kết luận. Hãy cho biết nhóm người nào từng gặp vấn đề trong miền này; mình sẽ dựng ' +
      'khảo sát 5-why để bạn kiểm chứng với người thật.',
    calls: [],
  };
};

export function createMockProvider(): LlmProvider {
  return {
    label: 'Mock (rule-based, KHÔNG phải AI)',
    isReal: false,
    toolChat: mockToolChat,
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
