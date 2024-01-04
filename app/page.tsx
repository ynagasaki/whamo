import { fetchOpenOptions, fetchGoals, fetchAllocatableOptions } from "./lib/data";
import { Suspense } from 'react';
import { AllocatableOption, Goal, Option } from './lib/model';
import { GoalCard } from './ui/goalCard';
import { fmtMoney, tenseExp } from "./lib/util";
import { createOption } from "./lib/actions";

export default function Page() {
  return (
    <main className="bg-gray-100 min-h-screen flex flex-col">
      <div className="p-4">
        <span className="text-gray-600">
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
      <div className="absolute inset-x-0 bottom-0 bg-white ml-12 mr-12 p-3 shadow-md">
        <h2>Sold to Open</h2>
        <form action={createOption}>
          <div>
            <label htmlFor="option_type">Type:</label>
            <select id="option_type" name="option_type">
              <option value="CALL">Call</option>
              <option value="PUT">Put</option>
            </select>

            <label htmlFor="stock_symbol">Symbol:</label>
            <input type="text" id="stock_symbol" name="stock_symbol" />

            <label htmlFor="strike_price">Strike:</label>
            <input type="number" id="strike_price" name="strike_price" />

            <label htmlFor="expiration_date">Expiration:</label>
            <input type="date" id="expiration_date" name="expiration_date" />
          </div>
          <div>
            <label htmlFor="price">Price:</label>
            <input type="number" step="0.01" id="price" name="price" />

            <label htmlFor="fee">Fee:</label>
            <input type="number" step="0.01" id="fee" name="fee" />

            <label htmlFor="traded_date">Traded:</label>
            <input type="date" id="traded_date" name="traded_date" />
          </div>
          <div>
            <button>Save</button>
          </div>
        </form>
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
