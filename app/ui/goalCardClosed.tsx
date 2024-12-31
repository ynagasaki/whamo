'use client';

import { Goal } from '@/app/lib/model';
import { fmtMoney, fmtDate } from '@/app/lib/util';
import Link from 'next/link';

export function ClosedGoalCard({ goal }: { goal: Goal }) {
  return (
    <div className="relative flex rounded-md border-b-2 border-gray-100 bg-gray-200 p-3">
      <div className="w-3/4 md:w-1/2">
        <span className="block text-gray-700">
          <Link href={`/goals/${goal.id}/view`}>{goal.name}&nbsp;</Link>
        </span>
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
