const fs = require('fs');
const dir = 'C:/Users/ftass/toolkit-online/scripts/queue/email';

// Batch 3: 20 more emails to reach 50 total today
// These are well-known companies with standard contact emails
const emails = [
  // F2 ACCESSISCAN — 6 more
  {b:"f2",nm:"Deque Systems",to:"info@deque.com",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Complementary scanning: FixMyWeb 201 checks + axe engine",
   bd:"<p>Hi Deque team,</p><p>Your axe engine is the industry standard for developer accessibility testing. <a href=\"https://fixmyweb.dev\">FixMyWeb</a> targets a different audience: compliance managers and agencies needing quick production site scans — 201 WCAG checks in 60 seconds with statement generator.</p><p>Different users, complementary tools. Cross-referral?</p><p>Best,<br>Antonio</p>"},

  {b:"f2",nm:"TPGi",to:"info@tpgi.com",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Automated pre-screening complement to TPGi consulting",
   bd:"<p>Hi TPGi team,</p><p>Your accessibility consulting and ARC platform are enterprise-grade. <a href=\"https://fixmyweb.dev\">FixMyWeb</a> targets SMEs who need quick 201-check scans before engaging consultants. We could refer companies needing deep audits to you.</p><p>Partnership?</p><p>Best,<br>Antonio</p>"},

  {b:"f2",nm:"AudioEye",to:"info@audioeye.com",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Scanning complement: check before remediation",
   bd:"<p>Hi AudioEye team,</p><p>Your remediation platform fixes accessibility issues automatically. <a href=\"https://fixmyweb.dev\">FixMyWeb</a> helps businesses understand what needs fixing first — 201 WCAG checks with detailed reports. Check first, fix after. Complementary workflow.</p><p>Cross-referral?</p><p>Best,<br>Antonio</p>"},

  {b:"f2",nm:"UserWay",to:"support@userway.org",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"WCAG audit scanner — complement to UserWay widget",
   bd:"<p>Hi UserWay team,</p><p>Your accessibility widget helps websites become compliant. <a href=\"https://fixmyweb.dev\">FixMyWeb</a> shows businesses exactly which issues exist before they choose a solution — 201 WCAG checks, statement generator. Complementary: we diagnose, you treat.</p><p>Cross-referral?</p><p>Best,<br>Antonio</p>"},

  {b:"f2",nm:"Bureau of Internet Accessibility",to:"info@boia.org",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Automated scanning complement to BOIA audits",
   bd:"<p>Hi BOIA team,</p><p>Your manual audits and training are the gold standard. <a href=\"https://fixmyweb.dev\">FixMyWeb</a> offers automated 201-check pre-screening for clients before engaging your team. Saves time on initial assessment. 30% referral commission.</p><p>Best,<br>Antonio</p>"},

  {b:"f2",nm:"Level Access",to:"info@levelaccess.com",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Quick scanning tool for your enterprise accessibility clients",
   bd:"<p>Hi Level Access team,</p><p>Your enterprise platform handles large-scale compliance. For your clients' quick spot-checks, <a href=\"https://fixmyweb.dev\">FixMyWeb</a> offers 201 WCAG checks in 60 seconds. No install, instant results. Could complement your offering for smaller clients.</p><p>Best,<br>Antonio</p>"},

  // B7 CAPTUREAPI — 5 more
  {b:"b7",nm:"SerpApi",to:"support@serpapi.com",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"Visual SERP captures complement to SerpApi data",
   bd:"<p>Hi SerpApi team,</p><p>Your API returns structured SERP data. Some users also need visual proof — screenshots of search results. <a href=\"https://captureapi.dev\">CaptureAPI</a>: screenshot + PDF + OG in one call. 200 free/month. Complementary for SEO tools.</p><p>Best,<br>Antonio</p>"},

  {b:"b7",nm:"ScrapingBee",to:"support@scrapingbee.com",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"Dedicated screenshot endpoint for ScrapingBee users",
   bd:"<p>Hi ScrapingBee team,</p><p>Your web scraping API handles data extraction. For users who need visual captures specifically, <a href=\"https://captureapi.dev\">CaptureAPI</a> offers optimized screenshot + PDF + OG endpoints. 200 free/month. Cross-referral?</p><p>Best,<br>Antonio</p>"},

  {b:"b7",nm:"Screenshotlayer",to:"support@screenshotlayer.com",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"Modern 3-in-1 alternative for screenshot API users",
   bd:"<p>Hi Screenshotlayer team,</p><p><a href=\"https://captureapi.dev\">CaptureAPI</a> offers screenshot + PDF + OG image in one endpoint. Modern REST API, 200 free/month, from $9/month. Different approach, same market. Cross-referral for different use cases?</p><p>Best,<br>Antonio</p>"},

  {b:"b7",nm:"Datadog",to:"info@datadoghq.com",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"Visual monitoring screenshots via API",
   bd:"<p>Hi Datadog team,</p><p>Visual evidence during incidents helps troubleshooting. <a href=\"https://captureapi.dev\">CaptureAPI</a> captures any URL as screenshot/PDF in 1-3s via REST API. Could enrich your monitoring with visual snapshots. 200 free/month.</p><p>Best,<br>Antonio</p>"},

  {b:"b7",nm:"Checkly",to:"support@checklyhq.com",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"Screenshot capture complement to Checkly monitoring",
   bd:"<p>Hi Checkly team,</p><p>Your API monitoring catches downtime. <a href=\"https://captureapi.dev\">CaptureAPI</a> adds visual proof — screenshot + PDF capture of any URL in 1-3 seconds. Could enrich your monitoring alerts with visual context. 200 free/month.</p><p>Best,<br>Antonio</p>"},

  // F1 COMPLIPILOT — 4 more
  {b:"f1",nm:"Fairly AI",to:"info@fairly.ai",fr:"hello@complipilot.dev",fn:"Antonio - CompliPilot",
   su:"EU AI Act automated checks — complement to Fairly AI platform",
   bd:"<p>Hi Fairly AI team,</p><p>Your AI fairness platform handles bias detection. <a href=\"https://complipilot.dev\">CompliPilot</a> automates the regulatory compliance side — 200+ EU AI Act checks covering risk classification and documentation. Fairness + compliance = complete governance.</p><p>Integration?</p><p>Best,<br>Antonio</p>"},

  {b:"f1",nm:"Monitaur",to:"info@monitaur.ai",fr:"hello@complipilot.dev",fn:"Antonio - CompliPilot",
   su:"EU AI Act compliance module for AI governance",
   bd:"<p>Hi Monitaur team,</p><p>Your AI governance platform monitors AI in production. <a href=\"https://complipilot.dev\">CompliPilot</a> handles the pre-deployment regulatory check — 200+ EU AI Act requirements. Together: compliance check before deploy + governance in production.</p><p>Partnership?</p><p>Best,<br>Antonio</p>"},

  {b:"f1",nm:"Arthur AI",to:"hello@arthur.ai",fr:"hello@complipilot.dev",fn:"Antonio - CompliPilot",
   su:"Regulatory compliance complement to Arthur AI monitoring",
   bd:"<p>Hi Arthur AI team,</p><p>Your AI performance monitoring platform is excellent. With EU AI Act deadline August 2026, your clients also need regulatory compliance checks. <a href=\"https://complipilot.dev\">CompliPilot</a>: 200+ automated checks, from $29/month. Referral partnership?</p><p>Best,<br>Antonio</p>"},

  {b:"f1",nm:"Robust Intelligence",to:"info@robustintelligence.com",fr:"hello@complipilot.dev",fn:"Antonio - CompliPilot",
   su:"EU AI Act compliance for AI security clients",
   bd:"<p>Hi Robust Intelligence team,</p><p>Your AI security platform protects models from attacks. EU AI Act also requires compliance documentation. <a href=\"https://complipilot.dev\">CompliPilot</a>: 200+ automated regulatory checks. Security + compliance = complete AI governance. Partnership?</p><p>Best,<br>Antonio</p>"},

  // F3 CHURNGUARD — 3 more
  {b:"f3",nm:"Chargebee",to:"support@chargebee.com",fr:"hello@paymentrescue.dev",fn:"Antonio - ChurnGuard",
   su:"Payment recovery add-on for Chargebee merchants",
   bd:"<p>Hi Chargebee team,</p><p>Your subscription billing platform is excellent. For merchants experiencing involuntary churn from failed payments, <a href=\"https://paymentrescue.dev\">ChurnGuard</a> adds automated 3-step dunning — 30-50% recovery rate. Stripe Connect native.</p><p>Recommended add-on for your merchants?</p><p>Best,<br>Antonio</p>"},

  {b:"f3",nm:"Zuora",to:"support@zuora.com",fr:"hello@paymentrescue.dev",fn:"Antonio - ChurnGuard",
   su:"Stripe-native dunning complement to Zuora billing",
   bd:"<p>Hi Zuora team,</p><p>Your enterprise subscription platform handles complex billing. For Stripe-based merchants needing focused dunning, <a href=\"https://paymentrescue.dev\">ChurnGuard</a> automates failed payment recovery — 30-50% recovery rate, 5 min setup.</p><p>Cross-referral for different segments?</p><p>Best,<br>Antonio</p>"},

  {b:"f3",nm:"Lemon Squeezy",to:"hello@lemonsqueezy.com",fr:"hello@paymentrescue.dev",fn:"Antonio - ChurnGuard",
   su:"Payment recovery for indie creators on Lemon Squeezy",
   bd:"<p>Hi Lemon Squeezy team,</p><p>Your merchant-of-record platform serves indie creators. Failed payments mean lost subscribers. <a href=\"https://paymentrescue.dev\">ChurnGuard</a> recovers 30-50% automatically. Could benefit your creators selling subscriptions.</p><p>Free ROI calculator: paymentrescue.dev/calculator</p><p>Best,<br>Antonio</p>"},

  // F4 DOCUMINT — 2 more
  {b:"f4",nm:"Mindee",to:"contact@mindee.com",fr:"hello@parseflow.dev",fn:"Antonio - DocuMint",
   su:"Lightweight PDF extraction complement to Mindee OCR",
   bd:"<p>Hi Mindee team,</p><p>Your document parsing API uses advanced OCR+ML. <a href=\"https://parseflow.dev\">DocuMint</a> targets the simpler use case: structured PDF to JSON without ML training. Different complexity levels, same developer audience. Cross-referral?</p><p>Best,<br>Antonio</p>"},

  {b:"f4",nm:"Rossum",to:"info@rossum.ai",fr:"hello@parseflow.dev",fn:"Antonio - DocuMint",
   su:"API-first PDF extraction for developers — complement to Rossum",
   bd:"<p>Hi Rossum team,</p><p>Your AI document processing handles enterprise-scale extraction. <a href=\"https://parseflow.dev\">DocuMint</a> targets developers needing simple PDF to JSON — one endpoint, no ML setup. Complementary for different market segments.</p><p>Cross-referral?</p><p>Best,<br>Antonio</p>"}
];

let count = 0;
emails.forEach((e, i) => {
  const filename = '2026-04-03_email_' + e.b + '-' + e.nm.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-b3.json';
  const data = {
    to_email: e.to,
    to_name: e.nm,
    sender_name: e.fn,
    sender_email: e.fr,
    subject: e.su,
    html_body: e.bd
  };
  fs.writeFileSync(dir + '/' + filename, JSON.stringify(data, null, 2));
  count++;
});
console.log('Generated ' + count + ' emails (batch 3)');
