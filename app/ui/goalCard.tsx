'use client';

import { ContributionSummary, Goal } from '../lib/model';
import { useState } from 'react';
import useSWR from 'swr';

const fetcher = async (input: RequestInfo | URL, init?: RequestInit): Promise<any> => {
  const response = await fetch(input, init);
  return response.json();
}

export function GoalCard(params: { goal: Goal }) {
  const goal = params.goal;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-md p-3">
      <div className="flex">
        <div className="flex-1">
          <span className="text-gray-700 block">{goal.name}</span>
          <span className="text-gray-400 block">{goal.curr_amt ?? '?'} of {goal.amt}</span>
        </div>
        <div className="flex-1 text-right text-purple-400 text-xl">
          {goal.curr_amt &&
            <span className="block">{Math.round(goal.curr_amt / goal.amt * 100)}%</span>
          }
          <span className="block text-gray-300 text-sm" onClick={() => setShowDetails(!showDetails)}>details</span>
        </div>
      </div>
      {showDetails && <GoalContributions goal={goal} />}
    </div >
  );
}

function GoalContributions({ goal }: { goal: Goal }) {
  const { data, error } = useSWR(`/api/goal?goal=${goal.id}`, fetcher)

  if (error) {
    return <div>Failed to load</div>
  }
  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <>
      {
        data.contributions.map((cs: ContributionSummary) => {
          return (
            <div key={`ContribSummary-Item-${cs.id}`} className="bg-gray-100">
              {cs.option_symbol} {cs.option_type} {cs.option_exp} {cs.option_strike} {cs.amt}
            </div>
          );
        })
      }
    </>
  );
}
