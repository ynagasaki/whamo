import { fetchOpenOptions } from '@/app/lib/data';

export async function GET(): Promise<Response> {
  const result = await fetchOpenOptions();
  return Response.json({ options: result });
}
