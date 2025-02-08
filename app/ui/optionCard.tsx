import dayjs from 'dayjs';
import { Option } from '../lib/model';
import { dday, ddayPct, fmtDate, fmtMoney, tenseExp } from '../lib/util';
import { CardProgressBar } from './widgets/cardProgressBar';

export function OptionCard({ option }: { option: Option }) {
  const expMarketStart = dayjs(new Date(option.traded)).add(9 * 60 + 30, 'minutes'); // set to 9:30 AM
  const expMarketClose = dayjs(new Date(option.exp)).add(
    16 * 60 + 30,
    'minutes',
  ); // set to 4:30 PM
  const pct = ddayPct(expMarketStart.toDate(), expMarketClose.toDate());

  return (
    <div className="relative mb-2 flex flex-wrap rounded-md bg-white p-3">
      <CardProgressBar idPrefix={`opt-${option.id}`} pct={Math.min(pct, 100)} />
      <div className="w-2/3">
        <span className="block text-gray-700">
          <div className="mr-1 block text-xs font-bold tracking-tight text-blue-400 md:inline-block md:tracking-normal">
            {option.otype}
          </div>
          <div className="block md:inline-block">
            {option.symbol}
            <span className="text-gray-400">@{option.strike}&nbsp;</span>
          </div>
        </span>
      </div>
      <div className="w-1/3 text-right">
        <div className="md:text-xl">
          <span className="text-green-200">$</span>
          <span className="text-green-400">
            {fmtMoney(option.price * 100 - option.fee)}
          </span>
        </div>
      </div>
      <div className="w-full md:w-2/3">
        <span className="text-gray-400">
          {tenseExp(option)} {fmtDate(option.exp)}
        </span>
      </div>
      <div className="hidden w-1/3 text-right md:block">
        <span className="text-purple-400">{dday(new Date(option.exp))}</span>
      </div>
      {/* <div className="absolute inset-x-0 bottom-0 cursor-pointer">
        <ChevronDownIcon className={clsx("transform w-6 text-gray-300 ml-auto mr-auto",
          {
            "rotate-180": false,
          }
        )} />
      </div> */}
    </div>
  );
}
