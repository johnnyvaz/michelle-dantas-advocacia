/**
 * Verificação de identidade de robô (DNS reverso para Googlebot/Bingbot, faixas
 * oficiais publicadas para OpenAI/Perplexity). O endereço é usado em trânsito e
 * nunca persistido — só o booleano sai daqui.
 *
 * Cópia de PLATAFORMA-CURSOS/src/lib/seo/crawler-verification.ts.
 */
export type VerificationMethod = "rdns" | "ip-range" | "unavailable";

export interface VerificationResult {
  verified: boolean | null;
  verification_method: VerificationMethod;
}

export type VerificationRanges = Record<string, string[]>;

const RANGE_ENDPOINTS: Record<string, string> = {
  "OAI-SearchBot": "https://openai.com/searchbot.json",
  "ChatGPT-User": "https://openai.com/chatgpt-user.json",
  PerplexityBot: "https://www.perplexity.com/perplexitybot.json",
  "Perplexity-User": "https://www.perplexity.com/perplexity-user.json",
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1_000;
let rangesCache:
  | { value: VerificationRanges; refreshedAt: number }
  | undefined;

export function primeVerificationRanges(
  value: VerificationRanges,
  refreshedAt = Date.now(),
): void {
  rangesCache = { value, refreshedAt };
}

export function getVerificationMethod(token: string): VerificationMethod {
  if (token === "Googlebot" || token === "Bingbot") return "rdns";
  if (Object.prototype.hasOwnProperty.call(RANGE_ENDPOINTS, token)) {
    return "ip-range";
  }
  return "unavailable";
}

function ipv4ToNumber(address: string): number | null {
  const parts = address.split(".");
  if (
    parts.length !== 4 ||
    parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)
  ) {
    return null;
  }
  return parts.reduce(
    (value, part) => ((value << 8) | Number(part)) >>> 0,
    0,
  );
}

export function isAddressInCidr(address: string, cidr: string): boolean {
  const [network, rawBits] = cidr.split("/");
  const ip = ipv4ToNumber(address);
  const base = ipv4ToNumber(network);
  const bits = Number(rawBits);
  if (ip === null || base === null || !Number.isInteger(bits) || bits < 0 || bits > 32) {
    return false;
  }
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ip & mask) >>> 0 === (base & mask) >>> 0;
}

function suffixAllowed(token: string, hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  if (token === "Googlebot") {
    return normalized.endsWith(".googlebot.com") ||
      normalized.endsWith(".google.com");
  }
  if (token === "Bingbot") return normalized.endsWith(".search.msn.com");
  return false;
}

export async function refreshVerificationRanges(
  fetcher: typeof fetch = fetch,
  now = Date.now(),
): Promise<VerificationRanges> {
  const entries = await Promise.all(
    Object.entries(RANGE_ENDPOINTS).map(async ([token, endpoint]) => {
      const response = await fetcher(endpoint);
      if (!response.ok) throw new Error(`Falha ao atualizar faixas de ${token}`);
      const payload = (await response.json()) as {
        prefixes?: Array<{ ipv4Prefix?: string; ipv6Prefix?: string }>;
      };
      const ranges = (payload.prefixes ?? []).flatMap((prefix) =>
        [prefix.ipv4Prefix, prefix.ipv6Prefix].filter(
          (value): value is string => Boolean(value),
        ),
      );
      return [token, ranges] as const;
    }),
  );
  const value = Object.fromEntries(entries);
  rangesCache = { value, refreshedAt: now };
  return value;
}

export async function getCachedVerificationRanges(
  fetcher: typeof fetch = fetch,
  now = Date.now(),
): Promise<VerificationRanges> {
  if (rangesCache && now - rangesCache.refreshedAt < CACHE_TTL_MS) {
    return rangesCache.value;
  }
  return refreshVerificationRanges(fetcher, now);
}

export async function verifyCrawlerIdentity(
  token: string,
  address: string,
  options: {
    ranges?: VerificationRanges;
    reverseLookup?: (address: string) => Promise<string[]>;
  } = {},
): Promise<VerificationResult> {
  const verification_method = getVerificationMethod(token);
  if (verification_method === "unavailable") {
    return { verified: null, verification_method };
  }
  if (verification_method === "rdns") {
    const hostnames = options.reverseLookup
      ? await options.reverseLookup(address)
      : [];
    return {
      verified: hostnames.some((hostname) => suffixAllowed(token, hostname)),
      verification_method,
    };
  }

  const ranges = options.ranges ?? (await getCachedVerificationRanges());
  return {
    verified: (ranges[token] ?? []).some((cidr) =>
      isAddressInCidr(address, cidr),
    ),
    verification_method,
  };
}

function reverseIpv4(address: string): string | null {
  const parts = address.split(".");
  return parts.length === 4 ? `${parts.reverse().join(".")}.in-addr.arpa` : null;
}

export async function googleDnsReverseLookup(
  address: string,
  fetcher: typeof fetch = fetch,
): Promise<string[]> {
  const name = reverseIpv4(address);
  if (!name) return [];
  const response = await fetcher(
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=PTR`,
  );
  if (!response.ok) return [];
  const payload = (await response.json()) as {
    Answer?: Array<{ data?: string }>;
  };
  return (payload.Answer ?? [])
    .map(({ data }) => data)
    .filter((value): value is string => Boolean(value));
}
