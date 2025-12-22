import useSWR from 'swr';
import { fetcher } from '@/app/lib/util';
import { Option, OptionType } from '@/app/lib/model';
import { useState } from 'react';
import { EyeSlashIcon, EyeIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';

export interface OptionFilter {
  otype: OptionType;
  symbol: string;
  instanceCount: number;
}

type FilterLike = { otype: OptionType; symbol: string };
type ExcludeFilterCallback = (filter: OptionFilter, add: boolean) => void;

export function matchesFilterLike(f1: FilterLike, f2: FilterLike): boolean {
  return f1.otype === f2.otype && f1.symbol === f2.symbol;
}

export function filtersContain(
  filters: OptionFilter[],
  filterLike: FilterLike,
): boolean {
  return !!filters.find((f) => matchesFilterLike(f, filterLike));
}

export function FilterOptionsBar({
  setExcludeFilter,
}: {
  setExcludeFilter: ExcludeFilterCallback;
}) {
  const { data, error } = useSWR(`/api/options`, fetcher);

  if (error) {
    return <span className="hidden"></span>;
  }
  if (!data) {
    return <span className="hidden"></span>;
  }

  const options = data.options as Option[];
  const filters: OptionFilter[] = options.reduce((prev, curr) => {
    const existingFilter = prev.find(
      (item) => item.otype === curr.otype && item.symbol === curr.symbol,
    );
    if (!existingFilter) {
      prev.push({ otype: curr.otype, symbol: curr.symbol, instanceCount: 1 });
    } else {
      existingFilter.instanceCount = existingFilter.instanceCount + 1;
    }
    return prev;
  }, [] as OptionFilter[]);

  if (filters.length <= 1) {
    return <span className="hidden"></span>;
  }

  return (
    <div className="mb-2 flex flex-nowrap overflow-x-auto px-4">
      <>
        {filters.map((filter) => {
          return (
            <FilterOptionButton
              key={`opt-filter-${filter.otype}-${filter.symbol}`}
              item={filter}
              setExcludeFilter={setExcludeFilter}
            ></FilterOptionButton>
          );
        })}
      </>
    </div>
  );
}

function FilterOptionButton({
  item,
  setExcludeFilter,
}: {
  item: OptionFilter;
  setExcludeFilter: ExcludeFilterCallback;
}) {
  const [enabled, setEnabled] = useState(false);

  return (
    <button
      className={clsx(
        'mr-2 inline-block flex flex-nowrap rounded-full border ' +
          'border-gray-200 p-2 text-xs tracking-tight text-gray-700 md:text-sm md:tracking-normal',
        {
          'bg-gray-200': !enabled,
          'border-gray-300': enabled,
        },
      )}
      onClick={() => {
        const toggle = !enabled;
        setEnabled(toggle);
        setExcludeFilter(item, toggle);
      }}
    >
      {!enabled && (
        <EyeIcon className="mb-1 mr-1 inline-block h-4 w-4 text-gray-400"></EyeIcon>
      )}
      {enabled && (
        <EyeSlashIcon className="mb-1 mr-1 inline-block h-4 w-4 text-gray-400"></EyeSlashIcon>
      )}
      <div className="mr-1 hidden text-xs font-bold text-gray-500 md:inline-block">
        {item.otype}
      </div>
      <div className="inline-block text-xs font-bold text-gray-500 md:hidden">
        {item.otype.charAt(0)}-
      </div>
      <span>{item.symbol}</span>
      {/* <span className="inline-block md:hidden font-bold">{item.otype.toString().charAt(0)}</span>
      <span className="hidden md:inline-block">{item.otype.toString()}</span> */}
    </button>
  );
}
