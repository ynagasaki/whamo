import useSWR from 'swr';
import { fetcher } from '@/app/lib/util';

export function GoalsClosedCard() {
  const { data, error } = useSWR(`/api/goals/closed`, fetcher);

  if (error) {
    return <div>Failed to load</div>;
  }
  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md bg-white p-3 text-center">
      <span className="block text-3xl">{data.result}</span>
      <span className="block text-sm text-gray-400">Goals Completed</span>
    </div>
  );
}
