'use client';

import { Goal } from '@/app/lib/model';
import { fmtMoney, fmtDate } from '@/app/lib/util';

export function ClosedGoalCard({ goal }: { goal: Goal }) {
  return (
    <div className="relative flex rounded-md border-b-2 border-gray-100 bg-gray-200 p-3">
      <div className="flex-1">
        <span className="text-gray-700">{goal.name}</span>
        <span className="text-gray-400">
          &nbsp;(${fmtMoney(goal.curr_amt)} saved)
        </span>
      </div>
      <div className="flex-1 text-right">
        <span className="text-gray-400">completed&nbsp;</span>
        <span className="text-gray-700">{fmtDate(goal.last_contrib_dt)}</span>
      </div>
    </div>
  );
}
