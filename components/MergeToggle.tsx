'use client';

import { useEffect, useRef, useState } from 'react';
import { calm } from './client';

/** Folds the server-rendered report's four spellings into one row, once on arrival and on demand after that. */
export function MergeToggle({ reportId, countId }: { reportId: string; countId: string }) {
  const [merged, setMerged] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    document.getElementById(reportId)?.classList.toggle('is-merged', merged);
    const count = document.getElementById(countId);
    if (count) count.textContent = merged ? '1 row' : '4 rows';
  }, [merged, reportId, countId]);

  useEffect(() => {
    const report = document.getElementById(reportId);
    if (!report || !('IntersectionObserver' in window) || calm()) return;
    let timer: number | undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      timer = window.setTimeout(() => { if (!touched.current) setMerged(true); }, 1100);
    }, { threshold: 0.55 });
    observer.observe(report);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [reportId]);

  return (
    <button
      type="button"
      className="ph-btn split__toggle"
      aria-pressed={merged}
      onClick={() => { touched.current = true; setMerged((m) => !m); }}
    >
      {merged ? 'Show them as typed' : 'Tag them the same way'}
    </button>
  );
}
