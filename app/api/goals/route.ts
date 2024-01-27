import { fetchClosedGoals, fetchOpenGoals } from '@/app/lib/data';
import { Goal } from '@/app/lib/model';
import { assertNumber } from '@/app/lib/util';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  let result: Goal[];

  if (status === 'c') {
    result = await getClosed(searchParams);
  } else {
    result = await fetchOpenGoals();
  }

  return Response.json({ goals: result });
}

async function getClosed(searchParams: URLSearchParams): Promise<Goal[]> {
  const lastPd = searchParams.get('lastPd') ?? '30';
  assertNumber(lastPd);

  let cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number.parseInt(lastPd));

  return fetchClosedGoals(cutoff);
}
