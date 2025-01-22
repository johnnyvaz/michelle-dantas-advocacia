import React from "react";

export default function HeaderTop() {
  return (
    <div className="header-top-section style1 fix">
      <div className="container">
        <div className="header-top-wrapper">
          <ul className="contact-list">
            <li>
              <i className="far fa-envelope" />
              <a href="mailto:info@example.com" className="link">
                info@example.com
              </a>
            </li>
            <li>
              <i className="fa-solid fa-phone-volume" />
              <a href="tel:2086660112">+208-666-0112</a>
            </li>
          </ul>
          <div className="top-right">
            <div className="social-icon d-flex align-items-center">
              <span>Follow Us:</span>
              <a href="#">
                <i className="fab fa-facebook-f" />
              </a>
              <a href="#">
                <i className="fab fa-twitter" />
              </a>
              <a href="#">
                <i className="fa-brands fa-linkedin-in" />
              </a>
              <a href="#">
                <i className="fa-brands fa-youtube" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
