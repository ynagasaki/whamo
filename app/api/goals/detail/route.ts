import { assertNumber } from '@/app/lib/util';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const goalId = searchParams.get('id');

  assertNumber(goalId);

  return Response.json({});
}
