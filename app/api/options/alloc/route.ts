import { fetchAllocatableOptions } from '@/app/lib/data';

export async function GET(): Promise<Response> {
  const result = await fetchAllocatableOptions();
  return Response.json({ options: result });
}
