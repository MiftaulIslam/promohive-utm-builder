'use client';

import { useEffect, useRef, useState } from 'react';
import { parseSlip } from '@/lib/logic';
import { copyText } from './client';
import { clearHistory, COPY_FAILED, useHistory } from './history';

const SLIP_IDLE = 'Copy again';

function Slip({ url }: { url: string }) {
  const [act, setAct] = useState(SLIP_IDLE);
  const timer = useRef<number | undefined>(undefined);
  const { camp, route } = parseSlip(url);

  const onClick = async () => {
    const ok = await copyText(url);
    setAct(ok ? 'Copied again' : COPY_FAILED);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAct(SLIP_IDLE), 1800);
  };

  return (
    <li>
      <button type="button" className={act === SLIP_IDLE ? 'slip' : 'slip is-done'} title={url} onClick={onClick}>
        <span className="slip__hole" aria-hidden="true" />
        <span className="slip__text">
          <span className="slip__top">
            <span className="slip__camp">{camp}</span>
            {route && <span className="slip__route">{route}</span>}
          </span>
          <span className="slip__url">{url}</span>
        </span>
        <span className="slip__act" aria-live="polite">{act}</span>
      </button>
    </li>
  );
}

export function ClearHistory() {
  return <button type="button" className="linkish" onClick={clearHistory}>Clear history</button>;
}

export function RecentList() {
  const items = useHistory();

  useEffect(() => {
    document.getElementById('recent-reserve')?.remove();
  }, [items]);

  return (
    <>
      <ol className="stack">
        {items.map((url) => <Slip key={url} url={url} />)}
      </ol>
      <p className="stack__empty" hidden={items.length > 0}>Links you copy appear here. They stay in this browser only.</p>
    </>
  );
}
