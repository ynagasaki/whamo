'use client';

import { Chart } from 'react-chartjs-2';
import {
  BarElement,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(
  BarElement,
  CategoryScale,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

export interface TimelineData {
  dt: dayjs.Dayjs;
  value: number;
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

  dataSorted.forEach((entry) => {
    chartLabels.push(entry.dt.format('MMM').substring(0, 1));
    chartData.push(entry.value);
  });

  return (
    <Chart
      type="bar"
      data={{
        labels: chartLabels,
        datasets: [
          {
            label: 'option value',
            data: chartData,
            backgroundColor: 'rgb(183,148,244)',
            hoverBackgroundColor: 'rgb(183,148,244)',
            borderRadius: 3,
            stack: 'option_value',
            xAxisID: 'xAxis',
            yAxisID: 'yAxis',
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
            ticks: {
              color: 'rgb(156, 163, 175)',
            },
            grid: {
              display: false,
            },
          },
          yAxis: {
            border: {
              display: false,
            },
            ticks: {
              color: 'rgb(156, 163, 175)',
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
