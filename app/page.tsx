import { fetchOpenOptions, fetchGoals, fetchAllocatableOptions } from "./lib/data";
import { Suspense } from 'react';
import { AllocatableOption, Goal, Option } from './lib/model';
import { GoalCard } from './ui/goalCard';
import { fmtMoney, tenseExp } from "./lib/util";

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
            <AllocatableOptionsList />
          </Suspense>
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

async function AllocatableOptionsList() {
  const options = await fetchAllocatableOptions();
  return (
    <>
      {
        options.map((option: AllocatableOption) => {
          return (
            <div key={`AlloOptList-item-${option.id}`} className="bg-green-400 rounded-md p-3 flex text-white mb-3 shadow">
              <div className="flex-1">
                <span className="text-green-600">{option.otype}</span> {option.symbol} @ {option.strike}
                <span className="block text-green-200">{tenseExp(option)} {option.exp}</span>
              </div>
              <div className="flex-1 text-right text-xl">
                <span className="text-green-200">$</span><span className="font-bold">{fmtMoney(option.remaining_amt)}</span>
              </div>
            </div>
          );
        })
      }
    </>
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
              <span className="block text-gray-400">{tenseExp(option)} {option.exp}</span>
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
