import type { Address } from "viem";

const KEEPERHUB_EXECUTE_URL = "https://app.keeperhub.com/api/execute/contract-call";
const SENSITIVE_FIELD_PATTERN = /(api[-_]?key|authorization|bearer|token|secret|credential|private[-_]?key)/i;

export const KEEPERHUB_SEPOLIA = {
  network: "sepolia",
  chainId: 11155111,
} as const;

export type KeeperHubSimulationInput = {
  contractAddress: Address;
  functionName: string;
  functionArgs: readonly unknown[];
  abi: readonly unknown[];
};

export type KeeperHubSimulationResult = {
  provider: "keeperhub";
  mode: "simulate";
  broadcast: false;
  chainId: 11155111;
  requestId?: string;
  data: unknown;
};

export type KeeperHubErrorCode =
  | "KEEPERHUB_CONFIGURATION_ERROR"
  | "KEEPERHUB_UNAUTHORIZED"
  | "KEEPERHUB_FORBIDDEN"
  | "KEEPERHUB_CONFLICT"
  | "KEEPERHUB_RATE_LIMITED"
  | "KEEPERHUB_REQUEST_REJECTED"
  | "KEEPERHUB_UPSTREAM_ERROR"
  | "KEEPERHUB_TIMEOUT"
  | "KEEPERHUB_NETWORK_ERROR"
  | "KEEPERHUB_INVALID_RESPONSE";

export class KeeperHubError extends Error {
  readonly code: KeeperHubErrorCode;
  readonly status: number;
  readonly retryable: boolean;
  readonly requestId?: string;

  constructor(options: {
    code: KeeperHubErrorCode;
    message: string;
    status: number;
    retryable: boolean;
    requestId?: string;
  }) {
    super(options.message);
    this.name = "KeeperHubError";
    this.code = options.code;
    this.status = options.status;
    this.retryable = options.retryable;
    this.requestId = options.requestId;
  }

  toResponseBody() {
    return {
      code: this.code,
      message: this.message,
      retryable: this.retryable,
      ...(this.requestId ? { requestId: this.requestId } : {}),
    };
  }
}

type KeeperHubClientOptions = {
  apiKey: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
};

function configurationError(message: string): KeeperHubError {
  return new KeeperHubError({
    code: "KEEPERHUB_CONFIGURATION_ERROR",
    message,
    status: 503,
    retryable: false,
  });
}

function normalizeHttpError(status: number, requestId?: string): KeeperHubError {
  const shared = { status, requestId };

  switch (status) {
    case 401:
      return new KeeperHubError({
        ...shared,
        code: "KEEPERHUB_UNAUTHORIZED",
        message: "KeeperHub 凭据无效或已过期。",
        retryable: false,
      });
    case 403:
      return new KeeperHubError({
        ...shared,
        code: "KEEPERHUB_FORBIDDEN",
        message: "KeeperHub 拒绝了当前模拟请求。",
        retryable: false,
      });
    case 409:
      return new KeeperHubError({
        ...shared,
        code: "KEEPERHUB_CONFLICT",
        message: "KeeperHub 当前状态与模拟请求冲突。",
        retryable: false,
      });
    case 429:
      return new KeeperHubError({
        ...shared,
        code: "KEEPERHUB_RATE_LIMITED",
        message: "KeeperHub 请求过于频繁，请稍后重试。",
        retryable: true,
      });
    default:
      if (status >= 500) {
        return new KeeperHubError({
          ...shared,
          code: "KEEPERHUB_UPSTREAM_ERROR",
          message: "KeeperHub 服务暂时不可用。",
          retryable: true,
        });
      }

      return new KeeperHubError({
        ...shared,
        code: "KEEPERHUB_REQUEST_REJECTED",
        message: "KeeperHub 未接受当前模拟请求。",
        retryable: false,
      });
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}

function sanitizePayload(value: unknown, depth = 0): unknown {
  if (depth > 8) return "[truncated]";
  if (typeof value === "string") {
    return value
      .replace(/Bearer\s+[^\s,;]+/gi, "Bearer [redacted]")
      .replace(/\bkh_[A-Za-z0-9_-]+\b/g, "[redacted]");
  }
  if (Array.isArray(value)) return value.map((item) => sanitizePayload(item, depth + 1));
  if (!value || typeof value !== "object") return value;

  const safe: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    safe[key] = SENSITIVE_FIELD_PATTERN.test(key) ? "[redacted]" : sanitizePayload(item, depth + 1);
  }
  return safe;
}

async function parseSafeJson(response: Response): Promise<unknown> {
  try {
    return sanitizePayload(await response.json());
  } catch {
    throw new KeeperHubError({
      code: "KEEPERHUB_INVALID_RESPONSE",
      message: "KeeperHub 返回了无法解析的模拟结果。",
      status: 502,
      retryable: true,
      requestId: response.headers.get("x-request-id") ?? undefined,
    });
  }
}

function assertSimulationPayload(value: unknown, requestId?: string): void {
  const payload = value && typeof value === "object" ? value as Record<string, unknown> : null;
  if (!payload || payload.status !== "simulated" || "transactionHash" in payload) {
    throw new KeeperHubError({
      code: "KEEPERHUB_INVALID_RESPONSE",
      message: "KeeperHub 未返回符合安全约束的模拟结果。",
      status: 502,
      retryable: false,
      requestId,
    });
  }
}

function delay(milliseconds: number): Promise<void> {
  if (milliseconds <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function createKeeperHubClient(options: KeeperHubClientOptions) {
  const apiKey = options.apiKey.trim();
  if (!apiKey || !apiKey.startsWith("kh_")) {
    throw configurationError("KeeperHub 服务端凭据尚未正确配置。");
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = Math.max(1, options.timeoutMs ?? 8_000);
  const maxRetries = Math.max(0, Math.min(options.maxRetries ?? 2, 3));
  const retryDelayMs = Math.max(0, options.retryDelayMs ?? 250);

  return {
    async simulateContractCall(input: KeeperHubSimulationInput): Promise<KeeperHubSimulationResult> {
      let lastError: KeeperHubError | undefined;

      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await fetchImpl(KEEPERHUB_EXECUTE_URL, {
            method: "POST",
            headers: {
              accept: "application/json",
              authorization: `Bearer ${apiKey}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              contractAddress: input.contractAddress,
              network: KEEPERHUB_SEPOLIA.network,
              functionName: input.functionName,
              functionArgs: JSON.stringify(input.functionArgs),
              abi: JSON.stringify(input.abi),
              simulate: true,
            }),
            signal: controller.signal,
          });

          const requestId = response.headers.get("x-request-id") ?? undefined;
          if (!response.ok) {
            lastError = normalizeHttpError(response.status, requestId);
            if (lastError.retryable && attempt < maxRetries) {
              await delay(retryDelayMs * 2 ** attempt);
              continue;
            }
            throw lastError;
          }

          const data = await parseSafeJson(response);
          assertSimulationPayload(data, requestId);
          return {
            provider: "keeperhub",
            mode: "simulate",
            broadcast: false,
            chainId: KEEPERHUB_SEPOLIA.chainId,
            ...(requestId ? { requestId } : {}),
            data,
          };
        } catch (error) {
          if (error instanceof KeeperHubError) throw error;

          lastError = isAbortError(error)
            ? new KeeperHubError({
                code: "KEEPERHUB_TIMEOUT",
                message: "KeeperHub 模拟请求超时。",
                status: 504,
                retryable: true,
              })
            : new KeeperHubError({
                code: "KEEPERHUB_NETWORK_ERROR",
                message: "无法连接 KeeperHub 模拟服务。",
                status: 502,
                retryable: true,
              });

          if (attempt < maxRetries) {
            await delay(retryDelayMs * 2 ** attempt);
            continue;
          }
          throw lastError;
        } finally {
          clearTimeout(timeout);
        }
      }

      throw lastError ?? new KeeperHubError({
        code: "KEEPERHUB_NETWORK_ERROR",
        message: "无法连接 KeeperHub 模拟服务。",
        status: 502,
        retryable: true,
      });
    },
  };
}

export function createKeeperHubClientFromEnvironment(options: Omit<KeeperHubClientOptions, "apiKey"> = {}) {
  return createKeeperHubClient({
    ...options,
    apiKey: process.env.KEEPERHUB_API_KEY ?? "",
  });
}
