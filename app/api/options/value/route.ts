import {
  fetchClosedOptionsValue,
  fetchClosedOptionsValueBySymbol,
  fetchClosedOptionsValueByYear,
  fetchOptionsTransactionsValueByMonth,
} from '@/app/lib/data';
import dayjs from 'dayjs';

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
    case 'mo': {
      result = await fetchClosedOptionsValue(
        dayjs(new Date()).add(-12, 'months').toDate(),
        new Date(),
      );
      break;
    }
    default: {
      result = await fetchClosedOptionsValueByYear();
      break;
    }
  }

  return Response.json({ result });
}
