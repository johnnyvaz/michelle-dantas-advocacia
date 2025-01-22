"use client";
import Link from "next/link";
import Image from "next/image";
import { recentPosts } from "@/data/blogs";
import { socialLinks2 } from "@/data/socials";
import { footerLinks } from "@/data/footer";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useRef } from "react";

export default function Footer2() {
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
    <footer
      className="footer-area"
      data-bg-src
      style={{ backgroundImage: "url(/assets/img/bg/footerBg2.png)" }}
    >
      <div className="widget-area style2  pt-0 pb-90">
        <div className="shape2_1 d-none d-xl-block">
          {" "}
          <Image   alt="shape"    src="/assets/img/shape/footerShape2_1.png" width="384" height="441" />{" "}
        </div>
        <div className="shape2_2">
          {" "}
          <Image   alt="shape"    src="/assets/img/shape/footerShape2_2.png" width="288" height="383" />{" "}
        </div>
        <div className="shape2_3">
          {" "}
          <Image   alt="shape"    src="/assets/img/shape/footerShape1_1.png" width="361" height="372" />{" "}
        </div>
        <div className="container">
          <div className="footer-layout style2">
            <div className="row">
              <div className="col-xl-3 col-md-6 col-12">
                <div className="widget footer-widget">
                  <div className="gt-widget-about">
                    <div className="about-logo">
                      <Link scroll={false} href={`/`}>
                        <Image   width={199}
                          height={42}
                          alt="Realar"    src="/assets/img/logo-white.png" />
                      </Link>
                    </div>
                    <p className="about-text">
                      {" "}
                      TechBe IT is a dynamic and innovative technology company
                      dedicated to solutions.
                    </p>
                    <div className="gt-social style2">
                      {socialLinks2.map((link, index) => (
                        <a href={link.href} key={index}>
                          <i className={link.iconClass} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-md-6 col-12">
                <div className="widget widget_nav_menu footer-widget">
                  <h3 className="widget_title">Quick Links</h3>
                  <div className="menu-all-pages-container">
                    <ul className="menu">
                      {footerLinks.map((item, index) => (
                        <li key={index}>
                          <Link scroll={false} href={item.href}>
                            <i className="fa-solid fa-chevrons-right" />
                            {item.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6 col-12">
                <div className="widget footer-widget">
                  <h3 className="widget_title">Recent Posts</h3>
                  <div className="recent-post-wrap">
                    {recentPosts.map((post) => (
                      <div className="recent-post" key={post.id}>
                        <div className="media-img">
                          <Link
                            scroll={false}
                            href={`/blog-details/${post.id}`}
                          >
                            <Image
                              src={post.imageUrl}
                              width={78}
                              height={79}
                              alt="thumb"
                            />
                          </Link>
                        </div>
                        <div className="media-body">
                          <div className="recent-post-meta">
                            <Link
                              scroll={false}
                              href={`/blog-details/${post.id}`}
                            >
                              <i className="fa-regular fa-clock" />
                              {post.date}
                            </Link>
                          </div>
                          <h4 className="post-title">
                            <Link
                              scroll={false}
                              className="text-inherit"
                              href={`/blog-details/${post.id}`}
                            >
                              {post.title}
                            </Link>
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6 col-12">
                <div className="widget widget_nav_menu footer-widget">
                  <h3 className="widget_title">Contact Us</h3>
                  <div className="checklist">
                    <ul className="ps-0">
                      <li className="text-white">
                        <i className="fa-thin fa-envelope" />
                      </li>
                      <li className="text-white">info@example.com</li>
                    </ul>
                    <ul className="ps-0">
                      <li className="text-white">
                        <i className="fa-light fa-phone-volume" />
                      </li>
                      <li className="text-white">+208-6666-0112</li>
                    </ul>
                    <form
                      ref={form}
                      onSubmit={sandMail}
                      className="email-input-container"
                    >
                      <input
                        type="email"
                        id="email"
                        placeholder="Your email address"
                        required
                      />
                      <button type="submit" id="submitButton" disabled="">
                        <i className="fa-regular fa-arrow-right-long" />
                      </button>
                    </form>
                    <form id="termsForm">
                      <label className="custom-checkbox">
                        <input
                          type="checkbox"
                          name="agree"
                          id="agreeCheckbox"
                        />
                        <span className="checkmark" />I agree to the{" "}
                        <Link
                          scroll={false}
                          className="text-underline"
                          href={`/about`}
                        >
                          Privacy Policy.
                        </Link>
                      </label>
                      <br />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright-wrap bg-theme">
        <div className="container">
          <div className="copyright-layout">
            <div className="layout-text">
              <p className="copyright">
                <i className="fal fa-copyright" /> All Copyright 2024 by{" "}
                <Link scroll={false} href={`/`}>
                  Techbe
                </Link>
              </p>
            </div>
            <div className="layout-link">
              <div className="link-wrapper">
                <Link scroll={false} href={`/home-3`}>
                  Terms &amp; Condition{" "}
                </Link>
                <Link scroll={false} href={`/home-3`}>
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
