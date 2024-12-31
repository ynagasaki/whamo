'use client';

import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  TooltipPosition,
  ActiveElement,
  ChartType,
  Point,
  TooltipPositionerFunction,
} from 'chart.js';
import { ContributionSummary } from '../lib/model';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

const positioners = Tooltip.positioners as unknown as any;
const customPositioner: TooltipPositionerFunction<ChartType> = function (
  items: readonly ActiveElement[],
  eventPosition: Point,
): TooltipPosition {
  const pos = positioners.nearest(items, eventPosition) as TooltipPosition;

  if (items.length === 0) {
    return pos;
  }

  const xAlign =
    this.chart.chartArea.width - pos.x < this.width ? 'right' : 'left';
  const margin = xAlign === 'right' ? -6 : 6;
  return {
    x: pos.x + margin,
    y: pos.y,
    xAlign,
  };
};
positioners.customPositioner = customPositioner;

export function GoalTimeline({
  contribs,
}: {
  contribs: ContributionSummary[];
}) {
  const contribsSorted = contribs.toSorted((a, b) =>
    a.option_exp.localeCompare(b.option_exp),
  );
  const data: { x: number; y: number }[] = [];
  const optionsData: { x: number; y: number }[] = [];
  const first = contribsSorted[0];
  const last = contribsSorted[contribsSorted.length - 1];
  const firstDate = dayjs(first.option_exp).add(-1, 'days');
  const lastDate = dayjs(last.option_exp).add(1, 'days');
  const period = lastDate.diff(firstDate, 'days');

  let currValue = 0;
  let currDay = 0;
  let lastDays = 0;

  contribsSorted.forEach((cs) => {
    const days = dayjs(cs.option_exp).diff(firstDate, 'days');
    for (; currDay < days; currDay += 1) {
      data.push({ x: currDay, y: currValue / 100 });
    }
    currValue += Number(cs.amt);
    if (lastDays !== days) {
      data.push({ x: currDay, y: currValue / 100 });
      optionsData.push({ x: currDay, y: Number(cs.amt) / 100 });
      currDay += 1;
    } else {
      const currPt = data[data.length - 1];
      data[data.length - 1] = {
        x: currPt.x,
        y: Number(cs.amt) / 100 + currPt.y,
      };
      optionsData.push({ x: currPt.x, y: Number(cs.amt) / 100 });
    }
    lastDays = days;
  });

  data.push({ x: currDay, y: currValue / 100 });

  return (
    <Chart
      type="scatter"
      data={{
        datasets: [
          {
            data: optionsData,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBorderWidth: 0,
            pointHoverBorderWidth: 0,
            pointBackgroundColor: 'rgb(49, 130, 206)',
            pointHoverBackgroundColor: 'rgb(49, 130, 206)',
            xAxisID: 'xAxis',
            yAxisID: 'yAxis',
            showLine: false,
          },
          {
            data,
            borderColor: 'rgb(183,148,244)',
            yAxisID: 'yAxis',
            xAxisID: 'xAxis',
            showLine: true,
            stepped: true,
          },
        ],
      }}
      options={{
        animation: false,
        maintainAspectRatio: false,
        responsive: true,
        elements: {
          point: {
            radius: 0,
            hoverRadius: 0,
          },
        },
        scales: {
          xAxis: {
            grid: {
              display: false,
            },
            type: 'linear',
            position: 'bottom',
            max: period,
            beginAtZero: true,
            ticks: {
              callback: function (val: string | number) {
                if (typeof val === 'string') {
                  return val;
                }
                if (Math.floor(val) !== val) {
                  return undefined;
                }
                return val;
              },
            },
          },
          yAxis: {
            display: false,
            grid: {
              display: false,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'point',
        },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(43, 44, 46, 1)',
            bodyColor: 'rgba(243, 244, 246, 1)',
            caretSize: 0,
            cornerRadius: 3,
            displayColors: false,
            enabled: true,
            filter: function (tooltipItem) {
              return tooltipItem.datasetIndex === 0;
            },
            position: 'customPositioner' as 'average',
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';

                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(context.parsed.y);
                }
                return label;
              },
            },
          },
        },
      }}
    ></Chart>
  );
}
