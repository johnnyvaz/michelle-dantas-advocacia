import React from "react";
import Image from "next/image";

export default function DownloadApp() {
  return (
    <section
      className="download-area"
      data-bg-src=""
      style={{ backgroundImage: "url(/assets/img/bg/downloadBg1_1.png)" }}
    >
      <div className="dowload-wrap space-top fix">
        <div className="shape1_1 d-xl-block d-none">
          <Image
            alt="shape"
            src="/assets/img/shape/downloadShape1_1.png"
            width="188"
            height="275"
          />
        </div>
        <div className="shape1_2 d-xl-block d-none">
          <Image
            alt="shape"
            src="/assets/img/shape/downloadShape1_2.png"
            width="217"
            height="213"
          />
        </div>
        <div
          className="shape1_3 d-xl-block d-none  wow fadeInRight"
          data-wow-delay=".7s"
        >
          <Image
            alt="shape"
            src="/assets/img/shape/downloadShape1_3.png"
            width="575"
            height="721"
          />
        </div>
        <div className="container">
          <div className="download-container-wrap">
            <div
              className="download-content space-bottom  wow fadeInLeft"
              data-wow-delay=".2s"
            >
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
                  Download APP{" "}
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
                  Lets Get Your Free Copy From Apple and Play Store
                </h3>
                <p className="text">
                  Lets Get Your Free Copy From Apple and Play Store" is a
                  call-to-action (CTA) section commonly used on websites and
                  landing pages to encourage users.
                </p>
              </div>
              <div className="fancy-box-wrapper d-grid d-md-flex justify-content-center justify-content-md-start">
                <a href="https://www.apple.com/">
                  <div className="fancy-box style3">
                    <div className="fancy-box_icon">
                      <Image
                        alt="icon"
                        src="/assets/img/icon/appleIcon.png"
                        width="26"
                        height="32"
                      />
                    </div>
                    <div className="fancy-box_content">
                      <h4>Get it on</h4>
                      <span>App store</span>
                    </div>
                  </div>
                </a>
                <a href="https://play.google.com/">
                  <div className="fancy-box style4">
                    <div className="fancy-box_icon">
                      <Image
                        alt="icon"
                        src="/assets/img/icon/playStoreIcon.png"
                        width="28"
                        height="31"
                      />
                    </div>
                    <div className="fancy-box_content">
                      <h4>Get it on</h4>
                      <span>Google play</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
            <div
              className="download-thumb-wrap d-none d-sm-block  wow fadeInRight"
              data-wow-delay=".5s"
            >
              <div className="shape1_4 jump">
                <Image
                  alt="shape"
                  src="/assets/img/shape/downloadShape1_4.png"
                  width="34"
                  height="31"
                />
              </div>
              <div className="shape1_5 ripple-animation">
                <Image
                  alt="shape"
                  src="/assets/img/shape/downloadShape1_5.png"
                  width="505"
                  height="335"
                />
              </div>
              <div className="thumb1 img-shine" data-tilt="" data-tilt-max={10}>
                <Image
                  alt="thumb"
                  src="/assets/img/download/downloadThumb1_1.png"
                  width="405"
                  height="462"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
