'use client';

import { AllocatableOption } from '@/app/lib/model';
import { fmtDate, fmtMoney } from '@/app/lib/util';
import { useDraggable } from '@dnd-kit/core';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';

export function AllocOptionCard({
  id,
  option,
}: {
  id: string;
  option: AllocatableOption;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { option },
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      className="relative mb-2 flex flex-wrap rounded-md bg-green-400 p-3 pr-4 text-white shadow"
      style={style}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-y-0 right-0"
      >
        <div className="flex h-full items-center">
          <EllipsisVerticalIcon className="h-5 text-green-200" />
        </div>
      </div>
      <div className="w-1/2">
        <div className="mr-1 block text-xs font-bold tracking-tight text-green-700 md:inline-block md:tracking-normal">
          {option.otype}
        </div>
        <div className="block md:inline-block">
          {option.symbol}
          <span className="text-green-200">@{option.strike}</span>
        </div>
      </div>
      <div className="w-1/2 text-right">
        <div className="absolute right-0 top-0 mr-3 mt-3 md:relative md:m-0 md:text-xl">
          {/* <span className="text-green-200">$</span> */}
          <span className="font-bold">{fmtMoney(option.remaining_amt)}</span>
        </div>
      </div>
      <div className="w-2/3">
        <span className="block text-green-200">
          {option.closed_by ? 'closed' : 'expired'} {fmtDate(option.exp)}
        </span>
      </div>
      <div className="w-1/3 text-right">
        {!!option.assigned && (
          <div className="inline-block">
            <div
              className={`
            rounded-full
            border
            border-green-700
            px-2
            py-1
            text-xs
            leading-none
            text-green-700`}
            >
              assigned
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
