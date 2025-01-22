import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Cta() {
  return (
    <section
      className="cta-area mt-n110 mb-n116 wow fadeInUp"
      data-wow-delay=".6s"
    >
      <div className="container">
        <div className="cta-wrap style2">
          <div className="shape1_2 d-none d-xl-block">
            <Image
              alt="shape"
              src="/assets/img/shape/ctaShape1_2.png"
              width="119"
              height="200"
            />
          </div>
          <div className="shape1_3 d-none d-xl-block">
            <Image
              alt="shape"
              src="/assets/img/shape/ctaShape1_3.png"
              width="85"
              height="144"
            />
          </div>
          <div className="shape1_4 d-none d-xl-block">
            <Image
              alt="shape"
              src="/assets/img/shape/ctaShape1_4.png"
              width="14"
              height="90"
            />
          </div>
          <div className="fancy-box style1 wow fadeInUp" data-wow-delay=".5s">
            <div className="fancy-box_icon">
              <Image
                alt="img"
                src="/assets/img/icon/phoneIcon.png"
                width="56"
                height="56"
              />
            </div>
            <div className="fancy-box_content">
              <h4 className="text-white wow fadeInUp" data-wow-delay=".3s">
                Call Us Now
              </h4>
              <span className="text-white wow fadeInUp" data-wow-delay=".6s">
                +208-555-0112
              </span>
            </div>
          </div>
          <h3
            className="cta-title text-white wow fadeInUp"
            data-wow-delay=".9s"
          >
            Stay Connected With Cutting Edge IT
          </h3>
          <div className="btn-wrapper wow fadeInUp" data-wow-delay="1s">
            <Link
              scroll={false}
              className="gt-btn style5 gt-btn-icon"
              href={`/contact`}
            >
              GET IN TOUCH
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
