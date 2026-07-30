import { useEffect, useRef, useState } from 'react';
import {
  ADVISOR_SYSTEM_PROMPT,
  advisorTools,
  datHamDocKetQua,
  datHamWebSearch,
  deTaiToolsDisabled,
} from '../agent/tools';
import { kiemDauRa, kiemDauVao, type ViPham } from '../agent/guard';
import { timTenRiengKhongNguon } from '../agent/kiem-nguon';
import { ketQuaTool, runToolLoop, type ToolLoopMsg } from '../agent/tool-loop';
import { resolveProvider } from '../llm';
import { agents, newId, transcripts } from '../store/db';
import { HAN_LINK_MS, type SubAgent } from '../types';

/**
 * Lưu / nạp hội thoại cố vấn theo từng user. Đề bài yêu cầu "session lưu lại":
 * reload trang không mất cuộc tư vấn đang dở. Chỉ lưu `messages` (đủ để dựng lại
 * hội thoại); các state tạm (busy, nháp) không cần.
 */
const phienKey = (uid: string) => `daogoc.advisor.${uid}`;
function napPhien(uid: string): ToolLoopMsg[] {
  try {
    const raw = localStorage.getItem(phienKey(uid));
    return raw ? (JSON.parse(raw) as ToolLoopMsg[]) : [];
  } catch {
    return [];
  }
}
function luuPhien(uid: string, msgs: ToolLoopMsg[]): void {
  try {
    localStorage.setItem(phienKey(uid), JSON.stringify(msgs));
  } catch {
    /* localStorage đầy hoặc bị chặn — mất session còn hơn vỡ app */
  }
}

/**
 * CỐ VẤN — agent chính, thứ người dùng gặp khi mở app.
 *
 * Việc của nó: dẫn người dùng tìm painpoint THẬT của đề tài họ đang làm. Sub-agent
 * khảo sát là KẾT QUẢ của cuộc tư vấn, không phải cửa vào — bản trước mở app ra là
 * form "Tạo agent khảo sát", bắt người dùng làm việc quản trị trước khi được tư vấn.
 *
 * Khác `Chat.tsx` (sub-agent) ở chỗ: ở đây có tool và được giải thích dài; sub-agent
 * thì hỏi đúng một câu mỗi lượt và không giải thích gì, vì nó đang lấy bằng chứng
 * từ người lạ.
 */

const provider = resolveProvider();

// Cấp hàm tra web cho `runTool`. Làm ở đây để tools.ts không phải import llm/
// (tránh vòng phụ thuộc). Provider không tra web được thì set null, và tool sẽ
// trả {error} để agent nói rõ là chưa nghiên cứu được.
datHamWebSearch(provider.webSearch ? (q) => provider.webSearch!(q) : null);

/**
 * Tổng hợp phản hồi khảo sát của một user cho tool `tong_hop_khao_sat`.
 *
 * Trả về dữ kiện đã đào được (nguyên nhân/triệu chứng/số liệu) để cố vấn suy
 * persona/leverage/MVP TỪ DỮ LIỆU THẬT, không bịa. Cắt gọn để nhẹ token; nói rõ
 * mỗi painpoint được bao nhiêu người nhắc — đó là tín hiệu "vấn đề chung hay riêng".
 */
function docKetQuaKhaoSat(ownerId: string): unknown {
  const cacAgent = agents.mine(ownerId);
  const ts = cacAgent.flatMap((a) => transcripts.byAgent(a.id));
  const soPhanHoi = ts.length;
  if (soPhanHoi === 0) return { error: 'chua_co_phan_hoi', message: 'Chưa ai trả lời khảo sát nào.' };

  const gom = (kind: string) =>
    ts
      .flatMap((t) => t.chain.filter((n) => n.kind === kind).map((n) => n.claim.trim()))
      .filter(Boolean);

  return {
    so_khao_sat: cacAgent.length,
    so_phan_hoi: soPhanHoi,
    so_hoan_thanh: ts.filter((t) => t.finishedAt).length,
    // nguyên nhân = painpoint can thiệp được; đây là cái đáng làm sản phẩm cho.
    nguyen_nhan: gom('nguyen_nhan').slice(0, 20),
    trieu_chung: gom('trieu_chung').slice(0, 20),
    dieu_kien: gom('dieu_kien').slice(0, 10),
    so_lieu: ts.flatMap((t) => t.numbers.map((n) => `${n.text} (${n.nguon})`)).slice(0, 20),
    ghi_chu:
      'nguyen_nhan là painpoint can thiệp được — ưu tiên phân tích nhóm này. Cùng một ý ' +
      'nhiều người nhắc = vấn đề chung. Chỉ 1 người nhắc = có thể chỉ riêng họ.',
  };
}

/** Bản nháp khảo sát do tool `tao_khao_sat` trả về. Chưa lưu gì cả. */
interface Nhap {
  ten: string;
  chu_de: string;
  persona_in: string;
  so_tang: number;
  cong_khai: boolean;
}

const MO_DAU =
  'Bạn đang xét đề tài capstone nào? Cho mình mã đề (VD: EDU-01) hoặc mô tả lĩnh vực ' +
  'bạn quan tâm cũng được.';

/** Câu chào mở đầu mỗi cuộc tư vấn. Nêu rõ mình giúp được GÌ, rồi hỏi họ muốn gì. */
const LOI_CHAO =
  'Chào bạn 👋 Mình giúp bạn tìm **painpoint thật** cho đề tài capstone.\n\n' +
  'Cách làm: bạn cho mình **đề tài** → mình **research** miền đó để tìm vài painpoint ' +
  'ứng viên có thật → mình dựng một **khảo sát 5-why** về đề tài. Bạn trả lời thử trước ' +
  '(tính là phản hồi đầu tiên), rồi gửi link cho người khác — painpoint lộ ra từ dữ liệu ' +
  'thật, không phải mình đoán.\n\n' +
  'Bạn đang xét đề nào? Cho mình mã đề (VD: FIN-05) hoặc lĩnh vực bạn quan tâm.';

export function Advisor({
  ownerId,
  onCreated,
}: {
  ownerId: string;
  onCreated: (a: SubAgent) => void;
}) {
  // Nạp lại hội thoại cũ của user này (session persistence).
  const [messages, setMessages] = useState<ToolLoopMsg[]>(() => napPhien(ownerId));
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [dangLam, setDangLam] = useState('');
  const [error, setError] = useState('');
  const [viPham, setViPham] = useState<ViPham[]>([]);
  // Text đang stream về (hiện dần trong lúc chờ). Xoá khi lượt xong.
  const [stream, setStream] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  // Cấp hàm đọc kết quả khảo sát cho tool `tong_hop_khao_sat` — cần ownerId nên
  // đăng ký trong component (không làm được ở top-level như web_search).
  useEffect(() => {
    datHamDocKetQua(() => Promise.resolve(docKetQuaKhaoSat(ownerId)));
    return () => datHamDocKetQua(null);
  }, [ownerId]);

  // Cuộn xuống cuối mỗi khi có lượt mới. `messages.length` chứ không phải cả mảng —
  // tool_results làm mảng đổi mà không có gì mới để xem.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, busy, stream]);

  // Lưu session mỗi khi hội thoại đổi. Ghi cả mảng (kể cả tool_calls/results) để
  // dựng lại đúng ngữ cảnh cho lượt sau, không chỉ text hiển thị.
  useEffect(() => {
    luuPhien(ownerId, messages);
  }, [ownerId, messages]);

  async function send(): Promise<void> {
    const text = input.trim();
    if (!text || busy) return;
    if (!provider.toolChat) {
      setError(
        `Provider ${provider.label} không hỗ trợ tool. Cố vấn cần tool để tra đề tài và tạo ` +
          'khảo sát — đặt VITE_LLM_PROVIDER=openai hoặc anthropic trong .env.local.',
      );
      return;
    }

    // Tầng 1 — chặn TRƯỚC khi gọi API. Tiêm prompt / ngoài phạm vi thì không tốn
    // token nào. Vẫn hiện lời người dùng để họ thấy mình đã gõ gì.
    const chan = kiemDauVao(text);
    if (chan.chan) {
      setInput('');
      setError('');
      setMessages((m) => [
        ...m,
        { role: 'user', text },
        { role: 'assistant', text: chan.loi_nhan ?? 'Câu này ngoài phạm vi của mình.' },
      ]);
      return;
    }

    setInput('');
    setError('');
    setViPham([]);
    const next: ToolLoopMsg[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setBusy(true);
    setStream('');
    setDangLam('đang suy nghĩ…');

    // Luồng: nhận đề tài → RESEARCH (web) → tạo khảo sát. Đề tài đã tra chưa /
    // đã research chưa / đã tạo khảo sát chưa — suy từ lịch sử tool.
    const daXemDeTai = next.some(
      (m) => m.role === 'tool_calls' && m.calls.some((c) => c.name === 'xem_de_tai'),
    );
    const daResearch = next.some(
      (m) => m.role === 'tool_calls' && m.calls.some((c) => c.name === 'web_search'),
    );
    const daTaoKhaoSat = next.some(
      (m) => m.role === 'tool_calls' && m.calls.some((c) => c.name === 'tao_khao_sat'),
    );

    // Ép thứ tự bằng tool_choice (prompt tĩnh không giữ được với gpt-4o-mini):
    //  - đã biết đề tài mà CHƯA research → buộc web_search
    //  - đã research mà CHƯA tạo khảo sát → buộc tao_khao_sat
    const epGoi =
      daXemDeTai && !daResearch ? 'web_search' : daResearch && !daTaoKhaoSat ? 'tao_khao_sat' : undefined;

    try {
      const r = await runToolLoop({
        chat: provider.toolChat,
        system: ADVISOR_SYSTEM_PROMPT,
        tools: advisorTools() as never,
        messages: next,
        // Streaming: mỗi mẩu text hiện dần. Vòng gọi tool không có text nên im;
        // vòng trả lời cuối thì chữ chạy ra.
        onToken: (mau) => {
          setDangLam('');
          setStream((s) => s + mau);
        },
        epGoi,
      });
      setMessages(r.messages);

      // Bản nháp lấy từ KẾT QUẢ TOOL, không parse từ text model — text có thể nhắc
      // một khảo sát mà tool chưa từng dựng.
      // Tầng 2 — soi text model vừa trả. Đối chiếu với kết quả tool và với lời
      // người dùng: mã đề tài hoặc số nào không có ở hai nguồn đó là đang bịa.
      const toolText = JSON.stringify(r.calls.map((c) => c.result));
      const loiNguoiDung = next
        .filter((m): m is { role: 'user'; text: string } => m.role === 'user')
        .map((m) => m.text)
        .join(' ');
      const vp = kiemDauRa(r.text, toolText, loiNguoiDung);

      // Kiểm tên riêng bằng model (không regex) — chỉ khi đã có text và đã research
      // (pha nêu painpoint ứng viên là nơi lỗi bịa tên xảy ra). Mỗi lần kiểm là một
      // lời gọi API ~1-2s nên không chạy ở mọi lượt.
      if (daResearch && provider.toolChat && r.text.trim()) {
        setDangLam('đang kiểm nguồn…');
        const ten = await timTenRiengKhongNguon(
          provider.toolChat,
          r.text,
          `${loiNguoiDung}\n${toolText}`,
        );
        for (const t of ten) {
          vp.push({
            loai: 'ten_rieng_khong_nguon',
            chi_tiet: `Tên "${t}" không có trong lời bạn nói cũng không có trong kết quả tra cứu — có thể agent tự suy diễn.`,
          });
        }
      }
      setViPham(vp);

      // Auto-tạo khảo sát: người dùng KHÔNG phải bấm nút hay hiểu cơ chế. Khi
      // tao_khao_sat trả bản nháp, tạo luôn và đưa người tạo VÀO khảo sát (họ là
      // phản hồi #1). onCreated → App mở Chat.tsx cho agent này.
      const d = ketQuaTool<Nhap>(r.calls, 'tao_khao_sat', (res) => {
        const o = res as { can_xac_nhan?: boolean; nhap?: Nhap };
        return o?.can_xac_nhan && o.nhap ? o.nhap : undefined;
      });
      if (d) taoNgay(d);

      if (r.het_vong) {
        setError('Cố vấn gọi tool quá nhiều vòng nên bị dừng. Thử hỏi lại cụ thể hơn.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      setDangLam('');
      setStream(''); // text cuối đã nằm trong messages, khỏi hiện trùng
    }
  }

  /**
   * Tự tạo khảo sát ngay khi tool trả bản nháp — người dùng không phải bấm nút.
   * onCreated → App mở Chat.tsx cho agent này, tức là người TẠO được đưa thẳng vào
   * khảo sát của chính mình làm phản hồi #1.
   */
  function taoNgay(d: Nhap): void {
    const luc = Date.now();
    const a: SubAgent = {
      id: newId('a'),
      ownerId,
      name: d.ten,
      topic: d.chu_de,
      personaIn: d.persona_in,
      visibility: d.cong_khai ? 'public' : 'private',
      createdAt: luc,
      maxTurns: d.so_tang,
      expiresAt: luc + HAN_LINK_MS, // link sống 24h, gia hạn được ở sidebar
    };
    agents.save(a);
    onCreated(a);
  }

  // Ẩn `tool_results` (JSON thô, người dùng không cần) và các ghi chú [hệ thống]
  // mình chèn vào cho model. Type predicate để TS biết `.text` tồn tại sau filter.
  const hienThi = messages.filter(
    (m): m is Exclude<ToolLoopMsg, { role: 'tool_results' }> =>
      m.role !== 'tool_results' && !(m.role === 'user' && m.text.startsWith('[hệ thống]')),
  );

  return (
    <div className="thread">
      <div className="log" ref={logRef}>
        {hienThi.length === 0 && (
          <>
            {/* Câu chào mở đầu mỗi session — bong bóng của cố vấn, không gọi API. */}
            <div className="msg assistant">
              <Dam text={LOI_CHAO} />
            </div>
            <div className="notice small" style={{ maxWidth: 720, margin: '0 auto 8px' }}>
              Đang dùng <b>{provider.label}</b>
              {!provider.isReal && ' — KHÔNG phải AI, chỉ là baseline rule-based'}
              {deTaiToolsDisabled() && ' · tool tra đề tài đang TẮT'}
            </div>
          </>
        )}

        {hienThi.map((m, i) =>
          m.role === 'tool_calls' ? (
            <div className="toolchip" key={i}>
              {m.calls.map((c) => nhanTool(c.name)).join(' · ')}
            </div>
          ) : (
            <div className={`msg ${m.role}`} key={i}>
              <Dam text={m.text} />
            </div>
          ),
        )}

        {/* Bong bóng đang stream: chữ chạy ra dần. dangLam hiện khi chưa có mẩu nào. */}
        {stream && (
          <div className="msg assistant">
            <Dam text={stream} />
          </div>
        )}
        {busy && !stream && <div className="msg assistant busy">{dangLam}</div>}
        {error && <div className="err">{error}</div>}

        {/* Không im lặng sửa câu trả lời — hiện ra để người dùng biết chỗ nào đừng
            tin. Sửa ngầm thì họ mất cách phát hiện agent đang bịa. */}
        {viPham.length > 0 && (
          <div className="err">
            <b>Cảnh báo: câu trả lời trên có chỗ không có nguồn.</b>
            <ul>
              {viPham.map((v, i) => (
                <li key={i}>{v.chi_tiet}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

      <div className="composer">
        <textarea
          rows={1}
          value={input}
          placeholder={hienThi.length === 0 ? MO_DAU : 'Trả lời…'}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Enter gửi, Shift+Enter xuống dòng — quy ước người dùng đã quen.
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button className="primary" disabled={busy || !input.trim()} onClick={() => void send()}>
          Gửi
        </button>
      </div>
      <p className="muted small center">
        Cố vấn chỉ nói về đề tài mà tool tra được. Nó không tra thị trường hay đối thủ.
      </p>
    </div>
  );
}

/**
 * Render `**đậm**` — model bôi đậm nhãn tầng ("Đó là một **triệu chứng**") và câu
 * hỏi, nên để nguyên thì người dùng thấy dấu sao thô và mất chính chỗ cần nhấn.
 *
 * Cố ý KHÔNG dùng thư viện markdown: chỉ cần đậm, và một renderer đầy đủ mở đường
 * cho HTML từ model chèn vào DOM. Ở đây mọi thứ vẫn là text node.
 */
function Dam({ text }: { text: string }) {
  const phan = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {/* split với capture group: index lẻ là phần trong **…** */}
      {phan.map((s, i) => (i % 2 === 1 ? <b key={i}>{s}</b> : s))}
    </>
  );
}

/** Tên tool cho người đọc — người dùng không cần biết tên hàm. */
function nhanTool(name: string): string {
  switch (name) {
    case 'liet_ke_khoi':
      return 'đang xem các khối đề tài';
    case 'tim_de_tai':
      return 'đang tìm đề tài';
    case 'xem_de_tai':
      return 'đang đọc mô tả đề tài';
    case 'web_search':
      return 'đang tra web';
    case 'tao_khao_sat':
      return 'đang dựng khảo sát';
    default:
      return name;
  }
}
