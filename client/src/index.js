import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// styles for this kit
import "assets/css/bootstrap.min.css";
import "assets/css/bootstrap.min.css.map";
import "assets/css/our-palette.css";
import "assets/scss/now-ui-kit.scss?v=1.5.0";

// pages for this kit
import Index from "views/Index.js";
import AboutUsPage from "./components/Pages/AboutUs";
import LoginPage from "../src/components/Pages/LoginPage";
import ProfilePage from "../src/components/Pages/ProfilePage";
import SignUp from "../src/components/Pages/SignUp";
import ManageService from "../src/components/Pages/ManageService";
import ManageProduct from "../src/components/Pages/ManageProduct";
import ManageUser from "../src/components/Pages/ManageUser";
import RequestQuote from "../src/components/Pages/RequestQuote";
import ViewQuotes from "../src/components/Pages/ViewQuotes";
import ProductsAndServices from "../src/components/Pages/ProductsAndServices";
import ProtectedRoute from "../src/components/Pages/ProtectedRoute";
import ChatTool from "../src/components/Pages/ChatTool";
import Navbar from "components/Pages/Navbar.js";
import Career from "components/Pages/Career.js";
import GiftCard from "components/Pages/ManageGiftCard.js";
import VisitorStats from "components/Pages/VisitorStats.js";
import ResetPassword from "components/Pages/ResetPassword";

const root = ReactDOM.createRoot(document.getElementById("root"));

const App = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/index" element={<Index />} />
        <Route path="/profile-page" element={<ProtectedRoute element={<ProfilePage />} />} />
        <Route path="/manage-service" element={<ProtectedRoute element={<ManageService />} />} />
        <Route path="/manage-product" element={<ProtectedRoute element={<ManageProduct />} />} />
        <Route path="/manage-user" element={<ProtectedRoute element={<ManageUser />} />} />
        <Route path="/manage-gift-card" element={<ProtectedRoute element={<GiftCard />} />} />
        <Route path="/view-quotes" element={<ProtectedRoute element={<ViewQuotes />} />} />
        <Route path="/view-quotes/:quoteId" element={<ProtectedRoute element={<ViewQuotes />} />} />
        <Route path="/visitor-stats" element={<ProtectedRoute element={<VisitorStats />} />} />
        <Route path="/login-page" element={<LoginPage />} />
        <Route path="/signup-page" element={<SignUp />} />
        <Route path='/request-quote' element={<RequestQuote />} />
        <Route path='/chat-tool' element={<ChatTool />} />
        <Route path="/careers" element={<Career />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/products-and-services" element={<ProductsAndServices />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Navigate to="/index" />} />
        <Route path="*" element={<Navigate to="/index" replace />} />
      </Routes>
      {/* <Footer /> */}
      <a
        href="https://wa.me/14374405514/?text=Hello%2C%20I%20am%20intested%20in%20your%20services.%20Please%20contact%20me."
        className="whatsapp-btn"
        target="_blank"
        rel="noreferrer"
      >
        <img src={require("assets/img/whatsapp-icon.png")} alt="WhatsApp" />
      </a>
      {/* Chatbot Button and Chat Window */}
      {/* disabled until implemented fully */}
      {/* <button className="chatbot-toggle" onClick={toggleChat}>
        <img src={require("assets/img/chat-icon.png")} alt="Chat Coming Soon" />
      </button> */}
      {/* {isChatOpen && <ChatTool />} */}
    </BrowserRouter>
  );
};

root.render(<App />);
