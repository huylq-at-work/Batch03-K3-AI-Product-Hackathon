/**
 * Entry point chạy được cho bộ testcase của Đào Gốc.
 *
 * Chạy từ thư mục codebase:
 *   npm run test:testcase
 *
 * Mặc định dùng mock để không cần API key. Muốn chạy AI thật:
 *   $env:LLM_PROVIDER="openai"; npm run test:testcase
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface TestCase {
  id: string;
  group: string;
}

const HERE = dirname(fileURLToPath(import.meta.url));
const GOLDEN_SET = resolve(HERE, '..', 'golden-set.json');

const parsed = JSON.parse(readFileSync(GOLDEN_SET, 'utf8')) as {
  cases?: TestCase[];
};

if (!Array.isArray(parsed.cases)) {
  throw new Error('eval/golden-set.json không có mảng cases hợp lệ.');
}

const cases = parsed.cases;
if (cases.length < 20) {
  throw new Error(`Bộ thử chỉ có ${cases.length} case; yêu cầu tối thiểu 20.`);
}

const requiredGroups: Record<string, string> = {
  'lop-1': 'thông tin không có nguồn',
  'lop-2': 'mơ hồ hoặc thiếu ngữ cảnh',
  'lop-3': 'ngoài phạm vi sản phẩm',
  'lop-4': 'trả lời sai gây hậu quả thật/đặc thù domain',
};

for (const [group, description] of Object.entries(requiredGroups)) {
  const count = cases.filter((testCase) => testCase.group === group).length;
  if (count < 2) {
    throw new Error(`Nhóm "${description}" chỉ có ${count} case; yêu cầu tối thiểu 2.`);
  }
}

const ids = cases.map((testCase) => testCase.id);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length > 0) {
  throw new Error(`ID testcase bị trùng: ${[...new Set(duplicateIds)].join(', ')}`);
}

console.log('Kiểm tra cấu trúc bộ testcase: ĐẠT');
console.log(`- Tổng số case: ${cases.length}`);
for (const [group, description] of Object.entries(requiredGroups)) {
  const count = cases.filter((testCase) => testCase.group === group).length;
  console.log(`- ${description}: ${count} case`);
}
console.log('');

// Chạy được ngay trên máy mới mà không cần key. Biến môi trường do người chạy
// cung cấp vẫn được ưu tiên khi muốn đánh giá bằng OpenAI/Anthropic/Gemini.
process.env.LLM_PROVIDER ||= 'mock';

// runner.ts là nguồn chấm duy nhất: cùng 4 chiều chất lượng và cùng output
// eval/runs/*.md + *.json đang dùng trong spec.md §7.
async function runEvaluation(): Promise<void> {
  await import('../runner');
}

void runEvaluation();
