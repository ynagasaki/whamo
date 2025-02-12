import useSWR from 'swr';
import { fetcher, fmtMoney } from '@/app/lib/util';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';

export function EarnRateCard() {
  const { data, error } = useSWR(`/api/options/range`, fetcher);

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

  return (
    <div className="rounded-md bg-white p-3">
      <div className="text-center">
        <span className="block text-xl sm:text-2xl">
          ${fmtMoney(data.runRate)}
        </span>
        <span className="block text-sm text-gray-400">
          Projected this month
        </span>
      </div>
    </div>
  );
}
