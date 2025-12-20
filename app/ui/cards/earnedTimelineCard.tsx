import useSWR from 'swr';
import dayjs from 'dayjs';
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
import { TableData, TimelineTable } from '../widgets/timelineTable';

export function EarnedTimelineCard() {
  const now = dayjs(new Date());
  const [end, setEnd] = useState(now.endOf('month'));
  const start = end.add(-11, 'months').startOf('month');
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

  const result: AggValue[] = !data ? [] : (data.result as AggValue[]);
  const timelineData: TimelineData[] = [];
  var i = 0;
  var cumValue = data?.startingTotal ?? 0;

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

  const tableData: TableData[] = [];
  const txnSums: AggValue[] = [];
  const maxTableEntries = 4;
  for (
    i = timelineData.length - 1;
    i >= Math.max(0, timelineData.length - maxTableEntries);
    i--
  ) {
    const currEntry = timelineData[i];
    txnSums.push({
      category: currEntry.dt.format('MMM YYYY'),
      value: currEntry.value * 100,
    });
    tableData.push({
      dt: currEntry.dt,
      value: currEntry.value,
    });
  }

  const hasOlderData = !!data?.hasOlder;

  return (
    <div className="rounded-md bg-white p-3">
      <div className="flex flex-wrap">
        <div className="hidden md:block md:w-1/4 md:pr-2">
          <TimelineTable
            id="earn"
            action="Running total"
            data={tableData}
            dataType="money"
            loading={!data}
          />
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
                {!!data && fmtMoney(txnSums[0].value)}
                {!data && (
                  <span className="inline-block w-32 bg-gray-200">&nbsp;</span>
                )}
              </span>
              <span className="block text-sm text-gray-400">
                Running total thru {end.format("MMM 'YY")}
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
            <TimelineTable
              id="earn_sm"
              action="Running total"
              data={tableData.slice(0, 3)}
              dataType="money"
              loading={!data}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
