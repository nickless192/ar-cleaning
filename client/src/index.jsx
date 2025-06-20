import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// styles for this kit
// import 'bootstrap/dist/css/bootstrap.min.css';
import "/src/assets/css/our-palette.css";
import "/src/assets/css/NavBar.css";
import "/src/assets/css/bootstrap.min.css";
// import "/src/assets/css/bootstrap.min.css.map";
// import "assets/scss/now-ui-kit.scss?v=1.5.0";

// pages for this kit
import Index from "/src/views/Index.jsx";
import AboutUsPage from "/src/components/Pages/AboutUs";
// import LoginPage from "views/LoginPage";
import ProfilePage from "/src/components/Pages/ProfilePage";
// import SignUp from "views/SignUp";
import ManageService from "/src/components/Pages/ManageService";
import ManageProduct from "/src/components/Pages/ManageProduct";
import ManageUser from "/src/components/Pages/ManageUser";
// import RequestQuote from "../src/components/Pages/RequestQuote";
import LoginSign from "/src/components/Pages/LoginSign";
import ViewQuotes from "./components/Pages/ViewQuotes";
import ProductsAndServices from "/src/components/Pages/ProductsAndServices";
import ProtectedRoute from "/src/components/Pages/ProtectedRoute";
import ChatTool from "/src/components/Pages/ChatTool";
import Navbar from "/src/components/Pages/Navbar.jsx";
import Career from "/src/components/Pages/Career.jsx";
import GiftCard from "/src/components/Pages/ManageGiftCard.jsx";
import LogDashboard from '/src/views/LogDashboard';
import QuickQuoteDashboard from "/src/views/QuickQuoteDashboard";
import BookingDashboard from '/src/views/BookingDashboard';
import ResetPassword from "/src/components/Pages/ResetPassword";
import Terms from "/src/components/Pages/Terms";
import Disclaimer from "/src/components/Pages/Disclaimer";
import Footer from "/src/components/Pages/Footer.jsx";

import LandingFresh from "/src/views/qrCodes/LandingFresh";
import LandingNow from "/src/views/qrCodes/LandingNow";
import LandingSecret from "/src/views/qrCodes/LandingSecret";
import LandingStart from "/src/views/qrCodes/LandingStart";
import LandingToronto from "/src/views/qrCodes/LandingToronto";

const root = ReactDOM.createRoot(document.getElementById("root"));

const App = () => {
  // const [isChatOpen, setIsChatOpen] = useState(false);

  // const toggleChat = () => {
  //   setIsChatOpen(!isChatOpen);
  // };

  return (
    <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/index" element={<Index />} />
        <Route path="/profile-page" element={<ProtectedRoute element={<ProfilePage />} />} />
        <Route path="/manage-service" element={<ProtectedRoute element={<ManageService />} />} />
        <Route path="/manage-product" element={<ProtectedRoute element={<ManageProduct />} />} />
        <Route path="/manage-user" element={<ProtectedRoute element={<ManageUser />} />} />
        <Route path="/manage-gift-card" element={<ProtectedRoute element={<GiftCard />} />} />
        <Route path="/view-quotes" element={<ProtectedRoute element={<QuickQuoteDashboard />} />} />
        {/* <Route path="/view-quotes/:quoteId" element={<ProtectedRoute element={<ViewQuotes />} />} /> */}
        <Route path="/dashboard" element={<ProtectedRoute element={<LogDashboard />} />} />
        <Route path="/booking-dashboard" element={<ProtectedRoute element={<BookingDashboard />} />} />
        {/* <Route path="/login-page" element={<LoginPage />} /> */}
        {/* <Route path="/signup-page" element={<SignUp />} /> */}
        <Route path='/login-signup' element={<LoginSign />} />
        {/* <Route path='/request-quote' element={<RequestQuote />} /> */}
        <Route path='/chat-tool' element={<ChatTool />} />
        <Route path="/careers" element={<Career />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/products-and-services" element={<ProductsAndServices />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms-conditions" element={<Terms />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/now" element={<LandingNow />} />
      <Route path="/start" element={<LandingStart />} />
      <Route path="/toronto" element={<LandingToronto />} />
      <Route path="/fresh" element={<LandingFresh />} />
      <Route path="/secret" element={<LandingSecret />} />
        <Route path="/" element={<Navigate to="/index" />} />
        <Route path="*" element={<Navigate to="/index" replace />} />
      </Routes>
      <Footer />
      {/* <a
        href="https://wa.me/14374405514/?text=Hello%2C%20I%20am%20intested%20in%20your%20services.%20Please%20contact%20me."
        className="whatsapp-btn"
        target="_blank"
        rel="noreferrer"
      >
        <img src={require("assets/img/whatsapp-icon.png")} alt="WhatsApp" />
      </a> */}
      {/* Chatbot Button and Chat Window */}
      {/* disabled until implemented fully */}
      {/* <button className="chatbot-toggle" onClick={toggleChat}>
        <img src={require("assets/img/chat-icon.png")} alt="Chat Coming Soon" />
      </button> */}
      {/* {isChatOpen && <ChatTool />} */}
    </BrowserRouter>
    </React.StrictMode>
  );
};

root.render(<App />);
