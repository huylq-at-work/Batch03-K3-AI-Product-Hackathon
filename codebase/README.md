# codebase — Đào Gốc

Prototype cho lát cắt **Đào Gốc** (khảo sát 5-why thích ứng). Xem [`../spec.md`](../spec.md)
và [`../flow.html`](../flow.html) cho thiết kế.

## Chạy

```bash
npm install
cp .env.example .env.local     # để nguyên VITE_LLM_PROVIDER=mock cũng chạy được
npm run dev
```

Chưa cài Node? `winget install OpenJS.NodeJS.LTS` rồi mở terminal mới.

## Provider (runtime thật: DeepSeek)

App chạy qua provider **OpenAI-compatible**, runtime thật dùng **DeepSeek**:

```bash
VITE_LLM_PROVIDER=openai
VITE_OPENAI_BASE_URL=https://api.deepseek.com
VITE_OPENAI_MODEL=deepseek-v4-flash
VITE_OPENAI_API_KEY=sk-...        # key DeepSeek
```

Golden set (`spec.md` §7) vẫn giữ **gpt-4o-mini** để so trước/sau — đổi `BASE_URL`/`MODEL` về OpenAI khi chạy đối chiếu.

**Lưu ý model thinking (deepseek-v4-flash):** structured output dùng `jsonMode` (không phải `json_schema`) và forced `tool_choice` có degrade — vì model thinking trả `400` với hai thứ đó. Đừng đổi lại `json_schema`, khảo sát sẽ hỏng. Chi tiết: `src/llm/langchain-common.ts`.

## Mức prototype — phần nào thật, phần nào mock

| Phần | Mức | File |
|---|---|---|
| **★ Khảo sát thích ứng 5-why** | **AI THẬT** | `src/agent/prompt.ts`, `src/agent/engine.ts` |
| Auth | **Mock** — localStorage, plaintext | `src/store/auth.tsx` |
| Lưu trữ | **Mock** — localStorage | `src/store/db.ts` |
| Link public | **Mock** — chỉ hoạt động trên cùng browser | `src/App.tsx` |
| Provider fallback | **Rule-based**, không phải AI | `src/llm/mock.ts` |

Mock provider vừa là fallback khi chưa có key (để flow bấm hết được ở CP2), vừa là
**baseline** mà AI thật phải thắng — chạy `LLM_PROVIDER=mock npm run eval` để có
cột đối chiếu.

## Chạy golden set

```bash
LLM_PROVIDER=mock npm run eval baseline    # không cần API key
npm run eval lan1                          # cần ANTHROPIC_API_KEY trong env
```

Kết quả ghi ra `../eval/runs/<provider>-<label>.md`, dán thẳng vào `spec.md` §7.

## 🔴 Bảo mật — đọc trước khi làm gì khác

**1. API key là public trong bản này.** Vite nhúng mọi biến `VITE_*` vào bundle JS.
Ai mở DevTools cũng đọc được key. Bản này **chỉ chạy local** (`npm run dev`).
Không deploy lên Vercel/Netlify/GitHub Pages. Đề bài không yêu cầu deploy
(`01-de-bai.md` ràng buộc 1). Muốn deploy thì cần backend proxy giữ key server-side.

**2. Auth không phải bảo mật.** Mật khẩu lưu plaintext trong localStorage, không có
server xác minh. Đừng dùng mật khẩu thật. Chi tiết trong `src/store/auth.tsx`.

**3. Gemini free tier có thể dùng dữ liệu để huấn luyện** (`02-guide.md` §3.4).
Câu trả lời khảo sát là lời của người thật. Nếu chạy khảo sát thật qua Gemini free
tier, nói rõ với người trả lời trước — hoặc dùng Anthropic cho khảo sát thật và để
Gemini cho việc chạy golden set (dữ liệu tự sinh).

**4. `traces/` đang bị gitignore** vì trace chứa nguyên văn câu trả lời của người thật.
R5 đòi "log/trace trong repo" — cách xử lý: commit trace của **lượt chạy golden set**
(dữ liệu tự sinh, an toàn) bằng `git add -f`, không commit trace của phiên khảo sát thật.
Trace phiên thật để trong `../validation/` theo đúng quy định bảo mật của README gốc.

## Cấu trúc

```
src/
├── types.ts              state schema (spec.md §4)
├── agent/
│   ├── prompt.ts         ★ prompt stage ★ — mọi ràng buộc trace về spec.md
│   ├── schema.ts         JSON Schema cho structured output
│   └── engine.ts         runTurn + chặn lỗi cứng (mớm đáp án)
├── llm/
│   ├── provider.ts       interface + trace + normalize
│   ├── anthropic.ts      Anthropic SDK (browser)
│   ├── gemini.ts         Google AI Studio
│   └── mock.ts           rule-based baseline
├── store/{auth.tsx,db.ts}
└── components/{Chat,ChainView,Dashboard}.tsx
```

## Bất biến của hệ thống

Hai chỗ ép cứng, cố ý không tin model:

- `normalize()` trong `llm/provider.ts` — `can_thiep_duoc` chỉ true khi
  `kind === 'nguyen_nhan'`. Model lỏng tay không phá được điều kiện dừng.
- `runTurn()` trong `agent/engine.ts` — câu hỏi mớm đáp án bị đánh dấu vi phạm và
  hiện lên UI, không im lặng bỏ qua. Đây là lỗi nhóm sợ nhất khi demo
  (`spec.md` §5 kịch bản #11): nó làm bẩn chính dữ liệu người dùng đang đi thu.
