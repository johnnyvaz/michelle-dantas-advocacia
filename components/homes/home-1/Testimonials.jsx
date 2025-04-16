"use client";
import React from "react";
import { testimonialsData } from "@/data/testimonials";
import { Navigation } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import { FaQuoteLeft } from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";

const Testimonials = () => {
  return (
    <section
      className="service-area space mt-1 fix"
      style={{ backgroundColor: '#D4A853' }}
    >
      <div className="container">
        <div className="title-area mx-auto">
          <h5
            className="subtitle text-center wow fadeInUp"
            data-wow-delay=".2s"
          >
            Depoimentos
          </h5>
          <h2
            className="title text-center mb-50 wow fadeInUp text-white"
            data-wow-delay=".4s"
          >
            O que nossos clientes dizem
          </h2>
        </div>
        <div className="service-card-wrapper style2">
          <Swiper
            modules={[Navigation]}
            navigation={true}
            spaceBetween={30}
            slidesPerView={1}
            className="testimonial-slider"
          >
            {testimonialsData.map((testimonial, index) => (
              <SwiperSlide key={testimonial.id}>
                <div
                  className="service-card style2 wow fadeInUp bg-white"
                  data-wow-delay={`0.${index + 2}s`}
                >
                  <div className="service-content">
                    <div className="text-4xl text-[#D4A853] mb-4">
                      <FaQuoteLeft />
                    </div>
                    <div className="service-content_text">
                      {testimonial.text}
                    </div>
                    <h3 className="service-content_title mt-4">
                      {testimonial.name}
                    </h3>
                    <p className="text-neutral-500">{testimonial.location}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
