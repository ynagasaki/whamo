import clsx from "clsx";
import { useState } from "react";

export function TimelineOptionsBar({
  timelineRange,
  setTimelineRange,
}: {
  timelineRange: 1 | 2;
  setTimelineRange: (range: 1 | 2) => void;
}) {
  return (
    <div className="w-full flex flex-nowrap">
      <button
        className={clsx(
          'mr-2 inline-block flex flex-nowrap rounded-full border ' +
          'border-gray-200 p-2 text-xs tracking-tight text-gray-700 md:text-sm md:tracking-normal',
          {
            'bg-gray-200': timelineRange === 1,
            'border-gray-300': timelineRange !== 1,
          },
        )}
        onClick={() => setTimelineRange(1)}
      >
        12 mo
      </button>
      <button
        className={clsx(
          'mr-2 inline-block flex flex-nowrap rounded-full border ' +
          'border-gray-200 p-2 text-xs tracking-tight text-gray-700 md:text-sm md:tracking-normal',
          {
            'bg-gray-200': timelineRange === 2,
            'border-gray-300': timelineRange !== 2,
          },
        )}
        onClick={() => setTimelineRange(2)}
      >
        24 mo
      </button>
    </div>
  );
}
