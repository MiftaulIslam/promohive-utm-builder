'use client';

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type ComponentProps } from 'react';
import { addressOf, barsPath, buildUtm, channelOf, cleanUtm, utmParts, UTM_EMPTY, UTM_PRESETS, type UtmField, type UtmValues } from '@/lib/logic';
import { calm, copyText } from './client';
import { COPY_FAILED, remember } from './history';

const SAMPLE: UtmValues = { url: 'https://yourapp.com/signup?ref=home', source: 'facebook', medium: 'paid_social', campaign: 'Winter Sale 2026', content: 'video-a', term: '' };
const COPY_IDLE = 'Copy link';

/** Soft break points after URL punctuation: long links wrap at a seam, and <wbr> leaves copied text untouched. */
function Printed({ text }: { text: string }) {
  return text.split(/(?<=[/?&=-])/).map((piece, i) => (
    <Fragment key={i}>{i > 0 && <wbr />}{piece}</Fragment>
  ));
}

function UtmInput({ name, ...rest }: ComponentProps<'input'> & { name: UtmField }) {
  return <input id={`utm-${name}`} name={name} autoComplete="off" {...rest} />;
}

function Field({ area, label, value }: { area: string; label: string; value: string }) {
  return (
    <div className={`f f--${area}`}>
      <span className="f__k">{label}</span>
      <span className={value ? 'f__v' : 'f__v is-missing'}>{value || 'Still needed'}</span>
    </div>
  );
}

export function UtmTool() {
  const [values, setValues] = useState(SAMPLE);
  const [stamped, setStamped] = useState('');
  const [copyLabel, setCopyLabel] = useState(COPY_IDLE);

  // The latest values for code that runs after the clipboard await, when the render's own copy may be stale.
  const latest = useRef(SAMPLE);
  const campaignInput = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLOutputElement>(null);
  const stamp = useRef<HTMLDivElement>(null);
  const tagDate = useRef<HTMLTimeElement>(null);
  const stampChannel = useRef<SVGTextPathElement>(null);
  const stampDay = useRef<SVGTextElement>(null);
  const stampYear = useRef<SVGTextElement>(null);
  const seenPairs = useRef<Set<string> | null>(null);
  const copyTimer = useRef<number | undefined>(undefined);

  const r = buildUtm(values);
  const { link } = r;
  const source = cleanUtm(values.source);
  const medium = cleanUtm(values.medium);

  if (stamped && link !== stamped) setStamped('');

  useEffect(() => {
    const now = new Date();
    tagDate.current!.textContent = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    tagDate.current!.dateTime = now.toISOString().slice(0, 10);
    stampDay.current!.textContent = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    stampYear.current!.textContent = String(now.getFullYear());
  }, []);

  // A pair like utm_source=facebook gets a one-off ink flash when its value changes.
  useLayoutEffect(() => {
    const marks = output.current!.querySelectorAll('mark');
    const seen = seenPairs.current;
    const pairs = new Set<string>();
    marks.forEach((mark) => {
      const pair = mark.textContent ?? '';
      pairs.add(pair);
      if (seen && !seen.has(pair) && !calm()) mark.classList.add('is-new');
    });
    seenPairs.current = marks.length ? pairs : null;
  }, [link]);

  const update = (patch: Partial<UtmValues>) => {
    latest.current = { ...latest.current, ...patch };
    setValues(latest.current);
  };
  const onInput = (e: ChangeEvent<HTMLInputElement>) => update({ [e.target.name as UtmField]: e.target.value });

  const postmark = (copied: string, v: UtmValues) => {
    stampChannel.current!.textContent = channelOf(v);
    setStamped(copied);
    const el = stamp.current!;
    if (calm()) return;
    el.getAnimations().forEach((a) => a.cancel());
    el.animate([
      { transform: 'rotate(-12deg) scale(1.08)', opacity: 0 },
      { transform: 'rotate(-12deg) scale(1)', opacity: 1 },
    ], { duration: 200, easing: 'cubic-bezier(.16, 1, .3, 1)' });
  };

  const onCopy = async () => {
    const v = latest.current;
    const copied = buildUtm(v).link;
    if (!copied) return;
    const ok = await copyText(copied);
    setCopyLabel(ok ? 'Copied' : COPY_FAILED);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopyLabel(COPY_IDLE), 1800);
    if (!ok) return;
    remember(copied);
    if (buildUtm(latest.current).link === copied) postmark(copied, v);
  };

  const parts = link ? utmParts(link) : [];
  const bars = barsPath(link);
  const lines = [];
  if (parts[0]) lines.push(<span className="ln" key="base"><Printed text={parts[0]} /></span>);
  for (let i = 1; i < parts.length; i += 2) {
    lines.push(
      <span className="ln" key={`${i}:${parts[i]}`}>
        <mark><Printed text={parts[i]} /></mark>
        {parts[i + 1] ? <Printed text={parts[i + 1]} /> : null}
      </span>,
    );
  }

  return (
    <>
      <form
        className="sheet"
        noValidate
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
        onReset={(e) => { e.preventDefault(); update(UTM_EMPTY); }}
      >
        <div className={r.urlInvalid ? 'cell cell--full is-bad' : 'cell cell--full'}>
          <div className="cell__head">
            <label htmlFor="utm-url"><span className="n" aria-hidden="true">1</span>Destination URL *</label>
            <p className="cell__msg" id="utm-url-msg">{r.urlMsg}</p>
          </div>
          <UtmInput name="url" placeholder="https://yourapp.com/signup" value={values.url} onChange={onInput} type="url" inputMode="url" aria-invalid={r.urlInvalid} aria-describedby="utm-url-msg" />
        </div>

        <fieldset className="cell cell--full presets">
          <legend><span className="n" aria-hidden="true">2</span>Fill source and medium</legend>
          <div className="presets__grid">
            {UTM_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className="preset"
                aria-pressed={p.source === source && p.medium === medium}
                onClick={() => { update({ source: p.source, medium: p.medium }); campaignInput.current!.focus(); }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="cell cell--ruled">
          <div className="cell__head"><label htmlFor="utm-source"><span className="n" aria-hidden="true">3</span><code>utm_source</code> *</label></div>
          <UtmInput name="source" placeholder="facebook" value={values.source} onChange={onInput} />
        </div>
        <div className="cell">
          <div className="cell__head"><label htmlFor="utm-medium"><span className="n" aria-hidden="true">4</span><code>utm_medium</code> *</label></div>
          <UtmInput name="medium" placeholder="paid_social" value={values.medium} onChange={onInput} />
        </div>

        <div className="cell cell--full">
          <div className="cell__head"><label htmlFor="utm-campaign"><span className="n" aria-hidden="true">5</span><code>utm_campaign</code> *</label></div>
          <UtmInput name="campaign" placeholder="app-launch-2026" value={values.campaign} onChange={onInput} ref={campaignInput} />
        </div>

        <div className="cell cell--ruled cell--last">
          <div className="cell__head"><label htmlFor="utm-content"><span className="n" aria-hidden="true">6</span><code>utm_content</code></label></div>
          <UtmInput name="content" placeholder="video-a" value={values.content} onChange={onInput} />
        </div>
        <div className="cell cell--last">
          <div className="cell__head"><label htmlFor="utm-term"><span className="n" aria-hidden="true">7</span><code>utm_term</code></label></div>
          <UtmInput name="term" placeholder="optional" value={values.term} onChange={onInput} />
        </div>

        <div className="sheet__foot">
          <p>* Required</p>
          <button type="reset" className="ph-btn">Clear fields</button>
        </div>
      </form>

      <div className="hero__out">
        <article className={stamped ? 'tag is-stamped' : 'tag'} aria-labelledby="tag-title">
          <div className="tag__shadow" aria-hidden="true"><div className="tag__paper" /></div>
          <div className="tag__ring" aria-hidden="true"><div className="tag__hole" /></div>
          <svg className="tag__string" viewBox="0 0 80 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><path d="M36 590C30 480 46 330 38 0" /><path d="M44 590C54 470 38 300 48 0" /></svg>

          <div className="tag__body">
            <header className="tag__band">
              <h2 id="tag-title">Tagged link</h2>
              <p className="tag__date"><time ref={tagDate} /></p>
            </header>

            <div className="tag__grid">
              <Field area="dest" label="Destination" value={r.urlInvalid ? values.url.trim() : addressOf(values.url)} />
              <Field area="src" label="Source" value={source} />
              <Field area="med" label="Medium" value={medium} />
              <Field area="camp" label="Campaign" value={cleanUtm(values.campaign)} />
              <div className="f f--box">
                <div className="postage"><span>Copy the link to postmark this label</span></div>
                <div className="stamp" ref={stamp} aria-hidden="true">
                  <svg viewBox="-70 0 270 200" role="presentation">
                    <defs>
                      <path id="arc-top" d="M 31.1 132.1 A 76 76 0 1 1 168.9 132.1" />
                      <path id="arc-bot" d="M 12 100 A 88 88 0 0 0 188 100" />
                    </defs>
                    <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="3.5" />
                    <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" strokeWidth="2" />
                    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M-66 78q11-8 22 0t22 0t22 0" />
                      <path d="M-66 100q11-8 22 0t22 0t22 0" />
                      <path d="M-66 122q11-8 22 0t22 0t22 0" />
                    </g>
                    <text className="stamp__arc"><textPath ref={stampChannel} href="#arc-top" startOffset="50%" textAnchor="middle" /></text>
                    <text className="stamp__arc"><textPath href="#arc-bot" startOffset="50%" textAnchor="middle">Copied</textPath></text>
                    <text className="stamp__day" ref={stampDay} x="100" y="100" textAnchor="middle" />
                    <text className="stamp__year" ref={stampYear} x="100" y="128" textAnchor="middle" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="tag__link">
              <output ref={output} id="utm-out" className={link ? undefined : 'is-empty'} htmlFor="utm-url utm-source utm-medium utm-campaign" aria-live="polite">
                {link ? lines : r.waiting}
              </output>
            </div>

            <ul className="tag__notes" aria-live="polite">
              {r.notes.map((note) => <li key={note}>{note}</li>)}
            </ul>

            <div className="tag__stub">
              <button type="button" className="copy" disabled={!link} onClick={onCopy}><span aria-live="polite">{copyLabel}</span></button>
              <svg className="tag__bars" viewBox="0 0 160 56" preserveAspectRatio="none" aria-hidden="true">{bars && <path d={bars} />}</svg>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
