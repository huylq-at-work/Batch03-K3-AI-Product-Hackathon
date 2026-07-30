import { useEffect, useRef, useState } from 'react';
import { PaperPlaneIcon, ShuffleIcon } from '@radix-ui/react-icons';
import { runTurn } from '../agent/engine';
import { resolveProvider } from '../llm';
import { newId, transcripts } from '../store/db';
import { sinhBiDanh } from '../alias';
import type { SubAgent, Transcript, TurnResult, WhyNode } from '../types';
import { ChainView } from './ChainView';

type Msg = { role: 'agent' | 'user' | 'system'; text: string };

const provider = resolveProvider();

/**
 * Chatbot khảo sát. Đây là bề mặt duy nhất chạm vào lời gọi AI thật (stage ★).
 * `respondentLocked` = true khi mở qua link public (không cần đăng nhập).
 */
export function Chat({ agent, onDone }: { agent: SubAgent; onDone?: () => void }) {
  const [respondent, setRespondent] = useState('');
  const [started, setStarted] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [chain, setChain] = useState<WhyNode[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState<string[]>([]);

  const transcriptId = useRef(newId('t'));
  const lastQuestion = useRef('');
  const turns = useRef<Transcript['turns']>([]);
  const numbers = useRef<Transcript['numbers']>([]);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  function persist(done: boolean) {
    transcripts.save({
      id: transcriptId.current,
      agentId: agent.id,
      respondent,
      turns: turns.current,
      chain,
      numbers: numbers.current,
      finishedAt: done ? Date.now() : null,
      createdAt: Number(transcriptId.current.slice(-8).replace(/\D/g, '')) || Date.now(),
    });
  }

  function apply(result: TurnResult, v: string[]) {
    setViolations(v);
    if (result.numbers.length) numbers.current = [...numbers.current, ...result.numbers];

    const nextChain = result.node ? [...chain, result.node] : chain;
    if (result.node) setChain(nextChain);

    const out: Msg[] = [];
    if (result.message) out.push({ role: 'system', text: result.message });
    if (result.next_question) {
      lastQuestion.current = result.next_question;
      out.push({ role: 'agent', text: result.next_question });
    }
    setMsgs((m) => [...m, ...out]);

    const done = result.mode === 'stop' || result.mode === 'refuse' || result.mode === 'out_of_scope';
    if (done) {
      setFinished(true);
      onDone?.();
    }
  }

  async function turn(answer: string) {
    setBusy(true);
    setError('');
    try {
      const { result, violations: v } = await runTurn(provider, {
        agent,
        chain,
        lastQuestion: lastQuestion.current,
        lastAnswer: answer,
        // Câu trả lời trước → model tự thấy lạc đề lặp lại và tự huỷ nếu quá nhiều.
        recentAnswers: turns.current.map((t) => t.a),
      });
      if (answer) turns.current = [...turns.current, { q: lastQuestion.current, a: answer, result }];
      apply(result, v);
      persist(
        result.mode === 'stop' || result.mode === 'refuse' || result.mode === 'out_of_scope',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (!started) {
    return (
      <div className="card">
        <h2>{agent.name}</h2>
        <p className="muted">{agent.topic}</p>
        <div className="notice">
          <b>Bạn đang nói chuyện với AI, không phải người.</b> Đây là khảo sát dùng kỹ thuật{' '}
          <b>5-why</b>: mình sẽ hỏi "vì sao" vài lần liên tiếp (tối đa {agent.maxTurns} câu, mỗi
          lượt một câu) để lần xuống nguyên nhân gốc của vấn đề. Có thể hơi lặp —{' '}
          <b>mong bạn kiên nhẫn trả lời</b>; tới đâu không rõ thì cứ nói, mình dừng. Mình có thể
          đoán sai loại nguyên nhân — bạn sửa được nhãn ở bảng bên phải. Câu trả lời được lưu làm
          bằng chứng cho bài tập; bạn có thể để trống tên.
        </div>
        <label>
          Tên hoặc bí danh <span className="muted">(để trống = ẩn danh)</span>
          <div className="aliasRow">
            <input
              value={respondent}
              onChange={(e) => setRespondent(e.target.value)}
              placeholder="ẩn danh"
            />
            <button
              type="button"
              className="aliasBtn"
              title="Tạo bí danh ngẫu nhiên"
              onClick={() => setRespondent(sinhBiDanh())}
            >
              <ShuffleIcon /> Tạo bí danh
            </button>
          </div>
        </label>
        <button
          className="primary"
          onClick={() => {
            setStarted(true);
            void turn('');
          }}
        >
          Bắt đầu
        </button>
        <p className="muted small">
          Provider: <code>{provider.label}</code>
          {!provider.isReal && ' — chưa có API key, đang chạy rule-based.'}
        </p>
      </div>
    );
  }

  return (
    <div className="split">
      <div className="card chat">
        <div className="log">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'row-user' : 'row-assistant'}>
              <div className={`msg ${m.role}`}>{m.text}</div>
            </div>
          ))}
          {busy && (
            <div className="row-assistant">
              <div className="msg agent busy">đang nghĩ…</div>
            </div>
          )}
          <div ref={bottom} />
        </div>

        {error && <div className="err">Lỗi: {error}</div>}
        {violations.length > 0 && (
          <div className="err">
            <b>Vi phạm luật cứng:</b>
            <ul>
              {violations.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>
        )}

        {finished ? (
          <div className="notice">Phiên đã kết thúc. Cảm ơn bạn.</div>
        ) : (
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              const a = input.trim();
              if (!a || busy) return;
              setMsgs((m) => [...m, { role: 'user', text: a }]);
              setInput('');
              void turn(a);
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Trả lời…"
              rows={3}
              disabled={busy}
            />
            <button
              className="primary iconbtn"
              disabled={busy || !input.trim()}
              aria-label="Gửi"
            >
              <PaperPlaneIcon />
            </button>
          </form>
        )}
      </div>

      <ChainView chain={chain} numbers={numbers.current} onEdit={setChain} />
    </div>
  );
}
