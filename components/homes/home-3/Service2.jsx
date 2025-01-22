import { features } from "@/data/features";
import React from "react";
import Image from "next/image";

export default function Service2() {
  return (
    <section className="about-area space fix">
      <div className="container">
        <div className="about-wrapper style4">
          <div className="about-thumb-box  wow fadeInUp" data-wow-delay=".3s">
            <div className="about-thumb-box about-thumb1">
              <Image
                data-tilt=""
                data-tilt-max={10}
                alt="thumb"
                src="/assets/img/about/aboutThumb4_1.png"
                width="465"
                height="230"
              />
            </div>
            <div className="about-thumb-box about-thumb2">
              <Image
                data-tilt=""
                data-tilt-max={20}
                alt="thumb"
                src="/assets/img/about/aboutThumb4_2.png"
                width="242"
                height="474"
              />
            </div>
            <div className="about-thumb-box about-thumb3">
              <Image
                data-tilt=""
                data-tilt-max={10}
                alt="thumb"
                src="/assets/img/about/aboutThumb4_3.png"
                width="219"
                height="188"
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
            <div className="about-thumb-box spin about-icon6">
              <Image
                alt="thumb"
                src="/assets/img/icon/aboutIcon4_1.png"
                width="73"
                height="68"
              />
            </div>
          </div>
          <div className="about-content  wow fadeInUp" data-wow-delay=".6s">
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
                What We Do{" "}
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
                We Are Increasing Business Success With Technology
              </h3>
              <p className="text">
                In order to scale new customer acquisition and retention for
                e-commerce brands, we work across the entire customer journey.
                Our team has a successful track record of helping brands scal.
              </p>
            </div>
            <div className="checklist">
              {features.map((feature, index) => (
                <ul className="ps-0" key={index}>
                  <li>
                    <Image
                      src={feature.icon}
                      width={20}
                      height={20}
                      alt="icon"
                    />
                  </li>
                  <li>{feature.description}</li>
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
