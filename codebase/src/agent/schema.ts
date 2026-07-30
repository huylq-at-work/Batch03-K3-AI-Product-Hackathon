// JSON Schema cho output của stage ★ (spec.md §4 — quyết định AI trung tâm).
//
// Ràng buộc của structured outputs:
//   - mọi object phải có additionalProperties: false
//   - KHÔNG dùng schema đệ quy, minLength/maxLength, minimum/maximum
//   - mọi field đều `required`; "không có" biểu diễn bằng "" hoặc []
//     (tránh null-handling, và làm eval so sánh được bằng ===)

export const TURN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['mode', 'next_question', 'node', 'numbers', 'message', 'chain_incomplete'],
  properties: {
    mode: {
      type: 'string',
      enum: ['ask', 'label', 'stop', 'refuse', 'out_of_scope'],
      description:
        'ask = cần hỏi thêm 1 câu. label = đã gán nhãn tầng, còn đào tiếp được. ' +
        'stop = chain đã tới nguyên nhân can thiệp được, dừng. ' +
        'refuse = người dùng đòi việc ngoài phạm vi agent. ' +
        'out_of_scope = người trả lời không thuộc đối tượng khảo sát.',
    },
    next_question: {
      type: 'string',
      description:
        'ĐÚNG MỘT câu hỏi mở, tiếng Việt, hỏi về LẦN GẦN NHẤT. ' +
        'Rỗng khi mode != ask. TUYỆT ĐỐI không chứa giả định về câu trả lời.',
    },
    node: {
      anyOf: [
        { type: 'null' },
        {
          type: 'object',
          additionalProperties: false,
          required: ['level', 'claim', 'kind', 'can_thiep_duoc', 'reason'],
          properties: {
            level: { type: 'integer', description: 'Tầng why, bắt đầu từ 1.' },
            claim: {
              type: 'string',
              description: 'Nguyên văn lời người trả lời. Không diễn giải lại.',
            },
            kind: {
              type: 'string',
              enum: ['nguyen_nhan', 'dieu_kien', 'trieu_chung', 'khong_ap_dung'],
              description:
                'nguyen_nhan = nêu hành động/lựa chọn của một chủ thể, can thiệp được. ' +
                'dieu_kien = hoàn cảnh không hành động được ("do môi trường", "chưa đi làm"). ' +
                'trieu_chung = biểu hiện bề mặt, chưa nêu vì sao ("mất thời gian", "bí ý tưởng"). ' +
                'khong_ap_dung = không phải một mắt của why-chain.',
            },
            can_thiep_duoc: {
              type: 'boolean',
              description: 'true CHỈ KHI kind = nguyen_nhan.',
            },
            reason: {
              type: 'string',
              description: 'Một dòng giải thích vì sao gán nhãn đó (nguyên tắc G11).',
            },
          },
        },
      ],
    },
    numbers: {
      type: 'array',
      description:
        'Mọi con số / định lượng xuất hiện trong câu trả lời. Rỗng nếu không có. ' +
        'KHÔNG được tự sinh con số không có trong lời người trả lời.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['text', 'nguon'],
        properties: {
          text: { type: 'string', description: 'Nguyên văn, ví dụ "2 tuần", "5 người".' },
          nguon: {
            type: 'string',
            enum: ['khao_sat', 'mining', 'ASSUMPTION'],
            description:
              'khao_sat = người trả lời tự trải qua. mining = họ dẫn từ dữ liệu đếm được. ' +
              'ASSUMPTION = phỏng đoán ("chắc nhiều người cũng vậy") — không tính vào verdict.',
          },
        },
      },
    },
    message: {
      type: 'string',
      description: 'Câu nói với người dùng khi mode = stop | refuse | out_of_scope. Rỗng ở mode khác.',
    },
    chain_incomplete: {
      type: 'boolean',
      description:
        'true khi KHÔNG suy ra được tầng tiếp từ câu trả lời. Khi đó phải dừng và nói thiếu gì — ' +
        'không được bịa thêm tầng cho chain trông đẹp.',
    },
  },
} as const;
