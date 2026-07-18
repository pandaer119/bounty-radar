import { describe, expect, it, vi } from "vitest";
import { createKeeperHubClient, KeeperHubError } from "./client";

const validInput = {
  contractAddress: "0x1111111111111111111111111111111111111111" as const,
  functionName: "record",
  functionArgs: ["0xproof", "0xsource", 88],
  abi: [{ type: "function", name: "record" }],
};

describe("KeeperHub simulate-only client", () => {
  it("always forces simulate:true and never exposes a broadcast method", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ success: true, status: "simulated", gasEstimate: "42000" }),
    );
    const client = createKeeperHubClient({ apiKey: "kh_test_only", fetchImpl });

    await client.simulateContractCall({ ...validInput, simulate: false } as typeof validInput);

    const [, init] = fetchImpl.mock.calls[0];
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body.simulate).toBe(true);
    expect(body.network).toBe("sepolia");
    expect(JSON.parse(String(body.functionArgs))).toEqual(validInput.functionArgs);
    expect(JSON.parse(String(body.abi))).toEqual(validInput.abi);
    expect(init?.headers).toMatchObject({ authorization: "Bearer kh_test_only" });
    expect("executeContractCall" in client).toBe(false);
    expect("broadcast" in client).toBe(false);
  });

  it.each([
    [401, "KEEPERHUB_UNAUTHORIZED", false],
    [403, "KEEPERHUB_FORBIDDEN", false],
    [409, "KEEPERHUB_CONFLICT", false],
  ])("normalizes %i without retrying or leaking upstream text", async (status, code, retryable) => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(
        { message: "Bearer kh_leaked_should_never_escape", apiKey: "kh_secret" },
        { status },
      ),
    );
    const client = createKeeperHubClient({ apiKey: "kh_test_only", fetchImpl, maxRetries: 3 });

    await expect(client.simulateContractCall(validInput)).rejects.toMatchObject({ code, retryable });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    try {
      await client.simulateContractCall(validInput);
    } catch (error) {
      const serialized = JSON.stringify((error as KeeperHubError).toResponseBody());
      expect(serialized).not.toContain("kh_test_only");
      expect(serialized).not.toContain("kh_leaked");
      expect(serialized).not.toContain("kh_secret");
    }
  });

  it("retries a 429 response and returns a simulation-only result", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ message: "slow down" }, { status: 429 }))
      .mockResolvedValueOnce(
        Response.json(
          { success: true, status: "simulated", estimatedGas: "50000", token: "must-not-leak", note: "Bearer kh_hidden_value" },
          { headers: { "x-request-id": "req-safe-1" } },
        ),
      );
    const client = createKeeperHubClient({
      apiKey: "kh_test_only",
      fetchImpl,
      maxRetries: 1,
      retryDelayMs: 0,
    });

    const result = await client.simulateContractCall(validInput);

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      provider: "keeperhub",
      mode: "simulate",
      broadcast: false,
      chainId: 11155111,
      requestId: "req-safe-1",
      data: { success: true, status: "simulated", estimatedGas: "50000", token: "[redacted]", note: "Bearer [redacted]" },
    });
  });

  it("rejects any response that is not explicitly simulation-only", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ status: "completed", transactionHash: "0xunexpected" }),
    );
    const client = createKeeperHubClient({ apiKey: "kh_test_only", fetchImpl, maxRetries: 0 });

    await expect(client.simulateContractCall(validInput)).rejects.toMatchObject({
      code: "KEEPERHUB_INVALID_RESPONSE",
      retryable: false,
    });
  });

  it("normalizes a final 5xx after bounded retries", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ secret: "upstream-secret" }, { status: 503 }),
    );
    const client = createKeeperHubClient({
      apiKey: "kh_test_only",
      fetchImpl,
      maxRetries: 2,
      retryDelayMs: 0,
    });

    await expect(client.simulateContractCall(validInput)).rejects.toMatchObject({
      code: "KEEPERHUB_UPSTREAM_ERROR",
      status: 503,
      retryable: true,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("aborts timed-out requests and returns a sanitized timeout", async () => {
    const fetchImpl = vi.fn<typeof fetch>((_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Bearer kh_timeout_secret", "AbortError"));
        });
      }),
    );
    const client = createKeeperHubClient({
      apiKey: "kh_test_only",
      fetchImpl,
      timeoutMs: 5,
      maxRetries: 0,
    });

    await expect(client.simulateContractCall(validInput)).rejects.toMatchObject({
      code: "KEEPERHUB_TIMEOUT",
      status: 504,
      retryable: true,
      message: "KeeperHub 模拟请求超时。",
    });
  });

  it("rejects missing or malformed server credentials before any request", () => {
    expect(() => createKeeperHubClient({ apiKey: "" })).toThrowError(KeeperHubError);
    expect(() => createKeeperHubClient({ apiKey: "not-a-keeperhub-key" })).toThrow(
      "KeeperHub 服务端凭据尚未正确配置。",
    );
  });
});
