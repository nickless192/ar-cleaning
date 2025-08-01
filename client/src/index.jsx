import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import './i18n'; // Import i18n configuration

// styles for this kit
// import 'bootstrap/dist/css/bootstrap.min.css';
import "/src/assets/css/our-palette.css";
import "/src/assets/css/NavBar.css";
import "/src/assets/css/bootstrap.min.css";
// import "/src/assets/css/bootstrap.min.css.map";
// import "assets/scss/now-ui-kit.scss?v=1.5.0";

// pages for this kit
import Index from "/src/views/Index.jsx";
import AboutUsPage from "/src/components/Pages/Navigation/AboutUs";
// import LoginPage from "views/LoginPage";
import ProfilePage from "/src/components/Pages/UserJourney/ProfilePage";
// import SignUp from "views/SignUp";
import ManageService from "/src/components/Pages/Management/ManageService";
import ManageProduct from "/src/components/Pages/Management/ManageProduct";
import ManageUser from "/src/components/Pages/Management/ManageUser";
import GiftCard from "/src/components/Pages/Management/ManageGiftCard.jsx";
import ManageCategories from "/src/components/Pages/Management/ManageCategories.jsx";
// import RequestQuote from "../src/components/Pages/RequestQuote";
import LoginSign from "/src/components/Pages/UserJourney/LoginSign";
import ViewQuotes from "./components/Pages/Management/ViewQuotes";
import ProductsAndServices from "/src/components/Pages/Navigation/ProductsAndServices";
import ProtectedRoute from "/src/components/Pages/Management/ProtectedRoute";
import ChatTool from "/src/components/Pages/UserJourney/ChatTool";
import Navbar from "/src/components/Pages/Navigation/Navbar.jsx";
import Career from "/src/components/Pages/Navigation/Career.jsx";
import LogDashboard from '/src/components/Pages/Management/LogDashboard';
import QuickQuoteDashboard from "/src/components/Pages/Management/QuickQuoteDashboard";
import BookingDashboard from '/src/components/Pages/Management/BookingDashboard';
import ResetPassword from "/src/components/Pages/UserJourney/ResetPassword";
import Terms from "/src/components/Pages/Navigation/Terms";
import Disclaimer from "/src/components/Pages/Navigation/Disclaimer";
import Footer from "/src/components/Pages/Navigation/Footer.jsx";
import Customer from "/src/components/Pages/Management/Customers.jsx";
import FinanceDashboard from "/src/components/Pages/Management/FinanceDashboard";
import ExpenseDashboard from "/src/components/Pages/Management/ExpenseDashboard";
import QuickRequest_v2 from "/src/components/Pages/UserJourney/QuoteRequest_v2"; // version in-dev for testing
import AdminContactDashboard from "/src/components/Pages/Management/AdminContactDashboard"; // version in-dev for testing

import LandingFresh from "/src/components/Pages/qrCodes/LandingFresh";
import LandingNow from "/src/components/Pages/qrCodes/LandingNow";
import LandingSecret from "/src/components/Pages/qrCodes/LandingSecret";
import LandingStart from "/src/components/Pages/qrCodes/LandingStart";
import LandingToronto from "/src/components/Pages/qrCodes/LandingToronto";

import SiteBanner from "/src/components/Pages/Navigation/SiteBanner.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));

const App = () => {
  // In your App.js
  useEffect(() => {
    const header = document.querySelector('.fixed-top-container');
    const content = document.querySelector('.main-content');
    const banner = document.querySelector('.site-banner'); // Target the banner
    const navbar = document.querySelector('.navbar');     // Target the navbar

    if (!header || !content || !banner || !navbar) return;

    // --- TEMPORARY DEBUG LOGS ---
    // console.log('-------------------------');
    // console.log(`Banner Height: ${banner.offsetHeight}px`);
    // console.log(`Navbar Height: ${navbar.offsetHeight}px`);
    // console.log(`SUM of Children: ${banner.offsetHeight + navbar.offsetHeight}px`);
    // console.log(`Measured Parent Height: ${header.offsetHeight}px`);
    // console.log('-------------------------');
    // --- END DEBUG ---

    // The rest of your ResizeObserver logic...
    const resizeObserver = new ResizeObserver(() => {
      const headerHeight = 2*header.offsetHeight/5;
      content.style.paddingTop = `${headerHeight}px`;
    });
    // ...
    resizeObserver.observe(header);

    // 2. Return a cleanup function. This runs when the component unmounts.
    return () => {
      resizeObserver.disconnect(); // Stop observing to prevent memory leaks.
    };
  }, []);


  return (
    <React.StrictMode>
      <BrowserRouter>
        <div className="fixed-top-container">
          <SiteBanner />
          <Navbar />
        </div>
        <div className="light-bg-color-opaque main-content">
        <Routes>
          <Route path="/index" element={<Index />} />
          <Route path="/profile-page" element={<ProtectedRoute element={<ProfilePage />} />} />
          <Route path="/manage-categories" element={<ProtectedRoute element={<ManageCategories />} />} />
          <Route path="/manage-service" element={<ProtectedRoute element={<ManageService />} />} />
          <Route path="/manage-product" element={<ProtectedRoute element={<ManageProduct />} />} />
          <Route path="/manage-user" element={<ProtectedRoute element={<ManageUser />} />} />
          <Route path="/manage-gift-card" element={<ProtectedRoute element={<GiftCard />} />} />
          <Route path="/manage-customers" element={<ProtectedRoute element={<Customer />} />} />
          <Route path="/manage-finance" element={<ProtectedRoute element={<FinanceDashboard />} />} />
          <Route path="/view-quotes" element={<ProtectedRoute element={<QuickQuoteDashboard />} />} />
          <Route path="/manage-expenses" element={<ProtectedRoute element={<ExpenseDashboard />} />} />
          <Route path="/quick-request-v2" element={<ProtectedRoute element={<QuickRequest_v2 />} />} />
          <Route path="/admin-contact-dashboard" element={<ProtectedRoute element={<AdminContactDashboard />} />} />
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
        </div>
        <Footer />
      </BrowserRouter>
    </React.StrictMode>
  );
};

root.render(<App />);
