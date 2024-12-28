import clsx from 'clsx';
import { mutate } from 'swr';
import { useState } from 'react';
import { createGoal, createOption } from '@/app/lib/actions';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export function InputFormModal() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="fixed inset-x-0 bottom-8 z-20 mx-4 rounded-lg border bg-white p-6 pt-3 text-gray-700 shadow-md md:mx-12">
      <div className="flex flex-wrap">
        <div className="w-full border-b pr-6 pt-0 md:w-1/4 md:border-0 md:pt-3">
          <div
            className={clsx('inline-block cursor-pointer p-3 md:block', {
              'font-bold': activeTab === 0,
            })}
            onClick={() => setActiveTab(0)}
          >
            Add Options
          </div>
          <div
            className={clsx(
              'inline-block cursor-pointer border-l p-3 md:block md:border-l-0 md:border-t',
              {
                'font-bold': activeTab === 1,
              },
            )}
            onClick={() => setActiveTab(1)}
          >
            Add Goals
          </div>
        </div>
        <div className="w-full justify-center md:w-3/4">
          {activeTab === 0 && <OptionForm />}
          {activeTab === 1 && <GoalForm />}
        </div>
      </div>
    </div>
  );
}

function GoalForm() {
  return (
    <form
      action={async (formData: FormData) => {
        await createGoal(formData);
        mutate('/api/goals');
      }}
    >
      <div>
        <div className="mr-3 mt-3 inline-block">
          <label
            htmlFor="goal_title"
            className="mb-1 block text-xs text-gray-400"
          >
            Title
          </label>
          <input
            type="text"
            id="goal_title"
            name="goal_title"
            placeholder="Buy a hamburger..."
            className="focus:shadow-outline w-96 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>
        <div className="mr-3 mt-3 inline-block">
          <label
            htmlFor="goal_amt"
            className="mb-1 block text-xs text-gray-400"
          >
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            id="goal_amt"
            name="goal_amt"
            placeholder="100.00"
            className="focus:shadow-outline w-40 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-6 border-t pt-3 text-right">
        <button
          type="submit"
          className="w-24 rounded border-2 border-blue-400 p-1 font-bold text-blue-400"
        >
          Add
        </button>
      </div>
    </form>
  );
}

function OptionForm() {
  const [showBtc, setShowBtc] = useState(false);

  return (
    <form
      action={async (formData: FormData) => {
        await createOption(formData);
        mutate('/api/options');
        mutate('/api/options/alloc');
      }}
    >
      <div>
        <div className="mr-3 mt-3 inline-block">
          <label
            htmlFor="option_type"
            className="mb-1 block text-xs text-gray-400"
          >
            Type
          </label>
          <div className="relative inline-block w-32">
            <select
              className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none"
              id="option_type"
              name="option_type"
            >
              <option value="CALL">Call</option>
              <option value="PUT">Put</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon />
            </div>
          </div>
        </div>
        <div className="mr-3 mt-3 inline-block">
          <label
            htmlFor="stock_symbol"
            className="mb-1 block text-xs text-gray-400"
          >
            Symbol
          </label>
          <input
            type="text"
            id="stock_symbol"
            name="stock_symbol"
            placeholder="AMZN"
            className="focus:shadow-outline w-32 appearance-none rounded border px-3 py-2 uppercase leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>
        <div className="mr-3 mt-3 inline-block">
          <label
            htmlFor="strike_price"
            className="mb-1 block text-xs text-gray-400"
          >
            Strike
          </label>
          <input
            type="number"
            step="0.01"
            id="strike_price"
            name="strike_price"
            placeholder="100"
            className="focus:shadow-outline w-32 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>
        <div className="mt-3 inline-block">
          <label
            htmlFor="expiration_date"
            className="mb-1 block text-xs text-gray-400"
          >
            Expiration
          </label>
          <input
            type="date"
            id="expiration_date"
            name="expiration_date"
            className="focus:shadow-outline w-32 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>
      </div>
      <div className="relative mt-6 border-t">
        <input
          type="checkbox"
          id="action_sto"
          name="action_sto"
          checked
          disabled
          className="absolute right-0 top-4 cursor-not-allowed rounded border-gray-400 opacity-50"
        />
        <label htmlFor="action_sto" className="mt-3 block">
          Sold to Open
        </label>
        <div className="mt-3">
          <div className="mr-3 inline-block">
            <label
              htmlFor="price_sto"
              className="mb-1 block text-xs text-gray-400"
            >
              Price
            </label>
            <input
              type="number"
              step="0.01"
              id="price_sto"
              name="price_sto"
              placeholder="1.00"
              className="focus:shadow-outline w-32 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
          <div className="mr-3 inline-block">
            <label
              htmlFor="fee_sto"
              className="mb-1 block text-xs text-gray-400"
            >
              Fee
            </label>
            <input
              type="number"
              step="0.01"
              id="fee_sto"
              name="fee_sto"
              placeholder="0.55"
              className="focus:shadow-outline w-32 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
          <div className="mr-3 inline-block">
            <label
              htmlFor="traded_date_sto"
              className="mb-1 block text-xs text-gray-400"
            >
              Traded
            </label>
            <input
              type="date"
              id="traded_date_sto"
              name="traded_date_sto"
              className="focus:shadow-outline w-32 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div className="relative mt-6 border-t">
        <input
          type="checkbox"
          id="action_btc"
          name="action_btc"
          onChange={(e) => setShowBtc(e.target.checked)}
          className="absolute right-0 top-4 rounded border-gray-400"
        />
        <label htmlFor="action_btc" className="mt-3 block">
          Bought to Close
        </label>
        <div className={clsx('mt-3 pb-3', { hidden: !showBtc })}>
          <div className="mr-3 inline-block">
            <label
              htmlFor="price_btc"
              className="mb-1 block text-xs text-gray-400"
            >
              Price
            </label>
            <input
              type="number"
              step="0.01"
              id="price_btc"
              name="price_btc"
              placeholder="1.00"
              className="focus:shadow-outline w-32 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
          <div className="mr-3 inline-block">
            <label
              htmlFor="fee_btc"
              className="mb-1 block text-xs text-gray-400"
            >
              Fee
            </label>
            <input
              type="number"
              step="0.01"
              id="fee_btc"
              name="fee_btc"
              placeholder="0.55"
              className="focus:shadow-outline w-32 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
          <div className="mr-3 inline-block">
            <label
              htmlFor="traded_date_btc"
              className="mb-1 block text-xs text-gray-400"
            >
              Traded
            </label>
            <input
              type="date"
              id="traded_date_btc"
              name="traded_date_btc"
              className="focus:shadow-outline w-32 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div className="mt-3 border-t pt-3 text-right">
        <button
          type="submit"
          className="w-24 rounded border-2 border-purple-400 p-1 font-bold text-purple-400"
        >
          Add
        </button>
      </div>
    </form>
  );
}
