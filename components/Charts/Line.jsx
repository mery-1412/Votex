import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const LineChart = ({ data, options }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        grace: '5%',
        ticks: {
          stepSize: 1,
          precision: 0,
          callback: (value) => Math.max(0, parseInt(value))
        }
      }
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options
  };

  return <Line data={data} options={mergedOptions} />;
};

export default LineChart;
