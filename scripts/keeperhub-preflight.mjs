#!/usr/bin/env node

import { pathToFileURL } from "node:url";

export const SEPOLIA_CHAIN_ID = 11155111;
export const MINIMUM_NODE_VERSION = Object.freeze({ major: 20, minor: 9, patch: 0 });
export const REQUIRED_ENVIRONMENT = Object.freeze([
  "KEEPERHUB_API_KEY",
  "OPPORTUNITY_REGISTRY_ADDRESS",
]);

const ETHEREUM_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!match) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function isSupportedNodeVersion(version) {
  const parsed = parseVersion(version);
  if (!parsed) return false;

  const current = [parsed.major, parsed.minor, parsed.patch];
  const minimum = [
    MINIMUM_NODE_VERSION.major,
    MINIMUM_NODE_VERSION.minor,
    MINIMUM_NODE_VERSION.patch,
  ];

  for (let index = 0; index < current.length; index += 1) {
    if (current[index] > minimum[index]) return true;
    if (current[index] < minimum[index]) return false;
  }

  return true;
}

function hasValue(value) {
  return typeof value === "string" && value.length > 0;
}

export function inspectKeeperHubEnvironment(
  environment = process.env,
  nodeVersion = process.versions.node,
) {
  const apiKeyPresent = hasValue(environment.KEEPERHUB_API_KEY);
  const registryAddressPresent = hasValue(environment.OPPORTUNITY_REGISTRY_ADDRESS);
  const registryAddressFormatValid =
    registryAddressPresent &&
    ETHEREUM_ADDRESS_PATTERN.test(environment.OPPORTUNITY_REGISTRY_ADDRESS) &&
    environment.OPPORTUNITY_REGISTRY_ADDRESS.toLowerCase() !== ZERO_ADDRESS;
  const apiKeyPrefixValid =
    apiKeyPresent && environment.KEEPERHUB_API_KEY.startsWith("kh_");
  const nodeVersionValid = isSupportedNodeVersion(nodeVersion);

  const missing = [];
  if (!apiKeyPresent) missing.push("KEEPERHUB_API_KEY");
  if (!registryAddressPresent) missing.push("OPPORTUNITY_REGISTRY_ADDRESS");

  const invalid = [];
  if (apiKeyPresent && !apiKeyPrefixValid) invalid.push("KEEPERHUB_API_KEY_PREFIX");
  if (registryAddressPresent && !registryAddressFormatValid) {
    invalid.push("OPPORTUNITY_REGISTRY_ADDRESS_FORMAT");
  }
  if (!nodeVersionValid) invalid.push("NODE_VERSION");

  return {
    ok: missing.length === 0 && invalid.length === 0,
    mode: "offline-preflight",
    checks: {
      node: {
        version: nodeVersion,
        minimum: `${MINIMUM_NODE_VERSION.major}.${MINIMUM_NODE_VERSION.minor}.${MINIMUM_NODE_VERSION.patch}`,
        valid: nodeVersionValid,
      },
      chain: {
        network: "sepolia",
        chainId: SEPOLIA_CHAIN_ID,
        fixed: true,
        valid: true,
      },
      environment: {
        KEEPERHUB_API_KEY: {
          present: apiKeyPresent,
          prefixValid: apiKeyPrefixValid,
          valueRedacted: true,
        },
        OPPORTUNITY_REGISTRY_ADDRESS: {
          present: registryAddressPresent,
          formatValid: registryAddressFormatValid,
          valueRedacted: true,
        },
      },
    },
    missing,
    invalid,
    safety: {
      networkAccess: false,
      secretValuesIncluded: false,
      transactionCreated: false,
    },
  };
}

function printHelp() {
  process.stdout.write(`KeeperHub offline preflight\n\nUsage:\n  node scripts/keeperhub-preflight.mjs\n\nRequired environment (values are never printed):\n  KEEPERHUB_API_KEY              must start with kh_\n  OPPORTUNITY_REGISTRY_ADDRESS   non-zero 20-byte Ethereum address\n\nThe target chain is fixed to Sepolia (${SEPOLIA_CHAIN_ID}). No network call is made.\n`);
}

export function runPreflightCli({ argv = process.argv.slice(2), environment = process.env } = {}) {
  if (argv.includes("--help") || argv.includes("-h")) {
    printHelp();
    return 0;
  }

  const unsupported = argv.filter((argument) => argument !== "--json");
  if (unsupported.length > 0) {
    process.stderr.write(
      `${JSON.stringify({ ok: false, code: "UNSUPPORTED_ARGUMENT", safety: { secretValuesIncluded: false } }, null, 2)}\n`,
    );
    return 2;
  }

  const result = inspectKeeperHubEnvironment(environment);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result.ok ? 0 : 1;
}

const isMainModule =
  typeof process.argv[1] === "string" && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  process.exitCode = runPreflightCli();
}
