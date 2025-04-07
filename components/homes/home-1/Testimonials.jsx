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
    <section className="testimonial-area mt-120 mb-120">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="section-title text-center mb-70">
              <span className="sub-title">Depoimentos</span>
              <h2 className="title">O que nossos clientes dizem</h2>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="testimonial-item bg-white p-5 rounded-lg shadow-lg wow fadeInUp">
              <div className="testimonial-content position-relative">
                <div className="testimonial-icon position-absolute" style={{ top: "-30px", left: "30px", fontSize: "3rem", color: "#d4a853" }}>
                  <FaQuoteLeft /><br />
                </div>
                <div className="testimonial-text mt-4" style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#555" }}>
                  <p className="mb-4">
                    Agradeço imensamente à Dra. Michelle e toda sua equipe pela sua enorme prestatividade, respondendo rapidamente a todas as minhas dúvidas e preocupações. Além disso, ela soube me explicar, de maneira simples e objetiva, todos os aspectos legais envolvidos, o que me deu muita confiança.
                  </p>
                  <p className="mb-4">
                    O comprometimento da Dra. com a minha causa foi evidente. Ela me orientou de forma ética, profissional e sempre com o objetivo de alcançar o melhor resultado possível. Graças ao seu trabalho, estou conseguindo resolver minha situação de maneira satisfatória e com total segurança jurídica.
                  </p>
                  <p className="mb-4">
                    Recomendo com toda a certeza a Dra. Michelle a qualquer pessoa que precise de uma profissional altamente qualificada e humana, que realmente se importa com o bem-estar de seus clientes.
                  </p>
                </div>
                <div className="testimonial-author text-end mt-4">
                  <h5 className="mb-1" style={{ color: "#333" }}>Cliente Satisfeito</h5>
                  <p className="text-muted">Americana - SP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
