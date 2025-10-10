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
  const grouping = params.get('grp') ?? 'year';
  const defaultEndDate = dayjs(new Date()).endOf('month');
  const defaultStartDate = defaultEndDate.add(-2, 'month').startOf('month');
  const endDateStr = params.get('end') ?? defaultEndDate.format('YYYY-MM-DD');
  const startDateStr =
    params.get('start') ?? defaultStartDate.format('YYYY-MM-DD');
  const endDate = dayjs(endDateStr);
  const startDate = dayjs(startDateStr);
  let result: AggValue[];

  if (!endDate.isValid()) {
    throw new Error('Invalid end date; format must be YYYY-MM-DD');
  }
  if (!startDate.isValid()) {
    throw new Error('Invalid start date; format must be YYYY-MM-DD');
  }

  switch (grouping) {
    case 'symbol': {
      result = await fetchClosedOptionsValueBySymbol();
      break;
    }
    case 'txn-mo': {
      result = await fetchOptionsTransactionsValueByMonth({
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
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
