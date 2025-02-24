import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../BaseUrl";
import Swal from "sweetalert2";
import "../Styles/leads.css"; // External CSS file

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");

  // Fetch leads on mount
  useEffect(() => {
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }
    fetchLeads();
    // eslint-disable-next-line
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/get_contact_leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setLeads(res.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLoading(false);
    }
  };

  // Optional: If you have a delete endpoint, hook it here:
  // const deleteLead = async (id) => {
  //   try {
  //     const res = await axios.post(
  //       `${BASE_URL}/api/admin/del_contact_lead`,
  //       { id },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     if (res.data.success) {
  //       Swal.fire({
  //         icon: "success",
  //         title: "Deleted",
  //         text: "Lead was deleted successfully!",
  //         timer: 2000,
  //         showConfirmButton: false,
  //       });
  //       fetchLeads();
  //     } else {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Error",
  //         text: res.data.msg || "Failed to delete lead",
  //       });
  //     }
  //   } catch (err) {
  //     console.error("Error deleting lead:", err);
  //     Swal.fire({
  //       icon: "error",
  //       title: "Error",
  //       text: "Something went wrong while deleting lead",
  //     });
  //   }
  // };

  if (loading) {
    return <div className="leads-container">Loading...</div>;
  }

  return (
    <div className="leads-container">
      <h2>Leads</h2>
      <p>You may check all the filled contact form leads here</p>

      <div className="leads-table-wrapper">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Message</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-items">
                  No items
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.email}</td>
                  <td>{lead.name}</td>
                  <td>{lead.mobile}</td>
                  <td>{lead.message}</td>
                  <td>
                    {/* Uncomment if you have a delete route */}
                    {/* 
                    <button
                      className="delete-btn"
                      onClick={() => deleteLead(lead.id)}
                    >
                      Delete
                    </button>
                    */}
                    <button className="delete-btn" disabled>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (placeholder) */}
      <div className="leads-pagination">
        Rows per page
        <select defaultValue="100">
          <option value="10">10</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span>0 - {leads.length} of {leads.length}</span>
        <button className="arrow-btn" disabled>{"<"}</button>
        <button className="arrow-btn" disabled>{">"}</button>
      </div>
    </div>
  );
};

export default LeadsPage;
