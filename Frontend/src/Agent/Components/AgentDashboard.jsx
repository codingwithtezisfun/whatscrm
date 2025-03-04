import React from 'react';
import { Outlet } from 'react-router-dom';
import AgentNavbar from './AgentNavbar';

const UserDashboard = () => {
  return (
    <div className="user-dashboard">
      <AgentNavbar />
      <div className="dashboard-outlet">
        <Outlet />
      </div>
    </div>
  );
};

export default UserDashboard;
