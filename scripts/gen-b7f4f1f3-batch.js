const fs = require('fs');
const QUEUE = 'C:/Users/ftass/toolkit-online/scripts/queue/email';

const existing = new Set();
[QUEUE, 'C:/Users/ftass/toolkit-online/scripts/queue/sent'].forEach(dir => {
  try {
    fs.readdirSync(dir).filter(f => f.includes('email') && f.endsWith('.json')).forEach(f => {
      try { const d = JSON.parse(fs.readFileSync(`${dir}/${f}`,'utf8')); if (d.to_email) existing.add(d.to_email.toLowerCase()); } catch(e) {}
    });
  } catch(e) {}
});

const emails = [
  {d:"2026-04-09",b:"b7",s:"mintense",e:"info@mintense.com",n:"Mintense",sn:"Antonio - CaptureAPI",se:"hello@captureapi.dev",su:"Screenshot + PDF API for Mintense client reports",no:"Your multilingual marketing agency serves e-commerce clients across Europe. CaptureAPI (captureapi.dev) captures any URL as screenshot, PDF, or OG image via API. Perfect for automating client reports. 200 free/month."},
  {d:"2026-04-09",b:"b7",s:"dotcom-monitor",e:"sales@dotcom-monitor.com",n:"Dotcom-Monitor",sn:"Antonio - CaptureAPI",se:"hello@captureapi.dev",su:"Visual monitoring API for Dotcom-Monitor",no:"Your monitoring platform could benefit from visual proof during incidents. CaptureAPI (captureapi.dev) captures screenshots in 1-3s via API. 200 free/month."},
  {d:"2026-04-09",b:"b7",s:"visualping",e:"hello@visualping.io",n:"Visualping",sn:"Antonio - CaptureAPI",se:"hello@captureapi.dev",su:"Screenshot API for change detection",no:"Your website change detection tool is brilliant. CaptureAPI (captureapi.dev) provides screenshots via API with custom viewport and full-page capture. Could complement your rendering. 200 free/month."},
  {d:"2026-04-10",b:"b7",s:"eastsideco",e:"info@eastsideco.com",n:"Eastside Co",sn:"Antonio - CaptureAPI",se:"hello@captureapi.dev",su:"Automate Shopify store visuals via API",no:"As a leading Shopify agency in the UK, CaptureAPI (captureapi.dev) automates screenshot capture and OG image generation for client presentations. 200 free/month."},
  {d:"2026-04-10",b:"b7",s:"code-digital",e:"info@code.digital",n:"Code",sn:"Antonio - CaptureAPI",se:"hello@captureapi.dev",su:"Visual QA automation for Shopify Plus builds",no:"As the first certified Shopify Plus agency in EU, visual quality matters. CaptureAPI (captureapi.dev) captures screenshots across viewports for automated QA. 200 free/month."},
  {d:"2026-04-10",b:"f4",s:"finbite",e:"info@finbite.eu",n:"Finbite",sn:"Antonio - DocuMint",se:"hello@parseflow.dev",su:"PDF invoice extraction for Finbite e-invoicing",no:"Your e-invoicing platform serves Baltic and EU businesses. DocuMint (parseflow.dev) extracts structured JSON from PDF invoices via REST API. No ML needed. 100 free pages/month."},
  {d:"2026-04-11",b:"f4",s:"document-logistix",e:"info@document-logistix.com",n:"Document Logistix",sn:"Antonio - DocuMint",se:"hello@parseflow.dev",su:"PDF to JSON extraction for document workflows",no:"Your document management solutions help enterprises digitise. DocuMint (parseflow.dev) extracts structured data from PDFs via API. 100 free pages/month."},
  {d:"2026-04-11",b:"f4",s:"eurofaktura",e:"info@eurofaktura.com",n:"Eurofaktura",sn:"Antonio - DocuMint",se:"hello@parseflow.dev",su:"Automate PDF invoice import for your ERP",no:"Your cloud ERP serves Central European businesses. DocuMint (parseflow.dev) extracts data from supplier PDF invoices automatically. REST API, 100 free pages/month."},
  {d:"2026-04-11",b:"f4",s:"billte",e:"info@billte.ch",n:"Billte",sn:"Antonio - DocuMint",se:"hello@parseflow.dev",su:"Convert legacy PDF invoices to structured data",no:"Your digital billing platform helps Swiss businesses go paperless. DocuMint (parseflow.dev) extracts structured data from legacy PDF invoices. 100 free pages/month."},
  {d:"2026-04-12",b:"f4",s:"finto",e:"jonasm@finto.de",n:"Finto",sn:"Antonio - DocuMint",se:"hello@parseflow.dev",su:"PDF extraction API for invoice-to-pay pipeline",no:"Congrats on YC! DocuMint (parseflow.dev) offers REST API for PDF-to-JSON extraction. Could complement your invoice parsing for edge cases. 100 free pages/month."},
  {d:"2026-04-12",b:"f1",s:"dpoconsultancy",e:"info@dpoconsultancy.nl",n:"DPO Consultancy",sn:"Antonio - CompliPilot",se:"hello@complipilot.dev",su:"Automate EU AI Act assessment for your clients",no:"Your AI Act compliance services help Dutch businesses prepare. CompliPilot (complipilot.dev) runs 200+ automated checks as pre-screening before consulting. Free tier available."},
  {d:"2026-04-12",b:"f1",s:"dpo-europe",e:"info@data-privacy-office.eu",n:"DPO Europe",sn:"Antonio - CompliPilot",se:"hello@complipilot.dev",su:"EU AI Act gap assessment automation",no:"Your AI Act compliance checklist is what businesses need. CompliPilot (complipilot.dev) automates 200+ checks. Your consultants focus on strategy. Partner referral: 30%."},
  {d:"2026-04-13",b:"f1",s:"notdurfter",e:"contact@notdurfter.legal",n:"Notdurfter Legal",sn:"Antonio - CompliPilot",se:"hello@complipilot.dev",su:"AI Act compliance tool per il vostro studio",no:"Il vostro studio con certificazione TUV per AI Act e' una garanzia. CompliPilot (complipilot.dev) automatizza 200+ controlli iniziali. Free tier disponibile."},
  {d:"2026-04-13",b:"f1",s:"techgdpr",e:"privacy@techgdpr.com",n:"TechGDPR",sn:"Antonio - CompliPilot",se:"hello@complipilot.dev",su:"AI Act compliance for your tech clients",no:"Your GDPR expertise extends to AI Act. CompliPilot (complipilot.dev) runs 200+ automated checks. Deadline August 2026. Partner program available."},
  {d:"2026-04-13",b:"f1",s:"neurosys",e:"hello@neurosys.com",n:"NeuroSYS",sn:"Antonio - CompliPilot",se:"hello@complipilot.dev",su:"AI compliance pre-assessment for NeuroSYS",no:"Your AI consulting with Braakhus legal partnership is powerful. CompliPilot (complipilot.dev) adds automated pre-assessment with 200+ EU AI Act checks. From $29/month."},
  {d:"2026-04-14",b:"f3",s:"younium",e:"contact@younium.com",n:"Younium",sn:"Antonio - ChurnGuard",se:"hello@paymentrescue.dev",su:"Payment recovery for B2B subscription clients",no:"Your B2B subscription platform handles recurring billing. ChurnGuard (paymentrescue.dev) recovers 30-50% of failed payments with automated dunning. Could be a valuable add-on."},
  {d:"2026-04-14",b:"f3",s:"affonso",e:"hello@affonso.io",n:"Affonso",sn:"Antonio - ChurnGuard",se:"hello@paymentrescue.dev",su:"Recover failed affiliate payments automatically",no:"Your affiliate platform integrates Stripe/Paddle. ChurnGuard (paymentrescue.dev) automates 3-step recovery for failed payments. 30-50% recovery rate."},
  {d:"2026-04-14",b:"f3",s:"dpocentre",e:"hello@dpocentre.com",n:"DPO Centre",sn:"Antonio - ChurnGuard",se:"hello@paymentrescue.dev",su:"Recover failed membership payments",no:"Your DPO services run on subscriptions. Failed payments mean lost members. ChurnGuard (paymentrescue.dev) recovers 30-50% automatically via Stripe Connect. 5-min setup."},
  {d:"2026-04-15",b:"f3",s:"rare-tea",e:"hello@rareteacompany.com",n:"Rare Tea Company",sn:"Antonio - ChurnGuard",se:"hello@paymentrescue.dev",su:"Recover failed subscription box payments",no:"Your premium tea subscriptions depend on recurring payments. Expired cards cost ~9% MRR annually. ChurnGuard (paymentrescue.dev) recovers 30-50% automatically. Free to try."},
  {d:"2026-04-15",b:"f3",s:"dodo-payments",e:"support@dodopayments.com",n:"Dodo Payments",sn:"Antonio - ChurnGuard",se:"hello@paymentrescue.dev",su:"Dunning automation for your merchants",no:"Your payment platform serves SaaS businesses. ChurnGuard (paymentrescue.dev) adds automated dunning for failed payments. Cross-referral partnership?"}
];

let created = 0, skipped = 0;
for (const em of emails) {
  if (existing.has(em.e.toLowerCase())) { console.log("SKIP:", em.e); skipped++; continue; }
  const data = {to_email:em.e, to_name:em.n, sender_name:em.sn, sender_email:em.se, subject:em.su,
    html_body: "<p>Hi "+em.n+" team,</p><p>"+em.no+"</p><p>Best,<br>Antonio Altomonte<br><a href='https://"+em.se.split('@')[1]+"'>"+em.se.split('@')[1]+"</a></p>"};
  const fn = em.d+"_email_"+em.b+"-"+em.s+".json";
  fs.writeFileSync(QUEUE+"/"+fn, JSON.stringify(data, null, 2));
  console.log("Created:", fn);
  created++;
}
console.log("\nTotal:", created, "created,", skipped, "skipped");
