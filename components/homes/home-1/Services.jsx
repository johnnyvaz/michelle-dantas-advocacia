import { services2 } from "@/data/services";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Services() {
  return (
    <section className="service-area mb-15" id="service-area">
      <div className="service-wrap style1">
        <div className="container">
          <div className="service-card-wrapper style1">
            {services2.map((service, index) => (
              <div
                className="service-card style1 wow fadeInUp"
                data-wow-delay={service.delay}
                key={index}
              >
                <div className="card_icon">
                  <Image src={service.icon} width={40} height={40} alt="icon" />
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
                <div className="link-btn">
                  <Link scroll={false} href={`/service-details/${service.id}`}>
                    <i className="fa-sharp fa-regular fa-arrow-right-long" />
                  </Link>
                </div>
                <div className="bg">
                  <Image
                    src={service.bgImage}
                    width={280}
                    height={284}
                    alt="bg"
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
