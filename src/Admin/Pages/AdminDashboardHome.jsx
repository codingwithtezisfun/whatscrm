import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import BASE_URL from "../../BaseUrl";
import "../Styles/home.css"; 

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboardHome = () => {
  const [dashboardData, setDashboardData] = useState({
    paid: [],
    unpaid: [],
    orders: [],
    userLength: 0,
    orderLength: 0,
    contactLength: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/get_dashboard_for_user`);
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Chart Data
  const chartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Paid users",
        data: dashboardData.paid,
        fill: true,
        backgroundColor: "rgba(3, 201, 98, 0.2)", 
        borderColor: "rgba(3, 201, 98, 1)",      
        pointBackgroundColor: "rgba(3, 201, 98, 1)",
        pointBorderColor: "#fff",
        pointRadius: 5,
        tension: 0.3,
      },
      {
        label: "Unpaid users",
        data: dashboardData.unpaid,
        fill: false,
        borderColor: "rgba(255, 153, 0, 1)", 
        pointBackgroundColor: "rgba(255, 153, 0, 1)",
        pointBorderColor: "#fff",
        pointRadius: 5,
        tension: 0.3,
      },
      {
        label: "All orders",
        data: dashboardData.orders,
        fill: false,
        borderColor: "rgba(255, 206, 86, 1)", 
        pointBackgroundColor: "rgba(255, 206, 86, 1)",
        pointBorderColor: "#fff",
        pointRadius: 5,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#e7e7e7", 
        },
        ticks: {
          color: "#666",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#666",
        },
      },
    },
  };

  return (
    <div className="admin-dashboard-home">

      <div className="chart-container">

        <div style={{ width: "100%", height: "400px" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <h4>Total Users</h4>
          <p>{dashboardData.userLength}</p>
        </div>
        <div className="stat-card">
          <h4>Total Orders</h4>
          <p>{dashboardData.orderLength}</p>
        </div>
        <div className="stat-card">
          <h4>Total Leads</h4>
          <p>{dashboardData.contactLength}</p>
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboardHome;
