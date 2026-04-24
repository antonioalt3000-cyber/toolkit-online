#!/usr/bin/env node
/**
 * DAILY OUTREACH SYSTEM — Ricerca target + Creazione email + Invio
 *
 * Eseguire: node scripts/daily-outreach.js
 *
 * Workflow:
 * 1. Legge CONTACTS_REGISTRY.md per evitare duplicati
 * 2. Legge i template email per business
 * 3. Genera email personalizzate dai target predefiniti
 * 4. Invia via Brevo API (max 30/giorno)
 * 5. Aggiorna CONTACTS_REGISTRY.md
 * 6. Sposta file inviati in sent/
 *
 * Limiti:
 * - 30 email outreach/giorno (prudenziale)
 * - 6 per dominio/giorno
 * - Delay 2 sec tra invii
 */

const fs = require("fs");
const path = require("path");

const BREVO_KEY = "REDACTED_LOAD_FROM_ENV";
const QUEUE_DIR = "C:/Users/ftass/toolkit-online/scripts/queue/email";
const SENT_DIR = "C:/Users/ftass/toolkit-online/scripts/queue/sent";
const REGISTRY = path.join(SENT_DIR, "CONTACTS_REGISTRY.md");
const MAX_PER_DAY = 30;
const MAX_PER_DOMAIN = 6;
const DELAY_MS = 2000;

// Business config
const BUSINESSES = {
  F2: { name: "FixMyWeb", domain: "fixmyweb.dev", senderName: "Antonio - FixMyWeb", senderEmail: "hello@fixmyweb.dev", dailyQuota: 10 },
  F1: { name: "CompliPilot", domain: "complipilot.dev", senderName: "Antonio - CompliPilot", senderEmail: "hello@complipilot.dev", dailyQuota: 7 },
  B7: { name: "CaptureAPI", domain: "captureapi.dev", senderName: "Antonio - CaptureAPI", senderEmail: "hello@captureapi.dev", dailyQuota: 5 },
  F3: { name: "PaymentRescue", domain: "paymentrescue.dev", senderName: "Antonio - PaymentRescue", senderEmail: "hello@paymentrescue.dev", dailyQuota: 4 },
  F4: { name: "ParseFlow", domain: "parseflow.dev", senderName: "Antonio - ParseFlow", senderEmail: "hello@parseflow.dev", dailyQuota: 4 },
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getAlreadyContacted() {
  if (!fs.existsSync(REGISTRY)) return new Set();
  const content = fs.readFileSync(REGISTRY, "utf8");
  const emails = new Set();
  const regex = /[\w.-]+@[\w.-]+\.\w+/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    emails.add(match[0].toLowerCase());
  }
  return emails;
}

async function sendEmail(email) {
  const body = JSON.stringify({
    sender: { name: email.sender_name, email: email.sender_email },
    to: [{ email: email.to_email, name: email.to_name }],
    subject: email.subject,
    htmlContent: email.html_body,
  });

  const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_KEY, "Content-Type": "application/json" },
    body,
  });
  const json = await resp.json();
  return json.messageId ? { ok: true, id: json.messageId } : { ok: false, error: JSON.stringify(json) };
}

async function processQueue() {
  const today = new Date().toISOString().slice(0, 10);
  const contacted = getAlreadyContacted();

  // Count emails in queue
  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith(".json"));
  if (files.length === 0) {
    console.log("[OUTREACH] Nessuna email in coda. Genera prima i target.");
    return;
  }

  console.log(`[OUTREACH] ${today} — ${files.length} email in coda, ${contacted.size} contatti gia inviati`);

  const domainCount = {};
  let sent = 0;
  const newContacts = [];

  for (const file of files) {
    if (sent >= MAX_PER_DAY) {
      console.log(`[OUTREACH] Limite giornaliero raggiunto (${MAX_PER_DAY})`);
      break;
    }

    const filepath = path.join(QUEUE_DIR, file);
    let email;
    try {
      email = JSON.parse(fs.readFileSync(filepath, "utf8"));
    } catch {
      console.log(`  SKIP: ${file} — JSON invalido`);
      continue;
    }

    // Check duplicate
    if (contacted.has(email.to_email.toLowerCase())) {
      console.log(`  SKIP: ${email.to_email} — gia contattato`);
      fs.renameSync(filepath, path.join(SENT_DIR, file));
      continue;
    }

    // Check domain limit
    const domain = email.sender_email.split("@")[1];
    domainCount[domain] = (domainCount[domain] || 0) + 1;
    if (domainCount[domain] > MAX_PER_DOMAIN) {
      console.log(`  SKIP: ${email.to_email} — limite dominio ${domain} raggiunto`);
      continue;
    }

    // Send
    const result = await sendEmail(email);
    if (result.ok) {
      console.log(`  SENT: ${email.to_email} (${email.to_name}) via ${domain}`);
      sent++;
      newContacts.push(`- ${email.to_email} (${email.to_name}) — INVIATA ${today}`);
      fs.renameSync(filepath, path.join(SENT_DIR, file));
    } else {
      console.log(`  FAIL: ${email.to_email} — ${result.error}`);
    }

    await sleep(DELAY_MS);
  }

  // Update registry
  if (newContacts.length > 0) {
    const registryUpdate = `\n\n## Auto-Outreach ${today}\n${newContacts.join("\n")}\n**Inviate oggi: ${sent}**\n`;
    fs.appendFileSync(REGISTRY, registryUpdate);
    console.log(`\n[OUTREACH] Registro aggiornato: ${sent} nuovi contatti`);
  }

  console.log(`[OUTREACH] COMPLETATO: ${sent} inviate, ${files.length - sent} rimaste in coda`);
}

// Run
processQueue().catch(console.error);
