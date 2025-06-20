import React from "react";

// reactstrap components
import { Container } from "reactstrap";

// core components

function ProfilePageHeader({name, email, phonenumber, address, city, province, postalcode, howDidYouHearAboutUs, companyName }) {
  let pageHeader = React.createRef();

  React.useEffect(() => {

    console.log(name);
    if (window.innerWidth > 991) {
      const updateScroll = () => {
        let windowScrollTop = window.pageYOffset / 3;
        pageHeader.current.style.transform =
          "translate3d(0," + windowScrollTop + "px,0)";
      };
      window.addEventListener("scroll", updateScroll);
      return function cleanup() {
        window.removeEventListener("scroll", updateScroll);
      };
    }
  });
  return (
    <>
      <div
        className="page-header clear-filter page-header-small"
        filter-color="blue"
      >
        <div
          className="page-header-image"
          style={{
            backgroundImage: "url(" + require("assets/img/bg5.jpg") + ")"
          }}
          ref={pageHeader}
        ></div>
        <Container>
          <div className="photo-container">
            <img alt="..." src={require("assets/img/ryan.jpg")}></img>
          </div>
          <h3 className="title">{name}</h3>
          <p className="category">{
          (address === undefined || city === undefined || postalcode === undefined || province === undefined ) 
          ? 
          "Add address" : 
          (`${address}{", "}${city}{", "}${postalcode}{", "}${province}`) }</p>
          <div className="content">
            <div className="social-description">
              <h4>Phone Number</h4>
              <p>{(phonenumber === undefined) ? "Add phone number": phonenumber}</p>
            </div>
            <div className="social-description">
              <h4>Email Address</h4>
              <p>{(email === undefined)? "Add email" : email}</p>
            </div>
            <div className="social-description">
              <h4>Company Name</h4>
              <p>{(companyName === undefined)? "Add company Name" : companyName}</p>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export default ProfilePageHeader;
