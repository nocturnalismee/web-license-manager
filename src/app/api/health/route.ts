import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    data: { service: "indolicense", status: "ok" },
    error: null,
    request_id: crypto.randomUUID(),
  });
}
