import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, service: "bounty-radar", timestamp: new Date().toISOString() });
}
