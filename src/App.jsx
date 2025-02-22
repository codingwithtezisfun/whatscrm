import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "./root.css";

// User imports 
import Signup from "./User/Auth/Signup";
import UserLogin from "./User/Auth/UserLogin";



// mainpage impots 
import Home from "./MainPage/Pages/Home";
import ChatLinkForm from "./MainPage/Pages/ChatLinkForm";
import Features from "./MainPage/Pages/Features";
import Pricing from "./MainPage/Pages/Pricing";
import FAQSection from "./MainPage/Pages/FaqSection";
import Testimonials from "./MainPage/Pages/Testimonials";
import AdvantagesSlider from "./MainPage/Pages/AdvantagesSlider";
import Navbar from "./MainPage/Components/Navbar";
import Footer from "./MainPage/Components/Footer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* user routes  */}
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/" element={<>
        <Home />
        <ChatLinkForm />
        <Features />
        <Pricing />
        <FAQSection />
        <Testimonials />
        <AdvantagesSlider />
        </>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
