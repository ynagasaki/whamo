'use client';

import clsx from 'clsx';
import useSWR, { mutate } from 'swr';
import { Suspense, useState } from 'react';
import {
  ClientRect,
  Collision,
  DndContext,
  DragEndEvent,
  rectIntersection,
} from '@dnd-kit/core';
import { AllocOptionCard } from './ui/allocateableOptionCard';
import { AllocatableOption, Goal, Option } from '@/app/lib/model';
import { dday, fetcher, fmtMoney, postData, tenseExp } from '@/app/lib/util';
import { GoalCard } from '@/app/ui/goalCard';
import { InputFormModal } from '@/app/ui/formModal';
import { PlusIcon } from '@heroicons/react/20/solid';

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
      <div className={clsx("fixed bottom-0 ml-auto mr-auto w-10 h-10 cursor-pointer left-0 right-0 bottom-3 rounded-full p-1 z-30", {
        "bg-purple-400 text-white": !showOptionForm,
        "bg-gray-400 text-white transform rotate-45": showOptionForm,
      })}>
        <PlusIcon onClick={() => setShowOptionForm(!showOptionForm)}></PlusIcon>
      </div>
      <div className="p-4">
        <span className="text-gray-600">
          whamo&nbsp;
          <span className="text-purple-400">:)</span>
        </span>
      </div>
      <div className="flex">
        <DndContext onDragEnd={dragEndHandler} collisionDetection={collisionDetector}>
          <div className="w-1/2 z-10 pr-2 pl-4 pb-4">
            {/*
              z-index:
                1. elements appearing later have higher z
                2. positioned elements have higher z over non-positioned
                3. z-indices are nested
            */}
            <div className="relative z-10">
              <Suspense>
                <AllocatableOptionsList />
              </Suspense>
            </div>
            <div className="relative z-0">
              <Suspense>
                <OptionsList></OptionsList>
              </Suspense>
            </div>
          </div>
          <div className="w-1/2 z-0 pl-2 pr-4 pb-4">
            <Suspense>
              <GoalsList></GoalsList>
            </Suspense>
          </div>
        </DndContext>
      </div >
      {
        showOptionForm && <InputFormModal />
      }
    </main >
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
            <AllocOptionCard id={`alloc-opt-${option.id}`} option={option} key={`alloc-opt-${option.id}`} />
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
            <div key={`option-${option.id}`} className="relative flex bg-white rounded-md p-3 mb-3">
              <div className="flex-1">
                <span className="block text-gray-700">
                  <span className="text-blue-400">{option.otype}</span> {option.symbol} @ {option.strike}
                </span>
                <span className="block text-gray-400">{tenseExp(option)} {option.exp}</span>
              </div>
              <div className="flex-1 text-right">
                <div className="text-xl">
                  <span className="text-green-200">$</span>
                  <span className="text-green-400">{fmtMoney(option.price * 100 - option.fee)}</span>
                </div>
                <span className="block text-purple-400">{dday(new Date(option.exp))}</span>
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
            <GoalCard id={`goal-${goal.id}`} key={`goal-${goal.id}`} goal={goal}></GoalCard>
          );
        })
      }
    </>
  )
}
