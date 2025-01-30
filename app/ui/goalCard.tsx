'use client';

import clsx from 'clsx';
import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ContributionSummary, Goal } from '@/app/lib/model';
import { fetcher, fmtDate, fmtMoney } from '@/app/lib/util';
import {
  ChevronDownIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/20/solid';
import { LinkSlashIcon } from '@heroicons/react/16/solid';
import { Taggy } from './taggy';

export function GoalCard({
  id,
  goal,
  editGoalCallback,
}: {
  id: string;
  goal: Goal;
  editGoalCallback: (goal: Goal) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id, data: { goal } });
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      ref={setNodeRef}
      className={clsx('relative mb-2 rounded-md border-2 bg-white p-3', {
        'border-teal-400': isOver,
      })}
    >
      <div className="flex flex-wrap">
        <div className="block w-full text-center md:hidden">
          <span className="inline-block text-xl text-purple-400">
            {Math.round((goal.curr_amt / goal.amt) * 100)}%
          </span>
        </div>
        <div className="sm:w-full md:w-2/3">
          <span
            className="border-dotted border-gray-300 text-gray-700 hover:cursor-pointer hover:border-b-2"
            onClick={() => editGoalCallback(goal)}
          >
            {goal.name}
          </span>
        </div>
        <div className="hidden text-right md:block md:w-1/3">
          <span className="inline-block text-xl text-purple-400">
            {Math.round((goal.curr_amt / goal.amt) * 100)}%
          </span>
        </div>
        <div className="flex w-full text-gray-400">
          <div className="w-2/3">
            <span className="inline-block">${fmtMoney(goal.curr_amt)}</span>
            <span className="hidden md:inline-block">
              &nbsp;of ${fmtMoney(goal.amt)}
            </span>
          </div>
          <div className="w-1/3 text-right">
            {goal.category && <Taggy tagId={goal.category} />}
          </div>
        </div>
      </div>
      {showDetails && <GoalContributions goal={goal} />}
      {goal.curr_amt > 0 && (
        <div
          className="absolute inset-x-0 bottom-0 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <ChevronDownIcon
            className={clsx('ml-auto mr-auto w-6 transform text-gray-300', {
              'rotate-180': showDetails,
            })}
          />
        </div>
      )}
    </div>
  );
}

async function unlinkContribution(
  goalId: number,
  contributionId: number,
): Promise<void> {
  await fetch(`/api/contribs?contrib=${contributionId}`, {
    method: 'DELETE',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  });
  mutate(`/api/contribs?goal=${goalId}`);
  mutate('/api/options/alloc');
}

function GoalContributions({ goal }: { goal: Goal }) {
  const { data, error } = useSWR(`/api/contribs?goal=${goal.id}`, fetcher);
  const [hoveredRowId, setHoveredRowId] = useState(-1);

  if (error) {
    return (
      <div className="text-gray-300">
        <ExclamationCircleIcon className="inline-block h-5 w-5" /> Failed to
        load
      </div>
    );
  }
  if (!data) {
    return <div className="text-gray-300">Loading...</div>;
  }

  return (
    <div className="mt-3 divide-y divide-gray-100 border-t-2 text-gray-700">
      {data.contributions.map((cs: ContributionSummary) => {
        return (
          <div
            key={`ContribSummary-Item-${cs.id}`}
            className="flex pb-2 pt-2"
            onMouseEnter={() => setHoveredRowId(cs.id)}
            onMouseLeave={() => setHoveredRowId(-1)}
          >
            <div className="w-1/2">
              <span className="mr-1 block text-xs font-bold text-blue-400 md:inline-block">
                {cs.option_type}
              </span>
              {cs.option_symbol}
              <span className="mr-1 text-gray-400">@{cs.option_strike}</span>
              <span className="hidden text-gray-400 md:block">
                expires {fmtDate(cs.option_exp)}
              </span>
            </div>
            <div className="w-1/2 text-right">
              <div>
                <span className="text-gray-400">$</span>
                {fmtMoney(cs.amt)}
              </div>
              <div className="leading-none">
                <LinkSlashIcon
                  onClick={() => unlinkContribution(goal.id, cs.id)}
                  className={clsx(
                    'inline-block h-4 w-4 cursor-pointer text-red-400',
                    {
                      hidden: hoveredRowId !== cs.id,
                    },
                  )}
                ></LinkSlashIcon>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
