import { useState } from 'react';
import { mutate } from 'swr';
import { createOption } from '@/app/lib/actions';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

export function OptionForm({
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
        <div className="mr-3 mt-2 inline-block md:mt-3">
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
        <div className="mr-3 mt-2 inline-block md:mt-3">
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
        <div className="mr-3 mt-2 inline-block md:mt-3">
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
        <div className="mt-2 inline-block md:mt-3">
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
      <div className="relative mt-3 border-t md:mt-6">
        <input
          type="checkbox"
          id="action_sto"
          name="action_sto"
          checked
          disabled
          className="absolute right-0 top-3 cursor-not-allowed rounded border-gray-400 opacity-50 md:top-4"
        />
        <label htmlFor="action_sto" className="mt-2 block md:mt-3">
          Sold to Open
        </label>
        <div>
          <div className="mr-3 mt-2 inline-block md:mt-3">
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
          <div className="mr-3 mt-2 inline-block md:mt-3">
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
          <div className="mr-3 mt-2 inline-block md:mt-3">
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
      <div className="relative mt-3 border-t md:mt-6">
        <input
          type="checkbox"
          id="action_btc"
          name="action_btc"
          onChange={(e) => setShowBtc(e.target.checked)}
          className="absolute right-0 top-3 rounded border-gray-400 md:top-4"
        />
        <label htmlFor="action_btc" className="mt-2 block md:mt-3">
          Bought to Close
        </label>
        <div className={clsx('pb-2 md:pb-3', { hidden: !showBtc })}>
          <div className="mr-3 mt-2 inline-block md:mt-3">
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
          <div className="mr-3 mt-2 inline-block md:mt-3">
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
          <div className="mr-3 mt-2 inline-block md:mt-3">
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
      <div className="mt-2 border-t pt-3 text-right md:mt-3">
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
