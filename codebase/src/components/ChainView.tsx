import type { NodeKind, NumberFound, WhyNode } from '../types';

const KIND_LABEL: Record<NodeKind, string> = {
  nguyen_nhan: 'nguyên nhân',
  dieu_kien: 'điều kiện',
  trieu_chung: 'triệu chứng',
  khong_ap_dung: 'không áp dụng',
};

/**
 * Hiển thị why-chain có nhãn từng tầng. Nguyên tắc G9 (sửa dễ dàng): user đổi
 * được nhãn ngay trên output, và `can_thiep_duoc` tính lại theo nhãn mới.
 */
export function ChainView({
  chain,
  numbers,
  onEdit,
}: {
  chain: WhyNode[];
  numbers: NumberFound[];
  onEdit?: (next: WhyNode[]) => void;
}) {
  const reachedRoot = chain.some((n) => n.can_thiep_duoc);

  return (
    <aside className="card chain">
      <h3>Why-chain</h3>

      {chain.length === 0 && <p className="muted">Chưa có tầng nào.</p>}

      <ol className="nodes">
        {chain.map((n, i) => (
          <li key={i} className={`node ${n.kind}`}>
            <div className="claim">{n.claim}</div>
            <div className="row">
              <select
                value={n.kind}
                disabled={!onEdit}
                onChange={(e) => {
                  const kind = e.target.value as NodeKind;
                  onEdit?.(
                    chain.map((x, j) =>
                      j === i
                        ? { ...x, kind, can_thiep_duoc: kind === 'nguyen_nhan', reason: '(bạn đã sửa nhãn)' }
                        : x,
                    ),
                  );
                }}
              >
                {(Object.keys(KIND_LABEL) as NodeKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
              <span className={n.can_thiep_duoc ? 'tag ok' : 'tag no'}>
                {n.can_thiep_duoc ? 'can thiệp được' : 'chưa can thiệp được'}
              </span>
            </div>
            <div className="muted small">{n.reason}</div>
          </li>
        ))}
      </ol>

      {chain.length > 0 && (
        <div className={reachedRoot ? 'notice ok' : 'notice warn'}>
          {reachedRoot
            ? 'Chain đã tới nguyên nhân can thiệp được.'
            : 'Chain chưa tới nguyên nhân can thiệp được.'}
        </div>
      )}

      <h3>Số liệu</h3>
      {numbers.length === 0 ? (
        <p className="muted">Chưa có con số nào.</p>
      ) : (
        <ul className="numbers">
          {numbers.map((n, i) => (
            <li key={i}>
              <b>{n.text}</b>{' '}
              <span className={n.nguon === 'ASSUMPTION' ? 'tag no' : 'tag ok'}>{n.nguon}</span>
              {n.nguon === 'ASSUMPTION' && (
                <div className="muted small">Phỏng đoán — không tính vào verdict.</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
