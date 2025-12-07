import { fetcher, fmtMoney, getColorIterator } from '@/app/lib/util';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/16/solid';
import useSWR from 'swr';
import dayjs from 'dayjs';
import {
  TimelineChart,
  TimelineDataset,
  TimelineEntry,
} from '../timelineChart';
import { AggValue } from '@/app/lib/model';
import { useState } from 'react';
import clsx from 'clsx';

interface TimelineData {
  dt: dayjs.Dayjs;
  value: number;
  value_loss?: number;
  value_gain?: number;
}

export function TransactedTimelineCard() {
  const now = dayjs(new Date());
  const [end, setEnd] = useState(now.endOf('month'));
  const start = end.add(-12, 'months').startOf('month');
  const { data, error } = useSWR(
    `/api/options/value?grp=txn-mo&start=${start.format(
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
      <div className="min-h-[202px] rounded-md bg-white p-3 text-center text-gray-300">
        Loading...
      </div>
    );
  }

  // TODO: clean this up
  const result = data.result as AggValue[];
  const timelineData: TimelineData[] = [];
  var i = 0;

  for (
    let currDate = start;
    end.diff(currDate) >= 0;
    currDate = currDate.add(1, period)
  ) {
    const currResult = result.at(i);

    if (!currResult) {
      timelineData.push({ dt: currDate, value: 0 });
      continue;
    }

    const resultDate = dayjs(`${currResult.category}-01`);
    const diff = currDate.diff(resultDate);

    if (diff == 0) {
      // values are in cents, but timeline chart doesn't care about
      // that so we have to convert to dollars here.
      timelineData.push({
        dt: resultDate,
        value: currResult.value / 100,
        value_gain: currResult.value_gain
          ? currResult.value_gain / 100
          : undefined,
        value_loss: currResult.value_loss
          ? currResult.value_loss / 100
          : undefined,
      });
      i++;
    } else if (diff > 0) {
      i++;
    } else {
      timelineData.push({ dt: currDate, value: 0 });
    }
  }

  const txnSums: AggValue[] = [];
  const maxTableEntries = 4;
  for (
    i = timelineData.length - 1;
    i >= Math.max(0, timelineData.length - maxTableEntries);
    i--
  ) {
    const currEntry = timelineData[i];
    txnSums.push({
      category: currEntry.dt.format('MMM'),
      value: currEntry.value,
      value_gain: currEntry.value_gain,
      value_loss: currEntry.value_loss,
    });
  }

  const chartDatasets = convertToChartDatasets(timelineData);
  const hasOlder = data.hasOlder;

  return (
    <div className="rounded-md bg-white p-3">
      <div className="flex flex-wrap">
        <div className="hidden md:block md:w-1/4 md:pr-2">
          <TimelineTable txnSums={txnSums} />
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
                {fmtMoney(
                  result.reduce((prev, curr) => prev + curr.value, 0),
                ) ?? 'N/A'}
              </span>
              <span className="block text-sm text-gray-400">
                TTM Transacted
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
            <TimelineChart period="month" datasets={chartDatasets} />
          </div>
          <div className="md:hidden">
            <TimelineTable txnSums={txnSums.slice(0, 3)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineTable({ txnSums }: { txnSums: AggValue[] }) {
  return (
    <div className="b-0 m-0 p-0">
      <div className="hidden text-center md:block">
        <span className="block text-xl sm:text-2xl">
          {fmtMoney(txnSums[0].value * 100)}
        </span>
        <span className="block text-sm text-gray-400">
          Transacted this month
        </span>
      </div>
      <div className="flex flex-wrap text-xs md:text-sm">
        <>
          {txnSums.map((txn) => {
            return (
              <div
                key={`txn-sum-${txn.category}`}
                className="mt-1 w-full border-t pt-1 md:mt-2 md:pt-2"
              >
                <div className="inline-block w-1/3">{txn.category}</div>
                <div className="inline-block w-2/3 text-right">
                  {fmtMoney(txn.value * 100)}
                </div>
              </div>
            );
          })}
        </>
      </div>
    </div>
  );
}

function convertToChartDatasets(data: TimelineData[]): TimelineDataset[] {
  const dataSorted = data.toSorted((a, b) => a.dt.diff(b.dt));
  const chartDataPos: TimelineEntry[] = [];
  const chartDataNeg: TimelineEntry[] = [];
  const colorIterator = getColorIterator();

  dataSorted.forEach((entry) => {
    if (entry.value_gain != undefined && entry.value_loss != undefined) {
      chartDataPos.push({ dt: entry.dt, value: entry.value_gain });
      chartDataNeg.push({ dt: entry.dt, value: entry.value_loss });
    } else {
      chartDataPos.push({
        dt: entry.dt,
        value: entry.value > 0 ? entry.value : 0,
      });
      chartDataNeg.push({
        dt: entry.dt,
        value: entry.value < 0 ? entry.value : 0,
      });
    }
  });

  return [
    {
      name: 'gain',
      color: colorIterator.nextColor(),
      entries: chartDataPos,
    },
    {
      name: 'loss',
      color: colorIterator.nextBadColor(),
      entries: chartDataNeg,
    },
  ];
}
