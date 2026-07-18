import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { inspectKeeperHubEnvironment } from "../../scripts/keeperhub-preflight.mjs";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PREFLIGHT_SCRIPT = resolve(PROJECT_ROOT, "scripts/keeperhub-preflight.mjs");
const HANDOFF_SCRIPT = resolve(PROJECT_ROOT, "scripts/export-keeperhub-handoff.mjs");
const TEST_API_KEY = "kh_super_secret_test_value";
const TEST_ADDRESS = "0x1111111111111111111111111111111111111111";

function run(script, args = [], overrides = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      KEEPERHUB_API_KEY: "",
      OPPORTUNITY_REGISTRY_ADDRESS: "",
      ...overrides,
    },
  });
}

test("offline preflight fails safely when required environment is missing", () => {
  const result = run(PREFLIGHT_SCRIPT);

  assert.equal(result.status, 1);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.ok, false);
  assert.deepEqual(payload.missing, ["KEEPERHUB_API_KEY", "OPPORTUNITY_REGISTRY_ADDRESS"]);
  assert.equal(payload.checks.chain.chainId, 11155111);
  assert.equal(payload.safety.networkAccess, false);
});

test("environment inspection validates prefix and address without returning values", () => {
  const inspected = inspectKeeperHubEnvironment({
    KEEPERHUB_API_KEY: TEST_API_KEY,
    OPPORTUNITY_REGISTRY_ADDRESS: TEST_ADDRESS,
  });
  const serialized = JSON.stringify(inspected);

  assert.equal(inspected.ok, true);
  assert.equal(inspected.checks.environment.KEEPERHUB_API_KEY.prefixValid, true);
  assert.equal(inspected.checks.environment.OPPORTUNITY_REGISTRY_ADDRESS.formatValid, true);
  assert.equal(serialized.includes(TEST_API_KEY), false);
  assert.equal(serialized.includes(TEST_ADDRESS), false);
});

test("invalid KeeperHub prefix is reported by field name only", () => {
  const invalidKey = "not_a_keeperhub_key";
  const result = run(PREFLIGHT_SCRIPT, [], {
    KEEPERHUB_API_KEY: invalidKey,
    OPPORTUNITY_REGISTRY_ADDRESS: TEST_ADDRESS,
  });
  const combined = `${result.stdout}${result.stderr}`;

  assert.equal(result.status, 1);
  assert.match(combined, /KEEPERHUB_API_KEY_PREFIX/);
  assert.equal(combined.includes(invalidKey), false);
});

test("handoff reuses project proof logic and emits a simulated record call", () => {
  const result = run(
    HANDOFF_SCRIPT,
    [
      "--opportunity-id",
      "keeperhub-agents-onchain-2026",
      "--generated-at",
      "2026-07-18T12:00:00.000Z",
    ],
    {
      KEEPERHUB_API_KEY: TEST_API_KEY,
      OPPORTUNITY_REGISTRY_ADDRESS: TEST_ADDRESS,
    },
  );
  const combined = `${result.stdout}${result.stderr}`;

  assert.equal(result.status, 0, combined);
  assert.equal(combined.includes(TEST_API_KEY), false);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.ok, true);
  assert.equal(payload.contractCall.chainId, 11155111);
  assert.equal(payload.contractCall.functionName, "record");
  assert.equal(payload.contractCall.simulate, true);
  assert.equal(payload.contractCall.args.length, 3);
  assert.deepEqual(payload.contractCall.args, [
    payload.proof.opportunityKey,
    payload.proof.sourceHash,
    payload.proof.score,
  ]);
  assert.match(payload.contractCall.args[0], /^0x[0-9a-f]{64}$/);
  assert.match(payload.contractCall.args[1], /^0x[0-9a-f]{64}$/);
  assert.equal(Number.isInteger(payload.contractCall.args[2]), true);
  assert.equal(payload.safety.networkAccess, false);
  assert.equal(payload.safety.transactionCreated, false);
});

test("handoff never leaks a present API key when another requirement is missing", () => {
  const result = run(
    HANDOFF_SCRIPT,
    ["--opportunity-id", "keeperhub-agents-onchain-2026"],
    { KEEPERHUB_API_KEY: TEST_API_KEY },
  );
  const combined = `${result.stdout}${result.stderr}`;

  assert.equal(result.status, 1);
  assert.equal(combined.includes(TEST_API_KEY), false);
  assert.match(combined, /PREFLIGHT_FAILED/);
  assert.match(combined, /OPPORTUNITY_REGISTRY_ADDRESS/);
});

test("risk-gated opportunities cannot produce a handoff", () => {
  const result = run(
    HANDOFF_SCRIPT,
    [
      "--opportunity-id",
      "weex-ai-wars-2-2026",
      "--generated-at",
      "2026-07-18T12:00:00.000Z",
    ],
    {
      KEEPERHUB_API_KEY: TEST_API_KEY,
      OPPORTUNITY_REGISTRY_ADDRESS: TEST_ADDRESS,
    },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /RISK_GATE_BLOCKED/);
  assert.equal(result.stderr.includes(TEST_API_KEY), false);
});
