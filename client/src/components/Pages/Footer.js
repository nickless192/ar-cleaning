/*eslint-disable*/
import React from "react";

// reactstrap components
import { Container } from "reactstrap";

function Footer() {
  return (
    <footer className="footer light-blue-bg-color" >
      <Container>
        <nav>
          <ul>
            {/* <li>
              <a href="/privacy-policy" target="_blank">
                Privacy Policy
              </a>
            </li> */}
            <li>
              <a href="/terms-conditions" target="_blank">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="/disclaimer" target="_blank">
                Disclaimer
              </a>
            </li>
            {/* <li>
              <a href="/return-refund-policy" target="_blank">
                Refund Policy
              </a>
            </li> */}
            {/* <li>
              <a href="/sitemap" target="_blank">
                Sitemap
              </a>
            </li> */}
            <li>
              <a href="/accessibility-statement" target="_blank">
                Accessibility Statement
              </a>
            </li>
            <li>
              <a href="/testimonials-reviews" target="_blank">
                Testimonials/Reviews
              </a>
            </li>            
            {/* <li>
              <a href="/newsletter-signup" target="_blank">
                Newsletter Signup
              </a>
            </li> */}
          </ul>
        </nav>
        {/* <div className="payment-methods">
          <img src="/images/payment-method1.png" alt="Payment Method 1" />
          <img src="/images/payment-method2.png" alt="Payment Method 2" />
        </div> */}
        <div className="copyright" id="copyright">
          © {new Date().getFullYear()}, Designed and Coded by{" "}
          <a href="_blank" target="_blank">
            Nickless192
          </a>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
