import { fetcher, getColorIterator } from '@/app/lib/util';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/16/solid';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { TimelineChart, TimelineDataset } from '../timelineChart';
import { AggTransactionCounts } from '@/app/lib/model';
import { useState } from 'react';
import clsx from 'clsx';
import { TableData, TimelineTable } from '../widgets/timelineTable';

export function SaleVolumeTimelineCard() {
  const now = dayjs(new Date());
  const [end, setEnd] = useState(now.endOf('month'));
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
      <div className="flex flex-wrap rounded-md bg-white p-3 text-center text-gray-300">
        <div className="hidden md:block md:w-1/4 md:pr-2">
          <TimelineTable
            id="txn_load"
            action="Transacted"
            data={[]}
            loading={true}
            dataType="money"
          />
        </div>
        <div className="w-full md:w-3/4 md:pl-2"></div>
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

  const hasOlder = data.hasOlder;

  return (
    <div className="rounded-md bg-white p-3">
      <div className="flex flex-wrap">
        <div className="hidden md:block md:w-1/4 md:pr-2">
          <TimelineTable
            id="sold"
            action="Sold"
            data={tableData.slice(0, 4)}
            dataType="count"
          />
        </div>
        <div className="w-full md:w-3/4 md:pl-2">
          <div className="flex flex-wrap">
            <div className="w-1/5">
              <button
                className={clsx(
                  'rounded-full border border-gray-200 text-gray-600 hover:border-gray-600',
                  {
                    hidden: !hasOlder,
                  },
                )}
                onClick={() => setEnd(end.add(-12, 'months'))}
              >
                <ChevronLeftIcon className="h-8 w-8 md:h-9 md:w-9" />
              </button>
            </div>
            <div className="w-3/5 text-center">
              <span className="block text-xl sm:text-2xl">
                {tableData.reduce((prev, curr) => prev + curr.value, 0)}
              </span>
              <span className="block text-sm text-gray-400">
                TTM Options Sold
              </span>
            </div>
            <div className="w-1/5 text-right">
              <button
                className={clsx(
                  'rounded-full border border-gray-200 text-gray-600 hover:border-gray-600',
                  {
                    hidden: end.add(1, 'month').diff(now) > 0,
                  },
                )}
                onClick={() => setEnd(end.add(12, 'months'))}
              >
                <ChevronRightIcon className="h-8 w-8 md:h-9 md:w-9" />
              </button>
            </div>
          </div>
          <div>
            <TimelineChart period="month" datasets={timelineDatasets} />
          </div>
          <div className="md:hidden">
            <TimelineTable
              id="sold_sm"
              action="Sold"
              data={tableData.slice(0, 3)}
              dataType="money"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
