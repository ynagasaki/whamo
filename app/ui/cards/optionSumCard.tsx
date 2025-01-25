import useSWR from 'swr';
import { fetcher, fmtMoney } from '@/app/lib/util';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';

export function OptionSumCard() {
  const { data, error } = useSWR(`/api/options/value`, fetcher);

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

  const result = data.result as { category: string; value: number }[];
  const total = result.reduce((prev, curr) => prev + curr.value, 0);

  return (
    <div className="rounded-md bg-white p-3">
      <div className="text-center">
        <span className="block text-xl sm:text-2xl">${fmtMoney(total)}</span>
        <span className="block text-sm text-gray-400">Total Earned</span>
      </div>
      <div className="text-sm">
        <>
          {result.slice(0, 3).map((entry) => {
            return (
              <div
                key={`opt-val-summary-${entry.category}`}
                className="mt-2 border-t pt-2"
              >
                <div className="inline-block w-1/3">{entry.category}</div>
                <div className="inline-block w-2/3 text-right">
                  ${fmtMoney(entry.value)}
                </div>
              </div>
            );
          })}
        </>
      </div>
    </div>
  );
}
