'use client';

import { AllocatableOption } from '@/app/lib/model';
import { fmtMoney, tenseExp } from '@/app/lib/util';
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
      className="mb-3 flex rounded-md bg-green-400 p-3 text-white shadow"
      style={style}
    >
      <div className="flex-1">
        <span className="text-green-600">{option.otype}</span> {option.symbol} @{' '}
        {option.strike}
        <span className="block text-green-200">
          {tenseExp(option)} {option.exp}
        </span>
      </div>
      <div className="flex-1 text-right text-xl">
        <span className="text-green-200">$</span>
        <span className="font-bold">{fmtMoney(option.remaining_amt)}</span>
      </div>
    </div>
  );
}
