import { depoimentosData } from "@/data/testimonials";
import React from "react";
import Link from "next/link";

export default function Depoimentos() {
  return (
    <section
      id="sobre-escritorio"
      className="service-area space mt-1 fix"
      style={{ backgroundImage: `url(/assets/img/bg/serviceCardBg2_1.png)` }}
    >
      <div className="container">
        <div className="title-area mx-auto">
          <h5
            className="subtitle text-center wow fadeInUp"
            data-wow-delay=".2s"
          >
            Depoimentos{' '}
          </h5>
          <h2
            className="title text-center mb-50 wow fadeInUp text-white"
            data-wow-delay=".4s"
          >
            Dos nossos clientes
          </h2>
        </div>
        <div className="service-card-wrapper style2">
          {depoimentosData.map((depoimento, index) => (
            <div
              className="service-card style2 wow fadeInUp"
              data-wow-delay={`0.${index + 2}s`}
              key={index}
            >
              <div className="service-content">
                <h3 className="service-content_title text-white">
                  {depoimento.name}
                  <span className="text-sm block mt-2 text-gray-300">{depoimento.location}</span>
                </h3>
                <p className="service-content_text mt-4">{depoimento.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
