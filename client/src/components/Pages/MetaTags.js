// components/MetaTags.jsx
import React from 'react';
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
    <link rel="canonical" href="https://www.cleanarsolutions.ca/index" />

    {/* Open Graph Tags */}
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.cleanarsolutions.ca/index" />
    <meta property="og:title" content="CleanAR Solutions - Professional Cleaning Services" />
    <meta property="og:description" content="Expert cleaning services in Toronto & GTA. Book your professional cleaning service today and enjoy a spotless environment!" />
    <meta property="og:image" content="https://www.cleanarsolutions.ca/static/media/IC%20CLEAN%20AR-15-cropped.32f050a6a0836902ad34.png" />
    <meta property="og:image:alt" content="CleanAR Solutions Professional Cleaning Services" />
    <meta property="og:site_name" content="CleanAR Solutions" />
    <meta property="og:locale" content="en_CA" />

    {/* Instagram Tags */}
    <meta name="instagram:card" content="summary_large_image" />
    <meta name="instagram:site" content="@cleanarsolutions" />
    <meta name="instagram:title" content="CleanAR Solutions - Professional Cleaning Services" />
    <meta name="instagram:description" content="Expert cleaning services in Toronto & GTA. Book your professional cleaning service today and enjoy a spotless environment!" />
    <meta name="instagram:image" content="https://www.cleanarsolutions.ca/static/media/IC%20CLEAN%20AR-15-cropped.32f050a6a0836902ad34.png" />
    <meta name="instagram:image:alt" content="CleanAR Solutions Professional Cleaning Services" />
    <meta name="instagram:image:width" content="1200" />
    <meta name="instagram:image:height" content="630" />
    <meta name="instagram:site" content="@cleanarsolutions" />
    <meta name="instagram:creator" content="@cleanarsolutions" />
    <meta name="instagram:label1" content="Est. reading time" />
    <meta name="instagram:data1" content="3 minutes" />
    <meta name="instagram:label2" content="Written by" />
    <meta name="instagram:data2" content="@cleanarsolutions" />
    <meta name="instagram:domain" content="CleanAR Solutions" />
    <meta name="instagram:app:name:iphone" content="CleanAR Solutions" />
    <meta name="instagram:app:id:iphone" content="4374405514" />
    <meta name="instagram:app:name:ipad" content="CleanAR Solutions" />
    <meta name="instagram:app:id:ipad" content="4374405514" />
    <meta name="instagram:app:name:googleplay" content="CleanAR Solutions" />
    <meta name="instagram:app:id:googleplay" content="ca.cleanarsolutions" />
    <meta name="instagram:app:country" content="CA" />
    
    

    {/* Additional SEO Meta Tags */}
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </Helmet>
    </>

;

export default MetaTags;