const { spawn } = require("child_process");
const REG = ["old_us0","old_us1","old_us3","old_eu0","new_line","new_us","new_eu"];
const CAS = ["digits_commas","spaces","digits_dot","leaders_mix"];
const LIMIT = 5000;
(async () => {
  for (const r of REG) for (const c of CAS) {
    const res = await new Promise((resolve) => {
      const p = spawn(process.execPath, [__dirname + "/one.js", r, c], { stdio: ["ignore","pipe","pipe"] });
      let out = ""; p.stdout.on("data", d => out += d);
      const t = setTimeout(() => { p.kill("SIGKILL"); resolve({ regex:r, case:c, ms:">"+LIMIT, HANG:true }); }, LIMIT);
      p.on("exit", () => { clearTimeout(t); try { resolve(JSON.parse(out)); } catch { resolve({regex:r,case:c,ms:"?"}); } });
    });
    const flag = res.HANG ? "  🔴 BLOCCATO" : (Number(res.ms) > 300 ? "  ⚠️ lento" : "");
    console.log(`${res.regex.padEnd(9)} ${res.case.padEnd(14)} ${String(res.ms).padStart(7)} ms${flag}`);
  }
})();
