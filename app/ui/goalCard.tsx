'use client';

import { ContributionSummary, Goal } from '../lib/model';
import { Dispatch, SetStateAction, useState } from 'react';
import useSWR from 'swr';

const fetcher = async (input: RequestInfo | URL, init?: RequestInit): Promise<any> => {
  const response = await fetch(input, init);
  return response.json();
}

function getCurrAmt(goal: Goal, calcAmount: number): number | undefined {
  if (calcAmount > -1) {
    return calcAmount;
  }
  return goal.curr_amt;
}

export function GoalCard(params: { goal: Goal }) {
  const goal = params.goal;
  const [showDetails, setShowDetails] = useState(false);
  const [calcAmount, setCalcAmount] = useState(-1);
  const currAmt = getCurrAmt(goal, calcAmount);

  return (
    <div className="bg-white rounded-md p-3">
      <div className="flex">
        <div className="flex-1">
          <span className="text-gray-700 block">{goal.name}</span>
          <span className="text-gray-400 block">{currAmt ?? '?'} of {goal.amt}</span>
        </div>
        <div className="flex-1 text-right">
          {currAmt &&
            <span className="block text-purple-400 text-xl">{Math.round(currAmt / goal.amt * 100)}%</span>
          }
          <span className="block text-gray-300 text-sm" onClick={() => setShowDetails(!showDetails)}>details</span>
        </div>
      </div>
      {showDetails && <GoalContributions goal={goal} setGoalAmount={setCalcAmount} />}
    </div >
  );
}

function GoalContributions({
  goal,
  setGoalAmount,
}: {
  goal: Goal,
  setGoalAmount: Dispatch<SetStateAction<number>>,
}) {
  const { data, error } = useSWR(`/api/goal?goal=${goal.id}`, fetcher)

  if (error) {
    return <div>Failed to load</div>
  }
  if (!data) {
    return <div>Loading...</div>
  }

  let totalAmount = 0;
  for (const cs of data.contributions) {
    totalAmount += (cs as ContributionSummary).amt;
  }
  setGoalAmount(totalAmount);

  return (
    <div className="divide-y divide-gray-100 border-t-2 mt-3 text-gray-700">
      {
        data.contributions.map((cs: ContributionSummary) => {
          return (
            <div key={`ContribSummary-Item-${cs.id}`} className="p-3 flex">
              <div className="flex-2">
                <span className="text-blue-400">{cs.option_type}</span>
                &nbsp;{cs.option_symbol} @ {cs.option_strike}
                &nbsp;<span className="text-gray-400">({cs.option_exp})</span>
              </div>
              <div className="flex-1 text-right">
                {cs.amt}
              </div>
            </div>
          );
        })
      }
    </div>
  );
}
