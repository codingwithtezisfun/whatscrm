import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../BaseUrl";
import "../Styles/orderspage.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    // If no token, redirect to login
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  // Fetch orders from your backend
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/get_orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setOrders(res.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  // Format the date to DD/MM/YY HH:MM (AM/PM)
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const dateObj = new Date(isoString);
    return dateObj.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Determine order status
  // For OFFLINE, default to 'Success'
  // For PayPal/Stripe, try to parse the 'data' field
  const getStatus = (order) => {
    const { payment_mode, data } = order;
    if (payment_mode === "OFFLINE") {
      return "Success";
    }
    if (!data) {
      // If there's no 'data', assume 'Pending' or adapt your logic
      return "Pending";
    }
    try {
      const parsed = JSON.parse(data);
      // If your 'data' object has a 'status' field, use it
      if (parsed.status) {
        return parsed.status;
      }
      // Otherwise default to 'Pending'
      return "Pending";
    } catch {
      return "Pending";
    }
  };

  if (loading) {
    return <div className="order-container">Loading...</div>;
  }

  return (
    <div className="order-container">
      <h2>Order</h2>
      <p>All orders offline and online payment will appear here</p>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="order-table">
          <thead>
            <tr>
              <th>Pay type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Name</th>
              <th>Email</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const status = getStatus(order);
              const dateStr = formatDate(order.orderCreatedAt);
              return (
                <tr key={order.id}>
                  <td>{order.payment_mode}</td>
                  <td>{order.amount}</td>
                  <td>{status}</td>
                  <td>{order.name || "N/A"}</td>
                  <td>{order.email || "N/A"}</td>
                  <td>{dateStr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersPage;
