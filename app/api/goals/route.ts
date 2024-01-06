import { fetchGoals } from '@/app/lib/data';

export async function GET(): Promise<Response> {
  const result = await fetchGoals();
  return Response.json({ goals: result });
}
