"use client";
import Link from "next/link";
import Image from "next/image";
import ModalVideo from "react-modal-video";
import { useState } from "react";

export default function About() {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <section className="about-area">
        <div
          className="about-wrap style2 space-top pb-233 fix fix position-reltive"
          data-bg-src=""
          style={{ backgroundImage: "url(/assets/img/bg/aboutBg2_1.png)" }}
        >
          <div className="shape1_1 d-xl-block d-none">
            <Image
              alt="shape"
              src="/assets/img/shape/aboutShape1_1.png"
              width="270"
              height="733"
            />
          </div>
          <div className="shape1_2 movingX d-xl-block d-none">
            <Image
              alt="shape"
              src="/assets/img/shape/aboutShape1_2.png"
              width="188"
              height="275"
            />
          </div>
          <div className="container">
            <div className="about-wrapper style2">
              <div
                className="about-thumb-box wow fadeInUp"
                data-wow-delay=".6s"
              >
                <div className="about-thumb-box about-thumb1">
                  <Image
                    alt="thumb"
                    src="/assets/img/about/aboutThumb2_1.png"
                    width="682"
                    height="561"
                  />
                  <a
                    onClick={() => setOpen(true)}
                    className="play-btn style4 popup-video"
                  >
                    <i className="fa-sharp fa-solid fa-play" />
                  </a>
                </div>
                <div className="about-thumb-box line jump" />
              </div>
              <div
                className="about-content wow fadeInRight"
                data-wow-delay="1s"
              >
                <div className="title-area">
                  <h5 className="subtitle text-start">
                    <span>
                      <Image
                        alt="icon"
                        src="/assets/img/icon/titleIcon.png"
                        width="28"
                        height="12"
                      />
                    </span>{' '}
                    About us Techbe{' '}
                    <span>
                      <Image
                        alt="icon"
                        src="/assets/img/icon/titleIcon.png"
                        width="28"
                        height="12"
                      />
                    </span>
                  </h5>
                  <h2 className="title text-start">
                    We Can Clients with the About Solution
                  </h2>
                  <p className="text">
                    It is a long established fact that a reader will be
                    distracted the readable content of a page when looking at
                    layout the point.
                  </p>
                </div>
                <div className="fancy-box-wrapper">
                  <div className="fancy-box">
                    <div className="checklist mt-0 mb-0">
                      <ul className="ps-0">
                        <li>
                          <Image
                            alt="icon"
                            src="/assets/img/icon/signIcon.png"
                            width="16"
                            height="16"
                          />
                        </li>
                        <li>Branding And Design Identity</li>
                      </ul>
                      <ul className="ps-0">
                        <li>
                          <Image
                            alt="icon"
                            src="/assets/img/icon/signIcon.png"
                            width="16"
                            height="16"
                          />
                        </li>
                        <li>Web site Marketing Solutions</li>
                      </ul>
                      <ul className="ps-0">
                        <li>
                          <Image
                            alt="icon"
                            src="/assets/img/icon/signIcon.png"
                            width="16"
                            height="16"
                          />
                        </li>
                        <li>unlimited Download Data</li>
                      </ul>
                    </div>
                  </div>
                  <div className="fancy-box d-flex justify-content-start justify-content-md-end">
                    <div className="counter-box style1">
                      <div className="counter-box_icon">
                        <Image
                          alt="icon"
                          src="/assets/img/icon/aboutIcon1_1.png"
                          width="52"
                          height="52"
                        />
                      </div>
                      <div className="counter-box_counter">
                        <div>
                          <span className="counter-number">6,561</span>
                          <span className="plus">+</span>
                        </div>
                        <span>Satisfied Clients</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="profile-wrapper">
                  <Link
                    scroll={false}
                    href={`/contact`}
                    className="gt-btn gt-btn-icon"
                  >
                    EXPLORE MORE
                  </Link>
                  <div className="fancy-box style1">
                    <div className="fancy-box_icon">
                      <Image
                        alt="img"
                        src="/assets/img/about/aboutProfile1_1.png"
                        width="56"
                        height="56"
                      />
                    </div>
                    <div className="fancy-box_content">
                      <h4>Ronald Richards</h4>
                      <span>Co, Founder</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>{" "}
      <ModalVideo
        channel="youtube"
        youtube={{ mute: 0, autoplay: 0 }}
        isOpen={isOpen}
        videoId="f2Gzr8sAGB8"
        onClose={() => setOpen(false)}
      />
    </>
  );
}
