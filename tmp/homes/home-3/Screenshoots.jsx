"use client";

import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
const screenshots = [
  "/assets/img/screenshots/screenshots1_1.png",
  "/assets/img/screenshots/screenshots1_2.png",
  "/assets/img/screenshots/screenshots1_3.png",
  "/assets/img/screenshots/screenshots1_4.png",
  "/assets/img/screenshots/screenshots1_5.png",
  "/assets/img/screenshots/screenshots1_6.png",
  "/assets/img/screenshots/screenshots1_7.png",
  "/assets/img/screenshots/screenshots1_2.png",
  "/assets/img/screenshots/screenshots1_3.png",
  "/assets/img/screenshots/screenshots1_4.png",
  "/assets/img/screenshots/screenshots1_5.png",
  "/assets/img/screenshots/screenshots1_6.png",
  "/assets/img/screenshots/screenshots1_7.png",
];
export default function Screenshoots() {
  const swiperOptions = {
    breakpoints: {
      0: { slidesPerView: 1 },
      576: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      992: { slidesPerView: 4 },
      1200: { slidesPerView: 5 },
    },
  };
  return (
    <section className="app-screenshot-area wow fadeInUp" data-wow-delay=".6s">
      <div
        className="app-screenshot-wrap space fix"
        data-bg-src=""
        style={{
          backgroundImage: "url(/assets/img/bg/appScreenshotBg1_1.png)",
        }}
      >
        <div className="container">
          <div className="title-area mx-auto">
            <h6 className="text-center text-white">
              {" "}
              <span className="me-2">
                <Image
                  alt="icon"
                  src="/assets/img/icon/titleIconWhite.png"
                  width="28"
                  height="12"
                />
              </span>{" "}
              OUR APP SCREENSHOTS
              <span className="ms-2">
                <Image
                  alt="icon"
                  src="/assets/img/icon/titleIconWhite.png"
                  width="28"
                  height="12"
                />
              </span>
            </h6>
            <h2 className="title text-center text-white mb-50">
              Let’s See Our App Screenshots
            </h2>
          </div>
          <div className="slider-area">
            <Swiper
              className="swiper gt-slider screenshots-slider1"
              id="screenshotsSlider1"
              {...swiperOptions}
              modules={[Pagination]}
              pagination={{
                el: ".sp1",
              }}
            >
              {screenshots.map((src, index) => (
                <SwiperSlide className="swiper-slide" key={index}>
                  <div className="screenshot-thumb-wrap">
                    <Image
                      src={src}
                      width={209}
                      height={415}
                      alt={`screenshot-${index + 1}`}
                    />
                  </div>
                </SwiperSlide>
              ))}

              <div className="slider-pagination sp1" />
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
