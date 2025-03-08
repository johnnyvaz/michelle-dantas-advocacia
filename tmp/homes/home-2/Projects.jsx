"use client";

import { projects1 } from "@/data/projects";
import Link from "next/link";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

export default function Projects() {
  const swiperOptions = {
    loop: true,

    breakpoints: {
      0: { slidesPerView: 1 },
      576: { slidesPerView: 1, centeredSlides: true },
      768: { slidesPerView: 3 },
      992: { slidesPerView: 3 },
      1200: { slidesPerView: 4 },
    },
    modules: [Navigation],
    navigation: {
      prevEl: ".snbp1",
      nextEl: ".snbn1",
    },
  };
  return (
    <section className="project-area fix">
      <div
        className="project-wrap pt-225 pb-230 fix"
        data-bg-src=""
        style={{ backgroundImage: "url(/assets/img/bg/portfolioBg2_1.png)" }}
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
              Recently Worked{' '}
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
              Latest projects from <br />
              our Techbe
            </h2>
          </div>
        </div>
      </div>
      <div className="project-wrap style2 fix">
        <div className="container">
          <div className="slider-area project-slider2">
            <Swiper
              // spaceBetween={30}
              className="swiper gt-slider"
              // style={{ overflow: "clip" }}
              id="projectSlider2"
              {...swiperOptions}
              
              initialSlide={2}
            >
              {projects1.map((slide) => (
                <SwiperSlide className="swiper-slide" key={slide.id}>
                  <div className="project-card style1 img-shine">
                    <div className="project-img">
                      <Image
                        src={slide.imgSrc}
                        width={465}
                        height={450}
                        alt="project image"
                      />
                    </div>
                    <div className="fancy-box style2">
                      <p>{slide.category}</p>
                      <h4>
                        <Link
                          scroll={false}
                          href={`/project-details/${slide.id}`}
                        >
                          {slide.title}
                        </Link>
                      </h4>
                      <Link
                        scroll={false}
                        href={`/project-details/${slide.id}`}
                        className="arrow-icon"
                      >
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
