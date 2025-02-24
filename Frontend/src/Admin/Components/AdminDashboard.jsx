import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminNavbar from './AdminNavbar';

const AdminDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    return (
        <div className="d-flex h-100">
            {/* Sidebar */}
            <div className="flex-grow-0">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-grow-1 d-flex flex-column overflow-hidden">
                {/* Navbar */}
                <div>
                    <AdminNavbar />
                </div>

                {/* Main Content */}
                <div className="d-flex align-items-center justify-content-center flex-grow-1 outer-div">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
