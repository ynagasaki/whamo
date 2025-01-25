'use client';

import { Goal } from '@/app/lib/model';
import { fmtMoney, fmtDate } from '@/app/lib/util';
import { Taggy } from './taggy';

export function ClosedGoalCard({ goal }: { goal: Goal }) {
  return (
    <div className="relative mb-1 flex rounded-md bg-gray-200 p-3">
      <div className="w-3/4 md:w-1/2">
        <span className="text-gray-700">{goal.name}&nbsp;</span>
        {goal.category && (
          <Taggy tagId={goal.category} forceFullSize isDark={true} />
        )}
        <span className="block text-gray-400">
          ${fmtMoney(goal.curr_amt)} saved
        </span>
      </div>
      <div className="w-1/4 text-right md:w-1/2">
        <div className="mr-3 hidden md:inline-block">
          <span className="block text-gray-700">{fmtDate(goal.created)}</span>
          <span className="block text-gray-400">created</span>
        </div>
        <div className="inline-block">
          <span className="block text-gray-700">
            {fmtDate(goal.last_contrib_dt)}
          </span>
          <span className="block text-gray-400">completed</span>
        </div>
      </div>
    </div>
  );
}
