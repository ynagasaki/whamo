import { fetchOpenOptions, fetchStockInfo } from '@/app/lib/data';

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const dataType = params.get('dtype');
  const include = params.getAll('inc');

  if (dataType !== 'stock') {
    return Response.json({ stocks: [] });
  }

  const stockData = await fetchStockInfo();

  if (include?.includes('option')) {
    const options = await fetchOpenOptions();
    return Response.json({ options, stocks: stockData });
  }

  return Response.json({ stocks: stockData });
}
