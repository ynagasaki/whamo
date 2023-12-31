import { fetchOpenOptions, fetchGoals } from "./lib/data";
import { Suspense } from 'react';
import { Goal, Option } from './lib/model';
import { GoalCard } from './ui/goalCard';

export default function Page() {
  return (
    <main className="bg-gray-100 min-h-screen flex flex-col">
      <div className="p-4">
        <span className="inline-block rounded text-gray-600">
          whamo&nbsp;
          <span className="text-purple-400">:)</span>
        </span>
      </div>
      <div className="grid grid-cols-2">
        <div className="p-4">
          <Suspense>
            <OptionsList></OptionsList>
          </Suspense>
        </div>
        <div className="p-4">
          <Suspense>
            <GoalsList></GoalsList>
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function OptionsList() {
  const openOptions = await fetchOpenOptions();
  return (
    <>
      {
        openOptions.map((option: Option) => {
          return (
            <div key={`OptionList-item-${option.id}`} className="bg-white rounded-md p-3">
              <span className="block text-gray-700">
                <span className="text-blue-400">{option.otype}</span> {option.symbol} @ {option.strike}
              </span>
              <span className="block text-gray-400">expires {new Date(option.exp).toDateString()}</span>
            </div>
          );
        })
      }
    </>
  );
}

async function GoalsList() {
  const goals = await fetchGoals();
  return (
    <>
      {
        goals.map((goal: Goal) => {
          return (
            <GoalCard key={`GoalsList-item-${goal.id}`} goal={goal}></GoalCard>
          );
        })
      }
    </>
  )
}
