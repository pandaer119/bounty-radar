import { NextResponse } from "next/server";
import { isAddress } from "viem";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKeyConfigured = (process.env.KEEPERHUB_API_KEY ?? "").trim().startsWith("kh_");
  const registryConfigured = isAddress(process.env.OPPORTUNITY_REGISTRY_ADDRESS ?? "");
  const configured = apiKeyConfigured && registryConfigured;
  const simulationEnabled = process.env.KEEPERHUB_SIMULATION_ENABLED === "true";
  const ready = configured && simulationEnabled;

  return NextResponse.json(
    {
      status: ready
        ? "ready_for_simulation"
        : configured
          ? "human_approval_required"
          : "configuration_required",
      configured,
      apiKeyConfigured,
      registryConfigured,
      simulationEnabled,
      simulationOnly: true,
      broadcastEnabled: false,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
