import useSWR from 'swr';
import { fetcher } from '@/app/lib/util';
import { Option, StockInfo } from '@/app/lib/model';
import dayjs from 'dayjs';
import clsx from 'clsx';

export function TickerBar() {
  const { data, error } = useSWR(
    `/api/options/market?dtype=stock&inc=option`,
    fetcher,
  );

  if (!data || error) {
    return <span className="hidden"></span>;
  }

  const tickers: StockInfo[] = data.stocks;
  const options: Option[] = data.options;

  if (tickers.length === 0) {
    return <span className="hidden"></span>;
  }

  return (
    <div className="mx-4 mb-2 flex flex-wrap text-gray-700">
      <>
        {tickers.map((t) => {
          return (
            <TickerCard
              key={`ticker-card-${t.symbol}`}
              ticker={t}
              options={options.filter((o) => o.symbol === t.symbol)}
            ></TickerCard>
          );
        })}
      </>
    </div>
  );
}

function TickerCard({
  ticker,
  options,
}: {
  ticker: StockInfo;
  options: Option[];
}) {
  const counts = new Map<string, number>();
  const sortedOptions = options.toSorted((o1, o2) => {
    if (o1.otype === o2.otype) {
      return o1.strike - o2.strike;
    }
    if (o1.otype === 'CALL') {
      return -1;
    }
    return 1;
  }).reduce((prev, curr) => {
    const key = `${curr.otype}-${curr.strike}`;
    if (prev.length > 0 && prev[prev.length - 1].strike === curr.strike && prev[prev.length - 1].otype === curr.otype) {
      const c = counts.get(key) ?? 0;
      counts.set(key, c + 1);
      return prev;
    }
    counts.set(key, 1);
    prev.push(curr);
    return prev;
  }, new Array<Option>());

  return (
    <div className="w-1/2 pr-2 md:w-1/4">
      <div className="flex rounded-md bg-white p-3">
        <div className="w-1/2">
          <span className="block text-sm">{ticker.symbol}</span>
          <span className="block text-xl">
            {Math.round(ticker.price * 100) / 100}
          </span>
          <span className="block text-xs text-gray-400">
            {dayjs(ticker.last_updated).format('MM-DD HH:mm')}
          </span>
        </div>
        <div className="h-16 w-1/2 overflow-y-auto">
          <>
            {sortedOptions.map((option) => {
              const itm =
                (option.otype === 'CALL' && ticker.price >= option.strike) ||
                (option.otype === 'PUT' && ticker.price <= option.strike);
              const count = counts.get(`${option.otype}-${option.strike}`);

              return (
                <span
                  key={`opt-strike-${option.otype}-${option.symbol}-${option.strike}`}
                  className={clsx('block px-2 text-sm', {
                    'bg-yellow-200 text-yellow-600': itm,
                  })}
                >
                  <span className="text-xs font-bold">
                    {option.otype.charAt(0)}-
                  </span>
                  {option.strike}
                  {count && count > 1 && <span className={clsx("text-xs", {
                    "text-gray-400": !itm,
                    "text-yellow-500": itm,
                  })}>&nbsp;x{count}</span>}
                </span>
              );
            })}
          </>
        </div>
      </div>
    </div>
  );
}
