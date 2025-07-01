import useSWR from 'swr';
import { fetcher, fmtMoney } from '@/app/lib/util';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';

export function EarnRateCard() {
  const { data, error } = useSWR(`/api/options/range?lookb=1&looka=1`, fetcher);

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

  const runRates = data.runRate as Record<string, number>;
  const runRatesArr = Object.entries(runRates);
  const [currMonth, currRunRate] = runRatesArr[1];

  return (
    <div className="rounded-md bg-white p-3">
      <div className="text-center">
        <span className="block text-xl sm:text-2xl">
          {fmtMoney(currRunRate)}
        </span>
        <span className="block text-sm text-gray-400">
          Projected this month
        </span>
      </div>
      <div className="text-sm">
        <>
          {runRatesArr.slice(0, 3).map(([month, rate]) => {
            return (
              <div key={`earn-rate-${month}`} className="mt-2 border-t pt-2">
                <div className="inline-block w-1/3">{month}</div>
                <div className="inline-block w-2/3 text-right">
                  {fmtMoney(rate)}
                </div>
              </div>
            );
          })}
        </>
      </div>
    </div>
  );
}
