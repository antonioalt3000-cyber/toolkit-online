import { describe, it, expect } from 'vitest';
// CommonJS monitor scripts: default-import the module.exports object.
import dailyReport from './daily-report.js';

const { buildReportSubject, buildReportHtml } = dailyReport as {
  buildReportSubject: (args: {
    downNames?: string[];
    highBounceCount?: number;
    dateStr: string;
  }) => string;
  buildReportHtml: (args: {
    date: string;
    siteResults: Array<{ name: string; url: string; status: number; ms: number; ok: boolean }>;
    prospectStats: { total: number; contacted: number; remaining: number; sentToday: number };
    workflowRunUrl: string | null;
    bounce?: unknown;
  }) => string;
};

const okSite = {
  name: 'EmailGuard',
  url: 'https://emailguard.dev',
  status: 200,
  ms: 410,
  ok: true,
};
const stats = { total: 10, contacted: 4, remaining: 6, sentToday: 0 };

describe('buildReportSubject — a delivery failure has to show in the subject', () => {
  it('all green stays the quiet ✅ line', () => {
    expect(buildReportSubject({ dateStr: '10/11/2026' })).toBe(
      '✅ DevToolsmith Daily Report · 10/11/2026'
    );
  });

  it('an undelivered customer email is called out, and counted', () => {
    expect(buildReportSubject({ highBounceCount: 1, dateStr: '10/11/2026' })).toBe(
      '🚨 1 undelivered customer email — DevToolsmith Daily Report · 10/11/2026'
    );
    expect(buildReportSubject({ highBounceCount: 3, dateStr: '10/11/2026' })).toContain(
      '3 undelivered customer emails'
    );
  });

  it('a site down still reads as before', () => {
    expect(buildReportSubject({ downNames: ['SEOScope'], dateStr: '10/11/2026' })).toBe(
      '🔴 SEOScope DOWN — DevToolsmith Daily Report · 10/11/2026'
    );
  });

  it('both failures appear together — neither one hides the other', () => {
    const subject = buildReportSubject({
      downNames: ['SEOScope'],
      highBounceCount: 2,
      dateStr: '10/11/2026',
    });
    expect(subject).toContain('SEOScope DOWN');
    expect(subject).toContain('2 undelivered customer emails');
  });
});

describe('buildReportHtml — the bounce section is part of the daily report', () => {
  it('renders the findings handed to it', () => {
    const html = buildReportHtml({
      date: 'Tuesday, 10 November 2026',
      siteResults: [okSite],
      prospectStats: stats,
      workflowRunUrl: null,
      bounce: {
        ok: true,
        window: { startDate: '2026-11-04', endDate: '2026-11-10' },
        scanned: 9,
        excluded: 7,
        highCount: 1,
        errors: [],
        findings: [
          {
            email: 'adam@adambeckoin.pw',
            event: 'softBounces',
            subject: 'Your EmailGuard Key is Ready',
            from: 'hello@emailguard.dev',
            reason: '551-5.7.1 Your IP is black listed by SpamCop.org',
            priority: 'high',
            why: 'API key delivery',
            occurrences: 1,
            firstSeen: '2026-11-05T09:26:41.000+01:00',
            lastSeen: '2026-11-05T09:26:41.000+01:00',
            messageIds: [],
          },
        ],
      },
    });
    expect(html).toContain('📮 Email Delivery (Brevo bounces)');
    expect(html).toContain('adam@adambeckoin.pw');
    expect(html).toContain('SpamCop.org');
  });

  it('still builds a report when the bounce check produced nothing to show', () => {
    const html = buildReportHtml({
      date: 'Tuesday, 10 November 2026',
      siteResults: [okSite],
      prospectStats: stats,
      workflowRunUrl: null,
    });
    expect(html).toContain('Site Health');
    // No section is rendered, so nothing can read as "delivery verified".
    expect(html).not.toContain('📮 Email Delivery (Brevo bounces)');
    expect(html).not.toContain('No external recipient bounced');
  });
});
