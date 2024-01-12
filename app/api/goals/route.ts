import { fetchOpenGoals } from '@/app/lib/data';

export async function GET(request: Request): Promise<Response> {
  // force SSR
  console.log(`Forcing SSR: ${new URL(request.url).searchParams}`);

  const result = await fetchOpenGoals();
  return Response.json({ goals: result });
}
