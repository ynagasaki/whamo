import {
  fetchClosedOptionsValueBySymbol,
  fetchClosedOptionsValueByYear,
  fetchOptionsTransactionsValueByMonth,
} from '@/app/lib/data';

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const grouping = params.get('grp') ?? 'year';
  let result;

  switch (grouping) {
    case 'symbol': {
      result = await fetchClosedOptionsValueBySymbol();
      break;
    }
    case 'txn-mo': {
      result = await fetchOptionsTransactionsValueByMonth();
      break;
    }
    default: {
      result = await fetchClosedOptionsValueByYear();
      break;
    }
  }

  return Response.json({ result });
}
