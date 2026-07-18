#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { inspectKeeperHubEnvironment, SEPOLIA_CHAIN_ID } from "./keeperhub-preflight.mjs";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIRECTORY, "..");
const RECORD_SIGNATURE_PATTERN =
  /function\s+record\s*\(\s*bytes32\s+opportunityKey\s*,\s*bytes32\s+sourceHash\s*,\s*uint8\s+score\s*\)/m;

const RECORD_ABI = Object.freeze([
  {
    type: "function",
    name: "record",
    stateMutability: "nonpayable",
    inputs: [
      { name: "opportunityKey", type: "bytes32" },
      { name: "sourceHash", type: "bytes32" },
      { name: "score", type: "uint8" },
    ],
    outputs: [{ name: "proofId", type: "bytes32" }],
  },
]);

function parseArguments(argv) {
  const parsed = { opportunityId: null, generatedAt: null };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--opportunity-id") {
      parsed.opportunityId = argv[index + 1] ?? null;
      index += 1;
      continue;
    }
    if (argument === "--generated-at") {
      parsed.generatedAt = argv[index + 1] ?? null;
      index += 1;
      continue;
    }
    if (argument === "--json") continue;
    if (argument === "--help" || argument === "-h") return { help: true };
    return { error: "UNSUPPORTED_ARGUMENT" };
  }

  if (!parsed.opportunityId) return { error: "MISSING_OPPORTUNITY_ID" };
  if (parsed.generatedAt && Number.isNaN(Date.parse(parsed.generatedAt))) {
    return { error: "INVALID_GENERATED_AT" };
  }

  return parsed;
}

function printHelp() {
  process.stdout.write(`Export a simulated KeeperHub contract-call handoff\n\nUsage:\n  node scripts/export-keeperhub-handoff.mjs --opportunity-id <id> [--generated-at <ISO-8601>]\n\nThis command is offline. It never signs, submits, or simulates against a live RPC.\n`);
}

async function importTranspiledModule(relativePath) {
  const source = await readFile(resolve(PROJECT_ROOT, relativePath), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: true,
    },
    fileName: relativePath,
    reportDiagnostics: false,
  }).outputText;
  const encoded = Buffer.from(transpiled, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

async function loadProjectProof(opportunityId, generatedAt) {
  const [opportunityModule, scoringModule, proofModule] = await Promise.all([
    importTranspiledModule("src/data/opportunities.ts"),
    importTranspiledModule("src/lib/scoring.ts"),
    importTranspiledModule("src/lib/bounty-proof.ts"),
  ]);

  const opportunity = opportunityModule.opportunities.find((item) => item.id === opportunityId);
  if (!opportunity) throw new Error("OPPORTUNITY_NOT_FOUND");

  const now = new Date(generatedAt);
  const ranked = scoringModule.rankOpportunity(opportunity, now);
  if (ranked.priority === "avoid") throw new Error("RISK_GATE_BLOCKED");

  return proofModule.createBountyProofPreview(ranked, generatedAt);
}

async function assertContractSignature() {
  const contractSource = await readFile(resolve(PROJECT_ROOT, "contracts/OpportunityRegistry.sol"), "utf8");
  if (!RECORD_SIGNATURE_PATTERN.test(contractSource)) throw new Error("CONTRACT_SIGNATURE_MISMATCH");
}

export async function createKeeperHubHandoff({
  opportunityId,
  generatedAt = new Date().toISOString(),
  environment = process.env,
} = {}) {
  const preflight = inspectKeeperHubEnvironment(environment);
  if (!preflight.ok) {
    return {
      ok: false,
      code: "PREFLIGHT_FAILED",
      preflight,
      safety: {
        networkAccess: false,
        secretValuesIncluded: false,
        transactionCreated: false,
      },
    };
  }

  await assertContractSignature();
  const proof = await loadProjectProof(opportunityId, generatedAt);

  return {
    ok: true,
    schemaVersion: "keeperhub-contract-call-handoff.v1",
    generatedAt,
    opportunityId,
    proof,
    contractCall: {
      network: "sepolia",
      chainId: SEPOLIA_CHAIN_ID,
      contractAddress: environment.OPPORTUNITY_REGISTRY_ADDRESS,
      abiSource: "contracts/OpportunityRegistry.sol#record",
      abi: RECORD_ABI,
      functionName: "record",
      args: [proof.opportunityKey, proof.sourceHash, proof.score],
      value: "0",
      simulate: true,
    },
    keeperHub: {
      apiKeyAvailable: true,
      apiKeyValueRedacted: true,
      executionRequested: false,
    },
    safety: {
      networkAccess: false,
      secretValuesIncluded: false,
      transactionCreated: false,
      signatureRequested: false,
      humanApprovalRequiredBeforeExecution: true,
    },
  };
}

function safeErrorCode(error) {
  const allowed = new Set([
    "OPPORTUNITY_NOT_FOUND",
    "RISK_GATE_BLOCKED",
    "CONTRACT_SIGNATURE_MISMATCH",
  ]);
  return error instanceof Error && allowed.has(error.message)
    ? error.message
    : "HANDOFF_GENERATION_FAILED";
}

export async function runHandoffCli({ argv = process.argv.slice(2), environment = process.env } = {}) {
  const parsed = parseArguments(argv);
  if (parsed.help) {
    printHelp();
    return 0;
  }
  if (parsed.error) {
    process.stderr.write(
      `${JSON.stringify({ ok: false, code: parsed.error, safety: { secretValuesIncluded: false } }, null, 2)}\n`,
    );
    return 2;
  }

  try {
    const result = await createKeeperHubHandoff({
      opportunityId: parsed.opportunityId,
      generatedAt: parsed.generatedAt ?? new Date().toISOString(),
      environment,
    });
    const output = `${JSON.stringify(result, null, 2)}\n`;
    (result.ok ? process.stdout : process.stderr).write(output);
    return result.ok ? 0 : 1;
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify({ ok: false, code: safeErrorCode(error), safety: { secretValuesIncluded: false } }, null, 2)}\n`,
    );
    return 1;
  }
}

const isMainModule =
  typeof process.argv[1] === "string" && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  process.exitCode = await runHandoffCli();
}
