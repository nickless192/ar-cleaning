import React, { Suspense, lazy, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import './i18n'; // Import i18n configuration
import { registerSW } from 'virtual:pwa-register';

// import 'bootstrap/dist/css/bootstrap.min.css';
import "/src/assets/css/our-palette.css";
import "/src/assets/css/NavBar.css";
import "/src/assets/css/bootstrap.min.css";
// import "/src/assets/css/bootstrap.min.css.map";

import Index from "/src/views/Index.jsx";
import ProtectedRoute from "/src/components/Pages/Management/ProtectedRoute";
import Navbar from "/src/components/Pages/Navigation/Navbar.jsx";
import Terms from "/src/components/Pages/Navigation/Terms";
import Disclaimer from "/src/components/Pages/Navigation/Disclaimer";
import PrivacyPolicy from "/src/components/Pages/Navigation/PrivacyPolicy";
import Footer from "/src/components/Pages/Navigation/Footer.jsx";
import CookieConsent from "/src/components/Pages/Landing/CookieConsent";
import MetaTags from "/src/components/Pages/Management/MetaTags.jsx";

const AboutUsPage = lazy(() => import("/src/components/Pages/Navigation/AboutUs"));
const ProfilePage = lazy(() => import("/src/components/Pages/UserJourney/ProfilePage"));
const LoginSign = lazy(() => import("/src/components/Pages/UserJourney/LoginSign"));
const SignUp = lazy(() => import("/src/components/Pages/UserJourney/SignUp"));
const ProductsAndServices = lazy(() => import("/src/components/Pages/Navigation/ProductsAndServices"));
const Career = lazy(() => import("/src/components/Pages/Navigation/Career.jsx"));
const ServiceLandingPage = lazy(() => import("/src/components/Pages/Navigation/ServiceLandingPage.jsx"));
const ResetPassword = lazy(() => import("/src/components/Pages/UserJourney/ResetPassword"));
const BlogLandingPage = lazy(() => import("/src/components/Pages/Blogs/BlogLandingPage.jsx"));
const CleanARJoinsISSACanada = lazy(() => import("/src/components/Pages/Blogs/CleanARJoinsISSACanada"));
const CleanARJoinsCQCC = lazy(() => import("/src/components/Pages/Blogs/CleanARJoinsCQCC.jsx"));
const NotificationAdminPage = lazy(() => import("/src/components/Pages/UserJourney/NotificationAdminPage.jsx"));
const QuickRequest_v2 = lazy(() => import("/src/components/Pages/UserJourney/QuoteRequest_v2"));
const AdminManagementLayout = lazy(() => import("/src/components/Pages/ManagementViews/AdminManagementLayout.jsx"));
const BookingTabbedView = lazy(() => import("/src/components/Pages/ManagementViews/BookingTabbedView"));
const InventoryManagementTabbedView = lazy(() => import("/src/components/Pages/ManagementViews/InventoryManagementTabbedView"));
const ContactManagementTabbedView = lazy(() => import("/src/components/Pages/ManagementViews/ContactManagementTabbedView"));
const AccountingTabbedView = lazy(() => import("/src/components/Pages/ManagementViews/AccountingTabbedView"));
const AdminTranslationsManager = lazy(() => import("/src/components/Pages/Management/AdminTranslationsManager"));
const LandingFresh = lazy(() => import("/src/components/Pages/qrCodes/LandingFresh"));
const LandingNow = lazy(() => import("/src/components/Pages/qrCodes/LandingNow"));
const LandingSecret = lazy(() => import("/src/components/Pages/qrCodes/LandingSecret"));
const LandingStart = lazy(() => import("/src/components/Pages/qrCodes/LandingStart"));
const LandingToronto = lazy(() => import("/src/components/Pages/qrCodes/LandingToronto"));
const InvoiceDetail = lazy(() => import("/src/components/Pages/Booking/InvoiceDetail.jsx"));

registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log("App is ready to work offline");
  },
});

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

    const consent = JSON.parse(localStorage.getItem("cookieConsent") || "{}");
    if (consent.analytics) {
      // ✅ Load Google Analytics
      const gaScript = document.createElement("script");
      gaScript.async = true;
      gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-PTN1K0J7Q8";
      document.head.appendChild(gaScript);

      gaScript.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag("js", new Date());
        gtag("config", "G-PTN1K0J7Q8");
      };

      // ✅ Load Ahrefs Analytics
      const ahrefsScript = document.createElement("script");
      ahrefsScript.src = "https://analytics.ahrefs.com/analytics.js";
      ahrefsScript.defer = true;
      ahrefsScript.dataset.key = "uBTWwx1doWAXuF07h1ukDA";
      document.head.appendChild(ahrefsScript);
    }
  }, []);


  return (
    <React.StrictMode>
      <BrowserRouter>
        <MetaTags />
        <div className="fixed-top-container">
          {/* <SiteBanner /> */}
          <Navbar />
          {/* <NavigationBar /> */}
        </div>
        <div
          className="d-flex flex-column cleanar-surface"
          // style={{
          //   background: `linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url(${backgroundImage})`,
          //   backgroundRepeat: 'repeat',        // repeat the image like a mosaic
          //   backgroundSize: '100px 100px',     // size of each tile
          //   backgroundPosition: 'top left',    // starting position
          // }}
        >
          <main className="flex-grow-1 main-content">
            <Suspense fallback={<div className="py-5 text-center">Loading page…</div>}>
              <Routes>
              <Route path="/index" element={<Index />} />
              <Route path="/profile-page" element={<ProtectedRoute element={<ProfilePage />} />} />
              <Route path="/notification-management" element={<ProtectedRoute element={<NotificationAdminPage />} />} />
              {/* <Route path="/manage-categories" element={<ProtectedRoute element={<ManageCategories />} />} /> */}
              {/* <Route path="/manage-service" element={<ProtectedRoute element={<ManageService />} />} /> */}
              {/* <Route path="/manage-product" element={<ProtectedRoute element={<ManageProduct />} />} /> */}
              {/* <Route path="/manage-user" element={<ProtectedRoute element={<ManageUser />} />} /> */}
              {/* <Route path="/manage-gift-card" element={<ProtectedRoute element={<GiftCard />} />} /> */}
              {/* <Route path="/manage-customers" element={<ProtectedRoute element={<Customer />} />} /> */}
              {/* <Route path="/manage-finance" element={<ProtectedRoute element={<FinanceDashboard />} />} /> */}
              {/* <Route path="/view-quotes" element={<ProtectedRoute element={<QuickQuoteDashboard />} />} /> */}
              {/* <Route path="/manage-expenses" element={<ProtectedRoute element={<ExpenseDashboard />} />} /> */}
              <Route path="/quick-request-v2" element={<ProtectedRoute element={<QuickRequest_v2 />} />} />
              {/* <Route path="/admin-management" element={<ProtectedRoute element={<AdminManagementPage />} />} />
              <Route path="/inventory-management" element={<ProtectedRoute element={<InventoryManagementTabbedView />} />} />
              <Route path="/admin-contact-dashboard" element={<ProtectedRoute element={<AdminContactDashboard />} />} />
              <Route path="/contact-management" element={<ProtectedRoute element={<ContactManagementTabbedView />} />} />
              <Route path="/accounting-management" element={<ProtectedRoute element={<AccountingTabbedView />} />} /> */}
              {/* <Route path="/certifications-memberships" element={<CertificationsMembershipsPage />} /> */}
              <Route path="/blog" element={<BlogLandingPage />} />
              <Route
                path="/blog/cleanar-solutions-joins-issa-canada"
                element={<CleanARJoinsISSACanada />}
              />
              <Route
                path="/blog/cleanar-joins-cqcc"
                element={<CleanARJoinsCQCC />}
              />
              <Route path="/admin" element={<AdminManagementLayout />}>
                <Route index element={<Navigate to="booking" replace />} />
                <Route path="accounting" element={<AccountingTabbedView />} />
                <Route path="booking" element={<BookingTabbedView />} />
                <Route path="customer" element={<ContactManagementTabbedView />} />
                <Route path="inventory" element={<InventoryManagementTabbedView />} />
                <Route path="translations" element={<AdminTranslationsManager />} />
              </Route>
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              {/* <Route path="/view-quotes/:quoteId" element={<ProtectedRoute element={<ViewQuotes />} />} /> */}
              {/* <Route path="/dashboard" element={<ProtectedRoute element={<LogDashboard />} />} /> */}
              {/* <Route path="/booking-dashboard" element={<ProtectedRoute element={<BookingList />} />} /> */}
              {/* <Route path="/login-page" element={<LoginPage />} /> */}
              <Route path="/signup-page" element={<SignUp />} />
              <Route path='/login-signup' element={<LoginSign />} />
              {/* <Route path='/request-quote' element={<RequestQuote />} /> */}
              {/* <Route path='/chat-tool' element={<ChatTool />} /> */}
              <Route path="/careers" element={<Career />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/products-and-services" element={<ProductsAndServices />} />
              <Route path="/services/:serviceSlug" element={<ServiceLandingPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms-conditions" element={<Terms />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/now" element={<LandingNow />} />
              <Route path="/start" element={<LandingStart />} />
              <Route path="/toronto" element={<LandingToronto />} />
              <Route path="/fresh" element={<LandingFresh />} />
              <Route path="/secret" element={<LandingSecret />} />
              <Route path="/" element={<Navigate to="/index" />} />
              <Route path="*" element={<Navigate to="/index" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
        <CookieConsent />
        <Footer />
      </BrowserRouter>
    </React.StrictMode>
  );
};

root.render(<App />);
