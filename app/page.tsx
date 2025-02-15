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
import { fetcher, postData } from '@/app/lib/util';
import { GoalCard } from '@/app/ui/goalCard';
import { InputFormModal } from '@/app/ui/formModal';
import { ExclamationCircleIcon, PlusIcon } from '@heroicons/react/20/solid';
import { OptionSumCard } from '@/app/ui/cards/optionSumCard';
import { GoalsClosedCard } from '@/app/ui/cards/goalsClosedCard';
import { ClosedGoalCard } from './ui/goalCardClosed';
import { TopSymbolsCard } from './ui/cards/topSymbolsCard';
import { TopTagsCard } from './ui/cards/topTagsCard';
import { OptionCard } from './ui/optionCard';
import { EarnRateCard } from './ui/cards/earnRateCard';

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
  const [editGoalData, setEditGoalData] = useState<Goal | undefined>(undefined);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col bg-gray-100 pb-8">
      <div
        className={clsx(
          'fixed bottom-0 bottom-3 left-0 right-0 z-30 ml-auto mr-auto h-10 w-10 cursor-pointer rounded-full p-1',
          {
            'bg-purple-400 text-white hover:bg-purple-300': !showOptionForm,
            'rotate-45 transform bg-gray-400 text-white hover:bg-gray-300':
              showOptionForm,
          },
        )}
      >
        <PlusIcon
          onClick={() => {
            setEditGoalData(undefined);
            setShowOptionForm(!showOptionForm);
          }}
        ></PlusIcon>
      </div>
      <div className="flex flex-wrap p-4">
        <div className="w-1/2 pr-2 md:w-1/4">
          <Suspense>
            <OptionSumCard></OptionSumCard>
          </Suspense>
        </div>
        <div className="w-1/2 px-2 pr-0 md:w-1/4 md:pr-2">
          <Suspense>
            <EarnRateCard />
          </Suspense>
        </div>
        <div className="w-1/2 px-2 pl-0 pt-2 md:w-1/4 md:pl-2 md:pt-0">
          <Suspense>
            <TopSymbolsCard></TopSymbolsCard>
          </Suspense>
        </div>
        <div className="w-1/2 pl-2 pt-2 md:w-1/4 md:pt-0">
          <Suspense>
            <TopTagsCard></TopTagsCard>
          </Suspense>
        </div>
        {/* <div className="w-1/2 pr-2 pt-2 md:w-1/4">
          <Suspense>
            <GoalsClosedCard />
          </Suspense>
        </div> */}
      </div>
      <div className="mb-2 flex">
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
              <GoalsList
                editGoalCallback={(goal: Goal) => {
                  if (showOptionForm) {
                    // just close the form without reopening; make
                    // user click again to reopen it
                    setShowOptionForm(false);
                    return;
                  }
                  setEditGoalData(goal);
                  setShowOptionForm(true);
                }}
              />
            </Suspense>
          </div>
        </DndContext>
      </div>
      <div className="px-4">
        <Suspense>
          <ClosedGoalsList status="c" lookbackPeriod={365} />
        </Suspense>
      </div>
      {showOptionForm && (
        <InputFormModal
          editGoalData={editGoalData}
          postSubmitCallback={() => setShowOptionForm(false)}
        />
      )}
    </main>
  );
}

function AllocatableOptionsList() {
  const { data, error } = useSWR(`/api/options/alloc`, fetcher);

  if (error) {
    return (
      <div className="mb-2 rounded-md bg-white p-3 text-gray-300">
        <ExclamationCircleIcon className="inline-block h-5 w-5" /> Failed to
        load
      </div>
    );
  }
  if (!data) {
    return (
      <div className="mb-2 rounded-md bg-white p-3 text-gray-300">
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
    return (
      <div className="mb-2 rounded-md bg-white p-3 text-gray-300">
        <ExclamationCircleIcon className="inline-block h-5 w-5" /> Failed to
        load
      </div>
    );
  }
  if (!data) {
    return (
      <div className="mb-2 rounded-md bg-white p-3 text-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <>
      {data.options.map((option: Option) => {
        return <OptionCard key={`option-${option.id}`} option={option} />;
      })}
    </>
  );
}

function GoalsList({
  editGoalCallback,
}: {
  editGoalCallback: (goal: Goal) => void;
}) {
  const { data, error } = useSWR(`/api/goals`, fetcher);

  if (error) {
    return (
      <div className="mb-2 rounded-md bg-gray-200 p-3 text-gray-400">
        <ExclamationCircleIcon className="inline-block h-5 w-5" /> Failed to
        load
      </div>
    );
  }
  if (!data) {
    return (
      <div className="mb-2 rounded-md border-2 bg-white p-3 text-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <>
      {data.goals.map((goal: Goal) => {
        return (
          <GoalCard
            id={`goal-${goal.id}`}
            key={`goal-${goal.id}`}
            goal={goal}
            editGoalCallback={editGoalCallback}
          ></GoalCard>
        );
      })}
    </>
  );
}

function ClosedGoalsList({
  status,
  lookbackPeriod,
}: {
  status: 'c';
  lookbackPeriod: number;
}) {
  const params: string[] = [`status=${status}`, `lastPd=${lookbackPeriod}`];

  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  const { data, error } = useSWR(`/api/goals${qs}`, fetcher);

  if (error) {
    return (
      <div className="mb-2 rounded-md bg-gray-200 p-3 text-gray-400">
        <ExclamationCircleIcon className="inline-block h-5 w-5" /> Failed to
        load
      </div>
    );
  }
  if (!data) {
    return (
      <div className="mb-2 rounded-md bg-gray-200 p-3 text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <>
      {data.goals.map((goal: Goal) => {
        return <ClosedGoalCard key={`goal-${goal.id}`} goal={goal} />;
      })}
    </>
  );
}
