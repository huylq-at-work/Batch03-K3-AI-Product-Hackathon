import { useEffect, useRef, useState } from 'react';
import {
  ADVISOR_SYSTEM_PROMPT,
  advisorTools,
  CAP_DAO_5WHY,
  datHamWebSearch,
  deTaiToolsDisabled,
} from '../agent/tools';
import { duocTaoKhaoSat, kiemDauRa, kiemDauVao, type ViPham } from '../agent/guard';
import { timTenRiengKhongNguon } from '../agent/kiem-nguon';
import { ketQuaTool, runToolLoop, type ToolLoopMsg } from '../agent/tool-loop';
import { resolveProvider } from '../llm';
import { agents, newId } from '../store/db';
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
  'Chào bạn 👋 Mình là cố vấn giúp bạn tìm **painpoint thật** của đề tài capstone — ' +
  'cái vấn đề khiến đề này đáng làm, chứ không dừng ở "khó" hay "mất thời gian".\n\n' +
  'Mình giúp được: **chọn/hiểu đề tài** (tra được 360 đề trong catalog) · **đào 5-why** ' +
  'để ra painpoint · **dựng khảo sát** để bạn gửi người khác lấy bằng chứng · gợi ý ' +
  '**persona, chỗ cần AI, và MVP**.\n\n' +
  'Bạn muốn mình giúp gì? Nếu chưa rõ, cứ nói bạn đang xét đề nào (VD: EDU-01) — ' +
  'hoặc "mình chưa có đề nào" cũng được.';

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
  const [nhap, setNhap] = useState<Nhap | null>(null);
  const [viPham, setViPham] = useState<ViPham[]>([]);
  // Text đang stream về (hiện dần trong lúc chờ). Xoá khi lượt xong.
  const [stream, setStream] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

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
    const soLuot = next.filter((m) => m.role === 'user').length;
    // Đã tạo khảo sát trong phiên chưa → quyết định PHA: web_search chỉ mở sau khi
    // tạo khảo sát (pha leverage/MVP), không mở lúc còn đào 5-why.
    const daTaoKhaoSat = next.some(
      (m) => m.role === 'tool_calls' && m.calls.some((c) => c.name === 'tao_khao_sat'),
    );
    // Ép cứng chống hỏi-why-vô-hạn: quá CAP lượt mà chưa tạo khảo sát → buộc gọi
    // tao_khao_sat. Prompt có luật dừng nhưng model bỏ qua khi hội thoại dài.
    const epChotKhaoSat = !daTaoKhaoSat && soLuot >= CAP_DAO_5WHY;
    setMessages(next);
    setBusy(true);
    setStream('');
    setDangLam('đang suy nghĩ…');

    // Directive động ghép vào cuối system prompt. Ép cứng cái prompt tĩnh không giữ.
    let chiThi = '';
    if (epChotKhaoSat) {
      chiThi =
        '\n\n# BẮT BUỘC LƯỢT NÀY\nĐã đào đủ 5 lượt. DỪNG hỏi "vì sao". Chốt painpoint SÂU NHẤT đã đạt (nói rõ nếu chuỗi chưa hoàn chỉnh) và gọi `tao_khao_sat` NGAY trong lượt này. Không hỏi thêm câu why nào nữa.';
    } else if (!daTaoKhaoSat && soLuot === 2) {
      // Lượt đào đầu tiên: model hay quên giải thích 5-why. Ép nói một lần.
      chiThi =
        '\n\n# BẮT BUỘC LƯỢT NÀY\nĐây là lần đầu bạn hỏi "vì sao". TRƯỚC câu hỏi, PHẢI nói một câu giải thích: đây là kỹ thuật 5-why, bạn sẽ hỏi "vì sao" vài lần liên tiếp để tìm nguyên nhân gốc, mong người dùng kiên nhẫn, không rõ thì cứ nói để dừng. Rồi mới hỏi câu why đầu tiên.';
    }

    // web_search: chỉ ép khi ĐÃ ở pha sau-khảo-sát và chưa tra lần nào.
    const chuaTraWeb = !next.some(
      (m) => m.role === 'tool_calls' && m.calls.some((c) => c.name === 'web_search'),
    );

    try {
      const r = await runToolLoop({
        chat: provider.toolChat,
        system: ADVISOR_SYSTEM_PROMPT + chiThi,
        // web_search chỉ có sau khi đã tạo khảo sát (pha leverage/MVP). Xem advisorTools().
        tools: advisorTools(daTaoKhaoSat) as never,
        messages: next,
        // Streaming: mỗi mẩu text hiện dần. Vòng gọi tool không có text nên im;
        // vòng trả lời cuối thì chữ chạy ra.
        onToken: (mau) => {
          setDangLam('');
          setStream((s) => s + mau);
        },
        // Ép cứng: hết cap thì buộc tạo khảo sát; ở pha leverage thì buộc tra web
        // một lần (prompt "bắt buộc" đã thua nhiều lần, model viết từ trí nhớ).
        epGoi: epChotKhaoSat
          ? 'tao_khao_sat'
          : daTaoKhaoSat && chuaTraWeb
            ? 'web_search'
            : undefined,
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

      // Kiểm tên riêng bằng model (không regex) — chỉ từ lượt 4, vì đó là pha
      // persona/leverage/MVP nơi lỗi bịa xảy ra, và mỗi lần kiểm là một lời gọi
      // API thật (~1-2s). Ba lượt đào 5-why đầu không đáng trả giá đó.
      if (soLuot >= 4 && provider.toolChat && r.text.trim()) {
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

      const d = ketQuaTool<Nhap>(r.calls, 'tao_khao_sat', (res) => {
        const o = res as { can_xac_nhan?: boolean; nhap?: Nhap };
        return o?.can_xac_nhan && o.nhap ? o.nhap : undefined;
      });
      if (d) {
        // Cổng tool GHI: chặn tạo khảo sát khi hội thoại còn quá ngắn.
        const cong = duocTaoKhaoSat(next.filter((m) => m.role === 'user').length);
        if (cong.chan) setError(cong.loi_nhan ?? '');
        else setNhap(d);
      }

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

  /** Người dùng bấm xác nhận → giờ mới ghi. Tool cố tình không tự ghi. */
  function taoThat(): void {
    if (!nhap) return;
    const luc = Date.now();
    const a: SubAgent = {
      id: newId('a'),
      ownerId,
      name: nhap.ten,
      topic: nhap.chu_de,
      personaIn: nhap.persona_in,
      visibility: nhap.cong_khai ? 'public' : 'private',
      createdAt: luc,
      maxTurns: nhap.so_tang,
      expiresAt: luc + HAN_LINK_MS, // link sống 24h, gia hạn được ở sidebar
    };
    agents.save(a);
    setNhap(null);
    onCreated(a);
    // Cho model biết đã tạo, để lượt sau nó không tạo lại. Không gọi API ở đây.
    setMessages((m) => [
      ...m,
      {
        role: 'user',
        text: `[hệ thống] Người dùng đã xác nhận. Khảo sát "${a.name}" đã tạo, link #/s/${a.id}. Đừng tạo lại.`,
      },
    ]);
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

        {nhap && (
          <div className="draft">
            <h3>Bản nháp khảo sát</h3>
            <p className="muted small">
              Cố vấn đã dựng bản nháp. Chưa lưu gì — xem lại rồi bấm tạo. Sửa được sau khi tạo.
            </p>
            <dl>
              <dt>Tên</dt>
              <dd>{nhap.ten}</dd>
              <dt>Hỏi về</dt>
              <dd>{nhap.chu_de}</dd>
              <dt>Hỏi ai</dt>
              <dd>{nhap.persona_in}</dd>
              <dt>Số tầng</dt>
              <dd>
                {nhap.so_tang} · {nhap.cong_khai ? 'public' : 'private'}
              </dd>
            </dl>
            <div className="row">
              <button className="primary" onClick={taoThat}>
                Tạo khảo sát
              </button>
              <button onClick={() => setNhap(null)}>Bỏ</button>
            </div>
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
