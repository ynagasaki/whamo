import { fetchOpenGoals } from '@/app/lib/data';

export async function GET(): Promise<Response> {
  const result = await fetchOpenGoals();
  return Response.json({ goals: result });
}
