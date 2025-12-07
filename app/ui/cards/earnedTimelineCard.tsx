import useSWR from 'swr';
import dayjs, { Dayjs } from 'dayjs';
import { fetcher, fmtMoney } from '@/app/lib/util';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/16/solid';
import { AggValue } from '@/app/lib/model';
import { TimelineLineChart, TimelineData } from '../timelineLineChart';
import { useState } from 'react';
import clsx from 'clsx';

export function EarnedTimelineCard() {
  const now = dayjs(new Date());
  const [end, setEnd] = useState(now.endOf('month'));
  const start = end.add(-12, 'months').startOf('month');
  const { data, error } = useSWR(
    `/api/options/value?grp=mo&start=${start.format(
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

  const result = data.result as AggValue[];
  const timelineData: TimelineData[] = [];
  var i = 0;
  var cumValue = data.startingTotal;

  for (
    let currDate = start;
    end.diff(currDate) >= 0;
    currDate = currDate.add(1, period)
  ) {
    const currResult = result.at(i);

    if (!currResult) {
      timelineData.push({ dt: currDate, value: cumValue / 100 });
      continue;
    }

    const resultDate = dayjs(`${currResult.category}-01`);
    const diff = currDate.diff(resultDate);

    if (diff == 0) {
      cumValue += currResult.value;
      // values are in cents, but timeline chart doesn't care about
      // that so we have to convert to dollars here.
      timelineData.push({
        dt: resultDate,
        value: cumValue / 100,
      });
      i++;
    } else if (diff > 0) {
      i++;
    } else {
      timelineData.push({ dt: currDate, value: cumValue / 100 });
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
      value: currEntry.value * 100,
    });
  }

  const hasOlderData = !!data.hasOlder;

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
                    hidden: !hasOlderData,
                  },
                )}
                onClick={() => setEnd(end.add(-12, 'months'))}
              >
                <ChevronLeftIcon className="h-8 w-8 md:h-9 md:w-9" />
              </button>
            </div>
            <div className="w-3/5 text-center">
              <span className="block text-xl sm:text-2xl">
                {fmtMoney(txnSums[0].value)}
              </span>
              <span className="block text-sm text-gray-400">
                Cumulative Earned
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
            <TimelineLineChart period="month" data={timelineData} />
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
          {fmtMoney(txnSums[0].value)}
        </span>
        <span className="block text-sm text-gray-400">Cumulative Earned</span>
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
                  {fmtMoney(txn.value)}
                  {/* {txn.value_gain !== undefined && txn.value_loss !== undefined && <span>
                    &nbsp;{fmtMoney(txn.value_gain)} / {fmtMoney(txn.value_loss)}
                  </span>} */}
                </div>
              </div>
            );
          })}
        </>
      </div>
    </div>
  );
}
