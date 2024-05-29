import React from "react";

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";
import AboutUsPage from "components/Pages/AboutUsPage";

function Index() {


  React.useEffect(() => {
    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    // initializeServices();
    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
      <Navbar  />
      <div className="wrapper">
        <AboutUsPage />
        <div className="main">
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Index;
