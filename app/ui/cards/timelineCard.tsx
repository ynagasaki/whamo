import { fetcher, fmtMoney } from '@/app/lib/util';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import useSWR from 'swr';
import { TimelineChart, TimelineData } from '../timelineChart';
import dayjs from 'dayjs';
import { AggValue } from '@/app/lib/model';

export function TimelineCard() {
  const to = dayjs(new Date()).startOf('month');
  const from = to.add(-12, 'months').toDate();
  const { data, error } = useSWR(`/api/options/value?grp=txn-mo`, fetcher);
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

  for (
    let currDate = dayjs(from);
    dayjs(to).diff(currDate) >= 0;
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

  return (
    <div className="rounded-md bg-white p-3">
      <div className="text-center">
        <span className="block text-xl sm:text-2xl">
          {fmtMoney(result.reduce((prev, curr) => prev + curr.value, 0)) ??
            'N/A'}
        </span>
        <span className="block text-sm text-gray-400">TTM Transacted</span>
      </div>
      <div>
        <TimelineChart period="month" data={timelineData} />
      </div>
    </div>
  );
}
