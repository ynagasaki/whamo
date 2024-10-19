'use client';

import clsx from 'clsx';
import useSWR from 'swr';
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ContributionSummary, Goal } from '@/app/lib/model';
import { fetcher, fmtMoney } from '@/app/lib/util';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export function GoalCard({ id, goal }: { id: string; goal: Goal }) {
  const { isOver, setNodeRef } = useDroppable({ id, data: { goal } });
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      ref={setNodeRef}
      className={clsx('relative mb-3 rounded-md border-2 bg-white p-3', {
        'border-teal-400': isOver,
      })}
    >
      <div className="flex">
        <div className="flex-1">
          <span className="block text-gray-700">{goal.name}</span>
          <span className="block text-gray-400">
            ${fmtMoney(goal.curr_amt)} of ${fmtMoney(goal.amt)}
          </span>
        </div>
        <div className="flex-1 text-right">
          <span className="block text-xl text-purple-400">
            {Math.round((goal.curr_amt / goal.amt) * 100)}%
          </span>
        </div>
      </div>
      {showDetails && <GoalContributions goal={goal} />}
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
    </div>
  );
}

function GoalContributions({ goal }: { goal: Goal }) {
  const { data, error } = useSWR(`/api/contribs?goal=${goal.id}`, fetcher);

  if (error) {
    return <div>Failed to load</div>;
  }
  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-3 divide-y divide-gray-100 border-t-2 text-gray-700">
      {data.contributions.map((cs: ContributionSummary) => {
        return (
          <div key={`ContribSummary-Item-${cs.id}`} className="flex pb-3 pt-3">
            <div className="flex-2">
              <span className="text-blue-400">{cs.option_type}</span>
              &nbsp;{cs.option_symbol} @ {cs.option_strike}
              &nbsp;<span className="text-gray-400">({cs.option_exp})</span>
            </div>
            <div className="flex-1 text-right">
              <span className="text-gray-400">$</span>
              {fmtMoney(cs.amt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
