/**
 * Who our fetcher says it is, in one place.
 *
 * The same handful of strings go on the /bot page, into the Cloudflare and
 * Akamai submissions, into the User-Agent safeFetch sends, and into the key
 * directory. A mismatch between any two of them is one of the listed grounds for
 * being removed from a verification programme ("the disclosed purpose of the
 * service does not reflect on the traffic"), so they are not allowed to drift.
 *
 * docs/38-bot-verification.md has the submission runbook, docs/22-security.md
 * the identity rules and the line we do not cross.
 */

export const BOT = {
  name: 'TidywrightBot',
  version: '1.0',
  operator: 'Tidywright',

  /**
   * Fixed and public. Never a library default, never a browser we are not. The
   * headless layer is the one exception, and there we really are Chrome.
   */
  userAgent: 'Mozilla/5.0 (compatible; TidywrightBot/1.0; +https://tidywright.com/bot)',

  /** The token a site owner puts in robots.txt to talk to us specifically. */
  robotsToken: 'TidywrightBot',

  infoUrl: 'https://tidywright.com/bot',
  ipListUrl: 'https://tidywright.com/bot/ips.json',
  keyDirectoryUrl: 'https://tidywright.com/.well-known/http-message-signatures-directory',

  contactEmail: 'bot@tidywright.com',
  abuseEmail: 'abuse@tidywright.com',

  /**
   * SEO, and only SEO. Since 15.09.2026 Cloudflare blocks Training and Agent by
   * default on free zones, which is where our audience lives.
   * docs/36-fetch-reliability.md section 2.
   */
  category: 'SEO',

  /** What we promise on the /bot page, so it has to be what the code does. */
  limits: {
    requestsPerSecondPerHost: 1,
    requestsPerSitePerAudit: 20,
    maxCrawlDelaySeconds: 10,
    robotsCacheHours: 24,
  },

  /**
   * Every address we own, both of them, whatever they are doing today.
   *
   * The list we publish and the list we declare to Cloudflare have to be the
   * same list. An address that appears in one and not the other is a listed
   * ground for removal from the programme, in both directions: an unannounced
   * block of IPs, and traffic that does not match the declared purpose. So the
   * rule here is that nothing gets left out for being idle, and `role` carries
   * the difference rather than absence from the list.
   *
   * Both are Hetzner Primary IPs in Falkenstein with delete protection on, so
   * the address survives the server being replaced and this list does not have
   * to change when the box does. docs/39-server-setup.md.
   */
  addresses: [
    {
      ip: '49.13.83.98',
      reverseDns: 'web.tidywright.com',
      role: 'app',
      note: 'Serves the application, the /bot page and the key directory.',
      active: true,
    },
    {
      ip: '188.245.170.86',
      reverseDns: 'crawler.tidywright.com',
      role: 'fetch',
      note: 'Reserved for the audit worker. Declared now, first used in B2.',
      active: false,
    },
  ],
} as const

export type BotAddressRole = (typeof BOT.addresses)[number]['role']

/** Just the addresses, for a WAF rule or a firewall someone is pasting into. */
export const BOT_IPS: readonly string[] = BOT.addresses.map((a) => a.ip)

/** The robots.txt stanza we ask site owners to use when they want us gone. */
export const BOT_ROBOTS_EXAMPLE = `User-agent: ${BOT.robotsToken}\nDisallow: /`
