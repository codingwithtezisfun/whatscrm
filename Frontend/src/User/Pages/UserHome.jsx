import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import BASE_URL from "../../BaseUrl";
import "../Styles/userHome.css";
import { FaCoins,} from "react-icons/fa";
import { FaRobot, FaAddressBook, FaProjectDiagram, FaBroadcastTower, FaFileAlt } from 'react-icons/fa';
import { IoChatbubbleEllipses } from "react-icons/io5";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const UserHome = () => {
  const [dashboard, setDashboard] = useState({
    opened: [],
    pending: [],
    resolved: [],
    activeBot: [],
    dActiveBot: [],
    totalChats: 0,
    totalChatbots: 0,
    totalContacts: 0,
    totalFlows: 0,
    totalBroadcast: 0,
    totalTemplets: 0,
  });
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (!token) {
      window.location.href = "/user/login";
      return;
    }
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/get_dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setDashboard(res.data);
        console.log("Fetched data:", res.data);
        
      } else {
        console.log("Failed to fetch user dashboard:", res.data.msg);
      }
    } catch (error) {
      console.error("Error fetching user dashboard:", error);
    }
  };

  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const openedData = dashboard.opened.map(item => Number(item.numberOfOders || 0));
  const pendingData = dashboard.pending.map(item => Number(item.numberOfOders || 0));
  const resolvedData = dashboard.resolved.map(item => Number(item.numberOfOders || 0));
  const activeBotData = dashboard.activeBot.map(item => Number(item.numberOfOders || 0));
  const dActiveBotData = dashboard.dActiveBot.map(item => Number(item.numberOfOders || 0));
  

  // ============================
  // 1) Top Graph (Opened/Pending/Resolved)
  // ============================
  const topChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Opened chat",
        data: openedData,
        borderColor: "#f5c32c",
        backgroundColor: "rgba(245, 195, 44, 0.2)",
        pointBackgroundColor: "#f5c32c",
        tension: 0.3,
      },
      {
        label: "Pending chat",
        data: pendingData,
        borderColor: "blue",
        backgroundColor: "rgba(47, 88, 253, 0.31)",
        pointBackgroundColor: "blue",
        tension: 0.3,
      },
      {
        label: "Resolved chat",
        data: resolvedData,
        borderColor: "#ff6060",
        backgroundColor: "rgba(255, 96, 96, 0.2)",
        pointBackgroundColor: "#ff6060",
        tension: 0.3,
      },
    ],
  };
  const topChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    interaction: {
      mode: "index", 
      intersect: false, 
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // ============================
  // 2) Bottom-Left Graph (Active vs. Inactive Chatbots)
  // ============================
  const botChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Active chatbot",
        data: activeBotData,
        borderColor: "#3CB043",
        backgroundColor: "rgba(60, 176, 67, 0.2)",
        pointBackgroundColor: "#3CB043",
        tension: 0.3,
      },
      {
        label: "Inactive chatbot",
        data: dActiveBotData,
        borderColor: "#cccccc",
        backgroundColor: "rgba(200, 200, 200, 0.2)",
        pointBackgroundColor: "#cccccc",
        tension: 0.3,
      },
    ],
  };
  const botChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    interaction: {
      mode: "index", 
      intersect: false, 
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // 3) Right Card: total stats
  const statsList = [
    { label: <IoChatbubbleEllipses />, text: "Total chats", value: dashboard.totalChats },
    { label: <FaRobot />, text: "Total chatbots", value: dashboard.totalChatbots },
    { label: <FaAddressBook />, text: "Total contacts", value: dashboard.totalContacts },
    { label: <FaProjectDiagram />, text: "Total chatbot flows", value: dashboard.totalFlows },
    { label: <FaBroadcastTower />, text: "Total broadcasts", value: dashboard.totalBroadcast },
    { label: <FaFileAlt />, text: "Total templates", value: dashboard.totalTemplets },
];

  return (
    <div className="user-home">
      <div className="top-graph">
        <div className="graph-wrapper">
          <Line data={topChartData} options={topChartOptions} />
        </div>
      </div>

      <div className="bottom-graphs">
        <div className="graph-box">
          <div className="graph-wrapper">
            <Line data={botChartData} options={botChartOptions} />
          </div>
        </div>

        <div className="graph-box stats-card">
          <div className="stats-list">
            {statsList.map((item, index) => (
              <div className="stats-item" key={index}>
                <div className="stats-label">{item.label} {item.text}</div>
                <div className="stats-value">
                  {item.value} <FaCoins className="stats-icon" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
