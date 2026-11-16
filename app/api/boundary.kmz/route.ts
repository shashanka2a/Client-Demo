import { getActiveKmzResponse } from "@/lib/kmz-serve";

export async function GET() {
  return getActiveKmzResponse();
}
