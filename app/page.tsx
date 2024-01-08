'use client';

import useSWR, { mutate } from 'swr';
import { Suspense, useState } from 'react';
import {
  ClientRect,
  Collision,
  DndContext,
  DragEndEvent,
  rectIntersection,
  useDraggable
} from '@dnd-kit/core';
import { AllocatableOption, Goal, Option } from '@/app/lib/model';
import { dday, fetcher, fmtMoney, postData, tenseExp } from '@/app/lib/util';
import { GoalCard } from '@/app/ui/goalCard';
import { InputFormModal } from '@/app/ui/optionForm';

export default function Page() {
  const dragEndHandler = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    const option: AllocatableOption = active.data.current?.option;
    const goal: Goal = over?.data.current?.goal;

    if (!option || !goal) {
      return;
    }

    const result = await postData(`/api/contribs`, {
      goalId: `${goal.id}`,
      optionId: `${option.id}`,
      amt: `${option.remaining_amt * 100}`,
    }) as { leftover: number };

    console.log(`Contributed to goal with leftover=${result.leftover}`);
    mutate('/api/goals');
    mutate('/api/options/alloc');
    mutate(`/api/contribs?goal=${goal.id}`);
  };
  const collisionDetector = (args: any): Collision[] => {
    const { collisionRect }: { collisionRect: ClientRect } = args;
    const xScale = 0.8;
    const yScale = 0.9;
    return rectIntersection({
      ...args,
      collisionRect: {
        top: collisionRect.top * yScale,
        right: collisionRect.right * xScale,
        bottom: collisionRect.bottom * yScale,
        left: collisionRect.left * xScale,
        width: collisionRect.width * xScale,
        height: collisionRect.height * yScale,
      }
    });
  };

  const [showOptionForm, setShowOptionForm] = useState(false);

  return (
    <main className="bg-gray-100 min-h-screen flex flex-col">
      <div className="p-4">
        <span className="text-gray-600">
          whamo&nbsp;
          <span className="text-purple-400">:)</span>
        </span>
        <button onClick={() => setShowOptionForm(true)}>New Option</button>
      </div>
      <div className="grid grid-cols-2">
        <DndContext onDragEnd={dragEndHandler} collisionDetection={collisionDetector}>
          <div className="p-4">
            <Suspense>
              <AllocatableOptionsList />
            </Suspense>
            <Suspense>
              <OptionsList></OptionsList>
            </Suspense>
          </div>
          <div className="p-4">
            <Suspense>
              <GoalsList></GoalsList>
            </Suspense>
          </div>
        </DndContext>
      </div>
      {
        showOptionForm && <InputFormModal dismissHandler={() => setShowOptionForm(false)} />
      }
    </main>
  );
}

function AllocatableOptionsList() {
  const { data, error } = useSWR(`/api/options/alloc`, fetcher);

  if (error) {
    return <div>Failed to load</div>
  }
  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <>
      {
        data.options.map((option: AllocatableOption) => {
          return (
            <AllocOptionCard id={`alloc-opt-${option.id}`} option={option} key={`AlloOptList-item-${option.id}`} />
          );
        })
      }
    </>
  );
}

function OptionsList() {
  const { data, error } = useSWR(`/api/options`, fetcher);

  if (error) {
    return <div>Failed to load</div>
  }
  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <>
      {
        data.options.map((option: Option) => {
          return (
            <div key={`OptionList-item-${option.id}`} className="relative flex bg-white rounded-md p-3 mb-3">
              <div className="flex-1">
                <span className="block text-gray-700">
                  <span className="text-blue-400">{option.otype}</span> {option.symbol} @ {option.strike}
                </span>
                <span className="block text-gray-400">{tenseExp(option)} {option.exp}</span>
              </div>
              <div className="flex-1 text-right">
                <span className="block text-purple-400 text-xl">{dday(new Date(option.exp))}</span>
              </div>
              {/* <div className="absolute inset-x-0 bottom-0 cursor-pointer">
                <ChevronDownIcon className={clsx("transform w-6 text-gray-300 ml-auto mr-auto",
                  {
                    "rotate-180": false,
                  }
                )} />
              </div> */}
            </div>
          );
        })
      }
    </>
  );
}

function GoalsList() {
  const { data, error } = useSWR(`/api/goals`, fetcher);

  if (error) {
    return <div>Failed to load</div>
  }
  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <>
      {
        data.goals.map((goal: Goal) => {
          return (
            <GoalCard id={`goal-${goal.id}`} key={`GoalsList-item-${goal.id}`} goal={goal}></GoalCard>
          );
        })
      }
    </>
  )
}

function AllocOptionCard({ id, option }: { id: string, option: AllocatableOption }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, data: { option } });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="bg-green-400 rounded-md p-3 flex text-white mb-3 shadow" style={style}>
      <div className="flex-1">
        <span className="text-green-600">{option.otype}</span> {option.symbol} @ {option.strike}
        <span className="block text-green-200">{tenseExp(option)} {option.exp}</span>
      </div>
      <div className="flex-1 text-right text-xl">
        <span className="text-green-200">$</span><span className="font-bold">{fmtMoney(option.remaining_amt)}</span>
      </div>
    </div>
  );
}
