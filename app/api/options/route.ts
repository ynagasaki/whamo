import { fetchOpenOptions } from '@/app/lib/data';

export async function GET(request: Request): Promise<Response> {
  // force SSR
  console.log(`Forcing SSR: ${new URL(request.url).searchParams}`);

  const result = await fetchOpenOptions();
  return Response.json({ options: result });
}
