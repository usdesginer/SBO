import dns from "node:dns";
import http from "node:http";
import https from "node:https";

let dnsConfigured = false;
function ensureIpv4First() {
  if (!dnsConfigured) {
    dnsConfigured = true;
    try {
      dns.setDefaultResultOrder("ipv4first");
    } catch {
      // Ignore on runtimes without ipv4first support
    }
  }
}

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30_000,
  maxSockets: 6,
  family: 4,
});

const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30_000,
  maxSockets: 6,
  family: 4,
});

const REQUEST_TIMEOUT_MS = 25_000;
const RETRY_DELAYS_MS = [250, 750];

function isRetryableNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  const code =
    (err as { code?: string; cause?: { code?: string } }).code ||
    (err as { cause?: { code?: string } }).cause?.code ||
    "";
  return (
    msg.includes("fetch failed") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout") ||
    msg.includes("socket hang up") ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "ECONNABORTED" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_SOCKET"
  );
}

function normalizeHeaders(raw?: HeadersInit): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  if (raw instanceof Headers) {
    raw.forEach((v, k) => {
      out[k] = v;
    });
  } else if (Array.isArray(raw)) {
    for (const [k, v] of raw) {
      out[k] = v;
    }
  } else {
    for (const [k, v] of Object.entries(raw)) {
      if (v !== undefined) out[k] = String(v);
    }
  }
  return out;
}

function serializeBody(body: BodyInit | null | undefined): Buffer | string | null | "UNSUPPORTED" {
  if (body == null) return null;
  if (typeof body === "string") return body;
  if (body instanceof URLSearchParams) return body.toString();
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof ArrayBuffer) return Buffer.from(body);
  if (ArrayBuffer.isView(body)) {
    return Buffer.from(body.buffer, body.byteOffset, body.byteLength);
  }
  return "UNSUPPORTED";
}

function nodeRequest(
  urlStr: string,
  method: string,
  headers: Record<string, string>,
  body: Buffer | string | null,
  signal?: AbortSignal | null
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const isHttps = parsed.protocol === "https:";
    const transport = isHttps ? https : http;
    const agent = isHttps ? httpsAgent : httpAgent;

    const reqHeaders = { ...headers };
    if (body !== null && !Object.keys(reqHeaders).some((k) => k.toLowerCase() === "content-length")) {
      reqHeaders["content-length"] = String(Buffer.byteLength(body));
    }

    const req = transport.request(
      parsed,
      {
        method,
        headers: reqHeaders,
        agent,
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const status = res.statusCode ?? 500;
          const resHeaders = new Headers();
          for (const [key, val] of Object.entries(res.headers)) {
            if (val === undefined) continue;
            if (Array.isArray(val)) {
              for (const item of val) resHeaders.append(key, item);
            } else {
              resHeaders.set(key, val);
            }
          }
          const rawBuf = Buffer.concat(chunks);
          const nullBodyStatus = status === 204 || status === 205 || status === 304;
          resolve(
            new Response(nullBodyStatus ? null : rawBuf, {
              status,
              statusText: res.statusMessage || "",
              headers: resHeaders,
            })
          );
        });
      }
    );

    const onAbort = () => {
      req.destroy(new DOMException("Aborted", "AbortError"));
    };
    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }

    req.on("timeout", () => {
      const err = new Error("ETIMEDOUT") as Error & { code: string };
      err.code = "ETIMEDOUT";
      req.destroy(err);
    });

    req.on("error", (err) => {
      if (signal) signal.removeEventListener("abort", onAbort);
      reject(err);
    });

    req.on("close", () => {
      if (signal) signal.removeEventListener("abort", onAbort);
    });

    if (body !== null) req.write(body);
    req.end();
  });
}

/**
 * Node-side fetch wrapper using a persistent IPv4 keep-alive HTTPS agent
 * with a 25s connect/socket timeout and automatic retries for idempotent reads.
 */
export async function resilientFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  ensureIpv4First();

  const urlStr =
    typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url;
  const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  const headers = normalizeHeaders(
    init?.headers || (input instanceof Request ? input.headers : undefined)
  );
  const body = serializeBody(init?.body);
  const signal = init?.signal || (input instanceof Request ? input.signal : undefined);

  if (body === "UNSUPPORTED") {
    return fetch(input, init);
  }

  const canRetry = method === "GET" || method === "HEAD";
  const maxAttempts = canRetry ? RETRY_DELAYS_MS.length + 1 : 1;

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await nodeRequest(urlStr, method, headers, body, signal);
    } catch (err) {
      lastError = err;
      if (signal?.aborted) throw err;
      if (attempt < maxAttempts - 1 && isRetryableNetworkError(err)) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}
