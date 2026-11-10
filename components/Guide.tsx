import type { Faq } from './Shell';
import { company, links, service } from '@/lib/site';

/** Shown on the page and in the FAQPage structured data, so the two always match. Behaviour follows lib/logic.ts. */
export const FAQ: readonly Faq[] = [
  {
    q: 'What are UTM parameters?',
    a: 'UTM parameters are tags added to the end of a link, such as utm_source=facebook&utm_medium=paid_social&utm_campaign=winter-sale. Google Analytics and most other analytics tools read them to report which site, channel and campaign brought each visit. This builder adds utm_source, utm_medium and utm_campaign, plus utm_content and utm_term when you fill them in.',
  },
  {
    q: 'Which UTM fields are required?',
    a: 'The builder needs a destination URL, utm_source, utm_medium and utm_campaign before it shows a link, and it says which of them is still missing. utm_content, for telling apart two ads or links in the same campaign, and utm_term, for paid search keywords, are optional and are left off the link when they are empty.',
  },
  {
    q: 'Why does the UTM builder lowercase my values?',
    a: 'Analytics tools treat Facebook and facebook as two different sources, which splits one campaign across several report rows. The builder trims each value, lowercases it and turns spaces into hyphens, so App Launch becomes app-launch every time. It shows a note whenever it changes what you typed, so nothing is altered without you seeing it.',
  },
  {
    q: 'What UTM source and medium should I use for Facebook, Google Ads or WhatsApp?',
    a: 'The channel buttons fill in facebook, instagram or tiktok with the medium paid_social, google with cpc for Google Ads, newsletter with email, and whatsapp with social. You can edit either field after picking a channel. What matters most is using the same values every time, so each channel stays in one row of your report.',
  },
  {
    q: 'What happens if my URL already has a query string?',
    a: 'It is kept. The builder adds the UTM tags to the parameters already on the link, such as ?ref=home, and replaces a utm_ parameter that was already there instead of adding a second copy. If you leave out https://, it is added for you, and an address that does not look like a web address is flagged before you copy it.',
  },
  {
    q: 'Is the UTM Link Builder free, and where are my links saved?',
    a: `It is free and needs no sign-up. Links are built in your browser and never sent to a server. Your last 10 links are kept in this browser’s local storage so you can copy them again, and one button clears the list. Nothing is shared between devices or with ${company.name}.`,
  },
];

export function Guide() {
  return (
    <section className="ph-guide below" aria-labelledby="guide-h">
      <div className="wrap ph-guide__grid">
        <div>
          <h2 id="guide-h">How to build a UTM link</h2>
          <ol className="ph-steps">
            <li><p>Paste the destination URL, the page people should land on.</p></li>
            <li><p>Pick a channel such as Facebook, Google Ads or WhatsApp to fill in utm_source and utm_medium, or type your own.</p></li>
            <li><p>Name the campaign, and add utm_content or utm_term if you need to tell ads or keywords apart.</p></li>
            <li><p>Copy the tagged link into your ad, post or email. It is also kept under Recent links in this browser.</p></li>
          </ol>
        </div>

        <div>
          <h2 id="faq-h">UTM questions</h2>
          <div className="ph-faq">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="ph-guide__more">
          This builder is published by <a href={links.home}>{company.name}</a>, which also runs <a href={service('social-media-marketing')}>social media marketing</a> and <a href={service('search-ads')}>Google search ad campaigns</a>, and does <a href={service('seo')}>search engine optimization</a> with campaign tracking set up from the first link.
        </p>
      </div>
    </section>
  );
}
