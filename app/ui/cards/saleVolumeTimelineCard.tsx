import { fetcher, fmtMoney, getColorIterator } from '@/app/lib/util';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import useSWR from 'swr';
import dayjs, { Dayjs } from 'dayjs';
import { TimelineChart, TimelineDataset } from '../timelineChart';
import { AggTransactionCounts } from '@/app/lib/model';

interface TableData {
  dt: Dayjs;
  value: number;
}

export function SaleVolumeTimelineCard() {
  const end = dayjs(new Date()).endOf('month');
  const start = end.add(-12, 'months').startOf('month');
  const { data, error } = useSWR(
    `/api/options/stats?grp=sale-mo&start=${start.format(
      'YYYY-MM-DD',
    )}&end=${end.format('YYYY-MM-DD')}`,
    fetcher,
  );
  const period: 'month' = 'month';

  if (error) {
    return (
      <div className="rounded-md bg-white p-3 text-center text-gray-300">
        <ExclamationCircleIcon className="inline-block h-5 w-5" /> Failed to
        load
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-md bg-white p-3 text-center text-gray-300">
        Loading...
      </div>
    );
  }

  const result = data.result as AggTransactionCounts;
  const timelineDatasets: TimelineDataset[] = [];
  const tableData: TableData[] = [];
  const allSymbols = new Set<string>();
  const colorIterator = getColorIterator();

  Object.values(result)
    .flatMap((value) => Object.entries(value).map((entry) => entry[0]))
    .forEach((symbol) => allSymbols.add(symbol));

  allSymbols.forEach((symbol) => {
    timelineDatasets.push({
      name: symbol,
      color: colorIterator.nextColor(),
      entries: [],
    });
  });

  for (
    let currDate = start;
    end.diff(currDate) >= 0;
    currDate = currDate.add(1, period)
  ) {
    const currCountsBySymbol: { [key: string]: number } =
      result[currDate.format('YYYY-MM')] ?? {};
    let totalCount = 0;
    timelineDatasets.forEach((dataset) => {
      const count = currCountsBySymbol[dataset.name] ?? 0;
      dataset.entries.push({ dt: currDate, value: count });
      totalCount += count;
    });
    tableData.unshift({ dt: currDate, value: totalCount });
  }

  return (
    <div className="rounded-md bg-white p-3">
      <div className="flex flex-wrap">
        <div className="hidden md:block md:w-1/4 md:pr-2">
          <TimelineTable data={tableData.slice(0, 4)} />
        </div>
        <div className="w-full md:w-3/4 md:pl-2">
          <div className="text-center">
            <span className="block text-xl sm:text-2xl">
              {tableData.reduce((prev, curr) => prev + curr.value, 0)}
            </span>
            <span className="block text-sm text-gray-400">
              TTM Options Sold
            </span>
          </div>
          <div>
            <TimelineChart period="month" datasets={timelineDatasets} />
          </div>
          <div className="md:hidden">
            <TimelineTable data={tableData.slice(0, 3)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineTable({ data }: { data: TableData[] }) {
  return (
    <div className="b-0 m-0 p-0">
      <div className="hidden text-center md:block">
        <span className="block text-xl sm:text-2xl">
          {data[0].value === 0 ? 'None' : data[0].value}
        </span>
        <span className="block text-sm text-gray-400">Sold this month</span>
      </div>
      <div className="flex flex-wrap text-xs md:text-sm">
        <>
          {data.map((entry) => {
            return (
              <div
                key={`txn-sum-${entry.dt.format('MMM')}`}
                className="mt-1 w-full border-t pt-1 md:mt-2 md:pt-2"
              >
                <div className="inline-block w-1/3">
                  {entry.dt.format('MMM')}
                </div>
                <div className="inline-block w-2/3 text-right">
                  {entry.value === 0 ? 'None' : entry.value}
                </div>
              </div>
            );
          })}
        </>
      </div>
    </div>
  );
}
