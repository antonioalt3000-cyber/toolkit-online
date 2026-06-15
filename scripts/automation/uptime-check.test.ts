import { describe, it, expect } from 'vitest';
// CommonJS monitor scripts: default-import the module.exports object.
import uptime from './uptime-check.js';

const { decideUptimeAction } = uptime as {
  decideUptimeAction: (results: Array<{ name: string; ok: boolean }>, prev: string) => {
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
