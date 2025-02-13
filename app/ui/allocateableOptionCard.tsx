'use client';

import { AllocatableOption } from '@/app/lib/model';
import { fmtDate, fmtMoney } from '@/app/lib/util';
import { useDraggable } from '@dnd-kit/core';

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
      {...attributes}
      {...listeners}
      className="relative mb-2 flex flex-wrap rounded-md bg-green-400 p-3 text-white shadow"
      style={style}
    >
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
          <span className="text-green-200">$</span>
          <span className="font-bold">{fmtMoney(option.remaining_amt)}</span>
        </div>
      </div>
      <div className="w-full">
        <span className="block text-green-200">
          {option.closed_by ? 'closed' : 'expired'} {fmtDate(option.exp)}
        </span>
      </div>
    </div>
  );
}
