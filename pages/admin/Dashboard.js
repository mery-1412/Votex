import React, { useContext, useState } from 'react';
import RequireAdmin from '../protectingRoutes/RequireAdmin';
import { AuthContext } from '../context/AuthContext';
import AdminSidebar from '@/components/NavBar/AdminNavBar';
import Line from '../../components/Charts/Line';
import BarChart from '../../components/Charts/Bar'; 
import PieChart from '@/components/Charts/Pie';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sampleData_line = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Votes',
        data: [30, 50, 70, 90],
        fill: false,
        borderColor: '#B342FF',
        tension: 0.4,
      },
    ],
  };

  const sampleData_bar = {
    labels: ["candid1", "candid2", "candid3"],
    datasets: [
      {
        label: "Votes",
        data: [12, 19, 3],
        backgroundColor: '#B342FF',
        borderColor: '#B342FF',
        borderWidth: 1,
      },
    ],
  };

  const sampleData_pie = {
    labels: ["Option 1", "Option 2", "Option 3"],
    datasets: [
      {
        label: "Votes",
        data: [12, 19, 3],
        backgroundColor: [
          '#B342FF',
          '#C45AFF',
          '#D674FF',
        ],
        borderColor: [
          '#B342FF',
          '#C45AFF',
          '#D674FF',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <RequireAdmin>
      <div className="dashboard-page flex h-screen">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <div className="flex-1 p-6 overflow-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#B342FF]">Dashboard</h2>

          {/* Flex container for responsive charts */}
          <div className="flex flex-col  items-center ">
  {/* Top row: Line and Bar charts */}
  <div className="flex flex-wrap justify-center gap-x-2  w-full">
    <div className="w-full max-w-[500px] h-[500px] bg-white rounded-xl px-3 py-2">
      <Line
        data={sampleData_line}
        options={{
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
    </div>

    <div className="w-full max-w-[500px] h-[500px] bg-white rounded-xl px-3 py-2">
      <BarChart
        data={sampleData_bar}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  </div>

  {/* Bottom row: Pie chart */}
  {/* <div className=" h-[500px] bg-white rounded-xl ">
    <PieChart
      data={sampleData_pie}
      options={{
        responsive: true,
        maintainAspectRatio: false,
      }}
    />
  </div> */}
</div>



        </div>
      </div>
    </RequireAdmin>
  );
};

export default Dashboard;
