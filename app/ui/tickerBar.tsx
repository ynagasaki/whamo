import useSWR from 'swr';
import { fetcher } from '@/app/lib/util';
import { StockInfo } from '@/app/lib/model';
import dayjs from 'dayjs';

export function TickerBar() {
  const { data, error } = useSWR(`/api/options/market?dtype=stock`, fetcher);

  if (!data || error) {
    return <span className="hidden"></span>;
  }

  const tickers: StockInfo[] = data.stocks;

  if (tickers.length === 0) {
    return <span className="hidden"></span>;
  }

  return (
    <div className="mx-4 mb-2 flex flex-wrap text-gray-700">
      <>
        {tickers.map((t) => {
          return (
            <TickerCard key={`ticker-card-${t.symbol}`} ticker={t}></TickerCard>
          );
        })}
      </>
    </div>
  );
}

function TickerCard({ ticker }: { ticker: StockInfo }) {
  return (
    <div className="w-1/2 pr-2 md:w-1/4">
      <div className="flex rounded-md bg-white p-3">
        <div className="w-1/2">
          <span className="block text-sm">{ticker.symbol}</span>
          <span className="block text-xl">{ticker.price}</span>
          <span className="block text-xs text-gray-400">
            {dayjs(ticker.last_updated).format('MMM DD HH:mm')}
          </span>
        </div>
        <div className="w-1/2">&nbsp;</div>
      </div>
    </div>
  );
}
