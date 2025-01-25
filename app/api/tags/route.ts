import { fetchCompletedGoalsValueByCategory } from '@/app/lib/data';

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const view = params.get('view') ?? 'top';

  if (view !== 'top') {
    return Response.json({ tags: [] });
  }

  const result = await fetchCompletedGoalsValueByCategory();
  return Response.json({ tags: result });
}
