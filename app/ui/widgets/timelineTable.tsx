import { fmtMoney } from '@/app/lib/util';
import dayjs, { Dayjs } from 'dayjs';

export interface TableData {
  dt: Dayjs;
  value: number;
}

function renderDataValue(data: TableData, dataType: 'count' | 'money'): string {
  if (dataType === 'count') {
    return data.value === 0 ? 'None' : `${data.value}`;
  }
  return fmtMoney(data.value * 100);
}

export function TimelineTable({
  id,
  data,
  dataType,
  action,
  loading,
}: {
  id: string;
  data: TableData[];
  dataType: 'count' | 'money';
  action: string;
  loading?: boolean;
}) {
  const now = dayjs(new Date());
  const renderData = !loading
    ? data
    : [
        { dt: now, value: 1 },
        { dt: now, value: 1 },
        { dt: now, value: 1 },
        { dt: now, value: 1 },
      ];
  return (
    <div className="b-0 m-0 p-0">
      <div className="hidden text-center md:block">
        <span className="block text-xl sm:text-2xl">
          {loading ? 'Loading' : renderDataValue(data[0], dataType)}
        </span>
        <span className="block text-sm text-gray-400">
          {loading
            ? '...'
            : `${action} ${
                data[0].dt.year() === now.year() &&
                data[0].dt.month() === now.month()
                  ? 'this month'
                  : data[0].dt.format("MMM 'YY")
              }`}
        </span>
      </div>
      <div className="flex flex-wrap text-xs md:text-sm">
        <>
          {renderData.map((entry, idx) => {
            return (
              <div
                key={`timeline-entry-${id}-${idx}`}
                className="mt-1 w-full border-t pt-1 md:mt-2 md:pt-2"
              >
                <div className="inline-block w-1/3 text-left">
                  {loading ? '...' : entry.dt.format("MMM 'YY")}
                </div>
                <div className="inline-block w-2/3 text-right">
                  {loading ? '...' : renderDataValue(entry, dataType)}
                </div>
              </div>
            );
          })}
        </>
      </div>
    </div>
  );
}
