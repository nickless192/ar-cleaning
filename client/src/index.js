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
import NucleoIcons from "views/NucleoIcons.js";
import LoginPage from "../src/components/Pages/LoginPage";
import ProfilePage from "../src/components/Pages/ProfilePage";
import SignUp from "../src/components/Pages/SignUp";
import ManageService from "../src/components/Pages/ManageService";
import ManageProduct from "../src/components/Pages/ManageProduct";
import ManageUser from "../src/components/Pages/ManageUser";
import RequestQuote from "../src/components/Pages/RequestQuote";
import ViewQuotes from "../src/components/Pages/ViewQuotes";
import ProductsAndServices from "../src/components/Pages/ProductsAndServices";
// import Switch from "react-bootstrap-switch";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/index" element={<Index />} />
      <Route path="/nucleo-icons" element={<NucleoIcons />} />
      <Route path="/profile-page" element={<ProfilePage />} />
      <Route path="/manage-service" element={<ManageService />} />
      <Route path="/manage-product" element={<ManageProduct />} />
      <Route path="/manage-user" element={<ManageUser />} />
      <Route path="/view-quotes" element={<ViewQuotes />} />
      <Route path="/login-page" element={<LoginPage />} />
      <Route path="/signup-page" element={<SignUp />} />
      <Route path='/request-quote' element={<RequestQuote/>} />
      <Route path="/products-and-services" element={<ProductsAndServices />} />
      <Route path="/" element={<Navigate to="/index" />} />


      <Route path="*" element={<Navigate to="/index" replace />} />
    </Routes>
  </BrowserRouter>
);
