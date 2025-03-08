"use client";
import { testimonials } from "@/data/testimonials";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

export default function Testimonials() {
  return (
    <section className="testimonial-area">
      <div className="testimonial-wrap style2 space fix">
        <div className="shape2_1">
          <Image
            alt="shape"
            src="/assets/img/shape/testimonialShape2_1.png"
            width="270"
            height="733"
          />
        </div>
        <div className="shape2_2">
          <Image
            alt="shape"
            src="/assets/img/shape/testimonialShape2_2.png"
            width="408"
            height="879"
          />
        </div>
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
              Testimonials{' '}
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
              className="title text-center mb-50 wow fadeInUp"
              data-wow-delay=".6s"
            >
              What Happy Clients Says About Us?
            </h2>
          </div>
          <div className="testimonial-card-wrap style2">
            <div className="row d-flex align-items-center">
              <div className="col-md-4 col-xl-5">
                <div
                  className="testimonial-thumb d-none d-md-block wow fadeInUp"
                  data-wow-delay=".6s"
                >
                  <Image
                    alt="thumb"
                    src="/assets/img/testimonial/testiThumb2_1.png"
                    width="470"
                    height="485"
                  />
                  <button className="slider-arrow snbp5 style2 d-lg-block d-none">
                    <i className="fa-sharp fa-light fa-arrow-left-long" />
                  </button>
                  <button className="slider-arrow snbn5 style2 slider-next d-lg-block d-none">
                    <i className="fa-sharp fa-light fa-arrow-right-long" />
                  </button>
                </div>
              </div>
              <div className="col-12 col-md-8 col-xl-7">
                <div className="slider-area">
                  <Swiper
                    loop
                    modules={[Navigation]}
                    spaceBetween={20}
                    navigation={{
                      prevEl: ".snbp5",
                      nextEl: ".snbn5",
                    }}
                    className="swiper gt-slider testimonial-slider2"
                    id="testimonialSlider2"
                  >
                    {testimonials.map((testimonial, index) => (
                      <SwiperSlide className="swiper-slide" key={index}>
                        <div className="testimonial-card style2">
                          <div className="profile-box">
                            <div className="testi-thumb">
                              <Image
                                src={testimonial.imageSrc}
                                width={100}
                                height={100}
                                alt="thumb"
                              />
                            </div>
                            <div className="testi-content">
                              <h3 className="title">{testimonial.name}</h3>
                              <div className="designation">
                                {testimonial.designation}
                              </div>
                              <ul className="star-wrap">
                                {[...Array(testimonial.stars)].map(
                                  (_, starIndex) => (
                                    <li key={starIndex}>
                                      <Image
                                        alt="icon"
                                        src="/assets/img/icon/starIcon.png"
                                        width="20"
                                        height="20"
                                      />
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                          <p className="text">{testimonial.text}</p>
                          <div className="quote">
                            <Image
                              alt="icon"
                              src="/assets/img/icon/quoteIcon.png"
                              width="50"
                              height="37"
                            />
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
