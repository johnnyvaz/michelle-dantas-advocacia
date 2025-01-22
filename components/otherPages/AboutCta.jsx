import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function AboutCta() {
  return (
    <div className="cta-area">
      <div
        className="cta-wrap style3 space fix"
        data-bg-src=""
        style={{ backgroundImage: "url(/assets/img/bg/ctaBg1_1.png)" }}
      >
        <div className="container">
          <div className="title-area mx-auto">
            <h5
              className="subtitle text-center wow fadeInUp"
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
              Contact Us NOW{' '}
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
              className="title text-center text-white mb-50 wow fadeInUp"
              data-wow-delay=".6s"
            >
              Talk To About An IT Solution for Your
              <span className=""> Technology </span>
            </h2>
          </div>
          <div
            className="btn-wrapper d-flex justify-content-center mx-auto wow fadeInUp"
            data-wow-delay=".9s"
          >
            <Link
              scroll={false}
              className="gt-btn gt-btn-icon"
              href={`/contact`}
            >
              GET IN TOUCH
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
