const crypto = require("node:crypto");
const KEY = process.env.PF_KEY;
const URL_API = "https://parseflow.dev/api/v1/audit-proof";

const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const rec = (n) => ({
  id: `ext_${n}`, customer_id: "cus_live_check",
  timestamp: `2026-08-31T12:0${n}:00Z`,
  raw_payload_hash: sha(`raw-${n}`), extracted_payload_hash: sha(`out-${n}`),
});
const RECORDS = [0, 1, 2, 3, 4].map(rec);

// Algoritmo VECCHIO, ricostruito qui: serve a produrre una prova v1 come quelle
// che i clienti hanno gia' in mano, e chiedere alla produzione di verificarla.
const canon = (r) => JSON.stringify({ id: r.id, customer_id: r.customer_id, timestamp: r.timestamp, raw_payload_hash: r.raw_payload_hash, extracted_payload_hash: r.extracted_payload_hash });
const hLegacy = (r) => sha(canon(r));
function provaLegacy(recs, i) {
  const sib = []; let layer = recs.map(hLegacy); let idx = i;
  while (layer.length > 1) {
    const isR = idx % 2 === 1;
    const s = isR ? idx - 1 : Math.min(idx + 1, layer.length - 1);
    sib.push({ hash: layer[s], position: isR ? "left" : "right" });
    const next = [];
    for (let k = 0; k < layer.length; k += 2) next.push(sha(layer[k] + (layer[k + 1] ?? layer[k])));
    layer = next; idx = Math.floor(idx / 2);
  }
  return { leaf_hash: hLegacy(recs[i]), leaf_index: i, siblings: sib, root: layer[0] };
}

async function post(body) {
  const r = await fetch(URL_API, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": KEY },
    body: JSON.stringify(body),
  });
  return { status: r.status, json: await r.json().catch(() => null) };
}

(async () => {
  const esiti = {};

  const gen = await post({ mode: "generate", records: RECORDS, record_id: "ext_2" });
  esiti["1_generate"] = {
    http: gen.status,
    version: gen.json?.proof?.version,
    tree_size: gen.json?.proof?.tree_size,
    merkle_version: gen.json?.merkle_version,
    fratelli: gen.json?.proof?.siblings?.length,
  };
  const proof = gen.json?.proof, root = proof?.root;

  const v1 = await post({ mode: "verify", proof, expected_root: root });
  esiti["2_verify_senza_record"] = { valid: v1.json?.valid, chain_valid: v1.json?.chain_valid, record_bound: v1.json?.record_bound };

  const v2 = await post({ mode: "verify", proof, expected_root: root, record: RECORDS[2] });
  esiti["3_verify_col_record_GIUSTO"] = { valid: v2.json?.valid, record_bound: v2.json?.record_bound };

  const v3 = await post({ mode: "verify", proof, expected_root: root, record: RECORDS[3] });
  esiti["4_verify_col_record_SBAGLIATO"] = { valid: v3.json?.valid, record_bound: v3.json?.record_bound };

  const manomessa = { ...proof, leaf_hash: sha("manomesso") };
  const v4 = await post({ mode: "verify", proof: manomessa, expected_root: root });
  esiti["5_foglia_manomessa"] = { valid: v4.json?.valid, chain_valid: v4.json?.chain_valid };

  const troncata = { ...proof, siblings: proof.siblings.slice(0, 1) };
  const v5 = await post({ mode: "verify", proof: troncata, expected_root: root });
  esiti["6_percorso_troncato"] = { valid: v5.json?.valid };

  // La prova d'oro: una prova v1 come quelle gia' consegnate ai clienti.
  const legacy = provaLegacy(RECORDS, 2);
  const v6 = await post({ mode: "verify", proof: legacy, expected_root: legacy.root });
  esiti["7_PROVA_V1_STORICA"] = { valid: v6.json?.valid, chain_valid: v6.json?.chain_valid, merkle_version: v6.json?.merkle_version };

  const v7 = await post({ mode: "verify", proof: legacy, expected_root: sha("radice-sbagliata") });
  esiti["8_prova_v1_su_radice_sbagliata"] = { valid: v7.json?.valid };

  console.log(JSON.stringify(esiti, null, 1));
})();
