import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "./root.css";

// User imports 
import Signup from "./User/Auth/Signup";
import UserLogin from "./User/Auth/UserLogin";
import Navbar from "./MainPage/Components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/user/login" element={<UserLogin />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
