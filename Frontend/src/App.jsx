import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./root.css";

// MainPage components
import Navbar from "./MainPage/Components/Navbar";
import Footer from "./MainPage/Components/Footer";
import Home from "./MainPage/Pages/Home";
import ChatLinkForm from "./MainPage/Pages/ChatLinkForm";
import Features from "./MainPage/Pages/Features";
import Pricing from "./MainPage/Pages/Pricing";
import FAQSection from "./MainPage/Pages/FaqSection";
import Testimonials from "./MainPage/Pages/Testimonials";
import AdvantagesSlider from "./MainPage/Pages/AdvantagesSlider";

// User components
import Signup from "./User/Auth/Signup";
import UserLogin from "./User/Auth/UserLogin";
import UserDashboard from "./User/Components/UserDashboard";
import UserHome from "./User/Pages/UserHome";
import Chatbot from "./User/Components/Chatbot";
import AutoChatbot from "./User/Pages/AutoChatbot";
import ChatComponent from "./User/Pages/ChatComponent";
import ChatFlow from "./User/Pages/ChatFlow";
import { ReactFlowProvider } from "@xyflow/react";
import Phonebook from "./User/Pages/Phonebook";
import Broadcast from "./User/Pages/Broadcast";
import NewChatModal from "./User/Pages/NewChatModal";


// Admin components
import AdminLogin from "./Admin/Auth/AdminLogin";
import AdminRegister from "./Admin/Auth/AdminRegister";
import AdminDashboard from "./Admin/Components/AdminDashboard"; 
import AdminDashboardHome from "./Admin/Pages/AdminDashboardHome";
import PlanManagement from "./Admin/Pages/PlanManagement";
import ManageUsers from "./Admin/Pages/ManageUsers";
import EditUser from "./Admin/Pages/EditUser";
import PaymentGateways from "./Admin/Pages/PaymentGateways";  
import Faqs from "./Admin/Pages/FAQs";
import ManagePage from "./Admin/Pages/ManagePage";
import TestimonialManagement from "./Admin/Pages/TestimonialManagement";
import OrdersPage from "./Admin/Pages/OrdersPage";
import LeadsPage from "./Admin/Pages/LeadsPage";
import SocialLogin from "./Admin/Pages/SocialLogin";

// Private Route Component for Admin Authentication
const AdminPrivateRoute = ({ element }) => {
  const token = localStorage.getItem("adminToken");

  return token ? element : <Navigate to="/admin/login" />;
};
// Private Route Component for User Authentication
const UserPrivateRoute = ({ element }) => {
  const token = localStorage.getItem("userToken");

  return token ? element : <Navigate to="/user/login" />;
};

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Router>
      <AppContent theme={theme} setTheme={setTheme} />
    </Router>
  );
}

function AppContent({ theme, setTheme }) {
  const location = useLocation();

  const hideHeaderFooter =
    location.pathname.startsWith("/admin/dashboard") ||
    location.pathname.startsWith("/user/dashboard") ||
    location.pathname.startsWith("/agent/dashboard");

  return (
    <>
      {!hideHeaderFooter && <Navbar />}
      <Routes>
        {/* Landing Page Routes */}
        <Route
          path="/"
          element={
            <>
              <Home />
              <ChatLinkForm />
              <Features />
              <Pricing />
              <FAQSection />
              <Testimonials />
              <AdvantagesSlider />
            </>
          }
        >
        </Route>
        {/* user routes  */}
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/plans" element={<Pricing />} />

        <Route path="/user/dashboard" element={<UserPrivateRoute element={<UserDashboard />} />}>
          <Route index element={<Navigate to="userhome" />} />
          <Route path="userhome" element={<UserHome />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="auto-chatbot" element={<AutoChatbot />} />
          <Route path="chat-component" element={<ChatComponent />} />
          <Route path="chat-flow" element={
             <ReactFlowProvider>
            <ChatFlow />
            </ReactFlowProvider>} />
          <Route path="phonebook" element={<Phonebook />} />
          <Route path="broadcast" element={<Broadcast/>}/>
          <Route path="new-chat" element={<NewChatModal />} />
        </Route>

        {/* Admin Dashboard - Protected Route */}
        <Route path="/admin/dashboard" element={<AdminPrivateRoute element={<AdminDashboard />} />}>
          <Route index element={<Navigate to="home" />} />
          <Route path="home" element={<AdminDashboardHome />} />
          <Route path="plan-management" element={<PlanManagement />} />
          <Route path="user-management" element={<ManageUsers />} />
          <Route path="update-user" element={<EditUser />} />
          <Route path="payment-gateways" element={<PaymentGateways />} />
          <Route path="faqs" element={<Faqs />} />
          <Route path="manage-page" element={<ManagePage />} />
          <Route path="testimonial-management" element={<TestimonialManagement />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="social-login" element={<SocialLogin />} />
        </Route>

        {/* Admin Auth Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default App;
