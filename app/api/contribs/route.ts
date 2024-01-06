import { fetchContributions, makeContribution } from '@/app/lib/data';
import { assertNumber } from '@/app/lib/util';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const goalId = searchParams.get('goal');

  assertNumber(goalId);

  const contributions = await fetchContributions(Number.parseInt(goalId));
  return Response.json({ contributions });
}

export async function POST(request: Request): Promise<Response> {
  const { goalId, optionId, amt } = await request.json();

  assertNumber(goalId);
  assertNumber(optionId);
  // TODO: ideally, we would not pass this :P
  assertNumber(amt);

  const result = await makeContribution({
    goalId: Number.parseInt(goalId),
    optionId: Number.parseInt(optionId),
    amt: Number.parseInt(amt) / 100,
  });

  return Response.json({ leftover: result.leftover });
}
