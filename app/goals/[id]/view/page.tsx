import { fetchContributions, fetchGoal } from '@/app/lib/data';
import { ContributionSummary } from '@/app/lib/model';
import { fmtDate, fmtMoney } from '@/app/lib/util';
import { GoalTimeline } from '@/app/ui/goalTimeline';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  const [goal, contribs] = await Promise.all([
    fetchGoal(id),
    fetchContributions(id),
  ]);

  return (
    <div className="text-gray-700">
      <div className="flex">
        <div className="w-3/4">
          <span className="block text-2xl">{goal.name}</span>
          <span className="block">Created {fmtDate(goal.created)}</span>
        </div>
        <div className="w-1/4 text-right">
          <span className="block text-2xl">${fmtMoney(goal.curr_amt)}</span>
          <span className="block">${fmtMoney(goal.amt)}</span>
        </div>
      </div>
      <div className="h-xl">
        <GoalTimeline contribs={contribs}></GoalTimeline>
      </div>
      <div className="flex">
        <div className="flex-1">
          <ContributionsList contribs={contribs}></ContributionsList>
        </div>
        <div className="flex-1"></div>
      </div>
    </div>
  );
}

function ContributionsList({ contribs }: { contribs: ContributionSummary[] }) {
  return (
    <div className="mt-3 divide-y divide-gray-100 text-gray-700">
      {contribs.map((cs: ContributionSummary) => {
        return (
          <div
            key={`ContribSummary-Item-${cs.id}`}
            className="flex pb-1 pt-1 md:pb-3 md:pt-3"
          >
            <div className="w-1/2 md:w-2/3">
              <span className="mr-1 block text-xs font-bold text-blue-400 md:inline-block">
                {cs.option_type}
              </span>
              {cs.option_symbol}
              <span className="mr-1 text-gray-400">@{cs.option_strike}</span>
              <span className="hidden text-gray-400 md:inline-block">
                ({fmtDate(cs.option_exp)})
              </span>
            </div>
            <div className="w-1/2 text-right md:w-1/3">
              <span className="text-gray-400">$</span>
              {fmtMoney(cs.amt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
