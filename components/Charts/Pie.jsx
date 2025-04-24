import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

// Register required chart.js components
ChartJS.register(ArcElement, CategoryScale, Tooltip, Legend);

const PieChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default PieChart;
