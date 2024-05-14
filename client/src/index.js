/*

=========================================================
* Now UI Kit React - v1.5.2
=========================================================

* Product Page: https://www.creative-tim.com/product/now-ui-kit-react
* Copyright 2023 Creative Tim (http://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/now-ui-kit-react/blob/main/LICENSE.md)

* Designed by www.invisionapp.com Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes,Router, Navigate } from "react-router-dom";

// styles for this kit
import "assets/css/bootstrap.min.css";
import "assets/scss/now-ui-kit.scss?v=1.5.0";
import "assets/demo/demo.css?v=1.5.0";
import "assets/demo/nucleo-icons-page-styles.css?v=1.5.0";
// pages for this kit
import Index from "views/Index.js";
import NucleoIcons from "views/NucleoIcons.js";
import LoginPage from "../src/components/Pages/LoginPage";
import LandingPage from "views/examples/LandingPage.js";
import ProfilePage from "views/examples/ProfilePage.js";
import SignUp from "views/index-sections/SignUp";
import ManageService from "../src/components/Pages/ManageService";
import ManageProduct from "../src/components/Pages/ManageProduct";
import RequestQuote from "../src/components/Pages/RequestQuote";
// import Switch from "react-bootstrap-switch";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/index" element={<Index />} />
      <Route path="/nucleo-icons" element={<NucleoIcons />} />
      <Route path="/landing-page" element={<LandingPage />} />
      <Route path="/profile-page" element={<ProfilePage />} />
      <Route path="/manage-service" element={<ManageService />} />
      <Route path="/manage-product" element={<ManageProduct />} />
      <Route path="/login-page" element={<LoginPage />} />
      <Route path="/signup-page" element={<SignUp />} />
      <Route path='/request-quote' element={<RequestQuote
            
      />} />
      <Route path="/" element={<Navigate to="/index" />} />


      <Route path="*" element={<Navigate to="/index" replace />} />
    </Routes>
  </BrowserRouter>
  // <Router>
  //   <Switch>
  //     <Route path="/index" component={Index} />
  //     <Route path="/nucleo-icons" component={NucleoIcons} />
  //     <Route path="/landing-page" component={LandingPage} />
  //     <Route path="/profile-page" component={ProfilePage} />
  //     <Route path="/manage-service" component={ManageService} />
  //     <Route path="/manage-product" component={ManageProduct} />
  //     <Route path="/login-page" component={LoginPage} />
  //     <Route path="/signup-page" component={SignUp} />
  //     <Route path='/request-quote' component={RequestQuote} />
  //     <Route path="/" component={Index} />
  //   </Switch>
  // </Router>
);
