import { NextResponse } from "next/server";
import { opportunities } from "@/data/opportunities";
import { createBountyProofPreview } from "@/lib/bounty-proof";
import { createKeeperHubDraft } from "@/lib/keeperhub/draft";
import { rankOpportunity } from "@/lib/scoring";
import type { ProofPreviewResponse } from "@/lib/proof-types";

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

  const proof = createBountyProofPreview(ranked);
  const response: ProofPreviewResponse = {
    proof,
    keeperHubDraft: createKeeperHubDraft(proof),
  };

  return NextResponse.json(response, { headers: { "cache-control": "no-store" } });
}
