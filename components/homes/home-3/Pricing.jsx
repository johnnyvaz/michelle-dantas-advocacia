import { pricingCards } from "@/data/pricing";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Pricing() {
  return (
    <section className="pricing-area space fix">
      <div className="pricing-wrap style3">
        <div className="shape3_1 spin-slow d-none d-xl-block">
          <Image
            alt="shape"
            src="/assets/img/shape/pricingShape3_1.png"
            width="134"
            height="135"
          />
        </div>
        <div className="shape3_2">
          <Image
            alt="shape"
            src="/assets/img/shape/pricingShape3_2.png"
            width="323"
            height="646"
          />
        </div>
        <div className="container">
          <div className="title-area mx-auto">
            <h5 className="subtitle text-center">
              {" "}
              <span className="me-2">
                <Image
                  alt="icon"
                  src="/assets/img/icon/titleIcon.png"
                  width="28"
                  height="12"
                />
              </span>{" "}
              Our pricing{" "}
              <span className="ms-2">
                <Image
                  alt="icon"
                  src="/assets/img/icon/titleIcon.png"
                  width="28"
                  height="12"
                />
              </span>{" "}
            </h5>
            <h2 className="title text-center mb-50">
              Our popular pricing package
            </h2>
          </div>
          <div className="pricing-card-wrap  wow fadeInUp" data-wow-delay=".4s">
            {pricingCards.map((card, index) => (
              <div className="pricing-card style3" key={index}>
                <div className="pricing-card-header">
                  <div className="pricing-card-header_price">{card.price}</div>
                  <div className="pricing-card-header_text">{card.period}</div>
                </div>
                <div
                  className="pricing-card-header_badge"
                  style={{ backgroundImage: `url(${card.imageUrl})` }}
                  data-bg-src
                >
                  <span>{card.badgeText}</span>
                </div>
                <p className="text">
                  The Basic Pricing Plan is designed for individuals or small
                  teams who are{" "}
                </p>
                <div className="checklist">
                  {card.features.map((feature, featureIndex) => (
                    <ul key={featureIndex}>
                      <li>
                        <Image
                          alt="icon"
                          src="/assets/img/icon/signIcon.png"
                          width="16"
                          height="16"
                        />
                      </li>
                      <li>{feature}</li>
                    </ul>
                  ))}
                </div>
                <div className="btn-wrapper">
                  <Link
                    scroll={false}
                    className={`gt-btn ${card.buttonClass}`}
                    href={`/pricing`}
                  >
                    Get The Plan Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
