import { fetchOpenOptions, fetchGoals } from "./lib/data";
import { Suspense } from 'react';
import { Goal, Option } from './lib/model';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <p>
        whamo :)
      </p>
      <Suspense>
        <OptionsList></OptionsList>
      </Suspense>
      <Suspense>
        <GoalsList></GoalsList>
      </Suspense>
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
            <div key={`OptionList-item-${option.id}`}>
              {option.symbol} @{option.strike} expires {option.exp}
            </div >
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
            <div key={`GoalsList-item-${goal.id}`}>
              {goal.name} @{goal.amt} so far: {goal.curr_amt} ({Math.round(goal.curr_amt / goal.amt * 100)}%)
            </div >
          );
        })
      }
    </>
  )
}
