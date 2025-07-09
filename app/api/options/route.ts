import { fetchClosedOptions, fetchOpenOptions } from '@/app/lib/data';

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const status = params.get('status');

  if (status === 'closed') {
    return Response.json({ options: await fetchClosedOptions() });
  }

  const result = await fetchOpenOptions();
  return Response.json({ options: result });
}
