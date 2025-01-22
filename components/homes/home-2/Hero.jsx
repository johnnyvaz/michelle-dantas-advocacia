"use client";

import { slides } from "@/data/heroSlides";
import { EffectFade, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero-2" id="hero">
      <Swiper
        modules={[EffectFade, Navigation]}
        navigation={{
          prevEl: ".snbp4",
          nextEl: ".snbp4",
        }}
        effect="fade"
        autoHeight
        className="swiper gt-slider hero-slider2"
        id="heroSlide2"
      >
        <div className="swiper-wrapper">
          {slides.map((slide, index) => (
            <SwiperSlide className="swiper-slide" key={index}>
              <div className="hero-inner">
                <div
                  className="gt-hero-bg"
                  data-bg-src
                  style={{ backgroundImage: `url(${slide.bgSrc})` }}
                />
                <div
                  className="shape2_1 d-none d-xl-block"
                  data-ani="slideindown"
                  data-ani-delay="0.9s"
                >
                  <Image
                    alt="shape"
                    src="/assets/img/shape/heroShape2_1.png"
                    width="207"
                    height="423"
                  />
                </div>
                <div
                  className="shape2_2"
                  data-ani="slideindown"
                  data-ani-delay="0.6s"
                >
                  <Image
                    alt="shape"
                    src="/assets/img/shape/heroShape2_2.png"
                    width="561"
                    height="826"
                  />
                </div>
                <div
                  className="shape2_3"
                  data-ani="slideindown"
                  data-ani-delay="0.3s"
                >
                  <Image
                    alt="shape"
                    src="/assets/img/shape/heroShape2_3.png"
                    width="605"
                    height="933"
                  />
                </div>
                <div
                  className="shape2_4"
                  data-ani="slideindown"
                  data-ani-delay="0.9s"
                >
                  <Image
                    alt="shape"
                    src="/assets/img/shape/heroShape2_4.png"
                    width="632"
                    height="681"
                  />
                </div>
                <div
                  className="shape2_5"
                  data-ani="slideindown"
                  data-ani-delay="0.6s"
                >
                  <Image
                    alt="shape"
                    src="/assets/img/shape/heroShape2_5.png"
                    width="672"
                    height="760"
                  />
                </div>
                <div
                  className="shape2_6 d-none d-xl-block"
                  data-ani="slideindown"
                  data-ani-delay="0.3s"
                >
                  <Image
                    alt="shape"
                    src="/assets/img/shape/heroShape2_6.png"
                    width="195"
                    height="332"
                  />
                </div>
                <div className="container">
                  <div className="row align-items-center">
                    <div className="col-xl-12">
                      <div className="hero-style2 text-center">
                        <h6
                          className="hero-sub-title"
                          data-ani="slideindown"
                          data-ani-delay="0.2s"
                        >
                          <span className="me-1">
                            <Image
                              alt="icon"
                              src="/assets/img/icon/titleIconWhite.png"
                              width="28"
                              height="12"
                            />
                          </span>
                          BEST IT SOLUTION PROVIDER
                          <span className="ms-1">
                            <Image
                              alt="icon"
                              src="/assets/img/icon/titleIconWhite.png"
                              width="28"
                              height="12"
                            />
                          </span>
                        </h6>
                        <h1 className="hero-title text-white">
                          <span
                            className="title1"
                            data-ani="slideindown"
                            data-ani-delay="0.3s"
                          >
                            {slide.title1}
                          </span>
                          <span
                            className="title2"
                            data-ani="slideindown"
                            data-ani-delay="0.4s"
                          >
                            {slide.title2}
                          </span>
                        </h1>
                        <Link
                          scroll={false}
                          href={`/contact`}
                          className="gt-btn gt-btn-icon"
                          data-ani="slideinup"
                          data-ani-delay="0.6s"
                        >
                          EXPLORE MORE
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </div>
      </Swiper>
      <button className="slider-arrow style2 snbp4">
        <Image
          alt="img"
          src="/assets/img/icon/arrowLeft.png"
          width="20"
          height="20"
        />
      </button>
      <button className="slider-arrow style2 slider-next snbn4 ">
        <Image
          alt="img"
          src="/assets/img/icon/arrowRight.png"
          width="20"
          height="20"
        />
      </button>
      <div className="scroll-down">
        <a href="#service-area" className="hero-scroll-wrap">
          <i className="fal fa-long-arrow-left" />
          Scroll
        </a>
      </div>
    </section>
  );
}
