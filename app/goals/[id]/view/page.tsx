import { fetchContributions, fetchGoal } from '@/app/lib/data';
import { ContributionSummary } from '@/app/lib/model';
import { fmtDate, fmtMoney } from '@/app/lib/util';
import { GoalTimeline } from '@/app/ui/goalTimeline';
import { CheckIcon, PencilIcon, PlusIcon } from '@heroicons/react/20/solid';
import { updateGoal } from '@/app/lib/actions';
import Link from 'next/link';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: { edit: '1' | undefined };
}) {
  const id = Number((await params).id);
  const [goal, contribs] = await Promise.all([
    fetchGoal(id),
    fetchContributions(id),
  ]);
  const editMode = searchParams.edit === '1';

  return (
    <form action={updateGoal}>
      <div className="text-gray-700">
        {!editMode && (
          <div className="fixed bottom-0 bottom-3 left-0 right-0 z-30 ml-auto mr-auto h-10 w-10 cursor-pointer rounded-full bg-purple-400 p-2 text-white">
            <Link href={`/goals/${goal.id}/view?edit=1`}>
              <PencilIcon></PencilIcon>
            </Link>
          </div>
        )}
        {editMode && (
          <div className="fixed bottom-0 bottom-3 left-0 right-0 z-30 ml-auto mr-auto w-10">
            <div className="h-10 w-10 rotate-45 transform cursor-pointer rounded-full bg-gray-400 p-1 text-white">
              <Link href={`/goals/${goal.id}/view`}>
                <PlusIcon></PlusIcon>
              </Link>
            </div>
            <input
              type="hidden"
              id="goal_id"
              name="goal_id"
              value={`${goal.id}`}
            />
            <button
              type="submit"
              className="h-10 w-10 cursor-pointer rounded-full bg-blue-400 p-1 text-white"
            >
              <CheckIcon></CheckIcon>
            </button>
          </div>
        )}
        <div className="flex">
          <div className="w-3/4">
            {!editMode && (
              <span className="inline-block text-2xl">{goal.name}</span>
            )}
            {editMode && (
              <input
                type="text"
                id="goal_title"
                name="goal_title"
                defaultValue={`${goal.name}`}
                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              />
            )}
            <span className="block">Created {fmtDate(goal.created)}</span>
          </div>
          <div className="w-1/4 text-right">
            <span className="block text-2xl">${fmtMoney(goal.curr_amt)}</span>
            {!editMode && <span className="block">${fmtMoney(goal.amt)}</span>}
            {editMode && (
              <input
                type="number"
                step="0.01"
                id="goal_amt"
                name="goal_amt"
                defaultValue={`${goal.amt / 100}`}
                className="focus:shadow-outline w-40 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              />
            )}
          </div>
        </div>
        <div className="h-xl mb-3 mt-3 rounded-md bg-white p-3">
          <GoalTimeline contribs={contribs}></GoalTimeline>
        </div>
        <div className="flex">
          <div className="flex-1">
            <ContributionsList contribs={contribs}></ContributionsList>
          </div>
          <div className="flex-1"></div>
        </div>
      </div>
    </form>
  );
}

function ContributionsList({ contribs }: { contribs: ContributionSummary[] }) {
  return (
    <div className="divide-y divide-gray-100 text-gray-700">
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
