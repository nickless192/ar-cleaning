import React from "react";
import { useState } from "react";


// reactstrap components
// import {
// } from "reactstrap";

// core components
// import IndexNavbar from "components/Navbars/IndexNavbar.js";
// import IndexHeader from "components/Headers/IndexHeader.js";
import Navbar from "components/Pages/Navbar.js";
// import AboutUs from "components/Pages/AboutUs.js";
import Footer from "components/Pages/Footer.js";

// import ProfilePage from "./examples/ProfilePage";
import LandingPage from "./examples/LandingPage";
import RequestQuote from "components/Pages/RequestQuote";
import ViewQuotes from "components/Pages/ViewQuotes";
import ProductsAndServices from "components/Pages/ProductsAndServices";
import AboutUsPage from "components/Pages/AboutUsPage";
import ManageService from "components/Pages/ManageService";
// import ViewServices from "components/Pages/ViewServices";
import ManageProduct from "components/Pages/ManageProduct";
// import { set } from "mongoose";

// sections for this page
// import Images from "./index-sections/Images.js";
// import BasicElements from "./index-sections/BasicElements.js";
// import Navbars from "./index-sections/Navbars.js";
// import Tabs from "./index-sections/Tabs.js";
// import Pagination from "./index-sections/Pagination.js";
// import Notifications from "./index-sections/Notifications.js";
// import Typography from "./index-sections/Typography.js";
// import Javascript from "./index-sections/Javascript.js";
// import Carousel from "./index-sections/Carousel.js";
import NucleoIcons from "./index-sections/NucleoIcons.js";
import { set } from "mongoose";
// import CompleteExamples from "./index-sections/CompleteExamples.js";
// import SignUp from "./index-sections/SignUp.js";
// import Examples from "./index-sections/Examples.js";
// import Download from "./index-sections/Download.js";

function Index() {

  // const [services, setServices] = useState([]);
  // const [products, setProducts] = useState([]);
  // const [adminFlag, setAdminFlag] = useState(false);
  // const adminFlag = localStorage.getItem('adminFlag');

  // const [services, setServices] = useState(localServices);
  // console.log(services);
  // setServices(localServices);


  React.useEffect(() => {

    // const initializeServices = () => {
    //   const localServices = [];
    //   const localProducts = [];

    //   fetch(`/api/services`, {
    //     method: 'get',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Accept': 'application/json'
    //     }
    //   }
    //   )
    //     .then(response => {
    //       if (response.ok) {
    //         response.json()
    //           .then(data => {
    //             console.log(data);
    //             for (let i = 0; i < data.length; i++) {
    //               console.log(data[i].name);
    //               localServices.push({ name: data[i].name, id: data[i]._id, serviceCost: data[i].serviceCost });
    //               // setServices(...services, { name: data[i].name, id: data[i]._id, serviceCost: data[i].serviceCost });
    //             }
    //             setServices(localServices);
    //             return localServices;

    //           })
    //           .then(localServices => {
    //             setServices(localServices);
    //             // console.log(services);
    //             console.log(localServices);

    //           },)
    //       } else {
    //         console.log(response.statusText);
    //       }
    //     })

    //   fetch('/api/products', {
    //     method: 'get',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Accept': 'application/json'
    //     }
    //   })
    //     .then(response => {
    //       if (response.ok) {
    //         response.json()
    //           .then(data => {
    //             console.log(data);
    //             for (let i = 0; i < data.length; i++) {
    //               console.log(data[i].name);
    //               localProducts.push({ name: data[i].name, id: data[i]._id, productCost: data[i].productCost });
    //               // setServices(...services, { name: data[i].name, id: data[i]._id, serviceCost: data[i].serviceCost });
    //             }
    //             setProducts(localProducts);
    //             return localProducts;

    //           })
    //           .then(localProducts => {
    //             setProducts(localProducts);
    //             // console.log(services);
    //             console.log(localProducts);

    //           },)
    //       } else {
    //         console.log(response.statusText);
    //       }
    //     })

    //     // setAdminFlag(localStorage.getItem('adminFlag'));
    // }
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
        {/* <AboutUs /> */}
        <AboutUsPage />
        <div className="main">
          {/* <Images />
          <BasicElements />
          <Navbars />
          <Tabs />
          <Pagination />
          <Notifications />
          <Typography />
          <Javascript />
  <Carousel />*/}
          {/* <NucleoIcons /> */}
          {/*<CompleteExamples />
          <SignUp />
          <Examples />
        <Download /> */}
          {/* <ManageService />
          <ManageProduct /> */}
          {/* <RequestQuote
            // services={services}
            // products={products}
          /> */}
          {/* <LandingPage /> */}
          {/* <ViewServices /> */}
           <ViewQuotes />
          <ProductsAndServices />
          {/* <ProfilePage /> */}
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Index;
