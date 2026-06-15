import { describe, it, expect } from 'vitest';
import brevo from './brevo.js';

const { dedupKey, isWithinDedupWindow, DEDUP_WINDOW_MS } = brevo as {
  dedupKey: (to: unknown, subject: string) => string;
  isWithinDedupWindow: (prevTs: number, now?: number) => boolean;
  DEDUP_WINDOW_MS: number;
};

// `to` is always the Brevo recipient shape: an array of {email,name} or a bare
// {email} object (this is what sendEmail() passes), never a raw string.
const A = [{ email: 'a@x.com', name: 'A' }];
const B = [{ email: 'b@x.com', name: 'B' }];

describe('dedupKey — stable, content-addressed dedup key', () => {
  it('same recipient + subject → same key', () => {
    expect(dedupKey(A, 'Hi')).toBe(dedupKey(A, 'Hi'));
  });
  it('array-of-objects and bare-object recipient forms produce the same key', () => {
    expect(dedupKey([{ email: 'a@x.com', name: 'A' }], 'Hi')).toBe(dedupKey({ email: 'a@x.com' }, 'Hi'));
  });
  it('different subject → different key', () => {
    expect(dedupKey(A, 'Hi')).not.toBe(dedupKey(A, 'Bye'));
  });
  it('different recipient → different key', () => {
    expect(dedupKey(A, 'Hi')).not.toBe(dedupKey(B, 'Hi'));
  });
});

describe('isWithinDedupWindow — 5-minute suppression window', () => {
  const now = 1_000_000_000;
  it('suppresses a send inside the window', () => {
    expect(isWithinDedupWindow(now - (DEDUP_WINDOW_MS - 1), now)).toBe(true);
  });
  it('allows a send past the window', () => {
    expect(isWithinDedupWindow(now - (DEDUP_WINDOW_MS + 1), now)).toBe(false);
  });
  it('non-finite previous timestamp never suppresses', () => {
    expect(isWithinDedupWindow(NaN, now)).toBe(false);
  });
});
