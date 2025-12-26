import {
  fetchClosedOptions,
  fetchOpenOptions,
  fetchStockInfo,
} from '@/app/lib/data';

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const status = params.get('status');
  const include = params.getAll('inc');

  if (status === 'closed') {
    return Response.json({ options: await fetchClosedOptions() });
  }

  const result = await fetchOpenOptions();

  if (include.includes('stock_info')) {
    const stockInfo = await fetchStockInfo();
    return Response.json({ options: result, stockInfo });
  }

  return Response.json({ options: result });
}
