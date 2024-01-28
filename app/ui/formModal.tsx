import clsx from 'clsx';
import { mutate } from "swr";
import { useState } from "react";
import { createGoal, createOption } from "@/app/lib/actions";
import { Option, OptionType } from "@/app/lib/model";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export function InputFormModal({ optionFormPrefill, onSubmitted }: { optionFormPrefill?: Option, onSubmitted?: () => void }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="fixed inset-x-0 bottom-8 bg-white ml-12 mr-12 p-6 shadow-md border rounded-lg z-20">
      <div className="flex">
        <div className="w-1/4 pr-6">
          <div className={clsx("p-3 cursor-pointer", { "font-bold": activeTab === 0, "hidden": !!optionFormPrefill })} onClick={() => setActiveTab(0)} >
            Add Options
          </div>
          <div className={clsx("p-3 cursor-pointer border-t", { "font-bold": activeTab === 1, "hidden": !!optionFormPrefill })} onClick={() => setActiveTab(1)}>
            Add Goals
          </div>
        </div>
        <div className="w-3/4 justify-center">
          {activeTab === 0 && <OptionForm prefill={optionFormPrefill} onSubmitted={onSubmitted} />}
          {activeTab === 1 && <GoalForm onSubmitted={onSubmitted} />}
        </div>
        <div className="w-1/4"></div>
      </div>
    </div>
  );
}

function GoalForm({ onSubmitted }: { onSubmitted?: () => void }) {
  return (
    <form action={async (formData: FormData) => {
      await createGoal(formData);
      mutate('/api/goals');
      onSubmitted?.();
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

interface FormState {
  option_type: OptionType,
  stock_symbol?: string,
  strike_price?: number,
  expiration_date?: string,
  action_sto: boolean,
  price_sto?: number,
  fee_sto?: number,
  traded_date_sto?: string,
  closing_option_id?: number,
  action_btc: boolean,
  price_btc?: number,
  fee_btc?: number,
  traded_date_btc?: string,
}

function OptionForm({ prefill, onSubmitted }: { prefill?: Option, onSubmitted?: () => void }) {
  const [formState, setFormState] = useState<FormState>({
    option_type: "CALL",
    action_sto: true,
    action_btc: false,
  });

  // This gross code detects when opening the form from a BTC button
  // when it was already open and potentially contains other data. This
  // forces it to use the prefill option data, based on that option's ID.
  if (!!prefill && formState.closing_option_id !== prefill.id) {
    setFormState({
      option_type: prefill.otype,
      stock_symbol: prefill.symbol,
      strike_price: prefill.strike,
      expiration_date: prefill.exp,
      action_sto: false,
      action_btc: true,
      closing_option_id: prefill.id,
    });
  }

  return (
    <form action={async (formData: FormData) => {
      await createOption(formData);
      mutate('/api/options');
      mutate('/api/options/alloc');
      onSubmitted?.();
    }}>
      <div>
        <div className="inline-block mr-3">
          <label htmlFor="option_type" className="block text-gray-400 text-xs mb-1">Type</label>
          <div className="inline-block relative w-32">
            <select
              disabled={!!prefill}
              className={clsx("block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline", { "cursor-not-allowed": !!prefill })}
              id="option_type"
              name="option_type"
              value={formState.option_type}
              onChange={(e) => setFormState({ ...formState, option_type: e.target.value === "CALL" ? "CALL" : "PUT" })}>
              <option value="CALL">Call</option>
              <option value="PUT">Put</option>
            </select>
            <input type="hidden" name="option_type" defaultValue={prefill?.otype || "CALL"} />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDownIcon />
            </div>
          </div>
        </div>
        <div className="inline-block mr-3">
          <label htmlFor="stock_symbol" className="block text-gray-400 text-xs mb-1">Symbol</label>
          <input
            type="text"
            id="stock_symbol"
            name="stock_symbol"
            placeholder="AMZN"
            readOnly={!!prefill}
            value={formState.stock_symbol ?? ""}
            onChange={(e) => setFormState({ ...formState, stock_symbol: e.target.value })}
            className={clsx("uppercase shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", { "cursor-not-allowed": !!prefill })} />
        </div>
        <div className="inline-block mr-3">
          <label htmlFor="strike_price" className="block text-gray-400 text-xs mb-1">Strike</label>
          <input
            type="number"
            step="0.01"
            id="strike_price"
            name="strike_price"
            placeholder="100"
            readOnly={!!prefill}
            value={formState.strike_price ?? ""}
            onChange={(e) => setFormState({ ...formState, strike_price: Number.parseFloat(e.target.value) })}
            className={clsx("shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", { "cursor-not-allowed": !!prefill })} />
        </div>
        <div className="inline-block">
          <label htmlFor="expiration_date" className="block text-gray-400 text-xs mb-1">Expiration</label>
          <input
            type="date"
            id="expiration_date"
            name="expiration_date"
            readOnly={!!prefill}
            value={formState.expiration_date ?? ""}
            onChange={(e) => setFormState({ ...formState, expiration_date: e.target.value })}
            className={clsx("shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", { "cursor-not-allowed": !!prefill })} />
        </div>
      </div>
      <div className={clsx("border-t mt-6 relative", { "hidden": !!prefill })}>
        <input
          type="checkbox"
          id="action_sto"
          name="action_sto"
          disabled={true}
          checked={formState.action_sto}
          onChange={(e) => setFormState({ ...formState, action_sto: e.target.checked })}
          className="absolute right-0 top-4 rounded border-gray-400 opacity-50 cursor-not-allowed" />
        <input type="hidden" name="action_sto" value={formState.action_sto ? 1 : 0} readOnly />
        <label htmlFor="action_sto" className="block mt-3">Sold to Open</label>
        <div className="mt-3">
          <div className="inline-block mr-3">
            <label htmlFor="price_sto" className="block text-gray-400 text-xs mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              id="price_sto"
              name="price_sto"
              placeholder="1.00"
              value={formState.price_sto ?? ""}
              onChange={(e) => setFormState({ ...formState, price_sto: Number.parseFloat(e.target.value) })}
              className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="inline-block mr-3">
            <label htmlFor="fee_sto" className="block text-gray-400 text-xs mb-1">Fee</label>
            <input
              type="number"
              step="0.01"
              id="fee_sto"
              name="fee_sto"
              placeholder="0.55"
              value={formState.fee_sto ?? ""}
              onChange={(e) => setFormState({ ...formState, fee_sto: Number.parseFloat(e.target.value) })}
              className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="inline-block mr-3">
            <label htmlFor="traded_date_sto" className="block text-gray-400 text-xs mb-1">Traded</label>
            <input
              type="date"
              id="traded_date_sto"
              name="traded_date_sto"
              value={formState.traded_date_sto ?? ""}
              onChange={(e) => setFormState({ ...formState, traded_date_sto: e.target.value })}
              className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
        </div>
      </div>
      <div className="border-t mt-6 relative">
        {/* This is the ID of the option that we are buying to close. */}
        <input type="hidden" id="closing_option_id" name="closing_option_id" value={formState.closing_option_id ?? ""} readOnly />
        <input
          type="checkbox"
          id="action_btc"
          name="action_btc"
          checked={formState.action_btc}
          onChange={(e) => setFormState({ ...formState, action_btc: e.target.checked })}
          disabled={!!prefill}
          className={clsx("absolute right-0 top-4 rounded border-gray-400", { "cursor-not-allowed": !!prefill })} />
        <input type="hidden" name="action_btc" value={formState.action_btc ? 1 : 0} readOnly />
        <label htmlFor="action_btc" className="block mt-3">Bought to Close</label>
        <div className={clsx("mt-3 pb-3", { "hidden": !formState.action_btc })}>
          <div className="inline-block mr-3">
            <label htmlFor="price_btc" className="block text-gray-400 text-xs mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              id="price_btc"
              name="price_btc"
              placeholder="1.00"
              value={formState.price_btc ?? ""}
              onChange={(e) => setFormState({ ...formState, price_btc: Number.parseFloat(e.target.value) })}
              className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="inline-block mr-3">
            <label htmlFor="fee_btc" className="block text-gray-400 text-xs mb-1">Fee</label>
            <input
              type="number"
              step="0.01"
              id="fee_btc"
              name="fee_btc"
              placeholder="0.55"
              value={formState.fee_btc ?? ""}
              onChange={(e) => setFormState({ ...formState, fee_btc: Number.parseFloat(e.target.value) })}
              className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="inline-block mr-3">
            <label htmlFor="traded_date_btc" className="block text-gray-400 text-xs mb-1">Traded</label>
            <input
              type="date"
              id="traded_date_btc"
              name="traded_date_btc"
              value={formState.traded_date_btc ?? ""}
              onChange={(e) => setFormState({ ...formState, traded_date_btc: e.target.value })}
              className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
        </div>
      </div>
      <div className="border-t mt-3 pt-3 text-right">
        <button type="submit" className="p-1 rounded w-24 border-2 border-purple-400 text-purple-400 font-bold">Add</button>
      </div>
    </form>
  );
}