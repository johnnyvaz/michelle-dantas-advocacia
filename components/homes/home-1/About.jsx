"use client";
import { fancyBoxes } from "@/data/features";
import Link from "next/link";
import Image from "next/image";
import ModalVideo from "react-modal-video";
import { useState } from "react";

export default function About() {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <section className="about-area space fix position-reltive">
        <div className="about-wrap style1">
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
            <div className="about-wrapper style1">
              <div
                className="about-thumb-box wow fadeInLeft"
                data-wow-delay=".4s"
              >
                <div className="about-thumb-box about-thumb1">
                  <Image
                    alt="thumb"
                    src="/assets/img/about/aboutThumb1_1.png"
                    width="439"
                    height="483"
                  />
                </div>
                <div className="about-thumb-box about-thumb2">
                  <Image
                    alt="thumb"
                    src="/assets/img/about/aboutThumb1_2.png"
                    width="262"
                    height="221"
                  />
                  <a
                    onClick={() => setOpen(true)}
                    className="play-btn popup-video"
                  >
                    <i className="fa-sharp fa-solid fa-play" />
                  </a>
                </div>
                <div className="about-thumb-box counter-box style1 movingX">
                  <div className="about-thumb-box counter-box_icon">
                    <Image
                      alt="icon"
                      src="/assets/img/icon/aboutIcon1_1.png"
                      width="52"
                      height="52"
                    />
                  </div>
                  <div className="about-thumb-box counter-box_counter">
                    <div>
                      <span className="counter-number">6,561</span>
                      <span className="plus">+</span>
                    </div>
                    <span>Satisfied Clients</span>
                  </div>
                </div>
                <div className="about-thumb-box line jump d-none d-sm-block" />
              </div>
              <div
                className="about-content wow fadeInRight"
                data-wow-delay=".6s"
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
                    What We Do{' '}
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
                    We Are Increasing Business Success With Technology
                  </h2>
                  <p className="text">
                    It is a long established fact that a reader will be
                    distracted the readable content of a page when looking at
                    layout the point.
                  </p>
                </div>
                <div className="fancy-box-wrapper">
                  {fancyBoxes.map((box, index) => (
                    <div className="fancy-box style1" key={index}>
                      <div className="fancy-box_icon">
                        <Image
                          src={box.icon}
                          width={44}
                          height={44}
                          alt="icon"
                        />
                      </div>
                      <div className="fancy-box_content">
                        <h4>{box.title}</h4>
                        <span>{box.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="profile-wrapper">
                  <Link
                    scroll={false}
                    href={`/contact`}
                    className="gt-btn gt-btn-icon"
                  >
                    GET IN TOUCH
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
