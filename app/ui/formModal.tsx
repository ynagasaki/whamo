import clsx from 'clsx';
import { mutate } from "swr";
import { useState } from "react";
import { createGoal, createOption } from "@/app/lib/actions";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export function InputFormModal() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="fixed inset-x-0 bottom-8 bg-white ml-12 mr-12 p-6 shadow-md border rounded-lg text-gray-700 z-20">
      <div className="flex">
        <div className="w-1/4 pr-6">
          <div className={clsx("p-3 cursor-pointer", { "font-bold": activeTab === 0 })} onClick={() => setActiveTab(0)} >
            Add Options
          </div>
          <div className={clsx("p-3 cursor-pointer border-t", { "font-bold": activeTab === 1 })} onClick={() => setActiveTab(1)}>
            Add Goals
          </div>
        </div>
        <div className="w-3/4 justify-center">
          {activeTab === 0 && <OptionForm />}
          {activeTab === 1 && <GoalForm />}
        </div>
        <div className="w-1/4"></div>
      </div>
    </div>
  );
}

function GoalForm() {
  return (
    <form action={async (formData: FormData) => {
      await createGoal(formData);
      mutate('/api/goals');
    }}>
      <div>
        <div className="inline-block mr-3">
          <label htmlFor="goal_title" className="block text-gray-400 text-xs mb-1">Title</label>
          <input type="text" id="goal_title" name="goal_title" placeholder="Buy a hamburger..." className="shadow appearance-none border rounded w-96 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="inline-block mr-3">
          <label htmlFor="goal_amt" className="block text-gray-400 text-xs mb-1">Amount</label>
          <input type="number" step="0.01" id="goal_amt" name="goal_amt" placeholder="100.00" className="shadow appearance-none border rounded w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
      </div>
      <div className="border-t mt-6 pt-3 text-right">
        <button type="submit" className="p-1 rounded w-24 border-2 border-blue-400 text-blue-400 font-bold">Add</button>
      </div>
    </form>
  );
}

function OptionForm() {
  const [showBtc, setShowBtc] = useState(false);

  return (
    <form action={async (formData: FormData) => {
      await createOption(formData);
      mutate('/api/options');
      mutate('/api/options/alloc');
    }}>
      <div>
        <div className="inline-block mr-3">
          <label htmlFor="option_type" className="block text-gray-400 text-xs mb-1">Type</label>
          <div className="inline-block relative w-32">
            <select className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline" id="option_type" name="option_type">
              <option value="CALL">Call</option>
              <option value="PUT">Put</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon />
            </div>
          </div>
        </div>
        <div className="inline-block mr-3">
          <label htmlFor="stock_symbol" className="block text-gray-400 text-xs mb-1">Symbol</label>
          <input type="text" id="stock_symbol" name="stock_symbol" placeholder="AMZN" className="uppercase shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="inline-block mr-3">
          <label htmlFor="strike_price" className="block text-gray-400 text-xs mb-1">Strike</label>
          <input type="number" step="0.01" id="strike_price" name="strike_price" placeholder="100" className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="inline-block">
          <label htmlFor="expiration_date" className="block text-gray-400 text-xs mb-1">Expiration</label>
          <input type="date" id="expiration_date" name="expiration_date" className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
      </div>
      <div className="border-t mt-6 relative">
        <input type="checkbox" id="action_sto" name="action_sto" checked disabled className="absolute right-0 top-4 rounded border-gray-400 opacity-50 cursor-not-allowed" />
        <label htmlFor="action_sto" className="block mt-3">Sold to Open</label>
        <div className="mt-3">
          <div className="inline-block mr-3">
            <label htmlFor="price_sto" className="block text-gray-400 text-xs mb-1">Price</label>
            <input type="number" step="0.01" id="price_sto" name="price_sto" placeholder="1.00" className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="inline-block mr-3">
            <label htmlFor="fee_sto" className="block text-gray-400 text-xs mb-1">Fee</label>
            <input type="number" step="0.01" id="fee_sto" name="fee_sto" placeholder="0.55" className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="inline-block mr-3">
            <label htmlFor="traded_date_sto" className="block text-gray-400 text-xs mb-1">Traded</label>
            <input type="date" id="traded_date_sto" name="traded_date_sto" className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
        </div>
      </div>
      <div className="border-t mt-6 relative">
        <input type="checkbox" id="action_btc" name="action_btc" onChange={(e) => setShowBtc(e.target.checked)} className="absolute right-0 top-4 rounded border-gray-400" />
        <label htmlFor="action_btc" className="block mt-3">Bought to Close</label>
        <div className={clsx("mt-3 pb-3", { "hidden": !showBtc })}>
          <div className="inline-block mr-3">
            <label htmlFor="price_btc" className="block text-gray-400 text-xs mb-1">Price</label>
            <input type="number" step="0.01" id="price_btc" name="price_btc" placeholder="1.00" className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="inline-block mr-3">
            <label htmlFor="fee_btc" className="block text-gray-400 text-xs mb-1">Fee</label>
            <input type="number" step="0.01" id="fee_btc" name="fee_btc" placeholder="0.55" className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="inline-block mr-3">
            <label htmlFor="traded_date_btc" className="block text-gray-400 text-xs mb-1">Traded</label>
            <input type="date" id="traded_date_btc" name="traded_date_btc" className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
        </div>
      </div>
      <div className="border-t mt-3 pt-3 text-right">
        <button type="submit" className="p-1 rounded w-24 border-2 border-purple-400 text-purple-400 font-bold">Add</button>
      </div>
    </form>
  );
}