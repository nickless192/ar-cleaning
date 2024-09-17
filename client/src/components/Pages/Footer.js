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
            <li>
              <a href="/careers">
                Work With Us
              </a>
            </li>
            <li>
              <a href="https://g.page/r/Cek9dkmHVuBKEAE/review" target="_blank">              
                Provide A Review
              </a>
            </li>                        
            <li>
              <a href="/terms-conditions">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="/disclaimer">
                Disclaimer
              </a>
            </li>
            {/* <li>
              <a href="/return-refund-policy">
                Refund Policy
              </a>
            </li> */}
            {/* <li>
              <a href="/sitemap">
                Sitemap
              </a>
            </li> */}
            <li>
              <a href="/accessibility-statement">
                Accessibility Statement
              </a>
            </li>
            {/* <li>
              <a href="/newsletter-signup" target="_blank">
                Newsletter Signup
              </a>
            </li> */}
          </ul>
        </nav>
        <div className="copyright" id="copyright">
          © {new Date().getFullYear()}, Designed and Coded by{" "}
          <a href="_blank" target="_blank">
            Omar Rodriguez
          </a>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
