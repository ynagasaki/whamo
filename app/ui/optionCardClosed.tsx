'use client';

import { ClosedOption } from '@/app/lib/model';
import { fmtMoney, fmtDate } from '@/app/lib/util';
import clsx from 'clsx';

export function ClosedOptionCard({ option }: { option: ClosedOption }) {
  let isClosed = !(option.closed_by === null || option.closed_by === undefined);

  return (
    <div className="relative mb-1 flex flex-wrap rounded-md bg-gray-200 p-3">
      <div className="w-2/3">
        <span className="block text-gray-700">
          <div className="mr-1 block text-xs font-bold tracking-tight text-gray-500 md:inline-block md:tracking-normal">
            {option.otype}
          </div>
          <div className="block md:inline-block">
            {option.symbol}
            <span className="text-gray-400">@{option.strike}</span>
          </div>
        </span>
      </div>
      <div className="w-1/3 text-right">
        <div className="absolute right-0 top-0 mr-3 mt-3 md:relative md:m-0">
          {/* <span className="text-green-200">$</span> */}
          <span
            className={clsx({
              'text-gray-700': option.gain >= 0,
              'text-red-400': option.gain < 0,
            })}
          >
            {fmtMoney(option.gain)}
          </span>
        </div>
      </div>
      <div className="w-2/3 border">
        <span className="text-gray-400">
          {isClosed ? 'closed' : 'expired'} {fmtDate(option.closed_on)}
        </span>
      </div>
      <div className="w-1/3 text-right">
        <div className="inline-block">
          {option.assigned && (
            <div className="rounded-full border border-gray-500 px-2 py-1 text-xs leading-none text-gray-500">
              asgd.
            </div>
          )}
          {isClosed && (
            <div className="text-sm text-gray-400">
              <span className="block">
                {fmtMoney(option.price * 100 - option.fee)}
              </span>
              <span className="block">
                {fmtMoney(option.closed_price * 100 - option.closed_fee)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
