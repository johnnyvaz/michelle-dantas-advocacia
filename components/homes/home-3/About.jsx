import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function About() {
  return (
    <section className="about-area fix position-relative">
      <div className="shape3_1 d-none d-xl-block">
        <Image
          alt="shape"
          src="/assets/img/shape/aboutShape2_1.png"
          width="251"
          height="486"
        />
      </div>
      <div className="shape3_2 d-none d-xl-block">
        <Image
          alt="shape"
          src="/assets/img/shape/aboutShape2_2.png"
          width="188"
          height="275"
        />
      </div>
      <div className="container">
        <div className="about-wrapper style3 pt-50 space-bottom">
          <div className="about-thumb-box wow fadeInLeft" data-wow-delay=".3s">
            <div className="about-thumb-box thumb-bg">
              <Image
                data-tilt=""
                data-tilt-max={10}
                alt="bg"
                src="/assets/img/bg/aboutBg3_1.png"
                width="465"
                height="350"
              />
            </div>
            <div className="about-thumb-box about-thumb1">
              <Image
                data-tilt=""
                data-tilt-max={18}
                alt="thumb"
                src="/assets/img/about/aboutThumb3_1.png"
                width="340"
                height="548"
              />
            </div>
            <div className="about-thumb-box movingX about-thumb2">
              <Image
                alt="thumb"
                src="/assets/img/about/aboutThumb3_2.png"
                width="256"
                height="147"
              />
            </div>
            <div className="about-thumb-box jump about-thumb3">
              <Image
                alt="thumb"
                src="/assets/img/about/aboutThumb3_3.png"
                width="254"
                height="145"
              />
            </div>
            <div className="about-thumb-box spin about-icon1">
              <Image
                alt="thumb"
                src="/assets/img/icon/starIcon3_1.png"
                width="34"
                height="34"
              />
            </div>
            <div className="about-thumb-box spin about-icon2">
              <Image
                alt="thumb"
                src="/assets/img/icon/starIcon3_2.png"
                width="24"
                height="24"
              />
            </div>
            <div className="about-thumb-box spin about-icon3">
              <Image
                alt="thumb"
                src="/assets/img/icon/starIcon3_3.png"
                width="14"
                height="14"
              />
            </div>
            <div className="about-thumb-box spin about-icon4">
              <Image
                alt="thumb"
                src="/assets/img/icon/starIcon3_4.png"
                width="24"
                height="24"
              />
            </div>
            <div className="about-thumb-box d-none d-xl-block about-icon5">
              <Image
                alt="thumb"
                src="/assets/img/icon/aboutIcon3_1.png"
                width="44"
                height="44"
              />
            </div>
          </div>
          <div className="about-content wow fadeInRight" data-wow-delay=".6s">
            <div className="title-area">
              <h5 className="subtitle text-start">
                {" "}
                <span>
                  <Image
                    alt="icon"
                    src="/assets/img/icon/titleIcon.png"
                    width="28"
                    height="12"
                  />
                </span>{" "}
                About our APP{" "}
                <span>
                  <Image
                    alt="icon"
                    src="/assets/img/icon/titleIcon.png"
                    width="28"
                    height="12"
                  />
                </span>{" "}
              </h5>
              <h3 className="title text-start">
                Generate Stunning Applications With Powerful Workflows
              </h3>
              <p className="text">
                It is a long established fact that a reader will be distracted
                the readable content of a page when looking at layout the point.
              </p>
            </div>
            <h3 className="text-title">
              let’s get in touch and have discussion!
            </h3>
            <div className="fancy-box-wrapper">
              <div className="fancy-box style1">
                <div className="fancy-box_icon">
                  <Image
                    alt="icon"
                    src="/assets/img/icon/aboutIcon1_2.png"
                    width="44"
                    height="44"
                  />
                </div>
                <div className="fancy-box_content">
                  <h4>Brand Design Identity</h4>
                </div>
              </div>
              <div className="fancy-box style1">
                <div className="fancy-box_icon">
                  <Image
                    alt="icon"
                    src="/assets/img/icon/aboutIcon1_3.png"
                    width="44"
                    height="44"
                  />
                </div>
                <div className="fancy-box_content">
                  <h4>App Analytics Services</h4>
                </div>
              </div>
            </div>
            <div className="profile-wrapper">
              <Link
                scroll={false}
                href={`/contact`}
                className="gt-btn gt-btn-icon"
              >
                GET IN TOUCH
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
