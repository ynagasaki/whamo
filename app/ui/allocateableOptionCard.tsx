'use client';

import { AllocatableOption } from '@/app/lib/model';
import { fmtDate, fmtMoney, postData } from '@/app/lib/util';
import { useDraggable } from '@dnd-kit/core';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useState } from 'react';

export function AllocOptionCard({
  id,
  option,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  id: string;
  option: AllocatableOption;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
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
  const [isAssigned, setAssigned] = useState(!!option.assigned);

  return (
    <div
      ref={setNodeRef}
      className="relative mb-2 flex flex-wrap rounded-md bg-green-400 p-3 pr-4 text-white shadow"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-y-0 right-0"
        style={{ touchAction: 'none' }}
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
          {option.closed_by ? 'closed' : 'expired'} {fmtDate(option.closed_on)}
        </span>
      </div>
      <div className="w-1/3 text-right">
        {(option.closed_by === null || option.closed_by === undefined) && (
          <div className="inline-block">
            <div
              className={clsx('rounded-full px-2 py-1 text-xs leading-none', {
                'border border-green-700 text-green-700': !isAssigned,
                'bg-green-700 text-white': isAssigned,
                invisible: !isAssigned && !isHovered,
                'cursor-pointer': isHovered,
              })}
              onClick={async () => {
                const assignedValue = !isAssigned;
                const data = {
                  id: `${option.id}`,
                  assigned: `${assignedValue}`,
                };
                await postData(`/api/options/alloc`, data);
                setAssigned(assignedValue);
              }}
            >
              asgd.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
