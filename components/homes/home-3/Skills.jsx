import { progressItems } from "@/data/skills";
import React from "react";
import Image from "next/image";
import Progress from "@/components/common/Progress";

export default function Skills() {
  return (
    <section className="about-area">
      <div className="about-wrap style5">
        <div className="container">
          <div className="about-wrapper style5 space fix">
            <div className="about-content  wow fadeInLeft" data-wow-delay=".6s">
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
                <h3 className="title text-start mb-30">
                  We Are Increasing Business Success With Technology
                </h3>
              </div>
              {progressItems.map((item, index) => (
                <div className="progress-wrap" key={index}>
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
              className="about-thumb-box d-md-block d-none wow fadeInRight"
              data-wow-delay=".3s"
            >
              <div className="about-thumb-box about-bg">
                <Image
                  data-tilt=""
                  data-tilt-max={10}
                  alt="thumb"
                  src="/assets/img/bg/aboutBg5_1.png"
                  width="465"
                  height="316"
                />
              </div>
              <div className="about-thumb-box shape">
                <Image
                  alt="thumb"
                  src="/assets/img/shape/lineShape.png"
                  width="405"
                  height="716"
                />
              </div>
              <div className="about-thumb-box thumb1">
                <Image
                  data-tilt=""
                  data-tilt-max={10}
                  alt="thumb"
                  src="/assets/img/about/aboutThumb5_1.png"
                  width="242"
                  height="474"
                />
              </div>
              <div className="about-thumb-box thumb2">
                <Image
                  data-tilt=""
                  data-tilt-max={10}
                  alt="thumb"
                  src="/assets/img/about/aboutThumb5_2.png"
                  width="256"
                  height="147"
                />
              </div>
              <div className="about-thumb-box thumb3">
                <Image
                  data-tilt=""
                  data-tilt-max={10}
                  alt="thumb"
                  src="/assets/img/about/aboutThumb5_3.png"
                  width="254"
                  height="145"
                />
              </div>
              <div className="about-thumb-box icon jump">
                <Image
                  alt="icon"
                  src="/assets/img/icon/bubbleIcon.png"
                  width="73"
                  height="68"
                />
              </div>
              <div className="about-thumb-box icon2 spin">
                <Image
                  alt="icon"
                  src="/assets/img/icon/starIcon3_1.png"
                  width="34"
                  height="34"
                />
              </div>
              <div className="about-thumb-box icon3 rotate360">
                <Image
                  alt="icon"
                  src="/assets/img/icon/starIcon3_2.png"
                  width="24"
                  height="24"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
