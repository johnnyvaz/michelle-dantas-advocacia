import { servicesStyle2 } from "@/data/services";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Services2() {
  return (
    <section
      className="service-area space mt-1 fix"
      style={{ backgroundImage: `url(/assets/img/bg/serviceCardBg2_1.png)` }}
    >
      <div className="container">
        <div className="title-area mx-auto">
          <h5
            className="subtitle text-center wow fadeInUp"
            data-wow-delay=".2s"
          >
            <span>
              <Image
                alt="icon"
                src="/assets/img/icon/titleIcon.png"
                width="28"
                height="12"
              />
            </span>{' '}
            Our Feathered Services{' '}
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
            data-wow-delay=".4s"
          >
            We Provide Exclusive Service For Your Business
          </h2>
        </div>
        <div className="service-card-wrapper style2">
          {servicesStyle2.map((service, index) => (
            <div
              className="service-card style2 wow fadeInUp"
              data-wow-delay={service.delay}
              key={index}
            >
              <div className="service-thumb">
                <Image
                  className="img-shine"
                  src={service.thumb}
                  width={270}
                  height={160}
                  alt="thumb"
                />
              </div>
              <div className="service-content">
                <h3 className="service-content_title">
                  <Link scroll={false} href={`/service-details/${service.id}`}>
                    {service.title}
                  </Link>
                </h3>
                <p className="service-content_text">{service.description}</p>
                <Link
                  scroll={false}
                  className="link"
                  href={`/service-details/${service.id}`}
                >
                  Read More
                  <i className="fa-sharp fa-light fa-arrow-right-long" />
                </Link>
              </div>
              <div className="service-icon">
                <Image src={service.icon} width={40} height={40} alt="icon" />
              </div>
              <div className="service-icon_two">
                <Image
                  src={service.iconTwo}
                  width={50}
                  height={50}
                  alt="icon"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
