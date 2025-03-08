"use client";

import { testimonials2 } from "@/data/testimonials";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

export default function Testimonials() {
  const swiperOptions = {
    loop: true,

    breakpoints: {
      0: { slidesPerView: 1 },
      576: { slidesPerView: 1 },
      768: { slidesPerView: 1 },
      992: { slidesPerView: 2 },
      1200: { slidesPerView: 3 },
    },
  };
  return (
    <section
      className="testimonial-area space fix wow fadeInUp"
      data-wow-delay=".5s"
    >
      <div className="testimonial-wrap style3">
        <div className="container">
          <div className="title-area mx-auto">
            <h5 className="subtitle text-center">
              {" "}
              <span className="me-2">
                <Image
                  alt="icon"
                  width="28"
                  height="12"
                  src="/assets/img/icon/titleIcon.png"
                />
              </span>
              Testimonials{" "}
              <span className="ms-2">
                <Image
                  alt="icon"
                  width="28"
                  height="12"
                  src="/assets/img/icon/titleIcon.png"
                />
              </span>{" "}
            </h5>
            <h2 className="title text-center mb-50">
              What Happy Clients Says About Us?
            </h2>
          </div>
          <div className="slider-area">
            <Swiper
              className="swiper gt-slider testimonial-slider3 "
              id="testimonialSlider3"
              {...swiperOptions}
              modules={[Pagination]}
              centeredSlides
              pagination={{ el: ".spb2" }}
              spaceBetween={0}
            >
              {testimonials2.map((testimonial, index) => (
                <SwiperSlide className="swiper-slide tss3" key={index}>
                  <div className="testimonial-card style3">
                    <ul className="star-wrap">
                      {Array.from({ length: testimonial.stars }, (_, i) => (
                        <li key={`star-${index}-${i}`}>
                          <Image
                            src={"/assets/img/icon/starIcon2.png"}
                            alt="icon"
                            width={22}
                            height={22}
                          />
                        </li>
                      ))}
                      <li>
                        <Image
                          src={"/assets/img/icon/starIconRegular.png"}
                          alt="icon"
                          width={22}
                          height={22}
                        />
                      </li>
                    </ul>
                    <p className="text">"{testimonial.text}"</p>
                    <div className="profile-box">
                      <div className="testi-thumb">
                        <Image
                          src={testimonial.image}
                          width={60}
                          height={60}
                          alt="thumb"
                        />
                      </div>
                      <div className="testi-content">
                        <h3 className="title">{testimonial.name}</h3>
                        <div className="designation">
                          {testimonial.designation}
                        </div>
                      </div>
                    </div>
                    <div className="quote">
                      <Image
                        className="darkQuote"
                        alt="icon"
                        width="45"
                        height="45"
                        src="/assets/img/icon/quoteIconDark.png"
                      />
                      <Image
                        className="whiteQuote"
                        alt="icon"
                        width="45"
                        height="39"
                        src="/assets/img/icon/quoteIconWhite.png"
                      />
                    </div>
                    <div className="shape3_1">
                      <Image
                        alt="shape"
                        width="268"
                        height="247"
                        src="/assets/img/shape/testimonialShape3_1.png"
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}

              <div className="slider-pagination spb2" />
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
