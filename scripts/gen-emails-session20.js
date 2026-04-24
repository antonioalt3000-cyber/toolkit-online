const fs = require('fs');
const dir = 'C:/Users/ftass/toolkit-online/scripts/queue/email';

const emails = [
  // === F2 ACCESSISCAN — 10 email ===
  {d:"2026-04-04",b:"f2",nm:"Funka",to:"info@funka.com",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Partnership: automated WCAG scanning for Nordic clients",
   bd:"<p>Hi Funka team,</p><p>Your accessibility expertise across the Nordics is impressive. I built <a href=\"https://fixmyweb.dev\">FixMyWeb</a> — 201 automated WCAG checks in 60 seconds. Agencies use it to pre-screen client sites before deep manual audits.</p><p>Partner program: 30% referral commission, or white-label from $9/month. Happy to demo.</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-04",b:"f2",nm:"Koena",to:"aloha@koena.net",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Outil complementaire: 201 checks WCAG automatises en 60 secondes",
   bd:"<p>Bonjour Koena,</p><p>Votre travail sur l'accessibilite numerique en France est remarquable. J'ai developpe <a href=\"https://fixmyweb.dev\">FixMyWeb</a>: 201 checks WCAG en 60 secondes, avec snippets de code et generateur de declaration d'accessibilite.</p><p>Programme partenaire: 30% commission. Interesses?</p><p>Cordialement,<br>Antonio</p>"},

  {d:"2026-04-05",b:"f2",nm:"Fable",to:"info@makeitfable.com",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Automated + human testing: FixMyWeb pre-screens, Fable validates",
   bd:"<p>Hi Fable team,</p><p>Your approach — testing with real people with disabilities — is the gold standard. <a href=\"https://fixmyweb.dev\">FixMyWeb</a> runs 201 WCAG checks in 60 seconds, catching low-hanging fruit before your testers focus on complex issues.</p><p>Cross-referral partnership? We send clients needing human testing to you, you recommend us for pre-screening.</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-05",b:"f2",nm:"Evinced",to:"info@evinced.com",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"201 WCAG checks for compliance managers — complementary to Evinced dev tools",
   bd:"<p>Hi Evinced team,</p><p>Your developer-focused a11y tools are great during development. <a href=\"https://fixmyweb.dev\">FixMyWeb</a> focuses on the other side: production site scanning for compliance managers and agencies. 201 checks, statement generator, VPAT generator.</p><p>Different audience, complementary tools. Cross-referral?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-06",b:"f2",nm:"Quertum",to:"m.majewski@quertum.net",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Automated WCAG scanning for your EU accessibility projects",
   bd:"<p>Hi Maciej,</p><p>Quertum's work on digital accessibility across Poland and Finland is impressive. I built <a href=\"https://fixmyweb.dev\">FixMyWeb</a>: 201 automated WCAG checks in 60 seconds. EAA enforcement is creating demand across all EU countries.</p><p>Partner: 30% referral commission. White-label from $9/month. Worth a chat?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-06",b:"f2",nm:"FFG Austria",to:"wzg@ffg.at",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Automated WCAG monitoring — 201 checks for Austrian EAA compliance",
   bd:"<p>Guten Tag,</p><p>FFG's digitalbarrierefrei.at initiative is a strong driver for accessibility in Austria. <a href=\"https://fixmyweb.dev\">FixMyWeb</a>: 201 WCAG checks in 60 seconds, statement generator, fix code snippets. Free tier available.</p><p>Could be useful for organizations you advise. Happy to provide a demo.</p><p>Best regards,<br>Antonio</p>"},

  {d:"2026-04-07",b:"f2",nm:"AP Portugal",to:"info@apportugal.com",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Ferramenta de acessibilidade web: 201 verificacoes WCAG em 60 segundos",
   bd:"<p>Ola equipa AP Portugal,</p><p>O vosso trabalho em acessibilidade digital e excelente. Com a EAA em vigor em Portugal, a procura por ferramentas automaticas esta a crescer.</p><p><a href=\"https://fixmyweb.dev\">FixMyWeb</a>: 201 verificacoes WCAG, gerador de declaracao de acessibilidade. Programa de parceria: 30% de comissao.</p><p>Interessados?</p><p>Cumprimentos,<br>Antonio</p>"},

  {d:"2026-04-07",b:"f2",nm:"A11yWatch",to:"hello@a11ywatch.com",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Cross-referral: continuous monitoring + deep one-time scanning",
   bd:"<p>Hi A11yWatch team,</p><p>Your continuous accessibility monitoring is great for ongoing compliance. <a href=\"https://fixmyweb.dev\">FixMyWeb</a> focuses on deep one-time scans: 201 WCAG checks with fix code snippets and statement generation.</p><p>Different use cases, same audience. Cross-referral partnership?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-08",b:"f2",nm:"Silktide",to:"hello@silktide.com",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"Partnership: lightweight scanning complement to Silktide platform",
   bd:"<p>Hi Silktide team,</p><p>Your web governance platform handles large-scale monitoring. <a href=\"https://fixmyweb.dev\">FixMyWeb</a> offers quick 201-check scans for agencies needing instant results — pre-screening before committing to a full platform.</p><p>Referral partnership? 30% commission for referred clients.</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-08",b:"f2",nm:"Tenon",to:"hello@tenon.io",fr:"hello@fixmyweb.dev",fn:"Antonio - FixMyWeb",
   su:"201 WCAG checks + statement generator — complementary a11y scanning",
   bd:"<p>Hi Tenon team,</p><p>Your accessibility testing API is developer-focused. <a href=\"https://fixmyweb.dev\">FixMyWeb</a> targets the business user side: 201 checks, accessibility statement generator, VPAT generator. No code needed.</p><p>Cross-referral? Developers to you, compliance managers to us.</p><p>Best,<br>Antonio</p>"},

  // === B7 CAPTUREAPI — 8 email ===
  {d:"2026-04-09",b:"b7",nm:"ApiFlash",to:"contact@apiflash.com",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"Cross-referral: your Chrome rendering + our 3-in-1 API",
   bd:"<p>Hi ApiFlash team,</p><p>Your Chrome-based screenshot API on AWS Lambda is fast. <a href=\"https://captureapi.dev\">CaptureAPI</a> takes a different approach: screenshot + PDF + OG image in one endpoint. Different strengths for different use cases. Cross-referral?</p><p>200 free screenshots/month.</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-09",b:"b7",nm:"Scrapfly",to:"sales@scrapfly.io",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"Dedicated screenshot API for your scraping clients",
   bd:"<p>Hi Scrapfly team,</p><p>Your scraping platform handles data extraction. Some clients also need visual captures. <a href=\"https://captureapi.dev\">CaptureAPI</a>: screenshot + PDF + OG in one endpoint, 200 free/month, from $9/month. Referral partnership?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-10",b:"b7",nm:"Intelgic",to:"hello@intelgic.com",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"Document capture API for your AI processing pipeline",
   bd:"<p>Hi Intelgic team,</p><p>Your document AI processes structured data. <a href=\"https://captureapi.dev\">CaptureAPI</a> could feed your pipeline: capture any web page as screenshot or PDF, then you extract the data. 200 free/month. Integration partnership?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-10",b:"b7",nm:"Browse AI",to:"support@browseai.com",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"Screenshot + PDF capture complement to your web automation",
   bd:"<p>Hi Browse AI team,</p><p>Your no-code web automation extracts data brilliantly. <a href=\"https://captureapi.dev\">CaptureAPI</a> adds visual capture: screenshot + PDF + OG in one API call. For clients who need both data AND visual proof. 200 free/month.</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-11",b:"b7",nm:"Microlink",to:"hello@microlink.io",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"3-in-1 screenshot API — complementary to meta scraping",
   bd:"<p>Hi Microlink team,</p><p>Your meta-as-a-service is elegant. <a href=\"https://captureapi.dev\">CaptureAPI</a> focuses on visual capture: screenshot + PDF + OG image generation. Different endpoints, complementary for developers. Cross-referral?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-11",b:"b7",nm:"Hexomatic",to:"support@hexomatic.com",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"Screenshot API integration for your automation workflows",
   bd:"<p>Hi Hexomatic team,</p><p>Your automation workflows could benefit from visual capture steps. <a href=\"https://captureapi.dev\">CaptureAPI</a>: screenshot + PDF + OG via REST API, 200 free/month. Integration or marketplace listing?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-12",b:"b7",nm:"Apify",to:"hello@apify.com",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"Dedicated screenshot Actor for the Apify marketplace",
   bd:"<p>Hi Apify team,</p><p>Your Actor marketplace is great for scraping workflows. <a href=\"https://captureapi.dev\">CaptureAPI</a> specializes in visual capture: screenshot + PDF + OG in one endpoint. Could be a useful Actor integration. 200 free/month.</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-12",b:"b7",nm:"PhantomBuster",to:"support@phantombuster.com",fr:"hello@captureapi.dev",fn:"Antonio - CaptureAPI",
   su:"Visual proof screenshots for your lead generation workflows",
   bd:"<p>Hi PhantomBuster team,</p><p>Your lead generation automations are powerful. Adding visual screenshots of target pages (competitor pages, prospect sites) enriches the output. <a href=\"https://captureapi.dev\">CaptureAPI</a>: 200 free/month, simple REST endpoint.</p><p>Best,<br>Antonio</p>"},

  // === F1 COMPLIPILOT — 5 email ===
  {d:"2026-04-13",b:"f1",nm:"Holistic AI",to:"we@holisticai.com",fr:"hello@complipilot.dev",fn:"Antonio - CompliPilot",
   su:"SME-focused AI compliance complement to Holistic AI enterprise",
   bd:"<p>Hi Holistic AI team,</p><p>Your enterprise AI governance platform is comprehensive. <a href=\"https://complipilot.dev\">CompliPilot</a> targets SMEs with 5-50 employees who can't afford enterprise pricing. 200+ automated EU AI Act checks, from $29/month.</p><p>Referral for SME clients?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-13",b:"f1",nm:"BD Emerson",to:"info@bdemerson.com",fr:"hello@complipilot.dev",fn:"Antonio - CompliPilot",
   su:"Automated AI compliance pre-screening for your consulting clients",
   bd:"<p>Hi BD Emerson team,</p><p>Your AI governance consulting navigates complex regulations. <a href=\"https://complipilot.dev\">CompliPilot</a> could speed up initial assessments: 200+ automated EU AI Act checks in minutes. Partner commission: 30%.</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-14",b:"f1",nm:"CalypsoAI",to:"info@calypsoai.com",fr:"hello@complipilot.dev",fn:"Antonio - CompliPilot",
   su:"EU AI Act compliance module — complementary to CalypsoAI security",
   bd:"<p>Hi CalypsoAI team,</p><p>Your AI security platform protects models in production. <a href=\"https://complipilot.dev\">CompliPilot</a> handles the regulatory side: 200+ EU AI Act checks covering risk classification, transparency, documentation. Security + compliance = complete governance.</p><p>Integration partnership?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-14",b:"f1",nm:"Level Access",to:"marketing@essentialaccessibility.com",fr:"hello@complipilot.dev",fn:"Antonio - CompliPilot",
   su:"AI Act + EAA: dual compliance offering for your clients",
   bd:"<p>Hi Level Access team,</p><p>You help with digital accessibility (EAA). Many of your clients also use AI — chatbots, recommendations — under the EU AI Act (deadline August 2026). <a href=\"https://complipilot.dev\">CompliPilot</a>: 200+ automated AI Act checks. Accessibility + AI compliance = complete EU coverage.</p><p>Cross-referral?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-15",b:"f1",nm:"TruRisk AI",to:"contact@trurisk.ai",fr:"hello@complipilot.dev",fn:"Antonio - CompliPilot",
   su:"Automated EU AI Act compliance — complementary to risk assessment",
   bd:"<p>Hi TruRisk AI team,</p><p>Your AI risk assessment identifies risks. <a href=\"https://complipilot.dev\">CompliPilot</a> automates the regulatory check: 200+ EU AI Act requirements, risk classification, documentation. Risk assessment + compliance = complete package.</p><p>Partnership?</p><p>Best,<br>Antonio</p>"},

  // === F3 CHURNGUARD — 4 email ===
  {d:"2026-04-15",b:"f3",nm:"Paddle",to:"sellers@paddle.com",fr:"hello@paymentrescue.dev",fn:"Antonio - ChurnGuard",
   su:"Failed payment recovery add-on for Paddle merchants",
   bd:"<p>Hi Paddle team,</p><p>As a merchant of record, you handle billing — but failed payments still happen. <a href=\"https://paymentrescue.dev\">ChurnGuard</a> specializes in automated 3-step dunning recovering 30-50% of failed payments. Could be a valuable add-on for Paddle sellers.</p><p>Free ROI calculator: paymentrescue.dev/calculator</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-16",b:"f3",nm:"Schematic",to:"hi@schematichq.com",fr:"hello@paymentrescue.dev",fn:"Antonio - ChurnGuard",
   su:"Reduce involuntary churn for your pricing platform clients",
   bd:"<p>Hi Schematic team,</p><p>Your pricing platform optimizes revenue. One leak most miss: involuntary churn from failed payments (5-9% MRR annually). <a href=\"https://paymentrescue.dev\">ChurnGuard</a> recovers 30-50% automatically via Stripe dunning.</p><p>ROI calculator: paymentrescue.dev/calculator</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-16",b:"f3",nm:"Billsby",to:"support@billsby.com",fr:"hello@paymentrescue.dev",fn:"Antonio - ChurnGuard",
   su:"Dunning automation add-on for Billsby merchants",
   bd:"<p>Hi Billsby team,</p><p>Your subscription billing handles recurring payments well. For when payments fail, <a href=\"https://paymentrescue.dev\">ChurnGuard</a> adds automated 3-step dunning recovery — 30-50% recovery rate. Recommended integration for your merchants?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-17",b:"f3",nm:"Saaslogic",to:"sales@saaslogic.io",fr:"hello@paymentrescue.dev",fn:"Antonio - ChurnGuard",
   su:"Payment recovery module for your subscription management platform",
   bd:"<p>Hi Saaslogic team,</p><p>Your subscription management handles the billing cycle. <a href=\"https://paymentrescue.dev\">ChurnGuard</a> handles what happens when it breaks: automated dunning for failed payments, recovering 30-50%. Integration or referral?</p><p>Best,<br>Antonio</p>"},

  // === F4 DOCUMINT — 3 email ===
  {d:"2026-04-17",b:"f4",nm:"ScryAI",to:"getstarted@scryai.com",fr:"hello@parseflow.dev",fn:"Antonio - DocuMint",
   su:"PDF to JSON API for your invoice processing pipeline",
   bd:"<p>Hi ScryAI team,</p><p>Your AI-powered invoice processing is impressive. <a href=\"https://parseflow.dev\">DocuMint</a> offers simple PDF to JSON extraction via REST API — no ML training required. For clients needing quick extraction. From $19/month.</p><p>Integration?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-17",b:"f4",nm:"Sensible",to:"hello@sensible.so",fr:"hello@parseflow.dev",fn:"Antonio - DocuMint",
   su:"Lightweight PDF extraction complement to Sensible platform",
   bd:"<p>Hi Sensible team,</p><p>Your document extraction handles complex layouts brilliantly. <a href=\"https://parseflow.dev\">DocuMint</a> targets the simpler use case: quick PDF to JSON for invoices and receipts. No configuration needed. Cross-referral?</p><p>Best,<br>Antonio</p>"},

  {d:"2026-04-17",b:"f4",nm:"DigiParser",to:"support@digiparser.com",fr:"hello@parseflow.dev",fn:"Antonio - DocuMint",
   su:"API-first PDF extraction — complementary to DigiParser",
   bd:"<p>Hi DigiParser team,</p><p>Your 99.7% accuracy on invoice parsing is impressive. <a href=\"https://parseflow.dev\">DocuMint</a> takes an API-first approach: one endpoint, PDF in, JSON out. No ML setup. Complementary for developers wanting simplicity. Cross-referral?</p><p>Best,<br>Antonio</p>"}
];

let count = 0;
emails.forEach(e => {
  const filename = e.d + '_email_' + e.b + '-' + e.nm.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.json';
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
console.log('Generated ' + count + ' emails in queue/email/');
