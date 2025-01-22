import { pricingPlans } from "@/data/pricing";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Pricing() {
  return (
    <section
      className="pricing-area space-bottom pt-225 fix"
      style={{ backgroundImage: "url(/assets/img/bg/pricingBg1_1.png)" }}
    >
      <div className="pricing-wrap style1">
        <div className="shape1_1 d-xl-block d-none">
          <Image
            alt="shape"
            src="/assets/img/shape/pricingShape1_1.png"
            width="270"
            height="733"
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
              Our pricing{' '}
              <span className="ms-1">
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
              Our popular pricing package
            </h2>
          </div>
          <div className="pricing-card-wrap">
            {pricingPlans.map((plan, index) => (
              <div
                className="pricing-card style1 wow fadeInUp"
                data-wow-delay={plan.delay}
                key={index}
              >
                <div
                  className="pricing-card-header"
                  data-bg-src
                  style={{ backgroundImage: plan.backgroundImage }}
                >
                  <div className="pricing-card-header_badge">{plan.badge}</div>
                  <div className="pricing-card-header_price">{plan.price}</div>
                  <div className="pricing-card-header_text">{plan.period}</div>
                </div>
                <div className="checklist">
                  {plan.features.map((feature, featureIndex) => (
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
                    className={plan.buttonClass}
                    href={`/pricing`}
                  >
                    PURCHASE NOW
                  </Link>
                </div>
                <div className="shape1_2 d-xl-block d-none">
                  <Image
                    alt="shape"
                    src="/assets/img/shape/pricingShape1_2.png"
                    width="100"
                    height="110"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
