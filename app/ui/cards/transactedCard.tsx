import useSWR from 'swr';
import { fetcher, fmtMoney } from '@/app/lib/util';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { AggValue } from '@/app/lib/model';
import dayjs, { Dayjs } from 'dayjs';

function fillInMissingMonths(
  result: AggValue[],
  start: Dayjs,
  end: Dayjs,
): AggValue[] {
  const computedResults: AggValue[] = [];
  const categoryToValue = new Map<string, AggValue>();
  result.map((row) => categoryToValue.set(row.category, row));

  for (
    var currDate: Dayjs = end.startOf('month');
    currDate.isSame(start) || currDate.isAfter(start);
    currDate = currDate.add(-1, 'months')
  ) {
    const existingEntry = categoryToValue.get(currDate.format('YYYY-MM'));
    computedResults.push({
      category: currDate.format('MMM'),
      value: existingEntry?.value ?? 0,
      value_gain: existingEntry?.value_gain ?? 0,
      value_loss: existingEntry?.value_loss ?? 0,
    });
  }

  return computedResults;
}

export function TransactedCard() {
  const start = dayjs(new Date())
    .startOf('month')
    .add(-2, 'month')
    .startOf('month');
  const end = dayjs(new Date()).endOf('month');
  const { data, error } = useSWR(
    `/api/options/value?grp=txn-mo&start=${start.format(
      'YYYY-MM-DD',
    )}&end=${end.format('YYYY-MM-DD')}`,
    fetcher,
  );

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

  const txnSums = fillInMissingMonths(data.result as AggValue[], start, end);
  const currTxnSum = txnSums[0];

  return (
    <div className="rounded-md bg-white p-3">
      <div className="text-center">
        <span className="block text-xl sm:text-2xl">
          {fmtMoney(currTxnSum.value)}
        </span>
        <span className="block text-sm text-gray-400">
          Transacted this month
        </span>
      </div>
      <div className="text-sm">
        <>
          {txnSums.slice(0, 3).map((txn) => {
            return (
              <div
                key={`txn-sum-${txn.category}`}
                className="mt-2 border-t pt-2"
              >
                <div className="inline-block w-1/3">{txn.category}</div>
                <div className="inline-block w-2/3 text-right">
                  {fmtMoney(txn.value)}
                </div>
              </div>
            );
          })}
        </>
      </div>
    </div>
  );
}
