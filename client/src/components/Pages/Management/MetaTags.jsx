// components/MetaTags.jsx
import React from 'react';
// import { Helmet, HelmetProvider } from "react-helmet-async";
import { Helmet } from "react-helmet";

const MetaTags = () => 

    <>
  <Helmet>
    {/* Basic Meta Tags */}
    <title>CleanAR Solutions - Professional Cleaning Services in Toronto & GTA</title>
    <meta name="description" content="Professional cleaning services in Toronto & GTA. Residential, commercial, carpet & upholstery cleaning. 10+ years of experience. Get your free quote today!" />
    <meta name="keywords" content="cleaning services toronto, professional cleaning, residential cleaning, commercial cleaning, carpet cleaning, upholstery cleaning, CleanAR Solutions" />
    <meta name="author" content="CleanAR Solutions" />
    
    {/* Canonical URL to prevent duplicate content */}
    {/* <link rel="canonical" href="https://www.cleanarsolutions.ca/index" /> */}

    {/* Open Graph Tags */}
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.cleanarsolutions.ca/" />
    <meta property="og:title" content="CleanAR Solutions - Professional Cleaning Services" />
    <meta property="og:description" content="Expert cleaning services in Toronto & GTA. Book your professional cleaning service today and enjoy a spotless environment!" />
    <meta property="og:image" content="https://www.cleanarsolutions.ca/static/media/IC%20CLEAN%20AR-15-cropped.32f050a6a0836902ad34.png" />
    <meta property="og:image:alt" content="CleanAR Solutions Professional Cleaning Services" />
    <meta property="og:site_name" content="CleanAR Solutions" />
    <meta property="og:locale" content="en_CA" />

    
    {/* Additional SEO Meta Tags */}
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow" />
  </Helmet>
    </>

;

export default MetaTags;