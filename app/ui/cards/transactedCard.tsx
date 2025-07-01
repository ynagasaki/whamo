import useSWR from 'swr';
import { fetcher, fmtMoney } from '@/app/lib/util';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';

export function TransactedCard() {
  const { data, error } = useSWR(`/api/options/value?grp=txn-mo`, fetcher);

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

  const txnSums = data.result as { category: string; value: number }[];
  const currTxnSum = txnSums[0];

  console.log(`YOSHI:`, txnSums);

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
