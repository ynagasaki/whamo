import { useState } from 'react';
import { mutate } from 'swr';
import { createOption } from '@/app/lib/actions';
import {
  ChevronDownIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/20/solid';
import { Option } from '@/app/lib/model';
import clsx from 'clsx';

export function OptionForm({
  editData,
  postSubmitCallback,
}: {
  editData?: Option;
  postSubmitCallback?: () => void;
}) {
  const [showBtc, setShowBtc] = useState(!!editData);
  const [errorMessage, setErrorMessage] = useState('');
  const showSto = !editData;

  return (
    <form
      action={async (formData: FormData) => {
        const status = await createOption(formData);
        if (status.status === 'ok') {
          mutate('/api/options');
          mutate('/api/options/alloc');
          postSubmitCallback?.();
        } else {
          setErrorMessage(status.message ?? '');
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
              defaultValue={editData?.otype}
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
            defaultValue={editData?.symbol}
            readOnly={!!editData}
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
            defaultValue={editData?.strike}
            readOnly={!!editData}
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
            defaultValue={editData?.exp}
            readOnly={!!editData}
            className="focus:shadow-outline w-32 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>
      </div>
      <div
        className={clsx('relative mt-3 border-t md:mt-6', {
          hidden: !!editData,
        })}
      >
        <input
          type="checkbox"
          defaultChecked={showSto}
          disabled
          className="absolute right-0 top-3 cursor-not-allowed rounded border-gray-400 opacity-50 md:top-4"
        />
        <input
          type="hidden"
          id="action_sto"
          name="action_sto"
          value={showSto ? 1 : 0}
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
              defaultValue={editData?.price}
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
              defaultValue={editData?.fee}
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
              defaultValue={editData?.traded}
              className="focus:shadow-outline w-32 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div className="relative mt-3 border-t md:mt-6">
        {!editData && (
          <input
            type="checkbox"
            onChange={(e) => setShowBtc(e.target.checked)}
            className="absolute right-0 top-3 rounded border-gray-400 md:top-4"
          />
        )}
        <input
          type="hidden"
          id="action_btc"
          name="action_btc"
          value={showBtc ? 1 : 0}
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
      <div className="mt-2 flex border-t pt-3 md:mt-3">
        <div className="w-2/3 md:w-3/4">
          {errorMessage && (
            <div className="leading-tight">
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
            className="w-20 rounded border-2 border-purple-400 p-1 font-bold text-purple-400 hover:bg-purple-100 md:w-24"
          >
            {!editData ? 'Add' : 'Save'}
          </button>
        </div>
      </div>
      {editData && (
        <input
          type="hidden"
          id="closed_option_id"
          name="closed_option_id"
          value={editData.id}
        />
      )}
    </form>
  );
}
