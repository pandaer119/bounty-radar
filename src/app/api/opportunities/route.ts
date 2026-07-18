import { NextResponse } from "next/server";
import { OPPORTUNITIES_VERIFIED_AT, opportunities } from "@/data/opportunities";
import { rankOpportunities } from "@/lib/scoring";
import type { OpportunitiesResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  const now = new Date();
  const verifiedAt = new Date(`${OPPORTUNITIES_VERIFIED_AT}T00:00:00Z`);
  const ageInDays = Math.floor((now.getTime() - verifiedAt.getTime()) / 86_400_000);
  const data = rankOpportunities(opportunities, now);
  const response: OpportunitiesResponse = {
    data,
    meta: {
      generatedAt: now.toISOString(),
      verifiedAt: OPPORTUNITIES_VERIFIED_AT,
      count: data.length,
      sourceMode: "official-verified-seed",
      stale: ageInDays > 7,
    },
  };

  return NextResponse.json(response, {
    headers: {
      "cache-control": "no-store",
      "x-data-source": "official-verified-seed",
    },
  });
}
