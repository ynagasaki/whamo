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
  const chartData: number[] = [];
  const chartDataNegatives: number[] = [];

  dataSorted.forEach((entry) => {
    chartLabels.push(entry.dt.format('MMM').substring(0, 1));
    if (entry.value_gain != undefined && entry.value_loss != undefined) {
      chartData.push(entry.value_gain);
      chartDataNegatives.push(entry.value_loss);
    } else {
      chartData.push(entry.value);
      chartDataNegatives.push(0);
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
            data: chartData,
            backgroundColor: 'rgb(183,148,244)',
            hoverBackgroundColor: 'rgb(183,148,244)',
            borderRadius: 3,
          },
          {
            label: 'loss',
            data: chartDataNegatives,
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
