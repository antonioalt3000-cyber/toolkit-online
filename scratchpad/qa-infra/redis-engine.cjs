// Generic in-memory Redis command engine, shared by the Upstash REST mock.
// Covers the command surface used across the 10 SaaS repos (string/hash/set/
// sorted-set/list primitives + EVAL via a real embedded Lua VM so
// @upstash/ratelimit's actual Lua scripts run with correct semantics).
'use strict';

const STRING = 'string',
  HASH = 'hash',
  SET = 'set',
  ZSET = 'zset',
  LIST = 'list';

class RedisEngine {
  constructor() {
    this.store = new Map(); // key -> { type, value, expiresAt }
    this.scripts = new Map(); // sha1 -> script source (for EVALSHA)
  }

  _entry(key) {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (e.expiresAt !== null && e.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return e;
  }

  _ensure(key, type, factory) {
    let e = this._entry(key);
    if (!e) {
      e = { type, value: factory(), expiresAt: null };
      this.store.set(key, e);
    } else if (e.type !== type) {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }
    return e;
  }

  // ---- strings ----
  get(key) {
    const e = this._entry(key);
    return e ? e.value : null;
  }

  mget(...keys) {
    return keys.map((k) => this.get(k));
  }

  set(key, value, opts = {}) {
    const existing = this._entry(key);
    if (opts.nx && existing) return null;
    if (opts.xx && !existing) return null;
    const prevValue = opts.get ? (existing?.value ?? null) : undefined;
    const e = { type: STRING, value: String(value), expiresAt: null };
    if (typeof opts.ex === 'number') e.expiresAt = Date.now() + opts.ex * 1000;
    else if (typeof opts.px === 'number') e.expiresAt = Date.now() + opts.px;
    else if (typeof opts.exat === 'number') e.expiresAt = opts.exat * 1000;
    else if (typeof opts.pxat === 'number') e.expiresAt = opts.pxat;
    else if (opts.keepttl && existing) e.expiresAt = existing.expiresAt;
    this.store.set(key, e);
    return opts.get ? prevValue : 'OK';
  }

  del(...keys) {
    let n = 0;
    for (const k of keys) if (this.store.delete(k)) n++;
    return n;
  }

  exists(...keys) {
    let n = 0;
    for (const k of keys) if (this._entry(k)) n++;
    return n;
  }

  incrby(key, by) {
    const e = this._entry(key);
    const cur = e ? Number(e.value) : 0;
    if (Number.isNaN(cur)) throw new Error('value is not an integer');
    const next = cur + by;
    this.store.set(key, { type: STRING, value: String(next), expiresAt: e?.expiresAt ?? null });
    return next;
  }
  incr(key) {
    return this.incrby(key, 1);
  }
  decr(key) {
    return this.incrby(key, -1);
  }
  decrby(key, by) {
    return this.incrby(key, -by);
  }

  expire(key, seconds) {
    const e = this._entry(key);
    if (!e) return 0;
    e.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }
  pexpire(key, ms) {
    const e = this._entry(key);
    if (!e) return 0;
    e.expiresAt = Date.now() + ms;
    return 1;
  }
  ttl(key) {
    const e = this._entry(key);
    if (!e) return -2;
    if (e.expiresAt === null) return -1;
    return Math.max(0, Math.ceil((e.expiresAt - Date.now()) / 1000));
  }
  pttl(key) {
    const e = this._entry(key);
    if (!e) return -2;
    if (e.expiresAt === null) return -1;
    return Math.max(0, e.expiresAt - Date.now());
  }
  persist(key) {
    const e = this._entry(key);
    if (!e || e.expiresAt === null) return 0;
    e.expiresAt = null;
    return 1;
  }

  // ---- hashes ----
  hset(key, fieldsObj) {
    const e = this._ensure(key, HASH, () => new Map());
    let added = 0;
    for (const [f, v] of Object.entries(fieldsObj)) {
      if (!e.value.has(f)) added++;
      e.value.set(f, String(v));
    }
    return added;
  }
  hget(key, field) {
    const e = this._entry(key);
    return e ? (e.value.get(field) ?? null) : null;
  }
  hdel(key, ...fields) {
    const e = this._entry(key);
    if (!e) return 0;
    let n = 0;
    for (const f of fields) if (e.value.delete(f)) n++;
    return n;
  }
  hgetall(key) {
    const e = this._entry(key);
    if (!e) return {};
    return Object.fromEntries(e.value.entries());
  }
  hincrby(key, field, by) {
    const e = this._ensure(key, HASH, () => new Map());
    const cur = Number(e.value.get(field) ?? 0);
    const next = cur + by;
    e.value.set(field, String(next));
    return next;
  }

  // ---- sets ----
  sadd(key, ...members) {
    const e = this._ensure(key, SET, () => new Set());
    let added = 0;
    for (const m of members) {
      const s = String(m);
      if (!e.value.has(s)) {
        e.value.add(s);
        added++;
      }
    }
    return added;
  }
  srem(key, ...members) {
    const e = this._entry(key);
    if (!e) return 0;
    let n = 0;
    for (const m of members) if (e.value.delete(String(m))) n++;
    return n;
  }
  scard(key) {
    const e = this._entry(key);
    return e ? e.value.size : 0;
  }
  sismember(key, member) {
    const e = this._entry(key);
    return e && e.value.has(String(member)) ? 1 : 0;
  }
  smembers(key) {
    const e = this._entry(key);
    return e ? [...e.value] : [];
  }
  smove(src, dst, member) {
    const s = this._entry(src);
    if (!s || !s.value.has(String(member))) return 0;
    s.value.delete(String(member));
    const d = this._ensure(dst, SET, () => new Set());
    d.value.add(String(member));
    return 1;
  }

  // ---- sorted sets ----
  zadd(key, pairs) {
    // pairs: array of [score, member]
    const e = this._ensure(key, ZSET, () => new Map());
    let added = 0;
    for (const [score, member] of pairs) {
      const m = String(member);
      if (!e.value.has(m)) added++;
      e.value.set(m, Number(score));
    }
    return added;
  }
  zrem(key, ...members) {
    const e = this._entry(key);
    if (!e) return 0;
    let n = 0;
    for (const m of members) if (e.value.delete(String(m))) n++;
    return n;
  }
  zcard(key) {
    const e = this._entry(key);
    return e ? e.value.size : 0;
  }
  zscore(key, member) {
    const e = this._entry(key);
    if (!e) return null;
    const v = e.value.get(String(member));
    return v === undefined ? null : v;
  }
  zincrby(key, by, member) {
    const e = this._ensure(key, ZSET, () => new Map());
    const cur = e.value.get(String(member)) ?? 0;
    const next = cur + by;
    e.value.set(String(member), next);
    return next;
  }
  zrange(key, start, stop, withScores) {
    const e = this._entry(key);
    if (!e) return [];
    const sorted = [...e.value.entries()].sort((a, b) => a[1] - b[1]);
    const n = sorted.length;
    const norm = (i) => (i < 0 ? Math.max(n + i, 0) : Math.min(i, n));
    const s = norm(start),
      eidx = stop < 0 ? Math.max(n + stop, -1) + 1 : Math.min(stop + 1, n);
    const slice = sorted.slice(s, Math.max(s, eidx));
    if (!withScores) return slice.map(([m]) => m);
    const out = [];
    for (const [m, sc] of slice) {
      out.push(m, sc);
    }
    return out;
  }

  // ---- lists ----
  lpush(key, ...values) {
    const e = this._ensure(key, LIST, () => []);
    for (const v of values) e.value.unshift(String(v));
    return e.value.length;
  }
  rpush(key, ...values) {
    const e = this._ensure(key, LIST, () => []);
    for (const v of values) e.value.push(String(v));
    return e.value.length;
  }
  lpop(key, count) {
    const e = this._entry(key);
    if (!e) return count ? [] : null;
    const n = count ?? 1;
    const popped = e.value.splice(0, n);
    return count ? popped : (popped[0] ?? null);
  }
  rpop(key, count) {
    const e = this._entry(key);
    if (!e) return count ? [] : null;
    const n = count ?? 1;
    const popped = e.value.splice(Math.max(0, e.value.length - n), n).reverse();
    return count ? popped : (popped[0] ?? null);
  }
  llen(key) {
    const e = this._entry(key);
    return e ? e.value.length : 0;
  }
  lrange(key, start, stop) {
    const e = this._entry(key);
    if (!e) return [];
    const n = e.value.length;
    const norm = (i) => (i < 0 ? Math.max(n + i, 0) : Math.min(i, n));
    const s = norm(start),
      eidx = stop < 0 ? Math.max(n + stop, -1) + 1 : Math.min(stop + 1, n);
    return e.value.slice(s, Math.max(s, eidx));
  }
  ltrim(key, start, stop) {
    const e = this._entry(key);
    if (!e) return 'OK';
    const n = e.value.length;
    const norm = (i) => (i < 0 ? Math.max(n + i, 0) : Math.min(i, n));
    const s = norm(start),
      eidx = stop < 0 ? Math.max(n + stop, -1) + 1 : Math.min(stop + 1, n);
    e.value = e.value.slice(s, Math.max(s, eidx));
    return 'OK';
  }

  // ---- dispatcher: args are already flat, lowercase cmd name ----
  dispatch(cmdArr) {
    const [cmdRaw, ...args] = cmdArr;
    const cmd = String(cmdRaw).toLowerCase();
    switch (cmd) {
      case 'get':
        return this.get(args[0]);
      case 'mget':
        return this.mget(...args);
      case 'set': {
        const [key, value, ...rest] = args;
        const opts = {};
        for (let i = 0; i < rest.length; i++) {
          const flag = String(rest[i]).toLowerCase();
          if (flag === 'nx') opts.nx = true;
          else if (flag === 'xx') opts.xx = true;
          else if (flag === 'get') opts.get = true;
          else if (flag === 'keepttl') opts.keepttl = true;
          else if (flag === 'ex') opts.ex = Number(rest[++i]);
          else if (flag === 'px') opts.px = Number(rest[++i]);
          else if (flag === 'exat') opts.exat = Number(rest[++i]);
          else if (flag === 'pxat') opts.pxat = Number(rest[++i]);
        }
        return this.set(key, value, opts);
      }
      case 'del':
        return this.del(...args);
      case 'exists':
        return this.exists(...args);
      case 'incr':
        return this.incr(args[0]);
      case 'decr':
        return this.decr(args[0]);
      case 'incrby':
        return this.incrby(args[0], Number(args[1]));
      case 'decrby':
        return this.decrby(args[0], Number(args[1]));
      case 'expire':
        return this.expire(args[0], Number(args[1]));
      case 'pexpire':
        return this.pexpire(args[0], Number(args[1]));
      case 'ttl':
        return this.ttl(args[0]);
      case 'pttl':
        return this.pttl(args[0]);
      case 'persist':
        return this.persist(args[0]);
      case 'hset': {
        const [key, ...fv] = args;
        const obj = {};
        for (let i = 0; i < fv.length; i += 2) obj[fv[i]] = fv[i + 1];
        return this.hset(key, obj);
      }
      case 'hget':
        return this.hget(args[0], args[1]);
      case 'hdel':
        return this.hdel(args[0], ...args.slice(1));
      case 'hgetall': {
        // Real Upstash REST wire format returns a FLAT array of alternating
        // field/value strings (never a pre-built object) — the @upstash/redis
        // SDK's own deserializer expects exactly that shape and throws
        // ("Cannot read properties of null (reading 'length')") when handed an
        // object instead. Confirmed by reproducing against the real SDK
        // (20 Oct 2026 QA round) — this one-line bug made every hash-based
        // user-record read crash under the real client, previously masked
        // because earlier tests only probed hgetall via raw curl.
        const obj = this.hgetall(args[0]);
        return Object.entries(obj).flat();
      }
      case 'hincrby':
        return this.hincrby(args[0], args[1], Number(args[2]));
      case 'sadd':
        return this.sadd(args[0], ...args.slice(1));
      case 'srem':
        return this.srem(args[0], ...args.slice(1));
      case 'scard':
        return this.scard(args[0]);
      case 'sismember':
        return this.sismember(args[0], args[1]);
      case 'smembers':
        return this.smembers(args[0]);
      case 'smove':
        return this.smove(args[0], args[1], args[2]);
      case 'zadd': {
        const [key, ...sm] = args;
        const pairs = [];
        for (let i = 0; i < sm.length; i += 2) pairs.push([Number(sm[i]), sm[i + 1]]);
        return this.zadd(key, pairs);
      }
      case 'zrem':
        return this.zrem(args[0], ...args.slice(1));
      case 'zcard':
        return this.zcard(args[0]);
      case 'zscore':
        return this.zscore(args[0], args[1]);
      case 'zincrby':
        return this.zincrby(args[0], Number(args[1]), args[2]);
      case 'zrange': {
        const withScores = args.slice(3).some((a) => String(a).toLowerCase() === 'withscores');
        return this.zrange(args[0], Number(args[1]), Number(args[2]), withScores);
      }
      case 'lpush':
        return this.lpush(args[0], ...args.slice(1));
      case 'rpush':
        return this.rpush(args[0], ...args.slice(1));
      case 'lpop':
        return this.lpop(args[0], args[1] !== undefined ? Number(args[1]) : undefined);
      case 'rpop':
        return this.rpop(args[0], args[1] !== undefined ? Number(args[1]) : undefined);
      case 'llen':
        return this.llen(args[0]);
      case 'lrange':
        return this.lrange(args[0], Number(args[1]), Number(args[2]));
      case 'ltrim':
        return this.ltrim(args[0], Number(args[1]), Number(args[2]));
      case 'ping':
        return 'PONG';
      case 'flushall':
      case 'flushdb':
        this.store.clear();
        return 'OK';
      default:
        throw new Error(`QA-MOCK: unsupported command '${cmd}' (args=${JSON.stringify(args)})`);
    }
  }
}

module.exports = { RedisEngine };
