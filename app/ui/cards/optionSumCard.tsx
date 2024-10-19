import useSWR from 'swr';
import { fetcher, fmtMoney } from '@/app/lib/util';

export function OptionSumCard() {
  const { data, error } = useSWR(`/api/options/value`, fetcher);

  if (error) {
    return <div>Failed to load</div>;
  }
  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md bg-white p-3 text-center">
      <span className="block text-3xl">${fmtMoney(data.result)}</span>
      <span className="block text-sm text-gray-400">Total Earned</span>
    </div>
  );
}
