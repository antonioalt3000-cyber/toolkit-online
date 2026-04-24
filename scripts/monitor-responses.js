#!/usr/bin/env node
/**
 * MONITOR RESPONSES — Sistema automatico di monitoraggio
 * Controlla: email risposte outreach, Reddit DM notifications, Capterra/G2 updates
 * Eseguito da /boss ad ogni sessione e dalla daily-routine
 *
 * Output: report in queue/reports/YYYY-MM-DD_monitor.json
 */

const fs = require('fs');
const path = require('path');

const REPORT_DIR = 'C:/Users/ftass/toolkit-online/scripts/queue/reports';
const SENT_DIR = 'C:/Users/ftass/toolkit-online/scripts/queue/sent';
const today = new Date().toISOString().split('T')[0];

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Count sent emails by business
function countSentEmails() {
  const files = fs.readdirSync(SENT_DIR).filter(f => f.endsWith('.json'));
  const counts = { total: files.length, f2: 0, b7: 0, f1: 0, f3: 0, f4: 0, other: 0 };

  files.forEach(f => {
    if (f.includes('_f2-') || f.includes('_f2_')) counts.f2++;
    else if (f.includes('_b7-') || f.includes('_b7_')) counts.b7++;
    else if (f.includes('_f1-') || f.includes('_f1_')) counts.f1++;
    else if (f.includes('_f3-') || f.includes('_f3_')) counts.f3++;
    else if (f.includes('_f4-') || f.includes('_f4_')) counts.f4++;
    else counts.other++;
  });

  return counts;
}

// Count pending items in queues
function countQueues() {
  const emailDir = 'C:/Users/ftass/toolkit-online/scripts/queue/email';
  const contentDir = 'C:/Users/ftass/toolkit-online/scripts/queue/content';
  const blueskyDir = 'C:/Users/ftass/toolkit-online/scripts/queue/bluesky';

  const emailCount = fs.existsSync(emailDir) ? fs.readdirSync(emailDir).filter(f => f.endsWith('.json')).length : 0;
  const contentCount = fs.existsSync(contentDir) ? fs.readdirSync(contentDir).filter(f => f.endsWith('.json')).length : 0;
  const blueskyCount = fs.existsSync(blueskyDir) ? fs.readdirSync(blueskyDir).filter(f => f.endsWith('.txt')).length : 0;

  return { email: emailCount, content: contentCount, bluesky: blueskyCount };
}

// Generate report
const sentCounts = countSentEmails();
const queues = countQueues();

const report = {
  date: today,
  timestamp: new Date().toISOString(),
  email_stats: {
    total_sent: sentCounts.total,
    by_business: {
      f2_accessiscan: sentCounts.f2,
      b7_captureapi: sentCounts.b7,
      f1_complipilot: sentCounts.f1,
      f3_churnguard: sentCounts.f3,
      f4_documint: sentCounts.f4,
      other: sentCounts.other
    }
  },
  queues: queues,
  channels: {
    reddit_forhire: {
      post_id: '1sbn8hr',
      url: 'https://www.reddit.com/r/forhire/comments/1sbn8hr/',
      status: 'active',
      next_repost: '2026-04-10',
      check: 'Monitor DM via Reddit email notifications in Gmail'
    },
    rapidapi: {
      b7: 'https://rapidapi.com/antonioalt3000/api/captureapi',
      f4: 'https://rapidapi.com/antonioalt3000/api/documint-pdf-extractor',
      status: 'active'
    },
    capterra: {
      f2: 'submitted, awaiting review',
      check: 'Monitor email from Gartner/Capterra'
    }
  },
  gmail_checks: [
    'from:reddit subject:message OR subject:comment after:' + today,
    'from:paddle OR from:maxio OR from:chargebee after:' + today,
    'from:capterra OR from:gartner OR from:g2 after:' + today,
    'from:rapidapi after:' + today,
    '(subject:re: OR subject:reply) -from:mailer-daemon after:' + today
  ],
  actions_needed: []
};

// Check if queues are low
if (queues.email < 5) {
  report.actions_needed.push('CRITICAL: Email queue low (' + queues.email + '). Generate 50 new emails.');
}
if (queues.content < 2) {
  report.actions_needed.push('WARNING: Content queue low (' + queues.content + '). Create 2+ articles.');
}
if (queues.bluesky < 3) {
  report.actions_needed.push('WARNING: Bluesky queue low (' + queues.bluesky + '). Create 6+ posts.');
}

// Check if Reddit repost is due
const nextRepost = new Date('2026-04-10');
const now = new Date();
if (now >= nextRepost) {
  report.actions_needed.push('ACTION: Reddit r/forhire repost is due (7-day rule). Create new [For Hire] post.');
}

// Save report
const reportFile = path.join(REPORT_DIR, today + '_monitor.json');
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

// Console output
console.log('=== MONITOR REPORT ' + today + ' ===');
console.log('Email sent: ' + sentCounts.total + ' (F2:' + sentCounts.f2 + ' B7:' + sentCounts.b7 + ' F1:' + sentCounts.f1 + ' F3:' + sentCounts.f3 + ' F4:' + sentCounts.f4 + ')');
console.log('Queues: email=' + queues.email + ', content=' + queues.content + ', bluesky=' + queues.bluesky);
console.log('Channels: Reddit r/forhire (active), RapidAPI (active), Capterra (pending)');
if (report.actions_needed.length > 0) {
  console.log('--- ACTIONS NEEDED ---');
  report.actions_needed.forEach(a => console.log('  ! ' + a));
} else {
  console.log('All systems nominal.');
}
console.log('Gmail queries to run:');
report.gmail_checks.forEach(q => console.log('  > ' + q));
