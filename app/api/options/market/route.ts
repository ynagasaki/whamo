import { fetchOpenOptions, fetchStockInfo } from '@/app/lib/data';

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const dataType = params.get('dtype');

  if (dataType !== 'stock') {
    return Response.json({ stocks: [] });
  }

  const stockData = await fetchStockInfo();

  return Response.json({ stocks: stockData });
}
