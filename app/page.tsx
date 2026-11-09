import type { Viewport } from 'next';
import { Below, Recent } from '@/components/Sections';
import { ToolBar, ToolFoot } from '@/components/Shell';
import { UtmTool } from '@/components/UtmTool';
import './page.css';

export const viewport: Viewport = { themeColor: '#f2a516', colorScheme: 'light' };

export default function Page() {
  return (
    <>
      <div className="ground">
        <ToolBar />
        <main>
          <section className="hero wrap" aria-labelledby="hero-title">
            <div className="hero__intro">
              <h1 id="hero-title">Tag every link the same way</h1>
              <p className="hero__lede">Paste the page, pick a channel, name the campaign, then copy the tagged link into your ad, post or email.</p>
            </div>
            <UtmTool />
          </section>
          <Recent />
        </main>
      </div>
      <Below />
      <ToolFoot />
    </>
  );
}
