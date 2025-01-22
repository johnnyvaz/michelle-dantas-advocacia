"use client";
import { services } from "@/data/services";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "swiper/modules";

export default function Services() {
  const swiperOptions = {
    loop: true,
    breakpoints: {
      0: { slidesPerView: 1 },
      576: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      992: { slidesPerView: 3 },
      1200: { slidesPerView: 4 },
    },
  };
  return (
    <section className="service-area" id="service-area">
      <div className="service-wrap style3 space-bottom pt-226 fix">
        <div className="shape3_1">
          <Image
            alt="shape"
            src="/assets/img/shape/aboutShape3_1.png"
            width="645"
            height="395"
          />
        </div>
        <div className="container">
          <div className="title-wrap mb-50">
            <div className="title-area">
              <h6
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
                Our Feathered Services{' '}
                <span>
                  <Image
                    alt="icon"
                    src="/assets/img/icon/titleIcon.png"
                    width="28"
                    height="12"
                  />
                </span>
              </h6>
              <h2
                className="title text-start wow fadeInUp"
                data-wow-delay=".6s"
              >
                How can we help you?
              </h2>
            </div>
            <div
              className="arrow-btn text-end wow fadeInUp"
              data-wow-delay=".9s"
            >
              <button className="slider-arrow snbp45 style2">
                <i className="fa-solid fa-arrow-left-long" />
              </button>
              <button className="slider-arrow snbn45 style2 slider-next">
                <i className="fa-solid fa-arrow-right-long" />
              </button>
            </div>
          </div>
          <div className="slider-area service-slider1">
            <Swiper
              {...swiperOptions}
              modules={[Navigation]}
              navigation={{ prevEl: ".snbp45", nextEl: ".snbn45" }}
              className="swiper gt-slider"
              id="serviceSlider1"
            >
              {services.map((service, index) => (
                <SwiperSlide className="swiper-slide" key={index}>
                  <div className="service-card style3">
                    <div className="card_icon">
                      <Image
                        src={service.imageSrc}
                        width={40}
                        height={40}
                        alt="icon"
                      />
                    </div>
                    <div className="card_content">
                      <h3>
                        <Link
                          scroll={false}
                          href={`/service-details/${service.id}`}
                          className="title"
                        >
                          {service.title}
                        </Link>
                      </h3>
                      <p className="text">{service.description}</p>
                    </div>
                    <div className="link-wrap">
                      <Link
                        scroll={false}
                        href={`/service-details/${service.id}`}
                      >
                        More Details
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
