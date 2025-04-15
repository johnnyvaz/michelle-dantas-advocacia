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
    <section className="py-20 md:py-28 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-[#8B0000] font-semibold text-sm uppercase tracking-wider">Depoimentos</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-neutral-900">O que nossos clientes dizem</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <Swiper
            modules={[Navigation]}
            navigation={true}
            spaceBetween={30}
            slidesPerView={1}
            className="testimonial-slider"
          >
            {testimonialsData.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="group bg-white rounded-xl shadow-md p-8 md:p-10 relative border border-neutral-100 transition-all duration-300 hover:shadow-xl">
                  <div className="absolute -top-4 left-8 text-4xl text-[#D4A853] transition-transform group-hover:-translate-y-1">
                    <FaQuoteLeft />
                  </div>
                  <div className="mt-8 space-y-4 text-neutral-600 text-lg leading-relaxed">
                    {testimonial.text.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="transition-colors group-hover:text-neutral-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="mt-10 text-right">
                    <h5 className="text-xl font-semibold text-neutral-900 group-hover:text-[#8B0000] transition-colors">{testimonial.name}</h5>
                    <p className="text-neutral-500 group-hover:text-neutral-600 transition-colors">{testimonial.location}</p>
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
