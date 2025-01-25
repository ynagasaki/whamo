import useSWR from 'swr';
import { fetcher, fmtMoney } from '@/app/lib/util';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { Taggy } from '../taggy';

export function TopTagsCard() {
  const { data, error } = useSWR(`/api/tags?view=top`, fetcher);

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

  const result = data.tags as { goal_category: number; value: number }[];
  const resultsWithTags = result.filter((entry) => entry.goal_category !== -1);

  if (resultsWithTags.length === 0) {
    return <div className="hidden">No results</div>;
  }

  return (
    <div className="rounded-md bg-white p-3">
      <div className="text-center">
        <Taggy tagId={resultsWithTags[0].goal_category} displayMode="hero" />
        <span className="block text-sm text-gray-400">Top Earned Label</span>
      </div>
      <div className="text-sm">
        <>
          {resultsWithTags.slice(0, 3).map((entry) => {
            return (
              <div
                key={`tag-value-summary-${entry.goal_category}`}
                className="mt-2 border-t pt-2"
              >
                <div className="inline-block w-1/3">
                  <Taggy tagId={entry.goal_category} displayMode="full" />
                </div>
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
