import { NextResponse } from "next/server";
import type { Address } from "viem";
import { opportunities } from "@/data/opportunities";
import { createBountyProofPreview } from "@/lib/bounty-proof";
import {
  createKeeperHubClientFromEnvironment,
  KeeperHubError,
} from "@/lib/keeperhub/client";
import { createKeeperHubDraft } from "@/lib/keeperhub/draft";
import { rankOpportunity } from "@/lib/scoring";

const opportunityRegistryRecordAbi = [
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
] as const;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { opportunityId?: unknown };
  try {
    body = (await request.json()) as { opportunityId?: unknown };
  } catch {
    return NextResponse.json({ code: "INVALID_JSON", message: "请求体必须是 JSON。" }, { status: 400 });
  }

  if (typeof body.opportunityId !== "string") {
    return NextResponse.json({ code: "INVALID_OPPORTUNITY_ID", message: "缺少有效的机会 ID。" }, { status: 422 });
  }

  const opportunity = opportunities.find((item) => item.id === body.opportunityId);
  if (!opportunity) {
    return NextResponse.json({ code: "OPPORTUNITY_NOT_FOUND", message: "机会不存在。" }, { status: 404 });
  }

  const ranked = rankOpportunity(opportunity);
  if (ranked.priority === "avoid") {
    return NextResponse.json(
      { code: "RISK_GATE_BLOCKED", message: "该机会已被资金或合规风险门禁阻断。" },
      { status: 422 },
    );
  }

  if (process.env.KEEPERHUB_SIMULATION_ENABLED !== "true") {
    return NextResponse.json(
      {
        code: "KEEPERHUB_SIMULATION_APPROVAL_REQUIRED",
        message: "KeeperHub 安全模拟尚未由人工开启。",
        retryable: false,
      },
      { status: 403, headers: { "cache-control": "no-store" } },
    );
  }

  const proof = createBountyProofPreview(ranked);
  const keeperHubDraft = createKeeperHubDraft(proof);
  if (!keeperHubDraft.contractAddress) {
    return NextResponse.json(
      {
        code: "KEEPERHUB_CONFIGURATION_ERROR",
        message: "Sepolia OpportunityRegistry 尚未配置，无法执行模拟。",
        retryable: false,
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const client = createKeeperHubClientFromEnvironment();
    const simulation = await client.simulateContractCall({
      contractAddress: keeperHubDraft.contractAddress as Address,
      functionName: "record",
      functionArgs: [proof.opportunityKey, proof.sourceHash, proof.score],
      abi: opportunityRegistryRecordAbi,
    });

    return NextResponse.json(
      {
        proof,
        keeperHubDraft,
        simulation,
        humanApprovalRequired: true,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof KeeperHubError) {
      return NextResponse.json(error.toResponseBody(), {
        status: error.status,
        headers: { "cache-control": "no-store" },
      });
    }

    return NextResponse.json(
      {
        code: "KEEPERHUB_INTERNAL_ERROR",
        message: "KeeperHub 模拟服务发生内部错误。",
        retryable: false,
      },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
