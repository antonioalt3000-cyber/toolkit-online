import { describe, it, expect } from 'vitest';
// CommonJS monitor scripts: default-import the module.exports object.
import uptime from './uptime-check.js';

type Probe = { name: string; ok: boolean; status: number; ms?: number; error?: string };

const { decideUptimeAction, checkWithRetry } = uptime as {
  checkWithRetry: (
    site: { name: string; url: string },
    probe: (s: { name: string }) => Promise<Probe>,
    delayMs: number
  ) => Promise<Probe & { attempts: number; firstError?: string }>;
  decideUptimeAction: (
    results: Array<{ name: string; ok: boolean }>,
    prev: string
  ) => {
    action: 'still-down' | 'alert' | 'recovery' | 'none';
    down: Array<{ name: string }>;
    up: Array<{ name: string }>;
  };
};

const ok = (name: string) => ({ name, ok: true, status: 200 });
const down = (name: string) => ({ name, ok: false, status: 0, error: 'Timeout' });

describe('decideUptimeAction — uptime self-healing state machine', () => {
  it('all up + no prior outage → none (stay quiet)', () => {
    const r = decideUptimeAction([ok('A'), ok('B')], '');
    expect(r.action).toBe('none');
    expect(r.down).toHaveLength(0);
    expect(r.up).toHaveLength(2);
  });

  it('all up + prior outage → recovery (notify once)', () => {
    expect(decideUptimeAction([ok('A'), ok('B')], 'down').action).toBe('recovery');
  });

  it('a site down + no prior outage → alert (first detection)', () => {
    const r = decideUptimeAction([ok('A'), down('B')], '');
    expect(r.action).toBe('alert');
    expect(r.down.map((d) => d.name)).toEqual(['B']);
  });

  it('a site down + already alerted → still-down (no duplicate email)', () => {
    expect(decideUptimeAction([down('A')], 'down').action).toBe('still-down');
  });

  it('multiple down counted correctly', () => {
    const r = decideUptimeAction([down('A'), down('B'), ok('C')], '');
    expect(r.action).toBe('alert');
    expect(r.down).toHaveLength(2);
    expect(r.up).toHaveLength(1);
  });
});

// Un solo timeout da 12s ribaltava lo stato dell'intero portfolio e mandava
// un'email: misurato sul run 41984539750, dove HookLab e' andato in timeout
// mentre gli altri sedici rispondevano in 356-1919 ms. Cinque oscillazioni nella
// storia recente, cinque allerte — e un'inbox che impara a ignorare quella vera.
describe('checkWithRetry — un inciampo non vale un guasto', () => {
  const site = { name: 'HookLab', url: 'https://gethooklab.dev' };

  it('non ritenta quando il primo tentativo riesce', async () => {
    let calls = 0;
    const probe = async () => {
      calls++;
      return { name: 'HookLab', ok: true, status: 200, ms: 700 };
    };
    const r = await checkWithRetry(site, probe, 0);
    expect(calls).toBe(1);
    expect(r.attempts).toBe(1);
    expect(r.ok).toBe(true);
  });

  it('un timeout seguito da una risposta buona NON vale un sito down', async () => {
    const answers: Probe[] = [
      { name: 'HookLab', ok: false, status: 0, ms: 12000, error: 'Timeout (12s)' },
      { name: 'HookLab', ok: true, status: 200, ms: 666 },
    ];
    const probe = async () => answers.shift()!;
    const r = await checkWithRetry(site, probe, 0);
    expect(r.ok).toBe(true);
    expect(r.attempts).toBe(2);
    // Il primo errore resta visibile: un sito che ha bisogno del secondo
    // tentativo a ogni giro e' un reperto a sua volta.
    expect(r.firstError).toBe('Timeout (12s)');
    expect(decideUptimeAction([r], '').action).toBe('none');
  });

  it('un guasto vero fallisce anche il secondo tentativo, nello stesso giro', async () => {
    const probe = async () => ({
      name: 'HookLab',
      ok: false,
      status: 0,
      ms: 12000,
      error: 'Timeout (12s)',
    });
    const r = await checkWithRetry(site, probe, 0);
    expect(r.ok).toBe(false);
    expect(r.attempts).toBe(2);
    // La sensibilita' non cambia: l'allerta parte comunque a questo giro.
    expect(decideUptimeAction([r], '').action).toBe('alert');
  });

  it('un 500 persistente resta down (il retry non lo nasconde)', async () => {
    const probe = async () => ({ name: 'HookLab', ok: false, status: 500, ms: 120 });
    const r = await checkWithRetry(site, probe, 0);
    expect(r.ok).toBe(false);
    expect(r.firstError).toBe('HTTP 500');
    expect(decideUptimeAction([r], '').action).toBe('alert');
  });
});
