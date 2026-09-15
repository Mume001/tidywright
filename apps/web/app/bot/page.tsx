import type { Metadata } from 'next'
import { BOT, BOT_ROBOTS_EXAMPLE } from '@tw/shared'

/**
 * https://tidywright.com/bot
 *
 * The page every verification programme asks for, and the page a site owner
 * lands on after finding TidywrightBot in their logs. It is written for the
 * second person, not for a reviewer, because the reviewer is reading it to find
 * out whether a real person would be helped by it.
 *
 * Everything factual on it comes from BOT in packages/shared, so the page, the
 * User-Agent, the IP list and the Cloudflare submission cannot drift apart.
 * docs/38-bot-verification.md, docs/22-security.md.
 */

export const metadata: Metadata = {
  title: 'TidywrightBot',
  description: 'What TidywrightBot is, what it fetches, where it comes from, and how to block it.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-tx2">{children}</div>
    </section>
  )
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-line bg-panel2 p-4 font-mono text-[13px] text-tx">
      {children}
    </pre>
  )
}

export default function BotPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs tracking-widest text-tx3 uppercase">Bot information</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">{BOT.name}</h1>
      <p className="mt-4 text-lg leading-relaxed text-tx2">
        {BOT.name} is the fetcher behind Tidywright, an SEO audit tool. It reads one page of a
        website when somebody asks it to, checks that page against a published catalogue of
        technical and on-page rules, and writes the result into a report.
      </p>

      <Section title="What it does, precisely">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            It runs <strong className="text-tx">only when a person asks for an audit</strong>. There
            is no scheduled crawl and no discovery queue. One request from a visitor means one site
            is looked at.
          </li>
          <li>
            It fetches the page itself, <code className="font-mono text-tx">/robots.txt</code>,{' '}
            <code className="font-mono text-tx">/sitemap.xml</code> and at most two resources named
            in the page, such as the image a page nominates for sharing.
          </li>
          <li>
            It never walks a site. The hard ceiling is{' '}
            <strong className="text-tx">{BOT.limits.requestsPerSitePerAudit} requests</strong> for
            one audit, at no more than{' '}
            <strong className="text-tx">
              {BOT.limits.requestsPerSecondPerHost} request per second
            </strong>{' '}
            per host.
          </li>
          <li>
            It does not store page content to train models, and it does not sell or republish what
            it reads. The audit exists so one site owner can be told what to fix.
          </li>
        </ul>
      </Section>

      <Section title="How to recognise it">
        <p>Every request carries this User-Agent, unchanged, on every plan and every route:</p>
        <Pre>{BOT.userAgent}</Pre>
        <p>
          Requests also carry an RFC 9421 HTTP Message Signature, so you can verify us
          cryptographically rather than trusting a string anyone could copy. Our public keys are
          published as a JSON Web Key Set at:
        </p>
        <Pre>{BOT.keyDirectoryUrl}</Pre>
        <p>
          Our egress addresses are published as JSON at{' '}
          <a href="/bot/ips.json" className="text-lime underline underline-offset-2">
            {BOT.ipListUrl}
          </a>
          . Each one has reverse DNS that resolves into our domain and forward-confirms back to the
          same address. If a request claims to be us and its address is not on that list, it is not
          us.
        </p>
      </Section>

      <Section title="How to block it">
        <p>
          Put this in your <code className="font-mono text-tx">robots.txt</code>. We honour a rule
          that names us, without exception, including for people who have verified that they own the
          site:
        </p>
        <Pre>{BOT_ROBOTS_EXAMPLE}</Pre>
        <p>
          We also honour <code className="font-mono text-tx">Crawl-delay</code> up to{' '}
          {BOT.limits.maxCrawlDelaySeconds} seconds, and we cache{' '}
          <code className="font-mono text-tx">robots.txt</code> for no more than{' '}
          {BOT.limits.robotsCacheHours} hours. If you would rather block us at the edge, a firewall
          rule on the User-Agent above or on the published addresses works and we will not route
          around it.
        </p>
      </Section>

      <Section title="What we will not do">
        <p>
          This is a policy, not a preference, and it is the reason you can treat the identity above
          as reliable:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>We do not forge TLS or HTTP/2 fingerprints.</li>
          <li>We do not use stealth patches to hide that a page was opened by automation.</li>
          <li>We do not solve CAPTCHAs, and we do not pay anyone to solve them.</li>
          <li>
            We do not use residential or rotating proxies. Our addresses are ours and published.
          </li>
          <li>We do not change identity after being blocked. A block is an answer.</li>
        </ul>
        <p>
          When a page will not render without JavaScript we open it in a real Chrome browser. In
          that case we genuinely are a browser, opening one page on one person&apos;s behalf, and we
          say so here rather than hiding it.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions, allowlisting, or a request that we stop:{' '}
          <a href={`mailto:${BOT.contactEmail}`} className="text-lime underline underline-offset-2">
            {BOT.contactEmail}
          </a>
          . Abuse or anything that looks like us behaving badly:{' '}
          <a href={`mailto:${BOT.abuseEmail}`} className="text-lime underline underline-offset-2">
            {BOT.abuseEmail}
          </a>
          . Both are read by a person.
        </p>
        <p className="text-sm text-tx3">
          Operator: {BOT.operator}. Declared category: {BOT.category}.
        </p>
      </Section>
    </main>
  )
}
