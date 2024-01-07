import clsx from 'clsx';
import { useState } from "react";
import { createOption } from "../lib/actions";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/20/solid";

export function OptionForm({ dismissHandler }: { dismissHandler: () => void }) {
  const [showBtc, setShowBtc] = useState(false);

  return (
    <div className="absolute inset-x-0 bottom-8 bg-white ml-12 mr-12 p-3 shadow-md border rounded-lg text-gray-700">
      <button onClick={dismissHandler} className="absolute right-3 p-1 rounded border text-gray-400">
        <XMarkIcon className="h-6 w-6 inline-block align-top" />Close
      </button>
      <div className="flex justify-center">
        <div className="bg-gray-100 pr-3 pl-3 mr-3">
          tabs go here
        </div>
        <form action={createOption}>
          <div className="mt-3">
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
              <input type="number" id="strike_price" name="strike_price" placeholder="100" className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
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
                <label htmlFor="price" className="block text-gray-400 text-xs mb-1">Price</label>
                <input type="number" step="0.01" id="price" name="price" placeholder="1.00" className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div className="inline-block mr-3">
                <label htmlFor="fee" className="block text-gray-400 text-xs mb-1">Fee</label>
                <input type="number" step="0.01" id="fee" name="fee" placeholder="0.55" className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div className="inline-block mr-3">
                <label htmlFor="traded_date" className="block text-gray-400 text-xs mb-1">Traded</label>
                <input type="date" id="traded_date" name="traded_date" className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
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
          <div className="border-t mt-3 pt-3 pb-3 text-right">
            <button type="submit" className="p-1 rounded w-24 border-2 border-purple-400 text-purple-400 font-bold">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}