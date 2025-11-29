import { fetchOptionTransactionVolumeByMonth } from '@/app/lib/data';
import { AggTransactionCounts } from '@/app/lib/model';
import dayjs, { Dayjs } from 'dayjs';

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const grouping = params.get('grp') ?? 'sale-mo';
  const defaultEndDate = dayjs(new Date()).endOf('month');
  const defaultStartDate = defaultEndDate.add(-2, 'month').startOf('month');
  const endDateStr = params.get('end') ?? defaultEndDate.format('YYYY-MM-DD');
  const startDateStr =
    params.get('start') ?? defaultStartDate.format('YYYY-MM-DD');
  const endDate = dayjs(endDateStr);
  const startDate = dayjs(startDateStr);

  if (grouping === 'sale-mo') {
    return Response.json({
      result: await calculateSalesByMonth(startDate, endDate),
    });
  }

  throw new Error(`Unsupported grouping option ${grouping}.`);
}

async function calculateSalesByMonth(
  startDate: Dayjs,
  endDate: Dayjs,
): Promise<AggTransactionCounts> {
  const result = await fetchOptionTransactionVolumeByMonth({
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
  });
  const salesByMonth: AggTransactionCounts = {};

  result.forEach((entry) => {
    let currMonthSales = salesByMonth[entry.category];
    if (!currMonthSales) {
      currMonthSales = {};
    }
    let currSymbolCount = currMonthSales[entry.symbol] ?? 0;
    currMonthSales[entry.symbol] = currSymbolCount + entry.count;
    salesByMonth[entry.category] = currMonthSales;
  });

  return salesByMonth;
}
