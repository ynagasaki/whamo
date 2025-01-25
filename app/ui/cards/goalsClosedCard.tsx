import useSWR from 'swr';
import { fetcher } from '@/app/lib/util';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { Taggy } from '../taggy';

export function GoalsClosedCard() {
  const { data, error } = useSWR(`/api/goals/closed`, fetcher);

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

  const result = data.goals as { goal_category: number; tally: number }[];
  const totalClosed = result.reduce((prev, curr) => prev + curr.tally, 0);

  return (
    <div className="rounded-md bg-white p-3">
      <div className="text-center">
        <span className="block text-xl sm:text-2xl">{totalClosed}</span>
        <span className="block text-sm text-gray-400">Goals Completed</span>
      </div>
      <div className="text-sm">
        <>
          {result
            .filter((entry) => entry.goal_category !== -1)
            .slice(0, 2)
            .map((entry) => {
              return (
                <div
                  key={`goal-closed-ct-summary-${entry.goal_category}`}
                  className="mt-2 border-t pt-2"
                >
                  <div className="inline-block w-1/3">
                    <Taggy tagId={entry.goal_category} forceFullSize />
                  </div>
                  <div className="inline-block w-2/3 text-right">
                    {entry.tally}
                  </div>
                </div>
              );
            })}
        </>
      </div>
    </div>
  );
}
