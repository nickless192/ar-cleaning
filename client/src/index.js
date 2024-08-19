import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// styles for this kit
import "assets/css/bootstrap.min.css";
import "assets/css/bootstrap.min.css.map";
import "assets/css/our-palette.css";
import "assets/scss/now-ui-kit.scss?v=1.5.0";
import "assets/demo/demo.css?v=1.5.0";
import "assets/demo/nucleo-icons-page-styles.css?v=1.5.0";

// pages for this kit
import Index from "views/Index.js";
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

const root = ReactDOM.createRoot(document.getElementById("root"));

const App = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/index" element={<Index />} />
        <Route path="/profile-page" element={<ProtectedRoute element={<ProfilePage />} />} />
        <Route path="/manage-service" element={<ProtectedRoute element={<ManageService />} />} />
        <Route path="/manage-product" element={<ProtectedRoute element={<ManageProduct />} />} />
        <Route path="/manage-user" element={<ProtectedRoute element={<ManageUser />} />} />
        <Route path="/view-quotes" element={<ProtectedRoute element={<ViewQuotes />} />} />
        <Route path="/view-quotes/:quoteId" element={<ProtectedRoute element={<ViewQuotes />} />} />
        <Route path="/login-page" element={<LoginPage />} />
        <Route path="/signup-page" element={<SignUp />} />
        <Route path='/request-quote' element={<RequestQuote/>} />
        <Route path='/chat-tool' element={<ChatTool/>} />
        <Route path="/products-and-services" element={<ProductsAndServices />} />
        <Route path="/" element={<Navigate to="/index" />} />
        <Route path="*" element={<Navigate to="/index" replace />} />
      </Routes>

      {/* Chatbot Button and Chat Window */}
      <button className="chatbot-toggle" onClick={toggleChat}>
        <img src={require("assets/img/chat-icon.png")} alt="Chat Coming Soon" />
      </button>
      {/* {isChatOpen && <ChatTool />} */}
    </BrowserRouter>
  );
};

root.render(<App />);
