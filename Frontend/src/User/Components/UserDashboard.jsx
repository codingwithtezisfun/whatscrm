import React from 'react';
import { Outlet } from 'react-router-dom';
import UserNavbar from './UserNavbar';
// import './userDashboard.css'; 

const UserDashboard = () => {
  return (
    <div className="user-dashboard">
      <UserNavbar />
      <div className="dashboard-outlet">
        <Outlet />
      </div>
    </div>
  );
};

export default UserDashboard;
