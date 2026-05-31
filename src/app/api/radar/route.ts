import { getRadarApiSnapshot } from "@/lib/radar-data";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(getRadarApiSnapshot());
}
