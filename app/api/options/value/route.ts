import {
  fetchClosedOptionsValue,
  fetchClosedOptionsValueBySymbol,
  fetchClosedOptionsValueByYear,
  fetchOptionsTransactionsValueByMonth,
} from '@/app/lib/data';
import { AggValue } from '@/app/lib/model';
import dayjs from 'dayjs';

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  // TODO: pass start/end dates as params
  const grouping = params.get('grp') ?? 'year';
  let result: AggValue[];

  switch (grouping) {
    case 'symbol': {
      result = await fetchClosedOptionsValueBySymbol();
      break;
    }
    case 'txn-mo': {
      result = await fetchOptionsTransactionsValueByMonth({
        startDate: dayjs(new Date())
          .startOf('month')
          .add(-2, 'month')
          .startOf('month')
          .toDate(),
        endDate: dayjs(new Date()).endOf('month').toDate(),
      });
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
