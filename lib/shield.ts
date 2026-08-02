/**
 * Application-layer flood protection.
 *
 * This is a per-instance, in-memory sliding window. It stops the abuse that reaches the app —
 * scripted scraping, credential stuffing, form spam, single-source request floods — and reports
 * who is doing it. It is NOT a substitute for network-level DDoS protection: a real volumetric
 * attack has to be absorbed before it reaches this code (see README).
 */

export type Offender = {
  ip: string;
  requests: number;
  paths: string[];
  userAgent: string;
  firstSeen: number;
  lastSeen: number;
};

export type AttackSnapshot = {
  offenders: Offender[];
  totalRequests: number;
  windowMs: number;
  detectedAt: number;
};

export type ShieldVerdict = {
  blocked: boolean;
  retryAfterSeconds: number;
  attack: AttackSnapshot | null;
};

function readNumber(name: string, fallback: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const config = {
  /** Length of the sliding window used to count requests. */
  windowMs: readNumber("SHIELD_WINDOW_MS", 10_000),
  /** Requests from one IP inside the window before it is throttled. */
  maxRequests: readNumber("SHIELD_MAX_REQUESTS", 60),
  /** How long a throttled IP stays blocked. */
  blockMs: readNumber("SHIELD_BLOCK_MS", 60_000),
  /** Blocked IPs seen together before this is treated as a coordinated attack. */
  attackOffenders: readNumber("SHIELD_ATTACK_OFFENDERS", 3),
  /** Minimum gap between alert emails, so an attack cannot flood the inbox. */
  alertCooldownMs: readNumber("SHIELD_ALERT_COOLDOWN_MS", 900_000),
  /** Cap on tracked IPs, so the table cannot grow without bound. */
  maxTrackedIps: readNumber("SHIELD_MAX_TRACKED_IPS", 20_000),
};

type Record = {
  hits: number[];
  paths: Set<string>;
  userAgent: string;
  blockedUntil: number;
  firstSeen: number;
  lastSeen: number;
  reported: boolean;
};

const records = new Map<string, Record>();
let lastAlertAt = 0;
let lastSweepAt = 0;

function sweep(now: number) {
  // Amortised cleanup: at most once per window, drop anything with no recent activity.
  if (now - lastSweepAt < config.windowMs) return;
  lastSweepAt = now;

  for (const [ip, record] of records) {
    const idle = now - record.lastSeen > Math.max(config.blockMs, config.windowMs) * 2;
    if (idle && record.blockedUntil <= now) records.delete(ip);
  }
}

export function clientIpFrom(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

export function inspectRequest(ip: string, path: string, userAgent: string): ShieldVerdict {
  const now = Date.now();
  sweep(now);

  let record = records.get(ip);
  if (!record) {
    if (records.size >= config.maxTrackedIps) {
      // Under table pressure, keep serving rather than blocking legitimate traffic.
      return { blocked: false, retryAfterSeconds: 0, attack: null };
    }
    record = {
      hits: [],
      paths: new Set(),
      userAgent,
      blockedUntil: 0,
      firstSeen: now,
      lastSeen: now,
      reported: false,
    };
    records.set(ip, record);
  }

  record.lastSeen = now;
  record.userAgent = userAgent || record.userAgent;
  if (record.paths.size < 12) record.paths.add(path);

  if (record.blockedUntil > now) {
    return {
      blocked: true,
      retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000),
      attack: null,
    };
  }

  const windowStart = now - config.windowMs;
  record.hits = record.hits.filter((hit) => hit > windowStart);
  record.hits.push(now);

  if (record.hits.length <= config.maxRequests) {
    return { blocked: false, retryAfterSeconds: 0, attack: null };
  }

  record.blockedUntil = now + config.blockMs;

  return {
    blocked: true,
    retryAfterSeconds: Math.ceil(config.blockMs / 1000),
    attack: collectAttack(now),
  };
}

function collectAttack(now: number): AttackSnapshot | null {
  const active: Offender[] = [];
  let totalRequests = 0;

  for (const [ip, record] of records) {
    if (record.blockedUntil <= now) continue;
    totalRequests += record.hits.length;
    active.push({
      ip,
      requests: record.hits.length,
      paths: [...record.paths],
      userAgent: record.userAgent,
      firstSeen: record.firstSeen,
      lastSeen: record.lastSeen,
    });
  }

  if (active.length < config.attackOffenders) return null;
  if (now - lastAlertAt < config.alertCooldownMs) return null;

  lastAlertAt = now;
  active.sort((a, b) => b.requests - a.requests);

  return {
    offenders: active.slice(0, 25),
    totalRequests,
    windowMs: config.windowMs,
    detectedAt: now,
  };
}

export const shieldConfig = config;
