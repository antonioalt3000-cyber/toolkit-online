import { describe, it, expect } from 'vitest';
// CommonJS monitor scripts: default-import the module.exports object.
import bounceWatch from './bounce-watch.js';

type BrevoEvent = {
  email: string;
  event: string;
  date?: string;
  subject?: string;
  from?: string;
  reason?: string;
  messageId?: string;
};

type Finding = {
  email: string;
  event: string;
  subject: string;
  priority: 'high' | 'normal';
  why: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  reason: string;
  from: string;
  messageIds: string[];
};

const {
  isInternalRecipient,
  classifySubject,
  classifyEvent,
  windowDates,
  toFindings,
  fetchBounceEvents,
  collectBounceFindings,
  buildBounceSectionHtml,
} = bounceWatch as {
  isInternalRecipient: (email: unknown) => boolean;
  classifySubject: (subject: unknown) => { credential: boolean; label: string | null };
  classifyEvent: (event: unknown) => { priority: 'high' | 'normal'; why: string };
  windowDates: (days?: number, now?: Date) => { startDate: string; endDate: string };
  toFindings: (events: unknown) => { findings: Finding[]; scanned: number; excluded: number };
  fetchBounceEvents: (opts: {
    apiKey: string;
    startDate: string;
    endDate: string;
    fetchPage: (o: { event: string; offset: number; limit: number }) => Promise<BrevoEvent[]>;
  }) => Promise<{ events: BrevoEvent[]; errors: string[] }>;
  collectBounceFindings: (opts: Record<string, unknown>) => Promise<{
    ok: boolean;
    findings: Finding[];
    scanned: number;
    excluded: number;
    highCount: number;
    errors: string[];
    window: { startDate: string; endDate: string };
  }>;
  buildBounceSectionHtml: (result: unknown) => string;
};

// The real event that cost us five days of silence, copied verbatim from the
// Brevo feed (GET /v3/smtp/statistics/events, 2026-11-01 → 2026-11-10).
const ADAM_KEY_BOUNCE: BrevoEvent = {
  date: '2026-11-05T09:26:41.000+01:00',
  email: 'adam@adambeckoin.pw',
  event: 'softBounces',
  subject: 'Your EmailGuard Key is Ready',
  from: 'hello@emailguard.dev',
  reason: '551-5.7.1 Your IP is black listed by SpamCop.org (See https://www.spamcop.net)',
  messageId: '<202611050826.adam@smtp-relay.mailin.fr>',
};

// Same feed, same window: our own creator alias on the MX-less codename domain.
// Six of these in ten days. This is the noise that buries the signal.
const CREATOR_ALIAS_BOUNCE: BrevoEvent = {
  date: '2026-11-09T09:00:53.000+01:00',
  email: 'creator-seoscope@devtoolsmith.dev',
  event: 'softBounces',
  subject: 'Your SEOScope weekly usage summary',
  from: 'hello@seoscope.dev',
  reason: 'Unable to find MX of domain devtoolsmith.dev',
};

describe('isInternalRecipient — our own addresses must never become findings', () => {
  it('excludes the owner inbox and every plus-alias of it', () => {
    expect(isInternalRecipient('antonio.alt3000@gmail.com')).toBe(true);
    expect(isInternalRecipient('antonio.alt3000+qa@gmail.com')).toBe(true);
    expect(isInternalRecipient('antonio.alt3000+seoscope-10nov@gmail.com')).toBe(true);
    // Gmail ignores dots, so the undotted spelling is the SAME inbox. Comparing
    // the literal string would let this one through as if it were a customer.
    expect(isInternalRecipient('antonioalt3000+qa@gmail.com')).toBe(true);
    expect(isInternalRecipient('ANTONIO.ALT3000+QA@Gmail.com')).toBe(true);
  });

  it('excludes the reserved QA domain and the MX-less codename domain', () => {
    expect(isInternalRecipient('qa-seoscope@example.com')).toBe(true);
    expect(isInternalRecipient('qa-prod-25jun+seoscope@example.com')).toBe(true);
    expect(isInternalRecipient('creator-seoscope@devtoolsmith.dev')).toBe(true);
    expect(isInternalRecipient('audit-st-seo@devtoolsmith.dev')).toBe(true);
  });

  it('excludes the products own support mailboxes', () => {
    expect(isInternalRecipient('support@seoscope.dev')).toBe(true);
    expect(isInternalRecipient('support@getcardforge.dev')).toBe(true);
  });

  it('keeps real customers, including other gmail users and other .dev addresses', () => {
    expect(isInternalRecipient('adam@adambeckoin.pw')).toBe(false);
    expect(isInternalRecipient('someone.else@gmail.com')).toBe(false);
    // A customer who happens to be on a .dev domain is still a customer.
    expect(isInternalRecipient('andy@dealfuel.dev')).toBe(false);
    expect(isInternalRecipient('hello@acme.example')).toBe(false);
  });

  it('does not swallow a malformed address — it is unknown, not internal', () => {
    expect(isInternalRecipient('')).toBe(false);
    expect(isInternalRecipient(null)).toBe(false);
    expect(isInternalRecipient('not-an-address')).toBe(false);
  });
});

describe('classifySubject / classifyEvent — credential handovers rank first', () => {
  it('recognises the real credential subject lines of the ten products', () => {
    for (const subject of [
      'Your EmailGuard Key is Ready',
      'Your CaptureAPI Key is Ready',
      'Your CompliPilot account is ready — API key inside',
      'Your CompliPilot sign-in key',
      'Welcome to CompliPilot — Your Lifetime account is ready',
      'Your SEOScope lifetime access is active',
      'Password reset for your account',
    ]) {
      expect(classifySubject(subject).credential, subject).toBe(true);
    }
  });

  it('leaves ordinary mail at normal priority', () => {
    for (const subject of [
      'Your SEOScope weekly usage summary',
      'Your CaptureAPI Pro plan is active',
      'HeaderShield alert: https://x.dev dropped to C',
      '',
    ]) {
      expect(classifySubject(subject).credential, subject).toBe(false);
    }
    expect(
      classifyEvent({ event: 'softBounces', subject: 'Your SEOScope weekly usage summary' })
        .priority
    ).toBe('normal');
  });

  it('the 5 Nov bounce is HIGH, and says why', () => {
    const verdict = classifyEvent(ADAM_KEY_BOUNCE);
    expect(verdict.priority).toBe('high');
    expect(verdict.why).toBe('API key delivery');
  });

  it('a hard bounce is HIGH whatever the subject — every future email is lost too', () => {
    const verdict = classifyEvent({
      event: 'hardBounces',
      subject: 'Your SEOScope weekly usage summary',
    });
    expect(verdict.priority).toBe('high');
    expect(verdict.why).toMatch(/permanently unreachable/);
  });
});

describe('toFindings — grouping, exclusion and ordering', () => {
  it('reports Adam and drops our own alias from the same feed', () => {
    const { findings, scanned, excluded } = toFindings([
      CREATOR_ALIAS_BOUNCE,
      ADAM_KEY_BOUNCE,
      { ...CREATOR_ALIAS_BOUNCE, date: '2026-11-07T02:24:52.000+01:00' },
    ]);
    expect(scanned).toBe(3);
    expect(excluded).toBe(2);
    expect(findings).toHaveLength(1);
    expect(findings[0].email).toBe('adam@adambeckoin.pw');
    expect(findings[0].priority).toBe('high');
    expect(findings[0].reason).toMatch(/SpamCop/);
  });

  it('a clean window produces zero findings and no false positives', () => {
    expect(toFindings([]).findings).toHaveLength(0);
    // A window containing ONLY our own aliases is still clean for customers.
    const onlyOurs = toFindings([
      CREATOR_ALIAS_BOUNCE,
      { ...CREATOR_ALIAS_BOUNCE, email: 'qa-seoscope@example.com' },
      { ...CREATOR_ALIAS_BOUNCE, email: 'antonio.alt3000+qa@gmail.com' },
    ]);
    expect(onlyOurs.findings).toHaveLength(0);
    expect(onlyOurs.excluded).toBe(3);
  });

  it('collapses repeats of the same bounce and keeps the span', () => {
    const { findings } = toFindings([
      ADAM_KEY_BOUNCE,
      { ...ADAM_KEY_BOUNCE, date: '2026-11-07T00:28:27.000+01:00' },
      { ...ADAM_KEY_BOUNCE, date: '2026-11-06T10:00:00.000+01:00' },
    ]);
    expect(findings).toHaveLength(1);
    expect(findings[0].occurrences).toBe(3);
    expect(findings[0].firstSeen).toBe('2026-11-05T09:26:41.000+01:00');
    expect(findings[0].lastSeen).toBe('2026-11-07T00:28:27.000+01:00');
  });

  it('a different subject to the same address is a separate finding', () => {
    const { findings } = toFindings([
      ADAM_KEY_BOUNCE,
      {
        ...ADAM_KEY_BOUNCE,
        date: '2026-11-07T00:28:27.000+01:00',
        subject: 'Your EmailGuard weekly usage summary',
      },
    ]);
    expect(findings).toHaveLength(2);
    // High priority first, regardless of which is more recent.
    expect(findings[0].priority).toBe('high');
    expect(findings[0].subject).toBe('Your EmailGuard Key is Ready');
    expect(findings[1].priority).toBe('normal');
  });
});

describe('windowDates — wide enough to absorb the feed indexing lag', () => {
  it('defaults to a 7-day inclusive window ending today', () => {
    const w = windowDates(undefined, new Date('2026-11-10T04:00:00Z'));
    expect(w).toEqual({ startDate: '2026-11-04', endDate: '2026-11-10' });
  });

  it('a 7-day window taken on 10 Nov still contains the 5 Nov bounce', () => {
    const w = windowDates(7, new Date('2026-11-10T23:59:00Z'));
    expect(w.startDate <= '2026-11-05').toBe(true);
    expect(w.endDate >= '2026-11-05').toBe(true);
  });

  it('days=1 is a single day, and a junk value falls back to the default', () => {
    expect(windowDates(1, new Date('2026-11-10T04:00:00Z'))).toEqual({
      startDate: '2026-11-10',
      endDate: '2026-11-10',
    });
    expect(windowDates(0, new Date('2026-11-10T04:00:00Z')).startDate).toBe('2026-11-04');
  });
});

describe('fetchBounceEvents — paging, and partial failure that keeps the good half', () => {
  const page = (n: number, event: string): BrevoEvent[] =>
    Array.from({ length: n }, (_, i) => ({
      email: `user${i}@customer.test`,
      event,
      date: '2026-11-05T09:00:00.000+01:00',
      subject: 'Your EmailGuard Key is Ready',
    }));

  it('keeps paging until a short page arrives', async () => {
    const calls: Array<{ event: string; offset: number }> = [];
    const { events, errors } = await fetchBounceEvents({
      apiKey: 'k',
      startDate: '2026-11-01',
      endDate: '2026-11-10',
      fetchPage: async ({ event, offset }) => {
        calls.push({ event, offset });
        if (event === 'softBounces') return offset === 0 ? page(100, event) : page(7, event);
        return [];
      },
    });
    expect(errors).toEqual([]);
    expect(events).toHaveLength(107);
    expect(calls).toEqual([
      { event: 'softBounces', offset: 0 },
      { event: 'softBounces', offset: 100 },
      { event: 'hardBounces', offset: 0 },
    ]);
  });

  it('a failure on one event type does not discard the other type findings', async () => {
    const { events, errors } = await fetchBounceEvents({
      apiKey: 'k',
      startDate: '2026-11-01',
      endDate: '2026-11-10',
      fetchPage: async ({ event }) => {
        if (event === 'hardBounces') throw new Error('Brevo HTTP 500: upstream');
        return [ADAM_KEY_BOUNCE];
      },
    });
    expect(events).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/hardBounces: Brevo HTTP 500/);
  });
});

describe('collectBounceFindings — the contract the daily report relies on', () => {
  it('replaying the window that contains 5 Nov reports Adam as high priority', async () => {
    const result = await collectBounceFindings({
      apiKey: 'k',
      startDate: '2026-11-01',
      endDate: '2026-11-10',
      fetchPage: async ({ event }: { event: string }) =>
        event === 'softBounces' ? [ADAM_KEY_BOUNCE, CREATOR_ALIAS_BOUNCE] : [],
    });
    expect(result.ok).toBe(true);
    expect(result.highCount).toBe(1);
    expect(result.findings[0].email).toBe('adam@adambeckoin.pw');
    expect(result.excluded).toBe(1);
    const html = buildBounceSectionHtml(result);
    expect(html).toContain('adam@adambeckoin.pw');
    expect(html).toContain('🚨');
  });

  it('a clean window reports zero findings, with the scope visible', async () => {
    const result = await collectBounceFindings({
      apiKey: 'k',
      startDate: '2026-10-01',
      endDate: '2026-10-07',
      fetchPage: async () => [],
    });
    expect(result.ok).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(result.highCount).toBe(0);
    const html = buildBounceSectionHtml(result);
    expect(html).toContain('No external recipient bounced');
    expect(html).toContain('2026-10-01');
  });

  // An empty window answers `{}` — no `events` key at all. Reading
  // `body.events.length` on that throws, and a check that throws every day
  // while the report still says nothing is how five days of silence happen.
  it('survives the bare {} the API returns for an empty window', async () => {
    const result = await collectBounceFindings({
      apiKey: 'k',
      startDate: '2026-10-01',
      endDate: '2026-10-07',
      fetchPage: async () => {
        const body: { events?: BrevoEvent[] } = {};
        return Array.isArray(body.events) ? body.events : [];
      },
    });
    expect(result.ok).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  it('a missing key is reported as UNKNOWN, never as clean', async () => {
    const result = await collectBounceFindings({
      apiKey: '',
      startDate: '2026-11-01',
      endDate: '2026-11-10',
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/BREVO_API_KEY/);
    const html = buildBounceSectionHtml(result);
    expect(html).toContain('did not run');
    expect(html).not.toContain('No external recipient bounced');
  });

  it('never throws when the feed itself fails', async () => {
    const result = await collectBounceFindings({
      apiKey: 'k',
      startDate: '2026-11-01',
      endDate: '2026-11-10',
      fetchPage: async () => {
        throw new Error('getaddrinfo ENOTFOUND api.brevo.com');
      },
    });
    expect(result.ok).toBe(false);
    expect(result.findings).toHaveLength(0);
    expect(result.errors.join(' ')).toMatch(/ENOTFOUND/);
  });
});
