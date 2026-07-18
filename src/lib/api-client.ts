import type { AppError } from "./types";

type ApiClientOptions = {
  baseUrl?: string;
  timeoutMs?: number;
};

class ApiClient {
  constructor(private readonly options: ApiClientOptions = {}) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), this.options.timeoutMs ?? 12_000);

    try {
      const baseUrl = this.options.baseUrl ?? window.location.origin;
      const response = await fetch(new URL(path, baseUrl), {
        ...init,
        signal: init.signal ?? controller.signal,
        headers: {
          accept: "application/json",
          ...init.headers,
        },
      });

      if (!response.ok) throw await this.toError(response);
      return (await response.json()) as T;
    } catch (error) {
      throw this.normalizeError(error);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  private async toError(response: Response): Promise<AppError> {
    const requestId = response.headers.get("x-request-id") ?? undefined;
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = undefined;
    }

    return {
      code: `HTTP_${response.status}`,
      message: response.statusText || "请求失败",
      status: response.status,
      retryable: response.status === 429 || response.status >= 500,
      requestId,
      details,
    };
  }

  private normalizeError(error: unknown): AppError {
    if (typeof error === "object" && error && "code" in error) return error as AppError;
    if (error instanceof DOMException && error.name === "AbortError") {
      return { code: "REQUEST_TIMEOUT", message: "同步超时，请重试", retryable: true };
    }
    return { code: "UNKNOWN_ERROR", message: "机会数据暂时不可用", retryable: true, details: error };
  }
}

export const apiClient = new ApiClient();
