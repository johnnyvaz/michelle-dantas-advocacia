import { progressData } from "@/data/skills";
import React from "react";
import Image from "next/image";
import Progress from "@/components/common/Progress";

export default function Skills() {
  return (
    <section className="skill-area">
      <div
        className="skill-wrap style1 space fix"
        data-bg-src=""
        style={{ backgroundImage: "url(/assets/img/bg/skillBg1_1.png)" }}
      >
        <div className="shape1_1 d-none d-xl-block">
          <Image
            alt="shape"
            src="/assets/img/shape/skillShape1_1.png"
            width="96"
            height="34"
          />
        </div>
        <div className="shape1_2 d-none d-xl-block">
          <Image
            alt="shape"
            src="/assets/img/shape/skillShape1_2.png"
            width="288"
            height="383"
          />
        </div>
        <div className="container">
          <div className="skill-wrapper style1">
            <div
              className="skill-content order-2 order-xl-1 wow fadeInLeft"
              data-wow-delay=".6s"
            >
              <div className="title-area">
                <h5
                  className="subtitle text-start wow fadeInUp"
                  data-wow-delay=".3s"
                >
                  <span>
                    <Image
                      alt="icon"
                      src="/assets/img/icon/titleIcon.png"
                      width="28"
                      height="12"
                    />
                  </span>{' '}
                  Our It Skill{' '}
                  <span>
                    <Image
                      alt="icon"
                      src="/assets/img/icon/titleIcon.png"
                      width="28"
                      height="12"
                    />
                  </span>
                </h5>
                <h2
                  className="title text-start wow fadeInUp"
                  data-wow-delay=".6s"
                >
                  We Prominent Truly Trusted IT Business Solutions
                </h2>
                <p className="text wow fadeInUp" data-wow-delay=".9s">
                  It is a long established fact that a reader will be distracted
                  the readable content of a page when looking at layout the
                  point.
                </p>
              </div>
              <div
                className="fancy-box-wrapper wow fadeInUp"
                data-wow-delay=".6s"
              >
                <div className="fancy-box">
                  <div className="checklist mt-0 mb-0">
                    <ul className="ps-0 ms-0">
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
                    <ul className="ps-0 ms-0">
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
                  </div>
                </div>
                <div className="fancy-box">
                  <div className="checklist mt-0 mb-0">
                    <ul className="ps-0 ms-0">
                      <li>
                        <Image
                          alt="icon"
                          src="/assets/img/icon/signIcon.png"
                          width="16"
                          height="16"
                        />
                      </li>
                      <li>24/7 system Monitoring</li>
                    </ul>
                    <ul className="ps-0 ms-0">
                      <li>
                        <Image
                          alt="icon"
                          src="/assets/img/icon/signIcon.png"
                          width="16"
                          height="16"
                        />
                      </li>
                      <li>Unlimited Download Data</li>
                    </ul>
                  </div>
                </div>
              </div>
              {progressData.map((item, index) => (
                <div
                  className="progress-wrap wow fadeInUp"
                  data-wow-delay={item.delay}
                  key={index}
                >
                  <div className="progress-meta">
                    <div className="title">{item.title}</div>
                    <div className="percentage">{item.percentage}</div>
                  </div>
                  <div className="progress-container">
                    <Progress percentage={item.percentage} />
                  </div>
                </div>
              ))}
            </div>
            <div
              className="skill-thumb order-1 order-xl-2 wow fadeInRight"
              data-wow-delay="1.2s"
            >
              <div className="shape1_3">
                <Image
                  className="rotate360"
                  alt="shape"
                  src="/assets/img/shape/skillShape1_3.png"
                  width="138"
                  height="138"
                />
              </div>
              <div className="shape1_4 d-none d-xl-block">
                <Image
                  alt="shape"
                  src="/assets/img/shape/skillShape1_4.png"
                  width="247"
                  height="257"
                />
              </div>
              <div
                className="thumb1 wow fadeInLeft"
                data-wow-delay=".3s"
                data-bg-src=""
                style={{
                  backgroundImage: "url(/assets/img/skill/skillThumb1_1.png)",
                }}
                data-tilt=""
                data-tilt-max={10}
              >
                <div className="thumb2 wow fadeInUp" data-wow-delay=".5s">
                  <Image
                    alt="about-img"
                    src="/assets/img/skill/skillThumb1_2.png"
                    width="247"
                    height="271"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
