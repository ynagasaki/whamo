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

export interface TimelineEntry {
  dt: dayjs.Dayjs;
  value: number;
}

export interface TimelineDataset {
  name: string;
  color: string;
  entries: TimelineEntry[];
}

export function TimelineChart({
  datasets,
  period,
}: {
  datasets: TimelineDataset[];
  period: 'month';
}) {
  const chartLabels: string[] = [];
  const chartDatasets = datasets.map((timelineDataset) => {
    const entriesSorted = timelineDataset.entries.toSorted((a, b) =>
      a.dt.diff(b.dt),
    );
    return {
      label: timelineDataset.name,
      data: entriesSorted.map((timelineEntry) => {
        if (chartLabels.length < entriesSorted.length) {
          chartLabels.push(timelineEntry.dt.format('MMM').substring(0, 1));
        }
        return timelineEntry.value;
      }),
      backgroundColor: timelineDataset.color,
      hoverBackgroundColor: timelineDataset.color,
      borderRadius: 3,
    };
  });

  return (
    <Chart
      type="bar"
      data={{
        labels: chartLabels,
        datasets: chartDatasets,
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
