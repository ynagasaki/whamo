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
import { AllocOptionCard } from '@/app/ui/allocateableOptionCard';
import { AllocatableOption, Goal, Option } from '@/app/lib/model';
import {
  dday,
  fetcher,
  fmtDate,
  fmtMoney,
  postData,
  tenseExp,
} from '@/app/lib/util';
import { GoalCard } from '@/app/ui/goalCard';
import { InputFormModal } from '@/app/ui/formModal';
import { PlusIcon } from '@heroicons/react/20/solid';
import { OptionSumCard } from '@/app/ui/cards/optionSumCard';
import { GoalsClosedCard } from '@/app/ui/cards/goalsClosedCard';
import { ClosedGoalCard } from './ui/goalCardClosed';

export default function Page() {
  const dragEndHandler = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    const option: AllocatableOption = active.data.current?.option;
    const goal: Goal = over?.data.current?.goal;

    if (!option || !goal) {
      return;
    }

    const result = (await postData(`/api/contribs`, {
      goalId: `${goal.id}`,
      optionId: `${option.id}`,
      amt: `${option.remaining_amt * 100}`,
    })) as { leftover: number };

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
      },
    });
  };

  const [showOptionForm, setShowOptionForm] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col bg-gray-100 pb-8">
      <div
        className={clsx(
          'fixed bottom-0 bottom-3 left-0 right-0 z-30 ml-auto mr-auto h-10 w-10 cursor-pointer rounded-full p-1',
          {
            'bg-purple-400 text-white': !showOptionForm,
            'rotate-45 transform bg-gray-400 text-white': showOptionForm,
          },
        )}
      >
        <PlusIcon onClick={() => setShowOptionForm(!showOptionForm)}></PlusIcon>
      </div>
      <div className="flex flex-wrap p-4">
        <div className="w-1/2 pr-2 sm:w-1/2 md:w-1/2 lg:w-1/4 xl:w-1/4">
          <Suspense>
            <OptionSumCard></OptionSumCard>
          </Suspense>
        </div>
        <div className="w-1/2 px-2 sm:w-1/2 md:w-1/2 lg:w-1/4 xl:w-1/4">
          <Suspense>
            <GoalsClosedCard></GoalsClosedCard>
          </Suspense>
        </div>
      </div>
      <div className="flex">
        <DndContext
          onDragEnd={dragEndHandler}
          collisionDetection={collisionDetector}
        >
          <div className="z-10 w-1/2 pl-4 pr-2">
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
          <div className="z-0 w-1/2 pl-2 pr-4">
            <Suspense>
              <GoalsList></GoalsList>
            </Suspense>
          </div>
        </DndContext>
      </div>
      <div className="px-4">
        <Suspense>
          <GoalsList status="c" lookbackPeriod={600}></GoalsList>
        </Suspense>
      </div>
      {showOptionForm && <InputFormModal />}
    </main>
  );
}

function AllocatableOptionsList() {
  const { data, error } = useSWR(`/api/options/alloc`, fetcher);

  if (error) {
    return <div>Failed to load</div>;
  }
  if (!data) {
    return (
      <div className="mb-3 rounded-md bg-white p-3 text-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <>
      {data.options.map((option: AllocatableOption) => {
        return (
          <AllocOptionCard
            id={`alloc-opt-${option.id}`}
            option={option}
            key={`alloc-opt-${option.id}`}
          />
        );
      })}
    </>
  );
}

function OptionsList() {
  const { data, error } = useSWR(`/api/options`, fetcher);

  if (error) {
    return <div>Failed to load</div>;
  }
  if (!data) {
    return (
      <div className="mb-3 rounded-md bg-white p-3 text-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <>
      {data.options.map((option: Option) => {
        return (
          <div
            key={`option-${option.id}`}
            className="relative mb-3 flex flex-wrap rounded-md bg-white p-3"
          >
            <div className="w-2/3">
              <span className="block text-gray-700">
                <div className="mr-1 block text-xs font-bold tracking-tight text-blue-400 md:inline-block md:tracking-normal">
                  {option.otype}
                </div>
                <div className="block md:inline-block">
                  {option.symbol}
                  <span className="text-gray-400">@{option.strike}&nbsp;</span>
                </div>
              </span>
            </div>
            <div className="w-1/3 text-right">
              <div className="md:text-xl">
                <span className="text-green-200">$</span>
                <span className="text-green-400">
                  {fmtMoney(option.price * 100 - option.fee)}
                </span>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <span className="text-gray-400">
                {tenseExp(option)} {fmtDate(option.exp)}
              </span>
            </div>
            <div className="hidden w-1/3 text-right md:block">
              <span className="text-purple-400">
                {dday(new Date(option.exp))}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}

function GoalsList({
  status,
  lookbackPeriod,
}: {
  status?: 'c';
  lookbackPeriod?: number;
}) {
  const params: string[] = [];

  if (status) {
    params.push(`status=${status}`);
  }

  if (lookbackPeriod) {
    params.push(`lastPd=${lookbackPeriod}`);
  }

  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  const { data, error } = useSWR(`/api/goals${qs}`, fetcher);

  if (error) {
    return <div>Failed to load</div>;
  }
  if (!data) {
    if (status === 'c') {
      return (
        <div className="rounded-md bg-gray-200 p-3 text-gray-400">
          Loading...
        </div>
      );
    } else {
      return (
        <div className="mb-3 rounded-md border-2 bg-white p-3 text-gray-300">
          Loading...
        </div>
      );
    }
  }

  return (
    <>
      {data.goals.map((goal: Goal) => {
        if (status === 'c') {
          return <ClosedGoalCard key={`goal-${goal.id}`} goal={goal} />;
        }
        return (
          <GoalCard
            id={`goal-${goal.id}`}
            key={`goal-${goal.id}`}
            goal={goal}
          ></GoalCard>
        );
      })}
    </>
  );
}
