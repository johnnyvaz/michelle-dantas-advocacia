import { services3 } from "@/data/services";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Services() {
  return (
    <section className="service-area space fix mt-1" id="service-area">
      <div className="container">
        <div className="service-card-wrapper style4">
          {services3.map((service, index) => (
            <div
              className="service-card style4 wow fadeInUp"
              data-wow-delay={service.delay}
              key={index}
            >
              <div className="service-icon">
                <Image src={service.icon} width={70} height={70} alt="icon" />
              </div>
              <h3 className="service-title">
                <Link scroll={false} href={`/service-1`}>
                  {service.title}
                </Link>
              </h3>
              <p className="text">{service.description}</p>
              <div className="btn-wrapper">
                <Link
                  scroll={false}
                  className="link-btn"
                  href={`/service-details/${service.id}`}
                >
                  Learn More{" "}
                  <i className="fa-sharp fa-light fa-arrow-right-long" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
