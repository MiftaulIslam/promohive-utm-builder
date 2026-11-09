import Image from 'next/image';
import billboards from '@/assets/photos/billboards.jpg';
import socialphone from '@/assets/photos/socialphone.jpg';
import laptopphone from '@/assets/photos/laptopphone.jpg';
import { HISTORY_KEY, UTM_PRESETS } from '@/lib/logic';
import { MergeToggle } from './MergeToggle';
import { ClearHistory, RecentList } from './RecentLinks';

// Runs before first paint: a returning visitor's saved links fill in after mount, so their height is held open here.
const reserveRecent = `try{var h=JSON.parse(localStorage.getItem('${HISTORY_KEY}')||'[]'),n=Array.isArray(h)?h.length:0;if(n){var s=document.createElement('style');s.id='recent-reserve';s.textContent='.recent__list{min-height:calc('+n+' * var(--slip) + '+(n-1)+' * 8px)}.stack__empty{visibility:hidden}';document.head.append(s)}}catch(e){}`;

export function Recent() {
  return (
    <section className="recent wrap" id="recent" aria-labelledby="recent-title">
      <script dangerouslySetInnerHTML={{ __html: reserveRecent }} />
      <div className="recent__head">
        <h2 id="recent-title">Recent links</h2>
        <ClearHistory />
      </div>
      <div className="recent__list"><RecentList /></div>
    </section>
  );
}

function Split() {
  return (
    <section className="split below" aria-labelledby="split-title">
      <div className="wrap">
        <h2 id="split-title" data-in>Facebook, facebook and fb land in three different rows</h2>

        <div className="split__grid">
          <div className="split__side" data-in>
            <p>One person tags a link Facebook and someone else types fb. Analytics tools read those as two different sources, so a single campaign gets split across rows in your report, and a stray space in a campaign name splits it again.</p>
            <p>Every visit is still counted, but it is hard to tell which post or ad brought each signup.</p>
            <MergeToggle reportId="report" countId="report-count" />
          </div>

          <figure className="report" id="report" data-in style={{ '--i': 1 }}>
            <figcaption className="report__cap">
              <span>Example report, for illustration only. One campaign</span>
              <span className="report__count" id="report-count" aria-live="polite">4 rows</span>
            </figcaption>
            <div className="report__head" aria-hidden="true"><span>Source</span><span>Campaign</span></div>
            <div className="report__rows">
              <div className="row" style={{ '--n': 0 }}>
                <span className="row__s"><span className="row__typed">Facebook</span><span className="row__clean" aria-hidden="true">facebook</span></span>
                <span className="row__c">winter-sale</span>
              </div>
              <div className="row" style={{ '--n': 1 }}><span className="row__s">facebook</span><span className="row__c">winter-sale</span></div>
              <div className="row" style={{ '--n': 2 }}><span className="row__s">fb</span><span className="row__c">winter-sale</span></div>
              <div className="row" style={{ '--n': 3 }}><span className="row__s">facebook</span><span className="row__c">winter-sale<i className="row__space" role="img" aria-label="followed by a stray space" /></span></div>
              <div className="report__after">
                <p className="report__big">One campaign, one row</p>
                <p>Values are lowercased and spaces become hyphens, so App Launch and app launch end up as one campaign. The tool tells you whenever it changes what you typed.</p>
              </div>
            </div>
          </figure>
        </div>

        <div className="checks">
          <div className="checks__side" data-in>
            <h3>Checks before you copy</h3>
            <p>You get a warning if the destination URL is not valid or a required field is empty. If the URL already has a query string, it is kept and the UTM tags are added to it.</p>
          </div>
          <dl className="checks__rows" data-in style={{ '--i': 1 }}>
            <div><dt>App Launch</dt><dd>campaign: “App Launch” becomes “app-launch” (lowercase, spaces as hyphens).</dd></div>
            <div><dt>https://yourapp</dt><dd>That does not look like a web address yet.</dd></div>
            <div><dt>yourapp.com/signup?ref=home</dt><dd>Kept the query string that was already on the URL.</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function Billboards() {
  return <figure className="ph-strip" aria-hidden="true"><Image className="ph-bg" src={billboards} alt="" fill sizes="100vw" placeholder="blur" /></figure>;
}

function Channels() {
  return (
    <section className="channels below" aria-labelledby="channels-title">
      <div className="wrap channels__grid">
        <div className="channels__side" data-in>
          <h2 id="channels-title">Six channels on one sheet</h2>
          <p>Buttons for Facebook, Instagram, Google Ads, TikTok, Email and WhatsApp fill in utm_source and utm_medium in one tap.</p>
        </div>

        <div className="labels" data-in style={{ '--i': 1 }}>
          <div>
            <ul className="labels__sheet">
              {UTM_PRESETS.map((p, i) => (
                <li className={i === 0 ? 'sticker sticker--on' : 'sticker'} key={p.name}>
                  <h3>{p.name}</h3>
                  <dl><div><dt>utm_source</dt><dd>{p.source}</dd></div><div><dt>utm_medium</dt><dd>{p.medium}</dd></div></dl>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Local() {
  return (
    <section className="local below" aria-labelledby="local-title">
      <div className="wrap">
        <h2 id="local-title" data-in>Your last 10 links, kept locally</h2>
        <div className="local__grid">
          <p className="local__lede" data-in style={{ '--i': 1 }}>Recent links are saved in this browser&apos;s local storage so you can copy them again. One button clears the list.</p>
          <dl className="local__hood" data-in style={{ '--i': 2 }}>
            <div><dt>Inputs</dt><dd>Destination URL, utm_source, utm_medium, utm_campaign, and optional utm_content and utm_term</dd></div>
            <div><dt>Output</dt><dd>One tagged link with a copy button, with any existing query string kept</dd></div>
            <div><dt>Runs in</dt><dd>Your browser. The last 10 links are kept in localStorage until you clear them, and nothing is sent anywhere.</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function AddressedTo() {
  return (
    <section className="to below" aria-label="Who it is for">
      <div className="wrap to__list">
        <div className="to__row" data-in>
          <span className="to__k">To</span>
          <div><h2>Social media managers</h2><p>Tag each link before it goes into a post, an ad or a WhatsApp broadcast.</p></div>
          <figure className="to__photo" aria-hidden="true"><Image className="ph-bg" src={socialphone} alt="" fill sizes="340px" placeholder="blur" /></figure>
        </div>
        <div className="to__row" data-in>
          <span className="to__k">To</span>
          <div><h2>Founders launching a product</h2><p>Keep campaign names consistent so the signup report still makes sense next month.</p></div>
          <figure className="to__photo" aria-hidden="true"><Image className="ph-bg" src={laptopphone} alt="" fill sizes="340px" placeholder="blur" /></figure>
        </div>
      </div>
    </section>
  );
}

export function Below() {
  return (
    <>
      <Split />
      <Billboards />
      <Channels />
      <Local />
      <AddressedTo />
    </>
  );
}
