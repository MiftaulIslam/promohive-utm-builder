import type { Viewport } from 'next';
import { FAQ, Guide } from '@/components/Guide';
import { Below, Recent } from '@/components/Sections';
import { ToolBar, ToolFoot, ToolJsonLd } from '@/components/Shell';
import { UtmTool } from '@/components/UtmTool';
import { tool } from '@/lib/tool';
import './page.css';

export const viewport: Viewport = { themeColor: tool.themeColor, colorScheme: 'light' };

export default function Page() {
  return (
    <>
      <div className="ground">
        <ToolBar />
        <main>
          <section className="hero wrap" aria-labelledby="hero-title">
            <div className="hero__intro">
              <h1 id="hero-title">Tag every link the same way</h1>
              <p className="hero__lede">A free UTM link builder for marketers and founders. Paste the page, pick a channel, name the campaign, then copy the tagged link into your ad, post or email. No sign-up, and it runs in your browser.</p>
            </div>
            <UtmTool />
          </section>
          <Recent />
        </main>
      </div>
      <Below />
      <Guide />
      <ToolFoot />
      <ToolJsonLd faq={FAQ} />
    </>
  );
}
