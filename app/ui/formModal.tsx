import clsx from 'clsx';
import { mutate } from 'swr';
import { useState } from 'react';
import { createOption, upsertGoal } from '@/app/lib/actions';
import { Goal } from '@/app/lib/model';
import {
  ChevronDownIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/20/solid';
import { Taggy } from './taggy';

export function InputFormModal({
  editGoalData,
  postSubmitCallback,
}: {
  editGoalData?: Goal;
  postSubmitCallback?: () => void;
}) {
  const [activeTab, setActiveTab] = useState(!editGoalData ? 0 : 1);

  return (
    <div className="fixed inset-x-0 bottom-8 z-20 mx-4 rounded-lg border bg-white p-6 pt-3 text-gray-700 shadow-md md:mx-12">
      <div className="flex flex-wrap">
        <div className="w-full border-b pr-6 pt-0 md:w-1/4 md:border-0 md:pt-3">
          {!editGoalData && (
            <div
              className={clsx('inline-block cursor-pointer p-3 md:block', {
                'font-bold': activeTab === 0,
              })}
              onClick={() => setActiveTab(0)}
            >
              Add Options
            </div>
          )}
          {!editGoalData && (
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
          )}
          {!!editGoalData && (
            <div className="inline-block cursor-pointer p-3 font-bold md:block">
              Edit Goal
            </div>
          )}
        </div>
        <div className="w-full justify-center md:w-3/4">
          {activeTab === 0 && (
            <OptionForm postSubmitCallback={postSubmitCallback} />
          )}
          {activeTab === 1 && (
            <GoalForm
              editGoalData={editGoalData}
              postSubmitCallback={postSubmitCallback}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function GoalForm({
  editGoalData,
  postSubmitCallback,
}: {
  editGoalData?: Goal;
  postSubmitCallback?: () => void;
}) {
  const defaultSelectedTag = editGoalData?.category ?? -1;
  const [selectedTag, setSelectedTag] = useState(defaultSelectedTag);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <form
      action={async (formData: FormData) => {
        const result = await upsertGoal(formData);
        if (result.status === 'ok') {
          mutate('/api/goals');
          postSubmitCallback?.();
        } else {
          setErrorMessage(result.message ?? '');
        }
      }}
    >
      <div className="">
        <div className="mr-3 mt-3 inline-block align-top">
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
            defaultValue={editGoalData?.name}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>
        <div className="mr-3 mt-3 inline-block align-top">
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
            defaultValue={editGoalData ? editGoalData.amt / 100 : undefined}
            className="focus:shadow-outline w-40 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>
        <div className="mr-3 mt-3 inline-block align-top">
          <label
            htmlFor="goal_category"
            className="mb-1 block text-xs text-gray-400"
          >
            Category
          </label>
          <div className="">
            {[-1, 1, 2, 3, 4].map((tagId) => {
              return (
                <div
                  key={`taggy-option-${tagId}`}
                  className={clsx(
                    'mr-1 inline-block cursor-pointer leading-none',
                    {
                      'rounded-full border-2 border-indigo-600':
                        selectedTag === tagId,
                    },
                  )}
                  onClick={() => setSelectedTag(tagId)}
                >
                  <Taggy tagId={tagId} forceBorder displayMode="full" />
                </div>
              );
            })}
            <input
              type="hidden"
              id="goal_category"
              name="goal_category"
              value={selectedTag}
            />
            {editGoalData && (
              <input
                type="hidden"
                id="edit_goal_id"
                name="edit_goal_id"
                value={editGoalData.id}
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 flex border-t pt-3">
        <div className="w-2/3 md:w-3/4">
          {errorMessage && (
            <div>
              <ExclamationCircleIcon className="inline-block h-5 w-5 text-red-400" />
              <span className="border-b border-red-300 text-sm md:text-base">
                {errorMessage}
              </span>
            </div>
          )}
        </div>
        <div className="w-1/3 text-right md:w-1/4">
          <button
            type="submit"
            className="w-20 rounded border-2 border-blue-400 p-1 font-bold text-blue-400 hover:bg-blue-100 md:w-24"
          >
            {!editGoalData ? 'Add' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
}

function OptionForm({
  postSubmitCallback,
}: {
  postSubmitCallback?: () => void;
}) {
  const [showBtc, setShowBtc] = useState(false);

  return (
    <form
      action={async (formData: FormData) => {
        try {
          await createOption(formData);
          mutate('/api/options');
          mutate('/api/options/alloc');
          postSubmitCallback?.();
        } catch (err) {
          // TODO: show invalid erorr message
        }
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
        <div>
          <div className="mr-3 mt-3 inline-block">
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
          <div className="mr-3 mt-3 inline-block">
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
          <div className="mr-3 mt-3 inline-block">
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
        <div className={clsx('pb-3', { hidden: !showBtc })}>
          <div className="mr-3 mt-3 inline-block">
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
          <div className="mr-3 mt-3 inline-block">
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
          <div className="mr-3 mt-3 inline-block">
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
          className="w-20 rounded border-2 border-purple-400 p-1 font-bold text-purple-400 hover:bg-purple-100 md:w-24"
        >
          Add
        </button>
      </div>
    </form>
  );
}
