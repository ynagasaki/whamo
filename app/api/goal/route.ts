import { fetchContributions } from '../../lib/data';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const goalId = searchParams.get('goal');

  if (!goalId || Number.isNaN(goalId)) {
    throw new Error(`goalId is NaN`);
  }

  const contribs = await fetchContributions(Number.parseInt(goalId));

  return Response.json({ contributions: contribs });
}
