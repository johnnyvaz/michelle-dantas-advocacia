"use client";

import { socialLinks } from "@/data/socials";
import { closeSideMenu } from "@/utlis/toggleSideMenu";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SiteMenu() {
  const contentRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current && // Check if click is inside #mobileMenu
        containerRef.current.contains(event.target) &&
        contentRef.current && // Check if click is outside .gt-menu-area
        !contentRef.current.contains(event.target)
      ) {
        closeSideMenu();
        // Add your custom logic here
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const form = useRef();

  const sandMail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm("service_noj8796", "template_fs3xchn", form.current, {
        publicKey: "iG4SCmR-YtJagQ4gV",
      })
      .then((res) => {
        if (res.status == 200) {
          toast.success("Message Sent successfully!", {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          form.current.reset();
        } else {
          toast.error("Ops Message not Sent!", {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      });
  };
  return (
    <div
      ref={containerRef}
      id="sideMenu"
      className="sidemenu-wrapper sidemenu-info d-none d-lg-block"
    >
      <div className="sidemenu-content" ref={contentRef}>
        <button onClick={closeSideMenu} className="closeButton sideMenuCls">
          <i className="far fa-times" />
        </button>
        <div className="widget">
          <div className="gt-widget-about">
            <div className="about-logo">
              <Link href="/">
                <Image
                  alt="techo"
                  src="/assets/img/logo-dark.png"
                  width="199"
                  height="42"
                />
              </Link>
            </div>
            <p className="text">
              Rapidiously myocardinate cross-platform intellectual capital
              model. Appropriately create interactive infrastructures
            </p>
          </div>
        </div>
        <div className="widget">
          <h3 className="widget_title">Get In Touch</h3>
          <div className="gt-widget-contact">
            <div className="info-box_text">
              <div className="icon">
                <Image
                  alt="img"
                  src="/assets/img/icon/location-dot.svg"
                  width="18"
                  height="20"
                />
              </div>
              <div className="details">
                <p>789 Inner Lane, Holy park,</p>
                <p>California, USA</p>
              </div>
            </div>
            <div className="info-box_text">
              <div className="icon">
                <Image
                  alt="img"
                  src="/assets/img/icon/phone.svg"
                  width="16"
                  height="16"
                />
              </div>
              <div className="details">
                <p>
                  <a href="tel:+0123456789" className="info-box_link">
                    +01 234 567 890
                  </a>
                </p>
                <p>
                  <a href="tel:+09876543210" className="info-box_link">
                    +09 876 543 210
                  </a>
                </p>
              </div>
            </div>
            <div className="info-box_text">
              <div className="icon">
                <Image
                  alt="img"
                  src="/assets/img/icon/envelope.svg"
                  width="19"
                  height="16"
                />
              </div>
              <div className="details">
                <p>
                  <a
                    href="mailto:mailinfo00@techo.com"
                    className="info-box_link"
                  >
                    mailinfo00@techo.com
                  </a>
                </p>
                <p>
                  <a
                    href="mailto:support24@techo.com"
                    className="info-box_link"
                  >
                    support24@techo.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="widget newsletter-widget">
          <h3 className="widget_title">Subscribe Now</h3>
          <form ref={form} className="newsletter-form" onSubmit={sandMail}>
            <div className="form-group">
              <input
                className="form-control"
                type="email"
                placeholder="Email Address"
                required
              />
              <button type="submit" className="gt-btn">
                <i className="far fa-paper-plane text-theme" />
              </button>
            </div>
          </form>
          <div className="gt-social mt-4">
            {socialLinks.map((link, index) => (
              <a href={link.href} key={index}>
                <i className={link.iconClass} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
