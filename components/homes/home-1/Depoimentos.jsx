'use client';

import { depoimentosData } from "@/data/testimonials";
import React, { useState } from "react";
import Link from "next/link";

export default function Depoimentos() {
  const [expandedCards, setExpandedCards] = useState({});
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
        <div className="service-card-wrapper style2 flex justify-center gap-8">
          {depoimentosData.slice(0, 4).map((depoimento, index) => {
            const isExpanded = expandedCards[index];
            const truncatedText = depoimento.text.slice(0, 200);
            const needsReadMore = depoimento.text.length > 200;

            return (
              <div 
                className="service-card style2 wow fadeInUp max-w-md"
                data-wow-delay={`0.${index + 2}s`}
                key={index}
              >
                <div className="service-content">
                  <h3 className="service-content_title text-black text-2xl font-bold mb-2">
                    {depoimento.name}
                  </h3>
                  <p className="service-content_text mt-4">
                    {isExpanded ? depoimento.text : truncatedText}
                    {needsReadMore && (
                      <button
                        onClick={() => setExpandedCards(prev => ({ ...prev, [index]: !prev[index] }))}
                        className="text-primary-500 hover:text-primary-600 ml-2 font-semibold"
                      >
                        {isExpanded ? 'Ler menos' : 'Leia mais...'}
                      </button>
                    )}
                  </p>
                  <div className="mt-4 text-gray-300 text-sm">{depoimento.location}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}