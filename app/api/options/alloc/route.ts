import { fetchAllocatableOptions, setOptionAssignment } from '@/app/lib/data';
import { assertNumber } from '@/app/lib/util';

export async function GET(request: Request): Promise<Response> {
  // force SSR
  console.log(`Forcing SSR: ${new URL(request.url).searchParams}`);

  const result = await fetchAllocatableOptions();
  return Response.json({ options: result });
}

export async function POST(request: Request): Promise<Response> {
  const { id, assigned } = await request.json();

  assertNumber(id);

  if (assigned === undefined || assigned === null) {
    throw new Error("'assigned' cannot be undefined.");
  }

  await setOptionAssignment(Number.parseInt(id), assigned === 'true');
  return Response.json({});
}
