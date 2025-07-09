import dayjs from 'dayjs';
import { Option } from '../lib/model';
import { dday, ddayPct, fmtDate, fmtMoney, tenseExp } from '../lib/util';
import { CardProgressBar } from './widgets/cardProgressBar';

export function OptionCard({
  option,
  progressStartDate,
  editOptionCallback,
}: {
  option: Option;
  progressStartDate: string | undefined;
  editOptionCallback: (option: Option) => void;
}) {
  const progressStart = new Date(progressStartDate ?? option.traded);
  const expMarketStart = dayjs(progressStart).add(9 * 60 + 30, 'minutes'); // set to 9:30 AM
  const expMarketClose = dayjs(new Date(option.exp)).add(16 * 60, 'minutes'); // set to 4:00 PM
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
            <span
              className="border-dotted border-gray-300 text-gray-700 hover:cursor-pointer hover:border-b-2"
              onClick={() => editOptionCallback(option)}
            >
              {option.symbol}
              <span className="text-gray-400">@{option.strike}</span>
            </span>
          </div>
        </span>
      </div>
      <div className="w-1/3 text-right">
        <div className="absolute right-0 top-0 mr-3 mt-3 md:relative md:m-0 md:text-xl">
          {/* <span className="text-green-200">$</span> */}
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
    </div>
  );
}
