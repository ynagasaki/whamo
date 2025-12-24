'use client';

import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineController,
  PointElement,
  LineElement,
} from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LineController,
  LinearScale,
  PointElement,
  LineElement,
);

export interface TimelineData {
  dt: dayjs.Dayjs;
  value: number;
}

export function TimelineLineChart({
  data,
  period,
}: {
  data: TimelineData[];
  period: 'month';
}) {
  const dataSorted = data.toSorted((a, b) => a.dt.diff(b.dt));
  const chartLabels: string[] = [];
  const chartData: number[] = [];

  dataSorted.forEach((entry, index) => {
    let label = entry.dt.format('MMM').substring(0, 1);
    chartLabels.push(label);
    chartData.push(entry.value);
  });

  return (
    <Chart
      type="line"
      data={{
        labels: chartLabels,
        datasets: [
          {
            label: 'value',
            data: chartData,
            pointBackgroundColor: 'rgb(183,148,244)',
            pointBorderColor: 'rgb(183,148,244)',
            pointHoverBackgroundColor: 'rgb(183,148,244)',
            pointHoverBorderColor: 'rgb(183,148,244)',
            pointRadius: 3,
            pointHoverRadius: 3,
            pointHoverBorderWidth: 0,
            pointBorderWidth: 0,
          },
        ],
      }}
      options={{
        animation: false,
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          x: {
            ticks: {
              color: 'rgb(156, 163, 175)',
              maxRotation: 0,
              minRotation: 0,
            },
            grid: {
              display: false,
            },
          },
          y: {
            border: {
              display: false,
            },
            ticks: {
              color: 'rgb(156, 163, 175)',
              callback: function (value, index, ticks) {
                if (!(typeof value === 'string' || typeof value === 'number')) {
                  return value;
                } else if (
                  typeof value === 'string' &&
                  (isNaN(parseFloat(value)) || isNaN(parseInt(value)))
                ) {
                  return value;
                } else if (
                  typeof value === 'number' &&
                  Math.abs(value) < 1000
                ) {
                  return value;
                }
                const valNum =
                  typeof value === 'string' ? parseFloat(value) : value;
                return valNum / 1000 + 'k';
              },
            },
            grid: {
              display: true,
            },
          },
        },
        plugins: {
          tooltip: {
            enabled: false,
          },
        },
      }}
    ></Chart>
  );
}
