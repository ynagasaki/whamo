'use client';

import { Chart } from 'react-chartjs-2';
import {
  BarController,
  BarElement,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale);

export interface TimelineData {
  dt: dayjs.Dayjs;
  value: number;
  value_loss?: number;
  value_gain?: number;
}

export function TimelineChart({
  data,
  period,
}: {
  data: TimelineData[];
  period: 'month';
}) {
  const dataSorted = data.toSorted((a, b) => a.dt.diff(b.dt));
  const chartLabels: string[] = [];
  const chartDataPos: number[] = [];
  const chartDataNeg: number[] = [];

  dataSorted.forEach((entry) => {
    chartLabels.push(entry.dt.format('MMM').substring(0, 1));
    if (entry.value_gain != undefined && entry.value_loss != undefined) {
      chartDataPos.push(entry.value_gain);
      chartDataNeg.push(entry.value_loss);
    } else {
      chartDataPos.push(entry.value > 0 ? entry.value : 0);
      chartDataNeg.push(entry.value < 0 ? entry.value : 0);
    }
  });

  return (
    <Chart
      type="bar"
      data={{
        labels: chartLabels,
        datasets: [
          {
            label: 'gain',
            data: chartDataPos,
            backgroundColor: 'rgb(183,148,244)',
            hoverBackgroundColor: 'rgb(183,148,244)',
            borderRadius: 3,
          },
          {
            label: 'loss',
            data: chartDataNeg,
            backgroundColor: 'rgb(156, 163, 175)',
            hoverBackgroundColor: 'rgb(156, 163, 175)',
            borderRadius: 3,
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
          x: {
            ticks: {
              color: 'rgb(156, 163, 175)',
            },
            grid: {
              display: false,
            },
            stacked: true,
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
            stacked: true,
            beginAtZero: true,
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
